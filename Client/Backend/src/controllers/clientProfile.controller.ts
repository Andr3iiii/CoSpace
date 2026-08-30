import { Response, NextFunction } from 'express';
import { clientProfileService } from '../services/clientProfile.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedClientRequest } from '../middleware/auth';

export class ClientProfileController {
  async getProfile(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await clientProfileService.getProfile(req.clientUser!.id);
      sendSuccess(res, 'Profile details retrieved.', profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientProfileService.updateProfile(req.clientUser!.id, req.body);
      sendSuccess(res, 'Profile updated successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientProfileService.updatePreferences(req.clientUser!.id, req.body);
      sendSuccess(res, 'Preferences saved.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const clientProfileController = new ClientProfileController();
