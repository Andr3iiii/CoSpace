import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api';
import { Booking } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { theme } from '../../theme/theme';
import { CheckCircle2, QrCode, Calendar, MapPin, Download, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function load() {
      if (!bookingId) return;
      try {
        const data = await bookingApi.getBookingDetail(bookingId);
        setBooking(data);
      } catch (err) {
        console.error('Failed to load booking receipt:', err);
      }
    }
    load();
  }, [bookingId]);

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 24px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: theme.colors.successBg,
            border: `2px solid ${theme.colors.successBorder}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.success,
            marginBottom: '16px',
          }}
        >
          <CheckCircle2 size={36} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Booking Confirmed!
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.textMuted }}>
          Your payment has cleared. Show your check-in code upon arrival.
        </p>
      </div>

      <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
        {/* QR Code Simulation */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: '#FFFFFF',
            borderRadius: theme.radius.md,
            marginBottom: '16px',
          }}
        >
          <QrCode size={160} color="#0F172A" />
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '8px', letterSpacing: '0.05em' }}>
            {booking?.check_in_code || 'QR-8801-CHK'}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: theme.colors.textDim, marginBottom: '20px' }}>
          Scan at turnstile entrance or present to receptionist on arrival
        </div>

        <div
          style={{
            textAlign: 'left',
            backgroundColor: theme.colors.surface,
            padding: '16px',
            borderRadius: theme.radius.md,
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.textMuted }}>Booking Reference:</span>
            <strong style={{ color: theme.colors.primary }}>{booking?.booking_reference || 'CSP-2026-XXXX'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.textMuted }}>Workspace:</span>
            <strong style={{ color: '#fff' }}>{booking?.workspace_name}</strong>
          </div>
          {booking?.start_time && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: theme.colors.textMuted }}>Date & Time:</span>
              <strong style={{ color: '#fff' }}>
                {format(new Date(booking.start_time), 'MMM dd, yyyy (hh:mm a)')}
              </strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: theme.colors.textMuted }}>Location:</span>
            <strong style={{ color: '#fff' }}>7th Ave, BGC, Taguig ({booking?.floor || '3rd Floor'})</strong>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/bookings" style={{ flex: 1, textDecoration: 'none' }}>
          <Button variant="primary" size="lg" style={{ width: '100%' }}>
            View My Bookings
          </Button>
        </Link>
        <Link to="/workspaces" style={{ flex: 1, textDecoration: 'none' }}>
          <Button variant="secondary" size="lg" style={{ width: '100%' }}>
            Browse More Spaces
          </Button>
        </Link>
      </div>
    </div>
  );
};
