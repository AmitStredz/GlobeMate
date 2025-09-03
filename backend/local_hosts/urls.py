from django.urls import path
from . import views

app_name = 'local_hosts'

urlpatterns = [
    # Application management
    path('apply/', views.LocalHostApplicationView.as_view(), name='apply'),
    path('profile/', views.LocalHostProfileView.as_view(), name='profile'),
    path('status/', views.local_host_status, name='status'),
    
    # Public views
    path('', views.LocalHostListView.as_view(), name='list'),
    path('<int:pk>/', views.LocalHostDetailView.as_view(), name='detail'),
    path('constants/', views.local_host_constants, name='constants'),
    
    # Document upload
    path('documents/upload/', views.LocalHostDocumentUploadView.as_view(), name='document-upload'),
    
    # Reviews
    path('<int:local_host_id>/reviews/', views.LocalHostReviewCreateView.as_view(), name='create-review'),
    
    # Bookings
    path('bookings/', views.LocalHostBookingListView.as_view(), name='booking-list'),
    path('bookings/create/', views.LocalHostBookingCreateView.as_view(), name='booking-create'),
]
