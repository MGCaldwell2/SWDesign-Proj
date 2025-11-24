import './home.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Minimal professional landing page for Houston Volunteer Institute
function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch upcoming events
  useEffect(() => {
    let isMounted = true;
    fetch('/api/events')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load events');
        return r.json();
      })
      .then(data => {
        if (!isMounted) return;
        // Normalize & sort by date ascending, limit to next 6
        const normalized = Array.isArray(data) ? data.map(e => ({
          id: e.id,
            name: e.name || 'Untitled Event',
            description: e.description || '',
            location: e.location || 'TBD',
            date: e.date ? new Date(e.date) : null,
            capacity: e.capacity ?? null
        })) : [];
        normalized.sort((a,b) => (a.date||0) - (b.date||0));
        setEvents(normalized.slice(0,6));
        setLoading(false);
      })
      .catch(err => {
        console.warn(err);
        if (!isMounted) return;
        // Fallback demo events
        const today = new Date();
        const fallback = [1,2,3].map(i => ({
          id: 'demo-'+i,
          name: `Community Outreach #${i}`,
          description: 'Join volunteers making a local impact.',
          location: 'Houston, TX',
          date: new Date(today.getTime() + i*86400000),
          capacity: 25 + i*10
        }));
        setEvents(fallback);
        setError('Showing sample events');
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const formatDate = (d) => {
    if (!d) return 'Date TBD';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="landing-container">
      <section className="hero">
        <div className="hero-inner">
          <h1 className="site-title">Houston Volunteer Institute</h1>
          <p className="tagline">Empowering service. Connecting communities.</p>
          <div className="cta-group">
            <Link to="/login" className="cta-btn primary">Login</Link>
            <Link to="/UserRegistration" className="cta-btn outline">Sign Up</Link>
          </div>
        </div>
      </section>

      <section className="events-section">
        <div className="events-header">
          <h2>Upcoming Events</h2>
          {error && <span className="events-note">{error}</span>}
        </div>
        {loading ? (
          <div className="events-loading">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="events-empty">No events scheduled yet. Check back soon!</div>
        ) : (
          <div className="events-grid">
            {events.map(ev => (
              <div key={ev.id} className="event-card">
                <div className="event-date">
                  {formatDate(ev.date)}
                </div>
                <h3 className="event-name">{ev.name}</h3>
                <p className="event-desc">{ev.description}</p>
                <div className="event-meta">
                  <span className="event-location">📍 {ev.location}</span>
                  {ev.capacity && <span className="event-capacity">Capacity: {ev.capacity}</span>}
                </div>
                <Link to={`/EventManage?event=${ev.id}`} className="event-action">View Details →</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
