import { pool } from './src/db/connection.js';

async function run() {
  try {
    // 1. Alter Users Table
    try {
      await pool.query("ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_verification') DEFAULT 'active'");
      console.log('Altered users.status');
    } catch (e) {
      console.log('Error altering users:', e.message);
    }

    // 2. Alter Jobs Table
    try {
      await pool.query('ALTER TABLE jobs ADD COLUMN is_remote BOOLEAN DEFAULT FALSE');
      await pool.query('ALTER TABLE jobs ADD COLUMN deadline DATE');
      console.log('Altered jobs table');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns already exist in jobs');
      } else {
        console.log('Error altering jobs:', e.message);
      }
    }

    // 3. Alter Job Applications Table
    try {
      await pool.query('ALTER TABLE job_applications ADD COLUMN dob DATE');
      await pool.query('ALTER TABLE job_applications ADD COLUMN gender VARCHAR(20)');
      await pool.query('ALTER TABLE job_applications ADD COLUMN city VARCHAR(100)');
      await pool.query('ALTER TABLE job_applications ADD COLUMN linkedin VARCHAR(255)');
      console.log('Altered job_applications table');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns already exist in job_applications');
      } else {
        console.log('Error altering job_applications:', e.message);
      }
    }

  } catch (e) {
    console.error('DB Error:', e.message);
  }
  process.exit(0);
}
run();
