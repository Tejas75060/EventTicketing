#!/usr/bin/env node

// Comprehensive test of the EventPass application
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

console.log('🎭 EventPass Application Test Suite\n');
console.log('=' .repeat(50));

async function runTests() {
  try {
    // Test 1: Health Check
    console.log('\n✅ Test 1: API Health Check');
    const health = await axios.get('http://localhost:5001/');
    console.log(`   Status: ${health.data.status}`);
    console.log(`   Message: ${health.data.message}`);

    // Test 2: Events API
    console.log('\n✅ Test 2: Events Listing');
    const events = await axios.get(`${API_BASE}/events`);
    console.log(`   Found ${events.data.length} events:`);
    events.data.forEach((event, i) => {
      console.log(`   ${i + 1}. ${event.title} - ${event.venue}`);
      console.log(`      Date: ${new Date(event.date).toLocaleDateString()}`);
      console.log(`      Capacity: ${event.capacity} seats`);
    });

    // Test 3: User Authentication
    console.log('\n✅ Test 3: User Authentication');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user@example.com',
      password: 'password123'
    }, { withCredentials: true });
    console.log(`   Login successful for: ${loginResponse.data.user.name}`);
    console.log(`   Role: ${loginResponse.data.user.role}`);

    // Test 4: User Tickets
    console.log('\n✅ Test 4: User Tickets API');
    const tickets = await axios.get(`${API_BASE}/tickets/mine`, {
      withCredentials: true
    });
    console.log(`   User has ${tickets.data.length} tickets`);

    // Test 5: Organizer Authentication
    console.log('\n✅ Test 5: Organizer Authentication');
    const orgLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'organizer@example.com',
      password: 'password123'
    }, { withCredentials: true });
    console.log(`   Organizer login: ${orgLoginResponse.data.user.name}`);

    // Test 6: Ticket Statistics
    if (events.data.length > 0) {
      console.log('\n✅ Test 6: Ticket Statistics');
      const stats = await axios.get(`${API_BASE}/tickets/stats/${events.data[0]._id}`, {
        withCredentials: true
      });
      console.log(`   Event: ${events.data[0].title}`);
      console.log(`   Total tickets: ${stats.data.totalTickets}`);
      console.log(`   Sold tickets: ${stats.data.soldCount}`);
      console.log(`   Revenue: $${stats.data.totalRevenue}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED! The application is fully functional.\n');
    
    console.log('🚀 Application URLs:');
    console.log('   Backend API:  http://localhost:5001');
    console.log('   Frontend App: http://localhost:5173');
    console.log('\n📝 Login Credentials:');
    console.log('   Organizer: organizer@example.com / password123');
    console.log('   User:      user@example.com / password123');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

runTests();
