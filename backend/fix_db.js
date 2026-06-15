import { pool } from './src/db/connection.js';

async function run() {
  const alters = [
    "ALTER TABLE exams ADD COLUMN randomize_questions BOOLEAN DEFAULT FALSE",
    "ALTER TABLE exam_attempts ADD COLUMN status ENUM('scheduled','in_progress','submitted','graded','pending_manual_review') DEFAULT 'scheduled'",
    "ALTER TABLE exam_attempts ADD COLUMN answers_json JSON",
    "ALTER TABLE exam_attempts ADD COLUMN auto_score INT DEFAULT 0",
    "ALTER TABLE exam_attempts ADD COLUMN total_marks INT DEFAULT 0",
    "ALTER TABLE exam_attempts ADD COLUMN pending_manual_review BOOLEAN DEFAULT FALSE",
    "ALTER TABLE exam_attempts ADD COLUMN exam_session_token_hash VARCHAR(255)",
    "ALTER TABLE exam_attempts ADD COLUMN session_expires_at DATETIME",
    "ALTER TABLE exam_questions ADD COLUMN order_index INT DEFAULT 0",
    "ALTER TABLE exam_questions ADD COLUMN explanation TEXT"
  ];
  for (const sql of alters) {
    try { 
      await pool.query(sql); 
      console.log('OK:', sql.substring(0,60)); 
    } catch(e) { 
      console.log('SKIP (exists):', e.message.substring(0,80)); 
    }
  }
  process.exit(0);
}
run();
