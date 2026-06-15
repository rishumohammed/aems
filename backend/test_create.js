import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function testCreate() {
  const title = 'Test Quiz';
  const course_id = null; // Let's try with null first
  const time_limit = 30;
  const passing_score = 80;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const quizId = uuidv4();
    console.log('Inserting quiz with ID:', quizId);
    
    await connection.query(
      'INSERT INTO quizzes (id, course_id, title, time_limit, passing_score) VALUES (?, ?, ?, ?, ?)',
      [quizId, course_id, title, time_limit, passing_score]
    );
    
    await connection.commit();
    console.log('Quiz created successfully!');
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating quiz:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

testCreate();
