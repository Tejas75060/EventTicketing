import express from 'express';
import { Event } from '../models/Event.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public: list events with optional date/venue filters
router.get('/', async (req, res, next) => {
  try {
    const { date, venue } = req.query;
    const query = {};
    if (date) {
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      query.date = { $gte: dayStart, $lt: dayEnd };
    }
    if (venue) {
      query.venue = venue;
    }
    const events = await Event.find(query).populate('organizer', 'name');
    res.json(events);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
});

// Organizer-only: create/update/delete events
router.post('/', requireAuth, requireRole('organizer'), async (req, res, next) => {
  try {
    const { title, description, date, venue, capacity, seatMap } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      venue,
      capacity,
      seatMap,
      organizer: req.user.id
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('organizer'), async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user.id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole('organizer'), async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;


