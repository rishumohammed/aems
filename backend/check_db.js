import { pool } from './src/db/connection.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

async function checkTables() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', JSON.stringify(rows));
    
    const [columns] = await pool.query('SHOW COLUMNS FROM exams');
    console.log('Exams columns:', JSON.stringify(columns));
    
    try {
      const [qColumns] = await pool.query('SHOW COLUMNS FROM quizzes');
      console.log('Quizzes columns:', JSON.stringify(qColumns));
    } catch (e) {
      console.log('Quizzes table does NOT exist');
    }

    try {
      const [qqColumns] = await pool.query('SHOW COLUMNS FROM quiz_questions');
      console.log('Quiz questions columns:', JSON.stringify(qqColumns));
    } catch (e) {
      console.log('Quiz questions table does NOT exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking tables:', error);
    process.exit(1);
  }
}

checkTables();
