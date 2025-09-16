import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getMyNotifications, markAsRead } from "../api/notificationApi";

const WS = import.meta.env.VITE_WS_BASE_URL || "http://localhost:5000";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const mounted = useRef(false);

  const fetchNotifications = async () => {
    try {
      const notes = await getMyNotifications();
      if (!mounted.current) return;
      setNotifications(notes);
      setUnreadCount(notes.filter((n) => !n.read).length);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await markAsRead(id);
      if (!mounted.current) return;
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? updated : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchNotifications();

    const socket = io(WS, {
      auth: { token: () => localStorage.getItem("token") }, // always fresh token
    });
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ WS connected"));

    ["notification", "attendance", "leave", "payroll"].forEach((event) =>
      socket.on(event, (note) => {
        if (!mounted.current) return;
        console.log(`📩 ${event}:`, note);
        setNotifications((prev) => [note, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
    );

    socket.on("disconnect", () => {
      console.warn("⚠️ WS disconnected");
      fetchNotifications(); // catch up on missed events
    });

    return () => {
      mounted.current = false;
      socket.disconnect();
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