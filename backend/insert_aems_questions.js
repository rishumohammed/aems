import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seedQuestions() {
  try {
    const [exams] = await pool.query("SELECT id FROM public_exams WHERE slug = 'aems-talent-hunt-2026'");
    if (exams.length === 0) {
      console.log('Exam not found');
      process.exit(1);
    }
    const examId = exams[0].id;

    // Check if questions already exist
    const [existing] = await pool.query('SELECT COUNT(*) as cnt FROM public_exam_questions WHERE exam_id = ?', [examId]);
    if (existing[0].cnt > 0) {
      console.log('Questions already exist for this exam.');
      process.exit(0);
    }

    const questions = [
      {
        question_text: 'What is the next number in the sequence? 2, 4, 8, 16, ...',
        type: 'mcq',
        options_json: JSON.stringify(['24', '32', '64', '20']),
        correct_answer: '32',
        explanation: 'Each number is multiplied by 2.',
        marks: 5,
        order_index: 1
      },
      {
        question_text: 'Which of the following is NOT a programming language?',
        type: 'mcq',
        options_json: JSON.stringify(['Python', 'Java', 'HTML', 'C++']),
        correct_answer: 'HTML',
        explanation: 'HTML is a markup language, not a programming language.',
        marks: 5,
        order_index: 2
      },
      {
        question_text: 'A car travels 60 miles in 1.5 hours. What is its average speed in miles per hour?',
        type: 'mcq',
        options_json: JSON.stringify(['30', '40', '50', '60']),
        correct_answer: '40',
        explanation: 'Speed = Distance / Time = 60 / 1.5 = 40 mph.',
        marks: 5,
        order_index: 3
      },
      {
        question_text: 'Identify the synonyms of "Eloquent". (Select all that apply)',
        type: 'msq',
        options_json: JSON.stringify(['Articulate', 'Fluent', 'Inarticulate', 'Hesitant']),
        correct_answer: JSON.stringify(['Articulate', 'Fluent']),
        explanation: 'Eloquent means fluent or persuasive in speaking or writing.',
        marks: 5,
        order_index: 4
      },
      {
        question_text: 'The sun rises in the west.',
        type: 'truefalse',
        options_json: JSON.stringify(['True', 'False']),
        correct_answer: 'False',
        explanation: 'The sun rises in the east.',
        marks: 5,
        order_index: 5
      }
    ];

    for (const q of questions) {
      await pool.query(`
        INSERT INTO public_exam_questions (id, exam_id, question_text, type, options_json, correct_answer, explanation, marks, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [uuidv4(), examId, q.question_text, q.type, q.options_json, q.correct_answer, q.explanation, q.marks, q.order_index]);
    }

    // Update the total questions and total marks in the exam
    await pool.query('UPDATE public_exams SET total_questions = 5, total_marks = 25, passing_marks = 10 WHERE id = ?', [examId]);

    console.log('Successfully inserted 5 sample questions for AEMS Talent Hunt 2026!');
  } catch (e) {
    console.error('Error inserting questions:', e);
  } finally {
    process.exit(0);
  }
}

seedQuestions();
