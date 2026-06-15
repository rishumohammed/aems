import { pool } from './src/db/connection.js';

async function runFix() {
  try {
    console.log('Adding approval_status and rejected_at to employer_profiles...');
    await pool.query(`
      ALTER TABLE employer_profiles 
      ADD COLUMN approval_status ENUM('pending_approval', 'approved', 'rejected', 'suspended', 'inactive') DEFAULT 'pending_approval' AFTER employer_role,
      ADD COLUMN rejected_at TIMESTAMP NULL AFTER approved_at;
    `);
    
    console.log('Updating statuses...');
    await pool.query(`
      UPDATE employer_profiles ep
      JOIN users u ON ep.user_id = u.id
      SET ep.approval_status = 'approved'
      WHERE u.status = 'active';
    `);
    await pool.query(`
      UPDATE employer_profiles ep
      JOIN users u ON ep.user_id = u.id
      SET ep.approval_status = 'pending_approval'
      WHERE u.status = 'pending';
    `);

    console.log('Done.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}
runFix();
