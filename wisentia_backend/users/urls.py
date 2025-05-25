from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('refresh-token/', views.refresh_token, name='refresh-token'),
    path('profile/', views.get_user_profile, name='user-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('profile/change-password/', views.change_password, name='change-password'),
    path('request-password-reset/', views.request_password_reset, name='request-password-reset'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('reset-password-with-code/', views.reset_password_with_code, name='reset-password-with-code'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('verify-email-with-code/', views.verify_email_with_code, name='verify-email-with-code'),
    path('resend-verification-code/', views.resend_verification_code, name='resend-verification-code'),
    
    # Mevcut ek endpoint'ler
    path('check-username/', views.check_username, name='check-username'),
    path('check-email/', views.check_email, name='check-email'),
    path('logout/', views.logout_view, name='logout'),
    
    # New token verification endpoint
    path('verify-token/', views.verify_token, name='verify-token'),
]