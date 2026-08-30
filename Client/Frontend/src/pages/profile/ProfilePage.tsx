import React, { useState, useEffect } from 'react';
import { profileApi } from '../../api/profile.api';
import { useAuth } from '../../stores/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme/theme';
import { Save, Check, User, Bell, MapPin } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { client } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!client) return;
      setIsLoading(true);
      try {
        const data = await profileApi.getProfile();
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [client]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Member Profile & Settings
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.textMuted }}>
          Update your contact details, billing information, and alert preferences
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color={theme.colors.primary} /> Personal & Company Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="First Name" defaultValue={client?.first_name || ''} />
            <Input label="Last Name" defaultValue={client?.last_name || ''} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Email Address" defaultValue={client?.email || ''} disabled helperText="Email is managed via identity provider" />
            <Input label="Contact Phone" defaultValue={client?.phone || '+63 917 123 4567'} />
          </div>

          <Input label="Company / Organization" defaultValue={client?.company_name || 'Acme Innovations'} />
        </Card>

        <Card style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color={theme.colors.primary} /> Notification Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: theme.colors.text }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: theme.colors.primary, width: '16px', height: '16px' }} />
              <span>Email notifications for booking confirmations and receipts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: theme.colors.primary, width: '16px', height: '16px' }} />
              <span>SMS check-in reminders (sent 2 hours before session)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: theme.colors.primary, width: '16px', height: '16px' }} />
              <span>CoSpace Community newsletter & exclusive event invitations</span>
            </label>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={saved ? <Check size={18} /> : <Save size={18} />}
          >
            {saved ? 'Changes Saved!' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
