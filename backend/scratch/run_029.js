import { pool } from '../src/db/connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const sqlFile = path.join(__dirname, '../src/db/migrations/029_system_users.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  const statements = sql.split(';').filter(stmt => stmt.trim());
  
  for (const stmt of statements) {
    try {
      console.log('Running:', stmt.slice(0, 50) + '...');
      await pool.query(stmt);
      console.log('Success');
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
  process.exit(0);
}

run();
