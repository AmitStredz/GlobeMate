from rest_framework import serializers
from .models import District, Geography, UserPreference

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['code', 'name']

class GeographySerializer(serializers.ModelSerializer):
    class Meta:
        model = Geography
        fields = ['code', 'name', 'description']

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_districts = DistrictSerializer(many=True, read_only=True)
    preferred_geographies = GeographySerializer(many=True, read_only=True)
    
    class Meta:
        model = UserPreference
        fields = ['preferred_districts', 'preferred_geographies', 'budget_range', 'created_at', 'updated_at']
