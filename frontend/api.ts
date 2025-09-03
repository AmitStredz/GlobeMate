// Centralized API utility for endpoints and fetch logic

// export const API_BASE_URL = 'http://192.168.149.108:8000/api'; // e.g., http://localhost:8000/api
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlacesAPIResponse, AuthResponse, OTPVerificationResponse } from './types';
import { API_CONFIG, ERROR_MESSAGES } from './config/constants';

export const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to check if token is expired
function isTokenExpired(token?: string): boolean {
  if (!token) return true;
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (!decoded.exp) return true;
    return Date.now() / 1000 > decoded.exp - 30; // 30s leeway
  } catch {
    return true;
  }
}

// Centralized fetch with auto token refresh
export async function apiFetch(
  endpoint: string, 
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requireAuth) {
    let token = await AsyncStorage.getItem('accessToken');
    
    // Check if token needs refresh
    if (isTokenExpired(token ?? undefined)) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            await AsyncStorage.setItem('accessToken', refreshData.access);
            token = refreshData.access;
          } else {
            // Refresh failed, clear tokens
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
          }
        } catch (error) {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
          throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
        }
      } else {
        throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
      }
    }

    if (token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// API service functions
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }
    
    return response.json();
  },

  signup: async (userData: {
    username: string;
    age: number;
    gender: string;
    preferred_districts: string[];
    preferred_geographies: string[];
    email: string;
    password: string;
  }): Promise<{ message: string }> => {
    const response = await apiFetch('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      let errorMessage = 'Signup failed';
      if (error.detail) {
        errorMessage = error.detail;
      } else if (typeof error === 'object') {
        errorMessage = Object.entries(error)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  verifyOTP: async (email: string, otp: string): Promise<OTPVerificationResponse> => {
    const response = await apiFetch('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }, false);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'OTP verification failed');
    }
    
    return response.json();
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await apiFetch('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    }, false);
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    return response.json();
  },
};

export const placesAPI = {
  getPlaces: async (): Promise<PlacesAPIResponse> => {
    const response = await apiFetch('/places/');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch places');
    }
    
    return response.json();
  },

  getPlaceDetails: async (placeId: string): Promise<any> => {
    const response = await apiFetch(`/places/${placeId}/`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch place details');
    }
    
    return response.json();
  },
};

export const preferencesAPI = {
  getDistricts: async (): Promise<any[]> => {
    const response = await apiFetch('/preferences/districts/');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch districts');
    }
    
    return response.json();
  },

  getGeographies: async (): Promise<any[]> => {
    const response = await apiFetch('/preferences/geographies/');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch geographies');
    }
    
    return response.json();
  },
}; // e.g., http://localhost:8000/api
// export const API_BASE_URL = 'http://0.0.0:8000/api'; // e.g., http://localhost:8000/api
