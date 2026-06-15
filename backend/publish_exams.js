import { pool } from './src/db/connection.js';
pool.query("UPDATE exams SET status='published' WHERE status='draft'")
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch(console.error);
