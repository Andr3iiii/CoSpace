import { adminClientRepository } from '../repositories/client.repository';
import { PaginationParams } from '../types';

export class AdminClientService {
  async getClients(params: PaginationParams) {
    return adminClientRepository.findClients(params);
  }

  async getClientById(id: string) {
    const client = await adminClientRepository.findById(id);
    if (!client) {
      throw new Error('Client record not found.');
    }
    return client;
  }

  async updateClientStatus(id: string, status: 'active' | 'suspended' | 'inactive') {
    const updated = await adminClientRepository.updateStatus(id, status);
    if (!updated) {
      throw new Error('Failed to update client status.');
    }
    return updated;
  }
}

export const adminClientService = new AdminClientService();
