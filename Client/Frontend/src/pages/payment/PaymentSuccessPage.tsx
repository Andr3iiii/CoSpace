import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api';
import { Booking } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
    <div className="max-w-xl mx-auto px-4 py-12 w-full space-y-6">
      <div className="text-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-sm text-muted-foreground">
          Your payment has cleared. Show your digital check-in pass upon arrival.
        </p>
      </div>

      <Card className="text-center p-6 border-border/80 shadow-2xl space-y-6">
        {/* QR Code */}
        <div className="inline-flex flex-col items-center p-4 bg-white rounded-2xl shadow-md mx-auto">
          <QrCode className="h-40 w-40 text-slate-900" />
          <span className="text-sm font-black text-slate-900 mt-2 tracking-widest font-mono">
            {booking?.check_in_code || 'QR-8801-CHK'}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Scan at turnstile entrance or present to front desk reception on arrival
        </p>

        {/* Receipt Details */}
        <div className="text-left bg-muted/50 p-4 rounded-xl space-y-2.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Reference:</span>
            <strong className="text-primary font-mono">{booking?.booking_reference || 'CSP-2026-XXXX'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Workspace:</span>
            <strong className="text-foreground">{booking?.workspace_name}</strong>
          </div>
          {booking?.start_time && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time:</span>
              <span className="text-foreground font-medium">
                {format(new Date(booking.start_time), 'PPp')}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border/60">
            <span className="text-muted-foreground">Total Paid:</span>
            <strong className="text-emerald-500 font-bold text-sm">
              ₱{parseFloat(String(booking?.final_amount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link to="/bookings" className="flex-1">
            <Button variant="primary" size="md" className="w-full">
              View All My Bookings
            </Button>
          </Link>
          <Link to="/workspaces" className="flex-1">
            <Button variant="outline" size="md" className="w-full">
              Browse More Workspaces
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
