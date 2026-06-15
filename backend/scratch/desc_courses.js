import { pool } from '../src/db/connection.js';

async function checkSchema() {
  try {
    const [rows] = await pool.query('DESCRIBE courses;');
    console.log(rows);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkSchema();
