import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import useNotifications from "../hooks/useNotifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { notifications, unreadCount, markAsRead } = useNotifications();

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        type="button"
        className="btn btn-light position-relative rounded-circle shadow-sm"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell size={20} className="text-secondary" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="dropdown-menu dropdown-menu-end shadow show mt-2 p-0 border-0 rounded"
          style={{ width: "300px" }}
        >
          <ul className="list-group list-group-flush">
            {/* Unread Section */}
            <li className="list-group-item bg-light fw-bold small text-primary">
              Unread
            </li>
            {unread.length > 0 ? (
              unread.map((note) => (
                <li
                  key={note._id}
                  className="list-group-item d-flex align-items-start small bg-white cursor-pointer"
                  onClick={() => markAsRead(note._id)}
                >
                  <span className="me-2 text-primary fw-bold">•</span>
                  <span>{note.message}</span>
                </li>
              ))
            ) : (
              <li className="list-group-item small text-muted text-center">
                No unread notifications
              </li>
            )}

            {/* Read Section */}
            <li className="list-group-item bg-light fw-bold small text-secondary">
              Read
            </li>
            {read.length > 0 ? (
              read.map((note) => (
                <li
                  key={note._id}
                  className="list-group-item d-flex align-items-start small text-muted"
                >
                  <span className="me-2 text-secondary">○</span>
                  <span>{note.message}</span>
                </li>
              ))
            ) : (
              <li className="list-group-item small text-muted text-center">
                No read notifications
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}