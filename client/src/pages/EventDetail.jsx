import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios.js';
import { useAuth } from '../state/AuthContext.jsx';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const res = await axios.get(`/events/${id}`);
      setEvent(res.data);
    }
    load();
  }, [id]);

  if (!event) return <p>Loading event...</p>;


  // Normalise the seatMap into individual seat objects
  const getSeatObjects = () => {
    // New schema: event.seatMap is an array of seat docs
    if (Array.isArray(event.seatMap) && event.seatMap.length > 0) {
      return [...event.seatMap]
        .map((s) => ({
          row: s.row,
          number: s.number,
          price: s.price,
          isBooked: s.isBooked,
          key: `${s.row}-${s.number}`
        }))
        // drop any malformed seats so we don't send invalid data back
        .filter(
          (s) =>
            typeof s.row !== 'undefined' &&
            s.row !== '' &&
            typeof s.number !== 'undefined' &&
            s.number !== null
        )
        .sort((a, b) => {
          if (a.row === b.row) return a.number - b.number;
          return a.row.localeCompare(b.row);
        });
    }

    // Fallback: generate a simple rectangular layout from capacity
    const capacity = event.capacity || 60;
    const seatsPerRow = 10;
    const rows = Math.ceil(capacity / seatsPerRow);
    const seats = [];

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let seatIndex = 0; seatIndex < seatsPerRow; seatIndex++) {
        const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
        if (seatNumber > capacity) break;
        const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C, ...
        seats.push({
          row: rowLetter,
          number: seatIndex + 1,
          price: 100,
          isBooked: false,
          key: `${rowLetter}-${seatIndex + 1}`
        });
      }
    }

    return seats;
  };

  const seats = getSeatObjects();

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    const key = `${seat.row}-${seat.number}`;
    setSelectedSeats((prev) =>
      prev.some((s) => `${s.row}-${s.number}` === key)
        ? prev.filter((s) => `${s.row}-${s.number}` !== key)
        : [...prev, { row: seat.row, number: seat.number }]
    );
  };

  const totalPrice = selectedSeats.reduce((sum, selectedSeat) => {
    const seat = seats.find(s => s.row === selectedSeat.row && s.number === selectedSeat.number);
    return sum + (seat ? seat.price : 0);
  }, 0);

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (selectedSeats.length === 0) return;

    // Clean and normalise seats before sending to API
    const cleanedSeats = selectedSeats
      .filter(
        (s) =>
          s &&
          typeof s.row !== 'undefined' &&
          s.row !== '' &&
          typeof s.number !== 'undefined' &&
          s.number !== null
      )
      .map((s) => ({
        row: String(s.row),
        number: Number(s.number)
      }));

    if (cleanedSeats.length === 0) {
      setError('Please select valid seats.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/tickets/purchase', {
        eventId: event._id,
        seats: cleanedSeats
      });
      navigate('/tickets', { state: { justPurchased: res.data.ticketId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>{event.title}</h1>
      <p className="muted">{event.description}</p>
      <p>
        <strong>Date:</strong> {new Date(event.date).toLocaleString()}
      </p>
      <p>
        <strong>Venue:</strong> {event.venue}
      </p>

      <h3 className="mt">Choose your seats</h3>
      <div className="seat-legend">
        <span className="seat available" /> Available
        <span className="seat selected" /> Selected
        <span className="seat booked" /> Booked
      </div>

      {seats.length === 0 ? (
        <p className="muted mt">Seat layout is not configured for this event.</p>
      ) : (
        <div className="seat-grid">
          {seats.map((seat) => {
            const key = `${seat.row}-${seat.number}`;
            const isSelected = selectedSeats.some(
              (s) => `${s.row}-${s.number}` === key
            );
            const className = `seat ${
              seat.isBooked ? 'booked' : isSelected ? 'selected' : 'available'
            }`;
            return (
              <button
                key={key}
                className={className}
                onClick={() => toggleSeat(seat)}
                disabled={seat.isBooked}
              >
                {seat.row}
                {seat.number}
              </button>
            );
          })}
        </div>
      )}

      <div className="checkout-bar">
        <span>
          {selectedSeats.length} seat(s) – Total: ₹{totalPrice || 0}
        </span>
        <button
          className="btn btn-primary"
          onClick={handlePurchase}
          disabled={loading || selectedSeats.length === 0}
        >
          {loading ? 'Processing...' : 'Buy Tickets'}
        </button>
      </div>
      {error && <div className="error mt">{error}</div>}
    </div>
  );
}


