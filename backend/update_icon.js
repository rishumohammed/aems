import { pool } from './src/db/connection.js';
pool.query("UPDATE course_categories SET icon = 'mdi-translate' WHERE slug = 'language'")
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch(console.error);
