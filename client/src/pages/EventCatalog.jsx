import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios.js';

export default function EventCatalog() {
  const [events, setEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/events', {
        params: { date: date || undefined, venue: venue || undefined }
      });
      setEvents(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleEvents = events; // hook for future category-based filtering

  return (
    <div className="bms-page">
      <section className="hero-banner card">
        <div className="hero-content">
          <h1>Discover the best events in your city</h1>
          <p>
            Concerts, stand-up, workshops, sports and more – all in one place. 
            Book your next experience in seconds.
          </p>
          <div className="hero-quick-actions">
            <button className="chip chip-filled">Today</button>
            <button className="chip">This Weekend</button>
            <button className="chip">Free Events</button>
          </div>
        </div>
        <div className="hero-poster">
          <div className="hero-poster-inner">
            <span className="hero-tag">Trending near you</span>
            <span className="hero-title">Live Events</span>
          </div>
        </div>
      </section>

      <section className="bms-toolbar">
        <div className="category-pills">
          {[
            { id: 'all', label: 'All' },
            { id: 'movies', label: 'Movies' },
            { id: 'events', label: 'Events' },
            { id: 'sports', label: 'Sports' },
            { id: 'activities', label: 'Activities' }
          ].map((cat) => (
            <button
              key={cat.id}
              className={
                activeCategory === cat.id ? 'chip chip-filled' : 'chip'
              }
              onClick={() => setActiveCategory(cat.id)}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="filters">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Venue
            <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Any" />
          </label>
          <button onClick={loadEvents} className="btn btn-secondary">
            Apply
          </button>
        </div>
      </section>

      {loading && <p className="muted">Loading events...</p>}

      <section className="bms-section">
        <div className="bms-section-header">
          <h2>Recommended Events</h2>
          <span className="muted">
            {visibleEvents.length > 0 ? `Showing ${visibleEvents.length} options` : 'No events found'}
          </span>
        </div>

        <div className="event-strip">
          {visibleEvents.map((event) => (
            <Link
              key={event._id}
              to={`/events/${event._id}`}
              className="bms-card"
            >
              <div className="bms-poster">
                <span className="bms-poster-badge">₹</span>
                <div className="bms-poster-footer">
                  <span>
                    {new Date(event.date).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </span>
                  <span>{event.venue}</span>
                </div>
              </div>
              <div className="bms-card-body">
                <h3 title={event.title}>{event.title}</h3>
                <p className="bms-meta">
                  {new Date(event.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}{' '}
                  • {event.venue}
                </p>
                {event.organizer?.name && (
                  <p className="bms-subtext">By {event.organizer.name}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}


