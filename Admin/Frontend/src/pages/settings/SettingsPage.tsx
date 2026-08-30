import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme/theme';
import { Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <form onSubmit={handleSave}>
        <Card style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text, marginBottom: '6px' }}>
            General Space Configuration
          </h3>
          <p style={{ fontSize: '12px', color: theme.colors.textDim, marginBottom: '20px' }}>
            Operating hours, address, and platform metadata
          </p>

          <Input label="Platform Name" defaultValue="CoSpace Innovation Hub" />
          <Input label="Physical Space Location" defaultValue="7th Ave, Bonifacio Global City, Taguig, Metro Manila" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Operating Hours (Open)" defaultValue="07:00 AM" />
            <Input label="Operating Hours (Close)" defaultValue="11:00 PM" />
          </div>
        </Card>

        <Card style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text, marginBottom: '6px' }}>
            Notification & Automated Alerts
          </h3>
          <p style={{ fontSize: '12px', color: theme.colors.textDim, marginBottom: '20px' }}>
            Configure default email notifications and booking confirmation settings
          </p>

          <Input label="Community Notification Email" defaultValue="community@cospace.com" />
          <Input label="Finance & Invoicing Email" defaultValue="finance@cospace.com" />
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={saved ? <Check size={18} /> : <Save size={18} />}
          >
            {saved ? 'Settings Saved!' : 'Save System Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};
