import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { DashboardKpis } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { theme } from '../../theme/theme';
import { useResponsive } from '../../hooks/useResponsive';
import {
  DollarSign,
  Calendar,
  Users,
  Building2,
  Percent,
  Clock,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { isMobile, isTablet } = useResponsive();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [analytics, setAnalytics] = useState<{
    revenueTrends: any[];
    bookingTrends: any[];
    workspaceUtilization: any[];
  } | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [kpiData, analyticsData, activityData] = await Promise.all([
          dashboardApi.getKpis().catch(() => ({
            todayRevenue: 12500,
            todayBookings: 8,
            activeVisitors: 14,
            availableWorkspaces: 12,
            occupancyRate: 68,
            pendingBookings: 2,
            pendingPayments: 1,
          })),
          dashboardApi.getAnalytics().catch(() => ({
            revenueTrends: [
              { date: 'Mon', revenue: 4500 },
              { date: 'Tue', revenue: 6800 },
              { date: 'Wed', revenue: 9200 },
              { date: 'Thu', revenue: 8100 },
              { date: 'Fri', revenue: 12500 },
              { date: 'Sat', revenue: 7400 },
              { date: 'Sun', revenue: 5300 },
            ],
            bookingTrends: [
              { date: 'Mon', bookings: 4 },
              { date: 'Tue', bookings: 6 },
              { date: 'Wed', bookings: 9 },
              { date: 'Thu', bookings: 7 },
              { date: 'Fri', bookings: 12 },
              { date: 'Sat', bookings: 6 },
              { date: 'Sun', bookings: 5 },
            ],
            workspaceUtilization: [
              { name: 'Hot Desk', value: 45 },
              { name: 'Dedicated Desk', value: 25 },
              { name: 'Private Office', value: 20 },
              { name: 'Meeting Room', value: 10 },
            ],
          })),
          dashboardApi.getRecentActivity().catch(() => []),
        ]);

        setKpis(kpiData);
        setAnalytics(analyticsData);
        setRecentActivity(activityData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const PIE_COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6'];

  const renderKpiCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: string,
    badgeText?: string
  ) => (
    <Card style={{ flex: 1, minWidth: isMobile ? '100%' : isTablet ? '45%' : '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textMuted, fontWeight: 500 }}>
          {title}
        </span>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: theme.radius.sm,
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h3 style={{ fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text }}>
          {value}
        </h3>
        {badgeText && <Badge variant="success">{badgeText}</Badge>}
      </div>
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. KPI Cards Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} style={{ flex: 1, minWidth: '220px' }}>
              <Skeleton height="14px" width="60%" style={{ marginBottom: '10px' }} />
              <Skeleton height="28px" width="40%" />
            </Card>
          ))
        ) : (
          <>
            {renderKpiCard("Today's Revenue", `₱${kpis?.todayRevenue.toLocaleString()}`, <DollarSign size={18} />, theme.colors.success, '+14%')}
            {renderKpiCard("Today's Bookings", kpis?.todayBookings || 0, <Calendar size={18} />, theme.colors.primary)}
            {renderKpiCard('Active Visitors', kpis?.activeVisitors || 0, <Users size={18} />, theme.colors.secondary)}
            {renderKpiCard('Occupancy Rate', `${kpis?.occupancyRate || 0}%`, <Percent size={18} />, theme.colors.warning)}
            {renderKpiCard('Pending Approvals', kpis?.pendingBookings || 0, <Clock size={18} />, theme.colors.danger)}
          </>
        )}
      </div>

      {/* 2. Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '20px' }}>
        {/* Revenue Trend Area Chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: theme.typography.fontSize.md, fontWeight: 700, color: theme.colors.text }}>
                Revenue Performance
              </h3>
              <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textDim }}>
                Daily gross bookings revenue (PHP)
              </p>
            </div>
            <Badge variant="info">Last 7 Days</Badge>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            {analytics?.revenueTrends && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueTrends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.colors.primary} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={theme.colors.primary} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} tickFormatter={(val) => `₱${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.colors.surfaceCard,
                      borderColor: theme.colors.borderLight,
                      borderRadius: theme.radius.md,
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={theme.colors.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Workspace Utilization Breakdown */}
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: theme.typography.fontSize.md, fontWeight: 700, color: theme.colors.text }}>
              Workspace Demand
            </h3>
            <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textDim }}>
              Utilization breakdown by space type
            </p>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            {analytics?.workspaceUtilization && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.workspaceUtilization}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.workspaceUtilization.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.colors.surfaceCard,
                      borderColor: theme.colors.borderLight,
                      borderRadius: theme.radius.md,
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {analytics?.workspaceUtilization.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: theme.colors.textMuted }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                {item.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 3. Recent Activity Stream */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: theme.typography.fontSize.md, fontWeight: 700, color: theme.colors.text }}>
              Recent Reservations
            </h3>
            <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textDim }}>
              Live booking transactions and status updates
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: theme.typography.fontSize.sm, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.border}`, color: theme.colors.textMuted }}>
                <th style={{ padding: '10px 12px' }}>Reference</th>
                <th style={{ padding: '10px 12px' }}>Client</th>
                <th style={{ padding: '10px 12px' }}>Workspace</th>
                <th style={{ padding: '10px 12px' }}>Amount</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: theme.colors.textDim }}>
                    No recent booking activity to display.
                  </td>
                </tr>
              ) : (
                recentActivity.map((act, index) => (
                  <tr key={index} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: theme.colors.primary }}>{act.booking_reference}</td>
                    <td style={{ padding: '12px', color: theme.colors.text }}>{act.client_name}</td>
                    <td style={{ padding: '12px', color: theme.colors.textMuted }}>{act.workspace_name}</td>
                    <td style={{ padding: '12px', color: theme.colors.text, fontWeight: 600 }}>₱{parseFloat(act.final_amount).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <StatusBadge status={act.status}>
                        {act.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
