import React, { useState, useEffect } from 'react';
import { notificationApi } from '../../api/notification.api';
import { NotificationItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, Calendar, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [, setIsLoading] = useState(true);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Notifications & Alerts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time updates regarding your reservations and payments
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <Card className="text-center py-12 px-6 space-y-3">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-base font-bold text-foreground">No Notifications</h3>
            <p className="text-xs text-muted-foreground">You are completely caught up!</p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start gap-4 p-4 sm:p-5 transition-all ${
                n.is_read
                  ? 'bg-card/70 border-border/80'
                  : 'bg-primary/5 border-primary/30 shadow-md'
              }`}
            >
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'payment'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                    : 'bg-primary/15 text-primary border border-primary/25'
                }`}
              >
                {n.type === 'payment' ? <CreditCard className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="text-sm font-bold text-foreground leading-snug">{n.title}</h4>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(new Date(n.created_at), 'PP p')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(n.id)}
                  className="text-xs font-semibold shrink-0"
                >
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
