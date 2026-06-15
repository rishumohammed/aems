import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function checkUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'aems_db'
    });

    const [users] = await connection.query('SELECT id, email, role, status FROM users WHERE email = ?', ['admin@aems.local']);
    console.log('User:', users[0] || 'NOT FOUND');
    
    await connection.end();
  } catch (err) {
    console.error('DB Error:', err.message);
  }
}

checkUser();
