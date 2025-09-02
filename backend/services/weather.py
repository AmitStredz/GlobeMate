"""
Weather API Service
Handles all interactions with OpenWeatherMap API
"""
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional
import os

logger = logging.getLogger(__name__)

class WeatherService:
    """Service class for OpenWeatherMap API interactions"""
    
    def __init__(self):
        self.api_key = os.getenv("OPEN_WEATHER_API_KEY")
        if not self.api_key:
            raise ValueError("OPEN_WEATHER_API_KEY environment variable is required")
        
        self.base_url = "https://api.openweathermap.org/data/3.0/onecall"
    
    def get_weather_data(self, latitude: float, longitude: float) -> Optional[Dict]:
        """
        Get current and forecast weather data for given coordinates
        """
        try:
            params = {
                "lat": latitude,
                "lon": longitude,
                "appid": self.api_key,
                "units": "metric",  # Celsius, m/s, hPa
                "exclude": "alerts,minutely"  # Exclude unnecessary data
            }
            
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Structure the response for frontend consumption
            weather_data = {
                "current": {
                    "temperature": data.get("current", {}).get("temp"),
                    "feels_like": data.get("current", {}).get("feels_like"),
                    "humidity": data.get("current", {}).get("humidity"),
                    "pressure": data.get("current", {}).get("pressure"),
                    "wind_speed": data.get("current", {}).get("wind_speed"),
                    "weather": data.get("current", {}).get("weather", [{}])[0],
                },
                "hourly": data.get("hourly", [])[:24],  # Next 24 hours
                "daily": data.get("daily", [])[:7],     # Next 7 days
                "units": {
                    "temperature": "Celsius",
                    "wind_speed": "meters per second",
                    "pressure": "hPa (hectopascal)",
                    "humidity": "percentage (%)"
                },
                "last_updated": datetime.now().isoformat()
            }
            
            return weather_data
            
        except requests.RequestException as e:
            logger.error(f"Error fetching weather data for {latitude}, {longitude}: {e}")
            return None
    
    def is_weather_data_fresh(self, last_update: datetime, hours: int = 1) -> bool:
        """
        Check if weather data is still fresh (within specified hours)
        """
        if not last_update:
            return False
        
        return datetime.now() - last_update < timedelta(hours=hours)
