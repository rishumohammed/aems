import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    console.log('Seeding Public Exams...');

    // Clear existing public exams to avoid duplication on re-run
    await pool.query('DELETE FROM public_exams');

    const engineeringCatId = 'ee111111-1111-1111-1111-111111111111';
    const upscCatId = 'up666666-6666-6666-6666-666666666666';

    // 1. KEAM Mock Test
    const keamExamId = uuidv4();
    await pool.query(`
      INSERT INTO public_exams (id, name, category_id, description, syllabus, duration_minutes, total_questions, total_marks, passing_marks, difficulty_level, status, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      keamExamId,
      'KEAM Mock Test',
      engineeringCatId,
      'A comprehensive mock test for KEAM (Kerala Engineering Architecture Medical) Entrance Examination aspirants, covering core Physics and Chemistry topics.',
      'Physics: Mechanics, Thermodynamics, Waves, Electromagnetism. Chemistry: Basic concepts, Chemical Bonding, Organic Chemistry.',
      60, // 60 mins
      5,  // 5 questions
      20, // 20 marks
      10, // 10 passing
      'Medium',
      'published',
      'keam-mock-test'
    ]);

    const keamQuestions = [
      {
        id: uuidv4(),
        question_text: 'What is the relation between linear velocity (v) and angular velocity (w) of a rotating body of radius (r)?',
        type: 'mcq',
        options: JSON.stringify(['v = w * r', 'w = v * r', 'v = w / r', 'v = w + r']),
        correct_answer: 'v = w * r',
        explanation: 'For a body rotating in a circle of radius r, the linear velocity v is the product of the angular velocity w and the radius r. Thus, v = w * r.',
        marks: 4,
        order_index: 1
      },
      {
        id: uuidv4(),
        question_text: 'Which of the following are vector quantities? (Select all correct options)',
        type: 'msq',
        options: JSON.stringify(['Velocity', 'Acceleration', 'Mass', 'Force']),
        correct_answer: JSON.stringify(['Velocity', 'Acceleration', 'Force']),
        explanation: 'Velocity, Acceleration, and Force have both magnitude and direction, hence they are vector quantities. Mass has only magnitude and is a scalar.',
        marks: 4,
        order_index: 2
      },
      {
        id: uuidv4(),
        question_text: 'The value of acceleration due to gravity (g) is maximum at the poles of the Earth.',
        type: 'truefalse',
        options: JSON.stringify(['True', 'False']),
        correct_answer: 'True',
        explanation: 'True. The Earth is slightly flattened at the poles (polar radius is less than equatorial radius) and centrifugal force due to Earth rotation is zero at poles. Hence g is maximum at the poles.',
        marks: 4,
        order_index: 3
      },
      {
        id: uuidv4(),
        question_text: 'The SI unit of electric current is _________.',
        type: 'fib',
        options: null,
        correct_answer: 'Ampere',
        explanation: 'The SI unit of electric current is Ampere, represented by the symbol A.',
        marks: 4,
        order_index: 4
      },
      {
        id: uuidv4(),
        question_text: 'In a semiconductor, the electrical conductivity increases with the increase of:',
        type: 'mcq',
        options: JSON.stringify(['Temperature', 'Pressure', 'Voltage', 'None of these']),
        correct_answer: 'Temperature',
        explanation: 'As temperature increases, more covalent bonds break, creating more free electrons and holes, thereby increasing the electrical conductivity of semiconductors.',
        marks: 4,
        order_index: 5
      }
    ];

    for (const q of keamQuestions) {
      await pool.query(`
        INSERT INTO public_exam_questions (id, exam_id, question_text, type, options_json, correct_answer, explanation, marks, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [q.id, keamExamId, q.question_text, q.type, q.options, q.correct_answer, q.explanation, q.marks, q.order_index]);
    }
    console.log('Seeded: KEAM Mock Test');

    // 2. UPSC Prelims Practice
    const upscExamId = uuidv4();
    await pool.query(`
      INSERT INTO public_exams (id, name, category_id, description, syllabus, duration_minutes, total_questions, total_marks, passing_marks, difficulty_level, status, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      upscExamId,
      'UPSC Prelims Practice',
      upscCatId,
      'Practice test for Civil Services Examination (UPSC) GS Paper 1. Focuses on Indian Polity and History.',
      'Indian Polity, Constitution of India, Historical Underpinnings, Fundamental Rights, Elections.',
      60,
      4,
      16,
      8,
      'Hard',
      'published',
      'upsc-prelims-practice'
    ]);

    const upscQuestions = [
      {
        id: uuidv4(),
        question_text: 'Who is widely known as the Father of the Indian Constitution?',
        type: 'mcq',
        options: JSON.stringify(['Dr. B.R. Ambedkar', 'Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel']),
        correct_answer: 'Dr. B.R. Ambedkar',
        explanation: 'Dr. Bhimrao Ramji Ambedkar was the Chairman of the Drafting Committee of the Constituent Assembly and is considered the Father of the Indian Constitution.',
        marks: 4,
        order_index: 1
      },
      {
        id: uuidv4(),
        question_text: 'Which of the following are Fundamental Rights guaranteed by the Constitution of India?',
        type: 'msq',
        options: JSON.stringify(['Right to Equality', 'Right to Freedom', 'Right to Property', 'Right to Education']),
        correct_answer: JSON.stringify(['Right to Equality', 'Right to Freedom', 'Right to Education']),
        explanation: 'Right to Property was deleted from the list of Fundamental Rights by the 44th Amendment Act, 1978. Right to Education was added via the 86th Amendment Act, 2002.',
        marks: 4,
        order_index: 2
      },
      {
        id: uuidv4(),
        question_text: 'The President of India is elected by a direct vote of the citizens of India.',
        type: 'truefalse',
        options: JSON.stringify(['True', 'False']),
        correct_answer: 'False',
        explanation: 'False. The President of India is elected indirectly by an electoral college consisting of the elected members of both Houses of Parliament and Legislative Assemblies of States.',
        marks: 4,
        order_index: 3
      },
      {
        id: uuidv4(),
        question_text: 'The first general election in independent India was held in the year ______.',
        type: 'fib',
        options: null,
        correct_answer: '1951',
        explanation: 'The first general elections in India were held between October 1951 and February 1952, usually referred to as the 1951 general elections.',
        marks: 4,
        order_index: 4
      }
    ];

    for (const q of upscQuestions) {
      await pool.query(`
        INSERT INTO public_exam_questions (id, exam_id, question_text, type, options_json, correct_answer, explanation, marks, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [q.id, upscExamId, q.question_text, q.type, q.options, q.correct_answer, q.explanation, q.marks, q.order_index]);
    }
    console.log('Seeded: UPSC Prelims Practice');

    console.log('Public Exams Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Public Exams Seeding failed:', err);
    process.exit(1);
  }
}

seed();
