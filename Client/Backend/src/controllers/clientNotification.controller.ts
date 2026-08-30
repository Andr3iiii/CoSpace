import { Response, NextFunction } from 'express';
import { clientNotificationService } from '../services/clientNotification.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedClientRequest } from '../middleware/auth';

export class ClientNotificationController {
  async getNotifications(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientNotificationService.getNotifications(req.clientUser!.id);
      sendSuccess(res, 'Notifications fetched.', result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientNotificationService.markAsRead(req.params.id, req.clientUser!.id);
      sendSuccess(res, 'Notification marked as read.', { success: result });
    } catch (error) {
      next(error);
    }
  }
}

export const clientNotificationController = new ClientNotificationController();
