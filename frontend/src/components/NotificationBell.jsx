import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getReadNotifications = () => {
    const stored = localStorage.getItem(`readNotifications_${userId}`);
    return stored ? JSON.parse(stored) : [];
  };

  const markNotificationRead = (notificationId) => {
    const readNotifications = getReadNotifications();
    if (!readNotifications.includes(notificationId)) {
      const updated = [...readNotifications, notificationId];
      localStorage.setItem(`readNotifications_${userId}`, JSON.stringify(updated));
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      const data = await response.json();
      // Apply locally stored read status
      const readNotifications = getReadNotifications();
      const updatedData = data.map(notification => ({
        ...notification,
        read: notification.read || readNotifications.includes(notification._id)
      }));
      setNotifications(updatedData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleEventClick = (eventId) => {
    setShowDropdown(false);
    navigate(`/alumni/view-events?eventId=${eventId}`);
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation(); // Prevent event from bubbling up to parent
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        }
      );
      if (response.ok) {
        markNotificationRead(notificationId);
        // Update local state to mark notification as read
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-full hover:bg-blue-700 focus:outline-none relative"
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50"
        >
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`p-4 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    } ${notification.eventId ? 'cursor-pointer' : ''}`}
                    onClick={() => notification.eventId && handleEventClick(notification.eventId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          {notification.eventId && (
                            <>
                              <p className="text-blue-600 text-sm mt-1">
                                Event: {notification.eventId.title}
                              </p>
                              <p className="text-blue-600 text-sm">Click to view event details</p>
                            </>
                          )}
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <p>Sent by {notification.senderDetails?.name}</p>
                            {notification.senderDetails?.department && (
                              <p className="ml-1">({notification.senderDetails.department})</p>
                            )}
                            <span className="mx-2">•</span>
                            <p>{new Date(notification.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification._id, e)}
                          className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
