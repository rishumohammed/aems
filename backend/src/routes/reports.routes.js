import express from 'express';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Allow administrative, academic, crm, and placement staff to access reports
const isAuthorized = authorizeRoles('super_admin', 'sub_admin', 'lms_user', 'crm_agent', 'placement_coordinator', 'tutor');

// Helper: Normalize start/end dates
function getDateRange(startDate, endDate) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  return {
    start: startDate || firstDay,
    end: endDate || lastDay
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 0. Metadata for Filters (Courses, Categories, Agents, Exams)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/filters-meta', authenticateJWT, isAuthorized, async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT id, title FROM courses ORDER BY title ASC');
    const [categories] = await pool.query('SELECT id, name FROM job_categories WHERE is_active = 1 ORDER BY name ASC');
    const [agents] = await pool.query('SELECT id, name, email FROM users WHERE role IN ("crm_agent", "super_admin", "sub_admin") AND status = "active" ORDER BY name ASC');
    const [exams] = await pool.query('SELECT id, title, course_id FROM exams ORDER BY title ASC');

    res.json({
      courses,
      categories,
      agents,
      exams
    });
  } catch (err) {
    console.error('Error fetching reports filters-meta:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Student Statuses & Course Progression Report
// ─────────────────────────────────────────────────────────────────────────────
router.get('/students-courses', authenticateJWT, isAuthorized, async (req, res) => {
  try {
    const { startDate, endDate, courseId, status, search } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    // 1. Summary Metrics
    const [totalStudentsRow] = await pool.query('SELECT COUNT(DISTINCT student_id) as total FROM enrollments');
    const totalStudents = totalStudentsRow[0]?.total || 0;

    const [joinedRow] = await pool.query(
      'SELECT COUNT(*) as count FROM enrollments WHERE DATE(enrolled_at) BETWEEN ? AND ?',
      [start, end]
    );
    const joinedInPeriod = joinedRow[0]?.count || 0;

    const [completedRow] = await pool.query(
      `SELECT COUNT(*) as count FROM enrollments 
       WHERE (status = 'completed' OR completion_percentage >= 100) 
       AND (
         (completed_at IS NOT NULL AND DATE(completed_at) BETWEEN ? AND ?)
         OR (completed_at IS NULL AND DATE(enrolled_at) BETWEEN ? AND ?)
       )`,
      [start, end, start, end]
    );
    const completedInPeriod = completedRow[0]?.count || 0;

    const [ongoingRow] = await pool.query(
      "SELECT COUNT(*) as count FROM enrollments WHERE status = 'active' AND (completion_percentage < 100 OR completion_percentage IS NULL)"
    );
    const ongoingCount = ongoingRow[0]?.count || 0;

    // Passed exams in period (attempts or approved passed requests)
    const [passedExamsRow] = await pool.query(
      `SELECT COUNT(DISTINCT ea.student_id) as count 
       FROM exam_attempts ea 
       WHERE (ea.passed = 1 OR ea.passed = TRUE) 
       AND DATE(COALESCE(ea.submitted_at, ea.started_at)) BETWEEN ? AND ?`,
      [start, end]
    );
    const passedExamsInPeriod = passedExamsRow[0]?.count || 0;

    // 2. Course-wise Breakdown
    const [courseBreakdown] = await pool.query(`
      SELECT 
        c.id as course_id,
        c.title as course_title,
        COUNT(e.id) as total_enrolled,
        SUM(CASE WHEN DATE(e.enrolled_at) BETWEEN ? AND ? THEN 1 ELSE 0 END) as joined_in_period,
        SUM(CASE WHEN (e.status = 'completed' OR e.completion_percentage >= 100) THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN (e.status = 'active' AND (e.completion_percentage < 100 OR e.completion_percentage IS NULL)) THEN 1 ELSE 0 END) as ongoing_count,
        ROUND(AVG(COALESCE(e.completion_percentage, 0)), 1) as avg_progress_pct
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, c.title
      HAVING total_enrolled > 0
      ORDER BY total_enrolled DESC
    `, [start, end]);

    // 3. Detailed Students Progression List
    const { examStatus } = req.query;
    let listQuery = `
      SELECT 
        e.id as enrollment_id,
        e.student_id,
        u.name as student_name,
        u.email as student_email,
        u.phone as student_phone,
        c.id as course_id,
        c.title as course_title,
        e.enrolled_at,
        e.completed_at,
        COALESCE(e.completion_percentage, 0) as completion_percentage,
        e.status as enrollment_status,
        CASE 
          WHEN e.status = 'completed' OR e.completion_percentage >= 100 THEN 'completed'
          WHEN e.completion_percentage > 0 THEN 'ongoing'
          ELSE 'enrolled'
        END as progress_status,
        (
          SELECT r.status 
          FROM exam_readiness_requests r 
          WHERE (r.course_id = e.course_id OR (r.course_id IS NULL AND r.student_id = e.student_id)) 
            AND r.student_id = e.student_id 
          ORDER BY r.created_at DESC 
          LIMIT 1
        ) as exam_request_status,
        (
          SELECT r.admin_notes
          FROM exam_readiness_requests r 
          WHERE (r.course_id = e.course_id OR (r.course_id IS NULL AND r.student_id = e.student_id)) 
            AND r.student_id = e.student_id 
          ORDER BY r.created_at DESC 
          LIMIT 1
        ) as exam_request_notes,
        (
          SELECT COUNT(*) > 0 
          FROM exam_attempts ea 
          JOIN exams ex ON ea.exam_id = ex.id 
          WHERE ex.course_id = e.course_id AND ea.student_id = e.student_id AND (ea.passed = 1 OR ea.passed = TRUE)
        ) as has_passed_attempt,
        (
          SELECT cert_number 
          FROM certificates cert 
          WHERE cert.course_id = e.course_id AND cert.student_id = e.student_id 
          ORDER BY cert.issued_at DESC LIMIT 1
        ) as cert_number
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
    const listParams = [];

    if (courseId && courseId !== 'all') {
      listQuery += ' AND e.course_id = ?';
      listParams.push(courseId);
    }

    if (status === 'joined_this_month') {
      listQuery += ' AND DATE(e.enrolled_at) BETWEEN ? AND ?';
      listParams.push(start, end);
    } else if (status === 'completed_this_month') {
      listQuery += ' AND (e.status = "completed" OR e.completion_percentage >= 100)';
    } else if (status === 'ongoing') {
      listQuery += ' AND e.status = "active" AND (e.completion_percentage < 100 OR e.completion_percentage IS NULL)';
    }

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      listQuery += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(c.title) LIKE ?)';
      listParams.push(q, q, q);
    }

    listQuery += ' ORDER BY e.enrolled_at DESC LIMIT 500';

    const [rawStudentsList] = await pool.query(listQuery, listParams);

    // Map calculated exam_status based on readiness requests and attempts
    let studentsList = rawStudentsList.map(s => {
      let finalExamStatus = 'not_requested';
      if (s.has_passed_attempt || s.exam_request_status === 'passed' || s.exam_request_status === 'exam_passed' || s.cert_number) {
        finalExamStatus = 'passed';
      } else if (s.exam_request_status === 'need_to_attend_again' || s.exam_request_status === 'reattend') {
        finalExamStatus = 'need_to_attend_again';
      } else if (s.exam_request_status === 'scheduled') {
        finalExamStatus = 'scheduled';
      } else if (s.exam_request_status === 'approved') {
        finalExamStatus = 'approved';
      } else if (s.exam_request_status === 'pending') {
        finalExamStatus = 'pending';
      } else if (s.exam_request_status === 'rejected') {
        finalExamStatus = 'rejected';
      }

      return {
        ...s,
        exam_status: finalExamStatus,
        exam_passed: finalExamStatus === 'passed'
      };
    });

    if (examStatus && examStatus !== 'all') {
      studentsList = studentsList.filter(s => s.exam_status === examStatus);
    }

    res.json({
      summary: {
        totalStudents,
        joinedInPeriod,
        completedInPeriod,
        ongoingCount,
        passedExamsInPeriod,
        completionRate: totalStudents > 0 ? Math.round((completedInPeriod / (joinedInPeriod || totalStudents)) * 100) : 0
      },
      dateRange: { start, end },
      courseBreakdown,
      studentsList
    });
  } catch (err) {
    console.error('Error in students-courses report:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CRM & Leads Report
// ─────────────────────────────────────────────────────────────────────────────
router.get('/crm', authenticateJWT, isAuthorized, async (req, res) => {
  try {
    const { startDate, endDate, source, status, agentId, search } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    // Summary counts in date range
    const [leadsSummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted_count,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN status = 'called' THEN 1 ELSE 0 END) as called_count,
        SUM(CASE WHEN status = 'interested' THEN 1 ELSE 0 END) as interested_count,
        SUM(CASE WHEN status IN ('rejected', 'not_interested') THEN 1 ELSE 0 END) as rejected_count
      FROM leads
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [start, end]);

    const summary = leadsSummary[0] || {
      total_leads: 0,
      converted_count: 0,
      open_count: 0,
      called_count: 0,
      interested_count: 0,
      rejected_count: 0
    };

    const conversionRate = summary.total_leads > 0 
      ? Math.round((summary.converted_count / summary.total_leads) * 100) 
      : 0;

    // Status breakdown
    const [statusBreakdown] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM leads 
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY status
    `, [start, end]);

    // Source breakdown
    const [sourceBreakdown] = await pool.query(`
      SELECT source, COUNT(*) as count 
      FROM leads 
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY source
    `, [start, end]);

    // Agent performance
    const [agentPerformance] = await pool.query(`
      SELECT 
        u.id as agent_id,
        u.name as agent_name,
        COUNT(l.id) as assigned_leads,
        SUM(CASE WHEN l.status = 'converted' THEN 1 ELSE 0 END) as converted_leads,
        SUM(CASE WHEN l.status = 'interested' THEN 1 ELSE 0 END) as interested_leads,
        SUM(CASE WHEN l.status = 'called' THEN 1 ELSE 0 END) as contacted_leads,
        ROUND((SUM(CASE WHEN l.status = 'converted' THEN 1 ELSE 0 END) / COUNT(l.id)) * 100, 1) as conversion_rate_pct
      FROM users u
      JOIN leads l ON u.id = l.assigned_to
      WHERE DATE(l.created_at) BETWEEN ? AND ?
      GROUP BY u.id, u.name
      ORDER BY converted_leads DESC
    `, [start, end]);

    // Detailed Leads List
    let listQuery = `
      SELECT 
        l.id,
        l.name as lead_name,
        l.email,
        l.phone,
        l.source,
        l.status,
        l.created_at,
        c.title as interested_course,
        u.name as assigned_agent
      FROM leads l
      LEFT JOIN courses c ON l.course_interest_id = c.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE 1=1
    `;
    const listParams = [];

    if (startDate || endDate) {
      listQuery += ' AND DATE(l.created_at) BETWEEN ? AND ?';
      listParams.push(start, end);
    }
    if (source && source !== 'all') {
      listQuery += ' AND l.source = ?';
      listParams.push(source);
    }
    if (status && status !== 'all') {
      listQuery += ' AND l.status = ?';
      listParams.push(status);
    }
    if (agentId && agentId !== 'all') {
      listQuery += ' AND l.assigned_to = ?';
      listParams.push(agentId);
    }
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      listQuery += ' AND (LOWER(l.name) LIKE ? OR LOWER(l.email) LIKE ? OR LOWER(l.phone) LIKE ?)';
      listParams.push(q, q, q);
    }

    listQuery += ' ORDER BY l.created_at DESC LIMIT 500';

    const [leadsList] = await pool.query(listQuery, listParams);

    res.json({
      summary: {
        totalLeads: summary.total_leads,
        convertedCount: summary.converted_count,
        openCount: summary.open_count,
        calledCount: summary.called_count,
        interestedCount: summary.interested_count,
        rejectedCount: summary.rejected_count,
        conversionRate
      },
      dateRange: { start, end },
      statusBreakdown,
      sourceBreakdown,
      agentPerformance,
      leadsList
    });
  } catch (err) {
    console.error('Error in CRM report:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Exams & Assessments Report
// ─────────────────────────────────────────────────────────────────────────────
router.get('/exams', authenticateJWT, isAuthorized, async (req, res) => {
  try {
    const { startDate, endDate, examId, search } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    // 1. Overall Attempt Statistics in period
    const [attemptsSummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN passed = 1 OR passed = TRUE THEN 1 ELSE 0 END) as total_passed,
        SUM(CASE WHEN passed = 0 OR passed = FALSE THEN 1 ELSE 0 END) as total_failed,
        ROUND(AVG(COALESCE(score, 0)), 1) as avg_score
      FROM exam_attempts
      WHERE DATE(COALESCE(submitted_at, started_at)) BETWEEN ? AND ?
    `, [start, end]);

    const summary = attemptsSummary[0] || { total_attempts: 0, total_passed: 0, total_failed: 0, avg_score: 0 };
    const passRate = summary.total_attempts > 0 
      ? Math.round((summary.total_passed / summary.total_attempts) * 100) 
      : 0;

    // 2. Exam Readiness Requests distribution in period
    let readinessDistribution = [];
    try {
      const [rRows] = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM exam_readiness_requests 
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY status
      `, [start, end]);
      readinessDistribution = rRows;
    } catch (e) {}

    // 3. Exam-wise performance breakdown
    const [examBreakdown] = await pool.query(`
      SELECT 
        ex.id as exam_id,
        ex.title as exam_title,
        c.title as course_title,
        COUNT(ea.id) as total_attempts,
        SUM(CASE WHEN ea.passed = 1 THEN 1 ELSE 0 END) as passed_count,
        SUM(CASE WHEN ea.passed = 0 THEN 1 ELSE 0 END) as failed_count,
        ROUND((SUM(CASE WHEN ea.passed = 1 THEN 1 ELSE 0 END) / COUNT(ea.id)) * 100, 1) as pass_rate_pct,
        ROUND(AVG(COALESCE(ea.score, 0)), 1) as avg_score
      FROM exams ex
      LEFT JOIN courses c ON ex.course_id = c.id
      JOIN exam_attempts ea ON ex.id = ea.exam_id
      WHERE DATE(COALESCE(ea.submitted_at, ea.started_at)) BETWEEN ? AND ?
      GROUP BY ex.id, ex.title, c.title
      ORDER BY total_attempts DESC
    `, [start, end]);

    // 4. Granular Exam Attempts List
    let listQuery = `
      SELECT 
        ea.id as attempt_id,
        u.name as student_name,
        u.email as student_email,
        ex.title as exam_title,
        c.title as course_title,
        COALESCE(ea.submitted_at, ea.started_at) as attempt_date,
        ea.score,
        ea.total_marks,
        ea.passed,
        ea.status as attempt_status
      FROM exam_attempts ea
      JOIN users u ON ea.student_id = u.id
      JOIN exams ex ON ea.exam_id = ex.id
      LEFT JOIN courses c ON ex.course_id = c.id
      WHERE 1=1
    `;
    const listParams = [];

    if (startDate || endDate) {
      listQuery += ' AND DATE(COALESCE(ea.submitted_at, ea.started_at)) BETWEEN ? AND ?';
      listParams.push(start, end);
    }
    if (examId && examId !== 'all') {
      listQuery += ' AND ea.exam_id = ?';
      listParams.push(examId);
    }
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      listQuery += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(ex.title) LIKE ?)';
      listParams.push(q, q, q);
    }

    listQuery += ' ORDER BY COALESCE(ea.submitted_at, ea.started_at) DESC LIMIT 500';

    const [attemptsList] = await pool.query(listQuery, listParams);

    res.json({
      summary: {
        totalAttempts: summary.total_attempts,
        totalPassed: summary.total_passed,
        totalFailed: summary.total_failed,
        avgScore: summary.avg_score || 0,
        passRate
      },
      dateRange: { start, end },
      readinessDistribution,
      examBreakdown,
      attemptsList
    });
  } catch (err) {
    console.error('Error in Exams report:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Jobs & Placements Report
// ─────────────────────────────────────────────────────────────────────────────
router.get('/jobs', authenticateJWT, isAuthorized, async (req, res) => {
  try {
    const { startDate, endDate, categoryId, status, search } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    // 1. Summary Metrics
    const [jobsRow] = await pool.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'approved'");
    const totalActiveJobs = jobsRow[0]?.count || 0;

    const [appsSummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied_count,
        SUM(CASE WHEN status = 'viewed' THEN 1 ELSE 0 END) as viewed_count
      FROM job_applications
      WHERE DATE(applied_at) BETWEEN ? AND ?
    `, [start, end]);

    const appStats = appsSummary[0] || { total_applications: 0, shortlisted_count: 0, rejected_count: 0 };

    // Interviews Count
    let interviewsCount = 0;
    try {
      const [iRows] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM interviews 
        WHERE DATE(created_at) BETWEEN ? AND ?
      `, [start, end]);
      interviewsCount = iRows[0]?.count || 0;
    } catch (e) {}

    // Placed Count
    let placedCount = 0;
    try {
      const [pRows] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM job_placements 
        WHERE DATE(placed_at) BETWEEN ? AND ?
      `, [start, end]);
      placedCount = pRows[0]?.count || 0;
    } catch (e) {
      placedCount = appStats.shortlisted_count;
    }

    const placementRate = appStats.total_applications > 0 
      ? Math.round((placedCount / appStats.total_applications) * 100) 
      : 0;

    // 2. Application Status Funnel
    const [statusFunnel] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM job_applications 
      WHERE DATE(applied_at) BETWEEN ? AND ?
      GROUP BY status
    `, [start, end]);

    // 3. Top Hiring Companies
    const [topCompanies] = await pool.query(`
      SELECT 
        j.company,
        COUNT(DISTINCT j.id) as active_postings,
        COUNT(ja.id) as applications_received,
        SUM(CASE WHEN ja.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted_candidates
      FROM jobs j
      LEFT JOIN job_applications ja ON j.id = ja.job_id
      WHERE j.company IS NOT NULL AND j.company != ''
      GROUP BY j.company
      ORDER BY applications_received DESC
      LIMIT 10
    `);

    // 4. Granular Applications & Placements Table
    let listQuery = `
      SELECT 
        ja.id as application_id,
        ja.applicant_name,
        ja.applicant_email,
        ja.applicant_phone,
        ja.applied_at,
        ja.status as application_status,
        ja.experience_years,
        ja.city,
        j.title as job_title,
        j.company,
        jc.name as category_name
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      LEFT JOIN job_categories jc ON j.category = jc.id
      WHERE 1=1
    `;
    const listParams = [];

    if (startDate || endDate) {
      listQuery += ' AND DATE(ja.applied_at) BETWEEN ? AND ?';
      listParams.push(start, end);
    }
    if (categoryId && categoryId !== 'all') {
      listQuery += ' AND j.category = ?';
      listParams.push(categoryId);
    }
    if (status && status !== 'all') {
      listQuery += ' AND ja.status = ?';
      listParams.push(status);
    }
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      listQuery += ' AND (LOWER(ja.applicant_name) LIKE ? OR LOWER(ja.applicant_email) LIKE ? OR LOWER(j.title) LIKE ? OR LOWER(j.company) LIKE ?)';
      listParams.push(q, q, q, q);
    }

    listQuery += ' ORDER BY ja.applied_at DESC LIMIT 500';

    const [applicationsList] = await pool.query(listQuery, listParams);

    res.json({
      summary: {
        totalActiveJobs,
        totalApplications: appStats.total_applications,
        shortlistedCount: appStats.shortlisted_count,
        interviewsCount,
        placedCount,
        placementRate
      },
      dateRange: { start, end },
      statusFunnel,
      topCompanies,
      applicationsList
    });
  } catch (err) {
    console.error('Error in Jobs report:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
