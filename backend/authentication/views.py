from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random
from django.core.mail import send_mail
from django.conf import settings

from .models import UserProfile
from .serializers import (
    SignupSerializer, LoginSerializer, OTPVerificationSerializer,
    UserDetailSerializer
)
from preferences.models import UserPreference

class SignupView(APIView):
    """Handle user registration with email verification"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Create Django User
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        otp_expiry = timezone.now() + timedelta(minutes=10)
        
        # Create UserProfile
        profile = UserProfile.objects.create(
            user=user,
            age=data['age'],
            gender=data['gender'],
            otp=otp,
            otp_expiry=otp_expiry
        )
        
        # Create UserPreference
        preferences = UserPreference.objects.create(
            user=user,
            budget_range=data.get('budget_range', '')
        )
        preferences.preferred_districts.set(data['preferred_districts'])
        preferences.preferred_geographies.set(data['preferred_geographies'])
        
        # Send OTP email
        try:
            send_mail(
                subject="GlobeMate - Email Verification",
                message=f"Hello {user.username},\n\nYour verification code is: {otp}\n\nThis code will expire in 10 minutes.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False
            )
        except Exception as e:
            # If email fails, clean up created objects
            user.delete()
            return Response(
                {"detail": "Failed to send verification email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "detail": "Registration successful. Please check your email for verification code.",
            "email": user.email
        }, status=status.HTTP_201_CREATED)

class VerifyOTPView(APIView):
    """Verify email with OTP code"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        try:
            user = User.objects.get(email=email)
            profile = user.profile
        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return Response(
                {"detail": "Invalid email or verification code."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if profile.is_email_verified:
            return Response(
                {"detail": "Email already verified."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not profile.is_otp_valid(otp):
            return Response(
                {"detail": "Invalid or expired verification code."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as verified
        profile.is_email_verified = True
        profile.clear_otp()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        user_data = UserDetailSerializer(user).data
        
        return Response({
            "detail": "Email verified successfully.",
            "user": user_data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }
        }, status=status.HTTP_200_OK)

class LoginView(APIView):
    """Handle user login"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        user_data = UserDetailSerializer(user).data
        
        return Response({
            "detail": "Login successful.",
            "user": user_data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            }
        }, status=status.HTTP_200_OK)

class ResendOTPView(APIView):
    """Resend OTP for email verification"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            profile = user.profile
        except (User.DoesNotExist, UserProfile.DoesNotExist):
            return Response(
                {"detail": "No account found with this email."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if profile.is_email_verified:
            return Response(
                {"detail": "Email already verified."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate new OTP
        otp = str(random.randint(100000, 999999))
        profile.otp = otp
        profile.otp_expiry = timezone.now() + timedelta(minutes=10)
        profile.save()
        
        # Send email
        try:
            send_mail(
                subject="GlobeMate - New Verification Code",
                message=f"Hello {user.username},\n\nYour new verification code is: {otp}\n\nThis code will expire in 10 minutes.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False
            )
        except Exception:
            return Response(
                {"detail": "Failed to send email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            "detail": "New verification code sent to your email."
        }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """Get current user's profile information"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
  
