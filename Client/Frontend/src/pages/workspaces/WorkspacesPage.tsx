import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { Workspace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { theme } from '../../theme/theme';
import { Search, Users, Star, ArrowRight, Filter, Building2, Wifi } from 'lucide-react';

export const WorkspacesPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await workspaceApi.getWorkspaces({
        search,
        type: typeFilter,
        capacity: capacityFilter ? Number(capacityFilter) : undefined,
      });
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [typeFilter, capacityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkspaces();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
          Explore Coworking & Meeting Spaces
        </h1>
        <p style={{ fontSize: '15px', color: theme.colors.textMuted }}>
          Choose your preferred workspace in Bonifacio Global City. Book by the hour or reserve for the full day.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ marginBottom: '32px', padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
            <Input
              placeholder="Search by space name or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
              style={{ marginBottom: 0 }}
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '180px', marginBottom: 0 }}
            options={[
              { value: '', label: 'All Space Types' },
              { value: 'hot-desk', label: 'Hot Desk' },
              { value: 'dedicated-desk', label: 'Dedicated Desk' },
              { value: 'private-office', label: 'Private Office' },
              { value: 'meeting-room', label: 'Meeting Room' },
              { value: 'event-space', label: 'Event Space' },
            ]}
          />

          <Select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            style={{ width: '150px', marginBottom: 0 }}
            options={[
              { value: '', label: 'Any Capacity' },
              { value: '1', label: '1+ Person' },
              { value: '4', label: '4+ People' },
              { value: '8', label: '8+ People' },
              { value: '15', label: '15+ People' },
            ]}
          />
        </div>
      </Card>

      {/* Workspace Cards Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} style={{ padding: 0, overflow: 'hidden' }}>
              <Skeleton height="180px" borderRadius="0" />
              <div style={{ padding: '20px' }}>
                <Skeleton height="20px" width="70%" style={{ marginBottom: '10px' }} />
                <Skeleton height="14px" width="90%" style={{ marginBottom: '6px' }} />
                <Skeleton height="14px" width="50%" style={{ marginBottom: '16px' }} />
                <Skeleton height="36px" width="100%" />
              </div>
            </Card>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Building2 size={48} color={theme.colors.textDim} style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            No Workspaces Match Your Search
          </h3>
          <p style={{ fontSize: '13px', color: theme.colors.textDim, marginBottom: '20px' }}>
            Try resetting your filters or search terms to see available inventory.
          </p>
          <Button variant="secondary" onClick={() => { setSearch(''); setTypeFilter(''); setCapacityFilter(''); }}>
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
                border: `1px solid ${theme.colors.borderLight}`,
              }}
            >
              <div
                style={{
                  height: '190px',
                  backgroundImage: `url(${ws.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Badge variant="success">{ws.workspace_type}</Badge>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    padding: '4px 8px',
                    borderRadius: theme.radius.full,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FCD34D',
                  }}
                >
                  <Star size={13} fill="#FCD34D" /> {ws.average_rating || '5.0'}
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textDim, fontSize: '12px', marginBottom: '6px' }}>
                    <Users size={14} /> Capacity: {ws.capacity} {ws.capacity === 1 ? 'person' : 'people'} • {ws.floor}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                    {ws.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: theme.colors.textMuted, lineHeight: 1.5, marginBottom: '20px' }}>
                    {ws.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.primary }}>
                      ₱{parseFloat(String(ws.hourly_rate)).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: theme.colors.textDim }}>/hr</span>
                    <div style={{ fontSize: '11px', color: theme.colors.textDim }}>
                      ₱{parseFloat(String(ws.daily_rate)).toLocaleString()}/day
                    </div>
                  </div>

                  <Link to={`/workspaces/${ws.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="md">
                      Reserve Space
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
