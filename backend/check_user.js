import { pool } from './src/db/connection.js';

async function checkUser() {
  try {
    const [users] = await pool.query('SELECT id, email, role, status FROM users WHERE email="smith@aems.local"');
    console.log('User found:', users);
  } catch (err) {
    console.error('Error checking user:', err);
  } finally {
    process.exit(0);
  }
}

checkUser();
