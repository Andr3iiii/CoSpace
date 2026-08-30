import { query } from '../database/connection';
import { PaginationParams, PaginatedResult } from '../types';

export class AdminWorkspaceRepository {
  async findWorkspaces(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];

    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`(w.name ILIKE $${values.length} OR wt.name ILIKE $${values.length})`);
    }

    if (params.status) {
      values.push(params.status);
      conditions.push(`w.status = $${values.length}`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await query<{ total: number }>(
      `SELECT COUNT(w.id)::int as total 
       FROM workspaces w 
       JOIN workspace_types wt ON w.workspace_type_id = wt.id 
       WHERE ${whereClause}`,
      values
    );
    const total = countResult[0]?.total || 0;

    const dataQuery = `
      SELECT 
        w.id,
        w.workspace_type_id,
        wt.name AS workspace_type,
        w.name,
        w.slug,
        w.description,
        w.capacity,
        w.hourly_rate,
        w.daily_rate,
        w.status,
        w.floor,
        w.room_number,
        w.images,
        w.is_featured,
        w.created_at,
        w.updated_at
      FROM workspaces w
      JOIN workspace_types wt ON w.workspace_type_id = wt.id
      WHERE ${whereClause}
      ORDER BY w.created_at DESC
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
    const workspaceRows = await query(
      `SELECT 
        w.*,
        wt.name AS workspace_type
       FROM workspaces w
       JOIN workspace_types wt ON w.workspace_type_id = wt.id
       WHERE w.id = $1`,
      [id]
    );

    if (!workspaceRows[0]) return null;

    const amenities = await query(
      `SELECT a.*, wa.quantity 
       FROM workspace_amenities wa
       JOIN amenities a ON wa.amenity_id = a.id
       WHERE wa.workspace_id = $1`,
      [id]
    );

    return {
      ...workspaceRows[0],
      amenities,
    };
  }

  async createWorkspace(data: {
    workspace_type_id: string;
    name: string;
    slug: string;
    description: string;
    capacity: number;
    hourly_rate: number;
    daily_rate: number;
    status: string;
    floor: string;
    room_number?: string;
    images?: string[];
    is_featured?: boolean;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO workspaces 
        (workspace_type_id, name, slug, description, capacity, hourly_rate, daily_rate, status, floor, room_number, images, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.workspace_type_id,
        data.name,
        data.slug,
        data.description,
        data.capacity,
        data.hourly_rate,
        data.daily_rate,
        data.status || 'available',
        data.floor || '1st Floor',
        data.room_number || null,
        JSON.stringify(data.images || []),
        data.is_featured || false,
      ]
    );
    return rows[0];
  }

  async updateWorkspace(id: string, data: Partial<any>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowed = ['workspace_type_id', 'name', 'slug', 'description', 'capacity', 'hourly_rate', 'daily_rate', 'status', 'floor', 'room_number', 'images', 'is_featured'];

    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        values.push(key === 'images' ? JSON.stringify(data[key]) : data[key]);
        fields.push(`${key} = $${values.length}`);
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const sql = `UPDATE workspaces SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`;
    const rows = await query(sql, values);
    return rows[0];
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const rows = await query(
      'UPDATE workspaces SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0] || null;
  }

  async getWorkspaceTypes(): Promise<any[]> {
    return query('SELECT * FROM workspace_types WHERE is_active = TRUE ORDER BY name ASC');
  }

  async getAmenities(): Promise<any[]> {
    return query('SELECT * FROM amenities ORDER BY name ASC');
  }
}

export const adminWorkspaceRepository = new AdminWorkspaceRepository();
