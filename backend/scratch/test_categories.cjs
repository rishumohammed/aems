const { pool } = require('./src/db/connection.js');

async function test() {
  try {
    // Check if the column exists
    const [rows] = await pool.query('SHOW COLUMNS FROM student_profiles LIKE "preferred_job_categories"');
    if (rows.length === 0) {
      console.error('Column preferred_job_categories is missing');
      process.exit(1);
    }
    console.log('Column exists:', rows[0].Field);

    console.log('Success');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

test();
