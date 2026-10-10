import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('lm_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('lm_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('lm_token')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener('lm:logout', logout);
    return () => window.removeEventListener('lm:logout', logout);
  }, [logout]);

  const persist = (data) => {
    localStorage.setItem('lm_token', data.token);
    setUser(data.user);
    return data.user;
  };
  const login = async (email, password) => persist((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => persist((await api.post('/auth/register', form)).data);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>{children}</AuthContext.Provider>;
}
