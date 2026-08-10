import { pool } from './src/db/connection.js';
async function run() {
  try {
    await pool.execute(`INSERT IGNORE INTO system_config (\`key\`, \`value\`, \`group\`, \`description\`, \`is_sensitive\`) VALUES 
      ('course_show_rating', 'true', 'branding', 'Show rating stars on course cards', 0),
      ('course_show_students', 'true', 'branding', 'Show student count on course cards', 0)`);
    console.log('Success');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
