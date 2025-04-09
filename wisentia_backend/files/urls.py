from django.urls import path
from . import views

urlpatterns = [
    path('profile-image/upload/', views.upload_profile_image, name='upload-profile-image'),
    path('nft-image/upload/', views.upload_nft_image, name='upload-nft-image'),
    path('<str:file_type>/<str:filename>/', views.get_file, name='get-file'),
]