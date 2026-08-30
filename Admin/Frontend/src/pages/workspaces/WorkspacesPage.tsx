import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { workspaceApi } from '../../api/workspace.api';
import { Workspace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { theme } from '../../theme/theme';
import { Plus, Search, Edit3, Building2, Users, DollarSign, RefreshCw } from 'lucide-react';

interface WorkspaceFormValues {
  name: string;
  workspace_type_id: string;
  capacity: number;
  hourly_rate: number;
  daily_rate: number;
  floor: string;
  room_number?: string;
  description: string;
  status: string;
}

export const WorkspacesPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create/Edit Dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<WorkspaceFormValues>();

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const [wsRes, metaRes] = await Promise.all([
        workspaceApi.getWorkspaces({ search, status: statusFilter }),
        workspaceApi.getMetadata().catch(() => ({ types: [], amenities: [] })),
      ]);
      setWorkspaces(wsRes.items || []);
      setTypes(metaRes.types || []);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [statusFilter]);

  const openCreateModal = () => {
    setEditingWorkspace(null);
    reset({
      name: '',
      workspace_type_id: types[0]?.id || '',
      capacity: 1,
      hourly_rate: 150,
      daily_rate: 900,
      floor: '1st Floor',
      room_number: '',
      description: '',
      status: 'available',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ws: Workspace) => {
    setEditingWorkspace(ws);
    reset({
      name: ws.name,
      workspace_type_id: ws.workspace_type_id,
      capacity: ws.capacity,
      hourly_rate: ws.hourly_rate,
      daily_rate: ws.daily_rate,
      floor: ws.floor,
      room_number: ws.room_number || '',
      description: ws.description,
      status: ws.status,
    });
    setIsModalOpen(true);
  };

  const onFormSubmit = async (data: WorkspaceFormValues) => {
    setFormLoading(true);
    try {
      if (editingWorkspace) {
        await workspaceApi.updateWorkspace(editingWorkspace.id, {
          ...data,
          capacity: Number(data.capacity),
          hourly_rate: Number(data.hourly_rate),
          daily_rate: Number(data.daily_rate),
        });
      } else {
        await workspaceApi.createWorkspace({
          ...data,
          capacity: Number(data.capacity),
          hourly_rate: Number(data.hourly_rate),
          daily_rate: Number(data.daily_rate),
        });
      }
      setIsModalOpen(false);
      fetchWorkspaces();
    } catch (err: any) {
      alert(err.message || 'Failed to save workspace');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      {/* Top action bar */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <Input
              placeholder="Search workspaces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              style={{ marginBottom: 0 }}
            />
            <Button variant="secondary" onClick={fetchWorkspaces}>
              Search
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '160px', marginBottom: 0 }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'available', label: 'Available' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} />}>
              Add Workspace
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid of Workspaces */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {workspaces.map((ws) => (
          <Card key={ws.id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div
              style={{
                height: '140px',
                backgroundImage: `url(${ws.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Badge variant={ws.status === 'available' ? 'success' : ws.status === 'maintenance' ? 'warning' : 'danger'}>
                {ws.status}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openEditModal(ws)}
                style={{ backgroundColor: 'rgba(17, 24, 39, 0.8)' }}
              >
                <Edit3 size={14} />
              </Button>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: theme.colors.primary, fontWeight: 700 }}>
                  {ws.workspace_type || 'Workspace'}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text, marginTop: '2px', marginBottom: '8px' }}>
                  {ws.name}
                </h3>
                <p style={{ fontSize: '12px', color: theme.colors.textDim, lineHeight: 1.4, marginBottom: '12px' }}>
                  {ws.description?.substring(0, 80)}...
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: `1px solid ${theme.colors.border}`,
                  fontSize: '12px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: theme.colors.textMuted }}>
                  <Users size={14} /> {ws.capacity} {ws.capacity === 1 ? 'Person' : 'People'}
                </span>
                <span style={{ fontWeight: 700, color: theme.colors.text }}>
                  ₱{ws.hourly_rate}/hr <span style={{ color: theme.colors.textDim }}>• ₱{ws.daily_rate}/day</span>
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create / Edit Workspace Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkspace ? `Edit Workspace: ${editingWorkspace.name}` : 'Create New Workspace'}
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Input
            label="Workspace Name"
            placeholder="e.g. Executive Boardroom 4A"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select
              label="Workspace Category"
              {...register('workspace_type_id', { required: 'Type is required' })}
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>

            <Input
              label="Capacity (Persons)"
              type="number"
              error={errors.capacity?.message}
              {...register('capacity', { required: 'Capacity is required', min: 1 })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Hourly Rate (PHP)"
              type="number"
              error={errors.hourly_rate?.message}
              {...register('hourly_rate', { required: 'Hourly rate is required', min: 0 })}
            />

            <Input
              label="Daily Rate (PHP)"
              type="number"
              error={errors.daily_rate?.message}
              {...register('daily_rate', { required: 'Daily rate is required', min: 0 })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              label="Floor / Zone"
              placeholder="e.g. 3rd Floor"
              {...register('floor')}
            />

            <Select label="Status" {...register('status')}>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={formLoading}>
              {editingWorkspace ? 'Save Changes' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
