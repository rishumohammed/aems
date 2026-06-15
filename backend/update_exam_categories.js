import { pool } from './src/db/connection.js';

const newCategories = [
  { name: 'Talent Exams', slug: 'talent-exams', icon: 'mdi-star' },
  { name: 'Scholarship Exams', slug: 'scholarship-exams', icon: 'mdi-school' },
  { name: 'Skill Assessments', slug: 'skill-assessments', icon: 'mdi-brain' },
  { name: 'Career Readiness', slug: 'career-readiness', icon: 'mdi-briefcase' },
  { name: 'Placement Tests', slug: 'placement-tests', icon: 'mdi-office-building' },
  { name: 'Certification Exams', slug: 'certification-exams', icon: 'mdi-certificate' }
];

async function update() {
  try {
    console.log('Clearing existing public exam categories...');
    await pool.query('DELETE FROM public_exam_categories');

    console.log('Inserting new categories...');
    for (const cat of newCategories) {
      // Use UUID() or just standard insert if it auto-increments. Let's check table schema.
      // But we can just use INSERT. We'll use UUID() for id if it's char(36).
      await pool.query(
        'INSERT INTO public_exam_categories (id, name, slug) VALUES (UUID(), ?, ?)',
        [cat.name, cat.slug]
      );
    }
    console.log('Categories updated successfully!');
  } catch (error) {
    console.error('Error updating categories:', error);
  } finally {
    process.exit(0);
  }
}

update();
