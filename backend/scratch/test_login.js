import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@aems.local',
      password: 'Admin@1234'
    });
    console.log('Login Success:', res.data.user.name);
    console.log('Token Received:', res.data.accessToken.substring(0, 10) + '...');
  } catch (err) {
    console.error('Login Failed:', err.response?.data || err.message);
  }
}

testLogin();
