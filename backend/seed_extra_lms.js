import { v4 as uuidv4 } from 'uuid';
import { pool } from './src/db/connection.js';

async function seedLmsContent() {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT id FROM users WHERE email = ?', ['student@aems.local']);
    if (users.length === 0) return;
    const userId = users[0].id;

    const [courses] = await connection.query('SELECT id FROM courses LIMIT 2');
    if (courses.length === 0) return;
    const courseId = courses[0].id;

    // 1. Seed Assignments
    const assignmentId = uuidv4();
    await connection.query(`
      INSERT INTO assignments (id, course_id, title, description, due_date)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `, [assignmentId, courseId, 'Final Project: Build a SaaS Dashboard', 'Create a production-level dashboard using Vue 3 and Vuetify.', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    // 2. Seed Job Applications
    const jobId = uuidv4();
    await connection.query(`
      INSERT IGNORE INTO job_categories (id, name, slug) VALUES (?, 'Development', 'development')
    `, [uuidv4()]);
    
    const [cat] = await connection.query('SELECT id FROM job_categories LIMIT 1');
    const catId = cat[0].id;

    await connection.query(`
      INSERT INTO jobs (id, title, company, category, location, type, salary_range, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `, [jobId, 'Frontend Developer', 'Tech Corp', catId, 'Remote', 'full_time', '12-18 LPA', 'approved']);

    await connection.query(`
      INSERT INTO job_applications (id, job_id, student_id, status)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status)
    `, [uuidv4(), jobId, userId, 'applied']);

    // 3. Seed Exams
    const examId = uuidv4();
    await connection.query(`
      INSERT INTO exams (id, course_id, title, duration_minutes, status)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title = VALUES(title)
    `, [examId, courseId, 'Vue 3 Certification Exam', 45, 'published']);

    console.log('Extra LMS content seeded');
  } catch (err) {
    console.error(err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedLmsContent();
