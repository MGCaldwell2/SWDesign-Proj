import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './notification.css';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data for Assignment 1 purposes
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'assignment',
        title: 'New Event Assignment',
        message: 'You have been assigned to "Community Food Drive" on December 15, 2024.',
        timestamp: new Date('2024-12-10T10:30:00'),
        isRead: false,
        priority: 'high',
        eventId: 'evt_001'
      },
      {
        id: 2,
        type: 'update',
        title: 'Event Update',
        message: 'The location for "Beach Cleanup" has been changed to Sunset Beach Park.',
        timestamp: new Date('2024-12-09T14:20:00'),
        isRead: false,
        priority: 'medium',
        eventId: 'evt_002'
      },
      {
        id: 3,
        type: 'reminder',
        title: 'Event Reminder',
        message: 'Don\'t forget! "Senior Center Visit" is tomorrow at 2:00 PM.',
        timestamp: new Date('2024-12-08T09:00:00'),
        isRead: true,
        priority: 'medium',
        eventId: 'evt_003'
      },
      {
        id: 4,
        type: 'assignment',
        title: 'New Event Assignment',
        message: 'You have been assigned to "Holiday Toy Drive" on December 20, 2024.',
        timestamp: new Date('2024-12-07T16:45:00'),
        isRead: true,
        priority: 'high',
        eventId: 'evt_004'
      },
      {
        id: 5,
        type: 'update',
        title: 'Schedule Change',
        message: 'The start time for "Library Reading Program" has been moved to 10:00 AM.',
        timestamp: new Date('2024-12-06T11:15:00'),
        isRead: false,
        priority: 'low',
        eventId: 'evt_005'
      },
      {
        id: 6,
        type: 'reminder',
        title: 'Training Reminder',
        message: 'Complete your volunteer orientation before your next assignment.',
        timestamp: new Date('2024-12-05T08:30:00'),
        isRead: true,
        priority: 'medium',
        eventId: null
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
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