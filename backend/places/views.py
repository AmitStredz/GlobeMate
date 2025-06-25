from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from authentication.models  import Traveller
import requests
from rest_framework import status
import os

# Create your views here.
# class FilteredPlacesView(APIView):
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [JWTAuthentication]

#     def get(self, request):
#         user = request.user
        
#         print(user)
#         try:
#             traveller = Traveller.objects.get(email=user.email)
#         except Traveller.DoesNotExist:
#             return Response({"detail": "Traveller profile not found"}, status=status.HTTP_404_NOT_FOUND)

#         # 1. Basic Info
#         age = traveller.age
#         gender = traveller.gender

#         # 2. Preferred Districts -> get bounding boxes
#         district_boxes = []
#         for district in traveller.preferred_districts.all():
#             box = district.get_bounding_box()
#             if box:
#                 district_boxes.append(box)

#         if not district_boxes:
#             return Response({"detail": "No district bounding boxes found"}, status=400)

#         # 3. Preferred Geographies -> use Geoapify category codes
#         categories = ",".join([f"{geo.api_code}" for geo in traveller.preferred_geographies.all()])


#         # 4. Call Geoapify API for each district bounding box
#         results = []
#         for bbox in district_boxes:
#             url = (
#                 f"https://api.geoapify.com/v2/places?"
#                 f"categories={categories}&filter=rect:{bbox}&limit=100&apiKey={os.getenv('GEOAPIFY_API_KEY')}"
#             )
            
#             print(url)
#             res = requests.get(url)
#             if res.status_code == 200:
#                 results.extend(res.json().get("features", []))

#         return Response({"places": results})


class GetAllPlaces(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user

        try:
            traveller = Traveller.objects.get(email=user.email)
        except Traveller.DoesNotExist:
            return Response({"detail": "Traveller not found"}, status=status.HTTP_404_NOT_FOUND)

        geographies = [geo.name for geo in traveller.preferred_geographies.all()]
        districts = [district.name for district in traveller.preferred_districts.all()]

        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            return Response({"detail": "Missing Google API Key"}, status=500)

        search_url = "https://places.googleapis.com/v1/places:searchText"
        detail_url = "https://maps.googleapis.com/maps/api/place/details/json"
        photo_url = "https://maps.googleapis.com/maps/api/place/photo"

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": google_api_key,
            "X-Goog-FieldMask": "places.displayName,places.id"
        }

        final_places = []

        for geo in geographies:
            for district in districts:
                query = f"tourist destinations in the {geo} regions of {district}, Kerala"
                search_payload = {
                    "textQuery": query,
                    "maxResultCount": 10,
                    "languageCode": "en"
                }

                print(f"Searching for: {query}")
                search_response = requests.post(search_url, headers=headers, json=search_payload)
                if search_response.status_code != 200:
                    continue

                search_results = search_response.json().get("places", [])
                for place in search_results:
                    place_id = place.get("id")
                    if not place_id:
                        continue
                    
                    
                    # Get place details
                    detail_params = {
                        "place_id": place_id,
                        "fields": "name,formatted_address,geometry,photos,rating,user_ratings_total,types,url,address_components,price_level",
                        "key": google_api_key
                    }
                    detail_response = requests.get(detail_url, params=detail_params)
                    if detail_response.status_code != 200:
                        continue

                    place_details = detail_response.json().get("result", {})

                    # Fetch one photo URL if available
                    photos = place_details.get("photos", [])
                    first_photo_url = None
                    if photos:
                        photo_ref = photos[0].get("photo_reference")
                        if photo_ref:
                            photo_params = {
                                "maxwidth": 800,
                                "photoreference": photo_ref,
                                "key": google_api_key
                            }
                            first_photo_url = f"{photo_url}?maxwidth=800&photoreference={photo_ref}&key={google_api_key}"

                    place_details["photo_url"] = first_photo_url
                    place_details["id"] = place_id
                
                    final_places.append(place_details)

        return Response({"places": final_places})

class GetPlaceDetails(APIView):
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        place_id = request.query_params.get("place_id")

        if not place_id:
            return Response({"detail": "Place ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            return Response({"detail": "Missing Google API Key"}, status=500)

        detail_url = "https://maps.googleapis.com/maps/api/place/details/json"
        detail_params = {
            "place_id": place_id,
            "fields": "name,formatted_address,geometry,photos,types,address_components,price_level",
            "key": google_api_key
        }

        detail_response = requests.get(detail_url, params=detail_params)
        if detail_response.status_code != 200:
            return Response({"detail": "Failed to fetch place details"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        place_details = detail_response.json().get("result", {})
        
        # Fetch all photo URL if available
        
        photos = place_details.get("photos", [])
        
        lat, long = place_details.get("geometry", {}).get("location", {}).values()
        weather_url = f"https://api.openweathermap.org/data/3.0/onecall"
        weather_params = {
            "lat": lat,
            "lon": long,
            "appid": os.getenv("OPEN_WEATHER_API_KEY"),
            "units": "metric",
            "exclude": "alerts,hourly,minutely"
        }
        weather_response = requests.get(weather_url, params=weather_params)
        if weather_response.status_code == 200:
            current_weather = weather_response.json().get("current", {})
            daily_weather = weather_response.json().get("daily", {})
            weather={
                "current": current_weather,
                "daily": daily_weather,    
                "metric": {
                    "temperature": "Celsius",
                    "rain speed": "meters per second",
                    "pressure": "hPa (hectopascal)",
                    "humidity": "percentage (%)"
                }
            }
            place_details["weather"]=weather
            

        photo_urls = []
        for photo in photos:
            photo_ref = photo.get("photo_reference")
            photo_params = {
                "maxwidth": 800,
                "photoreference": photo_ref,
                "key": google_api_key
            }
            if photo_ref:
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo"
                photo_response = requests.get(photo_url, params=photo_params)
                photo_urls.append(photo_response.url)

        place_details["photo_urls"] = photo_urls
        place_details.pop("photos", None)

        return Response({"place_details": place_details})