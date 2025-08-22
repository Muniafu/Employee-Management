import { useState, useEffect } from "react";

/**
 * Custom hook for handling notifications.
 * Fetches notifications from backend and provides a stateful API.
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      } else {
        console.error("Failed to fetch notifications:", data.message);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
  };
};

export default useNotifications;