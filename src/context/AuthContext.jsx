import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'USR-001',
  name: 'Dr. Senaka Weeraratne',
  email: 'admin@medicare.plus',
  role: 'Hospital Administrator',
  department: 'Executive Administration',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  hospital: 'MediCare Plus Hospital',
  lastLogin: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
};

export const AuthProvider = ({ children }) => {
  // Check session storage or default to logged in for seamless demo review
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('medicare_demo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USER;
      }
    }
    return DEMO_USER;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password, remember = false) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Demo validation
    if (!email || !password) {
      setIsLoading(false);
      throw new Error('Please provide both username/email and password.');
    }

    // Allow standard demo credentials or any email ending in medicare.plus
    const authenticatedUser = {
      ...DEMO_USER,
      email: email.trim(),
    };

    setUser(authenticatedUser);
    if (remember) {
      sessionStorage.setItem('medicare_demo_user', JSON.stringify(authenticatedUser));
    }
    setIsLoading(false);
    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('medicare_demo_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        demoCredentials: {
          email: 'admin@medicare.plus',
          password: 'password123',
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
