import { adminRepository } from '../repositories/admin.repository';
import { comparePassword } from '../utils/password';
import { generateAdminToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { AdminUser } from '../types';

export class AdminAuthService {
  async login(email: string, password: string): Promise<{ token: string; admin: Omit<AdminUser, 'password_hash'> }> {
    const admin = await adminRepository.findByEmail(email);
    if (!admin || !admin.password_hash) {
      throw new AppError(
        'Invalid email or password credentials.',
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (!admin.is_active) {
      throw new AppError(
        'This administrative account has been deactivated.',
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    const isMatch = await comparePassword(password, admin.password_hash);
    if (!isMatch) {
      throw new AppError(
        'Invalid email or password credentials.',
        401,
        ERROR_CODES.UNAUTHORIZED
      );
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
      throw new AppError('Admin user profile not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    const { password_hash, ...safeAdmin } = admin;
    return safeAdmin;
  }
}

export const adminAuthService = new AdminAuthService();
