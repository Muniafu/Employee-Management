// Context/AuthContext.jsx
import { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import api, { API } from '../api/axios';

const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
  isLoading: false,
  error: null,
  initializeAuth: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    token: null,
    user: null,
    userId: null,
    role: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('authData');
    setAuthState({
      isLoggedIn: false,
      token: null,
      user: null,
      userId: null,
      role: null,
    });
    delete api.defaults.headers.common['Authorization'];
    setError(null);
    setIsLoading(false);
  }, []);

  const initializeAuth = useCallback(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        setAuthState({
          isLoggedIn: true,
          userId: parsedData.userId,
          token: parsedData.token,
          user: parsedData.user,
          role: parsedData.role,
        });
        api.defaults.headers.common['Authorization'] = `Bearer ${parsedData.token}`;

        if (window.location.pathname === '/') {
          if (parsedData.role === 'admin') {
            window.location.href = '/admin';
          } else  {
            window.location.href = '/employee';
          }
        }
      } catch {
        logout();
      }
    }
  }, [logout]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.auth.login(credentials);
      const { user, token, role, _id: userId } = response.data;

      setAuthState({
        isLoggedIn: true,
        user,
        token,
        userId,
        role
      });

      localStorage.setItem('authData', JSON.stringify({
        token,
        user,
        userId,
        role
      }));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    ...authState,
    isAdmin: authState.role === 'admin',
    isEmployee: authState.role === 'employee',
    login,
    logout,
    isLoading,
    error,
    initializeAuth,
  }), [authState, login, logout, isLoading, error, initializeAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;