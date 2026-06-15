import { pool } from './src/db/connection.js';

async function test() {
  try {
    const [results] = await pool.query('SELECT attempt_id FROM public_exam_results ORDER BY created_at DESC LIMIT 1');
    if (results.length === 0) {
      console.log('No results found in DB to test.');
      process.exit(0);
    }
    const attemptId = results[0].attempt_id;
    console.log('Latest attempt_id:', attemptId);

    const [rows] = await pool.query(`
      SELECT r.*, a.answers_json
      FROM public_exam_results r
      JOIN public_exam_attempts a ON r.attempt_id = a.id
      WHERE r.attempt_id = ?
    `, [attemptId]);

    console.log('Result Row:', rows[0]);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

test();
