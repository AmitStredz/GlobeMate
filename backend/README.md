# GlobeMate Backend - Restructured & Optimized

## Overview
This is the restructured backend for GlobeMate, a travel app focused on Kerala destinations. The backend has been completely reorganized for better maintainability, performance, and scalability.

## Key Improvements Made

### 1. **Clean Database Structure**
- Removed duplicate and redundant tables
- Proper normalization with clear relationships
- Only essential tables: User Profiles, Preferences, Places, and tracking tables

### 2. **Better App Organization**
- **`authentication`**: User authentication, profiles, and email verification
- **`preferences`**: User travel preferences and location data (districts, geographies)
- **`places`**: Place management, caching, favorites, and visit tracking
- **`services`**: External API integrations (Google Places, Weather)

### 3. **Improved Performance**
- Database caching for places and weather data
- Reduced API calls through intelligent caching
- Optimized database queries with proper indexing

### 4. **Enhanced Security**
- Removed redundant password storage (uses Django's built-in User model)
- Proper JWT token management
- Input validation and sanitization

### 5. **Better Code Structure**
- Service layer for external APIs
- Clean separation of concerns
- Reusable serializers and consistent error handling

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/verify-otp/` - Email verification
- `POST /api/auth/resend-otp/` - Resend verification code
- `POST /api/auth/login/` - User login

### Places
- `GET /api/places/` - Get places based on user preferences
- `GET /api/places/details/?place_id=<id>` - Get detailed place information
- `POST /api/places/favorites/toggle/` - Add/remove place from favorites
- `GET /api/places/favorites/` - Get user's favorite places

## Database Schema

### Core Tables
1. **`auth_user`** - Django's built-in user table
2. **`user_profiles`** - Extended user information (age, gender, verification status)
3. **`user_preferences`** - User travel preferences and budget settings
4. **`districts`** - Kerala districts with bounding coordinates
5. **`geographies`** - Geography types (beaches, hills, forests, etc.)
6. **`places`** - Cached place data from Google Places API
7. **`user_favorites`** - User's favorite places
8. **`place_visits`** - Track place detail views

### Removed Tables
- All duplicate `user_auth_*` tables
- Redundant `authentication_traveller` table
- Unnecessary intermediate tables

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# API Keys
GOOGLE_API_KEY=your_google_places_api_key
OPEN_WEATHER_API_KEY=your_openweather_api_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# Django
SECRET_KEY=your_django_secret_key
DEBUG=True
```

## Key Features

### 1. **Smart Place Caching**
- Places are cached in the database after first API call
- Weather data is refreshed every hour
- Reduced external API dependency

### 2. **User Preferences**
- Clean preference system for districts and geography types
- Budget range tracking
- Easy to extend with new preference types

### 3. **Email Verification**
- OTP-based email verification
- Automatic OTP expiry (10 minutes)
- Resend OTP functionality

### 4. **Place Management**
- Favorite places functionality
- Visit tracking for analytics
- Detailed place information with photos and weather

## Installation & Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run the server:**
   ```bash
   python manage.py runserver
   ```

## Data Initialization

The system automatically loads initial data for:
- **14 Kerala Districts** with proper bounding coordinates
- **8 Geography Types** (beaches, hills, forests, historical sites, etc.)

## API Response Examples

### Places List Response:
```json
{
  "places": [
    {
      "id": "uuid",
      "name": "Munnar Hill Station",
      "formatted_address": "Munnar, Kerala, India",
      "rating": 4.5,
      "is_favorited": false,
      "latitude": 10.1632,
      "longitude": 77.1022
    }
  ],
  "count": 1
}
```

### Place Details Response:
```json
{
  "place": {
    "id": "uuid",
    "name": "Munnar Hill Station",
    "formatted_address": "Munnar, Kerala, India",
    "rating": 4.5,
    "photos_data": ["photo_url_1", "photo_url_2"],
    "weather_data": {
      "current": {
        "temperature": 25,
        "humidity": 80
      }
    },
    "is_favorited": false
  }
}
```

## Development Notes

- All external API calls are handled in service classes
- Database queries are optimized with select_related/prefetch_related
- Proper error handling and logging throughout
- Code follows Django best practices
- Ready for production deployment

## Next Steps

1. Add caching layer (Redis) for better performance
2. Implement user analytics and recommendations
3. Add API rate limiting
4. Set up automated testing
5. Add API documentation with Swagger
