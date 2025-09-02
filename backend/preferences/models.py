from django.db import models
from django.contrib.auth.models import User

# --- Choices ---
DISTRICT_CHOICES = [
    ('TVM', 'Thiruvananthapuram'),
    ('KLM', 'Kollam'),
    ('PTA', 'Pathanamthitta'),
    ('ALP', 'Alappuzha'),
    ('KTM', 'Kottayam'),
    ('IDK', 'Idukki'),
    ('EKM', 'Ernakulam'),
    ('TSR', 'Thrissur'),
    ('PLK', 'Palakkad'),
    ('MLP', 'Malappuram'),
    ('KKD', 'Kozhikode'),
    ('WYD', 'Wayanad'),
    ('KGD', 'Kannur'),
    ('KNR', 'Kasargod'),
]

class District(models.Model):
    """Kerala districts with bounding box coordinates for location filtering"""
    code = models.CharField(max_length=4, choices=DISTRICT_CHOICES, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    
    # Bounding box coordinates for API filtering
    ne_longitude = models.FloatField(help_text="Northeast longitude")
    sw_longitude = models.FloatField(help_text="Southwest longitude")
    ne_latitude = models.FloatField(help_text="Northeast latitude")
    sw_latitude = models.FloatField(help_text="Southwest latitude")

    def __str__(self):
        return self.name

    def get_bounding_box(self):
        """Returns bounding box string for API usage"""
        return f"{self.sw_longitude},{self.sw_latitude},{self.ne_longitude},{self.ne_latitude}"
    
    class Meta:
        db_table = 'districts'
        ordering = ['name']


class Geography(models.Model):
    """Geography types for travel preferences (forests, mountains, beaches, etc.)"""
    code = models.CharField(max_length=10, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    api_code = models.CharField(max_length=100, unique=True, help_text="Code used for external API calls")
    description = models.TextField(blank=True, help_text="Description of this geography type")

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'geographies'
        ordering = ['name']
        verbose_name_plural = 'Geographies'


class UserPreference(models.Model):
    """User's travel preferences - districts and geography types they're interested in"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    preferred_districts = models.ManyToManyField(District, blank=True, help_text="Preferred Kerala districts")
    preferred_geographies = models.ManyToManyField(Geography, blank=True, help_text="Preferred geography types")
    
    # Additional preference settings
    budget_range = models.CharField(
        max_length=20, 
        choices=[
            ('low', 'Budget (< ₹5000)'),
            ('medium', 'Mid-range (₹5000 - ₹15000)'),
            ('high', 'Luxury (> ₹15000)'),
        ],
        blank=True,
        help_text="Preferred budget range for trips"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Preferences"
    
    class Meta:
        db_table = 'user_preferences'
