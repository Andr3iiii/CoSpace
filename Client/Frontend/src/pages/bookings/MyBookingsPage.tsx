import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api';
import { useAuth } from '../../stores/AuthContext';
import { Booking } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Dialog } from '../../components/ui/Dialog';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { QrCode, Calendar, Clock, MapPin, XCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const MyBookingsPage: React.FC = () => {
  const { client } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  const [qrModalBooking, setQrModalBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (client) {
      fetchBookings();
    }
  }, [client]);

  const handleCancel = async () => {
    if (!cancellingBooking) return;
    setActionLoading(true);
    try {
      await bookingApi.cancelBooking(cancellingBooking.id, 'Cancelled by member');
      setCancellingBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (activeTab === 'active') return b.status === 'active';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          My Reservations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your upcoming workspace sessions and view digital check-in passes
        </p>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'upcoming', label: 'Upcoming', count: bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length },
          { id: 'active', label: 'Active Sessions', count: bookings.filter((b) => b.status === 'active').length },
          { id: 'completed', label: 'Past Sessions', count: bookings.filter((b) => b.status === 'completed').length },
          { id: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => b.status === 'cancelled').length },
        ]}
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="text-center py-16 px-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-foreground">No {activeTab} bookings found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
            Need a productive place to work today? Reserve a desk or meeting room in seconds.
          </p>
          <Link to="/workspaces">
            <Button variant="primary" size="md">
              Browse Workspaces
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border/80 hover:border-border transition-colors">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-base text-foreground">{b.workspace_name}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(b.start_time), 'EEEE, MMMM dd, yyyy')} • {format(new Date(b.start_time), 'hh:mm a')} - {format(new Date(b.end_time), 'hh:mm a')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ref: <strong className="text-primary font-mono">{b.booking_reference}</strong> • Amount: ₱{parseFloat(String(b.final_amount)).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
                {b.status === 'confirmed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setQrModalBooking(b)}
                  >
                    <QrCode className="h-4 w-4 mr-1.5" />
                    View QR Pass
                  </Button>
                )}

                {b.status === 'pending' && (
                  <Link to={`/payment/${b.id}`}>
                    <Button variant="primary" size="sm">
                      Complete Payment
                    </Button>
                  </Link>
                )}

                {(b.status === 'confirmed' || b.status === 'pending') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setCancellingBooking(b)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* QR Check-in Modal */}
      {qrModalBooking && (
        <Dialog
          isOpen={true}
          onClose={() => setQrModalBooking(null)}
          title="Digital Check-in Pass"
        >
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex flex-col items-center p-4 bg-white rounded-2xl shadow-md">
              <QrCode className="h-40 w-40 text-slate-900" />
              <span className="text-sm font-black text-slate-900 mt-2 tracking-widest font-mono">
                {qrModalBooking.check_in_code}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">
                {qrModalBooking.workspace_name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(qrModalBooking.start_time), 'PPpp')}
              </p>
            </div>

            <Button variant="secondary" size="md" className="w-full" onClick={() => setQrModalBooking(null)}>
              Close Pass
            </Button>
          </div>
        </Dialog>
      )}

      {/* Cancel Alert */}
      <AlertDialog
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        onConfirm={handleCancel}
        title="Cancel Reservation"
        description={`Are you sure you want to cancel booking ${cancellingBooking?.booking_reference}?`}
        confirmLabel="Confirm Cancellation"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
};
