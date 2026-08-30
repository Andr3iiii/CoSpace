import { clientPaymentRepository } from '../repositories/clientPayment.repository';
import { clientBookingRepository } from '../repositories/clientBooking.repository';
import { paymongoClient } from '../integrations/paymongo';

export class ClientPaymentService {
  async createPaymentIntent(clientId: string, bookingId: string, paymentMethodType = 'card') {
    const booking = await clientBookingRepository.findByIdAndClient(bookingId, clientId);
    if (!booking) {
      throw new Error('Booking not found or not owned by client.');
    }

    if (booking.status === 'confirmed') {
      throw new Error('This booking is already paid and confirmed.');
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
