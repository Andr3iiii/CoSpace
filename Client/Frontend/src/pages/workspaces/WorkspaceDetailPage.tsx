import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workspaceApi } from '../../api/workspace.api';
import { Workspace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { theme } from '../../theme/theme';
import {
  Users,
  MapPin,
  Star,
  Check,
  Calendar,
  ArrowLeft,
  Shield,
  Coffee,
  Wifi,
  Sparkles,
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
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <Skeleton height="360px" borderRadius="16px" style={{ marginBottom: '24px' }} />
        <Skeleton height="32px" width="50%" style={{ marginBottom: '12px' }} />
        <Skeleton height="100px" style={{ marginBottom: '24px' }} />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          Workspace Not Found
        </h2>
        <p style={{ color: theme.colors.textMuted, marginBottom: '24px' }}>
          The workspace you requested is unavailable or does not exist.
        </p>
        <Link to="/workspaces">
          <Button variant="primary">Browse Available Workspaces</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      {/* Back navigation */}
      <Link
        to="/workspaces"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: theme.colors.textMuted,
          textDecoration: 'none',
          fontSize: '13px',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} /> Back to all workspaces
      </Link>

      {/* Main Hero Gallery */}
      <div
        style={{
          height: '380px',
          backgroundImage: `url(${workspace.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: theme.radius.lg,
          position: 'relative',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          marginBottom: '32px',
          boxShadow: theme.shadows.lg,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Badge variant="success">{workspace.workspace_type}</Badge>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '6px 12px',
              borderRadius: theme.radius.full,
              color: '#FCD34D',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <Star size={15} fill="#FCD34D" /> {workspace.average_rating || '5.0'} ({workspace.review_count || 12} reviews)
          </div>
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '16px 20px', borderRadius: theme.radius.md, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            {workspace.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: theme.colors.textMuted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Capacity: {workspace.capacity}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {workspace.floor}</span>
          </div>
        </div>
      </div>

      {/* Two column detail layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column: Details & Amenities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
              About This Workspace
            </h2>
            <p style={{ fontSize: '14px', color: theme.colors.textMuted, lineHeight: 1.6 }}>
              {workspace.description}
            </p>
          </div>

          {/* Included Amenities */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
              Included Facilities & Perks
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {workspace.amenities && workspace.amenities.length > 0 ? (
                workspace.amenities.map((am) => (
                  <div
                    key={am.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      backgroundColor: theme.colors.surfaceCard,
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.radius.md,
                      fontSize: '13px',
                      color: theme.colors.text,
                    }}
                  >
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: theme.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary }}>
                      <Check size={14} />
                    </div>
                    <span>{am.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: theme.colors.surfaceCard, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, fontSize: '13px', color: theme.colors.text }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: theme.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary }}><Check size={14} /></div>
                    <span>Gigabit Fiber Mesh WiFi</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: theme.colors.surfaceCard, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md, fontSize: '13px', color: theme.colors.text }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: theme.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary }}><Check size={14} /></div>
                    <span>Ergonomic Herman Miller Seating</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Booking Action Card */}
        <div>
          <Card style={{ position: 'sticky', top: '90px' }}>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${theme.colors.border}` }}>
              <div style={{ fontSize: '12px', color: theme.colors.textDim, textTransform: 'uppercase', fontWeight: 600 }}>
                Pricing Plan
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: theme.colors.primary }}>
                  ₱{parseFloat(String(workspace.hourly_rate)).toLocaleString()}
                </span>
                <span style={{ fontSize: '14px', color: theme.colors.textMuted }}>/ hour</span>
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.textDim, marginTop: '4px' }}>
                Full-day rate: <strong style={{ color: '#fff' }}>₱{parseFloat(String(workspace.daily_rate)).toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '13px', color: theme.colors.textMuted }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color={theme.colors.primary} /> Instant confirmation with QR check-in
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color={theme.colors.primary} /> Pay via GCash, GrabPay, or Card
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color={theme.colors.primary} /> Free rescheduling up to 2 hours prior
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%' }}
              onClick={() => navigate(`/book/${workspace.id}`)}
              leftIcon={<Calendar size={18} />}
            >
              Select Dates & Book
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
