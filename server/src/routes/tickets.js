import express from 'express';
import QRCode from 'qrcode';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Event } from '../models/Event.js';
import { Ticket } from '../models/Ticket.js';

const router = express.Router();


// Purchase tickets (single or group)
router.post('/purchase', requireAuth, async (req, res, next) => {
  try {
    const { eventId, seats } = req.body;
    console.log('Purchase request received:', { eventId, seats, userId: req.user.id });
    
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('Event not found:', eventId);
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('Event found:', { 
      eventId: event._id, 
      seatMapLength: event.seatMap?.length,
      firstSeat: event.seatMap?.[0] 
    });

    if (!Array.isArray(seats) || seats.length === 0) {
      console.log('Invalid seats data:', { seats, isArray: Array.isArray(seats) });
      return res.status(400).json({ message: 'No seats selected' });
    }



    // Basic capacity check (advanced: check in DB transaction)
    const availableSeats = event.seatMap.filter((s) => !s.isBooked);
    
    console.log('Available seats count:', availableSeats.length);
    console.log('Requested seats:', seats);
    console.log('First few available seats:', availableSeats.slice(0, 3));
    
    const isSeatAvailable = (seat) => {
      // Ensure seat has required properties
      if (!seat || typeof seat.row === 'undefined' || typeof seat.number === 'undefined') {
        console.log('Invalid seat object:', seat);
        return false;
      }
      
      const available = availableSeats.some((s) => {
        const rowMatch = s.row === seat.row;
        const numberMatch = s.number === seat.number || s.number === Number(seat.number);
        const detailedMatch = rowMatch && numberMatch;
        
        if (detailedMatch) {
          console.log('Found matching seat:', { s, seat });
        }
        
        return detailedMatch;
      });
      
      console.log('Seat availability check:', { 
        seat, 
        available,
        availableSeatsCount: availableSeats.length 
      });
      
      return available;
    };

    // Validate each seat before checking availability
    for (const seat of seats) {
      if (!seat || typeof seat.row === 'undefined' || typeof seat.number === 'undefined') {
        console.log('Invalid seat in request:', seat);
        return res.status(400).json({ message: 'Invalid seat data in request' });
      }
    }

    if (!seats.every(isSeatAvailable)) {
      console.log('Some seats not available');
      return res.status(400).json({ message: 'One or more seats are not available' });
    }


    const selectedSeatDocs = event.seatMap.filter((s) =>
      seats.some((seat) => seat.row === s.row && seat.number === s.number)
    );

    // Calculate total price with validation to prevent NaN
    const totalPrice = selectedSeatDocs.reduce((sum, s) => {
      const price = Number(s.price);
      return isNaN(price) ? sum : sum + price;
    }, 0);

    if (totalPrice === 0) {
      return res.status(400).json({ message: 'Invalid seat prices detected' });
    }

    const payload = {
      type: 'ticket',
      userId: req.user.id,
      eventId: event._id.toString(),
      seats: selectedSeatDocs.map((s) => ({ row: s.row, number: s.number })),
      iat: Date.now()
    };

    const qrPayload = JSON.stringify(payload);
    const qrDataUrl = await QRCode.toDataURL(qrPayload);

    const ticket = await Ticket.create({
      event: event._id,
      user: req.user.id,
      seats: selectedSeatDocs.map((s) => ({
        row: s.row,
        number: s.number,
        price: s.price
      })),
      totalPrice,
      qrPayload
    });

    // Mark seats as booked
    event.seatMap.forEach((s) => {
      if (selectedSeatDocs.some((sel) => sel.row === s.row && sel.number === s.number)) {
        s.isBooked = true;
      }
    });
    await event.save();

    res.status(201).json({
      ticketId: ticket._id,
      qrDataUrl,
      totalPrice,
      seats: ticket.seats
    });
  } catch (err) {
    next(err);
  }
});

// Get user tickets
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).populate('event');
    res.json(tickets);
  } catch (err) {
    next(err);
  }
});

// Refund ticket before event date
router.post('/:id/refund', requireAuth, async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user.id }).populate(
      'event'
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.status !== 'purchased') {
      return res.status(400).json({ message: 'Ticket cannot be refunded' });
    }
    if (new Date(ticket.event.date) <= new Date()) {
      return res.status(400).json({ message: 'Event already started/finished' });
    }

    ticket.status = 'refunded';
    await ticket.save();

    // Free seats
    const event = await Event.findById(ticket.event._id);
    event.seatMap.forEach((s) => {
      if (ticket.seats.some((seat) => seat.row === s.row && seat.number === s.number)) {
        s.isBooked = false;
      }
    });
    await event.save();

    res.json({ message: 'Ticket refunded' });
  } catch (err) {
    next(err);
  }
});

// Organizer: validate ticket at entry
router.post('/validate', requireAuth, requireRole('organizer'), async (req, res, next) => {
  try {
    const { qrPayload } = req.body;
    if (!qrPayload) return res.status(400).json({ message: 'Missing qrPayload' });
    const payload = JSON.parse(qrPayload);
    const ticket = await Ticket.findOne({
      event: payload.eventId,
      user: payload.userId,
      'seats.row': payload.seats[0]?.row
    }).populate('event');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.status !== 'purchased') {
      return res.status(400).json({ message: `Ticket already ${ticket.status}` });
    }

    ticket.status = 'checked_in';
    await ticket.save();

    res.json({ message: 'Ticket valid', ticketId: ticket._id, event: ticket.event.title });
  } catch (err) {
    next(err);
  }
});

// Organizer: basic sales stats
router.get('/stats/:eventId', requireAuth, requireRole('organizer'), async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const tickets = await Ticket.find({ event: eventId });
    const sold = tickets.filter((t) => t.status === 'purchased' || t.status === 'checked_in');
    const refunded = tickets.filter((t) => t.status === 'refunded');

    const totalRevenue = sold.reduce((sum, t) => sum + t.totalPrice, 0);
    const refundedAmount = refunded.reduce((sum, t) => sum + t.totalPrice, 0);

    res.json({
      totalTickets: tickets.length,
      soldCount: sold.length,
      refundedCount: refunded.length,
      totalRevenue,
      refundedAmount
    });
  } catch (err) {
    next(err);
  }
});

export default router;


