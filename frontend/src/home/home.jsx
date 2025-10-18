import './home.css';
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-clear success message after a few seconds
  useEffect(() => {
    if (location.state?.successMessage) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true, state: {} });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Volunteer Management System</h1>
        <p>Welcome to the volunteer management platform</p>
      </header>

      {/* ✅ Success Message Banner */}
      {location.state?.successMessage && (
        <div
          style={{
            background: '#22c55e',
            color: '#fff',
            padding: '12px 20px',
            margin: '20px auto',
            maxWidth: '600px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            textAlign: 'center',
            transition: 'opacity 0.5s ease',
          }}
        >
          {location.state.successMessage}
        </div>
      )}

      <main className="home-main">
        <div className="navigation-grid">
          {/* User Management Section */}
          <section className="nav-section">
            <h2>User Management</h2>
            <div className="nav-cards">
              <Link to="/Login" className="nav-card">
                <div className="card-icon">🔐</div>
                <h3>Login</h3>
                <p>Sign in to your account</p>
              </Link>

              <Link to="/UserRegistration" className="nav-card">
                <div className="card-icon">📝</div>
                <h3>User Registration</h3>
                <p>Create a new account</p>
              </Link>

              <Link to="/AccountManage" className="nav-card">
                <div className="card-icon">👤</div>
                <h3>Account Management</h3>
                <p>Manage your profile and settings</p>
              </Link>
            </div>
          </section>

          {/* Volunteer Activities Section */}
          <section className="nav-section">
            <h2>Volunteer Activities</h2>
            <div className="nav-cards">
              <Link to="/VolunteerMatching" className="nav-card">
                <div className="card-icon">🤝</div>
                <h3>Volunteer Matching</h3>
                <p>Find volunteer opportunities that match your skills</p>
              </Link>

              <Link to="/VolunteerLog" className="nav-card">
                <div className="card-icon">📚</div>
                <h3>Volunteer History</h3>
                <p>View your past volunteer activities</p>
              </Link>
            </div>
          </section>

          {/* Event Management Section */}
          <section className="nav-section">
            <h2>Event Management</h2>
            <div className="nav-cards">
              <Link to="/EventCreate" className="nav-card">
                <div className="card-icon">➕</div>
                <h3>Create Event</h3>
                <p>Create a new volunteer event</p>
              </Link>

              <Link to="/EventEdit" className="nav-card">
                <div className="card-icon">✏️</div>
                <h3>Edit Events</h3>
                <p>View and update created events</p>
              </Link>


              <Link to="/admin/notifications" className="nav-card">
                <div className="card-icon">📢</div>
                <h3>Send Notification (Admin)</h3>
                <p>Send notifications to volunteers</p>
              </Link>
              <Link to="/notifications" className="nav-card">
                <div className="card-icon">🔔</div>
                <h3>Notifications</h3>
                <p>View your notifications and updates</p>
              </Link>
            </div>
          </section>
        </div>

        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-card">
            <h2>Get Started</h2>
            <p>You can find everything you need right here.</p>
            <div className="quick-actions">
              <Link to="/VolunteerMatching" className="cta-button primary">
                Find Opportunities
              </Link>
              <Link to="/EventCreate" className="cta-button secondary">
                Create Event
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
