import { Request, Response, NextFunction } from 'express';
import { clientWorkspaceService } from '../services/clientWorkspace.service';
import { sendSuccess } from '../utils/response';

export class ClientWorkspaceController {
  async getWorkspaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientWorkspaceService.getWorkspaces(req.query as any);
      sendSuccess(res, 'Workspaces fetched.', result);
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientWorkspaceService.getWorkspaceDetails(req.params.id);
      sendSuccess(res, 'Workspace details retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startTime, endTime } = req.body;
      const result = await clientWorkspaceService.checkAvailability(req.params.id, startTime, endTime);
      sendSuccess(res, 'Availability checked.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const clientWorkspaceController = new ClientWorkspaceController();
