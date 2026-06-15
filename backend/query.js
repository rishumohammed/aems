import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [quizzes] = await pool.query('SELECT * FROM quizzes');
  const [exams] = await pool.query('SELECT * FROM exams');
  const [publicExams] = await pool.query('SELECT * FROM public_exams');
  console.log('Quizzes:', quizzes.length);
  console.log('Exams:', exams.length);
  console.log('Public Exams:', publicExams.length);
  if (quizzes.length > 0) {
    console.log('Quiz 1 course_id:', quizzes[0].course_id, typeof quizzes[0].course_id);
  }
  process.exit(0);
}
run();
