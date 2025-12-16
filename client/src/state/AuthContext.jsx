import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // In a real app: add /me endpoint; for now we rely on localStorage
    const stored = localStorage.getItem('eventpass_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    setUser(res.data.user);
    localStorage.setItem('eventpass_user', JSON.stringify(res.data.user));
  };

  const register = async (name, email, password, role) => {
    const res = await axios.post('/auth/register', { name, email, password, role });
    setUser(res.data.user);
    localStorage.setItem('eventpass_user', JSON.stringify(res.data.user));
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    setUser(null);
    localStorage.removeItem('eventpass_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


