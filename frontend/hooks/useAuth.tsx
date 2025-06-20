import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '@/types';
import { API_BASE_URL } from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupPayload) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  logout: () => void;
  pendingEmail: string | null;
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

  // Load token and user from storage on mount
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        setAuthState({
          user: JSON.parse(user),
          isAuthenticated: true,
          isLoading: false,
          token,
        });
      }
    })();
  }, []);

  // Real API call for login
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        let message = 'Login failed';
        try {
          const err = await res.json();
          message = err.message || message;
        } catch {}
        console.error(message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      const data = await res.json();
      const token = data.token || data.access || data.access_token;
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        token,
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Real API call for signup
  const signup = async (data: SignupPayload): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let message = 'Signup failed';
        try {
          const err = await res.json();
          message = err.message || message;
        } catch {}
        console.error(message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      setPendingEmail(data.email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Real API call for OTP verification
  const verifyOTP = async (otp: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      if (!pendingEmail) throw new Error('No email to verify');
      const res = await fetch(`${API_BASE_URL}/verifyotp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      if (!res.ok) {
        let message = 'OTP verification failed';
        try {
          const err = await res.json();
          message = err.message || message;
        } catch {}
        console.error(message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      const data = await res.json();
      const token = data.token || data.access || data.access_token;
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        token,
      });
      setPendingEmail(null);
      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: undefined,
    });
    setPendingEmail(null);
    AsyncStorage.removeItem('accessToken');
    AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      signup,
      verifyOTP,
      logout,
      pendingEmail,
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