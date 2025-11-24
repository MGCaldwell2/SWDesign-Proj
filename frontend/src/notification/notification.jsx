import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './notification.css';


const API_BASE = "/api";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Derive userId from stored session (fallback to existing notification userId if absent)
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch { return {}; }
  })();
  const sessionUserId = storedUser?.id || storedUser?.userId || null;

  // Fetch notifications from backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    const initialUserId = sessionUserId ||  storedUser?.id || storedUser?.userId || 4; // fallback demo id
    fetch(`${API_BASE}/notifications?userId=${initialUserId}`)
      .then(res => res.json())
      .then(data => {
        // Add title/priority for demo (backend doesn't provide)
        const withMeta = data.map(n => ({
          ...n,
          title: n.type === 'assignment' ? 'New Event Assignment' : n.type === 'update' ? 'Event Update' : 'Event Reminder',
          priority: n.type === 'assignment' ? 'high' : n.type === 'update' ? 'medium' : 'medium',
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(withMeta);
        setUnreadCount(withMeta.filter(n => !n.isRead).length);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load notifications.');
        setLoading(false);
      });
  }, []);

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  };


  // For demo, update local state only (backend does not support update/delete)
  const markAsRead = (id) => {
    // Optimistic update; revert if API fails
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Use session user id if available; fallback to notification's own userId
    const target = notifications.find(n => n.id === id);
    const recipientId = target?.userId || sessionUserId;
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: recipientId })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to mark read');
      return res.json();
    })
    .catch(err => {
      console.error(err);
      // Revert optimistic update on failure
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
      setUnreadCount(prev => prev + 1);
    });
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    const batchUserId = sessionUserId || (notifications[0] && notifications[0].userId);
    // Optimistically mark all
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    // Fire off parallel requests; no strict rollback, failures will log
    Promise.allSettled(
      unreadIds.map(id => fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: batchUserId })
      }))
    ).then(results => {
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length) {
        console.warn('Some notifications failed to mark as read');
      }
    });
  };

  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notification.isRead) {
      setUnreadCount(prev => prev - 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment': return '📋';
      case 'update': return '🔄';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return timestamp.toLocaleDateString();
  };

  if (loading) {
    return <div className="notifications-container"><div className="notifications-header"><h2>Loading notifications...</h2></div></div>;
  }
  if (error) {
    return <div className="notifications-container"><div className="notifications-header"><h2 style={{color: 'red'}}>{error}</h2></div></div>;
  }

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <div className="header-content">
          <Link to="/" className="back-button">
            ← Back to Home
          </Link>
          <div className="header-title">
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-read">
              Mark all as read
            </button>
          )}
        </div>
      </header>

      <div className="notifications-content">
        <div className="filter-bar">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={filter === 'unread' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={filter === 'assignment' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('assignment')}
          >
            Assignments
          </button>
          <button 
            className={filter === 'update' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('update')}
          >
            Updates
          </button>
          <button 
            className={filter === 'reminder' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('reminder')}
          >
            Reminders
          </button>
        </div>

        <div className="notifications-list">
          {getFilteredNotifications().length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No notifications</h3>
              <p>You're all caught up! Check back later for new updates.</p>
            </div>
          ) : (
            getFilteredNotifications().map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{notification.title}</h3>
                    <span className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="action-btn mark-read"
                      >
                        Mark as read
                      </button>
                    )}
                    {notification.eventId && (
                      <Link 
                        to={`/EventManage?event=${notification.eventId}`}
                        className="action-btn view-event"
                      >
                        View Event
                      </Link>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="action-btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notification;