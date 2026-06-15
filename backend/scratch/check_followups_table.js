import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function checkFollowups() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'aems_db'
    });

    const [columns] = await connection.query('DESCRIBE lead_followups;');
    console.log('Columns:', columns.map(c => c.Field));
    
    await connection.end();
  } catch (err) {
    console.error('DB Error:', err.message);
  }
}

checkFollowups();
