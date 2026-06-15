import { pool } from '../src/db/connection.js';

async function list() {
  try {
    const [rows] = await pool.query('SELECT id, title, tutor_id, status FROM courses');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
list();
