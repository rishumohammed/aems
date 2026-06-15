import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seedAemsExam() {
  try {
    // get a valid category
    const [cats] = await pool.query("SELECT id FROM public_exam_categories WHERE status = 'active' LIMIT 1");
    if (cats.length === 0) {
      console.log('No active categories found!');
      process.exit(1);
    }
    const categoryId = cats[0].id;

    // insert exam
    const examId = uuidv4();
    await pool.query(`
      INSERT INTO public_exams (id, name, category_id, description, syllabus, duration_minutes, total_questions, total_marks, passing_marks, difficulty_level, status, slug, randomize_questions, randomize_options, anonymous_access, enable_certificate)
      VALUES (?, 'AEMS Talent Hunt 2026', ?, 'General aptitude, logical reasoning, communication skills, and problem solving.', 'General topics testing speed, accuracy, and foundational knowledge of the subject.', 60, 20, 100, 40, 'Medium', 'published', 'aems-talent-hunt-2026', true, true, true, true)
    `, [examId, categoryId]);

    console.log('Successfully inserted AEMS exam:', examId);
  } catch (e) {
    console.error('Error inserting exam:', e);
  } finally {
    process.exit(0);
  }
}

seedAemsExam();
