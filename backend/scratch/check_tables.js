import { pool } from '../src/db/connection.js';

async function checkInvoices() {
  try {
    const tablesToCheck = ['invoices', 'assignments', 'assignment_submissions', 'jobs', 'job_applications', 'exams', 'users', 'tutor_profiles'];
    
    for (const table of tablesToCheck) {
        const [rows] = await pool.query(`SHOW TABLES LIKE '${table}'`);
        const exists = rows.length > 0;
        console.log(`${table.toUpperCase()} EXISTS:`, exists);
        
        if (exists) {
            const [data] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table.toUpperCase()} COUNT:`, data[0].count);
        }
        console.log('---');
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

checkInvoices();
