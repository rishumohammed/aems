// Quick DB query tool
import { pool } from '../src/db/connection.js';

const query = process.argv[2];
if (!query) {
  console.log('Usage: node db_query.js "SELECT ..."');
  process.exit(1);
}

try {
  const [rows] = await pool.query(query);
  console.log(JSON.stringify(rows, null, 2));
} catch (err) {
  console.error('DB ERROR:', err.message);
} finally {
  process.exit(0);
}
