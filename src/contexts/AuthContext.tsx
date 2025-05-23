
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedExpiry = localStorage.getItem('token_expiry');
    
    if (savedToken && savedExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(savedExpiry)) {
        setToken(savedToken);
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
      }
    }
  }, []);

  const login = (newToken: string) => {
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('token_expiry', expiryTime.toString());
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
