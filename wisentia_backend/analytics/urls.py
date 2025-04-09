from django.urls import path
from . import views

urlpatterns = [
    path('user-stats/', views.user_stats, name='user-stats'),
    path('learning-progress/', views.learning_progress, name='learning-progress'),
    path('time-spent/', views.time_spent, name='time-spent'),
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('track-event/', views.track_event, name='track-event'),
    path('user-activity-summary/', views.user_activity_summary, name='user-activity-summary'),
]