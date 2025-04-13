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
    
    # Yeni eklenen endpoint'ler
    path('check-username/', views.check_username, name='check-username'),
    path('check-email/', views.check_email, name='check-email'),
    path('logout/', views.logout_view, name='logout'),
]