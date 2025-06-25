from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User

# --- Choices ---
GENDER_CHOICES = [
    ('M', 'Male'),
    ('F', 'Female'),
    ('O', 'Other'),
]

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


# --- Models ---
class Traveller(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=100)
    age = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(120)])
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    preferred_districts = models.ManyToManyField('District')
    preferred_geographies = models.ManyToManyField('Geography')

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Store hashed passwords, not plaintext

    otp = models.CharField(max_length=6, blank=True, null=True)  # For OTP verification
    otp_expiry = models.DateTimeField(blank=True, null=True)  # To track OTP expiry time
    created_at = models.DateTimeField(auto_now_add=True)
    
    is_verified = models.BooleanField(default=False)  # After OTP verification

    def __str__(self):
        return self.username


class District(models.Model):
    code = models.CharField(max_length=4, choices=DISTRICT_CHOICES, unique=True, primary_key=True)
    name = models.CharField(max_length=100)

    # Bounding box coordinates
    ne_longitude = models.FloatField(null=True, blank=True)
    sw_longitude = models.FloatField(null=True, blank=True)
    ne_latitude = models.FloatField(null=True, blank=True)
    sw_latitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

    def get_bounding_box(self):
        # Used to plug into Geoapify rect filter
        return f"{self.sw_longitude},{self.sw_latitude},{self.ne_longitude},{self.ne_latitude}"


class Geography(models.Model):
    code = models.CharField(max_length=10, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    api_code = models.CharField(max_length=100, unique=True) 

    def __str__(self):
        return self.name
