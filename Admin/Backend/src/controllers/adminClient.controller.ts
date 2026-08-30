import { Response, NextFunction } from 'express';
import { adminClientService } from '../services/adminClient.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedAdminRequest } from '../middleware/auth';

export class AdminClientController {
  async getClients(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminClientService.getClients(req.query as any);
      sendSuccess(res, 'Clients retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async getClientById(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminClientService.getClientById(req.params.id);
      sendSuccess(res, 'Client profile details retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const result = await adminClientService.updateClientStatus(req.params.id, status);
      sendSuccess(res, `Client status updated to ${status}.`, result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminClientController = new AdminClientController();
