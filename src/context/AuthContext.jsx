import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'medicare_token';
const USER_KEY = 'medicare_user';
const STORAGE_TYPE_KEY = 'medicare_remember';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  });

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Clear all stored auth data
  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORAGE_TYPE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(STORAGE_TYPE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Verify stored token on initial load
  useEffect(() => {
    const verifySession = async () => {
      const activeToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (!activeToken) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const verifiedUser = await authService.getCurrentUser(activeToken);
        setUser(verifiedUser);
        setToken(activeToken);
        const remember = localStorage.getItem(STORAGE_TYPE_KEY) === 'true';
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(USER_KEY, JSON.stringify(verifiedUser));
      } catch {
        // Token expired or invalid
        clearAuthStorage();
      } finally {
        setIsInitialLoading(false);
      }
    };

    verifySession();
  }, [clearAuthStorage]);

  /**
   * Login user with email & password against PostgreSQL backend
   */
  const login = async (email, password, remember = false) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(email, password);
      const { token: receivedToken, user: receivedUser } = authData;

      // Select storage according to "Remember me"
      const storage = remember ? localStorage : sessionStorage;
      // Clear opposite storage
      if (remember) {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        localStorage.setItem(STORAGE_TYPE_KEY, 'true');
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(STORAGE_TYPE_KEY);
      }

      storage.setItem(TOKEN_KEY, receivedToken);
      storage.setItem(USER_KEY, JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return receivedUser;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user from session
   */
  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } finally {
      clearAuthStorage();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isInitialLoading,
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
