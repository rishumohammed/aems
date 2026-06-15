import { pool } from '../src/db/connection.js';

async function checkAdmin() {
  try {
    const [users] = await pool.query('SELECT id, email, role, status FROM users WHERE email="admin@aems.local"');
    console.log('Admin user found:', JSON.stringify(users, null, 2));
    
    const [sessions] = await pool.query('SHOW TABLES LIKE "sessions"');
    console.log('Sessions table exists:', sessions.length > 0);
  } catch (err) {
    console.error('CRITICAL ERROR CHECKING DB:', err);
  } finally {
    process.exit(0);
  }
}

checkAdmin();
