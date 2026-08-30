import { clientBookingRepository } from '../repositories/clientBooking.repository';
import { clientWorkspaceRepository } from '../repositories/clientWorkspace.repository';
import { query } from '../database/connection';
import { CreateBookingInput } from '../types';

export class ClientBookingService {
  async getMyBookings(clientId: string) {
    return clientBookingRepository.findMyBookings(clientId);
  }

  async getBookingDetail(id: string, clientId: string) {
    const booking = await clientBookingRepository.findByIdAndClient(id, clientId);
    if (!booking) {
      throw new Error('Booking not found or access denied.');
    }
    return booking;
  }

  async createBooking(clientId: string, input: CreateBookingInput) {
    const workspace = await clientWorkspaceRepository.findById(input.workspaceId);
    if (!workspace) {
      throw new Error('Selected workspace does not exist.');
    }

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);

    // Calculate hours (minimum 1 hour)
    const durationHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    const hourlyRate = parseFloat(workspace.hourly_rate);
    const workspaceSubtotal = Math.round(durationHours * hourlyRate * 100) / 100;

    // Calculate Add-ons
    const addOnsList: Array<{ id: string; name: string; unitPrice: number; quantity: number; subtotal: number }> = [];
    let addOnsTotal = 0;

    if (input.addOns && input.addOns.length > 0) {
      for (const item of input.addOns) {
        const addonRow = await query<{ id: string; name: string; price: string }>(
          'SELECT id, name, price FROM add_ons WHERE id = $1 AND is_active = TRUE',
          [item.addOnId]
        );
        if (addonRow[0]) {
          const unitPrice = parseFloat(addonRow[0].price);
          const quantity = Math.max(1, item.quantity || 1);
          const subtotal = Math.round(unitPrice * quantity * 100) / 100;
          addOnsTotal += subtotal;
          addOnsList.push({
            id: addonRow[0].id,
            name: addonRow[0].name,
            unitPrice,
            quantity,
            subtotal,
          });
        }
      }
    }

    const totalAmount = Math.round((workspaceSubtotal + addOnsTotal) * 100) / 100;
    const finalAmount = totalAmount;

    // Execute atomic creation with transaction lock
    const booking = await clientBookingRepository.createBookingAtomic(clientId, input, {
      hours: durationHours,
      hourlyRate,
      workspaceSubtotal,
      addOnsList,
      totalAmount,
      finalAmount,
    });

    return booking;
  }

  async cancelBooking(id: string, clientId: string, reason?: string) {
    const result = await clientBookingRepository.cancelBooking(id, clientId, reason);
    if (!result) {
      throw new Error('Failed to cancel booking.');
    }
    return result;
  }
}

export const clientBookingService = new ClientBookingService();
