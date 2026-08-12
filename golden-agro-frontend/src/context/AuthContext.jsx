import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          return JSON.parse(savedUser);
        }
      } catch {
        // ignore
      }
    }

    // Invalid/expired session -> clear persisted auth state
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return null;
  });

  const loading = false;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    const { token, refreshToken, user: userData } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    const { token, refreshToken, user: userData } = response.data;

    // New behavior: registration may return a "pending approval" response with no token.
    if (token && userData) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    return response.data;
  };

  const isAdmin = user?.role === 'Admin';
  const isManufacturer = user?.role === 'Manufacturer' || isAdmin;
  const isRetailer = user?.role === 'Retailer';

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading,
      isAdmin,
      isManufacturer,
      isRetailer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
