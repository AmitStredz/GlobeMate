# GlobeMate API Documentation

## Base URL
```
http://localhost:8000  # Development
```

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### 1. User Registration
**POST** `/api/auth/signup/`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "age": 25,
  "gender": "M",
  "preferred_districts": ["EKM", "IDK", "ALP"],
  "preferred_geographies": ["BEACH", "HILL", "FRST"],
  "budget_range": "medium"
}
```

**Response (201):**
```json
{
  "detail": "Registration successful. Please check your email for verification code.",
  "email": "john@example.com"
}
```

### 2. Email Verification
**POST** `/api/auth/verify-otp/`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "detail": "Email verified successfully.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "profile": {
      "age": 25,
      "gender": "M",
      "is_email_verified": true
    },
    "preferences": {
      "preferred_districts": [
        {"code": "EKM", "name": "Ernakulam"}
      ],
      "preferred_geographies": [
        {"code": "BEACH", "name": "Beach & Coastal"}
      ],
      "budget_range": "medium"
    }
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 3. Resend OTP
**POST** `/api/auth/resend-otp/`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "detail": "New verification code sent to your email."
}
```

### 4. User Login
**POST** `/api/auth/login/`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "detail": "Login successful.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "profile": {
      "age": 25,
      "gender": "M",
      "is_email_verified": true
    },
    "preferences": {
      "preferred_districts": [...],
      "preferred_geographies": [...],
      "budget_range": "medium"
    }
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

## 🏞️ Places Endpoints

