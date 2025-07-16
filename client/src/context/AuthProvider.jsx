import { useState } from 'react';
import axios from "../api/axios";
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    userId: null,
    token: null,
    isSuperUser: false,
    currentUser: null
  });

  const login = (token, userId, userName, isSuperUser) => {
    setAuth({
      isLoggedIn: true,
      token,
      userId,
      userName,
      isSuperUser,
      currentUser: { _id: userId, name: userName }
    });
    // Store in localStorage
    localStorage.setItem('auth', JSON.stringify({
      token, userId, userName, isSuperUser
    }));
    // Set axios default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setAuth({
      isLoggedIn: false,
      userId: null,
      token: null,
      isSuperUser: false,
      currentUser: null
    });
    localStorage.removeItem('auth');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};