import React, { useState, useEffect } from 'react';
import './notification.css';

const API_BASE = "/api";


function AdminNotificationSender() {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [targetType, setTargetType] = useState('volunteer'); // 'volunteer' or 'event'
  const [volunteerName, setVolunteerName] = useState('');
  const [eventId, setEventId] = useState('');
  const [type, setType] = useState('assignment');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/volunteers`).then(r => r.json()).then(setVolunteers);
    fetch(`${API_BASE}/events`).then(r => r.json()).then(setEvents);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    let body = { type, message };
    if (targetType === 'volunteer') {
      body.volunteerName = volunteerName;
    } else if (targetType === 'event') {
      body.eventId = eventId;
    }
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: 'error', message: data.error || 'Failed to send notification.' });
      } else {
        setStatus({ type: 'success', message: 'Notification sent successfully!' });
        setMessage('');
        setVolunteerName('');
        setEventId('');
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <div className="header-content">
          <h1>Send Notification (Admin)</h1>
        </div>
      </header>
      <div className="notifications-content">
        <form className="notification-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Send To</label>
            <select value={targetType} onChange={e => setTargetType(e.target.value)}>
              <option value="volunteer">Specific Volunteer</option>
              <option value="event">All Volunteers in Event</option>
            </select>
          </div>
          {targetType === 'volunteer' && (
            <div className="form-group">
              <label>Volunteer Name</label>
              <select value={volunteerName} onChange={e => setVolunteerName(e.target.value)} required>
                <option value="">Select Volunteer</option>
                {volunteers.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>
          )}
          {targetType === 'event' && (
            <div className="form-group">
              <label>Event</label>
              <select value={eventId} onChange={e => setEventId(e.target.value)} required>
                <option value="">Select Event</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)} required>
              <option value="assignment">Assignment</option>
              <option value="update">Update</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={200} required />
          </div>
          <div className="form-group">
            <label>Event ID (optional)</label>
            <input type="number" value={eventId} onChange={e => setEventId(e.target.value)} min="1" />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Notification'}</button>
        </form>
        {status && (
          <div className={`vm-save-status ${status.type}`}>{status.message}</div>
        )}
      </div>
    </div>
  );
}

export default AdminNotificationSender;
