import axios from 'axios';


const API_BASE_URL2 = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';


function createClient2() {
    const client = axios.create({ baseURL: API_BASE_URL2, timeout: 15000 });
    client.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    client.interceptors.response.use(
        (res) => res,
        (err) => Promise.reject(new Error(err?.response?.data?.message || err.message))
    );
    return client;
}

const http2 = createClient2();

export async function getMyProfile() {
  const { data } = await http2.get('/employees/me');
  return data;
}

export async function updateMyProfile(payload) {
  const { data } = await http2.put('/employees/me', payload);
  return data;
}

export async function addEmployee(payload) {
    const { data } = await http2.post('/employees', payload);
    return data?.employee || data;
}

export async function getEmployees() {
    const { data } = await http2.get('/employees');
    return data?.employees || data;
}

export async function getEmployee(id) {
    const { data } = await http2.get(`/employees/${id}`);
    return data?.employee || data;
}

export async function getMyEmployeeProfile() {
  const { data } = await http2.get('/employees/me');
  return data?.employee || data;
}

export async function updateEmployee(id, payload) {
    const { data } = await http2.put(`/employees/${id}`, payload);
    return data?.employee || data;
}


export async function deleteEmployee(id) {
    const { data } = await http2.delete(`/employees/${id}`);
    return data;
}

export async function getDepartments() {
    const { data } = await http2.get('/departments');
    return data?.departments || data;
}

export async function createDepartment(payload) {
    const { data } = await http2.post('/departments', payload);
    return data?.department || data;
}

export async function deleteDepartment(id) {
    const { data } = await http2.delete(`/departments/${id}`);
    return data;
}

export async function updateDepartment(id, payload) {
    const { data } = await http2.put(`/departments/${id}`, payload);
    return data?.department || data;
}