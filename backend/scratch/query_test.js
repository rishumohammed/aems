import { pool } from '../src/db/connection.js';

async function test() {
  try {
    console.log('Connecting to mysql using connection.js pool...');
    const [rows] = await pool.query('SELECT * FROM exam_attempts');
    console.log('Successfully connected! Total attempts in DB:', rows.length);
    console.log(rows);
  } catch (err) {
    console.error('Connection failed:', err);
  }
  process.exit(0);
}

test();
