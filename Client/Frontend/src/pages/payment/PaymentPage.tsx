import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api';
import { paymentApi } from '../../api/payment.api';
import { Booking } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { theme } from '../../theme/theme';
import { CreditCard, Smartphone, CheckCircle, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash' | 'grab_pay'>('gcash');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;
      try {
        const data = await bookingApi.getBookingDetail(bookingId);
        setBooking(data);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to retrieve reservation details.');
      }
    }
    loadBooking();
  }, [bookingId]);

  const handlePay = async () => {
    if (!booking) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Create PayMongo Payment Intent
      const intentRes = await paymentApi.createIntent(booking.id, paymentMethod);

      // 2. Confirm payment
      await paymentApi.confirmPayment(intentRes.payment.id);

      // 3. Navigate to success receipt page
      navigate(`/payment/success?bookingId=${booking.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!booking) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', color: theme.colors.textMuted }}>
        Loading reservation checkout...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Complete Your Reservation
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.textMuted }}>
          Secure payment transaction via PayMongo Gateway
        </p>
      </div>

      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px',
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.dangerBg,
            border: `1px solid ${theme.colors.dangerBorder}`,
            color: theme.colors.danger,
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Payment Methods */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Select Payment Method
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {/* GCash */}
            <div
              onClick={() => setPaymentMethod('gcash')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: theme.radius.md,
                backgroundColor: paymentMethod === 'gcash' ? theme.colors.primaryLight : theme.colors.surface,
                border: `1px solid ${paymentMethod === 'gcash' ? theme.colors.primary : theme.colors.border}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone size={20} color={paymentMethod === 'gcash' ? theme.colors.primary : theme.colors.textDim} />
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>GCash E-Wallet</span>
              </div>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'gcash' ? theme.colors.primary : theme.colors.textDim}`, backgroundColor: paymentMethod === 'gcash' ? theme.colors.primary : 'transparent' }} />
            </div>

            {/* GrabPay */}
            <div
              onClick={() => setPaymentMethod('grab_pay')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: theme.radius.md,
                backgroundColor: paymentMethod === 'grab_pay' ? theme.colors.primaryLight : theme.colors.surface,
                border: `1px solid ${paymentMethod === 'grab_pay' ? theme.colors.primary : theme.colors.border}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Smartphone size={20} color={paymentMethod === 'grab_pay' ? theme.colors.primary : theme.colors.textDim} />
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>GrabPay</span>
              </div>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'grab_pay' ? theme.colors.primary : theme.colors.textDim}`, backgroundColor: paymentMethod === 'grab_pay' ? theme.colors.primary : 'transparent' }} />
            </div>

            {/* Credit/Debit Card */}
            <div
              onClick={() => setPaymentMethod('card')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: theme.radius.md,
                backgroundColor: paymentMethod === 'card' ? theme.colors.primaryLight : theme.colors.surface,
                border: `1px solid ${paymentMethod === 'card' ? theme.colors.primary : theme.colors.border}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={20} color={paymentMethod === 'card' ? theme.colors.primary : theme.colors.textDim} />
                <span style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>Credit / Debit Card</span>
              </div>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'card' ? theme.colors.primary : theme.colors.textDim}`, backgroundColor: paymentMethod === 'card' ? theme.colors.primary : 'transparent' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: theme.colors.textDim }}>
            <Lock size={14} /> 256-bit SSL encrypted transaction
          </div>
        </Card>

        {/* Order Summary */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
              Booking Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted }}>
                <span>Reference:</span>
                <span style={{ color: theme.colors.primary, fontWeight: 700 }}>{booking.booking_reference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted }}>
                <span>Space:</span>
                <span style={{ color: '#fff' }}>{booking.workspace_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted }}>
                <span>Date:</span>
                <span style={{ color: '#fff' }}>{format(new Date(booking.start_time), 'MMM dd, yyyy')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.colors.textMuted }}>
                <span>Schedule:</span>
                <span style={{ color: '#fff' }}>
                  {format(new Date(booking.start_time), 'hh:mm a')} - {format(new Date(booking.end_time), 'hh:mm a')}
                </span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Amount to Pay:</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: theme.colors.primary }}>
                ₱{parseFloat(String(booking.final_amount)).toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onClick={handlePay}
            style={{ width: '100%', marginTop: '24px' }}
          >
            Authorize Payment (₱{parseFloat(String(booking.final_amount)).toLocaleString()})
          </Button>
        </Card>
      </div>
    </div>
  );
};
