import { config } from '../../config';

export interface BookingReceiptData {
  bookingReference: string;
  checkInCode: string;
  workspaceName: string;
  workspaceType?: string;
  floor?: string;
  roomNumber?: string;
  startTime: Date | string;
  endTime: Date | string;
  totalAmount: number;
  finalAmount: number;
  paymentPlan: 'full' | 'deposit_50';
  amountPaid: number;
  remainingBalance: number;
  paymentMethod?: string;
  transactionReference?: string;
}

export class ResendClientIntegration {
  private get apiKey(): string {
    return process.env.RESEND_API_KEY || config.resend.apiKey || '';
  }

  /**
   * Dispatch a 6-digit email OTP verification code
   */
  async sendEmailOtp(toEmail: string, otp: string): Promise<boolean> {
    const key = this.apiKey;
    const isRealKey = key && !key.startsWith('re_mock') && key.startsWith('re_');

    // In development / testing or when using a mock key, always log to server console
    if (!isRealKey || config.nodeEnv === 'development' || config.nodeEnv === 'test') {
      console.log(`\n======================================================`);
      console.log(`📨 [CoSpace Email Service — OTP Verification]`);
      console.log(`To: ${toEmail}`);
      console.log(`Verification Code: ${otp}`);
      console.log(`Expires in: 10 minutes`);
      console.log(`Email Provider: ${isRealKey ? 'Resend Live API' : 'Console Simulation (mock key)'}`);
      console.log(`======================================================\n`);
    }

    if (isRealKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'CoSpace Security <onboarding@resend.dev>',
            to: [toEmail],
            subject: 'CoSpace Email Verification Code',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #090d16; color: #f8fafc; border-radius: 16px;">
                <div style="margin-bottom: 24px;">
                  <span style="font-size: 20px; font-weight: 900; color: #3b82f6;">CoSpace</span>
                </div>
                <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 12px; color: #ffffff;">Email Verification</h2>
                <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
                  Hello,<br/>
                  Your CoSpace verification code is:
                </p>
                <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #3b82f6; font-family: monospace;">${otp}</span>
                </div>
                <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">
                  This code will expire in <strong>10 minutes</strong>. If you did not request this verification code, you can safely ignore this email.
                </p>
                <p style="font-size: 12px; color: #475569; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px;">
                  — CoSpace Security Team
                </p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error('⚠️ [Resend API Error]:', response.status, errData);
          return false;
        }

        return true;
      } catch (err) {
        console.error('Failed to send Resend OTP email:', err);
        return false;
      }
    }

    return true;
  }

  /**
   * Dispatch rich booking receipt with personalized welcome, QR check-in pass, and refund policy
   */
  async sendBookingReceipt(toEmail: string, clientName: string, receipt: BookingReceiptData): Promise<boolean> {
    const key = this.apiKey;
    const isRealKey = key && !key.startsWith('re_mock') && key.startsWith('re_');

    const startDate = new Date(receipt.startTime);
    const endDate = new Date(receipt.endTime);
    const dateFormatted = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeFormatted = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(receipt.checkInCode)}&color=0f172a&bgcolor=ffffff`;

    const isDeposit = receipt.paymentPlan === 'deposit_50';
    const planLabel = isDeposit ? '50% Reservation Deposit' : '100% Full Payment';

    console.log(`\n======================================================`);
    console.log(`🧾 [CoSpace Email Service — Booking Receipt & QR Pass]`);
    console.log(`To: ${toEmail} (${clientName})`);
    console.log(`Workspace: ${receipt.workspaceName}`);
    console.log(`Reference: ${receipt.bookingReference}`);
    console.log(`Plan: ${planLabel} | Paid: ₱${receipt.amountPaid.toLocaleString()} | Balance: ₱${receipt.remainingBalance.toLocaleString()}`);
    console.log(`Check-in QR Code: ${receipt.checkInCode}`);
    console.log(`Email Provider: ${isRealKey ? 'Resend Live API' : 'Console Simulation (mock key)'}`);
    console.log(`======================================================\n`);

    if (isRealKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'CoSpace Reservations <onboarding@resend.dev>',
            to: [toEmail],
            subject: `Workspace Reserved: ${receipt.workspaceName} [Ref: ${receipt.bookingReference}]`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CoSpace Booking Receipt</title>
              </head>
              <body style="margin: 0; padding: 24px; background-color: #040711; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background: #090d16; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
                  
                  <!-- Header Brand Banner -->
                  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4c1d95 100%); padding: 32px 28px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 8px;">
                      Co<span style="color: #60a5fa;">Space</span>
                    </div>
                    <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd;">
                      Booking Confirmed • Paid
                    </div>
                  </div>

                  <!-- Main Content -->
                  <div style="padding: 32px 28px;">
                    <!-- Client Greeting -->
                    <h1 style="font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                      Welcome, ${clientName}!
                    </h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                      Thank you for choosing CoSpace. Your workspace reservation is officially confirmed and locked in. Below is your official receipt and your digital QR Check-in Pass.
                    </p>

                    <!-- Workspace Info Card -->
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #60a5fa; margin-bottom: 6px;">
                        Reserved Workspace
                      </div>
                      <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
                        ${receipt.workspaceName}
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; margin-bottom: 12px;">
                        ${receipt.workspaceType || 'Executive Space'} • ${receipt.floor || 'Floor 1'} ${receipt.roomNumber ? `• Room ${receipt.roomNumber}` : ''}
                      </div>
                      <div style="border-top: 1px solid #1e293b; padding-top: 12px; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                        📍 <strong>CoSpace Naga Hub</strong><br/>
                        2nd Floor JH Bldg., Sta. Cruz, Naga City, Camarines Sur, Philippines<br/>
                        📅 <strong>${dateFormatted}</strong><br/>
                        ⏰ <strong>${timeFormatted}</strong>
                      </div>
                    </div>

                    <!-- Digital QR Check-in Pass Card (Centered email layout) -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 100%; background: #0b1329; border: 1px solid #3b82f6; border-radius: 16px; margin: 0 0 24px 0; text-align: center;">
                      <tr>
                        <td align="center" style="padding: 28px 20px; text-align: center;">
                          
                          <!-- 1. Centered Badge -->
                          <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto; text-align: center;">
                            <tr>
                              <td align="center" style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #60a5fa; text-align: center;">
                                Official QR Check-in Pass
                              </td>
                            </tr>
                          </table>

                          <!-- 2. Centered White QR Code Container -->
                          <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); text-align: center;">
                            <tr>
                              <td align="center" style="padding: 14px; text-align: center;">
                                <img src="${qrCodeUrl}" alt="Check-in QR Code" width="180" height="180" style="display: block; margin: 0 auto; border: 0; outline: none; border-radius: 8px;" />
                              </td>
                            </tr>
                          </table>

                          <!-- 3. Centered Passcode -->
                          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin: 0 auto 4px auto; text-align: center;">
                            Entry Passcode
                          </div>
                          <div style="font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #60a5fa; margin: 0 auto 12px auto; text-align: center;">
                            ${receipt.checkInCode}
                          </div>
                          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 auto; max-width: 380px; text-align: center;">
                            Present this QR code or 6-digit passcode at the concierge desk or turnstiles upon arrival for instant access.
                          </p>

                        </td>
                      </tr>
                    </table>

                    <!-- Itemized Payment Receipt Table -->
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #60a5fa; margin-bottom: 12px;">
                        Payment Summary
                      </div>
                      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 0; color: #94a3b8;">Booking Reference</td>
                          <td style="padding: 6px 0; text-align: right; color: #f8fafc; font-family: monospace; font-weight: 700;">${receipt.bookingReference}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #94a3b8;">Payment Plan Selected</td>
                          <td style="padding: 6px 0; text-align: right; color: #f8fafc; font-weight: 700;">${planLabel}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #94a3b8;">Total Workspace Cost</td>
                          <td style="padding: 6px 0; text-align: right; color: #f8fafc; font-weight: 700;">₱${receipt.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr style="border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b;">
                          <td style="padding: 10px 0; color: #60a5fa; font-size: 14px; font-weight: 800;">Amount Paid Today</td>
                          <td style="padding: 10px 0; text-align: right; color: #34d399; font-size: 18px; font-weight: 900;">₱${receipt.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        ${
                          isDeposit
                            ? `
                        <tr>
                          <td style="padding: 10px 0; color: #f59e0b; font-size: 13px; font-weight: 700;">Remaining Balance (Due at Check-in)</td>
                          <td style="padding: 10px 0; text-align: right; color: #f59e0b; font-size: 16px; font-weight: 800;">₱${receipt.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                        `
                            : ''
                        }
                      </table>
                    </div>

                    <!-- Cancellation & Refund Policy Notice -->
                    <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                      <div style="font-size: 12px; font-weight: 800; color: #fbbf24; margin-bottom: 4px;">
                        ⚠️ Important Cancellation & Refund Policy Notice
                      </div>
                      <div style="font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                        Please be reminded that in accordance with the CoSpace reservation agreement, this booking is subject to a <strong>30% refund policy</strong>. If you cancel this reservation, 30% of the amount paid will be refunded to your original payment method. 70% is retained as a reservation slot fee.
                      </div>
                    </div>

                    <!-- Amenities & Help -->
                    <div style="font-size: 12px; color: #64748b; line-height: 1.6; border-top: 1px solid #1e293b; padding-top: 20px;">
                      <strong>Need assistance with your booking?</strong><br/>
                      Our concierge team is available 24/7. Call us at +63 2 8888 2677 or reply to concierge@cospace.com.<br/>
                      High-speed Gigabit WiFi credentials will be available upon check-in.
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="background: #070b14; padding: 20px 28px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #475569;">
                    © 2026 CoSpace Philippines Inc. All rights reserved.<br/>
                    This is an automated proof of payment and reservation confirmation.
                  </div>
                </div>
              </body>
              </html>
            `,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.error('⚠️ [Resend API Error - Booking Receipt]:', response.status, errData);
          return false;
        }

        return true;
      } catch (err) {
        console.error('Failed to dispatch booking receipt email:', err);
        return false;
      }
    }

    return true;
  }

  async sendBookingConfirmation(toEmail: string, bookingRef: string, details: any): Promise<boolean> {
    return true;
  }

  async sendWelcomeEmail(toEmail: string, name: string): Promise<boolean> {
    return true;
  }
}

export const resendClient = new ResendClientIntegration();
