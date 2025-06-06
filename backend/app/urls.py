from django.urls import path
from django.urls import path, include

urlpatterns = [
   path('auth/', include('app.user_auth.urls')),
]
