import { clientAuthRepository } from '../repositories/clientAuth.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateClientToken } from '../utils/jwt';
import { resendClient } from '../integrations/resend';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { ClientUser } from '../types';

export class ClientAuthService {
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company_name?: string;
  }): Promise<{ token: string; client: Omit<ClientUser, 'password_hash'> }> {
    const existing = await clientAuthRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(
        'An account with this email address already exists.',
        409,
        ERROR_CODES.CONFLICT
      );
    }

    const password_hash = await hashPassword(data.password);
    const newClient = await clientAuthRepository.register({
      ...data,
      password_hash,
    });

    const token = generateClientToken({
      id: newClient.id,
      email: newClient.email,
      status: newClient.status,
    });

    // Send welcome email asynchronously
    resendClient.sendWelcomeEmail(newClient.email, `${newClient.first_name} ${newClient.last_name}`).catch(() => {});

    const { password_hash: _, ...safeClient } = newClient;
    return { token, client: safeClient };
  }

  async login(email: string, password: string): Promise<{ token: string; client: Omit<ClientUser, 'password_hash'> }> {
    const client = await clientAuthRepository.findByEmail(email);
    if (!client || !client.password_hash) {
      throw new AppError(
        'Invalid email or password credentials.',
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (client.status === 'suspended') {
      throw new AppError(
        'Your account is currently suspended. Please contact community management.',
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    const isMatch = await comparePassword(password, client.password_hash);
    if (!isMatch) {
      throw new AppError(
        'Invalid email or password credentials.',
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const token = generateClientToken({
      id: client.id,
      email: client.email,
      status: client.status,
    });

    const { password_hash: _, ...safeClient } = client;
    return { token, client: safeClient };
  }

  async getMe(clientId: string): Promise<Omit<ClientUser, 'password_hash'>> {
    const client = await clientAuthRepository.findById(clientId);
    if (!client) {
      throw new AppError('Client profile not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    const { password_hash: _, ...safeClient } = client;
    return safeClient;
  }
}

export const clientAuthService = new ClientAuthService();
