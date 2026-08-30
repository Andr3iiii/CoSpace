import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { Workspace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { theme } from '../../theme/theme';
import {
  Sparkles,
  Search,
  Wifi,
  Coffee,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Star,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredSpaces, setFeaturedSpaces] = useState<Workspace[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const spaces = await workspaceApi.getWorkspaces({ limit: 4 });
        setFeaturedSpaces(spaces);
      } catch {
        // Fallback for mock preview
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

  return (
    <div>
      {/* 1. Hero Section */}
      <section
        style={{
          padding: '80px 24px',
          background: 'radial-gradient(ellipse at top, #1E293B 0%, #0F172A 70%)',
          textAlign: 'center',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: theme.colors.primaryLight,
              border: `1px solid ${theme.colors.successBorder}`,
              borderRadius: theme.radius.full,
              padding: '6px 14px',
              color: theme.colors.primary,
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            <Sparkles size={14} /> The Future of Coworking in BGC
          </div>

          <h1
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            Work, Collaborate & Create in Premium Spaces
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: theme.colors.textMuted,
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            Instant reservations for hot desks, quiet executive focus suites, and high-tech 4K meeting boardrooms with gigabit fiber internet.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/workspaces" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Explore Workspaces
              </Button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg">
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Perks / Features Section */}
      <section style={{ padding: '64px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>Why Teams Choose CoSpace</h2>
          <p style={{ fontSize: '14px', color: theme.colors.textDim, marginTop: '6px' }}>
            Designed ground-up for founders, freelancers, and enterprise teams
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <Card>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: theme.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary, marginBottom: '14px' }}>
              <Wifi size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Gigabit Fiber Mesh</h3>
            <p style={{ fontSize: '13px', color: theme.colors.textMuted, lineHeight: 1.5 }}>
              Redundant low-latency enterprise fiber connection guaranteed to keep high-bandwidth video streams and uploads fast.
            </p>
          </Card>

          <Card>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.secondary, marginBottom: '14px' }}>
              <Coffee size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Artisan Cafe & Bar</h3>
            <p style={{ fontSize: '13px', color: theme.colors.textMuted, lineHeight: 1.5 }}>
              Unlimited complimentary single-origin barista espresso, cold brews, and healthy snack options all day long.
            </p>
          </Card>

          <Card>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.accent, marginBottom: '14px' }}>
              <Clock size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Instant Mobile Check-in</h3>
            <p style={{ fontSize: '13px', color: theme.colors.textMuted, lineHeight: 1.5 }}>
              Seamless QR code entry. Reserve your desk in seconds and walk straight in with instant automated verification.
            </p>
          </Card>

          <Card>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.success, marginBottom: '14px' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>24/7 Security & Access</h3>
            <p style={{ fontSize: '13px', color: theme.colors.textMuted, lineHeight: 1.5 }}>
              CCTV surveillance, private lockable storage units, and concierge staff available to support your meetings.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Featured Workspaces Section */}
      <section style={{ padding: '64px 24px', backgroundColor: theme.colors.surfaceCard, borderTop: `1px solid ${theme.colors.border}`, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>Featured Workspaces</h2>
              <p style={{ fontSize: '13px', color: theme.colors.textDim }}>Hand-picked spaces ready for instant reservation</p>
            </div>
            <Link to="/workspaces" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight size={15} />}>
                View All Workspaces
              </Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {featuredSpaces.map((ws) => (
              <Card key={ws.id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: `1px solid ${theme.colors.borderLight}` }}>
                <div
                  style={{
                    height: '180px',
                    backgroundImage: `url(${ws.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Badge variant="success">{ws.workspace_type}</Badge>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', color: '#FCD34D', fontWeight: 600 }}>
                    <Star size={13} fill="#FCD34D" /> {ws.average_rating || '4.9'}
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{ws.name}</h3>
                    <p style={{ fontSize: '13px', color: theme.colors.textDim, lineHeight: 1.5, marginBottom: '16px' }}>
                      {ws.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: `1px solid ${theme.colors.border}` }}>
                    <div>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: theme.colors.primary }}>₱{ws.hourly_rate}</span>
                      <span style={{ fontSize: '12px', color: theme.colors.textDim }}> / hour</span>
                    </div>
                    <Link to={`/workspaces/${ws.id}`} style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="sm">
                        Book Space
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
