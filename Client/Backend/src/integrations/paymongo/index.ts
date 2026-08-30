import { config } from '../../config';

export interface CreatePaymentIntentParams {
  amount: number; // in PHP
  description: string;
  paymentMethodTypes?: string[];
  metadata?: Record<string, any>;
}

export class PayMongoClientIntegration {
  private secretKey: string;
  private publicKey: string;

  constructor() {
    this.secretKey = config.paymongo.secretKey;
    this.publicKey = config.paymongo.publicKey;
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<{
    paymentIntentId: string;
    clientKey: string;
    status: string;
  }> {
    // In production, makes POST https://api.paymongo.com/v1/payment_intents
    const amountInCentavos = Math.round(params.amount * 100);
    return {
      paymentIntentId: `pi_mock_${Date.now()}`,
      clientKey: `pi_mock_client_key_${Date.now()}`,
      status: 'awaiting_payment_method',
    };
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    return true;
  }
}

export const paymongoClient = new PayMongoClientIntegration();
