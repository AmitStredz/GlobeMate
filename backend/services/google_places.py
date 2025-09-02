"""
Google Places API Service
Handles all interactions with Google Places API
"""
import requests
import logging
from django.conf import settings
from typing import List, Dict, Optional
import os

logger = logging.getLogger(__name__)

class GooglePlacesService:
    """Service class for Google Places API interactions"""
    
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.search_url = "https://places.googleapis.com/v1/places:searchText"
        self.details_url = "https://maps.googleapis.com/maps/api/place/details/json"
        self.photo_url = "https://maps.googleapis.com/maps/api/place/photo"
        
        self.headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.displayName,places.id,places.location"
        }
    
    def search_places(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search for places using text query
        """
        try:
            payload = {
                "textQuery": query,
                "maxResultCount": max_results,
                "languageCode": "en"
            }
            
            response = requests.post(
                self.search_url, 
                headers=self.headers, 
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json().get("places", [])
            
        except requests.RequestException as e:
            logger.error(f"Error searching places: {e}")
            return []
    
    def get_place_details(self, place_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific place
        """
        try:
            params = {
                "place_id": place_id,
                "fields": "name,formatted_address,geometry,rating,user_ratings_total,types,url,price_level,photos,editorial_summary,reviews",
                "key": self.api_key
            }
            
            response = requests.get(self.details_url, params=params, timeout=30)
            response.raise_for_status()
            
            result = response.json().get("result", {})
            
            # Process photos to get URLs
            photos = result.get("photos", [])
            photo_urls = []
            
            for photo in photos[:5]:  # Limit to 5 photos
                photo_ref = photo.get("photo_reference")
                if photo_ref:
                    photo_url = f"{self.photo_url}?maxwidth=800&photoreference={photo_ref}&key={self.api_key}"
                    photo_urls.append(photo_url)
            
            result["photo_urls"] = photo_urls
            result.pop("photos", None)  # Remove original photos data
            
            return result
            
        except requests.RequestException as e:
            logger.error(f"Error getting place details for {place_id}: {e}")
            return None
    
    def search_places_by_preferences(self, districts: List[str], geographies: List[str]) -> List[Dict]:
        """
        Search for places based on user preferences
        """
        all_places = []
        
        for geography in geographies:
            for district in districts:
                query = f"tourist destinations in the {geography} regions of {district}, Kerala"
                places = self.search_places(query, max_results=8)
                
                # Add context info to each place
                for place in places:
                    place["search_context"] = {
                        "district": district,
                        "geography": geography,
                        "query": query
                    }
                
                all_places.extend(places)
        
        # Remove duplicates based on place ID
        seen_ids = set()
        unique_places = []
        
        for place in all_places:
            place_id = place.get("id")
            if place_id and place_id not in seen_ids:
                seen_ids.add(place_id)
                unique_places.append(place)
        
        return unique_places
