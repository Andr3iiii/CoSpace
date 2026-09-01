import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api';
import { paymentApi } from '../../api/payment.api';
import { Booking } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CreditCard, Smartphone, CheckCircle, ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
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
      <div className="max-w-md mx-auto my-24 text-center px-4 py-8 text-sm text-muted-foreground">
        Loading reservation checkout...
      </div>
    );
  }

  const finalAmount = parseFloat(String(booking.final_amount || booking.total_amount || 0));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to reservations
      </Link>

      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Complete Your Reservation
        </h1>
        <p className="text-sm text-muted-foreground">
          Secure payment transaction powered by PayMongo Gateway
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods */}
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
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border/80 bg-card hover:bg-muted/40'
              }`}
              onClick={() => setPaymentMethod('gcash')}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block">GCash E-Wallet</span>
                  <span className="text-xs text-muted-foreground">Instant zero-fee checkout</span>
                </div>
              </div>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === 'gcash' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                {paymentMethod === 'gcash' && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
            </button>

            {/* Credit/Debit Card */}
            <button
              type="button"
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/10 shadow-sm'
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
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                {paymentMethod === 'card' && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
            </button>

            {/* GrabPay */}
            <button
              type="button"
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                paymentMethod === 'grab_pay'
                  ? 'border-primary bg-primary/10 shadow-sm'
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
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === 'grab_pay' ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                {paymentMethod === 'grab_pay' && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
            </button>

            <div className="pt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>256-bit SSL Encrypted Payment</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary & Pay Action */}
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
                  {format(new Date(booking.start_time), 'MMM dd, hh:mm a')} - {format(new Date(booking.end_time), 'hh:mm a')}
                </span>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-between items-baseline">
                <span className="text-sm font-bold text-foreground">Total Payable</span>
                <span className="text-2xl font-black text-primary">
                  ₱{finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4 shadow-lg shadow-primary/25"
              isLoading={isLoading}
              onClick={handlePay}
            >
              <Lock className="h-4 w-4 mr-2" />
              Pay ₱{finalAmount.toLocaleString()} Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
