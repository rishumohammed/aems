import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aems',
  multipleStatements: true,
});

const migrationFile = join(__dirname, '../src/db/migrations/042_courses_approval_columns.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

// Split on semicolons, filter blank lines/comments
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function runMigration() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Running migration 042_courses_approval_columns...\n');
    for (const stmt of statements) {
      try {
        await conn.query(stmt);
        console.log(`  ✅ OK: ${stmt.substring(0, 80).replace(/\n/g, ' ')}...`);
      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
        console.error(`     Statement: ${stmt.substring(0, 100)}`);
      }
    }
    console.log('\n✅ Migration complete!');
  } finally {
    conn.release();
    await pool.end();
  }
}

runMigration();
