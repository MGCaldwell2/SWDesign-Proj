import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VolunteerLog from '../history/history';
import './UserDashboard.css';

const API_BASE = "/api";

function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState({
    eventsCompleted: 0,
    upcomingEvents: 0,
    skillsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [availabilityInput, setAvailabilityInput] = useState("");
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  useEffect(() => {
    // Load current user
    try {
      const stored = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
      if (!stored) {
        navigate('/Login');
        return;
      }
      setCurrentUser(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to parse stored user", e);
      navigate('/Login');
    }
  }, [navigate]);

  // When user is set, fetch profile, events, notifications, history
  useEffect(() => {
    if (!currentUser?.id) return;
    fetchProfile(currentUser.id);
    fetchVolunteerHistory(currentUser.id);
    fetchDashboardData();
  }, [currentUser?.id]);
  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5050/api/accounts/account?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // update stats skills count
        setVolunteerStats(prev => ({ ...prev, skillsCount: Array.isArray(data.skills) ? data.skills.length : 0 }));
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch notifications
      const notifRes = await fetch(`${API_BASE}/notifications?userId=4`);
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.slice(0, 5)); // Get latest 5
      }

      // eventsCompleted will be driven by volunteer history loaded separately

      // Fetch upcoming events
      const eventsRes = await fetch(`${API_BASE}/events`);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const upcoming = eventsData.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= new Date();
        }).slice(0, 3);
        setUpcomingEvents(upcoming);
        setVolunteerStats(prev => ({ ...prev, upcomingEvents: upcoming.length }));
      }

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerHistory = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5050/api/volunteer/${userId}/history`);
      const data = await res.json().catch(async () => ({ message: await res.text() }));
      if (res.ok && Array.isArray(data.history)) {
        setHistory(data.history);
        setVolunteerStats(prev => ({ ...prev, eventsCompleted: data.history.length }));
      }
    } catch (e) {
      console.error("Failed to fetch volunteer history", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    navigate("/Login");
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card events">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{volunteerStats.eventsCompleted}</h3>
            <p>Events Completed</p>
          </div>
        </div>
        <div className="stat-card upcoming">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{volunteerStats.upcomingEvents}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>
        <div className="stat-card notifications">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{notifications.filter(n => !n.isRead).length}</h3>
            <p>New Notifications</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section upcoming-events-section">
          <div className="section-header">
            <h2>📅 Upcoming Events</h2>
          </div>
          <div className="events-list">
            {upcomingEvents.length === 0 ? (
              <p className="empty-message">No upcoming events. Check the matching page to find opportunities!</p>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.name}</h3>
                    <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <p className="event-location">📍 {event.location}</p>
                  <p className="event-description">{event.description}</p>
                  {event.requiredSkills && event.requiredSkills.length > 0 && (
                    <div className="event-skills">
                      {event.requiredSkills.map(skill => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-section notifications-section">
          <div className="section-header">
            <h2>🔔 Recent Notifications</h2>
            <Link to="/notifications" className="view-all-link">View All →</Link>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p className="empty-message">No new notifications</p>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                  <div className="notif-icon">
                    {notif.type === 'assignment' ? '📋' : notif.type === 'update' ? '🔄' : '⏰'}
                  </div>
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <span className="notif-time">{new Date(notif.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const updateAvailabilityRemote = async (newDates) => {
    if (!currentUser?.id) return;
    setUpdatingAvailability(true);
    try {
      const res = await fetch("http://localhost:5050/api/accounts/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser.id, availability: newDates })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        console.warn("Failed updating availability", res.status);
      }
    } catch (e) {
      console.error("Availability update error", e);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const addAvailabilityDate = () => {
    if (!availabilityInput) return;
    const existing = Array.isArray(profile?.availability) ? profile.availability : [];
    if (existing.includes(availabilityInput)) { setAvailabilityInput(""); return; }
    const updated = [...existing, availabilityInput];
    setProfile(prev => ({ ...prev, availability: updated }));
    setAvailabilityInput("");
    updateAvailabilityRemote(updated);
  };

  const removeAvailabilityDate = (date) => {
    const existing = Array.isArray(profile?.availability) ? profile.availability : [];
    const updated = existing.filter(d => d !== date);
    setProfile(prev => ({ ...prev, availability: updated }));
    updateAvailabilityRemote(updated);
  };

  const renderProfile = () => (
    <div className="profile-content">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser?.email?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-info">
          <h2>{profile?.full_name || currentUser?.email || 'Volunteer'}</h2>
          <p className="profile-role">Volunteer</p>
        </div>
        <Link to="/AccountManage" className="edit-profile-btn">
          Edit Profile
        </Link>
      </div>
      <div className="profile-stats-grid">
        <div className="profile-stat">
          <h3>Events Participated</h3>
          <p className="stat-number">{volunteerStats.eventsCompleted}</p>
        </div>
        <div className="profile-stat">
          <h3>Member Since</h3>
          <p className="stat-number">{new Date().getFullYear()}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Account Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{currentUser?.email || 'Not provided'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location:</span>
            <span className="info-value">{profile ? `${profile.city || ''} ${profile.state || ''}`.trim() || 'Not set' : 'Not set'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Zip:</span>
            <span className="info-value">{profile?.zipcode || 'Not set'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value status-active">Active</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3>Skills</h3>
        {profile?.skills?.length ? (
          <div className="skills-list">
            {profile.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          </div>
        ) : <p className="empty-message">No skills listed yet.</p>}
      </div>

      <div className="profile-section">
        <h3>Availability</h3>
        <div className="availability-editor">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <input type="date" value={availabilityInput} onChange={e => setAvailabilityInput(e.target.value)} />
            <button type="button" onClick={addAvailabilityDate} disabled={!availabilityInput || updatingAvailability} className="profile-action-btn secondary" style={{ padding: '0.4rem 0.8rem' }}>Add</button>
          </div>
          {updatingAvailability && <p style={{ fontSize: '0.8rem' }}>Updating availability...</p>}
        </div>
        {profile?.availability?.length ? (
          <ul className="availability-list">
            {profile.availability.map(d => (
              <li key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{d}</span>
                <button type="button" onClick={() => removeAvailabilityDate(d)} className="profile-action-btn secondary" style={{ padding: '0.25rem 0.6rem' }}>Remove</button>
              </li>
            ))}
          </ul>
        ) : <p className="empty-message">No availability dates added.</p>}
      </div>

      <div className="profile-actions">
        <Link to="/AccountManage" className="profile-action-btn primary">
          {profile ? 'Update Profile Information' : 'Complete Profile Information'}
        </Link>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="history-content" style={{ padding: 0 }}>
      <VolunteerLog />
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/" className="back-home">
            ← Home
          </Link>
          <h1>Volunteer Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">👤 {currentUser?.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 History
        </button>
      </div>

      <main className="dashboard-main">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'history' && renderHistory()}
      </main>
    </div>
  );
}

export default UserDashboard;
