import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getMyNotifications, markAsRead } from "../api/notificationApi";

const WS = import.meta.env.VITE_WS_BASE_URL || "http://localhost:5000";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const notes = await getMyNotifications();
      setNotifications(notes);
      setUnreadCount(notes.filter((n) => !n.read).length);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

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

    const socket = io(WS, {
      auth: { token: localStorage.getItem("token") },
    });

    socket.on("connect", () => console.log("✅ WS connected"));
    ["notification", "attendance", "leave", "payroll"].forEach((event) =>
      socket.on(event, (note) => {
        console.log(`📩 ${event}:`, note);
        setNotifications((prev) => [note, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
    );

    socket.on("disconnect", () => console.warn("⚠️ WS disconnected"));

    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  return { notifications, unreadCount, fetchNotifications, markAsRead: handleMarkAsRead };
};

export default useNotifications;