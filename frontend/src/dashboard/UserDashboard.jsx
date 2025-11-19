import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const API_BASE = "/api";

function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [volunteerStats, setVolunteerStats] = useState({
    totalHours: 0,
    eventsCompleted: 0,
    upcomingEvents: 0,
    skillsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user from storage
    try {
      const localUser = localStorage.getItem("currentUser");
      const sessionUser = sessionStorage.getItem("currentUser");
      if (localUser) {
        setCurrentUser(JSON.parse(localUser));
      } else if (sessionUser) {
        setCurrentUser(JSON.parse(sessionUser));
      } else {
        navigate('/Login');
        return;
      }
    } catch (e) {
      console.error("Failed to read stored user", e);
      navigate('/Login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch notifications
      const notifRes = await fetch(`${API_BASE}/notifications?userId=4`);
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.slice(0, 5)); // Get latest 5
      }

      // Fetch volunteer history from localStorage
      const savedLogs = localStorage.getItem("volunteerLogs");
      if (savedLogs) {
        const logs = JSON.parse(savedLogs);
        const totalHours = logs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0);
        const completedEvents = logs.filter(log => log.status === 'Completed').length;
        
        setVolunteerStats(prev => ({
          ...prev,
          totalHours,
          eventsCompleted: completedEvents
        }));
      }

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

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    navigate("/Login");
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card hours">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>{volunteerStats.totalHours}</h3>
            <p>Total Hours</p>
          </div>
        </div>
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
            <Link to="/VolunteerMatching" className="view-all-link">View All →</Link>
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

      <div className="quick-actions">
        <h2>⚡ Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/VolunteerMatching" className="action-btn primary">
            <span className="btn-icon">🤝</span>
            <span>Find Events</span>
          </Link>
          <Link to="/VolunteerLog" className="action-btn secondary">
            <span className="btn-icon">📝</span>
            <span>Log Hours</span>
          </Link>
          <Link to="/AccountManage" className="action-btn secondary">
            <span className="btn-icon">⚙️</span>
            <span>Update Profile</span>
          </Link>
          <Link to="/notifications" className="action-btn secondary">
            <span className="btn-icon">🔔</span>
            <span>View Notifications</span>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser?.email?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="profile-info">
          <h2>{currentUser?.email || 'Volunteer'}</h2>
          <p className="profile-role">Volunteer</p>
        </div>
        <Link to="/AccountManage" className="edit-profile-btn">
          Edit Profile
        </Link>
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat">
          <h3>Total Hours Volunteered</h3>
          <p className="stat-number">{volunteerStats.totalHours}</p>
        </div>
        <div className="profile-stat">
          <h3>Events Participated</h3>
          <p className="stat-number">{volunteerStats.eventsCompleted}</p>
        </div>
        <div className="profile-stat">
          <h3>Member Since</h3>
          <p className="stat-number">2024</p>
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
            <span className="info-label">Status:</span>
            <span className="info-value status-active">Active</span>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <Link to="/AccountManage" className="profile-action-btn primary">
          Complete Profile Information
        </Link>
        <Link to="/VolunteerMatching" className="profile-action-btn secondary">
          Browse Events
        </Link>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="history-content">
      <div className="section-header">
        <h2>📚 Your Volunteer History</h2>
        <Link to="/VolunteerLog" className="view-full-btn">View Full History →</Link>
      </div>
      <p className="section-description">
        Track all your volunteer activities, hours contributed, and event participation.
      </p>
      <div className="history-summary">
        <div className="summary-card">
          <h3>{volunteerStats.eventsCompleted}</h3>
          <p>Events Completed</p>
        </div>
        <div className="summary-card">
          <h3>{volunteerStats.totalHours}</h3>
          <p>Hours Logged</p>
        </div>
      </div>
      <Link to="/VolunteerLog" className="full-history-link">
        <button className="full-history-btn">Go to Complete History</button>
      </Link>
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
