export interface District {
  code: string;
  name: string;
}

export interface Geography {
  code: string;
  api_code: string;
  name: string;
}
export interface User {
  id: string;
  email: string;
  username: string;
  gender: string;
  // preferences: string[];
  preferred_districts: District[];
  preferred_geographies: Geography[];
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