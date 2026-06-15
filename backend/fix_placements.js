import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function fixPlacements() {
  try {
    const [applications] = await pool.query(
      `SELECT ja.id as application_id, ja.student_id, j.id as job_id, j.title as job_title, u.name as company_name, u.id as employer_id
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       JOIN users u ON j.posted_by = u.id
       WHERE ja.status = 'selected'`
    );

    console.log(`Found ${applications.length} selected applications.`);

    for (const app of applications) {
      const [existing] = await pool.query('SELECT id FROM job_placements WHERE application_id = ?', [app.application_id]);
      if (existing.length === 0) {
        console.log(`Fixing placement for application: ${app.application_id}`);
        const placementId = uuidv4();
        await pool.query(
          `INSERT INTO job_placements (id, student_id, employer_id, job_id, application_id, selection_date, status)
           VALUES (?, ?, ?, ?, ?, NOW(), 'Pending Offer')`,
          [placementId, app.student_id, app.employer_id, app.job_id, app.application_id]
        );
      } else {
        console.log(`Placement already exists for application: ${app.application_id}`);
      }
    }
    
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixPlacements();
