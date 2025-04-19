import api from './api';

const AuthService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid server response');
      }

      // Store token immediately after successful login
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      this.clearAuthStorage();
      throw this.handleAuthError(error);
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  },

  async validateToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No active session');

      const response = await api.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data?.user) {
        throw new Error('Invalid user data');
      }

      return response.data.user;
    } catch (error) {
      this.clearAuthStorage();
      throw this.handleAuthError(error);
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthStorage();
    }
  },

  clearAuthStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
  },

  handleAuthError(error) {
    const defaultMessage = error.response?.status === 401 
      ? 'Invalid credentials' 
      : 'Authentication failed';
      
    return new Error(error.response?.data?.message || error.message || defaultMessage);
  }
};

export const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.role || null;
    } catch {
      return null;
    }
};  

export default AuthService;