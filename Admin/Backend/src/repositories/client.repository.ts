import { query } from '../database/connection';
import { PaginationParams, PaginatedResult } from '../types';

export class AdminClientRepository {
  async findClients(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`(c.email ILIKE $${values.length} OR c.first_name ILIKE $${values.length} OR c.last_name ILIKE $${values.length} OR c.company_name ILIKE $${values.length})`);
    }

    if (params.status) {
      values.push(params.status);
      conditions.push(`c.status = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(c.id)::int as total FROM clients c WHERE ${whereClause}`,
      values
    );
    const total = countResult[0]?.total || 0;

    const dataQuery = `
      SELECT 
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.company_name,
        c.status,
        c.avatar_url,
        c.created_at,
        c.updated_at,
        COUNT(b.id)::int AS total_bookings,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0)::numeric AS total_spent
      FROM clients c
      LEFT JOIN bookings b ON c.id = b.client_id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
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
    const clientRows = await query(
      `SELECT 
        c.id, c.email, c.first_name, c.last_name, c.phone, c.company_name, c.status, c.avatar_url, c.created_at, c.updated_at,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0)::numeric AS total_spent,
        COUNT(DISTINCT b.id)::int AS total_bookings
       FROM clients c
       LEFT JOIN bookings b ON c.id = b.client_id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );

    if (!clientRows[0]) return null;

    const addresses = await query('SELECT * FROM client_addresses WHERE client_id = $1', [id]);
    const emergencyContacts = await query('SELECT * FROM client_emergency_contacts WHERE client_id = $1', [id]);
    const preferences = await query('SELECT * FROM client_preferences WHERE client_id = $1', [id]);
    const recentBookings = await query(
      `SELECT b.*, w.name as workspace_name 
       FROM bookings b 
       JOIN workspaces w ON b.workspace_id = w.id 
       WHERE b.client_id = $1 
       ORDER BY b.created_at DESC LIMIT 5`,
      [id]
    );

    return {
      ...clientRows[0],
      addresses,
      emergencyContacts,
      preferences: preferences[0] || null,
      recentBookings,
    };
  }

  async updateStatus(id: string, status: 'active' | 'suspended' | 'inactive'): Promise<any> {
    const rows = await query(
      'UPDATE clients SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, status, updated_at',
      [status, id]
    );
    return rows[0] || null;
  }
}

export const adminClientRepository = new AdminClientRepository();
