from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

class LocalHost(models.Model):
    """Model for local host applications and profiles"""
    
    # Status choices
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
    ]
    
    # Service choices
    SERVICE_CHOICES = [
        ('ACCOMMODATION', 'Accommodation (Room/House Rental)'),
        ('FOOD', 'Food Services'),
        ('GUIDE', 'Local Guiding Services'),
        ('TRANSPORT', 'Transportation Services'),
        ('EXPERIENCE', 'Local Experiences & Activities'),
        ('PHOTOGRAPHY', 'Photography Services'),
        ('OTHER', 'Other Services'),
    ]
    
    # Document type choices
    DOCUMENT_CHOICES = [
        ('AADHAAR', 'Aadhaar Card'),
        ('PAN', 'PAN Card'),
        ('PASSPORT', 'Passport'),
        ('DRIVING_LICENSE', 'Driving License'),
        ('VOTER_ID', 'Voter ID'),
    ]
    
    # Basic Information
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='local_host_profile')
    full_name = models.CharField(max_length=100)
    age = models.PositiveIntegerField(validators=[MinValueValidator(18), MaxValueValidator(100)])
    address = models.TextField()
    
    # Contact Information
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be valid")]
    )
    
    # Identity Documents
    aadhaar_number = models.CharField(
        max_length=12,
        validators=[RegexValidator(regex=r'^\d{12}$', message="Aadhaar number must be 12 digits")]
    )
    pan_number = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', message="Invalid PAN format")]
    )
    
    # Service Information
    services_offered = models.JSONField(default=list, help_text="List of service codes")
    custom_service = models.CharField(max_length=200, blank=True, null=True)
    service_description = models.TextField()
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    price_range = models.CharField(max_length=100, blank=True, null=True)
    availability = models.CharField(max_length=200, blank=True, null=True)
    
    # Verification Documents
    documents_provided = models.JSONField(default=list, help_text="List of document codes user can provide")
    
    # Application Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    application_date = models.DateTimeField(auto_now_add=True)
    review_date = models.DateTimeField(null=True, blank=True)
    reviewer_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Local Host'
        verbose_name_plural = 'Local Hosts'
    
    def __str__(self):
        return f"{self.full_name} - {self.get_status_display()}"
    
    @property
    def is_approved(self):
        return self.status == 'APPROVED'
    
    @property
    def service_names(self):
        """Get readable service names"""
        service_dict = dict(self.SERVICE_CHOICES)
        return [service_dict.get(code, code) for code in self.services_offered]


class LocalHostDocument(models.Model):
    """Model for storing uploaded verification documents"""
    
    local_host = models.ForeignKey(LocalHost, on_delete=models.CASCADE, related_name='uploaded_documents')
    document_type = models.CharField(max_length=20, choices=LocalHost.DOCUMENT_CHOICES)
    document_file = models.FileField(upload_to='local_host_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verification_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['local_host', 'document_type']
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.local_host.full_name} - {self.get_document_type_display()}"


class LocalHostReview(models.Model):
    """Model for reviews/ratings of local hosts by travelers"""
    
    local_host = models.ForeignKey(LocalHost, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='local_host_reviews')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField(blank=True, null=True)
    service_type = models.CharField(max_length=20, choices=LocalHost.SERVICE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['local_host', 'reviewer', 'service_type']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.reviewer.username} -> {self.local_host.full_name} ({self.rating}/5)"


class LocalHostBooking(models.Model):
    """Model for tracking bookings/inquiries to local hosts"""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    
    local_host = models.ForeignKey(LocalHost, on_delete=models.CASCADE, related_name='bookings')
    traveler = models.ForeignKey(User, on_delete=models.CASCADE, related_name='local_host_bookings')
    service_type = models.CharField(max_length=20, choices=LocalHost.SERVICE_CHOICES)
    
    # Booking Details
    start_date = models.DateField()
    end_date = models.DateField()
    number_of_people = models.PositiveIntegerField(default=1)
    special_requests = models.TextField(blank=True, null=True)
    
    # Pricing
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Communication
    host_response = models.TextField(blank=True, null=True)
    traveler_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.traveler.username} -> {self.local_host.full_name} ({self.start_date})"
