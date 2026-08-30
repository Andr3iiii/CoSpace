import { query } from '../database/connection';
import { PaginationParams, PaginatedResult } from '../types';

export class AdminPaymentRepository {
  async findPayments(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`(p.transaction_reference ILIKE $${values.length} OR c.email ILIKE $${values.length} OR b.booking_reference ILIKE $${values.length})`);
    }

    if (params.status) {
      values.push(params.status);
      conditions.push(`p.status = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(p.id)::int as total 
       FROM payments p 
       JOIN clients c ON p.client_id = c.id 
       JOIN bookings b ON p.booking_id = b.id 
       WHERE ${whereClause}`,
      values
    );
    const total = countResult[0]?.total || 0;

    const dataQuery = `
      SELECT 
        p.id,
        p.booking_id,
        b.booking_reference,
        p.client_id,
        CONCAT(c.first_name, ' ', c.last_name) AS client_name,
        c.email AS client_email,
        p.amount,
        p.currency,
        p.status,
        p.provider,
        p.payment_method_type,
        p.transaction_reference,
        p.provider_payment_id,
        p.paid_at,
        p.created_at
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      JOIN bookings b ON p.booking_id = b.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    values.push(limit, offset);
    const items = await query(dataQuery, values);

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
    const rows = await query(
      `SELECT 
        p.*,
        b.booking_reference,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        c.email as client_email
       FROM payments p
       JOIN clients c ON p.client_id = c.id
       JOIN bookings b ON p.booking_id = b.id
       WHERE p.id = $1`,
      [id]
    );

    if (!rows[0]) return null;

    const transactions = await query(
      'SELECT * FROM payment_transactions WHERE payment_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const refunds = await query(
      'SELECT * FROM refunds WHERE payment_id = $1 ORDER BY created_at DESC',
      [id]
    );

    return {
      ...rows[0],
      transactions,
      refunds,
    };
  }

  async createRefund(data: {
    payment_id: string;
    amount: number;
    reason: string;
    admin_id: string;
    provider_refund_id?: string;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO refunds (payment_id, amount, reason, status, processed_by_admin_id, provider_refund_id)
       VALUES ($1, $2, $3, 'completed', $4, $5)
       RETURNING *`,
      [data.payment_id, data.amount, data.reason, data.admin_id, data.provider_refund_id || null]
    );

    await query(
      "UPDATE payments SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [data.payment_id]
    );

    return rows[0];
  }
}

export const adminPaymentRepository = new AdminPaymentRepository();
