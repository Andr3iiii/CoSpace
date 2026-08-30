import { query } from '../database/connection';

export class ClientFavoriteRepository {
  async getFavorites(clientId: string): Promise<any[]> {
    const sql = `
      SELECT 
        w.id,
        w.name,
        w.slug,
        w.description,
        w.capacity,
        w.hourly_rate,
        w.daily_rate,
        w.images,
        wt.name AS workspace_type,
        f.created_at AS saved_at
      FROM client_favorites f
      JOIN workspaces w ON f.workspace_id = w.id
      JOIN workspace_types wt ON w.workspace_type_id = wt.id
      WHERE f.client_id = $1
      ORDER BY f.created_at DESC
    `;
    return query(sql, [clientId]);
  }

  async toggleFavorite(clientId: string, workspaceId: string): Promise<{ isFavorited: boolean }> {
    const exists = await query(
      'SELECT id FROM client_favorites WHERE client_id = $1 AND workspace_id = $2',
      [clientId, workspaceId]
    );

    if (exists.length > 0) {
      await query('DELETE FROM client_favorites WHERE client_id = $1 AND workspace_id = $2', [clientId, workspaceId]);
      return { isFavorited: false };
    } else {
      await query('INSERT INTO client_favorites (client_id, workspace_id) VALUES ($1, $2)', [clientId, workspaceId]);
      return { isFavorited: true };
    }
  }
}

export const clientFavoriteRepository = new ClientFavoriteRepository();
