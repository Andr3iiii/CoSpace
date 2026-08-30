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
import {
  Search,
  Users,
  Star,
  Building2,
  Laptop,
  Armchair,
  Sparkles,
} from 'lucide-react';

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

  const getWorkspaceTypeConfig = (typeSlug?: string, typeName?: string) => {
    const normalized = (typeSlug || typeName || '').toLowerCase().replace(/[\s_]+/g, '-');
    switch (normalized) {
      case 'hot-desk':
      case 'hot-desks':
        return {
          variant: 'info' as const,
          label: 'Hot Desk',
          icon: <Laptop className="h-3 w-3" />,
        };
      case 'dedicated-desk':
        return {
          variant: 'indigo' as const,
          label: 'Dedicated Desk',
          icon: <Armchair className="h-3 w-3" />,
        };
      case 'private-office':
        return {
          variant: 'purple' as const,
          label: 'Private Office',
          icon: <Building2 className="h-3 w-3" />,
        };
      case 'meeting-room':
        return {
          variant: 'warning' as const,
          label: 'Meeting Room',
          icon: <Users className="h-3 w-3" />,
        };
      case 'event-space':
        return {
          variant: 'rose' as const,
          label: 'Event Space',
          icon: <Sparkles className="h-3 w-3" />,
        };
      default:
        return {
          variant: 'success' as const,
          label: typeName || 'Workspace',
          icon: <Building2 className="h-3 w-3" />,
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Explore Coworking & Meeting Spaces
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose your preferred workspace in Bonifacio Global City. Book by the hour or reserve for the full day.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-border/80 bg-card/60 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] flex gap-2">
            <Input
              placeholder="Search by space name or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Button type="submit" variant="primary" className="font-semibold shrink-0">
              Search
            </Button>
          </form>

          <div className="w-48 shrink-0">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Space Types' },
                { value: 'hot-desk', label: 'Hot Desks' },
                { value: 'dedicated-desk', label: 'Dedicated Desk' },
                { value: 'private-office', label: 'Private Office' },
                { value: 'meeting-room', label: 'Meeting Room' },
                { value: 'event-space', label: 'Event Space' },
              ]}
            />
          </div>

          <div className="w-40 shrink-0">
            <Select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              options={[
                { value: '', label: 'Any Capacity' },
                { value: '1', label: '1+ Person' },
                { value: '4', label: '4+ People' },
                { value: '8', label: '8+ People' },
                { value: '15', label: '15+ People' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Workspace Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden space-y-4">
              <Skeleton height="190px" borderRadius="0" />
              <div className="p-5 space-y-3">
                <Skeleton height="20px" width="70%" />
                <Skeleton height="14px" width="90%" />
                <Skeleton height="14px" width="50%" />
                <Skeleton height="36px" width="100%" />
              </div>
            </Card>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="text-center py-16 px-6 space-y-3">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No Workspaces Match Your Search</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try resetting your filters or search terms to see available inventory.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch('');
              setTypeFilter('');
              setCapacityFilter('');
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => {
            const typeConfig = getWorkspaceTypeConfig(ws.type_slug, ws.workspace_type);
            return (
              <Card
                key={ws.id}
                hoverEffect
                className="p-0 overflow-hidden flex flex-col group border-border/80 bg-card/60 backdrop-blur-md"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={
                      ws.images?.[0] ||
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
                    }
                    alt={ws.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-auto">
                    <Badge variant={typeConfig.variant} className="gap-1.5 shadow-md">
                      {typeConfig.icon}
                      <span>{ws.workspace_type || typeConfig.label}</span>
                    </Badge>
                    <div className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-white/10 shadow-sm self-start shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{ws.average_rating || '5.0'}</span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>
                        Capacity: {ws.capacity} {ws.capacity === 1 ? 'person' : 'people'} • {ws.floor}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {ws.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/80 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-primary">
                        ₱{parseFloat(String(ws.hourly_rate)).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-muted-foreground"> / hr</span>
                      <div className="text-[10px] text-muted-foreground">
                        ₱{parseFloat(String(ws.daily_rate)).toLocaleString()} / day
                      </div>
                    </div>
                    <Link to={`/workspaces/${ws.id}`}>
                      <Button variant="primary" size="sm" className="font-semibold shadow-sm">
                        Reserve Space
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
