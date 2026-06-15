import { pool } from '../src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function setupTestData() {
  try {
    const studentId = 'test-student-id-999';
    const email = 'student_test_completion@example.com';
    const courseId = 'test-course-id-999';
    const sectionId = 'test-section-id-999';
    const lesson1Id = 'test-lesson-id-1';
    const lesson2Id = 'test-lesson-id-2';
    const enrollmentId = 'test-enrollment-id-999';

    // 1. Clean up old data
    await pool.query('DELETE FROM users WHERE id = ?', [studentId]);
    await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);
    
    // 2. Create student
    const passwordHash = await bcrypt.hash('password123', 10);
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [studentId, 'Test Student', email, passwordHash, 'student']
    );

    // 3. Create course
    await pool.query(
      'INSERT INTO courses (id, title, slug, description, status) VALUES (?, ?, ?, ?, ?)',
      [courseId, 'Test Completion Course', 'test-completion-course', 'A test course', 'published']
    );

    // 4. Create section & lessons
    await pool.query(
      'INSERT INTO course_sections (id, course_id, title, order_index) VALUES (?, ?, ?, ?)',
      [sectionId, courseId, 'Section 1', 0]
    );

    await pool.query(
      'INSERT INTO course_lessons (id, section_id, title, type, content_html, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [lesson1Id, sectionId, 'Lesson 1', 'text', '<p>Lesson 1 content</p>', 0]
    );

    await pool.query(
      'INSERT INTO course_lessons (id, section_id, title, type, content_html, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [lesson2Id, sectionId, 'Lesson 2', 'text', '<p>Lesson 2 content</p>', 1]
    );

    // 5. Create Enrollment (50% complete)
    await pool.query(
      "INSERT INTO enrollments (id, student_id, course_id, status, completion_percentage) VALUES (?, ?, ?, 'active', 50)",
      [enrollmentId, studentId, courseId]
    );

    // 6. Complete Lesson 1
    await pool.query(
      'INSERT INTO lesson_progress (id, enrollment_id, lesson_id, completed, completed_at) VALUES (?, ?, ?, 1, NOW())',
      [uuidv4(), enrollmentId, lesson1Id]
    );

    console.log('Test data set up successfully.');
    console.log(`Student Email: ${email}`);
    console.log(`Student Password: password123`);
    console.log(`Course URL: /learn/test-completion-course/${lesson2Id}`);
    
    process.exit(0);
  } catch(err) {
    console.error('Failed to setup test data:', err);
    process.exit(1);
  }
}

setupTestData();
