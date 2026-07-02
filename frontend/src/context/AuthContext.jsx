import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      const response = await axios.get('/api/auth/me');
      const userData = response.data.data;
      setUser(userData);
      setIsAuthenticated(true);
      // Keep role cached so axios can redirect to the right login page
      localStorage.setItem('user', JSON.stringify({ role: userData.role }));
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, expectedRole = null) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { user: userData, accessToken, refreshToken } = response.data.data;

    // Admins never sign in through this portal
    if (userData.role === 'admin') {
      throw new Error('Please use the admin portal to login.');
    }

    // If the caller pinned a specific role (e.g. the student login page),
    // reject any mismatch and clear the just-issued tokens so we don't
    // partially authenticate.
    if (expectedRole && userData.role !== expectedRole) {
      const label = expectedRole === 'student' ? 'students' : expectedRole + 's';
      throw new Error(`This login page is for ${label} only.`);
    }

    // The main /login page is only for institution admins and teachers —
    // students must use /student-login (their credentials came by email).
    if (!expectedRole && userData.role === 'student') {
      throw new Error('Students must sign in from the Student Portal.');
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Cache role so axios redirect helper knows which login page to use
    localStorage.setItem('user', JSON.stringify({ role: userData.role }));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = async () => {
    try { await axios.post('/api/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
