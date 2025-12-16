const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with valid credentials...');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

testLogin();
