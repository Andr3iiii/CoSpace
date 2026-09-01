import { PoolClient } from 'pg';
import { query } from '../database/connection';
import { withTransaction } from '../database/transactions';
import { generateBookingReference, generateCheckInCode } from '../utils/reference';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { CreateBookingInput } from '../types';

export class ClientBookingRepository {
  async findMyBookings(clientId: string): Promise<any[]> {
    const sql = `
      SELECT 
        b.id,
        b.booking_reference,
        b.workspace_id,
        w.name AS workspace_name,
        wt.name AS workspace_type,
        w.images,
        w.floor,
        w.room_number,
        b.start_time,
        b.end_time,
        b.total_amount,
        b.discount_amount,
        b.final_amount,
        b.status,
        b.check_in_code,
        b.created_at,
        p.status AS payment_status,
        p.payment_method_type
      FROM bookings b
      JOIN workspaces w ON b.workspace_id = w.id
      JOIN workspace_types wt ON w.workspace_type_id = wt.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.client_id = $1
      ORDER BY b.start_time DESC
    `;
    return query(sql, [clientId]);
  }

  async findByIdAndClient(id: string, clientId: string): Promise<any | null> {
    const bookingRows = await query(
      `SELECT 
        b.*,
        w.name AS workspace_name,
        w.slug AS workspace_slug,
        wt.name AS workspace_type,
        w.floor,
        w.room_number,
        w.images
       FROM bookings b
       JOIN workspaces w ON b.workspace_id = w.id
       JOIN workspace_types wt ON w.workspace_type_id = wt.id
       WHERE b.id = $1 AND b.client_id = $2`,
      [id, clientId]
    );

    if (!bookingRows[0]) return null;

    const items = await query('SELECT * FROM booking_items WHERE booking_id = $1', [id]);
    const addOns = await query(
      `SELECT ba.*, a.name, a.unit 
       FROM booking_add_ons ba
       JOIN add_ons a ON ba.add_on_id = a.id
       WHERE ba.booking_id = $1`,
      [id]
    );
    const payment = await query(
      'SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1',
      [id]
    );

    return {
      ...bookingRows[0],
      items,
      addOns,
      payment: payment[0] || null,
    };
  }

  /**
   * Concurrency-safe atomic booking creation within a PostgreSQL transaction.
   * Locks the workspace row for update and verifies no overlapping active/confirmed bookings exist.
   */
  async createBookingAtomic(
    clientId: string,
    input: CreateBookingInput,
    pricing: {
      hours: number;
      hourlyRate: number;
      workspaceSubtotal: number;
      addOnsList: Array<{ id: string; name: string; unitPrice: number; quantity: number; subtotal: number }>;
      totalAmount: number;
      finalAmount: number;
    }
  ): Promise<any> {
    return withTransaction(async (client: PoolClient) => {
      // 1. Lock workspace record for concurrency safety
      const wsCheck = await client.query(
        'SELECT id, status, name FROM workspaces WHERE id = $1 FOR UPDATE',
        [input.workspaceId]
      );

      if (wsCheck.rows.length === 0 || wsCheck.rows[0].status !== 'available') {
        throw new AppError('This workspace is currently unavailable for booking.', 404, ERROR_CODES.NOT_FOUND);
      }

      // 2. Strict overlap collision check inside transaction including all active/pending holds
      const overlapCheck = await client.query(
        `SELECT id FROM bookings
         WHERE workspace_id = $1
           AND status IN ('pending', 'confirmed', 'active')
           AND (start_time < $3 AND end_time > $2)
         FOR UPDATE`,
        [input.workspaceId, input.startTime, input.endTime]
      );

      if (overlapCheck.rows.length > 0) {
        throw new AppError(
          'The selected time slot was just booked by another member.',
          409,
          ERROR_CODES.BOOKING_CONFLICT
        );
      }

      const bookingReference = generateBookingReference();
      const checkInCode = generateCheckInCode();

      // 3. Insert primary booking contract
      const bookingInsert = await client.query(
        `INSERT INTO bookings 
          (booking_reference, client_id, workspace_id, start_time, end_time, total_amount, discount_amount, final_amount, status, check_in_code, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
         RETURNING *`,
        [
          bookingReference,
          clientId,
          input.workspaceId,
          input.startTime,
          input.endTime,
          pricing.totalAmount,
          0.0,
          pricing.finalAmount,
          checkInCode,
          input.specialRequests || null,
        ]
      );

      const newBooking = bookingInsert.rows[0];

      // 4. Insert booking item for workspace slot
      await client.query(
        `INSERT INTO booking_items (booking_id, description, unit_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          newBooking.id,
          `${wsCheck.rows[0].name} (${pricing.hours} hours)`,
          pricing.hourlyRate,
          pricing.hours,
          pricing.workspaceSubtotal,
        ]
      );

      // 5. Insert itemized add-ons
      for (const addon of pricing.addOnsList) {
        await client.query(
          `INSERT INTO booking_add_ons (booking_id, add_on_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [newBooking.id, addon.id, addon.quantity, addon.unitPrice, addon.subtotal]
        );
      }

      // 6. Record audit status history
      await client.query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_type, changed_by_id, reason)
         VALUES ($1, NULL, 'pending', 'client', $2, 'Booking initialized by client.')`,
        [newBooking.id, clientId]
      );

      return newBooking;
    });
  }

  async cancelBooking(id: string, clientId: string, reason?: string): Promise<any> {
    const check = await query('SELECT status FROM bookings WHERE id = $1 AND client_id = $2', [id, clientId]);
    if (!check[0]) return null;

    if (check[0].status === 'cancelled' || check[0].status === 'completed') {
      throw new Error(`Cannot cancel a booking that is already ${check[0].status}.`);
    }

    await query(
      `UPDATE bookings 
       SET status = 'cancelled', 
           cancelled_reason = $1, 
           cancelled_at = CURRENT_TIMESTAMP, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND client_id = $3`,
      [reason || 'Cancelled by member.', id, clientId]
    );

    await query(
      `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_type, changed_by_id, reason)
       VALUES ($1, $2, 'cancelled', 'client', $3, $4)`,
      [id, check[0].status, clientId, reason || 'Cancelled by member.']
    );

    return this.findByIdAndClient(id, clientId);
  }
}

export const clientBookingRepository = new ClientBookingRepository();
