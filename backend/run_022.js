import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'src/db/migrations/022_employer_approval_workflow.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons for multiple statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        console.log('Executing:', stmt.substring(0, 100) + '...');
        await pool.query(stmt);
      }
    }
    console.log('Migration 022 completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();
