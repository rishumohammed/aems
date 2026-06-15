import { pool } from '../src/db/connection.js';

async function check() {
  try {
    const [cols] = await pool.query('SHOW COLUMNS FROM courses');
    console.log(JSON.stringify(cols, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
