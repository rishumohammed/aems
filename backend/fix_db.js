import { pool } from './src/db/connection.js';

async function fixDb() {
  try {
    console.log('Altering table ENUM...');
    await pool.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('super_admin','crm_agent','tutor','student','employer','visitor','sub_admin','placement_coordinator','finance_staff','exam_manager','support_staff','lms_user')
    `);
    
    console.log('Updating lmsuser@gmail.com...');
    await pool.query(`
      UPDATE users SET role = 'lms_user' WHERE email = 'lmsuser@gmail.com'
    `);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

fixDb();
