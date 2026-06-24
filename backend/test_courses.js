import { pool } from './src/db/connection.js';
(async () => {
  const [courses] = await pool.query('SELECT c.*, u.name as tutor_name, cat.name as category_name FROM courses c LEFT JOIN users u ON c.tutor_id = u.id LEFT JOIN course_categories cat ON c.category_id = cat.id WHERE c.status = "published" AND c.course_type = "recorded"');
  console.log('Total returned:', courses.length);
  if (courses.length) console.log(courses[0].title);
  process.exit(0);
})();
