from django.urls import path
from .views import LoginView, SignupView , VerifyOTPView , GoogleSignupView


urlpatterns = [
    path('signup/', SignupView.as_view(), name='user-signup'),
    path('verifyotp/', VerifyOTPView.as_view(), name='user-verify-otp'),
    path('googlesignup/', GoogleSignupView.as_view(), name='user-google-signup'),
    path('login/', LoginView.as_view(), name='user-login'),
]
