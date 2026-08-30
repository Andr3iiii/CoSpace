import { clientWorkspaceRepository } from '../repositories/clientWorkspace.repository';
import { WorkspaceFilterParams } from '../types';

export class ClientWorkspaceService {
  async getWorkspaces(params: WorkspaceFilterParams) {
    return clientWorkspaceRepository.findAvailableWorkspaces(params);
  }

  async getWorkspaceDetails(idOrSlug: string) {
    const workspace = await clientWorkspaceRepository.findById(idOrSlug);
    if (!workspace) {
      throw new Error('Workspace could not be found or is not available.');
    }
    return workspace;
  }

  async checkAvailability(workspaceId: string, startTime: string | Date, endTime: string | Date) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const isAvailable = await clientWorkspaceRepository.checkSlotAvailability(workspaceId, start, end);
    return {
      workspaceId,
      startTime: start,
      endTime: end,
      isAvailable,
    };
  }
}

export const clientWorkspaceService = new ClientWorkspaceService();
