import { Request, Response, NextFunction } from 'express';
import { clientAuthService } from '../services/clientAuth.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedClientRequest } from '../middleware/auth';

export class ClientAuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientAuthService.register(req.body);
      sendSuccess(res, 'Client registration successful.', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await clientAuthService.login(email, password);
      sendSuccess(res, 'Login successful.', result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await clientAuthService.getMe(req.clientUser!.id);
      sendSuccess(res, 'Profile retrieved.', profile);
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, 'Logged out successfully.');
  }
}

export const clientAuthController = new ClientAuthController();
