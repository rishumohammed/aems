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

  const [cols] = await pool.query("SHOW COLUMNS FROM exams");
  console.log('--- exams columns ---');
  console.log(cols.map(c => `${c.Field}: ${c.Type}`).join('\n'));

  const [cols2] = await pool.query("SHOW COLUMNS FROM proctoring_events");
  console.log('\n--- proctoring_events columns ---');
  console.log(cols2.map(c => `${c.Field}: ${c.Type}`).join('\n'));

  process.exit(0);
}

main().catch(console.error);
