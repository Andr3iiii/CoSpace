import { query } from '../database/connection';

export class AdminDashboardRepository {
  async getKpis(): Promise<{
    todayRevenue: number;
    todayBookings: number;
    activeVisitors: number;
    availableWorkspaces: number;
    occupancyRate: number;
    pendingBookings: number;
    pendingPayments: number;
  }> {
    const rows = await query<{
      today_revenue: string;
      today_bookings: number;
      active_visitors: number;
      available_workspaces: number;
      occupancy_rate: number;
      pending_bookings: number;
      pending_payments: number;
    }>('SELECT * FROM fn_get_admin_dashboard_kpis()');

    const kpi = rows[0];
    return {
      todayRevenue: parseFloat(kpi?.today_revenue || '0'),
      todayBookings: kpi?.today_bookings || 0,
      activeVisitors: kpi?.active_visitors || 0,
      availableWorkspaces: kpi?.available_workspaces || 0,
      occupancyRate: kpi?.occupancy_rate || 0,
      pendingBookings: kpi?.pending_bookings || 0,
      pendingPayments: kpi?.pending_payments || 0,
    };
  }

  async getAnalytics(): Promise<{
    revenueTrends: Array<{ date: string; revenue: number }>;
    bookingTrends: Array<{ date: string; bookings: number }>;
    workspaceUtilization: Array<{ name: string; value: number }>;
  }> {
    // 7-day revenue trend
    const revenueTrends = await query<{ date: string; revenue: string }>(
      `SELECT 
        TO_CHAR(d.date, 'Mon DD') as date,
        COALESCE(SUM(p.amount), 0)::numeric as revenue
       FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d(date)
       LEFT JOIN payments p ON DATE(p.paid_at) = DATE(d.date) AND p.status = 'completed'
       GROUP BY d.date
       ORDER BY d.date ASC`
    );

    // 7-day booking trend
    const bookingTrends = await query<{ date: string; bookings: string }>(
      `SELECT 
        TO_CHAR(d.date, 'Mon DD') as date,
        COUNT(b.id)::int as bookings
       FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d(date)
       LEFT JOIN bookings b ON DATE(b.created_at) = DATE(d.date)
       GROUP BY d.date
       ORDER BY d.date ASC`
    );

    // Workspace utilization by type
    const workspaceUtilization = await query<{ name: string; value: string }>(
      `SELECT 
        wt.name as name,
        COUNT(b.id)::int as value
       FROM workspace_types wt
       JOIN workspaces w ON w.workspace_type_id = wt.id
       LEFT JOIN bookings b ON b.workspace_id = w.id
       GROUP BY wt.name`
    );

    return {
      revenueTrends: revenueTrends.map((r) => ({ date: r.date, revenue: parseFloat(r.revenue) })),
      bookingTrends: bookingTrends.map((b) => ({ date: b.date, bookings: parseInt(b.bookings, 10) })),
      workspaceUtilization: workspaceUtilization.map((w) => ({ name: w.name, value: parseInt(w.value, 10) })),
    };
  }

  async getRecentActivity(): Promise<any[]> {
    return query(
      `SELECT 
        b.id,
        b.booking_reference,
        CONCAT(c.first_name, ' ', c.last_name) as client_name,
        w.name as workspace_name,
        b.final_amount,
        b.status,
        b.created_at
       FROM bookings b
       JOIN clients c ON b.client_id = c.id
       JOIN workspaces w ON b.workspace_id = w.id
       ORDER BY b.created_at DESC
       LIMIT 6`
    );
  }
}

export const adminDashboardRepository = new AdminDashboardRepository();
