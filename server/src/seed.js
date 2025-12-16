
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Ticket } from './models/Ticket.js';
import QRCode from 'qrcode';

dotenv.config();

async function runSeed() {
  await connectDB();

  console.log('Seeding database with sample data...');

  // Clear old demo data (optional, safe for local dev)
  await Promise.all([User.deleteMany({}), Event.deleteMany({}), Ticket.deleteMany({})]);

  // Create demo users
  const users = [];
  
  // Create multiple sample users
  const sampleUsers = [
    {
      name: 'Demo Organizer',
      email: 'organizer@example.com',
      role: 'organizer'
    },
    {
      name: 'Demo User',
      email: 'user@example.com',
      role: 'user'
    },
    {
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      role: 'user'
    },
    {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      role: 'user'
    },
    {
      name: 'Amit Patel',
      email: 'amit@example.com',
      role: 'user'
    },
    {
      name: 'Sneha Gupta',
      email: 'sneha@example.com',
      role: 'user'
    },
    {
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      role: 'user'
    },
    {
      name: 'Kavya Reddy',
      email: 'kavya@example.com',
      role: 'user'
    },
    {
      name: 'Rohit Agarwal',
      email: 'rohit@example.com',
      role: 'user'
    },
    {
      name: 'Anjali Mehra',
      email: 'anjali@example.com',
      role: 'user'
    },
    {
      name: 'Music Lover',
      email: 'musiclover@example.com',
      role: 'user'
    },
    {
      name: 'Comedy Fan',
      email: 'comedyfan@example.com',
      role: 'user'
    }
  ];

  // Create users and hash passwords
  for (const userData of sampleUsers) {
    const user = new User(userData);
    user.passwordHash = await User.hashPassword('password123');
    await user.save();
    users.push(user);
  }

  const organizer = users.find(u => u.role === 'organizer');
  const regularUsers = users.filter(u => u.role === 'user');

  // Simple helper to generate a block of seats
  const makeSeats = (rows, seatsPerRow, basePrice) => {
    const result = [];
    for (let r = 0; r < rows; r++) {
      const rowLetter = String.fromCharCode(65 + r);
      for (let n = 1; n <= seatsPerRow; n++) {
        result.push({
          row: rowLetter,
          number: n,
          price: basePrice,
          isBooked: false
        });
      }
    }
    return result;
  };


  const now = new Date();

  // Create multiple events with seat maps
  const events = await Event.create(
    {
      title: 'Indie Rock Night',
      description: 'A night of live indie rock performances featuring local bands.',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
      venue: 'Mumbai – Bandra Amphitheatre',
      capacity: 120,
      seatMap: makeSeats(6, 20, 500),
      organizer: organizer._id
    },
    {
      title: 'Stand-up Comedy Special',
      description: 'An evening of stand-up comedy with top comics.',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 days
      venue: 'Mumbai – Lower Parel',
      capacity: 80,
      seatMap: makeSeats(4, 20, 400),
      organizer: organizer._id
    },
    {
      title: 'Classical Music Concert',
      description: 'An evening of classical music with symphony orchestra.',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
      venue: 'Mumbai – NCPA',
      capacity: 150,
      seatMap: makeSeats(10, 15, 600),
      organizer: organizer._id
    },
    {
      title: 'Food Festival',
      description: 'Taste the best cuisines from around the world.',
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // +10 days
      venue: 'Mumbai – Phoenix Market City',
      capacity: 200,
      seatMap: makeSeats(10, 20, 300),
      organizer: organizer._id
    }
  );

  console.log('Created events:', events.length);

  // Generate sample ticket purchases for users
  const tickets = [];
  
  // Helper function to generate QR payload
  const generateQRPayload = async (ticketId, eventId, userId, seats) => {
    const payload = {
      type: 'ticket',
      ticketId: ticketId.toString(),
      eventId: eventId.toString(),
      userId: userId.toString(),
      seats: seats,
      timestamp: Date.now()
    };
    return JSON.stringify(payload);
  };

  // Helper function to mark seats as booked in event seat map
  const markSeatsBooked = (event, seatList) => {
    seatList.forEach(seatInfo => {
      const seatIndex = event.seatMap.findIndex(
        seat => seat.row === seatInfo.row && seat.number === seatInfo.number
      );
      if (seatIndex !== -1) {
        event.seatMap[seatIndex].isBooked = true;
      }
    });
  };

  // Create sample tickets for different events
  for (const event of events) {
    // Get random users for this event
    const eventUsers = regularUsers.sort(() => 0.5 - Math.random()).slice(0, Math.min(5, regularUsers.length));
    
    for (const user of eventUsers) {
      // Each user buys 1-3 tickets randomly
      const numTickets = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numTickets; i++) {
        // Pick random available seats
        const availableSeats = event.seatMap.filter(seat => !seat.isBooked);
        if (availableSeats.length === 0) break;
        
        const selectedSeats = availableSeats
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(2, availableSeats.length));
        
        const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
        const qrPayload = await generateQRPayload(
          'temp', // Will be updated after save
          event._id,
          user._id,
          selectedSeats
        );
        
        // Create ticket
        const ticket = new Ticket({
          event: event._id,
          user: user._id,
          seats: selectedSeats,
          totalPrice,
          status: 'purchased',
          qrPayload: qrPayload.replace('"temp"', '"placeholder"') // Temporary placeholder
        });
        
        await ticket.save();
        
        // Update QR payload with actual ticket ID
        const actualQRPayload = await generateQRPayload(
          ticket._id,
          event._id,
          user._id,
          selectedSeats
        );
        ticket.qrPayload = actualQRPayload;
        await ticket.save();
        
        // Mark seats as booked in the event
        markSeatsBooked(event, selectedSeats);
        
        tickets.push(ticket);
      }
    }
    
    // Save updated event with booked seats
    await event.save();
  }

  console.log('Created tickets:', tickets.length);
  console.log('Sample users created:', users.length);
  console.log('Sample events created:', events.length);

  console.log('\n=== LOGIN CREDENTIALS ===');
  console.log('Organizer:', organizer.email, '/ password123');
  console.log('Users: All users use password123');
  console.log('Users list:');
  users.forEach(user => {
    console.log(`  - ${user.name}: ${user.email} (${user.role})`);
  });

  console.log('\n=== EVENTS LIST ===');
  events.forEach(event => {
    const availableSeats = event.seatMap.filter(seat => !seat.isBooked).length;
    console.log(`  - ${event.title}: ${event.capacity - availableSeats}/${event.capacity} seats booked`);
  });

  console.log('\nSeed complete!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});


