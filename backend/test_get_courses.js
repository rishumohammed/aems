import { pool } from './src/db/connection.js';

async function testGetCourses() {
  const userId = 'fb6aa611-e213-4de5-bc99-948d1b717694'; // John Doe
  
  const [courses] = await pool.query("SELECT id, title, tutor_id FROM courses WHERE tutor_id = ?", [userId]);
  
  console.log('Courses for John Doe:', JSON.stringify(courses));
  process.exit(0);
}

testGetCourses();
