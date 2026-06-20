import { pool } from './src/db/connection.js';

async function test() {
  try {
    await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "approved"');
    await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "employer" AND status = "active"');
    await pool.query('SELECT COUNT(*) as count FROM job_applications');
    await pool.query('SELECT COUNT(*) as count FROM job_interviews WHERE status = "scheduled"');
    await pool.query(`
        SELECT ja.id, u.name as applicant_name, j.title as job_title, ja.status, ja.applied_at as created_at 
        FROM job_applications ja
        JOIN users u ON ja.student_id = u.id
        JOIN jobs j ON ja.job_id = j.id
        ORDER BY ja.applied_at DESC LIMIT 10
      `);
    await pool.query('SELECT status, COUNT(*) as count FROM job_applications GROUP BY status');
    console.log('Placement dashboard queries: OK');
  } catch(e) {
    console.error('Placement queries error:', e.message);
  }

  try {
    await pool.query('SELECT COUNT(*) as count FROM courses WHERE status = "published"');
    await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "student" AND status = "active"');
    await pool.query('SELECT COUNT(*) as count FROM course_qa WHERE status IN ("open", "pending_review")');
    await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "tutor" AND status = "active"');
    await pool.query(`
        SELECT u.id as student_id, u.name, c.title as course, i.created_at as date, i.amount_paid as amount 
        FROM invoices i 
        JOIN users u ON i.student_id = u.id 
        LEFT JOIN courses c ON i.course_id = c.id 
        ORDER BY i.created_at DESC LIMIT 10
      `);
    await pool.query(`
        SELECT le.title, le.scheduled_at, u.name as host_name 
        FROM live_events le
        JOIN users u ON le.host_id = u.id
        WHERE le.scheduled_at > NOW() AND le.status != 'cancelled'
        ORDER BY le.scheduled_at ASC LIMIT 5
      `);
    await pool.query(`
        SELECT DATE_FORMAT(enrolled_at, '%Y-%m') as month, COUNT(*) as count 
        FROM enrollments 
        WHERE enrolled_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month ORDER BY month ASC
      `);
    console.log('LMS dashboard queries: OK');
  } catch(e) {
    console.error('LMS queries error:', e.message);
  }

  pool.end();
}

test();
