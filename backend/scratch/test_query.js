import { pool } from '../src/db/connection.js';

async function testQuery() {
  try {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             (SELECT JSON_ARRAYAGG(c.title) FROM invoices i JOIN courses c ON i.course_id = c.id WHERE i.student_id = u.id) as enrolled_courses,
             0 as avg_progress
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC LIMIT 25 OFFSET 0
    `;
    const [students] = await pool.query(query);
    console.log('STUDENTS:', JSON.stringify(students, null, 2));
    
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE role = 'student'`);
    console.log('TOTAL:', total);
  } catch (err) {
    console.error('QUERY ERROR:', err);
  } finally {
    process.exit(0);
  }
}

testQuery();
