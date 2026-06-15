import { pool } from '../src/db/connection.js';

async function run() {
  try {
    const courseId = '981c027e-4207-49ab-91ef-7462a82861a4'; // Web development
    
    // Simulate what Multer / req.body gets:
    const data = {
      title: 'Web development',
      slug: 'web-development',
      description: '<p>Learn web development from scratch.</p>',
      short_description: 'Learn HTML, CSS, JS',
      category_id: '871a8fe8-508c-4ca8-bfa1-79e324e68de8', // Web Dev category
      level: 'beginner',
      language: 'English',
      price_type: 'fixed',
      price: '0.00',
      intro_video_source: 'null', // serialized null from frontend FormData
      intro_video_id: 'null'       // serialized null from frontend FormData
    };
    
    const fields = ['title', 'slug', 'description', 'short_description', 'category_id', 'level', 'language', 'price_type', 'price', 'intro_video_source', 'intro_video_id'];
    let updateStr = fields.filter(f => data[f] !== undefined).map(f => `${f} = ?`).join(', ');
    let values = fields.filter(f => data[f] !== undefined).map(f => data[f]);
    
    console.log('Running query with values:', values);
    const [result] = await pool.query(`UPDATE courses SET ${updateStr} WHERE id = ?`, [...values, courseId]);
    console.log('Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL DB ERROR DURING UPDATE:', err);
    process.exit(1);
  }
}

run();
