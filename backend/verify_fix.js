import { pool } from './src/db/connection.js';

async function verifyFixes() {
  const userId = 'fb6aa611-e213-4de5-bc99-948d1b717694'; // John Doe
  
  console.log('--- Verifying Single Quiz Fetch with Questions ---');
  // Use one of the existing quiz IDs
  const [quizzes] = await pool.query("SELECT id FROM quizzes LIMIT 1");
  if (quizzes.length > 0) {
    const quizId = quizzes[0].id;
    const [qData] = await pool.query("SELECT q.*, c.title as course_title FROM quizzes q LEFT JOIN courses c ON q.course_id = c.id WHERE q.id = ?", [quizId]);
    const [questions] = await pool.query("SELECT * FROM quiz_questions WHERE quiz_id = ?", [quizId]);
    
    console.log('Quiz Metadata:', JSON.stringify(qData[0]));
    console.log('Questions count:', questions.length);
    if (questions.length > 0) {
        console.log('First Question:', JSON.stringify(questions[0]));
    }
  }

  console.log('\n--- Verifying Earnings Export Query ---');
  const [transactions] = await pool.query(`
    SELECT u.name as student_name, c.title as course_title, e.enrolled_at as date, c.price as amount
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    JOIN courses c ON e.course_id = c.id
    WHERE c.tutor_id = ? AND c.price_type = 'fixed'
  `, [userId]);
  console.log('Transactions found for export:', transactions.length);

  process.exit(0);
}

verifyFixes();
