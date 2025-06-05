from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator

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

GEOGRAPHY_CHOICES = [
    ('RVR', 'Rivers'),
    ('FRST', 'Forests'),
    ('MNTN', 'Mountains'),
    ('BCH', 'Beaches'),
    ('BCKWTR', 'Backwaters'),
]

# --- Models ---
class Traveller(models.Model):
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

    def __str__(self):
        return self.name


class Geography(models.Model):
    code = models.CharField(max_length=10, choices=GEOGRAPHY_CHOICES, unique=True, primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
