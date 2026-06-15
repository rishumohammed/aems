import axios from 'axios';

async function testLiveEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  console.log(`Sending test requests to live server at ${baseURL}...`);

  try {
    // 1. Get categories
    const resCategories = await axios.get(`${baseURL}/public/exams/categories`);
    console.log('GET /public/exams/categories - SUCCESS. Categories found:', resCategories.data.length);
    if (!Array.isArray(resCategories.data) || resCategories.data.length === 0) {
      throw new Error('Categories list is empty or not an array');
    }

    // 2. Get exams
    const resExams = await axios.get(`${baseURL}/public/exams`);
    console.log('GET /public/exams - SUCCESS. Exams found:', resExams.data.length);
    if (!Array.isArray(resExams.data) || resExams.data.length === 0) {
      throw new Error('Exams list is empty or not an array');
    }

    // 3. Get exam detail by slug
    const examSlug = 'keam-mock-test';
    const resExamDetail = await axios.get(`${baseURL}/public/exams/${examSlug}`);
    console.log(`GET /public/exams/${examSlug} - SUCCESS. Exam ID:`, resExamDetail.data.id);
    if (resExamDetail.data.slug !== examSlug) {
      throw new Error(`Expected slug ${examSlug}, got ${resExamDetail.data.slug}`);
    }

    console.log('All live endpoints verified and working correctly!');
    process.exit(0);
  } catch (err) {
    console.error('HTTP endpoint verification failed:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  }
}

testLiveEndpoints();
