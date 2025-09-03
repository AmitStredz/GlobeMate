export interface District {
  code: string;
  name: string;
}

export interface Geography {
  code: string;
  name: string;
  description: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  profile: {
    id: number;
    username: string;
    email: string;
    age: number;
    gender: string;
    is_email_verified: boolean;
    created_at: string;
  };
  preferences: {
    preferred_districts: District[];
    preferred_geographies: Geography[];
    budget_range: string;
  };
}

export interface Place {
  id: string;
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  place_types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: any;
  photos?: any[];
  website?: string;
  url?: string;
  formatted_phone_number?: string;
  description?: string;
  first_photo_url?: string;
  weather_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Destination {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  price: string;
  rating: number;
  category: string;
  tags: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string; 
}

export interface Post {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  location: string;
  date: string;
}

// API Response types to match backend
export interface PlacesAPIResponse {
  places: Place[];
  count: number;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface OTPVerificationResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}