import { clientPaymentRepository } from '../repositories/clientPayment.repository';
import { clientBookingRepository } from '../repositories/clientBooking.repository';
import { paymongoClient } from '../integrations/paymongo';
import { resendClient } from '../integrations/resend';
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

    // Check if 10-minute hold expired
    if (booking.status === 'pending' && booking.hold_expires_at && new Date() > new Date(booking.hold_expires_at)) {
      throw new AppError(
        'Your 10-minute temporary reservation hold has expired. Please re-select your time slot.',
        409,
        ERROR_CODES.BOOKING_CONFLICT
      );
    }

    // Determine charge amount based on chosen payment plan
    const isDeposit = booking.payment_plan === 'deposit_50';
    const finalAmt = parseFloat(booking.final_amount);
    const amountToCharge = isDeposit
      ? Math.round(finalAmt * 0.50 * 100) / 100
      : finalAmt;

    const planDescription = isDeposit ? '50% Reservation Deposit' : 'Full Payment';

    const paymongoIntent = await paymongoClient.createPaymentIntent({
      amount: amountToCharge,
      description: `CoSpace Reservation: ${booking.booking_reference} (${planDescription})`,
    });

    const payment = await clientPaymentRepository.createPaymentRecord({
      booking_id: bookingId,
      client_id: clientId,
      amount: amountToCharge,
      currency: 'PHP',
      provider: 'paymongo',
      payment_method_type: paymentMethodType,
      transaction_reference: `TXN-${Date.now()}-${booking.booking_reference}`,
      provider_payment_id: paymongoIntent.paymentIntentId,
    });

    return {
      payment,
      clientKey: paymongoIntent.clientKey,
      paymentPlan: booking.payment_plan || 'full',
      amountCharged: amountToCharge,
      remainingBalance: isDeposit ? Math.round(finalAmt * 0.50 * 100) / 100 : 0.00,
    };
  }

  async confirmPayment(paymentId: string, clientId?: string) {
    const result = await clientPaymentRepository.confirmPaymentSuccess(paymentId, clientId);

    // Send rich booking confirmation receipt with check-in QR code asynchronously
    const { booking, payment } = result;
    if (booking && booking.client_email) {
      const clientFullName = `${booking.first_name || 'Valued'} ${booking.last_name || 'Member'}`.trim();
      resendClient.sendBookingReceipt(
        booking.client_email,
        clientFullName,
        {
          bookingReference: booking.booking_reference,
          checkInCode: booking.check_in_code,
          workspaceName: booking.workspace_name,
          workspaceType: booking.workspace_type,
          floor: booking.floor,
          roomNumber: booking.room_number,
          startTime: booking.start_time,
          endTime: booking.end_time,
          totalAmount: parseFloat(booking.total_amount),
          finalAmount: parseFloat(booking.final_amount),
          paymentPlan: booking.payment_plan || 'full',
          amountPaid: parseFloat(payment.amount),
          remainingBalance: parseFloat(booking.remaining_balance || '0'),
          paymentMethod: payment.payment_method_type,
          transactionReference: payment.transaction_reference,
        }
      ).catch((err) => {
        console.error('Failed to send booking receipt email:', err);
      });
    }

    return result;
  }
}

export const clientPaymentService = new ClientPaymentService();
