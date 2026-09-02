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

  async confirmPaymentSuccess(paymentId: string, clientId?: string, providerPaymentId?: string): Promise<any> {
    return withTransaction(async (client) => {
      const pmt = await client.query(
        'SELECT * FROM payments WHERE id = $1 FOR UPDATE',
        [paymentId]
      );

      if (!pmt.rows[0]) {
        throw new Error('Payment record not found.');
      }

      const payment = pmt.rows[0];

      // Security check: IDOR protection
      if (clientId && payment.client_id !== clientId) {
        throw new Error('Unauthorized payment access.');
      }

      // Fetch booking details
      const bkgRes = await client.query(
        `SELECT b.*, w.name AS workspace_name, w.floor, w.room_number, wt.name AS workspace_type,
                c.email AS client_email, c.first_name, c.last_name
         FROM bookings b
         JOIN workspaces w ON b.workspace_id = w.id
         JOIN workspace_types wt ON w.workspace_type_id = wt.id
         JOIN clients c ON b.client_id = c.id
         WHERE b.id = $1
         FOR UPDATE`,
        [payment.booking_id]
      );

      const booking = bkgRes.rows[0];
      if (!booking) {
        throw new Error('Associated booking not found.');
      }

      const newPaid = Math.round((parseFloat(booking.paid_amount || '0') + parseFloat(payment.amount)) * 100) / 100;
      const remBalance = Math.max(0, Math.round((parseFloat(booking.final_amount) - newPaid) * 100) / 100);

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

      // Confirm the corresponding booking and clear hold
      await client.query(
        `UPDATE bookings 
         SET status = 'confirmed', 
             hold_expires_at = NULL,
             paid_amount = $2,
             remaining_balance = $3,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [payment.booking_id, newPaid, remBalance]
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

      return {
        success: true,
        bookingId: payment.booking_id,
        payment: { ...payment, status: 'completed' },
        booking: {
          ...booking,
          status: 'confirmed',
          hold_expires_at: null,
          paid_amount: newPaid,
          remaining_balance: remBalance,
        },
      };
    });
  }
}

export const clientPaymentRepository = new ClientPaymentRepository();
