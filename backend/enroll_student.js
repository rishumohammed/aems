import { pool } from './src/db/connection.js';

async function run() {
  const studentId = 'e2cd8f01-f252-47ba-89a1-8dcb4c1e4cba'; // From DB or let's look it up
  const [u] = await pool.query("SELECT id FROM users WHERE email='student@aems.local'");
  if (!u.length) { console.log('no student'); process.exit(1); }
  const uid = u[0].id;

  const [c] = await pool.query("SELECT id FROM courses LIMIT 1");
  if (!c.length) { console.log('no course'); process.exit(1); }
  const cid = c[0].id;

  await pool.query("INSERT INTO enrollments (id, student_id, course_id, status) VALUES ('12345', ?, ?, 'completed') ON DUPLICATE KEY UPDATE status='completed'", [uid, cid]);
  console.log('Enrolled student', uid, 'in course', cid);
  process.exit(0);
}
run();
