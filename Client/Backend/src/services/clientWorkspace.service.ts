import { clientWorkspaceRepository } from '../repositories/clientWorkspace.repository';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { WorkspaceFilterParams } from '../types';

export class ClientWorkspaceService {
  async getWorkspaces(params: WorkspaceFilterParams) {
    return clientWorkspaceRepository.findAvailableWorkspaces(params);
  }

  async getWorkspaceDetails(idOrSlug: string) {
    const workspace = await clientWorkspaceRepository.findById(idOrSlug);
    if (!workspace) {
      throw new AppError(
        'Workspace could not be found or is not available.',
        404,
        ERROR_CODES.NOT_FOUND
      );
    }
    return workspace;
  }

  async checkAvailability(workspaceId: string, startTime: string | Date, endTime: string | Date) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError(
        'Invalid start or end time format.',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    if (end <= start) {
      throw new AppError(
        'End time must be after start time.',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const isAvailable = await clientWorkspaceRepository.checkSlotAvailability(workspaceId, start, end);
    return {
      workspaceId,
      startTime: start,
      endTime: end,
      isAvailable,
    };
  }

  async getBookedSlots(workspaceId: string, date: string) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError('Date query param is required in YYYY-MM-DD format.', 400, ERROR_CODES.VALIDATION_ERROR);
    }
    return clientWorkspaceRepository.getBookedSlots(workspaceId, date);
  }
}

export const clientWorkspaceService = new ClientWorkspaceService();
