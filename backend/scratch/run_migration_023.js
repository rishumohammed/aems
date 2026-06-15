import mysql from 'mysql2/promise';
import fs from 'fs';

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aems',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });

  const sql = fs.readFileSync('c:/App/NEW LMS/aems/backend/src/db/migrations/023_interview_workflow_updates.sql', 'utf8');
  await pool.query(sql);
  console.log('Migration 023 applied successfully.');

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
