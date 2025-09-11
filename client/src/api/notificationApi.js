import axios from 'axios';

// Employee self-service
export async function getMyNotifications() {
  const { data } = await axios.get("/notifications/me");
  return data.notifications;
}
export async function markAsRead(id) {
  const { data } = await axios.post(`/notifications/${id}/read`);
  return data;
}

// Admin only
export async function createNotification(payload) {
  const { data } = await axios.post("/notifications", payload);
  return data;
}
