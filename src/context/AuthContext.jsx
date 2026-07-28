import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const MOCK_USER = {
  id: 'USR-001',
  name: 'Dr. K. Menon',
  email: 'admin@labpro.in',
  role: 'Administrator',
  avatar: 'DK',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('labpro_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // JWT-ready: replace with real API call
    if (email === 'admin@labpro.in' && password === 'admin123') {
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('labpro_token', token);
      localStorage.setItem('labpro_user', JSON.stringify(MOCK_USER));
      setUser(MOCK_USER);
      toast.success(`Welcome back, ${MOCK_USER.name}`);
      return { user: MOCK_USER, token };
    }
    throw new Error('Invalid email or password');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('labpro_token');
    localStorage.removeItem('labpro_user');
    setUser(null);
    toast.success('Signed out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

