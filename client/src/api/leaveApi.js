import api from "./api";

export async function getMyLeaves() {
  const { data } = await api.get("/leaves/me");
  return data.leaves;
}

export async function requestLeave(payload) {
  const { data } = await api.post("/leaves", payload);
  return data;
}

export async function getLeaves(employeeId) {
  const { data } = await api.get("/leaves", {
    params: employeeId ? { employeeId } : {},
  });
  return data.leaves;
}

export async function approveLeave(id) {
  const { data } = await api.put(`/leaves/${id}/approve`);
  return data;
}

export async function rejectLeave(id) {
  const { data } = await api.put(`/leaves/${id}/reject`);
  return data;
}