const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aems'
  });

  const [result] = await connection.execute("UPDATE public_exam_candidates SET registration_status = 'approved' WHERE registration_status = 'pending'");
  console.log(`Updated ${result.affectedRows} candidates to approved.`);
  await connection.end();
}

fix().catch(console.error);
