from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_courses, name='list-courses'),
    path('<int:course_id>/', views.course_detail, name='course-detail'),
    path('videos/<int:video_id>/', views.video_detail, name='video-detail'),
    path('videos/<int:video_id>/track/', views.track_video_progress, name='track-video-progress'),
    path('videos/stats/', views.user_video_stats, name='user-video-stats'),
]