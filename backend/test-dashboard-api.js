import axios from 'axios';

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@aems.local',
      password: 'Admin@1234'
    });
    const token = loginRes.data.accessToken;
    console.log('Login successful');

    const dashRes = await axios.get('http://localhost:5000/api/dashboard/admin-master', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Dashboard Data:', JSON.stringify(dashRes.data).substring(0, 100));
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
}
run();
