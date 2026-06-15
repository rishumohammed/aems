import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aems',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const [rows] = await pool.query('DESCRIBE job_interviews');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch(console.error);
