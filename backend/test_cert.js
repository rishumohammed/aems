import certificateService from './src/services/certificate.service.js';
import { pool } from './src/db/connection.js';

async function run() {
  try {
    // Make sure we have a student and a course and an attempt
    const [users] = await pool.query("SELECT id FROM users WHERE email='student@aems.local'");
    if (users.length === 0) throw new Error('Student not found');
    const studentId = users[0].id;

    // Just grab the first passed attempt, or forcefully create one if needed
    let [attempts] = await pool.query("SELECT id FROM exam_attempts WHERE passed = TRUE LIMIT 1");
    let attemptId;
    
    if (attempts.length === 0) {
      console.log('No passed attempt found. Faking one...');
      const [exams] = await pool.query("SELECT id FROM exams LIMIT 1");
      if (exams.length === 0) throw new Error('No exams found to fake attempt');
      const examId = exams[0].id;
      
      attemptId = 'test-attempt-' + Date.now();
      await pool.query(
        "INSERT INTO exam_attempts (id, exam_id, student_id, passed) VALUES (?, ?, ?, TRUE)",
        [attemptId, examId, studentId]
      );
    } else {
      attemptId = attempts[0].id;
    }

    console.log(`Generating certificate for attempt: ${attemptId}`);
    const result = await certificateService.generate(attemptId);
    console.log('Certificate generated:', result);

  } catch (err) {
    console.error('Test error:', err);
  }
  process.exit(0);
}
run();
