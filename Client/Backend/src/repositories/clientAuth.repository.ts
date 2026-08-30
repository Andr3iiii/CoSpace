import { query } from '../database/connection';
import { ClientUser } from '../types';

export class ClientAuthRepository {
  async findByEmail(email: string): Promise<ClientUser | null> {
    const rows = await query<ClientUser>(
      'SELECT id, email, password_hash, first_name, last_name, phone, company_name, status, avatar_url, created_at, updated_at FROM clients WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  async findById(id: string): Promise<ClientUser | null> {
    const rows = await query<ClientUser>(
      'SELECT id, email, first_name, last_name, phone, company_name, status, avatar_url, created_at, updated_at FROM clients WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async register(client: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company_name?: string;
  }): Promise<ClientUser> {
    const rows = await query<ClientUser>(
      `INSERT INTO clients (email, password_hash, first_name, last_name, phone, company_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id, email, first_name, last_name, phone, company_name, status, avatar_url, created_at, updated_at`,
      [
        client.email.toLowerCase().trim(),
        client.password_hash,
        client.first_name,
        client.last_name,
        client.phone || null,
        client.company_name || null,
      ]
    );

    // Also initialize default preferences
    await query(
      'INSERT INTO client_preferences (client_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [rows[0].id]
    );

    return rows[0];
  }
}

export const clientAuthRepository = new ClientAuthRepository();
