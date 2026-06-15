import { pool } from '../src/db/connection.js';

async function main() {
  try {
    const [cols] = await pool.query("DESCRIBE contact_submissions");
    console.log('Columns of contact_submissions:', cols);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
