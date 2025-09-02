from django.urls import path
from .views import PlacesListView, PlaceDetailView, ToggleFavoriteView, UserFavoritesView

urlpatterns = [
    path('', PlacesListView.as_view(), name='places-list'),
    path('details/', PlaceDetailView.as_view(), name='place-details'),
    path('favorites/toggle/', ToggleFavoriteView.as_view(), name='toggle-favorite'),
    path('favorites/', UserFavoritesView.as_view(), name='user-favorites'),
]
