import { pool } from './src/db/connection.js';

async function checkEnrollments() {
  try {
    const [users] = await pool.query('SELECT id, email FROM users WHERE email = ?', ['student@aems.local']);
    if (users.length === 0) {
      console.log('Student not found');
      return;
    }
    const userId = users[0].id;
    console.log('Student ID:', userId);

    const [enrollments] = await pool.query('SELECT * FROM enrollments WHERE student_id = ?', [userId]);
    console.log('Enrollments found:', enrollments.length);
    console.log(enrollments);

    const [courses] = await pool.query('SELECT * FROM courses');
    console.log('Total courses in DB:', courses.length);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkEnrollments();
