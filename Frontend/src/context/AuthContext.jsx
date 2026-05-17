import { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const token = res.data?.token;
      const userData = res.data?.user;
      if (!token || !userData) {
        throw new Error('Invalid login response from server');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoading(false);
      return { ok: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      setLoading(false);
      return { ok: false, message: msg };
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.register({ username, email, password });
      setLoading(false);
      return { ok: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to register user.';
      setError(msg);
      setLoading(false);
      return { ok: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
