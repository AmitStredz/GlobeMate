from django.db import models
from django.contrib.auth.models import User
import uuid

class Place(models.Model):
    """
    Store cached place data to reduce API calls and improve performance
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    google_place_id = models.CharField(max_length=255, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    formatted_address = models.TextField()
    
    # Location data
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    # Place details
    rating = models.FloatField(null=True, blank=True)
    user_ratings_total = models.IntegerField(null=True, blank=True)
    price_level = models.IntegerField(null=True, blank=True)
    place_types = models.JSONField(default=list, help_text="Array of place types from Google")
    description = models.TextField(blank=True, help_text="Place description or editorial summary")
    
    # Cached data
    photos_data = models.JSONField(default=list, help_text="Cached photo references")
    weather_data = models.JSONField(default=dict, help_text="Cached weather data")
    last_weather_update = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'places'
        ordering = ['-rating', 'name']


class UserFavorite(models.Model):
    """
    Track user's favorite places
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} likes {self.place.name}"
    
    class Meta:
        db_table = 'user_favorites'
        unique_together = ['user', 'place']


class PlaceVisit(models.Model):
    """
    Track when users visit or view place details
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='place_visits')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='visits')
    visited_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} visited {self.place.name}"
    
    class Meta:
        db_table = 'place_visits'
