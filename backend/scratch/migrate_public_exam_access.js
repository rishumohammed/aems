import { pool } from '../src/db/connection.js';

async function run() {
  try {
    console.log('Running Public Exam Access Control migration...');

    // 1. Add registration_status to public_exams
    await pool.query(`
      ALTER TABLE public_exams 
      ADD COLUMN IF NOT EXISTS registration_status ENUM('open', 'closed') NOT NULL DEFAULT 'open'
    `);
    console.log('✓ Added registration_status to public_exams');

    // 2. Add login tracking columns to public_exam_candidates
    await pool.query(`
      ALTER TABLE public_exam_candidates
      ADD COLUMN IF NOT EXISTS login_count INT NOT NULL DEFAULT 0
    `);
    console.log('✓ Added login_count to public_exam_candidates');

    await pool.query(`
      ALTER TABLE public_exam_candidates
      ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL DEFAULT NULL
    `);
    console.log('✓ Added last_login_at to public_exam_candidates');

    await pool.query(`
      ALTER TABLE public_exam_candidates
      ADD COLUMN IF NOT EXISTS registration_status ENUM('pending', 'approved') NOT NULL DEFAULT 'approved'
    `);
    console.log('✓ Added registration_status to public_exam_candidates');

    // 3. Set all existing published exams to registration_status = 'open'
    await pool.query(`
      UPDATE public_exams SET registration_status = 'open' WHERE status = 'published'
    `);
    console.log('✓ Set existing published exams to registration_status = open');

    console.log('\n✅ Migration complete!');
  } catch (e) {
    console.error('Migration Error:', e.message);
  }
  process.exit(0);
}

run();
