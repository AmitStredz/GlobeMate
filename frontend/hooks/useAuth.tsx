import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '@/types';
import { API_BASE_URL } from '@/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<string | true>;
  signup: (data: SignupPayload) => Promise<string | true>;
  verifyOTP: (otp: string) => Promise<string | true>;
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
  const login = async (email: string, password: string): Promise<string | true> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {}
      if (!res.ok) {
        let message = 'Login failed';
        if (data) {
          if (typeof data.detail === 'string') message = data.detail;
          else if (typeof data === 'object') message = Object.values(data).flat().join(' ');
        }
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return message;
      }
      const token = data.access ;
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
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return 'Login error: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Real API call for signup
  const signup = async (data: SignupPayload): Promise<string | true> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      let respData;
      try {
        respData = await res.json();
      } catch {}
      if (!res.ok) {
        let message = 'Signup failed';
        if (respData) {
          if (typeof respData.detail === 'string') message = respData.detail;
          else if (typeof respData === 'object') message = Object.entries(respData).map(([k, v]) => `${k}: ${(Array.isArray(v) ? v.join(', ') : v)}`).join('\n');
        }
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return message;
      }
      setPendingEmail(data.email);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return 'Signup error: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Real API call for OTP verification
  const verifyOTP = async (otp: string): Promise<string | true> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      if (!pendingEmail) return 'No email to verify';
      const res = await fetch(`${API_BASE_URL}/verifyotp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      let data;
      try {
        data = await res.json();
      } catch {}
      if (!res.ok) {
        let message = 'OTP verification failed';
        if (data) {
          if (typeof data.detail === 'string') message = data.detail;
          else if (typeof data === 'object') message = Object.values(data).flat().join(' ');
        }
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return message;
      }
      const token = data.access;
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
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return 'OTP verification error: ' + (error instanceof Error ? error.message : 'Unknown error');
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