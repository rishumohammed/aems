import { pool } from './src/db/connection.js';
import fs from 'fs';
import path from 'path';

const migrationPath = './src/db/migrations/013_registration_system.sql';
const sql = fs.readFileSync(migrationPath, 'utf8');

async function run() {
  const statements = sql.split(';').filter(s => s.trim());
  for (let statement of statements) {
    try {
      console.log(`Running: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    } catch (err) {
      console.warn(`Warning/Error: ${err.message}`);
    }
  }
  process.exit(0);
}

run();
