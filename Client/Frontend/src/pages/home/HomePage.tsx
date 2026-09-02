import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { Workspace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  Wifi,
  Coffee,
  Users,
  Building2,
  ArrowRight,
  Shield,
  Clock,
  Star,
  Laptop,
  Armchair,
} from 'lucide-react';

const ROTATING_HERO_TITLES = [
  'Premium Spaces',
  'Flexible Hot Desks',
  'Private Focus Suites',
  '4K Meeting Rooms',
  'Creative Studios',
  'Modern Team Hubs',
];

export const HomePage: React.FC = () => {
  const [featuredSpaces, setFeaturedSpaces] = useState<Workspace[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect loop with zero layout shift
  useEffect(() => {
    const currentWord = ROTATING_HERO_TITLES[wordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentWord) {
      // Pause at full word
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && displayText === '') {
      // Move to next word after deleting
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % ROTATING_HERO_TITLES.length);
      timeout = setTimeout(() => {}, 300);
    } else {
      const speed = isDeleting ? 35 : 75;
      timeout = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? currentWord.substring(0, prev.length - 1)
            : currentWord.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const spaces = await workspaceApi.getWorkspaces({ limit: 4 });
        setFeaturedSpaces(spaces);
      } catch {
        // Fallback for preview
        setFeaturedSpaces([
          {
            id: 'w0000000-0000-0000-0000-000000000001',
            workspace_type_id: 't1',
            workspace_type: 'Hot Desk',
            type_slug: 'hot-desk',
            name: 'The Commons - Open Lounge Desks',
            slug: 'commons-open-lounge',
            description: 'Sunlit open-plan area featuring power hubs at every seat, natural timber tables, and immediate barista bar access.',
            capacity: 24,
            hourly_rate: 150,
            daily_rate: 850,
            floor: '3rd Floor',
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'],
            is_featured: true,
            average_rating: 4.9,
            review_count: 38,
          },
          {
            id: 'w0000000-0000-0000-0000-000000000004',
            workspace_type_id: 't4',
            workspace_type: 'Meeting Room',
            type_slug: 'meeting-room',
            name: 'Summit Boardroom',
            slug: 'summit-boardroom',
            description: 'Premium 14-person conference room with Cisco Webex dual 4K screens, magnetic glass whiteboards, and catered service.',
            capacity: 14,
            hourly_rate: 1500,
            daily_rate: 9500,
            floor: '4th Floor',
            images: ['https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&auto=format&fit=crop&q=80'],
            is_featured: true,
            average_rating: 5.0,
            review_count: 24,
          },
        ]);
      }
    }
    loadFeatured();
  }, []);

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
    <div>
      {/* 1. Hero Section */}
      <section className="relative py-20 px-6 text-center border-b border-border/80 bg-gradient-to-b from-card/80 via-background to-background overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Future of Coworking in BGC</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-[1.15] flex flex-col items-center justify-center">
            <span className="block">Work, Collaborate & Create in</span>
            <span className="inline-flex items-center justify-center min-h-[1.25em] mt-1 sm:mt-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent select-none">
              <span>{displayText}</span>
              <span className="inline-block w-[3px] sm:w-[4px] h-[0.8em] ml-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full animate-pulse align-middle" />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Instant reservations for hot desks, quiet executive focus suites, and high-tech 4K meeting boardrooms with gigabit fiber internet.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/workspaces">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />} className="shadow-lg shadow-primary/25 font-bold px-8">
                Explore Workspaces
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Perks / Features Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Why Teams Choose CoSpace
          </h2>
          <p className="text-sm text-muted-foreground">
            Designed ground-up for founders, freelancers, and growing enterprise teams
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverEffect className="space-y-3">
            <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
              <Wifi className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Gigabit Fiber Mesh</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Redundant low-latency enterprise fiber connection guaranteed to keep high-bandwidth video streams and uploads fast.
            </p>
          </Card>

          <Card hoverEffect className="space-y-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Coffee className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Artisan Cafe & Bar</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlimited complimentary single-origin barista espresso, cold brews, and healthy snack options all day long.
            </p>
          </Card>

          <Card hoverEffect className="space-y-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Instant QR Check-in</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seamless QR code entry. Reserve your desk in seconds and walk straight in with instant automated verification.
            </p>
          </Card>

          <Card hoverEffect className="space-y-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">24/7 Security & Access</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              CCTV surveillance, private lockable storage units, and concierge staff available to support your meetings.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Featured Workspaces Section */}
      <section className="py-16 px-6 bg-card/40 border-t border-b-0 border-border/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Featured Workspaces
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Hand-picked spaces ready for instant reservation
              </p>
            </div>
            <Link to="/workspaces">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All Workspaces
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSpaces.map((ws) => {
              const typeConfig = getWorkspaceTypeConfig(ws.type_slug, ws.workspace_type);
              return (
                <Card
                  key={ws.id}
                  hoverEffect
                  className="p-0 overflow-hidden flex flex-col group border-border/80 bg-card/60 backdrop-blur-md"
                >
                  {/* Workspace Image Banner */}
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
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
                        <span>{ws.average_rating || '4.9'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Workspace Details */}
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
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
