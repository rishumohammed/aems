import { pool } from '../src/db/connection.js';

async function inspect() {
  try {
    const [jobs] = await pool.query('SELECT id, title, company, posted_by, status FROM jobs');
    console.log('--- JOBS ---');
    console.log(JSON.stringify(jobs, null, 2));

    const [applications] = await pool.query('SELECT * FROM job_applications');
    console.log('--- JOB APPLICATIONS ---');
    console.log(JSON.stringify(applications, null, 2));
    
    const [users] = await pool.query("SELECT id, name, email, role FROM users WHERE role IN ('student', 'employer')");
    console.log('--- USERS (Student & Employer) ---');
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

inspect();
