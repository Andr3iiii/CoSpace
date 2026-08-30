import { query } from '../database/connection';

export class ClientNotificationRepository {
  async getNotifications(clientId: string): Promise<any[]> {
    return query(
      `SELECT * FROM notifications 
       WHERE recipient_type = 'client' AND recipient_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [clientId]
    );
  }

  async markAsRead(id: string, clientId: string): Promise<boolean> {
    const res = await query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND recipient_type = 'client' AND recipient_id = $2`,
      [id, clientId]
    );
    return true;
  }
}

export const clientNotificationRepository = new ClientNotificationRepository();
