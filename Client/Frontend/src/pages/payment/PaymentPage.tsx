import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api';
import { paymentApi } from '../../api/payment.api';
import { Booking } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
  AlertCircle,
  ArrowLeft,
  Clock,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { format } from 'date-fns';

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gcash' | 'grab_pay'>('gcash');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 10-minute hold countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;
      try {
        const data = await bookingApi.getBookingDetail(bookingId);
        setBooking(data);

        if (data.status === 'confirmed') {
          navigate(`/payment/success?bookingId=${data.id}`);
          return;
        }

        // Calculate initial remaining hold seconds
        const expiry = (data as any).hold_expires_at;
        if (expiry) {
          const diff = Math.max(0, Math.floor((new Date(expiry).getTime() - Date.now()) / 1000));
          setSecondsRemaining(diff);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to retrieve reservation details.');
      }
    }
    loadBooking();
  }, [bookingId, navigate]);

  // Hold countdown tick
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePay = async () => {
    if (!booking) return;

    if (secondsRemaining !== null && secondsRemaining <= 0) {
      setErrorMessage('Your 10-minute hold has expired. Please return to select your time slot again.');
      return;
    }

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
      <div className="max-w-md mx-auto my-24 text-center px-4 py-8 text-sm text-muted-foreground">
        Loading reservation checkout...
      </div>
    );
  }

  const finalAmount = parseFloat(String(booking.final_amount || booking.total_amount || 0));
  const isDeposit = (booking as any).payment_plan === 'deposit_50';
  const amountDueToday = isDeposit ? Math.round(finalAmount * 0.5 * 100) / 100 : finalAmount;
  const remainingBalance = isDeposit ? Math.round(finalAmount * 0.5 * 100) / 100 : 0;
  const isHoldExpired = secondsRemaining !== null && secondsRemaining <= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to reservations
      </Link>

      {/* 10-Minute Hold Active Banner */}
      {secondsRemaining !== null && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold ${
            isHoldExpired
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-primary/40 bg-primary/10 text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {isHoldExpired
                ? 'Temporary reservation hold expired! Time slot is no longer reserved.'
                : 'Temporary hold active: Workspace is locked exclusively for you'}
            </span>
          </div>
          <div className="font-mono font-black text-sm bg-background/80 px-2.5 py-0.5 rounded-lg border border-current">
            {formatTimer(secondsRemaining)}
          </div>
        </div>
      )}

      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Complete Your Reservation
        </h1>
        <p className="text-sm text-muted-foreground">
          {isDeposit
            ? 'Pay 50% reservation deposit now. Remaining balance is due upon check-in.'
            : 'Secure full checkout powered by PayMongo Gateway.'}
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Payment Methods */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* GCash */}
            <button
              type="button"
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'gcash'
                  ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                  : 'border-border/80 bg-card hover:bg-muted/40'
              }`}
              onClick={() => setPaymentMethod('gcash')}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">GCash E-Wallet</span>
                  <span className="text-xs text-muted-foreground">Instant zero-fee checkout</span>
                </div>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'gcash' ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}
              >
                {paymentMethod === 'gcash' && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>

            {/* Credit/Debit Card */}
            <button
              type="button"
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                  : 'border-border/80 bg-card hover:bg-muted/40'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">Credit / Debit Card</span>
                  <span className="text-xs text-muted-foreground">Visa, Mastercard, JCB</span>
                </div>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}
              >
                {paymentMethod === 'card' && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>

            {/* GrabPay */}
            <button
              type="button"
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'grab_pay'
                  ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                  : 'border-border/80 bg-card hover:bg-muted/40'
              }`}
              onClick={() => setPaymentMethod('grab_pay')}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">GrabPay E-Wallet</span>
                  <span className="text-xs text-muted-foreground">Fast QR checkout</span>
                </div>
              </div>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'grab_pay' ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}
              >
                {paymentMethod === 'grab_pay' && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>

            <div className="pt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>256-bit SSL Encrypted Payment</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Order Summary & Pay Action */}
        <Card className="border-border/80 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold">Reservation Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Workspace</span>
                <strong className="text-foreground font-semibold">{booking.workspace_name}</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Reference</span>
                <strong className="text-primary font-mono">{booking.booking_reference}</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Time Slot</span>
                <span className="text-foreground font-medium">
                  {format(new Date(booking.start_time), 'MMM dd, hh:mm a')} – {format(new Date(booking.end_time), 'hh:mm a')}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Payment Plan</span>
                <span className="text-foreground font-bold flex items-center gap-1">
                  {isDeposit ? (
                    <>
                      <Percent className="h-3.5 w-3.5 text-amber-500" />
                      <span>50% Reservation Deposit</span>
                    </>
                  ) : (
                    '100% Full Payment'
                  )}
                </span>
              </div>

              {/* Total & Due Today */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Workspace Value:</span>
                  <span className="text-foreground font-bold">₱{finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-baseline pt-2 text-base font-black">
                  <span className="text-foreground">Due Today:</span>
                  <span className="text-2xl font-black text-primary">
                    ₱{amountDueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {isDeposit && (
                  <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold pt-1">
                    <span>Balance Due at Check-in:</span>
                    <span>₱{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* 30% Refund Notice */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-200">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>30% Cancellation Refund Policy</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  Reminder: If you cancel this reservation, you are entitled to a 30% refund of the amount paid today.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4 shadow-lg shadow-primary/25 font-bold"
              isLoading={isLoading}
              disabled={isHoldExpired}
              onClick={handlePay}
            >
              <Lock className="h-4 w-4 mr-2" />
              {isHoldExpired ? 'Hold Expired' : `Pay ₱${amountDueToday.toLocaleString()} Now`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
