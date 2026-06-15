import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'src', 'db', 'migrations', '029_notifications_update.sql'), 'utf-8');
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    for (let stmt of statements) {
      console.log('Executing:', stmt.trim());
      await pool.query(stmt);
    }
    console.log('Migration 029 applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration 029 failed:', err);
    process.exit(1);
  }
}

run();
