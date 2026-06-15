import { pool } from '../src/db/connection.js';

async function test() {
  try {
    console.log('Testing public exams queries...');

    // 1. Fetch categories
    const [categories] = await pool.query('SELECT * FROM public_exam_categories');
    console.log('Categories count:', categories.length);
    if (categories.length === 0) throw new Error('No categories seeded!');

    // 2. Fetch published exams
    const [exams] = await pool.query(`
      SELECT e.*, c.name as category_name, c.slug as category_slug
      FROM public_exams e
      JOIN public_exam_categories c ON e.category_id = c.id
      WHERE e.status = 'published'
    `);
    console.log('Published exams count:', exams.length);
    if (exams.length === 0) throw new Error('No exams seeded!');

    // 3. Fetch questions for KEAM Mock Test
    const exam = exams.find(e => e.slug === 'keam-mock-test');
    if (!exam) throw new Error('KEAM Mock Test not found!');
    
    const [questions] = await pool.query(`
      SELECT id, question_text, type, options_json, marks, order_index
      FROM public_exam_questions
      WHERE exam_id = ?
      ORDER BY order_index ASC
    `, [exam.id]);
    console.log(`Questions in ${exam.name}:`, questions.length);
    if (questions.length === 0) throw new Error('No questions in exam!');

    // 4. Test Analytics queries
    const [totalAttemptsRow] = await pool.query('SELECT COUNT(*) as count FROM public_exam_attempts');
    const [avgScoreRow] = await pool.query('SELECT AVG(percentage) as avg_pct FROM public_exam_results');
    const [passPercentageRow] = await pool.query(`
      SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 
          ELSE 0 
        END as pass_rate 
      FROM public_exam_results
    `);
    console.log('Analytics checks:', {
      totalAttempts: totalAttemptsRow[0].count,
      averageScore: avgScoreRow[0].avg_pct,
      passPercentage: passPercentageRow[0].pass_rate
    });

    console.log('All database queries tested successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database query verification failed:', err);
    process.exit(1);
  }
}

test();
