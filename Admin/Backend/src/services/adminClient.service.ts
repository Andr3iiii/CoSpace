import { adminClientRepository } from '../repositories/client.repository';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { PaginationParams } from '../types';

export class AdminClientService {
  async getClients(params: PaginationParams) {
    return adminClientRepository.findClients(params);
  }

  async getClientById(id: string) {
    const client = await adminClientRepository.findById(id);
    if (!client) {
      throw new AppError('Client record not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    return client;
  }

  async updateClientStatus(id: string, status: 'active' | 'suspended' | 'inactive') {
    const updated = await adminClientRepository.updateStatus(id, status);
    if (!updated) {
      throw new AppError('Client record not found or update failed.', 404, ERROR_CODES.NOT_FOUND);
    }
    return updated;
  }
}

export const adminClientService = new AdminClientService();
