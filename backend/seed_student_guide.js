import { v4 as uuidv4 } from 'uuid';
import { pool } from './src/db/connection.js';

async function seedStudentGuide() {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT id FROM users WHERE email = ?', ['student@aems.local']);
    if (users.length === 0) return;
    const userId = users[0].id;

    await connection.query(`
      INSERT INTO student_guides (id, student_id, base_character, custom_name, visual_style, avatar_url, greeting)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        base_character = VALUES(base_character),
        custom_name = VALUES(custom_name),
        visual_style = VALUES(visual_style),
        avatar_url = VALUES(avatar_url),
        greeting = VALUES(greeting)
    `, [
      uuidv4(), 
      userId, 
      'sherlock', 
      'Sherlock', 
      'holographic', 
      'https://api.dicebear.com/7.x/bottts/svg?seed=Sherlock&backgroundColor=c0aede',
      'Data! Data! Data! I cannot make bricks without clay. Let us begin our investigation into this course.'
    ]);

    console.log('Student guide seeded');
  } catch (err) {
    console.error(err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedStudentGuide();
