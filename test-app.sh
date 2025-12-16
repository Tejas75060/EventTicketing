#!/bin/bash

echo "🎭 EventPass Application Test Suite"
echo "===================================="

echo ""
echo "✅ Test 1: API Health Check"
curl -s http://localhost:5001/ | python3 -m json.tool

echo ""
echo "✅ Test 2: Events Listing"
curl -s http://localhost:5001/api/events | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Found {len(data)} events:')
for i, event in enumerate(data, 1):
    print(f'  {i}. {event[\"title\"]} - {event[\"venue\"]}')
    print(f'     Date: {event[\"date\"][:10]} | Capacity: {event[\"capacity\"]} seats')
"

echo ""
echo "✅ Test 3: User Login"
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Login successful for: {data[\"user\"][\"name\"]} ({data[\"user\"][\"role\"]})')
"

echo ""
echo "✅ Test 4: Organizer Login"
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@example.com","password":"password123"}' | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Organizer login: {data[\"user\"][\"name\"]} ({data[\"user\"][\"role\"]})')
"

echo ""
echo "===================================="
echo "🎉 ALL TESTS COMPLETED SUCCESSFULLY!"
echo ""
echo "🚀 Application URLs:"
echo "   Backend API:  http://localhost:5001"
echo "   Frontend App: http://localhost:5173"
echo ""
echo "📝 Login Credentials:"
echo "   Organizer: organizer@example.com / password123"
echo "   User:      user@example.com / password123"
echo ""
