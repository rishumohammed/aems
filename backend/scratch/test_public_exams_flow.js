import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

const token = jwt.sign(
  { id: 'admin-test-id', email: 'admin@aems.local', role: 'super_admin' },
  process.env.JWT_ACCESS_SECRET || 'aems_access_secret_link_123_change_me',
  { expiresIn: '15m' }
);

const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    Authorization: `Bearer ${token}`
  }
});

async function run() {
  console.log('Starting Public Exams Flow Integration Test...\n');
  let categoryId = '';
  let examId = '';
  let duplicateExamId = '';
  let attemptId = '';
  let resultId = '';

  try {
    // 1. Create Category
    console.log('1. Creating Category...');
    const catRes = await client.post('/admin/public-exams/categories', {
      name: 'Integration Test Cat',
      description: 'Temporary category for E2E tests',
      status: 'active'
    });
    categoryId = catRes.data.id;
    console.log(`Category created. ID: ${categoryId}`);

    // 2. Fetch Categories
    console.log('2. Listing Categories...');
    const catsList = await client.get('/admin/public-exams/categories');
    const hasCat = catsList.data.some(c => c.id === categoryId);
    console.log(`Category is listed in admin: ${hasCat}`);

    // 3. Create Public Exam (Draft)
    console.log('3. Creating Public Exam (Draft)...');
    const examRes = await client.post('/admin/public-exams', {
      name: 'Integration Mock Exam',
      category_id: categoryId,
      slug: `integration-mock-exam-${Date.now()}`,
      duration_minutes: 30,
      pass_percentage: 50,
      status: 'draft',
      randomize_questions: false,
      enable_certificate: true,
      anonymous_access: true,
      require_name: false
    });
    examId = examRes.data.id;
    console.log(`Exam created. ID: ${examId}`);

    // 4. Add MCQ Question to Exam
    console.log('4. Adding Question...');
    const qRes = await client.post(`/admin/public-exams/${examId}/questions`, {
      question_text: 'What is 5 + 5?',
      type: 'mcq',
      options: ['8', '10', '12'],
      correct_answer: '10',
      explanation: '5 + 5 equals 10',
      marks: 5,
      difficulty_level: 'Easy'
    });
    console.log('Question added successfully.');

    // 5. Bulk Import Questions (JSON)
    console.log('5. Bulk Importing Questions...');
    await client.post(`/admin/public-exams/${examId}/questions/bulk`, {
      questions: [
        {
          question_text: 'Which of these is a programming language?',
          type: 'mcq',
          options: ['HTML', 'JavaScript', 'CSS'],
          correct_answer: 'JavaScript',
          explanation: 'JavaScript is a full programming language.',
          marks: 5,
          difficulty_level: 'Medium'
        },
        {
          question_text: 'Is the earth flat?',
          type: 'truefalse',
          options: ['True', 'False'],
          correct_answer: 'False',
          explanation: 'Earth is an oblate spheroid.',
          marks: 5,
          difficulty_level: 'Easy'
        }
      ]
    });
    console.log('Bulk import of 2 questions completed.');

    // 6. Verify questions count
    console.log('6. Checking Questions Count...');
    const questionsRes = await client.get(`/admin/public-exams/${examId}/questions`);
    console.log(`Questions count in DB: ${questionsRes.data.length} (Expected: 3)`);

    // 7. Publish the Exam
    console.log('7. Publishing Exam...');
    await client.put(`/admin/public-exams/${examId}`, { status: 'published' });
    console.log('Exam published.');

    // 8. Load Exam publicly (without authorization header)
    console.log('8. Loading Exam Publicly...');
    const publicClient = axios.create({ baseURL: 'http://localhost:5000/api' });
    const publicExams = await publicClient.get('/public/exams');
    const publicMatch = publicExams.data.find(e => e.id === examId);
    console.log(`Exam found in public listing: ${!!publicMatch}`);

    // 9. Start Attempt
    console.log('9. Starting Guest Attempt...');
    const attemptRes = await publicClient.post(`/public/exams/${examId}/attempt`, {
      is_anonymous: true
    });
    attemptId = attemptRes.data.attempt_id;
    console.log(`Attempt started. Attempt ID: ${attemptId}. Name: ${attemptRes.data.guest_name}`);

    // 10. Submit Attempt (Score 10/15 -> 66.67%)
    console.log('10. Submitting Attempt...');
    const submitRes = await publicClient.post(`/public/exams/attempts/${attemptId}/submit`, {
      answers: [
        { question_id: questionsRes.data[0].id, answer: '10' }, // Correct (5 marks)
        { question_id: questionsRes.data[1].id, answer: 'JavaScript' }, // Correct (5 marks)
        { question_id: questionsRes.data[2].id, answer: 'True' } // Incorrect (0 marks)
      ]
    });
    resultId = submitRes.data.result_id;
    console.log(`Attempt submitted. Score: ${submitRes.data.score}/${submitRes.data.percentage}%. Passed: ${submitRes.data.passed}`);

    // 11. View post-exam results
    console.log('11. Fetching Post-exam Scorecard...');
    const scorecard = await publicClient.get(`/public/exams/attempts/${attemptId}/result`);
    console.log(`Result Exam Name: ${scorecard.data.exam_name}, Passed: ${scorecard.data.passed}`);

    // 12. List Guest attempts inside Admin
    console.log('12. Listing Attempts inside Admin Dashboard...');
    const adminAttempts = await client.get('/admin/public-exams/attempts');
    const matchedAttempt = adminAttempts.data.attempts.find(a => a.attempt_id === attemptId);
    console.log(`Attempt listed in admin table: ${!!matchedAttempt}`);

    // 13. Fetch Analytics
    console.log('13. Checking Analytics stats...');
    const analytics = await client.get('/admin/public-exams/analytics');
    console.log(`Total Attempts in Analytics: ${analytics.data.totalAttempts}`);
    console.log(`Average Score in Analytics: ${analytics.data.averageScore}%`);

    // 14. Duplicate Exam
    console.log('14. Duplicating Exam...');
    const dupRes = await client.post(`/admin/public-exams/${examId}/duplicate`);
    duplicateExamId = dupRes.data.id;
    console.log(`Exam duplicated successfully. Duplicate ID: ${duplicateExamId}`);

    // 15. Clean up - Delete duplicate exam, original attempt, original exam, and category
    console.log('\nCleaning up integration test data...');
    if (duplicateExamId) {
      await client.delete(`/admin/public-exams/${duplicateExamId}`);
      console.log('Duplicated exam deleted.');
    }
    if (attemptId) {
      await client.delete(`/admin/public-exams/attempts/${attemptId}`);
      console.log('Attempt record deleted.');
    }
    if (examId) {
      await client.delete(`/admin/public-exams/${examId}`);
      console.log('Original exam deleted.');
    }
    if (categoryId) {
      await client.delete(`/admin/public-exams/categories/${categoryId}`);
      console.log('Category deleted.');
    }

    console.log('\nIntegration Test Completed Successfully! 🎉');
  } catch (error) {
    console.error('\nIntegration Test Failed ❌');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data));
    } else {
      console.error(error.message);
    }

    // Attempt partial cleanup
    console.log('\nExecuting fallback cleanup...');
    try {
      if (duplicateExamId) await client.delete(`/admin/public-exams/${duplicateExamId}`);
      if (attemptId) await client.delete(`/admin/public-exams/attempts/${attemptId}`);
      if (examId) await client.delete(`/admin/public-exams/${examId}`);
      if (categoryId) await client.delete(`/admin/public-exams/categories/${categoryId}`);
      console.log('Fallback cleanup successful.');
    } catch (cleanupErr) {
      console.error('Failed to cleanup data:', cleanupErr.message);
    }
  }
}

run();
