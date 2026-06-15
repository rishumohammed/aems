import bcrypt from 'bcryptjs';
import { pool } from '../src/db/connection.js';

async function update() {
  try {
    const hashedPassword = await bcrypt.hash('Password@123', 10);
    
    // Update sophie@mail.com
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, 'sophie@mail.com']);
    console.log('Updated sophie@mail.com password to Password@123');

    // Update Sandra@mail.com
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, 'Sandra@mail.com']);
    console.log('Updated Sandra@mail.com password to Password@123');

    // Update Jenkins@mail.com
    await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, 'Jenkins@mail.com']);
    console.log('Updated Jenkins@mail.com password to Password@123');

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit(0);
  }
}

update();
