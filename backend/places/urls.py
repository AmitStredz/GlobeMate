from django.urls import path
from .views import FilteredPlacesView, GooglePlacesSearchView


urlpatterns = [
    path('getPlaces/', FilteredPlacesView.as_view(), name='user-get-places'),
    path('getPlacesFromGoogleMap/', GooglePlacesSearchView.as_view(), name='user-get-places-google'),
]
