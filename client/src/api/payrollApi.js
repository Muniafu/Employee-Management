import axios from 'axios';


const API_BASE_URL4 = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function createClient4() {
    const client = axios.create({ baseURL: API_BASE_URL4, timeout: 15000 });
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

const http4 = createClient4();

// Admin-only: generate payroll for an employee for a specific month
export async function generatePayroll({ employeeId, month, year, baseSalary, bonuses = 0, deductions = 0 }) {
    const { data } = await http4.post('/payrolls', { employeeId, month, year, baseSalary, bonuses, deductions });
    return data?.payroll || data;
}

export async function getPayrollForEmployee(employeeId) {
  const { data } = await http4.get(`/payroll/${employeeId}`);
  return data.payrolls;
}

export async function getPayrolls(employeeId) {
    const { data } = await http4.get(`/payrolls/${employeeId}`);
    return data?.payrolls || data;
}

// Employee self-service
export async function getMyPayrolls() {
  const { data } = await http4.get("/payroll/me");
  return data.payrolls;
}