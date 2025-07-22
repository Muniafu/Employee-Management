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
    login: (data) => instance.post('/users/login', data),
    register: (data) => instance.post('/users/register', data),
    getProfile: (uid) => instance.get(`/users/${uid}`),
  },
  employees: {
    create: (data) => instance.post('/super-user/users', data),
    getAll: () => instance.get('/super-user/users'),
    delete: (id) => instance.delete(`/super-user/users/${id}`),
    update: (id, data) => {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      return instance.patch(`/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  },
  leave: {
    apply: (uid, data) => instance.post(`/leaves/users/${uid}`, data),
    getUserLeaves: (uid) => instance.get(`/leaves/users/${uid}`),
    getPending: () => instance.get('/leave/pending'),
    updateStatus: (id, data) => instance.patch(`/leaves/${id}`, data),
  },
  user: {
    uploadAvatar: (data) => instance.patch('/users/upload-avatar', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  }
};

export default instance;