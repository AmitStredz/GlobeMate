import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '@/types';
import { authAPI } from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<string | true>;
  signup: (data: SignupPayload) => Promise<string | true>;
  verifyOTP: (otp: string) => Promise<string | true>;
  logout: () => void;
  pendingEmail: string | null;
  refreshAccessToken: () => Promise<string | true>;
}

// Types for signup
export interface SignupPayload {
  username: string;
  age: number;
  gender: string;
  preferred_districts: string[];
  preferred_geographies: string[];
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: undefined,
  });
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Load token, refresh token, and user from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const user = await AsyncStorage.getItem('user');
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (token && user && storedRefreshToken) {
          setAuthState({
            user: JSON.parse(user),
            isAuthenticated: true,
            isLoading: false,
            token,
          });
          setRefreshToken(storedRefreshToken);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear potentially corrupted data
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      }
    })();
  }, []);

  // Refresh access token using refresh token
  const refreshAccessToken = async (): Promise<string | true> => {
    if (!refreshToken) return 'No refresh token available';
    
    try {
      const data = await authAPI.refreshToken(refreshToken);
      await AsyncStorage.setItem('accessToken', data.access);
      setAuthState(prev => ({ ...prev, token: data.access }));
      return true;
    } catch (error) {
      logout();
      return error instanceof Error ? error.message : 'Token refresh failed';
    }
  };

  // Login with API service
  const login = async (email: string, password: string): Promise<string | true> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const data = await authAPI.login(email, password);
      
      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        token: data.access,
      });
      setRefreshToken(data.refresh);
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return error instanceof Error ? error.message : 'Login failed';
    }
  };

  // Signup with API service
  const signup = async (data: SignupPayload): Promise<string | true> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authAPI.signup(data);
      setPendingEmail(data.email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return error instanceof Error ? error.message : 'Signup failed';
    }
  };

  // OTP verification with API service
  const verifyOTP = async (otp: string): Promise<string | true> => {
    if (!pendingEmail) return 'No email to verify';
    
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const data = await authAPI.verifyOTP(pendingEmail, otp);
      
      await AsyncStorage.setItem('accessToken', data.tokens.access);
      await AsyncStorage.setItem('refreshToken', data.tokens.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        token: data.tokens.access,
      });
      setRefreshToken(data.tokens.refresh);
      setPendingEmail(null);
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return error instanceof Error ? error.message : 'OTP verification failed';
    }
  };

  const logout = async () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: undefined,
    });
    setPendingEmail(null);
    setRefreshToken(null);
    
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      signup,
      verifyOTP,
      logout,
      pendingEmail,
      refreshAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}