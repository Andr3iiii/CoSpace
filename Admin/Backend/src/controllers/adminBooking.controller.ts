import { Response, NextFunction } from 'express';
import { adminBookingService } from '../services/adminBooking.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedAdminRequest } from '../middleware/auth';

export class AdminBookingController {
  async getBookings(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminBookingService.getBookings(req.query as any);
      sendSuccess(res, 'Bookings fetched successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminBookingService.getBookingById(req.params.id);
      sendSuccess(res, 'Booking retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, reason } = req.body;
      const result = await adminBookingService.updateBookingStatus(
        req.params.id,
        status,
        req.admin!.id,
        reason
      );
      sendSuccess(res, `Booking status successfully changed to ${status}.`, result);
    } catch (error) {
      next(error);
    }
  }

  async reschedule(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startTime, endTime } = req.body;
      const result = await adminBookingService.rescheduleBooking(
        req.params.id,
        startTime,
        endTime,
        req.admin!.id
      );
      sendSuccess(res, 'Booking rescheduled successfully.', result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminBookingController = new AdminBookingController();
