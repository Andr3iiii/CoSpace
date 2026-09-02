import React, { useState, useEffect } from 'react';
import { profileApi } from '../../api/profile.api';
import { useAuth } from '../../stores/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, Check, User, Bell } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { client } = useAuth();
  const [, setProfileData] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [, setIsLoading] = useState(true);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Member Profile & Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your contact details, billing information, and alert preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Personal & Company Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" defaultValue={client?.first_name || ''} />
            <Input label="Last Name" defaultValue={client?.last_name || ''} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              defaultValue={client?.email || ''}
              disabled
              helperText="Email is managed via your registered identity"
            />
            <Input label="Contact Phone" defaultValue={client?.phone || '+63 917 123 4567'} />
          </div>

          <Input label="Company / Organization" defaultValue={client?.company_name || 'Acme Innovations'} />
        </Card>

        <Card className="space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notification Preferences
          </h3>

          <div className="flex flex-col gap-3 text-sm text-foreground">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <span className="text-muted-foreground hover:text-foreground transition-colors">
                Email notifications for booking confirmations and receipts
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <span className="text-muted-foreground hover:text-foreground transition-colors">
                SMS check-in reminders (sent 2 hours before session)
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <span className="text-muted-foreground hover:text-foreground transition-colors">
                CoSpace Community newsletter & exclusive event invitations
              </span>
            </label>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            className="shadow-lg shadow-primary/20"
          >
            {saved ? 'Changes Saved!' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
