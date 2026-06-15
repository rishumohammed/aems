import { pool } from './src/db/connection.js';

async function run() {
  const [rows] = await pool.query(
    `SELECT c.*, co.title as course_title, u.name as student_name, cfg.institution_name, cfg.logo_url 
     FROM certificates c 
     JOIN courses co ON c.course_id = co.id 
     JOIN users u ON c.student_id = u.id 
     CROSS JOIN cert_template_config cfg 
     WHERE cfg.id = 1 AND c.cert_number = 'AEMS-2026-1JXEIY'`
  );
  console.log(rows);
  process.exit(0);
}
run();
