from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import District, Geography, UserPreference
from .serializers import DistrictSerializer, GeographySerializer, UserPreferenceSerializer

class DistrictsListView(APIView):
    """Get list of all available districts"""
    
    def get(self, request):
        districts = District.objects.all()
        serializer = DistrictSerializer(districts, many=True)
        return Response({
            "districts": serializer.data
        }, status=status.HTTP_200_OK)

class GeographiesListView(APIView):
    """Get list of all available geography types"""
    
    def get(self, request):
        geographies = Geography.objects.all()
        serializer = GeographySerializer(geographies, many=True)
        return Response({
            "geographies": serializer.data
        }, status=status.HTTP_200_OK)

class UserPreferencesView(APIView):
    """Get and update user preferences"""
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get(self, request):
        """Get user's current preferences"""
        try:
            preferences = get_object_or_404(UserPreference, user=request.user)
            serializer = UserPreferenceSerializer(preferences)
            return Response({
                "preferences": serializer.data
            }, status=status.HTTP_200_OK)
        except UserPreference.DoesNotExist:
            return Response({
                "detail": "No preferences found for user"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        """Update user preferences"""
        try:
            preferences = get_object_or_404(UserPreference, user=request.user)
            
            # Update budget range if provided
            budget_range = request.data.get('budget_range')
            if budget_range:
                preferences.budget_range = budget_range
            
            # Update preferred districts if provided
            district_codes = request.data.get('preferred_districts', [])
            if district_codes:
                districts = District.objects.filter(code__in=district_codes)
                preferences.preferred_districts.set(districts)
            
            # Update preferred geographies if provided
            geography_codes = request.data.get('preferred_geographies', [])
            if geography_codes:
                geographies = Geography.objects.filter(code__in=geography_codes)
                preferences.preferred_geographies.set(geographies)
            
            preferences.save()
            
            serializer = UserPreferenceSerializer(preferences)
            return Response({
                "detail": "Preferences updated successfully",
                "preferences": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "detail": f"Error updating preferences: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
