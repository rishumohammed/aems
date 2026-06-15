import { pool } from '../src/db/connection.js';

async function checkUsers() {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role, status FROM users");
    console.log('ALL USERS:', JSON.stringify(rows, null, 2));
    
    const [students] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    console.log('STUDENT COUNT:', students[0].count);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

checkUsers();
