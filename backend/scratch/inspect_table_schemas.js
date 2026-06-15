import { pool } from '../src/db/connection.js';

async function inspect() {
  try {
    const [schemas] = await pool.query('SHOW CREATE TABLE job_applications');
    console.log('--- JOB APPLICATIONS SCHEMA ---');
    console.log(schemas[0]['Create Table']);
    
    const [jobsSchema] = await pool.query('SHOW CREATE TABLE jobs');
    console.log('--- JOBS SCHEMA ---');
    console.log(jobsSchema[0]['Create Table']);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

inspect();
