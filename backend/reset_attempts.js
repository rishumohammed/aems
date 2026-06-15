import { pool } from './src/db/connection.js';

async function run() {
  await pool.query("DELETE FROM exam_attempts WHERE student_id = (SELECT id FROM users WHERE email='student@aems.local')");
  console.log('Deleted attempts');
  process.exit(0);
}
run();
