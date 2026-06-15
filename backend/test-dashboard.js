import { pool } from './src/db/connection.js';

async function run() {
  try {
    const queries = [
      'SELECT COUNT(*) as count FROM leads WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())',
      'SELECT COUNT(*) as count FROM leads WHERE status = "converted"',
      'SELECT COUNT(*) as count FROM leads',
      'SELECT COUNT(*) as count FROM users WHERE role = "student" AND status = "active"',
      'SELECT SUM(amount_paid) as total FROM invoices WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())',
      'SELECT COUNT(*) as count FROM courses WHERE status = "published"',
      'SELECT COUNT(*) as count FROM users WHERE role = "tutor" AND status = "active"',
      'SELECT COUNT(*) as count FROM users WHERE role = "tutor" AND status = "pending_review"',
      'SELECT COUNT(*) as count FROM users WHERE role = "employer" AND status = "active"',
      'SELECT COUNT(*) as count FROM users WHERE role = "employer" AND status = "pending_review"',
      'SELECT COUNT(*) as count FROM jobs WHERE status = "pending_approval"',
      'SELECT COUNT(*) as count FROM jobs WHERE status = "approved"',
      'SELECT COUNT(*) as count FROM exam_attempts WHERE status = "pending_manual_review"',
      'SELECT status, COUNT(*) as count FROM leads GROUP BY status',
      `SELECT u.name, c.title as course, i.created_at as date, i.amount_paid as amount FROM invoices i JOIN users u ON i.student_id = u.id LEFT JOIN courses c ON i.course_id = c.id ORDER BY i.created_at DESC LIMIT 10`,
      `SELECT l.name, lf.scheduled_at as time, lf.note FROM lead_followups lf JOIN leads l ON lf.lead_id = l.id WHERE DATE(lf.scheduled_at) = CURDATE() AND lf.status = "pending" ORDER BY lf.scheduled_at ASC`
    ];
    for (let q of queries) {
      console.log('Running:', q);
      await pool.query(q);
    }
    console.log('All OK');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
run();
