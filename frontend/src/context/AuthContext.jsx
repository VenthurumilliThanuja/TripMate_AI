import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tripmate_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tripmate_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('tripmate_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user, message } = res.data;
        localStorage.setItem('tripmate_token', token);
        localStorage.setItem('tripmate_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        showToast(message || 'Logged in successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please verify credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const signup = async (name, email, password, currency = '₹') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, currency });
      if (res.data.success) {
        const { token, user, message } = res.data;
        localStorage.setItem('tripmate_token', token);
        localStorage.setItem('tripmate_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        showToast(message || 'Account created successfully!', 'success');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('tripmate_token');
    localStorage.removeItem('tripmate_user');
    setToken(null);
    setUser(null);
    showToast('Logged out safely.', 'info');
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('tripmate_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        signup,
        logout,
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

