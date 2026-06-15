import axios from 'axios';

async function testFetch() {
  try {
    // 1. Login as Sophie (Student)
    console.log('Logging in as Sophie...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sophie@mail.com',
      password: 'Password@123'
    });
    const token = loginRes.data.accessToken;
    console.log('Login successful. Token:', token.substring(0, 15) + '...');

    // 2. Fetch student applications
    console.log('Fetching student applications...');
    const res = await axios.get('http://localhost:5000/api/lms/student/applications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Fetch Status:', res.status);
    console.log('Fetch Data:', JSON.stringify(res.data, null, 2));

  } catch (err) {
    console.error('Fetch Failed:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
  } finally {
    process.exit(0);
  }
}

testFetch();
