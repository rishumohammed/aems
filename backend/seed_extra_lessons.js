import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const courseId = '871a8fe8-508c-4ca8-bfa1-79e324e68de8'; // Mastering Vue 3 & Nuxt
  const sectionId = '41e2572d-4082-47cd-952a-c854ea971b29'; // Getting Started

  try {
    console.log('Adding new lesson types...');
    
    // 1. PDF Lesson
    await pool.query(
      'INSERT INTO course_lessons (id, section_id, title, type, resource_url, is_free_preview, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), sectionId, 'Nuxt 3 Architecture PDF', 'resource', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true, 4]
    );

    // 2. Quiz Lesson
    // First find or create an exam
    const quizId = uuidv4();
    await pool.query(
      'INSERT INTO exams (id, course_id, title, status) VALUES (?, ?, ?, ?)',
      [quizId, courseId, 'Module 1 Quiz', 'published']
    );
    await pool.query(
      'INSERT INTO course_lessons (id, section_id, title, type, quiz_id, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), sectionId, 'Test Your Knowledge (Quiz)', 'quiz', quizId, 5]
    );

    // 3. Assignment Lesson
    const assignmentId = uuidv4();
    await pool.query(
      'INSERT INTO assignments (id, course_id, title, description) VALUES (?, ?, ?, ?)',
      [assignmentId, courseId, 'Final Project Assignment', 'Build a simple Todo App using Nuxt 3 and Pinia. Submit the Github repository URL.']
    );
    await pool.query(
      'INSERT INTO course_lessons (id, section_id, title, type, assignment_id, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), sectionId, 'Course Final Project', 'assignment', assignmentId, 6]
    );

    console.log('Successfully added PDF, Quiz, and Assignment lessons.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
