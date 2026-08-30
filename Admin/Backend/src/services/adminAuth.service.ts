import { adminRepository } from '../repositories/admin.repository';
import { comparePassword } from '../utils/password';
import { generateAdminToken } from '../utils/jwt';
import { AdminUser } from '../types';

export class AdminAuthService {
  async login(email: string, password: string): Promise<{ token: string; admin: Omit<AdminUser, 'password_hash'> }> {
    const admin = await adminRepository.findByEmail(email);
    if (!admin || !admin.password_hash) {
      throw new Error('Invalid email or password credentials.');
    }

    if (!admin.is_active) {
      throw new Error('This administrative account has been deactivated.');
    }

    const isMatch = await comparePassword(password, admin.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password credentials.');
    }

    const token = generateAdminToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const { password_hash, ...safeAdmin } = admin;
    return { token, admin: safeAdmin };
  }

  async getMe(id: string): Promise<Omit<AdminUser, 'password_hash'>> {
    const admin = await adminRepository.findById(id);
    if (!admin) {
      throw new Error('Admin user profile not found.');
    }
    const { password_hash, ...safeAdmin } = admin;
    return safeAdmin;
  }
}

export const adminAuthService = new AdminAuthService();
