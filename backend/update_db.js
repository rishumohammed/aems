import { pool } from './src/db/connection.js';

async function run() {
  try {
    await pool.query(`ALTER TABLE student_guides ADD COLUMN IF NOT EXISTS greeting TEXT;`);
    console.log('Added greeting column to student_guides table');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
