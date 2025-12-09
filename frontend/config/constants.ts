/**
 * Configuration constants for the GlobeMate app
 * This file centralizes all configuration values for easier maintenance
 */

// API Configuration
export const API_CONFIG = {
  // BASE_URL: __DEV__ ? 'http://127.0.0.1:8000/api' : 'https://your-production-api.com/api',
  // BASE_URL: __DEV__ ? 'http://192.168.1.36:8000/api' : 'https://your-production-api.com/api',
  BASE_URL: __DEV__ ? 'http://192.168.29.229:8000/api' : 'https://your-production-api.com/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// External API Keys (should be moved to environment variables in production)
export const EXTERNAL_APIS = {
  GOOGLE_PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'GlobeMate',
  VERSION: '1.0.0',
  MIN_PASSWORD_LENGTH: 6,
  MAX_OTP_ATTEMPTS: 3,
  OTP_EXPIRY_MINUTES: 10,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
  CARD_BORDER_RADIUS: 12,
  DEFAULT_PADDING: 16,
  ANIMATION_DURATION: 300,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  DEFAULT_PLACE_IMAGE: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
  DEFAULT_AVATAR: 'https://via.placeholder.com/150x150/4A90E2/ffffff?text=User',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'] as const,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  PLACES_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  USER_DATA_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  IMAGES_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection and try again',
  AUTHENTICATION_FAILED: 'Authentication failed. Please log in again',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  SERVER_ERROR: 'Server error. Please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  OTP_SENT: 'Verification code sent to your email',
  OTP_VERIFIED: 'Email verified successfully!',
  PROFILE_UPDATED: 'Profile updated successfully',
  PLACE_BOOKMARKED: 'Place added to bookmarks',
  PLACE_UNBOOKMARKED: 'Place removed from bookmarks',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  OTP_LENGTH: 6,
} as const;

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  MOCK_API_RESPONSES: false,
  BYPASS_OTP: __DEV__, // Only for development
  SHOW_PERFORMANCE_METRICS: __DEV__,
} as const;
