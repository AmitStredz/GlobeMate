from django.contrib import admin
from .models import District, Geography, UserPreference

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']
    search_fields = ['name', 'code']
    ordering = ['name']

@admin.register(Geography)
class GeographyAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'api_code']
    search_fields = ['name', 'code']
    ordering = ['name']

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'budget_range', 'created_at']
    list_filter = ['budget_range', 'created_at']
    search_fields = ['user__username', 'user__email']
    filter_horizontal = ['preferred_districts', 'preferred_geographies']
