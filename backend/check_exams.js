import { pool } from './src/db/connection.js';
Promise.all([
  pool.query('SELECT * FROM exams'),
  pool.query('SELECT * FROM enrollments')
]).then(([exams, enrollments]) => {
  console.log('Exams:', exams[0]);
  console.log('Enrollments:', enrollments[0]);
  process.exit(0);
}).catch(console.error);
