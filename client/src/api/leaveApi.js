import axios from 'axios';

// Employee self-service
export async function getMyLeaves() {
  const { data } = await axios.get("/leaves/me");
  return data.leaves;
}
export async function requestLeave(payload) {
  const { data } = await axios.post("/leaves", payload);
  return data;
}

// Admin view
export async function getLeaves(employeeId) {
  const { data } = await axios.get(`/leaves`, {
    params: employeeId ? { employeeId } : {}
  });
  return data.leaves;
}
export async function approveLeave(id) {
  const { data } = await axios.post(`/leaves/${id}/approve`);
  return data;
}
export async function rejectLeave(id) {
  const { data } = await axios.post(`/leaves/${id}/reject`);
  return data;
}