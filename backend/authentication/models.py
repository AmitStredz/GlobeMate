from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.utils import timezone

# --- Choices ---
GENDER_CHOICES = [
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
]

class UserProfile(models.Model):
    """
    Extended user profile for travellers
    Simplified and cleaner - no duplicate fields with Django User
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(16), MaxValueValidator(120)],
        help_text="Minimum age is 16"
    )
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    
    # OTP verification fields
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_expiry = models.DateTimeField(blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    
    # Local Host status
    is_local_host = models.BooleanField(default=False, help_text="True if user is registered as a local host")
    local_host_verified_at = models.DateTimeField(blank=True, null=True, help_text="When the user became a verified local host")
    
    # Profile metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def is_otp_valid(self, otp_code):
        """Check if provided OTP is valid and not expired"""
        if not self.otp or not self.otp_expiry:
            return False
        return (
            self.otp == otp_code and 
            timezone.now() <= self.otp_expiry
        )
    
    def clear_otp(self):
        """Clear OTP data after successful verification"""
        self.otp = None
        self.otp_expiry = None
        self.save()

    class Meta:
        db_table = 'user_profiles'
