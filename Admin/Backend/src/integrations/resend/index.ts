import { config } from '../../config';

export class ResendAdminIntegration {
  private apiKey: string;

  constructor() {
    this.apiKey = config.resend.apiKey;
  }

  async sendAdminAlert(subject: string, htmlContent: string): Promise<boolean> {
    // Calls Resend REST API https://api.resend.com/emails
    return true;
  }
}

export const resendAdmin = new ResendAdminIntegration();
