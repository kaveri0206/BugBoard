/**
 * @file client/src/context/AuthContext.jsx
 * @description Global AuthContext with named and default exports.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const userData = response.data?.data?.user || response.data?.user || response.data?.data;
        if (userData && isMounted) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        if (isMounted) {
          localStorage.clear();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const payload = response.data?.data || response.data;

    const resolvedToken = payload.accessToken || payload.token;
    const resolvedRefreshToken = payload.refreshToken;
    const resolvedUser = payload.user;

    if (!resolvedToken || !resolvedUser) {
      throw new Error('Invalid authentication response.');
    }

    localStorage.setItem('token', resolvedToken);
    localStorage.setItem('accessToken', resolvedToken);
    if (resolvedRefreshToken) {
      localStorage.setItem('refreshToken', resolvedRefreshToken);
    }
    localStorage.setItem('user', JSON.stringify(resolvedUser));

    api.defaults.headers.common['Authorization'] = `Bearer ${resolvedToken}`;

    setToken(resolvedToken);
    setUser(resolvedUser);

    return resolvedUser;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const payload = response.data?.data || response.data;

    const resolvedToken = payload.accessToken || payload.token;
    const resolvedUser = payload.user;

    if (resolvedToken && resolvedUser) {
      localStorage.setItem('token', resolvedToken);
      localStorage.setItem('accessToken', resolvedToken);
      localStorage.setItem('user', JSON.stringify(resolvedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${resolvedToken}`;
      setToken(resolvedToken);
      setUser(resolvedUser);
    }

    return resolvedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Continue cleanup
    } finally {
      localStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
      window.location.href = '/login';
    }
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        setUser: updateUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;