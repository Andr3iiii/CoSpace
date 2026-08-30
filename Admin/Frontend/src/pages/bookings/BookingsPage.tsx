import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../api/booking.api';
import { Booking } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { Dialog } from '../../components/ui/Dialog';
import { theme } from '../../theme/theme';
import { Search, Eye, CheckCircle, XCircle, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmAlertOpen, setIsConfirmAlertOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await bookingApi.getBookings({ page, search, status: statusFilter });
      setBookings(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings(1);
  };

  const handleConfirmStatus = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingApi.updateStatus(selectedBooking.id, 'confirmed', 'Approved by administrator');
      setIsConfirmAlertOpen(false);
      fetchBookings(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingApi.updateStatus(selectedBooking.id, 'cancelled', 'Cancelled by administrator');
      setIsCancelAlertOpen(false);
      fetchBookings(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Booking>[] = [
    {
      header: 'Reference',
      accessor: (item) => (
        <div>
          <span style={{ fontWeight: 600, color: theme.colors.primary }}>{item.booking_reference}</span>
          <div style={{ fontSize: '11px', color: theme.colors.textDim }}>{item.check_in_code}</div>
        </div>
      ),
    },
    {
      header: 'Client',
      accessor: (item) => (
        <div>
          <div style={{ fontWeight: 500, color: theme.colors.text }}>{item.client_name || 'Member'}</div>
          <div style={{ fontSize: '11px', color: theme.colors.textDim }}>{item.client_email}</div>
        </div>
      ),
    },
    {
      header: 'Workspace',
      accessor: (item) => (
        <div>
          <div style={{ fontWeight: 500, color: theme.colors.text }}>{item.workspace_name}</div>
          <div style={{ fontSize: '11px', color: theme.colors.textDim }}>{item.workspace_type}</div>
        </div>
      ),
    },
    {
      header: 'Schedule',
      accessor: (item) => (
        <div style={{ fontSize: '12px' }}>
          <div>{format(new Date(item.start_time), 'MMM dd, yyyy')}</div>
          <div style={{ color: theme.colors.textDim }}>
            {format(new Date(item.start_time), 'hh:mm a')} - {format(new Date(item.end_time), 'hh:mm a')}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (item) => (
        <span style={{ fontWeight: 600, color: theme.colors.text }}>
          ₱{parseFloat(String(item.final_amount)).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => <StatusBadge status={item.status}>{item.status}</StatusBadge>,
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const fullBooking = await bookingApi.getBookingById(item.id);
              setSelectedBooking(fullBooking);
              setIsDetailOpen(true);
            }}
            title="View Details"
          >
            <Eye size={16} />
          </Button>

          {item.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              style={{ color: theme.colors.success }}
              onClick={() => {
                setSelectedBooking(item);
                setIsConfirmAlertOpen(true);
              }}
              title="Confirm Booking"
            >
              <CheckCircle size={16} />
            </Button>
          )}

          {item.status !== 'cancelled' && item.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              style={{ color: theme.colors.danger }}
              onClick={() => {
                setSelectedBooking(item);
                setIsCancelAlertOpen(true);
              }}
              title="Cancel Booking"
            >
              <XCircle size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search reference, client, workspace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              style={{ marginBottom: 0 }}
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '160px', marginBottom: 0 }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Button variant="secondary" onClick={() => fetchBookings(pagination.page)}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={bookings}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No bookings match your selected criteria."
        />
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => fetchBookings(p)}
        />
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Booking Details: ${selectedBooking.booking_reference}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
              <div>
                <span style={{ fontSize: '12px', color: theme.colors.textDim }}>Status</span>
                <div>
                  <StatusBadge status={selectedBooking.status}>
                    {selectedBooking.status}
                  </StatusBadge>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: theme.colors.textDim }}>Check-in Code</span>
                <div style={{ fontWeight: 700, color: theme.colors.primary, fontSize: '16px' }}>
                  {selectedBooking.check_in_code}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '8px' }}>
                CLIENT & WORKSPACE
              </h4>
              <div style={{ backgroundColor: theme.colors.surface, padding: '12px', borderRadius: theme.radius.md, fontSize: '13px' }}>
                <div><strong>Client:</strong> {selectedBooking.client_name} ({selectedBooking.client_email})</div>
                <div><strong>Workspace:</strong> {selectedBooking.workspace_name} ({selectedBooking.workspace_type})</div>
                <div><strong>Start Time:</strong> {format(new Date(selectedBooking.start_time), 'PPpp')}</div>
                <div><strong>End Time:</strong> {format(new Date(selectedBooking.end_time), 'PPpp')}</div>
                {selectedBooking.special_requests && (
                  <div style={{ marginTop: '6px', color: theme.colors.warning }}>
                    <strong>Special Requests:</strong> {selectedBooking.special_requests}
                  </div>
                )}
              </div>
            </div>

            {selectedBooking.items && selectedBooking.items.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '8px' }}>
                  ITEMIZED BREAKDOWN
                </h4>
                <div style={{ backgroundColor: theme.colors.surface, padding: '12px', borderRadius: theme.radius.md, fontSize: '13px' }}>
                  {selectedBooking.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{it.description}</span>
                      <span>₱{parseFloat(String(it.subtotal)).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${theme.colors.border}`, fontWeight: 700 }}>
                    <span>Total Amount:</span>
                    <span style={{ color: theme.colors.success }}>₱{parseFloat(String(selectedBooking.final_amount)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* Confirmation Alerts */}
      <AlertDialog
        isOpen={isConfirmAlertOpen}
        onClose={() => setIsConfirmAlertOpen(false)}
        onConfirm={handleConfirmStatus}
        title="Confirm Booking Reservation"
        description={`Are you sure you want to approve and confirm reservation ${selectedBooking?.booking_reference}?`}
        confirmLabel="Confirm Booking"
        isLoading={actionLoading}
      />

      <AlertDialog
        isOpen={isCancelAlertOpen}
        onClose={() => setIsCancelAlertOpen(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking Reservation"
        description={`Are you sure you want to cancel booking ${selectedBooking?.booking_reference}? This will free up the reserved schedule.`}
        confirmLabel="Cancel Booking"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
};
