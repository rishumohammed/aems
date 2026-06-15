import { pool } from './src/db/connection.js';
import fs from 'fs';

async function run() {
  try {
    const sql = fs.readFileSync('./src/db/migrations/030_mandatory_lessons.sql', 'utf8');
    await pool.query(sql);
    console.log('Migration 030 applied successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column is_mandatory already exists');
    } else {
      console.error('Error applying migration:', error);
    }
  }
  process.exit(0);
}
run();
