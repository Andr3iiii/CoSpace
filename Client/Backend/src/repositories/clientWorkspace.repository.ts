import { query } from '../database/connection';
import { WorkspaceFilterParams } from '../types';

export class ClientWorkspaceRepository {
  async findAvailableWorkspaces(params: WorkspaceFilterParams): Promise<any[]> {
    const conditions: string[] = ["w.status = 'available'"];
    const values: any[] = [];

    if (params.type) {
      values.push(params.type);
      conditions.push(`(wt.slug = $${values.length} OR wt.id::text = $${values.length})`);
    }

    if (params.capacity) {
      values.push(params.capacity);
      conditions.push(`w.capacity >= $${values.length}`);
    }

    if (params.minPrice) {
      values.push(params.minPrice);
      conditions.push(`w.hourly_rate >= $${values.length}`);
    }

    if (params.maxPrice) {
      values.push(params.maxPrice);
      conditions.push(`w.hourly_rate <= $${values.length}`);
    }

    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`(w.name ILIKE $${values.length} OR w.description ILIKE $${values.length})`);
    }

    const whereClause = conditions.join(' AND ');

    const sql = `
      SELECT 
        w.id,
        w.workspace_type_id,
        wt.name AS workspace_type,
        wt.slug AS type_slug,
        w.name,
        w.slug,
        w.description,
        w.capacity,
        w.hourly_rate,
        w.daily_rate,
        w.floor,
        w.room_number,
        w.images,
        w.is_featured,
        COALESCE(AVG(r.rating), 5.0)::numeric(2,1) AS average_rating,
        COUNT(r.id)::int AS review_count
      FROM workspaces w
      JOIN workspace_types wt ON w.workspace_type_id = wt.id
      LEFT JOIN reviews r ON w.id = r.workspace_id AND r.is_published = TRUE
      WHERE ${whereClause}
      GROUP BY w.id, wt.name, wt.slug
      ORDER BY w.is_featured DESC, w.created_at DESC
    `;

    return query(sql, values);
  }

  async findById(idOrSlug: string): Promise<any | null> {
    const rows = await query(
      `SELECT 
        w.*,
        wt.name AS workspace_type,
        wt.slug AS type_slug,
        COALESCE(AVG(r.rating), 5.0)::numeric(2,1) AS average_rating,
        COUNT(r.id)::int AS review_count
       FROM workspaces w
       JOIN workspace_types wt ON w.workspace_type_id = wt.id
       LEFT JOIN reviews r ON w.id = r.workspace_id AND r.is_published = TRUE
       WHERE w.id::text = $1 OR w.slug = $1
       GROUP BY w.id, wt.name, wt.slug`,
      [idOrSlug]
    );

    if (!rows[0]) return null;

    const workspaceId = rows[0].id;

    const amenities = await query(
      `SELECT a.id, a.name, a.icon, a.category, wa.quantity, wa.notes
       FROM workspace_amenities wa
       JOIN amenities a ON wa.amenity_id = a.id
       WHERE wa.workspace_id = $1`,
      [workspaceId]
    );

    const availableAddOns = await query(
      'SELECT id, name, description, price, unit FROM add_ons WHERE is_active = TRUE ORDER BY price ASC'
    );

    const reviews = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at, CONCAT(c.first_name, ' ', SUBSTRING(c.last_name, 1, 1), '.') AS client_name, c.avatar_url
       FROM reviews r
       JOIN clients c ON r.client_id = c.id
       WHERE r.workspace_id = $1 AND r.is_published = TRUE
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [workspaceId]
    );

    return {
      ...rows[0],
      amenities,
      availableAddOns,
      reviews,
    };
  }

  async checkSlotAvailability(workspaceId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const overlapping = await query(
      `SELECT id FROM bookings 
       WHERE workspace_id = $1 
         AND status IN ('pending', 'confirmed', 'active')
         AND (
           (start_time < $3 AND end_time > $2)
         )
       LIMIT 1`,
      [workspaceId, startTime, endTime]
    );
    return overlapping.length === 0;
  }
}

export const clientWorkspaceRepository = new ClientWorkspaceRepository();
