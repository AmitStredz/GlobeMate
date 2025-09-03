from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .models import LocalHost, LocalHostDocument, LocalHostReview, LocalHostBooking
from .serializers import (
    LocalHostApplicationSerializer, LocalHostSerializer, LocalHostDocumentSerializer,
    LocalHostReviewSerializer, LocalHostBookingSerializer, LocalHostPublicSerializer,
    LocalHostDetailSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class LocalHostApplicationView(generics.CreateAPIView):
    """Create a new local host application"""
    serializer_class = LocalHostApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        local_host = serializer.save()
        
        # For demo purposes, auto-approve the application and mark user as local host
        local_host.status = 'APPROVED'
        local_host.save()
        
        # Update user profile to mark as local host
        user_profile = request.user.profile
        user_profile.is_local_host = True
        user_profile.local_host_verified_at = timezone.now()
        user_profile.save()
        
        return Response({
            'message': 'Congratulations! You are now registered as a Local Host. Your profile has been updated.',
            'application_id': local_host.id,
            'status': local_host.status
        }, status=status.HTTP_201_CREATED)


class LocalHostProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's local host profile"""
    serializer_class = LocalHostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(LocalHost, user=self.request.user)


class LocalHostListView(generics.ListAPIView):
    """List approved local hosts (public view)"""
    serializer_class = LocalHostPublicSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = LocalHost.objects.filter(status='APPROVED')
        
        # Filter by services
        services = self.request.query_params.get('services', None)
        if services:
            service_list = services.split(',')
            queryset = queryset.filter(services_offered__overlap=service_list)
        
        # Search by name or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) | 
                Q(service_description__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class LocalHostDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific local host"""
    serializer_class = LocalHostDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return LocalHost.objects.filter(status='APPROVED')


class LocalHostDocumentUploadView(generics.CreateAPIView):
    """Upload verification documents"""
    serializer_class = LocalHostDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        local_host = get_object_or_404(LocalHost, user=self.request.user)
        serializer.save(local_host=local_host)


class LocalHostReviewCreateView(generics.CreateAPIView):
    """Create a review for a local host"""
    serializer_class = LocalHostReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        local_host_id = self.kwargs['local_host_id']
        local_host = get_object_or_404(LocalHost, id=local_host_id, status='APPROVED')
        serializer.save(local_host=local_host)


class LocalHostBookingCreateView(generics.CreateAPIView):
    """Create a booking inquiry for a local host"""
    serializer_class = LocalHostBookingSerializer
    permission_classes = [permissions.IsAuthenticated]


class LocalHostBookingListView(generics.ListAPIView):
    """List user's bookings"""
    serializer_class = LocalHostBookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        # Show bookings where user is either the traveler or the local host
        return LocalHostBooking.objects.filter(
            Q(traveler=user) | Q(local_host__user=user)
        ).order_by('-created_at')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def local_host_status(request):
    """Check if current user has a local host application and its status"""
    try:
        local_host = LocalHost.objects.get(user=request.user)
        serializer = LocalHostSerializer(local_host)
        return Response({
            'has_application': True,
            'application': serializer.data
        })
    except LocalHost.DoesNotExist:
        return Response({
            'has_application': False,
            'application': None
        })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def local_host_constants(request):
    """Get constants for local host services and document types"""
    return Response({
        'services': [{'code': code, 'name': name} for code, name in LocalHost.SERVICE_CHOICES],
        'documents': [{'code': code, 'name': name} for code, name in LocalHost.DOCUMENT_CHOICES],
        'statuses': [{'code': code, 'name': name} for code, name in LocalHost.STATUS_CHOICES]
    })
