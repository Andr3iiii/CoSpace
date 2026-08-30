import { Response, NextFunction } from 'express';
import { adminPaymentService } from '../services/adminPayment.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedAdminRequest } from '../middleware/auth';

export class AdminPaymentController {
  async getPayments(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminPaymentService.getPayments(req.query as any);
      sendSuccess(res, 'Payments retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminPaymentService.getPaymentById(req.params.id);
      sendSuccess(res, 'Payment details retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  async refund(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, reason } = req.body;
      if (!amount || amount <= 0) {
        throw new Error('Valid refund amount is required.');
      }
      const result = await adminPaymentService.refundPayment(
        req.params.id,
        amount,
        reason || 'Administrative refund initiated.',
        req.admin!.id
      );
      sendSuccess(res, 'Refund processed successfully.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminPaymentController = new AdminPaymentController();
