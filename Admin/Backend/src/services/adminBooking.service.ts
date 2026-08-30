import { adminBookingRepository } from '../repositories/booking.repository';
import { PaginationParams } from '../types';

export class AdminBookingService {
  async getBookings(params: PaginationParams) {
    return adminBookingRepository.findBookings(params);
  }

  async getBookingById(id: string) {
    const booking = await adminBookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking record not found.');
    }
    return booking;
  }

  async updateBookingStatus(id: string, status: string, adminId: string, reason?: string) {
    const updated = await adminBookingRepository.updateStatus(id, status, adminId, reason);
    if (!updated) {
      throw new Error('Failed to update booking status.');
    }
    return updated;
  }

  async rescheduleBooking(id: string, startTime: Date, endTime: Date, adminId: string) {
    return adminBookingRepository.rescheduleBooking(id, startTime, endTime, adminId);
  }
}

export const adminBookingService = new AdminBookingService();
