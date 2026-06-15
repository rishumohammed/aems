import { pool } from '../src/db/connection.js';

async function check() {
  try {
    const [rows] = await pool.query('SELECT * FROM public_exams');
    console.log('Public Exams in DB:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    process.exit(0);
  }
}

check();
