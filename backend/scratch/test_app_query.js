import { pool } from '../src/db/connection.js';

async function testQuery() {
  try {
    const [applications] = await pool.query(`
      SELECT ja.*, j.title as job_title, j.company as job_company, j.location as job_location, j.type as job_type
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      ORDER BY ja.applied_at DESC
    `);
    console.log(JSON.stringify(applications, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

testQuery();
