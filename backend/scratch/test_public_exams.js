import axios from 'axios';

async function run() {
  try {
    const res1 = await axios.get('http://localhost:5000/api/admin/public-exams').catch(e => e.response);
    console.log('GET /api/admin/public-exams status:', res1 ? res1.status : 'No response');

    const res2 = await axios.get('http://localhost:5000/api/api/admin/public-exams').catch(e => e.response);
    console.log('GET /api/api/admin/public-exams status:', res2 ? res2.status : 'No response');
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

run();
