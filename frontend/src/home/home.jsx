import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Volunteer Management System</h1>
        <p>Welcome to your comprehensive volunteer management platform</p>
      </header>

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
              <Link to="/EventManage" className="nav-card">
                <div className="card-icon">📅</div>
                <h3>Event Management</h3>
                <p>Create and manage volunteer events</p>
              </Link>
              
              <Link to="/notifications" className="nav-card">
                <div className="card-icon">🔔</div>
                <h3>Notifications</h3>
                <p>View your notifications and updates</p>
              </Link>
            </div>
          </section>
        </div>

        {/* Quick Stats or Welcome Message */}
        <section className="welcome-section">
          <div className="welcome-card">
            <h2>Get Started</h2>
            <p>
              Whether you're looking to volunteer, manage events, or organize activities, 
              our platform provides all the tools you need to make a difference in your community.
            </p>
            <div className="quick-actions">
              <Link to="/VolunteerMatching" className="cta-button primary">
                Find Opportunities
              </Link>
              <Link to="/EventManage" className="cta-button secondary">
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
