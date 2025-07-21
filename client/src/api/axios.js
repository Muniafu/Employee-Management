import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const API = {
  auth: {
    login: (data) => instance.post('/user/login', data),
    register: (data) => instance.post('/user/register', data),
    getProfile: () => instance.get('/user/me'),
  },
  employees: {
    create: (data) => instance.post('/super-user/users', data),
    getAll: () => instance.get('/super-user/users'),
    update: (id, data) => instance.patch(`/user/${id}`, data),
  },
  leave: {
    apply: (data) => instance.post('/leave', data),
    getPending: () => instance.get('/leave/pending'),
    updateStatus: (id, data) => instance.patch(`/leave/${id}`, data),
  },
  user: {
    uploadAvatar: (data) => instance.patch('/user/upload-avatar', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    updateProfile: (id, data) => {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      return instance.patch(`/user/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  }
};

export default instance;