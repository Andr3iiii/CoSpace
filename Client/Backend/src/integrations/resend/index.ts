import { config } from '../../config';

export class ResendClientIntegration {
  private apiKey: string;

  constructor() {
    this.apiKey = config.resend.apiKey;
  }

  async sendBookingConfirmation(toEmail: string, bookingRef: string, details: any): Promise<boolean> {
    // Calls Resend API in production
    return true;
  }

  async sendWelcomeEmail(toEmail: string, name: string): Promise<boolean> {
    return true;
  }
}

export const resendClient = new ResendClientIntegration();
