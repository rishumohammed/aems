import { v4 as uuidv4 } from 'uuid';
import { pool } from './src/db/connection.js';

async function seedDemoCourse() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting Demo Course seeding...');
    await connection.beginTransaction();

    // 1. Get Student, Tutor, and Category
    const [students] = await connection.query('SELECT id FROM users WHERE email = ?', ['student@aems.local']);
    const studentId = students[0]?.id;

    const [tutors] = await connection.query('SELECT id FROM users WHERE email = ?', ['tutor@aems.local']);
    const tutorId = tutors[0]?.id;

    const [categories] = await connection.query('SELECT id FROM course_categories LIMIT 1');
    const categoryId = categories[0]?.id;

    if (!studentId || !tutorId || !categoryId) {
      throw new Error('Student, Tutor, or Category not found. Please run seed.js first.');
    }

    // 2. Create Course
    const courseId = uuidv4();
    await connection.query(
      `INSERT INTO courses (id, title, slug, description, tutor_id, category_id, status, price, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId, 
        'Mastering Vue 3 & Nuxt', 
        'mastering-vue-3-nuxt', 
        'Learn the latest frontend technologies with hands-on projects.', 
        tutorId, 
        categoryId, 
        'published', 
        99.99, 
        'intermediate'
      ]
    );

    // 3. Create Section
    const sectionId = uuidv4();
    await connection.query(
      'INSERT INTO course_sections (id, course_id, title, order_index) VALUES (?, ?, ?, ?)',
      [sectionId, courseId, 'Getting Started', 0]
    );

    // 4. Create Lessons
    const lessons = [
      { id: uuidv4(), title: 'Introduction to Vue 3', type: 'video', video_source: 'youtube', video_id: 'dQw4w9WgXcQ', duration: 300 },
      { id: uuidv4(), title: 'Composition API Basics', type: 'video', video_source: 'youtube', video_id: 'dQw4w9WgXcQ', duration: 600 },
      { id: uuidv4(), title: 'Nuxt 3 Setup', type: 'video', video_source: 'youtube', video_id: 'dQw4w9WgXcQ', duration: 450 }
    ];

    for (let i = 0; i < lessons.length; i++) {
      await connection.query(
        'INSERT INTO course_lessons (id, section_id, title, type, video_source, video_id, duration_seconds, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [lessons[i].id, sectionId, lessons[i].title, lessons[i].type, lessons[i].video_source, lessons[i].video_id, lessons[i].duration, i]
      );
    }

    // 5. Enroll Student
    const enrollmentId = uuidv4();
    await connection.query(
      'INSERT INTO enrollments (id, student_id, course_id, status, completion_percentage) VALUES (?, ?, ?, ?, ?)',
      [enrollmentId, studentId, courseId, 'active', 33]
    );

    // 6. Set Lesson Progress (First lesson completed)
    await connection.query(
      'INSERT INTO lesson_progress (id, enrollment_id, lesson_id, completed, completed_at) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), enrollmentId, lessons[0].id, true, new Date()]
    );

    await connection.commit();
    console.log('Demo Course and Enrollment seeded successfully!');
  } catch (error) {
    await connection.rollback();
    console.error('Error seeding demo course:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedDemoCourse();
