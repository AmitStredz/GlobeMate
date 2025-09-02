from django.contrib import admin
from .models import Place, UserFavorite, PlaceVisit

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'formatted_address', 'rating', 'user_ratings_total', 'is_active', 'created_at']
    list_filter = ['is_active', 'rating', 'created_at']
    search_fields = ['name', 'formatted_address', 'google_place_id']
    readonly_fields = ['id', 'created_at', 'updated_at']
    list_editable = ['is_active']

@admin.register(UserFavorite)
class UserFavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'place', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'place__name']

@admin.register(PlaceVisit)
class PlaceVisitAdmin(admin.ModelAdmin):
    list_display = ['user', 'place', 'visited_at']
    list_filter = ['visited_at']
    search_fields = ['user__username', 'place__name']
