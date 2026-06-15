import { pool } from './src/db/connection.js';

async function run() {
  try {
    const [rows] = await pool.query("SELECT id, name, role FROM users WHERE email = 'admin@aems.local'");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
