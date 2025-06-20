export interface User {
  id: string;
  email: string;
  name: string;
  preferences: string[];
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