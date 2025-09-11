import axios from 'axios';

const API_BASE_URL3 = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function createClient3() {
    const client = axios.create({ baseURL: API_BASE_URL3, timeout: 15000 });
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

const http3 = createClient3();

// Clock In
export async function clockIn(employeeId) {
    const { data } = await http3.post('/attendance/clock-in', { employeeId });
    return data?.attendance || data;
}

// Clock Out
export async function clockOut(employeeId) {
    const { data } = await http3.post('/attendance/clock-out', { employeeId });
    return data?.attendance || data;
}

// Admin: view attendance of all employees
export async function getAttendance() {
    const { data } = await http3.get('/attendance');
    return data;
}

// Employee self-service
export async function getMyAttendance() {
  const { data } = await http3.get("/attendance/me");
  return data.attendance;
}

// Depending on your backend route, attempt both common patterns for flexibility.
export async function getAttendanceForEmployee(employeeId) {
    try {
        const { data } = await http3.get(`/attendance/${employeeId}`);
        return data?.attendance || data;
    } catch {
        const { data } = await http3.get('/attendance', { params: { employeeId } });
        return data?.attendance || data;
    }
}