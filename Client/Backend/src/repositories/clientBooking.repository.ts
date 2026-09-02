import { query } from '../database/connection';
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
      LEFT JOIN LATERAL (
        SELECT status, payment_method_type
        FROM payments
        WHERE booking_id = b.id
        ORDER BY created_at DESC
        LIMIT 1
      ) p ON TRUE
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
   * Concurrency-safe atomic booking creation invoking the PostgreSQL stored function `fn_create_booking_atomic`.
   * Automatically serializes concurrent reservations, validates active holds, and inserts itemized records atomically.
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
    const bookingReference = generateBookingReference();
    const checkInCode = generateCheckInCode();
    const normalizedAddOns = (pricing.addOnsList || []).map((addon) => ({
      id: addon.id,
      add_on_id: addon.id,
      addOnId: addon.id,
      name: addon.name,
      unitPrice: addon.unitPrice,
      unit_price: addon.unitPrice,
      quantity: addon.quantity,
      subtotal: addon.subtotal,
    }));
    const addOnsJson = JSON.stringify(normalizedAddOns);

    try {
      const rows = await query(
        `SELECT * FROM fn_create_booking_atomic(
          $1::uuid,
          $2::uuid,
          $3::timestamptz,
          $4::timestamptz,
          $5::varchar,
          $6::varchar,
          $7::text,
          $8::numeric,
          $9::numeric,
          $10::numeric,
          $11::numeric,
          $12::numeric,
          $13::jsonb
        )`,
        [
          clientId,
          input.workspaceId,
          input.startTime,
          input.endTime,
          bookingReference,
          checkInCode,
          input.specialRequests || null,
          pricing.hours,
          pricing.hourlyRate,
          pricing.workspaceSubtotal,
          pricing.totalAmount,
          pricing.finalAmount,
          addOnsJson,
        ]
      );

      if (!rows || rows.length === 0) {
        throw new AppError('Failed to initialize booking record.', 500, ERROR_CODES.INTERNAL_ERROR);
      }

      return rows[0];
    } catch (err: any) {
      if (err.code === '23P01') {
        throw new AppError(
          'The selected time slot was just booked by another member.',
          409,
          ERROR_CODES.BOOKING_CONFLICT
        );
      }
      if (err.code === '22023') {
        throw new AppError(err.message || 'Invalid booking parameters.', 400, ERROR_CODES.VALIDATION_ERROR);
      }
      throw err;
    }
  }

  async cancelBooking(id: string, clientId: string, reason?: string): Promise<any> {
    try {
      const rows = await query(
        `SELECT * FROM fn_cancel_booking_atomic($1::uuid, $2::uuid, $3::text)`,
        [id, clientId, reason || 'Cancelled by member.']
      );

      if (!rows || rows.length === 0) {
        return null;
      }

      return this.findByIdAndClient(id, clientId);
    } catch (err: any) {
      if (err.code === '22023') {
        throw new AppError(err.message || 'Cannot cancel this booking.', 400, ERROR_CODES.VALIDATION_ERROR);
      }
      throw err;
    }
  }
}

export const clientBookingRepository = new ClientBookingRepository();
