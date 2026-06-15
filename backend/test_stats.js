import { pool } from './src/db/connection.js';

async function testStats() {
  try {
    console.log('Testing Admin Master Stats queries...');
    
    const [leadsMonth] = await pool.query('SELECT COUNT(*) as count FROM leads WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())');
    console.log('Leads Month:', leadsMonth[0].count);

    const [convertedLeads] = await pool.query('SELECT COUNT(*) as count FROM leads WHERE status = "converted"');
    console.log('Converted Leads:', convertedLeads[0].count);

    const [totalLeads] = await pool.query('SELECT COUNT(*) as count FROM leads');
    console.log('Total Leads:', totalLeads[0].count);

    const [activeStudents] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "student" AND status = "active"');
    console.log('Active Students:', activeStudents[0].count);

    const [revenueMonth] = await pool.query('SELECT SUM(amount_paid) as total FROM invoices WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())');
    console.log('Revenue Month:', revenueMonth[0].total);

    const [activeCourses] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE status = "published"');
    console.log('Active Courses:', activeCourses[0].count);

    const [totalTutors] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "tutor" AND status = "active"');
    console.log('Total Tutors:', totalTutors[0].count);

    const [pendingJobs] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "pending"');
    console.log('Pending Jobs:', pendingJobs[0].count);

    const [pendingExams] = await pool.query('SELECT COUNT(*) as count FROM exam_attempts WHERE status = "pending_manual_review"');
    console.log('Pending Exams:', pendingExams[0].count);

    console.log('All queries succeeded!');
    process.exit(0);
  } catch (error) {
    console.error('Query failed:', error);
    process.exit(1);
  }
}

testStats();
