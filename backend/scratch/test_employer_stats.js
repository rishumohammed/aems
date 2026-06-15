import axios from 'axios';

async function testFetch() {
  try {
    // 1. Login as Jenkins (Employer)
    console.log('Logging in as Jenkins...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'Jenkins@mail.com',
      password: 'Password@123'
    });
    const token = loginRes.data.accessToken;
    console.log('Login successful. Token:', token.substring(0, 15) + '...');

    // 2. Fetch stats
    console.log('Fetching stats...');
    const res = await axios.get('http://localhost:5000/api/employers/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Stats Status:', res.status);
    console.log('Stats Data:', JSON.stringify(res.data, null, 2));

  } catch (err) {
    console.error('Fetch Stats Failed:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
  } finally {
    process.exit(0);
  }
}

testFetch();
