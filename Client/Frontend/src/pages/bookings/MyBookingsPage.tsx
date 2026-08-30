import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../../api/booking.api';
import { useAuth } from '../../stores/AuthContext';
import { Booking } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Dialog } from '../../components/ui/Dialog';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { theme } from '../../theme/theme';
import { QrCode, Calendar, Clock, MapPin, XCircle, ArrowRight } from 'lucide-react';
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          My Reservations
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.textMuted }}>
          Manage your upcoming workspace sessions and view check-in passes
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton height="120px" borderRadius="12px" />
          <Skeleton height="120px" borderRadius="12px" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Calendar size={40} color={theme.colors.textDim} style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
            No {activeTab} bookings found
          </h3>
          <p style={{ fontSize: '13px', color: theme.colors.textDim, marginBottom: '20px' }}>
            Need a productive place to work today? Reserve a desk or meeting room now.
          </p>
          <Link to="/workspaces" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Browse Workspaces</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBookings.map((b) => (
            <Card key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.primary,
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={24} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>{b.workspace_name}</span>
                    <StatusBadge status={b.status}>
                      {b.status}
                    </StatusBadge>
                  </div>
                  <div style={{ fontSize: '13px', color: theme.colors.textMuted }}>
                    {format(new Date(b.start_time), 'EEEE, MMMM dd, yyyy')} • {format(new Date(b.start_time), 'hh:mm a')} - {format(new Date(b.end_time), 'hh:mm a')}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.colors.textDim, marginTop: '2px' }}>
                    Ref: <strong style={{ color: theme.colors.primary }}>{b.booking_reference}</strong> • Amount: ₱{parseFloat(String(b.final_amount)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {b.status === 'confirmed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<QrCode size={16} />}
                    onClick={() => setQrModalBooking(b)}
                  >
                    View QR Pass
                  </Button>
                )}

                {b.status === 'pending' && (
                  <Link to={`/payment/${b.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="sm">
                      Complete Payment
                    </Button>
                  </Link>
                )}

                {(b.status === 'confirmed' || b.status === 'pending') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: theme.colors.danger }}
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
          maxWidth="420px"
        >
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: theme.radius.md,
                marginBottom: '16px',
              }}
            >
              <QrCode size={160} color="#0F172A" />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '8px' }}>
                {qrModalBooking.check_in_code}
              </span>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              {qrModalBooking.workspace_name}
            </h3>
            <p style={{ fontSize: '13px', color: theme.colors.textDim, marginBottom: '16px' }}>
              {format(new Date(qrModalBooking.start_time), 'PPpp')}
            </p>

            <Button variant="secondary" onClick={() => setQrModalBooking(null)} style={{ width: '100%' }}>
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
