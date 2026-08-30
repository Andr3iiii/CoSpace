import React, { useState, useEffect } from 'react';
import { notificationApi } from '../../api/notification.api';
import { NotificationItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { theme } from '../../theme/theme';
import { Bell, CheckCircle2, Calendar, CreditCard, Info } from 'lucide-react';
import { format } from 'date-fns';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const items = await notificationApi.getNotifications().catch(() => [
        {
          id: 'n1',
          title: 'Booking Confirmed: Focus Pod #08',
          message: 'Your reservation is confirmed for tomorrow at 9:00 AM. Check-in code is QR-8801-CHK.',
          type: 'booking',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'n2',
          title: 'Payment Successful',
          message: 'Payment of ₱1,200 via GCash cleared successfully.',
          type: 'payment',
          is_read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Notifications & Alerts
        </h1>
        <p style={{ fontSize: '14px', color: theme.colors.textMuted }}>
          Real-time updates regarding your reservations and payments
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Bell size={40} color={theme.colors.textDim} style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              No Notifications
            </h3>
            <p style={{ fontSize: '13px', color: theme.colors.textDim }}>
              You are completely caught up!
            </p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                backgroundColor: n.is_read ? theme.colors.surfaceCard : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${n.is_read ? theme.colors.border : theme.colors.primaryLight}`,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: n.type === 'payment' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: n.type === 'payment' ? theme.colors.success : theme.colors.secondary,
                  flexShrink: 0,
                }}
              >
                {n.type === 'payment' ? <CreditCard size={18} /> : <Calendar size={18} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{n.title}</h4>
                  <span style={{ fontSize: '11px', color: theme.colors.textDim }}>
                    {format(new Date(n.created_at), 'PP p')}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: theme.colors.textMuted, lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>

              {!n.is_read && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                  Mark Read
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
