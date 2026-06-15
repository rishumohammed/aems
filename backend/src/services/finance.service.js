import { pool } from '../db/connection.js';

class FinanceService {
  async getSummary() {
    // Current Month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Last Month
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastYear = lastMonthDate.getFullYear();

    const [stats] = await pool.query(`
      SELECT 
        -- All Time
        COALESCE(SUM(amount_paid), 0) as total_revenue,
        COALESCE(SUM(balance_due), 0) as total_outstanding,
        
        -- Current Month
        (SELECT COALESCE(SUM(amount_paid), 0) FROM invoices WHERE payment_status != 'voided' AND MONTH(created_at) = ? AND YEAR(created_at) = ?) as monthly_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE deleted_at IS NULL AND MONTH(date) = ? AND YEAR(date) = ?) as monthly_expenses,
        
        -- Last Month (for trends)
        (SELECT COALESCE(SUM(amount_paid), 0) FROM invoices WHERE payment_status != 'voided' AND MONTH(created_at) = ? AND YEAR(created_at) = ?) as last_month_revenue,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE deleted_at IS NULL AND MONTH(date) = ? AND YEAR(date) = ?) as last_month_expenses
      FROM invoices
      WHERE payment_status != 'voided'
    `, [currentMonth, currentYear, currentMonth, currentYear, lastMonth, lastYear, lastMonth, lastYear]);

    const data = stats[0];
    
    // Convert to numbers
    const res = {
      total_revenue: Number(data.total_revenue),
      total_outstanding: Number(data.total_outstanding),
      monthly_revenue: Number(data.monthly_revenue),
      monthly_expenses: Number(data.monthly_expenses),
      last_month_revenue: Number(data.last_month_revenue),
      last_month_expenses: Number(data.last_month_expenses)
    };

    // Calculate Trends
    res.revenue_trend = this.calculateTrend(res.monthly_revenue, res.last_month_revenue);
    res.expense_trend = this.calculateTrend(res.monthly_expenses, res.last_month_expenses);
    
    const currentProfit = res.monthly_revenue - res.monthly_expenses;
    const lastProfit = res.last_month_revenue - res.last_month_expenses;
    res.profit_trend = this.calculateTrend(currentProfit, lastProfit);
    
    return res;
  }

  calculateTrend(current, previous) {
    if (previous === 0) return { value: current > 0 ? 100 : 0, label: 'vs last month', positive: current >= 0 };
    const diff = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(diff * 10) / 10),
      label: 'vs last month',
      positive: diff >= 0
    };
  }
}

export default new FinanceService();
