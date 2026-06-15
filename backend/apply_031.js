import { pool } from './src/db/connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
  try {
    const sqlPath = path.join(__dirname, 'src/db/migrations/031_temporary_passwords.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Simple split by semicolon. Since this is just one statement, it's fine.
    await pool.query(sql);
    console.log('Migration 031 applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

applyMigration();
