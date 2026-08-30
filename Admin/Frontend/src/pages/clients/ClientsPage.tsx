import React, { useState, useEffect } from 'react';
import { clientApi } from '../../api/client.api';
import { Client } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { AlertDialog } from '../../components/ui/AlertDialog';
import { Dialog } from '../../components/ui/Dialog';
import { theme } from '../../theme/theme';
import { Search, Eye, UserX, UserCheck, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusAlertOpen, setIsStatusAlertOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClients = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await clientApi.getClients({ page, search, status: statusFilter });
      setClients(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(1);
  };

  const handleToggleStatus = async () => {
    if (!selectedClient) return;
    setActionLoading(true);
    const nextStatus = selectedClient.status === 'active' ? 'suspended' : 'active';
    try {
      await clientApi.updateStatus(selectedClient.id, nextStatus);
      setIsStatusAlertOpen(false);
      fetchClients(pagination.page);
    } catch (err: any) {
      alert(err.message || 'Failed to update client status');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<Client>[] = [
    {
      header: 'Member',
      accessor: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: theme.colors.surfaceHover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '12px',
              color: theme.colors.text,
            }}
          >
            {item.first_name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>{`${item.first_name} ${item.last_name}`}</div>
            <div style={{ fontSize: '11px', color: theme.colors.textDim }}>{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Company',
      accessor: (item) => (
        <span style={{ color: theme.colors.textMuted }}>{item.company_name || 'Individual'}</span>
      ),
    },
    {
      header: 'Total Bookings',
      accessor: (item) => (
        <span style={{ fontWeight: 600 }}>{item.total_bookings || 0}</span>
      ),
    },
    {
      header: 'Total Spend',
      accessor: (item) => (
        <span style={{ fontWeight: 600, color: theme.colors.success }}>
          ₱{parseFloat(String(item.total_spent || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item) => (
        <Badge variant={item.status === 'active' ? 'success' : item.status === 'suspended' ? 'danger' : 'neutral'}>
          {item.status}
        </Badge>
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
              const details = await clientApi.getClientById(item.id);
              setSelectedClient(details);
              setIsDetailOpen(true);
            }}
            title="View Profile"
          >
            <Eye size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            style={{ color: item.status === 'active' ? theme.colors.danger : theme.colors.success }}
            onClick={() => {
              setSelectedClient(item);
              setIsStatusAlertOpen(true);
            }}
            title={item.status === 'active' ? 'Suspend Client' : 'Reactivate Client'}
          >
            {item.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              style={{ marginBottom: 0 }}
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '160px', marginBottom: 0 }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <Button variant="secondary" onClick={() => fetchClients(pagination.page)}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={clients}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No clients found."
        />
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => fetchClients(p)}
        />
      </Card>

      {/* Client Detail Modal */}
      {selectedClient && (
        <Dialog
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Member Profile: ${selectedClient.first_name} ${selectedClient.last_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.primary,
                  fontSize: '20px',
                  fontWeight: 700,
                }}
              >
                {selectedClient.first_name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text }}>
                  {selectedClient.first_name} {selectedClient.last_name}
                </h3>
                <div style={{ fontSize: '13px', color: theme.colors.textDim }}>{selectedClient.email}</div>
                <Badge variant={selectedClient.status === 'active' ? 'success' : 'danger'}>
                  {selectedClient.status}
                </Badge>
              </div>
            </div>

            <div style={{ backgroundColor: theme.colors.surface, padding: '14px', borderRadius: theme.radius.md, fontSize: '13px' }}>
              <div><strong>Company:</strong> {selectedClient.company_name || 'N/A'}</div>
              <div><strong>Phone:</strong> {selectedClient.phone || 'N/A'}</div>
              <div><strong>Total Spending:</strong> ₱{parseFloat(String(selectedClient.total_spent || 0)).toLocaleString()}</div>
              <div><strong>Total Bookings:</strong> {selectedClient.total_bookings || 0}</div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Suspend/Reactivate Alert */}
      <AlertDialog
        isOpen={isStatusAlertOpen}
        onClose={() => setIsStatusAlertOpen(false)}
        onConfirm={handleToggleStatus}
        title={selectedClient?.status === 'active' ? 'Suspend Client Account' : 'Reactivate Client Account'}
        description={`Are you sure you want to ${selectedClient?.status === 'active' ? 'suspend' : 'reactivate'} ${selectedClient?.first_name} ${selectedClient?.last_name}?`}
        confirmLabel={selectedClient?.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
        isDestructive={selectedClient?.status === 'active'}
        isLoading={actionLoading}
      />
    </div>
  );
};
