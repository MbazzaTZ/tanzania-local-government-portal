import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useNavigate } from 'react-router-dom';

// You will need a Bell icon from a library like react-icons
// import { FaBell } from 'react-icons/fa';

export default function NotificationBell() {
  const { notifications, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Mark notifications as read when the user opens the dropdown
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.status === 'unread');
    for (const notification of unreadNotifications) {
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, { status: 'read' });
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  }

  return (
    <div className="relative">
      <button onClick={handleToggle} className="relative">
        {/* <FaBell size={24} /> */}
        <p>🔔</p> {/* Placeholder for icon */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20">
          <div className="py-2 px-4 font-bold border-b">Notifications</div>
          {notifications.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b hover:bg-gray-100 cursor-pointer ${n.status === 'unread' ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt?.toDate()).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

// Function to create a notification
const createNotification = async (userId, message, link = null) => {
  await addDoc(collection(db, 'notifications'), {
    userId,
    message,
    link,
    status: 'unread',
    createdAt: serverTimestamp(),
  });
};

// Example function that an admin would use
export const processRequest = async (request, newStatus, feedbackMessage) => {
  // 1. Update the request document in Firestore
  const requestRef = doc(db, 'requests', request.id);
  await updateDoc(requestRef, { status: newStatus });

  // 2. Create a notification for the citizen who made the request
  const citizenUserId = request.userId; // Assuming the request document has the citizen's ID
  await createNotification(citizenUserId, feedbackMessage, `/requests/${request.id}`);
};

// To notify an admin when a new request is submitted
export const submitNewRequest = async (requestData) => {
    // 1. Add the new request to the 'requests' collection
    await addDoc(collection(db, 'requests'), requestData);

    // 2. Create a notification for admins
    // This is a simplified approach. A better method would be to query for all admin UIDs.
    const adminUserId = 'ADMIN_USER_ID_HERE'; // In a real app, you would look this up
    await createNotification(adminUserId, `New request submitted by ${requestData.citizenName}.`);
}