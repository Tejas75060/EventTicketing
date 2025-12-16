
import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [stats, setStats] = useState(null);
  const [qrPayload, setQrPayload] = useState('');
  const [validationResult, setValidationResult] = useState('');

  // Event creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    capacity: 0,
    rows: 5,
    seatsPerRow: 10,
    basePrice: 500
  });
  const [createResult, setCreateResult] = useState('');

  useEffect(() => {
    async function load() {
      const res = await axios.get('/events');
      setEvents(res.data);
    }
    load();
  }, []);

  const loadStats = async () => {
    if (!selectedEvent) return;
    const res = await axios.get(`/tickets/stats/${selectedEvent}`);
    setStats(res.data);
  };


  const handleValidate = async () => {
    if (!qrPayload) return;
    try {
      const res = await axios.post('/tickets/validate', { qrPayload });
      setValidationResult(`✅ ${res.data.message} – ${res.data.event}`);
    } catch (err) {
      setValidationResult(`❌ ${err.response?.data?.message || 'Invalid ticket'}`);
    }
  };

  // Generate seat map for the event
  const generateSeatMap = (rows, seatsPerRow, basePrice) => {
    const seatMap = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    for (let r = 0; r < rows; r++) {
      const row = rowLetters[r];
      for (let s = 1; s <= seatsPerRow; s++) {
        // Add some price variation (front rows more expensive)
        const priceMultiplier = 1 - (r * 0.1); // Each row 10% cheaper
        const price = Math.round(basePrice * priceMultiplier);
        
        seatMap.push({
          row,
          number: s,
          category: r < 2 ? 'premium' : 'general',
          price,
          isBooked: false
        });
      }
    }
    return seatMap;
  };

  // Handle event creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreateResult('');
    
    try {
      // Calculate capacity and generate seat map
      const capacity = newEvent.rows * newEvent.seatsPerRow;
      const seatMap = generateSeatMap(newEvent.rows, newEvent.seatsPerRow, newEvent.basePrice);
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        venue: newEvent.venue,
        capacity,
        seatMap
      };

      const res = await axios.post('/events', eventData);
      setCreateResult(`✅ Event "${res.data.title}" created successfully!`);
      
      // Reset form and refresh events list
      setNewEvent({
        title: '',
        description: '',
        date: '',
        venue: '',
        capacity: 0,
        rows: 5,
        seatsPerRow: 10,
        basePrice: 500
      });
      setShowCreateForm(false);
      
      // Refresh events list
      const eventsRes = await axios.get('/events');
      setEvents(eventsRes.data);
      
    } catch (err) {
      setCreateResult(`❌ ${err.response?.data?.message || 'Failed to create event'}`);
    }
  };


  return (
    <div>
      <h1>Organizer Dashboard</h1>
      
      {/* Event Creation Section */}
      <section className="card">
        <div className="card-header">
          <h2>Event Management</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Event'}
          </button>
        </div>
        
        {showCreateForm && (
          <form onSubmit={handleCreateEvent} className="event-form">
            <div className="form-row">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                  placeholder="Enter event title"
                />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input
                  type="text"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                  required
                  placeholder="Enter venue"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Enter event description"
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Base Price (₹)</label>
                <input
                  type="number"
                  value={newEvent.basePrice}
                  onChange={(e) => setNewEvent({...newEvent, basePrice: parseInt(e.target.value)})}
                  min="100"
                  step="50"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Rows</label>
                <input
                  type="number"
                  value={newEvent.rows}
                  onChange={(e) => setNewEvent({...newEvent, rows: parseInt(e.target.value)})}
                  min="1"
                  max="26"
                  required
                />
              </div>
              <div className="form-group">
                <label>Seats per Row</label>
                <input
                  type="number"
                  value={newEvent.seatsPerRow}
                  onChange={(e) => setNewEvent({...newEvent, seatsPerRow: parseInt(e.target.value)})}
                  min="1"
                  max="50"
                  required
                />
              </div>
            </div>
            
            <div className="form-info">
              <strong>Total Capacity:</strong> {newEvent.rows * newEvent.seatsPerRow} seats
              <br />
              <strong>Seat Categories:</strong> Front 2 rows = Premium, Rest = General
            </div>
            
            <button type="submit" className="btn btn-success">
              Create Event
            </button>
            
            {createResult && (
              <div className={`mt ${createResult.includes('✅') ? 'success' : 'error'}`}>
                {createResult}
              </div>
            )}
          </form>
        )}
      </section>

      <section className="card">
        <h2>Sales Overview</h2>
        <div className="form-inline">
          <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            <option value="">Select event</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={loadStats}>
            Load Stats
          </button>
        </div>
        {stats && (
          <div className="stats-grid">
            <div className="stat">
              <span className="label">Tickets Sold</span>
              <span className="value">{stats.soldCount}</span>
            </div>
            <div className="stat">
              <span className="label">Refunded</span>
              <span className="value">{stats.refundedCount}</span>
            </div>
            <div className="stat">
              <span className="label">Revenue</span>
              <span className="value">₹{stats.totalRevenue}</span>
            </div>
            <div className="stat">
              <span className="label">Refunded Amount</span>
              <span className="value">₹{stats.refundedAmount}</span>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Validate Ticket QR</h2>
        <p className="muted">
          Paste the raw QR payload (scanned JSON). In a real gate app you would scan and send this
          automatically.
        </p>
        <textarea
          rows={4}
          value={qrPayload}
          onChange={(e) => setQrPayload(e.target.value)}
          placeholder='{"type":"ticket", ...}'
        />
        <button className="btn btn-primary mt" onClick={handleValidate}>
          Validate
        </button>
        {validationResult && <div className="mt">{validationResult}</div>}
      </section>
    </div>
  );
}


