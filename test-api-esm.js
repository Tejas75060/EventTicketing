import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testAPI() {
  try {
    console.log('Testing EventPass API...\n');
    
    // Test 1: Health check
    console.log('1. Testing health check...');
    const health = await axios.get('http://localhost:5001/');
    console.log('✅ Health check passed:', health.data.message);
    
    // Test 2: User login
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user@example.com',
      password: 'password123'
    }, {
      withCredentials: true
    });
    console.log('✅ Login successful for user:', loginResponse.data.user.name);
    
    // Test 3: Get events
    console.log('\n3. Testing events API...');
    const eventsResponse = await axios.get(`${API_BASE}/events`);
    console.log(`✅ Found ${eventsResponse.data.length} events`);
    console.log('Events:', eventsResponse.data.map(e => e.title).join(', '));
    
    // Test 4: Organizer login
    console.log('\n4. Testing organizer login...');
    const orgLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'organizer@example.com',
      password: 'password123'
    }, {
      withCredentials: true
    });
    console.log('✅ Login successful for organizer:', orgLoginResponse.data.user.name);
    
    console.log('\n🎉 All API tests passed! The application is working properly.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();
