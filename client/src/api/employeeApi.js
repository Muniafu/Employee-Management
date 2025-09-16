import api from "./api";

function handleResponse(response) {
  if (!response.success) {
    throw new Error(response.message || "Request failed");
  }
  return response.data;
}

// 🔹 Employee self-service
export async function getMyEmployeeProfile() {
  const { data } = await api.get("/employees/me");
  return handleResponse(data);
}

export const getMyProfile = getMyEmployeeProfile;

export async function updateMyProfile(payload) {
  const { data } = await api.put("/employees/me", payload);
  return handleResponse(data);
}

// 🔹 Admin endpoints
export async function getEmployees() {
  const { data } = await api.get("/employees");
  return handleResponse(data);
}

export async function getEmployee(id) {
  const { data } = await api.get(`/employees/${id}`);
  return handleResponse(data);
}

export async function addEmployee(payload) {
  const { data } = await api.post("/employees", payload);
  return handleResponse(data);
}

export async function updateEmployee(id, payload) {
  const { data } = await api.put(`/employees/${id}`, payload);
  return handleResponse(data);
}

export async function deleteEmployee(id) {
  const { data } = await api.delete(`/employees/${id}`);
  return handleResponse(data);
}

// 🔹 Department helpers
export async function getDepartments() {
  const { data } = await api.get("/departments");
  return handleResponse(data);
}

export async function createDepartment(payload) {
  const { data } = await api.post("/departments", payload);
  return handleResponse(data);
}

export async function updateDepartment(id, payload) {
  const { data } = await api.put(`/departments/${id}`, payload);
  return handleResponse(data);
}

export async function deleteDepartment(id) {
  const { data } = await api.delete(`/departments/${id}`);
  return handleResponse(data);
}