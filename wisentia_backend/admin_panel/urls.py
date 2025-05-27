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
    path('courses/update/<int:course_id>/', views.update_course, name='update-course'),
    path('courses/delete/<int:course_id>/', views.delete_course, name='delete-course'),
    path('courses/videos/create/', views.create_course_video, name='create-course-video'),
    path('courses/get_by_title/', views.get_course_by_title, name='get-course-by-title'),
    path('system-health/', views.system_health, name='system-health'),
    path('cache-stats/', views.cache_stats, name='cache-stats'),
    path('dashboard/debug/', views.admin_dashboard_debug, name='admin-dashboard-debug'),
    
    # NFT yönetim endpointleri
    path('nfts/', views.nft_management, name='nft-management'),
    path('nfts/types/', views.nft_types, name='nft-types'),
    path('nfts/create/', views.admin_create_nft, name='admin-create-nft'),
    path('nfts/<int:nft_id>/', views.admin_nft_details, name='admin-nft-details'),
    path('nfts/<int:nft_id>/update/', views.update_nft, name='update-nft'),
    path('nfts/upload-image/', views.upload_nft_image, name='upload-nft-image'),
    path('nfts/statistics/', views.nft_statistics, name='nft-statistics'),
    
    # Quiz yönetim endpointleri
    path('quizzes/create/', views.create_quiz, name='admin-create-quiz'),
    path('quizzes/<int:quiz_id>/', views.quiz_details, name='admin-quiz-details'),
    path('quizzes/<int:quiz_id>/update/', views.update_quiz, name='admin-update-quiz'),
    path('quizzes/<int:quiz_id>/delete/', views.delete_quiz, name='admin-delete-quiz'),
]
