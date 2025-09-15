import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Employee self-service
export async function getMyLeaves() {
  const { data } = await axios.get(`${API}/leaves/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return data.leaves;
}

export async function requestLeave(payload) {
  const { data } = await axios.post(`${API}/leaves`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return data;
}

// Admin view
export async function getLeaves(employeeId) {
  const { data } = await axios.get(`${API}/leaves`, {
    params: employeeId ? { employeeId } : {},
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return data.leaves;
}

export async function approveLeave(id) {
  const { data } = await axios.put(`${API}/leaves/${id}/approve`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return data;
}

export async function rejectLeave(id) {
  const { data } = await axios.put(`${API}/leaves/${id}/reject`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  return data;
}