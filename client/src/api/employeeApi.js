import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function createClient() {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const msg = err?.response?.data?.message || err.message || 'Request failed';
      return Promise.reject(new Error(msg));
    }
  );

  return client;
}

const http = createClient();

export async function getMyEmployeeProfile() {
  // returns { employee: {...} } per backend
  const { data } = await http.get('/employees/me');
  // backend returns { employee: {...} } or error
  return data.employee || data;
}

export async function getMyProfile() {
  // alias for older callers; keep for compatibility
  return getMyEmployeeProfile();
}

export async function getEmployees() {
  // returns { employees: [...] }
  const { data } = await http.get('/employees');
  return data || { employees: [] };
}

export async function getEmployee(id) {
  const { data } = await http.get(`/employees/${id}`);
  return data.employee || data;
}

export async function addEmployee(payload) {
  const { data } = await http.post('/employees', payload);
  return data.employee || data;
}

export async function updateEmployee(id, payload) {
  const { data } = await http.put(`/employees/${id}`, payload);
  return data.employee || data;
}

export async function updateMyProfile(payload) {
  const { data } = await http.put('/employees/me', payload);
  return data.employee || data;
}

export async function deleteEmployee(id) {
  const { data } = await http.delete(`/employees/${id}`);
  return data;
}

// Departments helpers (kept for convenience)
export async function getDepartments() {
  const { data } = await http.get('/departments');
  return data || { departments: [] };
}

export async function createDepartment(payload) {
  const { data } = await http.post('/departments', payload);
  return data.department || data;
}

export async function updateDepartment(id, payload) {
  const { data } = await http.put(`/departments/${id}`, payload);
  return data.department || data;
}

export async function deleteDepartment(id) {
  const { data } = await http.delete(`/departments/${id}`);
  return data;
}