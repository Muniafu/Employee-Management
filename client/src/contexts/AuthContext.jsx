import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
});
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login page after logout
    navigate('/login');
  }, [navigate]);


  const safelyParseUser = (userString) => {
    try {
      const parsed = JSON.parse(userString);
      if (parsed && typeof parsed === 'object' && parsed.role) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        const parsedUser = safelyParseUser(storedUser);

        if (storedUser && parsedUser && token) {
          setUser(parsedUser);

          setToken(token);
        } else {
          console.error("Failed to parse user:");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Auto-login failed", err);
        logout();
      }
    };

    autoLogin();
  }, [logout, token]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/v1/auth/login', { email, password });
      const {token, user} = res.data;
      setToken(token);

      const safeUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      setUser(safeUser);
      localStorage.setItem('user', JSON.stringify(safeUser));
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
      localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw for error handling in components
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const Auth = () => useContext(AuthContext);