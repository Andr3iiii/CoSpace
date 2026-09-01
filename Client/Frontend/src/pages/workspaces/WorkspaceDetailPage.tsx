import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { Workspace } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Users,
  MapPin,
  Star,
  Check,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Sparkles,
  Wifi,
  Coffee,
  Building2,
  Laptop,
  Armchair,
} from 'lucide-react';

export const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await workspaceApi.getWorkspaceDetails(id);
        setWorkspace(data);
      } catch (err) {
        console.error('Failed to load workspace details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-80 sm:h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div>
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="max-w-md mx-auto my-24 text-center px-4 py-12 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Workspace Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The workspace you requested is unavailable or does not exist.
        </p>
        <Link to="/workspaces">
          <Button variant="primary" size="md">
            Browse Available Workspaces
          </Button>
        </Link>
      </div>
    );
  }

  const getWorkspaceTypeConfig = (typeSlug?: string, typeName?: string) => {
    const normalized = (typeSlug || typeName || '').toLowerCase().replace(/[\s_]+/g, '-');
    switch (normalized) {
      case 'hot-desk':
      case 'hot-desks':
        return { variant: 'info' as const, label: 'Hot Desk', icon: <Laptop className="h-3.5 w-3.5" /> };
      case 'dedicated-desk':
        return { variant: 'indigo' as const, label: 'Dedicated Desk', icon: <Armchair className="h-3.5 w-3.5" /> };
      case 'private-office':
        return { variant: 'purple' as const, label: 'Private Office', icon: <Building2 className="h-3.5 w-3.5" /> };
      case 'meeting-room':
        return { variant: 'warning' as const, label: 'Meeting Room', icon: <Users className="h-3.5 w-3.5" /> };
      case 'event-space':
        return { variant: 'rose' as const, label: 'Event Space', icon: <Sparkles className="h-3.5 w-3.5" /> };
      default:
        return { variant: 'success' as const, label: typeName || 'Workspace', icon: <Building2 className="h-3.5 w-3.5" /> };
    }
  };

  const typeConfig = getWorkspaceTypeConfig(workspace.type_slug, workspace.workspace_type);
  const hourlyRate = parseFloat(String(workspace.hourly_rate || 0));
  const dailyRate = parseFloat(String(workspace.daily_rate || 0));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      {/* Back link */}
      <Link
        to="/workspaces"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all workspaces
      </Link>

      {/* Hero Banner / Gallery */}
      <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-border/80 shadow-2xl group bg-muted">
        <img
          src={workspace.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200'}
          alt={workspace.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Badge variant={typeConfig.variant} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold shadow-lg">
            {typeConfig.icon}
            <span>{typeConfig.label}</span>
          </Badge>

          <div className="flex items-center gap-1.5 bg-background/85 backdrop-blur-md px-3 py-1 rounded-full border border-border/60 text-xs font-bold text-amber-400 shadow-lg">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{workspace.average_rating || '5.0'}</span>
            <span className="text-muted-foreground font-normal">({workspace.review_count || 12} reviews)</span>
          </div>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight drop-shadow-md">
            {workspace.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-foreground/90 font-medium">
            <span className="inline-flex items-center gap-1 bg-background/60 backdrop-blur-md px-2.5 py-1 rounded-md">
              <Users className="h-4 w-4 text-primary" /> Up to {workspace.capacity} Seats
            </span>
            <span className="inline-flex items-center gap-1 bg-background/60 backdrop-blur-md px-2.5 py-1 rounded-md">
              <MapPin className="h-4 w-4 text-primary" /> {workspace.floor || 'Floor 3'} {workspace.room_number ? `• Room ${workspace.room_number}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Amenities */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">About This Workspace</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workspace.description ||
                'High-performance flexible workspace engineered for productive solo work and collaborative teams. Features fiber-optic internet, ergonomic seating, and instant booking.'}
            </p>
          </section>

          {/* Amenities Grid */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Included Facilities & Perks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workspace.amenities && workspace.amenities.length > 0 ? (
                workspace.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-card/60 hover:bg-card transition-colors"
                  >
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{amenity.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-card/60">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Wifi className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Gigabit Fiber Mesh WiFi</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-card/60">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Coffee className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Artisan Coffee & Refreshments</span>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Guarantees */}
          <section className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>CoSpace Flexible Guarantee</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant digital check-in code generated upon confirmation. Free rescheduling or cancellation up to 2 hours before reservation starts.
            </p>
          </section>
        </div>

        {/* Right Column: Pricing & Booking Action Card */}
        <div>
          <Card className="sticky top-20 shadow-xl border-border/80">
            <CardHeader className="pb-4 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pricing Plan</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-black text-primary">
                  ₱{hourlyRate.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/ hour</span>
              </div>
              {dailyRate > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Full-day rate: <strong className="text-foreground">₱{dailyRate.toLocaleString()}</strong>
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Instant confirmation with QR check-in</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Pay via GCash, GrabPay, or Cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Power outlets & charging at every desk</span>
                </li>
              </ul>

              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-lg shadow-primary/25"
                onClick={() => navigate(`/book/${workspace.id}`)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Select Dates & Book
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
