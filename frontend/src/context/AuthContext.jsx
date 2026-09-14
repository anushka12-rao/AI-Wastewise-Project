import React, { createContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await getMe();
      if (res && res.authenticated) {
        setUser({ email: res.email || 'admin@wastewise.org', role: 'admin' });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res && res.token && typeof window !== 'undefined') {
      localStorage.setItem('wastewise_token', res.token);
    }
    setUser({ email: res.email || email, role: 'admin' });
    return res;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wastewise_token');
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
