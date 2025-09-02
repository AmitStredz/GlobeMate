from rest_framework import serializers
from .models import Place, UserFavorite, PlaceVisit

class PlaceSerializer(serializers.ModelSerializer):
    """Serializer for place data"""
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = [
            'id', 'google_place_id', 'name', 'formatted_address',
            'latitude', 'longitude', 'rating', 'user_ratings_total',
            'price_level', 'place_types', 'photos_data', 'weather_data',
            'description', 'is_favorited', 'created_at'
        ]
    
    def get_is_favorited(self, obj):
        """Check if current user has favorited this place"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFavorite.objects.filter(user=request.user, place=obj).exists()
        return False

class PlaceListSerializer(serializers.ModelSerializer):
    """Enhanced serializer for place lists with detailed info"""
    is_favorited = serializers.SerializerMethodField()
    first_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = [
            'id', 'google_place_id', 'name', 'formatted_address',
            'latitude', 'longitude', 'rating', 'user_ratings_total',
            'price_level', 'place_types', 'first_photo_url', 'description', 'is_favorited'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFavorite.objects.filter(user=request.user, place=obj).exists()
        return False
    
    def get_first_photo_url(self, obj):
        """Get the first photo URL for thumbnail display"""
        if obj.photos_data and len(obj.photos_data) > 0:
            return obj.photos_data[0]
        return None

class UserFavoriteSerializer(serializers.ModelSerializer):
    place = PlaceListSerializer(read_only=True)
    
    class Meta:
        model = UserFavorite
        fields = ['id', 'place', 'created_at']
