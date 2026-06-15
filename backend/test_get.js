import { pool } from './src/db/connection.js';

async function testGetQuizzes() {
  const userId = 'fb6aa611-e213-4de5-bc99-948d1b717694'; // John Doe
  
  const [quizzes] = await pool.query(`
    SELECT q.*, c.title as course_title, 
    (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as questions_count
    FROM quizzes q
    JOIN courses c ON q.course_id = c.id
    WHERE c.tutor_id = ?
    ORDER BY q.created_at DESC
  `, [userId]);
  
  console.log('Quizzes for John Doe:', JSON.stringify(quizzes));
  process.exit(0);
}

testGetQuizzes();
