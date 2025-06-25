from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import random
from django.core.mail import send_mail
from django.conf import settings
from .serializers import SignupSerializer
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests
from django.contrib.auth.models import User
from .models import Traveller, District, Geography
from google.oauth2 import id_token
from dotenv import load_dotenv
import os

import requests

from .serializers import TravellerSerializer  # Make sure you have this

load_dotenv()
class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            existing_user = Traveller.objects.filter(email=email).first()

            if existing_user:
                return Response({"detail": "Email already registered."}, status=400)

            # Generate OTP and expiry
            otp = str(random.randint(100000, 999999))
            expiry = timezone.now() + timedelta(minutes=10)

            # Extract and prepare data
            validated_data = serializer.validated_data
            districts = validated_data.pop('preferred_districts')
            geographies = validated_data.pop('preferred_geographies')
            raw_password = validated_data.pop('password')
            hashed_password = make_password(raw_password)

            # Create Django User
            user = User.objects.create_user(username=email, email=email, password=raw_password)

            # Create Traveller linked to User
            traveller = Traveller.objects.create(
                user=user,
                **validated_data,
                password=hashed_password,
                otp=otp,
                otp_expiry=expiry,
                is_verified=False,
            )
            traveller.preferred_districts.set(districts)
            traveller.preferred_geographies.set(geographies)
            traveller.save()

            # Send OTP Email
            send_mail(
                subject="Your OTP for Traveller Signup",
                message=f"Hello {traveller.username},\n\nYour OTP is {otp}. It is valid for 10 minutes.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False
            )

            return Response(
                {"detail": "Signup successful. OTP sent to email for verification."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"detail": "Email and OTP are required."}, status=400)

        traveller = Traveller.objects.filter(email=email).first()

        if not traveller:
            return Response({"detail": "No account found with this email."}, status=404)

        if traveller.is_verified:
            return Response({"detail": "User already verified."}, status=400)

        if traveller.otp != otp:
            return Response({"detail": "Invalid OTP."}, status=400)

        if traveller.otp_expiry and timezone.now() > traveller.otp_expiry:
            return Response({"detail": "OTP has expired."}, status=400)

        # Mark as verified
        traveller.is_verified = True
        traveller.otp = None
        traveller.otp_expiry = None
        traveller.save()

        # Generate JWT token for linked User
        refresh = RefreshToken.for_user(traveller.user)
        user_data = TravellerSerializer(traveller).data

        return Response({
            "user": user_data,
            "detail": "Email verified successfully.",
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=200)
     



class GoogleSignupView(APIView):
    def post(self, request):
        token = request.data.get("id_token")
        if not token:
            return Response({"detail": "ID token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), os.getenv('GOOGLE_CLIENT_ID'))

            email = idinfo.get("email")
            name = idinfo.get("name")
            if not email:
                return Response({"detail": "Email not found in token"}, status=status.HTTP_400_BAD_REQUEST)

            user, created = User.objects.get_or_create(username=email, defaults={"email": email, "first_name": name})

            age = request.data.get("age")
            gender = request.data.get("gender")
            district_ids = request.data.get("preferred_districts", [])  # expect list of IDs
            geography_ids = request.data.get("preferred_geographies", [])

            traveller, _ = Traveller.objects.get_or_create(user=user)
            traveller.age = age
            traveller.gender = gender
            traveller.username = name  # custom field in your model
            traveller.save()

            if district_ids:
                traveller.preferred_districts.set(District.objects.filter(id__in=district_ids))
            if geography_ids:
                traveller.preferred_geographies.set(Geography.objects.filter(id__in=geography_ids))

            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "detail": "Google sign-in successful"
            })

        except ValueError:
            return Response({"detail": "Invalid ID token"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email") 
        password = request.data.get("password") 

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        # Check password
        if not user.check_password(password):
            return Response({"detail": "Invalid credentials."}, status=401)

        # Fetch linked Traveller profile
        try:
            traveller = Traveller.objects.get(email=email)
            if not traveller.is_verified:
                return Response({"detail": "Please verify your email before logging in."}, status=403)
        except Traveller.DoesNotExist:
            return Response({"detail": "Traveller profile missing."}, status=404)

        # Generate token
        refresh = RefreshToken.for_user(user)
        
        # print(TravellerSerializer(user))
        user_data = TravellerSerializer(traveller).data

        return Response({
            "user": user_data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "detail": "Login successful"
        }, status=200)
  
