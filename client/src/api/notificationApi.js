import api from "./api";

export async function getMyNotifications() {
  const { data } = await api.get("/notifications/me");
  return data.notifications;
}

export async function markAsRead(id) {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data.notification;
}

export async function createNotification(payload) {
  const { data } = await api.post("/notifications", payload);
  return data.notification;
}