from django.urls import path
from .views import GetAllPlaces, GetPlaceDetails


urlpatterns = [
    # path('getPlaces/', FilteredPlacesView.as_view(), name='user-get-places'),
    path('getAllPlaces/', GetAllPlaces.as_view(), name='get-all-places'),
    path('getPlaceDetails/', GetPlaceDetails.as_view(), name='get-one-place-details'),
]
