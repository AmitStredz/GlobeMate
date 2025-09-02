from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from .models import UserProfile
from preferences.models import District, Geography, UserPreference

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'age', 'gender', 'is_email_verified', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_email_verified']

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['code', 'name']

class GeographySerializer(serializers.ModelSerializer):
    class Meta:
        model = Geography
        fields = ['code', 'name', 'description']

class UserPreferenceSerializer(serializers.ModelSerializer):
    preferred_districts = DistrictSerializer(many=True, read_only=True)
    preferred_geographies = GeographySerializer(many=True, read_only=True)
    
    class Meta:
        model = UserPreference
        fields = ['preferred_districts', 'preferred_geographies', 'budget_range']

class UserDetailSerializer(serializers.ModelSerializer):
    """Complete user data with profile and preferences"""
    profile = UserProfileSerializer(read_only=True)
    preferences = UserPreferenceSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile', 'preferences']

class SignupSerializer(serializers.Serializer):
    """Serializer for user registration"""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    age = serializers.IntegerField(min_value=16, max_value=120)
    gender = serializers.ChoiceField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')])
    preferred_districts = serializers.SlugRelatedField(
        slug_field='code', 
        queryset=District.objects.all(), 
        many=True
    )
    preferred_geographies = serializers.SlugRelatedField(
        slug_field='code', 
        queryset=Geography.objects.all(), 
        many=True
    )
    budget_range = serializers.ChoiceField(
        choices=[('low', 'Budget'), ('medium', 'Mid-range'), ('high', 'Luxury')],
        required=False
    )
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")
        
        # Check if user has verified email
        try:
            profile = user.profile
            if not profile.is_email_verified:
                raise serializers.ValidationError("Please verify your email before logging in.")
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("User profile not found.")
        
        data['user'] = user
        return data

class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
