import { pool } from '../src/db/connection.js';

async function migrate() {
  try {
    console.log('Adding approval fields to courses table...');
    await pool.query(`
      ALTER TABLE courses 
      ADD COLUMN published_at TIMESTAMP NULL,
      ADD COLUMN approved_by CHAR(36) NULL,
      ADD COLUMN approval_required BOOLEAN DEFAULT TRUE;
    `);
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
      process.exit(0);
    } else {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}
migrate();
