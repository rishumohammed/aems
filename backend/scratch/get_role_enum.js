import { pool } from './src/db/connection.js';
pool.query("SHOW COLUMNS FROM users LIKE 'role'")
  .then(([rows]) => console.log(rows[0].Type))
  .catch(console.error)
  .finally(() => process.exit(0));
