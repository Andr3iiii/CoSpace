import { adminWorkspaceRepository } from '../repositories/workspace.repository';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { PaginationParams } from '../types';

export class AdminWorkspaceService {
  async getWorkspaces(params: PaginationParams) {
    return adminWorkspaceRepository.findWorkspaces(params);
  }

  async getWorkspaceById(id: string) {
    const workspace = await adminWorkspaceRepository.findById(id);
    if (!workspace) {
      throw new AppError('Workspace not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    return workspace;
  }

  async createWorkspace(data: any) {
    return adminWorkspaceRepository.createWorkspace(data);
  }

  async updateWorkspace(id: string, data: any) {
    return adminWorkspaceRepository.updateWorkspace(id, data);
  }

  async updateWorkspaceStatus(id: string, status: string) {
    return adminWorkspaceRepository.updateStatus(id, status);
  }

  async getWorkspaceTypes() {
    return adminWorkspaceRepository.getWorkspaceTypes();
  }

  async getAmenities() {
    return adminWorkspaceRepository.getAmenities();
  }
}

export const adminWorkspaceService = new AdminWorkspaceService();
