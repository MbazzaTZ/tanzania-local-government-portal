import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext'; // Using the context from previous improvements

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // onSnapshot creates a real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userNotifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      const unread = userNotifications.filter(n => n.status === 'unread').length;
      setNotifications(userNotifications);
      setUnreadCount(unread);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [currentUser]);

  return { notifications, unreadCount };
}