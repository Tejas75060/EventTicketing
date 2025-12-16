import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    row: String,
    number: Number,
    category: { type: String, default: 'general' },
    price: { type: Number, required: true },
    isBooked: { type: Boolean, default: false }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    capacity: { type: Number, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seatMap: [seatSchema]
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);


