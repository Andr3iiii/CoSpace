import { clientPaymentRepository } from '../repositories/clientPayment.repository';
import { clientBookingRepository } from '../repositories/clientBooking.repository';
import { paymongoClient } from '../integrations/paymongo';
import { AppError } from '../utils/errors';
import { ERROR_CODES } from '../constants';

export class ClientPaymentService {
  async createPaymentIntent(clientId: string, bookingId: string, paymentMethodType = 'card') {
    const booking = await clientBookingRepository.findByIdAndClient(bookingId, clientId);
    if (!booking) {
      throw new AppError('Booking not found or not owned by client.', 404, ERROR_CODES.NOT_FOUND);
    }

    if (booking.status === 'confirmed') {
      throw new AppError('This booking is already paid and confirmed.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const paymongoIntent = await paymongoClient.createPaymentIntent({
      amount: parseFloat(booking.final_amount),
      description: `CoSpace Reservation: ${booking.booking_reference}`,
    });

    const payment = await clientPaymentRepository.createPaymentRecord({
      booking_id: bookingId,
      client_id: clientId,
      amount: parseFloat(booking.final_amount),
      currency: 'PHP',
      provider: 'paymongo',
      payment_method_type: paymentMethodType,
      transaction_reference: `TXN-${Date.now()}-${booking.booking_reference}`,
      provider_payment_id: paymongoIntent.paymentIntentId,
    });

    return {
      payment,
      clientKey: paymongoIntent.clientKey,
    };
  }

  async confirmPayment(paymentId: string) {
    return clientPaymentRepository.confirmPaymentSuccess(paymentId);
  }
}

export const clientPaymentService = new ClientPaymentService();
