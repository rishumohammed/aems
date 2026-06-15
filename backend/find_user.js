import { pool } from './src/db/connection.js';

async function findUser() {
  const [rows] = await pool.query("SELECT id, name, role FROM users WHERE name LIKE 'John Doe%'");
  console.log('Users:', JSON.stringify(rows));
  
  if (rows.length > 0) {
    const userId = rows[0].id;
    const [courses] = await pool.query("SELECT id, title, tutor_id FROM courses WHERE tutor_id = ?", [userId]);
    console.log('Courses for user:', JSON.stringify(courses));
    
    const [quizzes] = await pool.query(`
      SELECT q.*, c.title as course_title, 
      (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as questions_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE c.tutor_id = ?
      ORDER BY q.created_at DESC
    `, [userId]);
    console.log('Quizzes returned by route query:', JSON.stringify(quizzes));
    
    if (quizzes.length > 0) {
      const quizId = quizzes[0].id;
      const [questions] = await pool.query("SELECT * FROM quiz_questions WHERE quiz_id = ?", [quizId]);
      console.log('Questions for first quiz:', JSON.stringify(questions));
    }
  }
  
  process.exit(0);
}

findUser();
