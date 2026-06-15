import { pool } from '../src/db/connection.js';

async function run() {
  try {
    console.log('Modifying public_exams.status ENUM choices...');
    await pool.query("ALTER TABLE public_exams MODIFY COLUMN status ENUM('draft', 'review', 'published', 'archived') DEFAULT 'draft'");
    console.log('ENUM successfully updated!');
    process.exit(0);
  } catch (error) {
    console.error('Altering column failed:', error);
    process.exit(1);
  }
}

run();
