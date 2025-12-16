import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import { QRCodeCanvas } from 'qrcode.react';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/tickets/mine');
      setTickets(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleRefund = async (id) => {
    await axios.post(`/tickets/${id}/refund`);
    await loadTickets();
  };

  return (
    <div>
      <h1>My Tickets</h1>
      {loading && <p>Loading...</p>}
      <div className="grid">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="card ticket-card">
            <h3>{ticket.event?.title}</h3>
            <p>{new Date(ticket.event?.date).toLocaleString()}</p>
            <p className="muted">{ticket.event?.venue}</p>
            <p>
              Seats:{' '}
              {ticket.seats
                .map((s) => `${s.row}${s.number}`)
                .join(', ')}
            </p>
            <p>Total: ₹{ticket.totalPrice}</p>
            <p>Status: {ticket.status}</p>
            <div className="qr-wrapper">
              <QRCodeCanvas value={ticket.qrPayload} size={120} />
            </div>
            {ticket.status === 'purchased' && (
              <button className="btn btn-secondary full-width" onClick={() => handleRefund(ticket._id)}>
                Request Refund
              </button>
            )}
          </div>
        ))}
        {!loading && tickets.length === 0 && <p>No tickets yet.</p>}
      </div>
    </div>
  );
}


