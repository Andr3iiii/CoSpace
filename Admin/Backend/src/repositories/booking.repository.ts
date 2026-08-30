import { query } from '../database/connection';
import { BookingDetails, PaginationParams, PaginatedResult } from '../types';

export class AdminBookingRepository {
  async findBookings(params: PaginationParams): Promise<PaginatedResult<BookingDetails>> {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`(b.booking_reference ILIKE $${values.length} OR c.email ILIKE $${values.length} OR c.first_name ILIKE $${values.length} OR w.name ILIKE $${values.length})`);
    }

    if (params.status) {
      values.push(params.status);
      conditions.push(`b.status = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(b.id)::int as total
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN workspaces w ON b.workspace_id = w.id
      WHERE ${whereClause}
    `;
    const countResult = await query<{ total: number }>(countQuery, values);
    const total = countResult[0]?.total || 0;

    const dataQuery = `
      SELECT 
        b.id,
        b.booking_reference,
        b.client_id,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name,
        c.email AS client_email,
        b.workspace_id,
        w.name AS workspace_name,
        wt.name AS workspace_type,
        b.start_time,
        b.end_time,
        b.total_amount,
        b.discount_amount,
        b.final_amount,
        b.status,
        b.check_in_code,
        b.special_requests,
        b.cancelled_reason,
        b.cancelled_at,
        b.created_at,
        b.updated_at
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      JOIN workspaces w ON b.workspace_id = w.id
      JOIN workspace_types wt ON w.workspace_type_id = wt.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);
    const items = await query<BookingDetails>(dataQuery, values);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<any | null> {
    const bookingRows = await query(
      `SELECT 
        b.*,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name,
        c.email AS client_email,
        c.phone AS client_phone,
        w.name AS workspace_name,
        wt.name AS workspace_type
       FROM bookings b
       JOIN clients c ON b.client_id = c.id
       JOIN workspaces w ON b.workspace_id = w.id
       JOIN workspace_types wt ON w.workspace_type_id = wt.id
       WHERE b.id = $1`,
      [id]
    );

    if (!bookingRows[0]) return null;

    const items = await query(
      'SELECT * FROM booking_items WHERE booking_id = $1',
      [id]
    );

    const addOns = await query(
      `SELECT ba.*, a.name, a.unit 
       FROM booking_add_ons ba
       JOIN add_ons a ON ba.add_on_id = a.id
       WHERE ba.booking_id = $1`,
      [id]
    );

    const history = await query(
      'SELECT * FROM booking_status_history WHERE booking_id = $1 ORDER BY created_at ASC',
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
      history,
      payment: payment[0] || null,
    };
  }

  async updateStatus(
    id: string,
    toStatus: string,
    adminId: string,
    reason?: string
  ): Promise<any> {
    const current = await query<{ status: string }>('SELECT status FROM bookings WHERE id = $1', [id]);
    if (!current[0]) return null;

    const fromStatus = current[0].status;

    await query(
      `UPDATE bookings 
       SET status = $1, 
           cancelled_reason = CASE WHEN $1 = 'cancelled' THEN $2 ELSE cancelled_reason END,
           cancelled_at = CASE WHEN $1 = 'cancelled' THEN CURRENT_TIMESTAMP ELSE cancelled_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [toStatus, reason || null, id]
    );

    await query(
      `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_type, changed_by_id, reason)
       VALUES ($1, $2, $3, 'admin', $4, $5)`,
      [id, fromStatus, toStatus, adminId, reason || `Status updated to ${toStatus} by administrator.`]
    );

    return this.findById(id);
  }

  async rescheduleBooking(id: string, startTime: Date, endTime: Date, adminId: string): Promise<any> {
    await query(
      `UPDATE bookings 
       SET start_time = $1, end_time = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [startTime, endTime, id]
    );

    await query(
      `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_type, changed_by_id, reason)
       VALUES ($1, 'confirmed', 'confirmed', 'admin', $2, 'Rescheduled by administrator.')`,
      [id, adminId]
    );

    return this.findById(id);
  }
}

export const adminBookingRepository = new AdminBookingRepository();
