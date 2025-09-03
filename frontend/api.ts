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

  getUserProfile: async (): Promise<any> => {
    const response = await apiFetch('/auth/profile/');
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
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
};

export const localHostAPI = {
  // Application management
  submitApplication: async (applicationData: {
    fullName: string;
    age: number;
    address: string;
    phoneNumber: string;
    aadhaarNumber: string;
    panNumber: string;
    services: string[];
    customService?: string;
    description: string;
    experienceYears?: number;
    priceRange?: string;
    availability?: string;
    documentsProvided: string[];
  }): Promise<{ message: string; application_id: number; status: string }> => {
    const response = await apiFetch('/local-hosts/apply/', {
      method: 'POST',
      body: JSON.stringify({
        full_name: applicationData.fullName,
        age: applicationData.age,
        address: applicationData.address,
        phone_number: applicationData.phoneNumber,
        aadhaar_number: applicationData.aadhaarNumber,
        pan_number: applicationData.panNumber,
        services_offered: applicationData.services,
        custom_service: applicationData.customService,
        service_description: applicationData.description,
        experience_years: applicationData.experienceYears,
        price_range: applicationData.priceRange,
        availability: applicationData.availability,
        documents_provided: applicationData.documentsProvided,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      let errorMessage = 'Application submission failed';
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

  getApplicationStatus: async (): Promise<{
    has_application: boolean;
    application: any;
  }> => {
    const response = await apiFetch('/local-hosts/status/');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch application status');
    }
    
    return response.json();
  },

  getProfile: async (): Promise<any> => {
    const response = await apiFetch('/local-hosts/profile/');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch profile');
    }
    
    return response.json();
  },

  // Public views
  getLocalHosts: async (params?: {
    services?: string;
    search?: string;
    page?: number;
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.services) searchParams.append('services', params.services);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    
    const response = await apiFetch(
      `/local-hosts/${searchParams.toString() ? '?' + searchParams.toString() : ''}`,
      {},
      false
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch local hosts');
    }
    
    return response.json();
  },

  getLocalHostDetail: async (id: number): Promise<any> => {
    const response = await apiFetch(`/local-hosts/${id}/`, {}, false);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch local host details');
    }
    
    return response.json();
  },

  getConstants: async (): Promise<{
    services: Array<{ code: string; name: string }>;
    documents: Array<{ code: string; name: string }>;
    statuses: Array<{ code: string; name: string }>;
  }> => {
    const response = await apiFetch('/local-hosts/constants/', {}, false);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch constants');
    }
    
    return response.json();
  },

  // Bookings
  createBooking: async (bookingData: {
    local_host: number;
    service_type: string;
    start_date: string;
    end_date: string;
    number_of_people: number;
    special_requests?: string;
  }): Promise<any> => {
    const response = await apiFetch('/local-hosts/bookings/create/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to create booking');
    }
    
    return response.json();
  },

  getBookings: async (): Promise<any> => {
    const response = await apiFetch('/local-hosts/bookings/');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch bookings');
    }
    
    return response.json();
  },
}; // e.g., http://localhost:8000/api
// export const API_BASE_URL = 'http://0.0.0:8000/api'; // e.g., http://localhost:8000/api
