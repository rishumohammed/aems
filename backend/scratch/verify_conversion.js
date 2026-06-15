import { pool } from '../src/db/connection.js';

async function verify() {
  try {
    const [leads] = await pool.query('SELECT * FROM leads WHERE name = ?', ['Test Lead']);
    console.log('LEAD STATUS:', leads[0]?.status);
    
    const [users] = await pool.query('SELECT * FROM users WHERE name = ?', ['Test Lead']);
    if (users[0]) {
      console.log('USER ROLE:', users[0].role);
      const [enrollments] = await pool.query('SELECT * FROM enrollments WHERE student_id = ?', [users[0].id]);
      console.log('ENROLLMENTS:', enrollments.length);
      if (enrollments.length > 0) {
          const [course] = await pool.query('SELECT title FROM courses WHERE id = ?', [enrollments[0].course_id]);
          console.log('ENROLLED COURSE:', course[0]?.title);
      }
    } else {
      console.log('USER NOT FOUND');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

verify();
