import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Employee self-service
export async function getMyNotifications() {
  const { data } = await axios.get(`${API}/notifications/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return data.notifications;
}

export async function markAsRead(id) {
  const { data } = await axios.put(
    `${API}/notifications/${id}/read`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  return data.notification;
}

// Admin only
export async function createNotification(payload) {
  const { data } = await axios.post(`${API}/notifications`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return data.notification;
}