import { Request, Response, NextFunction } from 'express';
import { clientPaymentService } from '../services/clientPayment.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedClientRequest } from '../middleware/auth';

export class ClientPaymentController {
  async createIntent(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId, paymentMethodType } = req.body;
      const result = await clientPaymentService.createPaymentIntent(
        req.clientUser!.id,
        bookingId,
        paymentMethodType
      );
      sendSuccess(res, 'Payment intent initialized.', result);
    } catch (error) {
      next(error);
    }
  }

  async confirmPayment(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.body;
      const result = await clientPaymentService.confirmPayment(paymentId);
      sendSuccess(res, 'Payment confirmed successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response): Promise<void> {
    // PayMongo webhook endpoint for automated backend settlement
    res.status(200).json({ received: true });
  }
}

export const clientPaymentController = new ClientPaymentController();
