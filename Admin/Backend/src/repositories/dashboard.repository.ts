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
    // 1. Today's Revenue
    const rev = await query<{ sum: string }>(
      `SELECT COALESCE(SUM(amount), 0) AS sum 
       FROM payments 
       WHERE status = 'completed' AND paid_at >= CURRENT_DATE`
    );

    // 2. Today's Bookings
    const bks = await query<{ count: string }>(
      `SELECT COUNT(id) AS count 
       FROM bookings 
       WHERE created_at >= CURRENT_DATE`
    );

    // 3. Active Visitors (checked in today and not checked out)
    const vis = await query<{ count: string }>(
      `SELECT COUNT(id) AS count 
       FROM check_ins 
       WHERE checked_in_at >= CURRENT_DATE AND checked_out_at IS NULL`
    );

    // 4. Available Workspaces
    const ws = await query<{ count: string }>(
      "SELECT COUNT(id) AS count FROM workspaces WHERE status = 'available'"
    );

    // 5. Total Workspaces for Occupancy
    const totalWs = await query<{ count: string }>('SELECT COUNT(id) AS count FROM workspaces');
    const totalCount = parseInt(totalWs[0]?.count || '1', 10) || 1;
    const availCount = parseInt(ws[0]?.count || '0', 10);
    const occupancyRate = Math.round(((totalCount - availCount) / totalCount) * 100);

    // 6. Pending Bookings
    const pendingBks = await query<{ count: string }>(
      "SELECT COUNT(id) AS count FROM bookings WHERE status = 'pending'"
    );

    // 7. Pending Payments
    const pendingPmts = await query<{ count: string }>(
      "SELECT COUNT(id) AS count FROM payments WHERE status = 'pending'"
    );

    return {
      todayRevenue: parseFloat(rev[0]?.sum || '0'),
      todayBookings: parseInt(bks[0]?.count || '0', 10),
      activeVisitors: parseInt(vis[0]?.count || '0', 10),
      availableWorkspaces: availCount,
      occupancyRate: occupancyRate >= 0 ? occupancyRate : 0,
      pendingBookings: parseInt(pendingBks[0]?.count || '0', 10),
      pendingPayments: parseInt(pendingPmts[0]?.count || '0', 10),
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
