import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios.js';
import { connectSocket, disconnectSocket } from '../lib/socket.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('rc_user', JSON.stringify(res.data.user));
          connectSocket();
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('rc_user');
        localStorage.removeItem('rc_token');
        disconnectSocket();
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('rc_token', res.data.token);
      localStorage.setItem('rc_user', JSON.stringify(res.data.user));
      connectSocket();
      return res.data.user;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('rc_token', res.data.token);
      localStorage.setItem('rc_user', JSON.stringify(res.data.user));
      connectSocket();
      return res.data.user;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_user');
    disconnectSocket();
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('rc_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