### 1. Get Places List (Based on User Preferences)
**GET** `/api/places/` 🔒

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "places": [
    {
      "id": "uuid-1234",
      "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Munnar Hill Station",
      "formatted_address": "Munnar, Kerala 685612, India",
      "latitude": 10.1632,
      "longitude": 77.1022,
      "rating": 4.5,
      "user_ratings_total": 12000,
      "price_level": 2,
      "place_types": ["tourist_attraction", "establishment", "point_of_interest"],
      "first_photo_url": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=...",
      "description": "Munnar is a town and hill station located in the Idukki district of the southwestern Indian state of Kerala, in the Western Ghats mountain range.",
      "is_favorited": false
    }
  ],
  "count": 15
}
```

### 2. Get Place Details
**GET** `/api/places/details/?place_id=<place_uuid>` 🔒

**Parameters:**
- `place_id` (required): UUID of the place

**Response (200):**
```json
{
  "place": {
    "id": "uuid-1234",
    "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Munnar Hill Station",
    "formatted_address": "Munnar, Kerala 685612, India",
    "latitude": 10.1632,
    "longitude": 77.1022,
    "rating": 4.5,
    "user_ratings_total": 12000,
    "price_level": 2,
    "place_types": ["tourist_attraction", "establishment"],
    "photos_data": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=...",
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=..."
    ],
    "description": "Munnar is a town and hill station located in the Idukki district of the southwestern Indian state of Kerala, in the Western Ghats mountain range. Known for its tea gardens, winding paths, holiday facilities and cool climate.",
    "weather_data": {
      "current": {
        "temperature": 18.5,
        "feels_like": 17.2,
        "humidity": 85,
        "pressure": 1013,
        "wind_speed": 3.2,
        "weather": {
          "main": "Clouds",
          "description": "scattered clouds",
          "icon": "03d"
        }
      },
      "hourly": [...],
      "daily": [...],
      "units": {
        "temperature": "Celsius",
        "wind_speed": "meters per second",
        "pressure": "hPa (hectopascal)",
        "humidity": "percentage (%)"
      },
      "last_updated": "2025-09-02T08:30:00"
    },
    "is_favorited": false,
    "created_at": "2025-09-02T08:15:00Z"
  }
}
```

### 3. Toggle Favorite Place
**POST** `/api/places/favorites/toggle/` 🔒

**Request Body:**
```json
{
  "place_id": "uuid-1234"
}
```

**Response (200):**
```json
{
  "detail": "Place added to favorites",
  "is_favorited": true
}
```

### 4. Get User's Favorite Places
**GET** `/api/places/favorites/` 🔒

**Response (200):**
```json
{
  "favorites": [
    {
      "id": 1,
      "place": {
        "id": "uuid-1234",
        "name": "Munnar Hill Station",
        "formatted_address": "Munnar, Kerala 685612, India",
        "rating": 4.5,
        "latitude": 10.1632,
        "longitude": 77.1022,
        "is_favorited": true
      },
      "created_at": "2025-09-02T08:20:00Z"
    }
  ],
  "count": 5
}
```

---

## ⚙️ Preferences Endpoints

### 1. Get Available Districts
**GET** `/api/preferences/districts/`

**Response (200):**
```json
{
  "districts": [
    {"code": "TVM", "name": "Thiruvananthapuram"},
    {"code": "KLM", "name": "Kollam"},
    {"code": "PTA", "name": "Pathanamthitta"},
    {"code": "ALP", "name": "Alappuzha"},
    {"code": "KTM", "name": "Kottayam"},
    {"code": "IDK", "name": "Idukki"},
    {"code": "EKM", "name": "Ernakulam"},
    {"code": "TSR", "name": "Thrissur"},
    {"code": "PLK", "name": "Palakkad"},
    {"code": "MLP", "name": "Malappuram"},
    {"code": "KKD", "name": "Kozhikode"},
    {"code": "WYD", "name": "Wayanad"},
    {"code": "KGD", "name": "Kasaragod"},
    {"code": "KNR", "name": "Kannur"}
  ]
}
```

### 2. Get Available Geography Types
**GET** `/api/preferences/geographies/`

**Response (200):**
```json
{
  "geographies": [
    {
      "code": "BEACH",
      "name": "Beach & Coastal",
      "description": "Coastal areas, beaches, and seaside locations"
    },
    {
      "code": "HILL",
      "name": "Hills & Mountains",
      "description": "Hill stations, mountain peaks, and elevated areas"
    },
    {
      "code": "FRST",
      "name": "Forests & Wildlife",
      "description": "Forest areas, wildlife sanctuaries, and nature reserves"
    },
    {
      "code": "LAKE",
      "name": "Lakes & Backwaters",
      "description": "Lakes, backwaters, and water bodies"
    },
    {
      "code": "HIST",
      "name": "Historical Sites",
      "description": "Historical monuments, forts, and heritage sites"
    },
    {
      "code": "SPRT",
      "name": "Spiritual Places",
      "description": "Temples, churches, mosques, and spiritual destinations"
    },
    {
      "code": "ADV",
      "name": "Adventure Sports",
      "description": "Adventure activities and sports destinations"
    },
    {
      "code": "CULT",
      "name": "Cultural Sites",
      "description": "Cultural centers, art galleries, and local experiences"
    }
  ]
}
```

### 3. Get User Preferences
**GET** `/api/preferences/user/` 🔒

**Response (200):**
```json
{
  "preferences": {
    "preferred_districts": [
      {"code": "EKM", "name": "Ernakulam"},
      {"code": "IDK", "name": "Idukki"}
    ],
    "preferred_geographies": [
      {"code": "BEACH", "name": "Beach & Coastal"},
      {"code": "HILL", "name": "Hills & Mountains"}
    ],
    "budget_range": "medium",
    "created_at": "2025-09-02T08:10:00Z",
    "updated_at": "2025-09-02T08:30:00Z"
  }
}
```

### 4. Update User Preferences
**PUT** `/api/preferences/user/` 🔒

**Request Body:**
```json
{
  "preferred_districts": ["EKM", "IDK", "ALP"],
  "preferred_geographies": ["BEACH", "HILL", "FRST"],
  "budget_range": "high"
}
```

**Response (200):**
```json
{
  "detail": "Preferences updated successfully",
  "preferences": {
    "preferred_districts": [
      {"code": "EKM", "name": "Ernakulam"},
      {"code": "IDK", "name": "Idukki"},
      {"code": "ALP", "name": "Alappuzha"}
    ],
    "preferred_geographies": [
      {"code": "BEACH", "name": "Beach & Coastal"},
      {"code": "HILL", "name": "Hills & Mountains"},
      {"code": "FRST", "name": "Forests & Wildlife"}
    ],
    "budget_range": "high",
    "created_at": "2025-09-02T08:10:00Z",
    "updated_at": "2025-09-02T08:35:00Z"
  }
}
```

---

## 📋 Data Types & Enums

### Gender Choices
- `M` - Male
- `F` - Female
- `O` - Other

### Budget Range Choices
- `low` - Budget (< ₹5000)
- `medium` - Mid-range (₹5000 - ₹15000)
- `high` - Luxury (> ₹15000)

### District Codes
All 14 Kerala districts are available with their 3-letter codes.

### Geography Type Codes
- `BEACH` - Beach & Coastal
- `HILL` - Hills & Mountains
- `FRST` - Forests & Wildlife
- `LAKE` - Lakes & Backwaters
- `HIST` - Historical Sites
- `SPRT` - Spiritual Places
- `ADV` - Adventure Sports
- `CULT` - Cultural Sites

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid input data",
  "field_errors": {
    "email": ["This field is required."],
    "password": ["Password must be at least 8 characters."]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "detail": "User not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "An unexpected error occurred. Please try again later."
}
```

---

## 🔧 Usage Notes

1. **JWT Tokens**: Access tokens expire in 7 days. Use refresh tokens to get new access tokens.

2. **Rate Limiting**: API calls to external services (Google Places, Weather) are cached to improve performance.

3. **Place Caching**: Place details are cached in the database. Weather data is refreshed every hour.

4. **Pagination**: Currently not implemented, but can be added for large datasets.

5. **File Uploads**: Not implemented in current version.

6. **Push Notifications**: Not implemented in current version.

---

## 🚀 Quick Start Example

```javascript
// 1. Register a new user
const signupResponse = await fetch('/api/auth/signup/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'traveler123',
    email: 'traveler@example.com',
    password: 'securepass123',
    age: 28,
    gender: 'M',
    preferred_districts: ['EKM', 'IDK'],
    preferred_geographies: ['BEACH', 'HILL'],
    budget_range: 'medium'
  })
});

// 2. Verify email with OTP
const verifyResponse = await fetch('/api/auth/verify-otp/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'traveler@example.com',
    otp: '123456'
  })
});

const { tokens } = await verifyResponse.json();

// 3. Get places based on preferences
const placesResponse = await fetch('/api/places/', {
  headers: {
    'Authorization': `Bearer ${tokens.access}`
  }
});

const places = await placesResponse.json();
```
