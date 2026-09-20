import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bugboard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('bugboard_token');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.data.user);
          localStorage.setItem('bugboard_user', JSON.stringify(res.data.data.user));
        } catch (e) {
          setUser(null);
          localStorage.removeItem('bugboard_token');
          localStorage.removeItem('bugboard_user');
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    localStorage.setItem('bugboard_user', JSON.stringify(userData));
    localStorage.setItem('bugboard_token', accessToken);
    localStorage.setItem('bugboard_refresh_token', refreshToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('bugboard_refresh_token');
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('bugboard_user');
      localStorage.removeItem('bugboard_token');
      localStorage.removeItem('bugboard_refresh_token');
      // Redirect to the public Homepage on logout
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};