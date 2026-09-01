import { adminBookingRepository } from '../repositories/booking.repository';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';
import { PaginationParams } from '../types';

export class AdminBookingService {
  async getBookings(params: PaginationParams) {
    return adminBookingRepository.findBookings(params);
  }

  async getBookingById(id: string) {
    const booking = await adminBookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking record not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    return booking;
  }

  async updateBookingStatus(id: string, status: string, adminId: string, reason?: string) {
    const updated = await adminBookingRepository.updateStatus(id, status, adminId, reason);
    if (!updated) {
      throw new AppError('Booking record not found or update failed.', 404, ERROR_CODES.NOT_FOUND);
    }
    return updated;
  }

  async rescheduleBooking(id: string, startTime: Date, endTime: Date, adminId: string) {
    return adminBookingRepository.rescheduleBooking(id, startTime, endTime, adminId);
  }
}

export const adminBookingService = new AdminBookingService();
