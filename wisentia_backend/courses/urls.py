from django.urls import path, re_path, include
from . import views

# Define API routes that will be prefixed with /api
api_routes = [
    path('courses/', views.list_courses, name='api_list_courses'),
    path('courses/<int:course_id>/', views.course_detail, name='api_course_detail'),
    path('courses/videos/<int:video_id>/', views.video_detail, name='api_video_detail'),
    path('courses/videos/<int:video_id>/track/', views.track_video_progress, name='api_track_video_progress'),
    path('courses/videos/<int:video_id>/views/', views.get_video_views, name='api_get_video_views'),
    path('courses/videos/<int:video_id>/quizzes/', views.video_quizzes, name='api_video_quizzes'),
    path('courses/<int:course_id>/progress/', views.course_progress, name='api_course_progress'),
    path('courses/<int:course_id>/resources/', views.course_resources, name='api_course_resources'),
    path('courses/<int:course_id>/quizzes/', views.course_quizzes, name='api_course_quizzes'),
]

# Define main routes without prefix
urlpatterns = [
    path('', views.list_courses, name='list-courses'),
    path('<int:course_id>/', views.course_detail, name='course-detail'),
    
    # Video endpoints that support both numeric IDs and YouTube IDs
    re_path(r'^videos/(?P<video_id>[\w-]+)/$', views.video_detail, name='video-detail'),
    re_path(r'^videos/(?P<video_id>[\w-]+)/track/$', views.track_video_progress, name='track-video-progress'),
    re_path(r'^videos/(?P<video_id>[\w-]+)/views/$', views.get_video_views, name='get-video-views'),
    re_path(r'^videos/(?P<video_id>[\w-]+)/quizzes/$', views.video_quizzes, name='video-quizzes'),
    
    path('videos/stats/', views.user_video_stats, name='user-video-stats'),
    path('videos/create/', views.create_video, name='create-video'),
    
    # Course enrollment and progress endpoints
    path('<int:course_id>/enroll/', views.enroll_course, name='enroll-course'),
    path('enrollment/status/<int:course_id>/', views.enrollment_status, name='enrollment-status'),
    path('my-courses/', views.user_enrolled_courses, name='user-enrolled-courses'),
    path('<int:course_id>/mark-complete/', views.mark_course_complete, name='mark-course-complete'),
    path('<int:course_id>/progress/', views.course_progress, name='course-progress'),
    path('<int:course_id>/resources/', views.course_resources, name='course-resources'),
    path('<int:course_id>/quizzes/', views.course_quizzes, name='course-quizzes'),
    
    # Debug endpoint
    path('<int:course_id>/debug-enrollment/', views.debug_enrollment_count, name='debug-enrollment-count'),

    # Include the API routes with a prefix
    path('api/', include(api_routes)),

    # YouTube video duration endpoint - devre dışı bırakıldı (frontend'de çözüldü)
    # path('youtube-video/<str:youtube_id>/duration/', views.get_youtube_video_duration, name='youtube-video-duration'),
]