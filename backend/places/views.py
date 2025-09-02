from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import datetime

from .models import Place, UserFavorite, PlaceVisit
from .serializers import PlaceSerializer, PlaceListSerializer, UserFavoriteSerializer
from services.google_places import GooglePlacesService
from services.weather import WeatherService
from preferences.models import UserPreference

class PlacesListView(APIView):
    """
    Get list of places based on user preferences
    Uses caching to improve performance
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            # Get user preferences
            user_preferences = get_object_or_404(UserPreference, user=request.user)
            
            districts = [d.name for d in user_preferences.preferred_districts.all()]
            geographies = [g.name for g in user_preferences.preferred_geographies.all()]
            
            if not districts or not geographies:
                return Response({
                    "detail": "Please set your travel preferences first.",
                    "places": []
                }, status=status.HTTP_200_OK)
            
            # Initialize Google Places service
            places_service = GooglePlacesService()
            
            # Search for places
            places_data = places_service.search_places_by_preferences(districts, geographies)
            
            # Process and cache places with detailed information
            processed_places = []
            
            for place_data in places_data:
                place_id = place_data.get('id')
                if not place_id:
                    continue
                
                # Check if place already exists in our database
                place, created = Place.objects.get_or_create(
                    google_place_id=place_id,
                    defaults={
                        'name': place_data.get('displayName', {}).get('text', 'Unknown'),
                        'formatted_address': 'Address not available',
                        'latitude': place_data.get('location', {}).get('latitude', 0),
                        'longitude': place_data.get('location', {}).get('longitude', 0),
                    }
                )
                
                # If place is new or missing detailed info, fetch from Google Places API
                if created or not place.formatted_address or not place.formatted_address == 'Address not available' or not place.photos_data:
                    place_details = places_service.get_place_details(place_id)
                    
                    if place_details:
                        # Update place with detailed information
                        place.name = place_details.get('name', place.name)
                        place.formatted_address = place_details.get('formatted_address', place.formatted_address)
                        
                        location = place_details.get('geometry', {}).get('location', {})
                        place.latitude = location.get('lat', place.latitude)
                        place.longitude = location.get('lng', place.longitude)
                        
                        place.rating = place_details.get('rating')
                        place.user_ratings_total = place_details.get('user_ratings_total')
                        place.price_level = place_details.get('price_level')
                        place.place_types = place_details.get('types', [])
                        place.photos_data = place_details.get('photo_urls', [])
                        
                        # Extract description from editorial summary or reviews
                        description = ""
                        editorial_summary = place_details.get('editorial_summary', {})
                        print("editorial_summary:")
                        print(editorial_summary)
                        if editorial_summary and editorial_summary.get('overview'):
                            description = editorial_summary.get('overview')
                        elif place_details.get('reviews') and len(place_details.get('reviews', [])) > 0:
                            # Use the first review as description if no editorial summary
                            first_review = place_details.get('reviews')[0]
                            description = first_review.get('text', '')[:300] + "..." if len(first_review.get('text', '')) > 300 else first_review.get('text', '')
                        
                        place.description = description
                        place.save()
                
                processed_places.append(place)
            
            # Serialize places
            serializer = PlaceListSerializer(
                processed_places, 
                many=True, 
                context={'request': request}
            )
            
            return Response({
                "places": serializer.data,
                "count": len(serializer.data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "detail": f"Error fetching places: {str(e)}",
                "places": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PlaceDetailView(APIView):
    """
    Get detailed information about a specific place
    Includes weather data and photos
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        place_id = request.query_params.get('place_id')
        
        if not place_id:
            return Response({
                "detail": "place_id parameter is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get or create place record
            place, created = Place.objects.get_or_create(
                google_place_id=place_id,
                defaults={
                    'name': 'Loading...',
                    'formatted_address': 'Loading...',
                    'latitude': 0,
                    'longitude': 0,
                }
            )
            
            # If place is new or needs updating, fetch details from Google
            if created or not place.photos_data:
                places_service = GooglePlacesService()
                place_details = places_service.get_place_details(place_id)
                
                if place_details:
                    # Update place with detailed information
                    place.name = place_details.get('name', place.name)
                    place.formatted_address = place_details.get('formatted_address', place.formatted_address)
                    
                    location = place_details.get('geometry', {}).get('location', {})
                    place.latitude = location.get('lat', place.latitude)
                    place.longitude = location.get('lng', place.longitude)
                    
                    place.rating = place_details.get('rating')
                    place.user_ratings_total = place_details.get('user_ratings_total')
                    place.price_level = place_details.get('price_level')
                    place.place_types = place_details.get('types', [])
                    place.photos_data = place_details.get('photo_urls', [])
                    
                    # Extract description from editorial summary or reviews
                    description = ""
                    editorial_summary = place_details.get('editorial_summary', {})
                    if editorial_summary and editorial_summary.get('overview'):
                        description = editorial_summary.get('overview')
                    elif place_details.get('reviews') and len(place_details.get('reviews', [])) > 0:
                        # Use the first review as description if no editorial summary
                        first_review = place_details.get('reviews')[0]
                        description = first_review.get('text', '')[:300] + "..." if len(first_review.get('text', '')) > 300 else first_review.get('text', '')
                    
                    place.description = description
                    place.save()
            
            # Get weather data if coordinates are available
            if place.latitude and place.longitude:
                weather_service = WeatherService()
                
                # Check if weather data needs updating (older than 1 hour)
                needs_weather_update = (
                    not place.weather_data or 
                    not place.last_weather_update or
                    not weather_service.is_weather_data_fresh(place.last_weather_update)
                )
                
                if needs_weather_update:
                    weather_data = weather_service.get_weather_data(
                        place.latitude, 
                        place.longitude
                    )
                    
                    if weather_data:
                        place.weather_data = weather_data
                        place.last_weather_update = datetime.now()
                        place.save()
            
            # Record user visit
            PlaceVisit.objects.create(user=request.user, place=place)
            
            # Serialize and return place data
            serializer = PlaceSerializer(place, context={'request': request})
            
            return Response({
                "place": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "detail": f"Error fetching place details: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ToggleFavoriteView(APIView):
    """
    Add or remove a place from user's favorites
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        place_id = request.data.get('place_id')
        
        if not place_id:
            return Response({
                "detail": "place_id is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            place = get_object_or_404(Place, id=place_id)
            
            favorite, created = UserFavorite.objects.get_or_create(
                user=request.user,
                place=place
            )
            
            if created:
                message = "Place added to favorites"
                is_favorited = True
            else:
                favorite.delete()
                message = "Place removed from favorites"
                is_favorited = False
            
            return Response({
                "detail": message,
                "is_favorited": is_favorited
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "detail": f"Error updating favorites: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserFavoritesView(APIView):
    """
    Get user's favorite places
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        favorites = UserFavorite.objects.filter(user=request.user).select_related('place')
        serializer = UserFavoriteSerializer(favorites, many=True)
        
        return Response({
            "favorites": serializer.data,
            "count": len(serializer.data)
        }, status=status.HTTP_200_OK)