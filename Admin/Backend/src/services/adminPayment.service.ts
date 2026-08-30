import { adminPaymentRepository } from '../repositories/payment.repository';
import { paymongoAdmin } from '../integrations/paymongo';
import { PaginationParams } from '../types';

export class AdminPaymentService {
  async getPayments(params: PaginationParams) {
    return adminPaymentRepository.findPayments(params);
  }

  async getPaymentById(id: string) {
    const payment = await adminPaymentRepository.findById(id);
    if (!payment) {
      throw new Error('Payment record not found.');
    }
    return payment;
  }

  async refundPayment(id: string, amount: number, reason: string, adminId: string) {
    const payment = await adminPaymentRepository.findById(id);
    if (!payment) {
      throw new Error('Payment record not found.');
    }

    if (payment.status === 'refunded') {
      throw new Error('This payment has already been refunded.');
    }

    const paymongoResult = await paymongoAdmin.processRefund({
      paymentId: payment.provider_payment_id || payment.transaction_reference,
      amount,
      reason,
    });

    const refund = await adminPaymentRepository.createRefund({
      payment_id: id,
      amount,
      reason,
      admin_id: adminId,
      provider_refund_id: paymongoResult.refundId,
    });

    return refund;
  }
}

export const adminPaymentService = new AdminPaymentService();
