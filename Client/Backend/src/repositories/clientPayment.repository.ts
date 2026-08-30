import { query } from '../database/connection';
import { withTransaction } from '../database/transactions';

export class ClientPaymentRepository {
  async createPaymentRecord(data: {
    booking_id: string;
    client_id: string;
    amount: number;
    currency: string;
    provider: string;
    payment_method_type: string;
    transaction_reference: string;
    provider_payment_id?: string;
  }): Promise<any> {
    const rows = await query(
      `INSERT INTO payments 
        (booking_id, client_id, amount, currency, status, provider, payment_method_type, transaction_reference, provider_payment_id)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8)
       RETURNING *`,
      [
        data.booking_id,
        data.client_id,
        data.amount,
        data.currency || 'PHP',
        data.provider || 'paymongo',
        data.payment_method_type || 'card',
        data.transaction_reference,
        data.provider_payment_id || null,
      ]
    );
    return rows[0];
  }

  async confirmPaymentSuccess(paymentId: string, providerPaymentId?: string): Promise<any> {
    return withTransaction(async (client) => {
      const pmt = await client.query(
        'SELECT * FROM payments WHERE id = $1 FOR UPDATE',
        [paymentId]
      );

      if (!pmt.rows[0]) {
        throw new Error('Payment record not found.');
      }

      const payment = pmt.rows[0];

      // Update payment
      await client.query(
        `UPDATE payments 
         SET status = 'completed', 
             paid_at = CURRENT_TIMESTAMP, 
             provider_payment_id = COALESCE($1, provider_payment_id), 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [providerPaymentId || null, paymentId]
      );

      // Confirm the corresponding booking
      await client.query(
        `UPDATE bookings 
         SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [payment.booking_id]
      );

      // Add status history
      await client.query(
        `INSERT INTO booking_status_history (booking_id, from_status, to_status, changed_by_type, reason)
         VALUES ($1, 'pending', 'confirmed', 'system', 'Payment confirmed via PayMongo')`,
        [payment.booking_id]
      );

      // Add in-app notification
      await client.query(
        `INSERT INTO notifications (recipient_type, recipient_id, title, message, type, action_url)
         VALUES ('client', $1, 'Payment Successful!', 'Your payment was successfully processed. Your booking is confirmed.', 'payment', $2)`,
        [payment.client_id, `/bookings/${payment.booking_id}`]
      );

      return { success: true, bookingId: payment.booking_id };
    });
  }
}

export const clientPaymentRepository = new ClientPaymentRepository();
