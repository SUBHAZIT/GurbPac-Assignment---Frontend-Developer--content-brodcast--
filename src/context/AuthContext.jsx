import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/auth.service';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    
    // Role-based redirect
    const role = currentUser.profile?.role;
    if (role === 'principal') {
      navigate('/principal/dashboard');
    } else if (role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/live/all');
    }
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/auth');
  };

  // Refresh user data (after profile edit)
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
