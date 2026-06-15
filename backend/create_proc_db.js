import { pool } from './src/db/connection.js';

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proctoring_events (
        id CHAR(36) PRIMARY KEY,
        attempt_id CHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL,
        metadata_json JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
      )
    `);
    console.log('proctoring_events table created');
  } catch (e) {
    console.error('DB Error:', e.message);
  }
  process.exit(0);
}
run();
