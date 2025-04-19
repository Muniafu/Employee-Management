import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: '${API_URL}/v1',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, 

(error) => Promise.reject(error)
);

// Response: error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('Access denied.');
    } else if (status === 500) {
      toast.error('Server error. Please try again.');
    } else {
      toast.error(err.response?.data?.message || 'An error occurred.');
    }

    return Promise.reject(err);
  }
);

export default api;