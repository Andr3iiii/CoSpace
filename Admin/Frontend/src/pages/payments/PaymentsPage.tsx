import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../api/payment.api';
import { Payment } from '../../types';
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
import { Search, Eye, RotateCcw, CreditCard, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefundAlertOpen, setIsRefundAlertOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getPayments({ page, search, status: statusFilter });
      setPayments(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [statusFilter]);

  const handleRefund = async () => {
    if (!selectedPayment) return;
    setActionLoading(true);
    try {
      await paymentApi.refund(selectedPayment.id, selectedPayment.amount, refundReason || 'Refund initiated by administrator');
      setIsRefundAlertOpen(false);
      fetchPayments(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Refund failed');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Payment>[] = [
    {
      header: 'Reference',
      accessor: (item) => (
        <div>
          <span style={{ fontWeight: 600, color: theme.colors.primary }}>{item.transaction_reference}</span>
          <div style={{ fontSize: '11px', color: theme.colors.textDim }}>Booking: {item.booking_reference || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Client',
      accessor: (item) => (
        <div>
          <div style={{ fontWeight: 500 }}>{item.client_name || 'Member'}</div>
          <div style={{ fontSize: '11px', color: theme.colors.textDim }}>{item.client_email}</div>
        </div>
      ),
    },
    {
      header: 'Method',
      accessor: (item) => (
        <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 600, color: theme.colors.textMuted }}>
          {item.payment_method_type}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: (item) => (
        <span style={{ fontWeight: 700, color: theme.colors.text }}>
          ₱{parseFloat(String(item.amount)).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => <StatusBadge status={item.status}>{item.status}</StatusBadge>,
    },
    {
      header: 'Date',
      accessor: (item) => (
        <span style={{ fontSize: '12px', color: theme.colors.textDim }}>
          {item.paid_at ? format(new Date(item.paid_at), 'MMM dd, yyyy') : format(new Date(item.created_at), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const details = await paymentApi.getPaymentById(item.id);
              setSelectedPayment(details);
              setIsDetailOpen(true);
            }}
          >
            <Eye size={16} />
          </Button>

          {item.status === 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              style={{ color: theme.colors.danger }}
              onClick={() => {
                setSelectedPayment(item);
                setIsRefundAlertOpen(true);
              }}
              title="Issue Refund"
            >
              <RotateCcw size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search transaction, booking reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              style={{ marginBottom: 0 }}
            />
            <Button variant="secondary" onClick={() => fetchPayments(1)}>
              Search
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '160px', marginBottom: 0 }}
              options={[
                { value: '', label: 'All Payments' },
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'refunded', label: 'Refunded' },
              ]}
            />
            <Button variant="secondary" onClick={() => fetchPayments(pagination.page)}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={payments}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No payment transactions found."
        />
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => fetchPayments(p)}
        />
      </Card>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Dialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Transaction: ${selectedPayment.transaction_reference}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ backgroundColor: theme.colors.surface, padding: '14px', borderRadius: theme.radius.md }}>
              <div><strong>Amount:</strong> ₱{parseFloat(String(selectedPayment.amount)).toLocaleString()} {selectedPayment.currency}</div>
              <div><strong>Status:</strong> {selectedPayment.status}</div>
              <div><strong>Payment Provider:</strong> {selectedPayment.provider}</div>
              <div><strong>Method Type:</strong> {selectedPayment.payment_method_type}</div>
              <div><strong>Client:</strong> {selectedPayment.client_name} ({selectedPayment.client_email})</div>
              <div><strong>Booking Reference:</strong> {selectedPayment.booking_reference}</div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Refund Alert */}
      <AlertDialog
        isOpen={isRefundAlertOpen}
        onClose={() => setIsRefundAlertOpen(false)}
        onConfirm={handleRefund}
        title="Confirm Payment Refund"
        description={`Are you sure you want to refund ₱${selectedPayment?.amount} to the client?`}
        confirmLabel="Process Refund"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
};
