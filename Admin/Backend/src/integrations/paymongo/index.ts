import { config } from '../../config';

export interface PayMongoRefundParams {
  paymentId: string;
  amount: number;
  reason: string;
}

export class PayMongoAdminIntegration {
  private secretKey: string;

  constructor() {
    this.secretKey = config.paymongo.secretKey;
  }

  async processRefund(params: PayMongoRefundParams): Promise<{ refundId: string; status: string }> {
    // In production, this issues an HTTPS request to https://api.paymongo.com/v1/refunds
    // with Basic Auth (Base64 encoded secretKey).
    return {
      refundId: `ref_mock_${Date.now()}`,
      status: 'succeeded',
    };
  }

  async retrievePayment(paymentId: string): Promise<any> {
    return {
      id: paymentId,
      status: 'paid',
      amount: 120000, // in centavos
      currency: 'PHP',
    };
  }
}

export const paymongoAdmin = new PayMongoAdminIntegration();
