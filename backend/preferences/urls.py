from django.urls import path
from .views import DistrictsListView, GeographiesListView, UserPreferencesView

urlpatterns = [
    path('districts/', DistrictsListView.as_view(), name='districts-list'),
    path('geographies/', GeographiesListView.as_view(), name='geographies-list'),
    path('user/', UserPreferencesView.as_view(), name='user-preferences'),
]
