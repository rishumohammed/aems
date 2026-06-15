const axios = require('axios');

async function testRegistration() {
  try {
    const res = await axios.post('http://localhost:3000/api/public/exams/aems-talent-hunt-2026/register', {
      name: 'Test User',
      email: 'testuser' + Date.now() + '@example.com',
      phone: '1234567890',
      password: 'password123',
      country: 'India',
      state: 'Kerala',
      city: 'Kochi',
      agreed_to_terms: true
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testRegistration();
