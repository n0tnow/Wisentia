// src/app/notifications/page.jsx
"use client";
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update the UI
      setNotifications(notifications.map(notification => 
        notification.NotificationID === notificationId 
          ? {...notification, IsRead: true} 
          : notification
      ));
      setUnreadCount(prevCount => prevCount > 0 ? prevCount - 1 : 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update the UI
      setNotifications(notifications.map(notification => ({...notification, IsRead: true})));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/dismiss`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to dismiss notification');
      }
      
      // Remove from UI
      setNotifications(notifications.filter(
        notification => notification.NotificationID !== notificationId
      ));
      
      // Update unread count if it was unread
      const dismissedNotification = notifications.find(
        notification => notification.NotificationID === notificationId
      );
      if (dismissedNotification && !dismissedNotification.IsRead) {
        setUnreadCount(prevCount => prevCount > 0 ? prevCount - 1 : 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading notifications...</p>
      </div>
    </MainLayout>
  );

  if (error) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Mark All as Read
            </button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">You have no notifications</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md divide-y">
            {notifications.map((notification) => (
              <div 
                key={notification.NotificationID} 
                className={`p-4 hover:bg-gray-50 ${!notification.IsRead ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{notification.Title}</h3>
                    <p className="text-gray-600 mt-1">{notification.Message}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {new Date(notification.CreationDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.IsRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.NotificationID)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDismissNotification(notification.NotificationID)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                
                {notification.NotificationType === 'quest' && (
                  <a 
                    href={`/quests/${notification.RelatedEntityID}`}
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    View Quest
                  </a>
                )}
                
                {notification.NotificationType === 'achievement' && (
                  <a 
                    href="/profile"
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    View Profile
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}