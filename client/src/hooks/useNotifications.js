import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getMyNotifications, markAsRead } from "../api/notificationApi";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from backend (fallback / sync)
  const fetchNotifications = async () => {
    try {
      const notes = await getMyNotifications();
      setNotifications(notes);
      setUnreadCount(notes.filter((n) => !n.read).length);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  // Mark a notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const updated = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? updated : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 🔌 Setup WebSocket connection
    const socket = io(API.replace("/api", ""), {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to notifications WS");
    });

    // Generic notifications (fallback)
    socket.on("notification", (note) => {
      console.log("📩 New notification:", note);
      setNotifications((prev) => [note, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Attendance notifications
    socket.on("attendance", (note) => {
      console.log("🕒 Attendance notification:", note);
      setNotifications((prev) => [note, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Leave notifications
    socket.on("leave", (note) => {
      console.log("🏖️ Leave notification:", note);
      setNotifications((prev) => [note, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Payroll notifications
    socket.on("payroll", (note) => {
      console.log("💰 Payroll notification:", note);
      setNotifications((prev) => [note, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Disconnected from notifications WS");
    });

    // Poll every 60s as a fallback (in case WS missed something)
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
  };
};

export default useNotifications;