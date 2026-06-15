import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function checkDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const [rows] = await connection.query('SHOW DATABASES;');
    console.log('Databases:', rows.map(r => r.Database));
    
    await connection.end();
  } catch (err) {
    console.error('DB Connection Error:', err.message);
  }
}

checkDb();
