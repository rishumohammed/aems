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

  const [t1] = await pool.query("SHOW COLUMNS FROM job_applications LIKE 'status'");
  console.log('--- job_applications status ---');
  console.log(JSON.stringify(t1, null, 2));

  process.exit(0);
}

main().catch(console.error);
