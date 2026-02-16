import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import { saveToken, getToken, removeToken, saveUser, getUser } from '../services/auth';

type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profile_photo_url?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // Add this
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    console.log('🔍 AuthProvider mounted, checking auth...');
    checkAuth();
  }, []);

  // Log whenever user state changes
  useEffect(() => {
    console.log('👤 User state changed:', user);
    console.log('🔐 Is authenticated:', !!user);
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log('⏳ Checking existing auth...');
      const token = await getToken();
      const savedUser = await getUser();
      
      console.log('📝 Token found:', !!token);
      console.log('📝 User found:', savedUser);
      
      if (token && savedUser) {
        setUser(savedUser);
        console.log('✅ User restored from storage');
      } else {
        console.log('❌ No existing auth found');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ Auth check complete');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login...', email);
      const response = await authAPI.login(email, password);
      console.log('✅ Login response:', response);
      
      await saveToken(response.token);
      await saveUser(response.user);
      
      console.log('💾 Token and user saved');
      setUser(response.user);
      console.log('✅ Login successful, user set:', response.user);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('📝 Attempting registration...', username, email);
      const response = await authAPI.register(username, email, password);
      console.log('✅ Registration response:', response);
      
      await saveToken(response.token);
      await saveUser(response.user);
      
      console.log('💾 Token and user saved');
      setUser(response.user);
      console.log('✅ Registration successful, user set:', response.user);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    console.log('👋 Logging out...');
    await removeToken();
    setUser(null);
    console.log('✅ Logged out');
  };

  // Add this new function
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const response = await userAPI.getMe();
      console.log('✅ User data refreshed:', response.user);
      
      // Update both state and storage
      setUser(response.user);
      await saveUser(response.user);
      
      console.log('💾 Updated user saved to storage');
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};