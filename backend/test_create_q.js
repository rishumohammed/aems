import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function testCreateWithQuestions() {
  const title = 'Test Quiz with Questions';
  const course_id = '981c027e-4207-49ab-91ef-7462a82861a4'; 
  const time_limit = 30;
  const passing_score = 80;
  const questions = [
    { text: 'What is Vue?', options: ['Library', 'Framework'], correct_index: 1 }
  ];
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const quizId = uuidv4();
    
    await connection.query(
      'INSERT INTO quizzes (id, course_id, title, time_limit, passing_score) VALUES (?, ?, ?, ?, ?)',
      [quizId, course_id, title, time_limit, passing_score]
    );
    
    for (const q of questions) {
      await connection.query(
        'INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_index) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), quizId, q.text, JSON.stringify(q.options), q.correct_index]
      );
    }
    
    await connection.commit();
    console.log('Quiz and questions created successfully!');
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating quiz:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

testCreateWithQuestions();
