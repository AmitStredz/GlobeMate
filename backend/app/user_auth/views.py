from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import random
from django.core.mail import send_mail
from django.conf import settings
from .models import Traveller
from .serializers import SignupSerializer
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken

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

            # Hash password before saving manually
            validated_data = serializer.validated_data
            districts = validated_data.pop('preferred_districts')
            geographies = validated_data.pop('preferred_geographies')
            password = make_password(validated_data.pop('password'))

            # Create user
            traveller = Traveller.objects.create(
                **validated_data,
                password=password,
                otp=otp,
                otp_expiry=expiry,
                is_verified=False
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

        user = Traveller.objects.filter(email=email).first()

        if not user:
            return Response({"detail": "No account found with this email."}, status=404)

        if user.is_verified:
            return Response({"detail": "User already verified."}, status=400)


        if user.otp != otp:
            return Response({"detail": "Invalid OTP."}, status=400)

        # Mark verified
        user.is_verified = True
        user.otp = None
        user.otp_expiry = None
        user.save()

        # Generate JWT token
        refresh = RefreshToken.for_user(user)

        return Response({
            "detail": "Email verified successfully.",
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=200)