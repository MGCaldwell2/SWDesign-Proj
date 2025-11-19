import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_BASE = "/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalHours: 0,
    pendingMatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Check if user is logged in
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

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch volunteers
      const volRes = await fetch(`${API_BASE}/volunteers`);
      if (volRes.ok) {
        const volData = await volRes.json();
        setVolunteers(volData);
      }

      // Fetch events
      const evtRes = await fetch(`${API_BASE}/events`);
      if (evtRes.ok) {
        const evtData = await evtRes.json();
        setEvents(evtData);
        
        // Calculate active events (upcoming)
        const activeEvents = evtData.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= new Date();
        }).length;

        setStats(prev => ({
          ...prev,
          totalEvents: evtData.length,
          activeEvents
        }));
      }

      // Calculate total volunteer hours from localStorage
      const savedLogs = localStorage.getItem("volunteerLogs");
      if (savedLogs) {
        const logs = JSON.parse(savedLogs);
        const totalHours = logs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0);
        setStats(prev => ({ ...prev, totalHours }));
        
        // Get recent activity
        const recent = logs.slice(-5).reverse().map((log, idx) => ({
          id: idx,
          type: 'hours_logged',
          message: `${log.name} logged ${log.hours} hours`,
          timestamp: log.timestamp
        }));
        setRecentActivity(recent);
      }

      setStats(prev => ({
        ...prev,
        totalVolunteers: volunteers.length || 0
      }));

    } catch (err) {
      console.error("Failed to fetch admin data:", err);
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
    <div className="admin-overview">
      <div className="admin-stats-grid">
        <div className="admin-stat-card volunteers">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{volunteers.length}</h3>
            <p>Total Volunteers</p>
          </div>
        </div>
        <div className="admin-stat-card events">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.totalEvents}</h3>
            <p>Total Events</p>
          </div>
        </div>
        <div className="admin-stat-card active">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <h3>{stats.activeEvents}</h3>
            <p>Active Events</p>
          </div>
        </div>
        <div className="admin-stat-card hours">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>{stats.totalHours}</h3>
            <p>Total Hours</p>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-section">
          <div className="section-header">
            <h2>📊 Recent Activity</h2>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p className="empty-message">No recent activity</p>
            ) : (
              recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'hours_logged' ? '⏱️' : '📋'}
                  </div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-section">
          <div className="section-header">
            <h2>🎯 Quick Stats</h2>
          </div>
          <div className="quick-stats">
            <div className="quick-stat-item">
              <span className="stat-label">Avg Hours per Volunteer:</span>
              <span className="stat-value">
                {volunteers.length > 0 ? (stats.totalHours / volunteers.length).toFixed(1) : 0}
              </span>
            </div>
            <div className="quick-stat-item">
              <span className="stat-label">Events This Month:</span>
              <span className="stat-value">{stats.activeEvents}</span>
            </div>
            <div className="quick-stat-item">
              <span className="stat-label">Volunteer Participation:</span>
              <span className="stat-value">{volunteers.length > 0 ? '100%' : '0%'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>⚡ Admin Actions</h2>
        <div className="admin-action-buttons">
          <Link to="/EventCreate" className="admin-action-btn primary">
            <span className="btn-icon">➕</span>
            <span>Create New Event</span>
          </Link>
          <Link to="/EventEdit" className="admin-action-btn secondary">
            <span className="btn-icon">✏️</span>
            <span>Manage Events</span>
          </Link>
          <Link to="/VolunteerMatching" className="admin-action-btn secondary">
            <span className="btn-icon">🤝</span>
            <span>Match Volunteers</span>
          </Link>
          <Link to="/admin/notifications" className="admin-action-btn secondary">
            <span className="btn-icon">📢</span>
            <span>Send Notification</span>
          </Link>
          <Link to="/VolunteerLog" className="admin-action-btn secondary">
            <span className="btn-icon">📚</span>
            <span>View All History</span>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderVolunteers = () => (
    <div className="volunteers-content">
      <div className="section-header">
        <h2>👥 Volunteer Management</h2>
        <span className="count-badge">{volunteers.length} Total</span>
      </div>
      <div className="volunteers-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Skills</th>
              <th>City</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">No volunteers found</td>
              </tr>
            ) : (
              volunteers.map(volunteer => (
                <tr key={volunteer.id}>
                  <td>{volunteer.id}</td>
                  <td className="name-cell">{volunteer.name}</td>
                  <td>
                    <div className="skills-list">
                      {volunteer.skills?.slice(0, 2).map(skill => (
                        <span key={skill} className="skill-badge">{skill}</span>
                      ))}
                      {volunteer.skills?.length > 2 && (
                        <span className="skill-badge more">+{volunteer.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>{volunteer.city}</td>
                  <td>{volunteer.availability?.length || 0} dates</td>
                  <td>
                    <button className="table-action-btn">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="events-content">
      <div className="section-header">
        <h2>📅 Event Management</h2>
        <Link to="/EventCreate" className="create-event-btn">
          <span>➕</span> Create Event
        </Link>
      </div>
      <div className="events-grid">
        {events.length === 0 ? (
          <p className="empty-message">No events created yet</p>
        ) : (
          events.map(event => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate >= new Date();
            
            return (
              <div key={event.id} className={`admin-event-card ${isUpcoming ? 'upcoming' : 'past'}`}>
                <div className="event-status-badge">
                  {isUpcoming ? '✨ Upcoming' : '📋 Past'}
                </div>
                <h3>{event.name}</h3>
                <div className="event-details">
                  <p className="event-date">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="event-location">📍 {event.location}</p>
                  <p className="event-description">{event.description}</p>
                  {event.requiredSkills && event.requiredSkills.length > 0 && (
                    <div className="event-skills">
                      <strong>Required Skills:</strong>
                      <div className="skills-list">
                        {event.requiredSkills.map(skill => (
                          <span key={skill} className="skill-badge">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="event-actions">
                  <Link to="/EventEdit" className="event-action-btn edit">
                    Edit
                  </Link>
                  <Link to="/VolunteerMatching" className="event-action-btn match">
                    Match Volunteers
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-content">
      <div className="section-header">
        <h2>📊 Reports & Analytics</h2>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <h3>📈 Volunteer Engagement</h3>
          <div className="report-stats">
            <div className="report-stat">
              <span className="stat-label">Active Volunteers:</span>
              <span className="stat-value">{volunteers.length}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Total Hours:</span>
              <span className="stat-value">{stats.totalHours}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Avg Hours/Volunteer:</span>
              <span className="stat-value">
                {volunteers.length > 0 ? (stats.totalHours / volunteers.length).toFixed(1) : 0}
              </span>
            </div>
          </div>
          <Link to="/VolunteerLog" className="report-link">View Full History →</Link>
        </div>

        <div className="report-card">
          <h3>📅 Event Statistics</h3>
          <div className="report-stats">
            <div className="report-stat">
              <span className="stat-label">Total Events:</span>
              <span className="stat-value">{stats.totalEvents}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Active Events:</span>
              <span className="stat-value">{stats.activeEvents}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{stats.totalEvents - stats.activeEvents}</span>
            </div>
          </div>
          <Link to="/EventEdit" className="report-link">Manage Events →</Link>
        </div>

        <div className="report-card">
          <h3>🎯 Top Skills in Demand</h3>
          <div className="skills-demand-list">
            {['First Aid', 'Spanish', 'Food Handling', 'Crowd Control', 'Data Entry'].map((skill, idx) => (
              <div key={skill} className="demand-item">
                <span className="demand-skill">{skill}</span>
                <span className="demand-bar">
                  <span className="demand-fill" style={{width: `${100 - (idx * 15)}%`}}></span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <h3>📬 Communication</h3>
          <div className="communication-actions">
            <Link to="/admin/notifications" className="comm-action-btn">
              <span className="comm-icon">📢</span>
              <div>
                <strong>Send Notification</strong>
                <p>Notify volunteers about updates</p>
              </div>
            </Link>
            <Link to="/notifications" className="comm-action-btn">
              <span className="comm-icon">📨</span>
              <div>
                <strong>View Sent Messages</strong>
                <p>Check notification history</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-state">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <div className="header-left">
          <Link to="/" className="back-home">
            ← Home
          </Link>
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="admin-badge">
            <span className="badge-icon">🛡️</span>
            <span>Administrator</span>
          </div>
          <div className="user-info">
            <span className="user-name">👤 {currentUser?.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="admin-dashboard-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          👥 Volunteers
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📅 Events
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 Reports
        </button>
      </div>

      <main className="admin-dashboard-main">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'volunteers' && renderVolunteers()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'reports' && renderReports()}
      </main>
    </div>
  );
}

export default AdminDashboard;
