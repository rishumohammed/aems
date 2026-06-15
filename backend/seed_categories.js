import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const categories = [
    { name: 'Web Development', slug: 'web-development', description: 'Full stack, frontend, and backend development.', icon: 'mdi-xml' },
    { name: 'Data Science', slug: 'data-science', description: 'Machine learning, AI, and data analysis.', icon: 'mdi-database' },
    { name: 'Digital Marketing', slug: 'digital-marketing', description: 'SEO, SEM, and social media marketing.', icon: 'mdi-bullhorn' },
    { name: 'Design', slug: 'design', description: 'UI/UX and Graphic Design.', icon: 'mdi-palette' }
  ];

  try {
    for (const cat of categories) {
      const id = uuidv4();
      await pool.query(
        'INSERT INTO course_categories (id, name, slug, description, icon) VALUES (?, ?, ?, ?, ?)',
        [id, cat.name, cat.slug, cat.description, cat.icon]
      );
      console.log(`Seeded category: ${cat.name}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
