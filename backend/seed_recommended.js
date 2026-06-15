import { v4 as uuidv4 } from 'uuid';
import { pool } from './src/db/connection.js';

async function seedRecommendedCourse() {
  const connection = await pool.getConnection();
  try {
    const [cats] = await connection.query('SELECT id FROM course_categories LIMIT 1');
    if (cats.length === 0) return;
    const catId = cats[0].id;

    const [tutors] = await connection.query('SELECT id FROM users WHERE role = ?', ['tutor']);
    const tutorId = tutors.length > 0 ? tutors[0].id : null;

    const id = uuidv4();
    await connection.query(`
      INSERT INTO courses (id, title, slug, description, category_id, tutor_id, status, price, price_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, 
      'Advanced React Patterns', 
      'advanced-react-patterns', 
      'Master design patterns and performance optimization in React.', 
      catId, 
      tutorId, 
      'published', 
      4999.00, 
      'fixed'
    ]);

    console.log('Recommended course seeded');
  } catch (err) {
    console.error(err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedRecommendedCourse();
