import React from 'react';
import { theme } from '../../theme/theme';
import { Sparkles, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: theme.colors.footer,
        borderTop: `1px solid ${theme.colors.border}`,
        padding: '48px 24px 32px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>CoSpace</span>
          </div>
          <p style={{ fontSize: '13px', color: theme.colors.textDim, lineHeight: 1.6 }}>
            Next-generation collaborative workspaces, private executive studios, and smart boardrooms designed for ambitious teams and creators.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.text, marginBottom: '12px' }}>
            Location & Contact
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: theme.colors.textMuted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={15} color={theme.colors.primary} /> 7th Ave, Bonifacio Global City, Taguig
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color={theme.colors.primary} /> hello@cospace.com
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} color={theme.colors.primary} /> +63 2 8888 1234
            </span>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: theme.colors.text, marginBottom: '12px' }}>
            Space Types
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: theme.colors.textDim }}>
            <span>Hot Desks & Open Lounges</span>
            <span>Dedicated Fix Desks</span>
            <span>Private Team Offices</span>
            <span>4K Video Boardrooms</span>
            <span>Auditorium Event Spaces</span>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '20px',
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: theme.colors.textDim,
        }}
      >
        <span>© {new Date().getFullYear()} CoSpace Technologies Inc. All rights reserved.</span>
        <span>Secure Payments powered by PayMongo</span>
      </div>
    </footer>
  );
};
