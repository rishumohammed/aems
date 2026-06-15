import { pool } from '../db/connection.js';

export const DashboardController = {
  async getGlobalCounts(req, res) {
    try {
      const isAgent = req.user.role === 'crm_agent';
      const userId = req.user.id;

      let followupQuery = 'SELECT COUNT(*) as count FROM lead_followups WHERE DATE(scheduled_at) = CURDATE() AND status = "pending"';
      if (isAgent) followupQuery += ' AND agent_id = ?';
      const [followupCount] = await pool.query(followupQuery, isAgent ? [userId] : []);

      res.json({
        followups: followupCount[0].count,
        unreadMessages: 0,
        pendingApprovals: 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getAdminMasterStats(req, res) {
    try {
      // KPI Row 1: Leads, Conversion, Active Students, Revenue
      const [leadsMonth] = await pool.query('SELECT COUNT(*) as count FROM leads WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())');
      const [convertedLeads] = await pool.query('SELECT COUNT(*) as count FROM leads WHERE status = "converted"');
      const [totalLeads] = await pool.query('SELECT COUNT(*) as count FROM leads');
      const convRate = totalLeads[0].count > 0 ? (convertedLeads[0].count / totalLeads[0].count) * 100 : 0;
      
      const [activeStudents] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "student" AND status = "active"');
      const [revenueMonth] = await pool.query('SELECT SUM(amount_paid) as total FROM invoices WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())');

      // KPI Row 2: Courses, Jobs, etc.
      const [activeCourses] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE status = "published"');
      
      const [totalTutors] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "tutor" AND status = "active"');
      const [pendingTutors] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "tutor" AND status = "pending_review"');
      
      const [totalEmployers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "employer" AND status = "active"');
      const [pendingEmployers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "employer" AND status = "pending_review"');
      
      const [pendingJobs] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "pending_approval"');
      const [activeJobs] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "approved"');
      const [pendingExams] = await pool.query('SELECT COUNT(*) as count FROM exam_attempts WHERE status = "pending_manual_review"');

      // Funnel Chart: Count per status
      const [funnelData] = await pool.query('SELECT status, COUNT(*) as count FROM leads GROUP BY status');

      // Recent Enrollments (Invoices joining users and courses)
      const [recentEnrollments] = await pool.query(`
        SELECT u.id as student_id, u.name, c.title as course, i.created_at as date, i.amount_paid as amount 
        FROM invoices i 
        JOIN users u ON i.student_id = u.id 
        LEFT JOIN courses c ON i.course_id = c.id 
        ORDER BY i.created_at DESC LIMIT 10
      `);

      // Today's Follow-ups
      const [todayFollowups] = await pool.query(`
        SELECT l.name, lf.scheduled_at as time, lf.note 
        FROM lead_followups lf 
        JOIN leads l ON lf.lead_id = l.id 
        WHERE DATE(lf.scheduled_at) = CURDATE() AND lf.status = "pending" 
        ORDER BY lf.scheduled_at ASC
      `);

      res.json({
        kpis: {
          row1: [
            { title: 'Pending Tutors', value: pendingTutors[0].count, icon: 'mdi-account-clock', color: 'error' },
            { title: 'Pending Employers', value: pendingEmployers[0].count, icon: 'mdi-domain-plus', color: 'warning' },
            { title: 'Approved Tutors', value: totalTutors[0].count, icon: 'mdi-account-tie', color: 'primary' },
            { title: 'Approved Employers', value: totalEmployers[0].count, icon: 'mdi-domain', color: 'info' }
          ],
          row2: [
            { title: 'Monthly Revenue', value: '$' + (revenueMonth[0].total || 0).toLocaleString(), icon: 'mdi-currency-usd', color: 'success' },
            { title: 'Active Students', value: activeStudents[0].count, icon: 'mdi-school', color: 'info' },
            { title: 'Active Courses', value: activeCourses[0].count, icon: 'mdi-book-open-variant', color: 'primary' },
            { title: 'Pending Job Approvals', value: pendingJobs[0].count, icon: 'mdi-briefcase-clock', color: 'warning' },
            { title: 'Active Jobs', value: activeJobs[0].count, icon: 'mdi-briefcase-check', color: 'success' }
          ]
        },
        funnel: funnelData,
        recentEnrollments,
        todayFollowups,
        systemHealth: {
          diskUsage: 45, // Static for now
          dbStatus: 'Connected',
          redisStatus: 'Connected'
        }
      });
    } catch (error) {
      console.error('Dashboard Error:', error);
      res.status(500).json({ message: error.message });
    }
  }
};
