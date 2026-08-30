import { Request, Response, NextFunction } from 'express';
import { adminAuthService } from '../services/adminAuth.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedAdminRequest } from '../middleware/auth';

export class AdminAuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await adminAuthService.login(email, password);
      sendSuccess(res, 'Administrator authentication successful.', result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = await adminAuthService.getMe(req.admin!.id);
      sendSuccess(res, 'Admin profile retrieved.', admin);
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, 'Administrative session terminated successfully.');
  }
}

export const adminAuthController = new AdminAuthController();
