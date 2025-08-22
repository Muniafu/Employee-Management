import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationBell({ notifications = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
          <ul className="max-h-60 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((note, i) => (
                <li
                  key={i}
                  className="p-2 border-b last:border-none hover:bg-gray-100 text-sm"
                >
                  {note.message}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500 text-sm">No notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}