import { pool } from './src/db/connection.js';

async function checkSchema() {
  try {
    const [rows] = await pool.query('SHOW COLUMNS FROM users WHERE Field = "role"');
    console.log('ROLE COLUMN:', rows[0].Type);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkSchema();
