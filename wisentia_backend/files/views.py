import os
import uuid
import shutil
from django.conf import settings
from django.db import connection
from django.http import HttpResponse, FileResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

# Dosya yükleme dizinleri
UPLOAD_DIR = os.path.join(settings.MEDIA_ROOT, 'uploads')
PROFILE_IMAGE_DIR = os.path.join(UPLOAD_DIR, 'profile_images')
NFT_IMAGE_DIR = os.path.join(UPLOAD_DIR, 'nft_images')

# Frontend dosya yolları (frontend için public dizinine kopyalamak için)
FRONTEND_DIR = os.path.abspath(os.path.join(settings.BASE_DIR, '..', 'wisentia_frontend'))
FRONTEND_PUBLIC_DIR = os.path.join(FRONTEND_DIR, 'public')
FRONTEND_MEDIA_DIR = os.path.join(FRONTEND_PUBLIC_DIR, 'media', 'uploads')
FRONTEND_NFT_IMAGES_DIR = os.path.join(FRONTEND_MEDIA_DIR, 'nft_images')
FRONTEND_PROFILE_IMAGES_DIR = os.path.join(FRONTEND_MEDIA_DIR, 'profile_images')

# Dizinlerin var olduğundan emin ol
os.makedirs(PROFILE_IMAGE_DIR, exist_ok=True)
os.makedirs(NFT_IMAGE_DIR, exist_ok=True)
os.makedirs(FRONTEND_NFT_IMAGES_DIR, exist_ok=True)
os.makedirs(FRONTEND_PROFILE_IMAGES_DIR, exist_ok=True)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_image(request):
    """Profil resmi yükleyen API endpoint'i"""
    user_id = request.user.id
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Dosya tipini kontrol et
    allowed_types = ['image/jpeg', 'image/png', 'image/gif']
    if image_file.content_type not in allowed_types:
        return Response({
            'error': 'Invalid file type. Only JPEG, PNG and GIF are allowed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Dosya boyutunu kontrol et (5MB)
    if image_file.size > 5 * 1024 * 1024:
        return Response({
            'error': 'File too large. Maximum size is 5MB'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Benzersiz dosya adı oluştur
    file_ext = os.path.splitext(image_file.name)[1]
    new_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(PROFILE_IMAGE_DIR, new_filename)
    
    # Dosyayı backend'e kaydet
    with open(file_path, 'wb+') as destination:
        for chunk in image_file.chunks():
            destination.write(chunk)
    
    # Dosyayı frontend'e kopyala
    frontend_file_path = os.path.join(FRONTEND_PROFILE_IMAGES_DIR, new_filename)
    try:
        shutil.copy2(file_path, frontend_file_path)
    except Exception as e:
        print(f"Frontend'e kopyalama hatası: {e}")
    
    # URL oluştur
    file_url = f"/media/uploads/profile_images/{new_filename}"
    
    # Kullanıcı profilini güncelle
    with connection.cursor() as cursor:
        # Eski profil resmini al
        cursor.execute("""
            SELECT ProfileImage
            FROM Users
            WHERE UserID = %s
        """, [user_id])
        
        old_image = cursor.fetchone()[0]
        
        # Profil resmini güncelle
        cursor.execute("""
            UPDATE Users
            SET ProfileImage = %s
            WHERE UserID = %s
        """, [file_url, user_id])
        
        # Eski dosyayı sil (varsa ve sistem dosyası değilse)
        if old_image and old_image.startswith('/media/uploads/profile_images/'):
            old_filename = os.path.basename(old_image)
            old_path = os.path.join(PROFILE_IMAGE_DIR, old_filename)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                    
                    # Frontend'den de sil
                    old_frontend_path = os.path.join(FRONTEND_PROFILE_IMAGES_DIR, old_filename)
                    if os.path.exists(old_frontend_path):
                        os.remove(old_frontend_path)
                except:
                    pass
    
    return Response({
        'url': file_url
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_nft_image(request):
    """NFT görseli yükleyen API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü ekle
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()[0]
        
        if user_role != 'admin':
            return Response({'error': 'Only administrators can upload NFT images'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Dosya tipini kontrol et
    allowed_types = ['image/jpeg', 'image/png', 'image/gif']
    if image_file.content_type not in allowed_types:
        return Response({
            'error': 'Invalid file type. Only JPEG, PNG and GIF are allowed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Dosya boyutunu kontrol et (10MB)
    if image_file.size > 10 * 1024 * 1024:
        return Response({
            'error': 'File too large. Maximum size is 10MB'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Benzersiz dosya adı oluştur
    file_ext = os.path.splitext(image_file.name)[1]
    new_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(NFT_IMAGE_DIR, new_filename)
    
    # Dosyayı backend'e kaydet
    with open(file_path, 'wb+') as destination:
        for chunk in image_file.chunks():
            destination.write(chunk)
    
    # Dosyayı frontend'e kopyala
    frontend_file_path = os.path.join(FRONTEND_NFT_IMAGES_DIR, new_filename)
    try:
        shutil.copy2(file_path, frontend_file_path)
        print(f"NFT görseli frontend'e kopyalandı: {frontend_file_path}")
    except Exception as e:
        print(f"Frontend'e kopyalama hatası: {e}")
    
    # URL oluştur
    file_url = f"/media/uploads/nft_images/{new_filename}"
    
    return Response({
        'url': file_url
    })

@api_view(['GET'])
def get_file(request, file_type, filename):
    """Dosyayı indiren API endpoint'i"""
    if file_type == 'profile_image':
        file_path = os.path.join(PROFILE_IMAGE_DIR, filename)
    elif file_type == 'nft_image':
        file_path = os.path.join(NFT_IMAGE_DIR, filename)
    else:
        return Response({'error': 'Invalid file type'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not os.path.exists(file_path):
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return FileResponse(open(file_path, 'rb'))