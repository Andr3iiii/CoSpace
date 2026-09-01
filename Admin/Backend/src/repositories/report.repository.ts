import { query } from '../database/connection';

export class AdminReportRepository {
  async generateSummary(startDate?: string, endDate?: string): Promise<{
    totalRevenue: number;
    totalBookings: number;
    totalRefunds: number;
    averageBookingValue: number;
    topWorkspaces: any[];
    popularTypes: any[];
    dailyBreakdown: any[];
  }> {
    const start = startDate || 'CURRENT_DATE - INTERVAL \'30 days\'';
    const end = endDate || 'CURRENT_DATE';

    const revQuery = `
      SELECT 
        COALESCE(SUM(amount), 0)::numeric as total_revenue,
        COUNT(id)::int as total_payments
      FROM payments
      WHERE status = 'completed'
    `;
    const revResult = await query<{ total_revenue: string; total_payments: string }>(revQuery);
    const totalRev = parseFloat(revResult[0]?.total_revenue || '0');

    const bksQuery = 'SELECT COUNT(id)::int as total_bookings FROM bookings';
    const bksResult = await query<{ total_bookings: number }>(bksQuery);
    const totalBks = bksResult[0]?.total_bookings || 0;

    const refQuery = 'SELECT COALESCE(SUM(amount), 0)::numeric as total_refunds FROM refunds WHERE status = \'completed\'';
    const refResult = await query<{ total_refunds: string }>(refQuery);
    const totalRef = parseFloat(refResult[0]?.total_refunds || '0');

    const avgVal = totalBks > 0 ? Math.round((totalRev / totalBks) * 100) / 100 : 0;

    const topWorkspaces = await query(
      `SELECT 
        w.name, 
        COUNT(b.id)::int as booking_count, 
        COALESCE(SUM(b.final_amount), 0)::numeric as revenue
       FROM workspaces w
       LEFT JOIN bookings b ON w.id = b.workspace_id
       GROUP BY w.id, w.name
       ORDER BY revenue DESC
       LIMIT 5`
    );

    const popularTypes = await query(
      `SELECT 
        wt.name, 
        COUNT(b.id)::int as bookings
       FROM workspace_types wt
       JOIN workspaces w ON w.workspace_type_id = wt.id
       LEFT JOIN bookings b ON b.workspace_id = w.id
       GROUP BY wt.name
       ORDER BY bookings DESC`
    );

    const dailyBreakdown = await query(
      'SELECT * FROM fn_get_admin_daily_breakdown(14)'
    );

    return {
      totalRevenue: totalRev,
      totalBookings: totalBks,
      totalRefunds: totalRef,
      averageBookingValue: avgVal,
      topWorkspaces,
      popularTypes,
      dailyBreakdown,
    };
  }
}

export const adminReportRepository = new AdminReportRepository();
