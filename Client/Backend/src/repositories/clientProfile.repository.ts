import { query } from '../database/connection';

export class ClientProfileRepository {
  async getFullProfile(clientId: string): Promise<any> {
    const clientRows = await query(
      'SELECT id, email, first_name, last_name, phone, company_name, status, avatar_url, created_at FROM clients WHERE id = $1',
      [clientId]
    );

    if (!clientRows[0]) return null;

    const addresses = await query('SELECT * FROM client_addresses WHERE client_id = $1 ORDER BY is_default DESC', [clientId]);
    const emergencyContacts = await query('SELECT * FROM client_emergency_contacts WHERE client_id = $1', [clientId]);
    const preferences = await query('SELECT * FROM client_preferences WHERE client_id = $1', [clientId]);

    return {
      ...clientRows[0],
      addresses,
      emergencyContacts,
      preferences: preferences[0] || {},
    };
  }

  async updateProfile(clientId: string, data: Partial<any>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowed = ['first_name', 'last_name', 'phone', 'company_name', 'avatar_url'];
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        values.push(data[key]);
        fields.push(`${key} = $${values.length}`);
      }
    });

    if (fields.length > 0) {
      values.push(clientId);
      const sql = `UPDATE clients SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING id, email, first_name, last_name, phone, company_name, avatar_url`;
      const res = await query(sql, values);
      return res[0];
    }

    return this.getFullProfile(clientId);
  }

  async updatePreferences(clientId: string, prefs: any): Promise<any> {
    const rows = await query(
      `INSERT INTO client_preferences (client_id, preferred_workspace_type, newsletter_opt_in, sms_notifications, email_notifications, dark_mode)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (client_id) DO UPDATE SET
         preferred_workspace_type = EXCLUDED.preferred_workspace_type,
         newsletter_opt_in = EXCLUDED.newsletter_opt_in,
         sms_notifications = EXCLUDED.sms_notifications,
         email_notifications = EXCLUDED.email_notifications,
         dark_mode = EXCLUDED.dark_mode,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        clientId,
        prefs.preferred_workspace_type || null,
        prefs.newsletter_opt_in !== undefined ? prefs.newsletter_opt_in : true,
        prefs.sms_notifications !== undefined ? prefs.sms_notifications : true,
        prefs.email_notifications !== undefined ? prefs.email_notifications : true,
        prefs.dark_mode !== undefined ? prefs.dark_mode : false,
      ]
    );
    return rows[0];
  }
}

export const clientProfileRepository = new ClientProfileRepository();
