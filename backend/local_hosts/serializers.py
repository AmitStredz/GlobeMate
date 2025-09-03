from rest_framework import serializers
from django.contrib.auth.models import User
from .models import LocalHost, LocalHostDocument, LocalHostReview, LocalHostBooking


class LocalHostApplicationSerializer(serializers.ModelSerializer):
    """Serializer for creating a local host application"""
    
    class Meta:
        model = LocalHost
        fields = [
            'full_name', 'age', 'address', 'phone_number',
            'aadhaar_number', 'pan_number', 'services_offered',
            'custom_service', 'service_description', 'experience_years',
            'price_range', 'availability', 'documents_provided'
        ]
    
    def validate_services_offered(self, value):
        """Validate that services_offered contains valid service codes"""
        valid_codes = [code for code, _ in LocalHost.SERVICE_CHOICES]
        for service in value:
            if service not in valid_codes:
                raise serializers.ValidationError(f"Invalid service code: {service}")
        return value
    
    def validate_documents_provided(self, value):
        """Validate that documents_provided contains valid document codes"""
        valid_codes = [code for code, _ in LocalHost.DOCUMENT_CHOICES]
        for doc in value:
            if doc not in valid_codes:
                raise serializers.ValidationError(f"Invalid document code: {doc}")
        return value
    
    def create(self, validated_data):
        """Create a new local host application"""
        user = self.context['request'].user
        
        # Check if user already has an application
        if LocalHost.objects.filter(user=user).exists():
            raise serializers.ValidationError("You already have a local host application.")
        
        validated_data['user'] = user
        return super().create(validated_data)


class LocalHostSerializer(serializers.ModelSerializer):
    """Serializer for local host profile information"""
    
    user = serializers.StringRelatedField(read_only=True)
    service_names = serializers.ReadOnlyField()
    is_approved = serializers.ReadOnlyField()
    
    class Meta:
        model = LocalHost
        fields = [
            'id', 'user', 'full_name', 'age', 'address', 'phone_number',
            'services_offered', 'service_names', 'custom_service',
            'service_description', 'experience_years', 'price_range',
            'availability', 'status', 'is_approved', 'application_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'user', 'status', 'application_date', 'created_at', 'updated_at'
        ]


class LocalHostDocumentSerializer(serializers.ModelSerializer):
    """Serializer for local host documents"""
    
    class Meta:
        model = LocalHostDocument
        fields = [
            'id', 'document_type', 'document_file', 'uploaded_at',
            'is_verified', 'verification_notes'
        ]
        read_only_fields = ['is_verified', 'verification_notes', 'uploaded_at']


class LocalHostReviewSerializer(serializers.ModelSerializer):
    """Serializer for local host reviews"""
    
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    
    class Meta:
        model = LocalHostReview
        fields = [
            'id', 'reviewer_name', 'rating', 'review_text',
            'service_type', 'created_at'
        ]
        read_only_fields = ['reviewer_name', 'created_at']
    
    def create(self, validated_data):
        """Create a new review"""
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class LocalHostBookingSerializer(serializers.ModelSerializer):
    """Serializer for local host bookings"""
    
    traveler_name = serializers.CharField(source='traveler.username', read_only=True)
    local_host_name = serializers.CharField(source='local_host.full_name', read_only=True)
    
    class Meta:
        model = LocalHostBooking
        fields = [
            'id', 'local_host', 'local_host_name', 'traveler_name',
            'service_type', 'start_date', 'end_date', 'number_of_people',
            'special_requests', 'quoted_price', 'final_price', 'status',
            'host_response', 'traveler_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'traveler_name', 'local_host_name', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        """Create a new booking"""
        validated_data['traveler'] = self.context['request'].user
        return super().create(validated_data)


class LocalHostPublicSerializer(serializers.ModelSerializer):
    """Public serializer for approved local hosts (for search/browse)"""
    
    service_names = serializers.ReadOnlyField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LocalHost
        fields = [
            'id', 'full_name', 'services_offered', 'service_names',
            'custom_service', 'service_description', 'experience_years',
            'price_range', 'availability', 'average_rating', 'review_count'
        ]
    
    def get_average_rating(self, obj):
        """Calculate average rating"""
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / len(reviews)
        return None
    
    def get_review_count(self, obj):
        """Get total number of reviews"""
        return obj.reviews.count()


class LocalHostDetailSerializer(LocalHostPublicSerializer):
    """Detailed serializer for individual local host view"""
    
    recent_reviews = LocalHostReviewSerializer(source='reviews', many=True, read_only=True)
    
    class Meta(LocalHostPublicSerializer.Meta):
        fields = LocalHostPublicSerializer.Meta.fields + ['recent_reviews']
