import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';


function createClient() {
    const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
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

export async function login({ usernameOrEmail, password }) {
    const { data } = await http.post('/auth/login', { usernameOrEmail, password });
    // caller may persist token; doing it here is convenient for app defaults
    if (data?.token) localStorage.setItem('token', data.token);
    return data;
}

export async function register({ username,firstName, lastName, email, password, role = 'Employee', employeeId }) {
    const { data } = await http.post('/auth/register', { 
        username,
        firstName,
        lastName, 
        email, 
        password, 
        role, 
        employeeId 
    });
    return data;
}

export async function me() {
    const { data } = await http.get('/auth/me');
    return data?.user || data;
}


export function logout() { localStorage.removeItem('token'); }