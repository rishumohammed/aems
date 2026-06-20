import { pool } from './src/db/connection.js';

async function checkUsers() {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, status FROM users WHERE email LIKE "%lmsuser%" OR email LIKE "%crmuser%"');
    console.log('USERS IN DB:', users);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkUsers();
