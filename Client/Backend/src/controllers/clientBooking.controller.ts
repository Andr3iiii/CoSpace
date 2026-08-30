import { Response, NextFunction } from 'express';
import { clientBookingService } from '../services/clientBooking.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedClientRequest } from '../middleware/auth';

export class ClientBookingController {
  async getMyBookings(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientBookingService.getMyBookings(req.clientUser!.id);
      sendSuccess(res, 'Member bookings retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  async getBookingDetail(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientBookingService.getBookingDetail(req.params.id, req.clientUser!.id);
      sendSuccess(res, 'Booking details retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await clientBookingService.createBooking(req.clientUser!.id, req.body);
      sendSuccess(res, 'Booking reserved successfully. Please proceed to payment.', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: AuthenticatedClientRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      const result = await clientBookingService.cancelBooking(req.params.id, req.clientUser!.id, reason);
      sendSuccess(res, 'Booking successfully cancelled.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const clientBookingController = new ClientBookingController();
