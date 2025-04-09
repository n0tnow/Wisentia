from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('users/', views.user_management, name='user-management'),
    path('users/<int:user_id>/', views.user_details, name='user-details'),
    path('users/<int:user_id>/update/', views.update_user, name='update-user'),
    path('content/', views.content_management, name='content-management'),
    path('subscriptions/', views.subscription_management, name='subscription-management'),
    path('courses/create/', views.create_course, name='create-course'),
    path('system-health/', views.system_health, name='system-health'),
    path('cache-stats/', views.cache_stats, name='cache-stats'),
]