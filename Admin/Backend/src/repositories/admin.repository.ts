import { query } from '../database/connection';
import { AdminUser } from '../types';

export class AdminRepository {
  async findByEmail(email: string): Promise<AdminUser | null> {
    const rows = await query<AdminUser>(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at FROM admins WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  async findById(id: string): Promise<AdminUser | null> {
    const rows = await query<AdminUser>(
      'SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM admins WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async createAdmin(admin: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Promise<AdminUser> {
    const rows = await query<AdminUser>(
      `INSERT INTO admins (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
      [admin.email.toLowerCase().trim(), admin.password_hash, admin.first_name, admin.last_name, admin.role]
    );
    return rows[0];
  }
}

export const adminRepository = new AdminRepository();
