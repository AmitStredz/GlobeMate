from django.urls import path
from .views import SignupView , VerifyOTPView


urlpatterns = [
    path('signup/', SignupView.as_view(), name='traveller-signup'),
    path('verifyotp/', VerifyOTPView.as_view(), name='traveller-verify-otp'),
]
