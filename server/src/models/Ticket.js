import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seats: [
      {
        row: String,
        number: Number,
        price: Number
      }
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['purchased', 'refunded', 'checked_in'], default: 'purchased' },
    qrPayload: { type: String, required: true }
  },
  { timestamps: true }
);

export const Ticket = mongoose.model('Ticket', ticketSchema);


