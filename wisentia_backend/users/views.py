from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
import hashlib
from .auth import generate_token
import jwt
from django.conf import settings
import logging
import datetime
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import throttle_classes
from .throttling import AuthenticationThrottle, CustomUserRateThrottle, SensitiveOperationsThrottle
import time
from django.http import JsonResponse
import json
from django.contrib.auth import logout

logger = logging.getLogger('wisentia')

# Düzeltilmiş versiyonu:
@swagger_auto_schema(
    method='post',  # HTTP metodu belirtildi
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['email', 'password'],
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, description='Kullanıcı e-posta adresi'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Kullanıcı şifresi'),
        }
    ),
    responses={
        200: openapi.Response('Başarılı giriş yanıtı', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'user': openapi.Schema(type=openapi.TYPE_OBJECT),
                'tokens': openapi.Schema(type=openapi.TYPE_OBJECT),
            }
        )),
        401: 'Geçersiz kimlik bilgileri',
        400: 'Eksik veya yanlış form verileri'
    },
    operation_description="Kullanıcı girişi yapar ve JWT token döndürür"
)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])  # Throttling aktifleştirildi
def login(request):

    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    password_hash = hashlib.sha256(password.encode()).hexdigest()

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserID, Username, Email, UserRole, IsActive
            FROM Users
            WHERE Email = %s AND PasswordHash = %s
        """, [email, password_hash])

        user_data = cursor.fetchone()

        if not user_data:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user_id, username, email, user_role, is_active = user_data

        if not is_active:
            return Response({'error': 'Account is inactive'}, status=status.HTTP_401_UNAUTHORIZED)

        cursor.execute("UPDATE Users SET LastLogin = GETDATE() WHERE UserID = %s", [user_id])

        tokens = generate_token(user_id)

        # JSON response oluştur
        response = JsonResponse({
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'role': user_role,
            },
            'tokens': tokens
        })

        # 🔥 COOKIE'yi burada set ediyoruz
        response.set_cookie(
            key='user',
            value=json.dumps({
                'id': user_id,
                'username': username,
                'role': user_role
            }),
            httponly=False,
            secure=False,              # ✅ HTTPS olmadığı için False olmalı
            samesite='Lax',           # ✅ Third-party cookie'ler için şart
            path='/'
        )


        return response

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])  # Throttling aktifleştirildi
def register(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        wallet_address = request.data.get('walletAddress', '')
        
        print(f"Register data received: username={username}, email={email}, wallet_address={wallet_address}")
        
        if not username or not email or not password:
            return Response({
                'error': 'Username, email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Şifreyi hashle
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        with connection.cursor() as cursor:
            # Kullanıcı var mı kontrol et
            cursor.execute("""
                SELECT COUNT(*) 
                FROM Users 
                WHERE Username = %s OR Email = %s
            """, [username, email])
            
            if cursor.fetchone()[0] > 0:
                return Response({
                    'error': 'Username or email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # WalletAddress boşsa benzersiz bir değer ata
            if not wallet_address:
                import uuid
                wallet_address = f"temp_{str(uuid.uuid4())}"
                print(f"Empty wallet address, using temporary value: {wallet_address}")
            
            try:
                # Kullanıcı ekle
                cursor.execute("""
                    INSERT INTO Users 
                    (Username, Email, PasswordHash, WalletAddress, JoinDate, UserRole, 
                    ThemePreference, TotalPoints, IsActive)
                    VALUES (%s, %s, %s, %s, GETDATE(), 'regular', 'light', 0, 1);
                """, [username, email, password_hash, wallet_address])
                
                # ID'yi al
                cursor.execute("SELECT @@IDENTITY")
                user_id_result = cursor.fetchone()
                
                if user_id_result and user_id_result[0]:
                    # Decimal türünü int'e dönüştür - KRITIK KUCUK FIX
                    user_id = int(user_id_result[0])
                else:
                    # Alternatif olarak eklenen kullanıcıyı bul
                    cursor.execute("""
                        SELECT UserID FROM Users 
                        WHERE Username = %s AND Email = %s
                    """, [username, email])
                    user_id_result = cursor.fetchone()
                    if user_id_result:
                        # Decimal türünü int'e dönüştür - KRITIK KUCUK FIX
                        user_id = int(user_id_result[0])
                    else:
                        raise Exception("User created but couldn't retrieve ID")
                    
            except Exception as e:
                print(f"Database insert error: {str(e)}")
                return Response({
                    'error': 'Database error occurred',
                    'detail': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # JWT token oluştur
            tokens = generate_token(user_id)
            
            # Yanıtta geçici cüzdan adresi yerine orijinal boş değeri gönder
            wallet_to_return = '' if wallet_address and wallet_address.startswith('temp_') else wallet_address
            
            # Response verisini hazırla
            response_data = {
                'user': {
                    'id': user_id,  # int'e dönüştürülmüş kullanıcı ID'si
                    'username': username,
                    'email': email,
                    'walletAddress': wallet_to_return,
                    'role': 'regular',
                },
                'tokens': tokens
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return Response({
            'error': 'An error occurred during registration',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Ekstra API endpoint'leri ekleyin
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([CustomUserRateThrottle])
def check_username(request):
    username = request.data.get('username')
    
    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Users WHERE Username = %s", [username])
        count = cursor.fetchone()[0]
    
    return Response({"available": count == 0})

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([CustomUserRateThrottle])
def check_email(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Users WHERE Email = %s", [email])
        count = cursor.fetchone()[0]
    
    return Response({"available": count == 0})

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])
def refresh_token(request):
    """Token yenileme için API endpoint'i"""
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Token'ı çöz
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
        
        # Token tipini kontrol et
        if payload.get('token_type') != 'refresh':
            return Response({'error': 'Invalid token type'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = payload.get('user_id')
        
        # Kullanıcı var mı kontrol et
        with connection.cursor() as cursor:
            cursor.execute("SELECT UserID FROM Users WHERE UserID = %s AND IsActive = 1", [user_id])
            if not cursor.fetchone():
                return Response({'error': 'User not found or inactive'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Oturum kaydı ekle
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                VALUES (%s, 'token_refresh', 'Token refreshed', GETDATE(), %s, %s)
            """, [
                user_id, 
                request.META.get('REMOTE_ADDR', ''),
                request.META.get('HTTP_USER_AGENT', '')
            ])
        
        # Yeni token oluştur
        new_tokens = generate_token(user_id)
        return Response(new_tokens)
        
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Refresh token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': f'Token refresh error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@throttle_classes([CustomUserRateThrottle])
def get_user_profile(request):
    """Kullanıcı profilini getirmek için API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserID, Username, Email, WalletAddress, JoinDate, LastLogin, 
            UserRole, ProfileImage, ThemePreference, TotalPoints
            FROM Users
            WHERE UserID = %s
        """, [user_id])
        
        user_data = cursor.fetchone()
        
        if not user_data:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = {
            'id': user_data[0],
            'username': user_data[1],
            'email': user_data[2],
            'walletAddress': user_data[3],
            'joinDate': user_data[4],
            'lastLogin': user_data[5],
            'role': user_data[6],
            'profileImage': user_data[7],
            'themePreference': user_data[8],
            'totalPoints': user_data[9],
        }
        
        return Response(user)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@throttle_classes([SensitiveOperationsThrottle])
def update_profile(request):
    """Kullanıcı profil güncellemesi için API endpoint'i"""
    user_id = request.user.id
    allowed_fields = ['username', 'email', 'walletAddress', 'profileImage', 'themePreference']
    update_data = {}
    
    for field in allowed_fields:
        if field in request.data:
            update_data[field] = request.data[field]
    
    if not update_data:
        return Response({'error': 'No valid fields to update'}, status=status.HTTP_400_BAD_REQUEST)
    
    # SQL sorgusu oluştur
    sql_parts = []
    params = []
    
    if 'username' in update_data:
        # Username'in benzersiz olup olmadığını kontrol et
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) FROM Users 
                WHERE Username = %s AND UserID != %s
            """, [update_data['username'], user_id])
            if cursor.fetchone()[0] > 0:
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        sql_parts.append("Username = %s")
        params.append(update_data['username'])
    
    if 'email' in update_data:
        # Email'in benzersiz olup olmadığını kontrol et
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) FROM Users 
                WHERE Email = %s AND UserID != %s
            """, [update_data['email'], user_id])
            if cursor.fetchone()[0] > 0:
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        sql_parts.append("Email = %s")
        params.append(update_data['email'])
    
    if 'walletAddress' in update_data:
        sql_parts.append("WalletAddress = %s")
        params.append(update_data['walletAddress'])
    
    if 'profileImage' in update_data:
        sql_parts.append("ProfileImage = %s")
        params.append(update_data['profileImage'])
    
    if 'themePreference' in update_data:
        sql_parts.append("ThemePreference = %s")
        params.append(update_data['themePreference'])
    
    # Güncelleme SQL'ini çalıştır
    params.append(user_id)  # WHERE koşulu için
    
    with connection.cursor() as cursor:
        cursor.execute(f"""
            UPDATE Users
            SET {', '.join(sql_parts)}
            WHERE UserID = %s
        """, params)
    
    # Güncellenmiş kullanıcı bilgilerini döndür
    return get_user_profile(request)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@throttle_classes([SensitiveOperationsThrottle])
def change_password(request):
    """Kullanıcı şifre değiştirme için API endpoint'i"""
    user_id = request.user.id
    current_password = request.data.get('currentPassword')
    new_password = request.data.get('newPassword')
    
    if not current_password or not new_password:
        return Response({
            'error': 'Current password and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Mevcut şifreyi kontrol et
    current_password_hash = hashlib.sha256(current_password.encode()).hexdigest()
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) FROM Users 
            WHERE UserID = %s AND PasswordHash = %s
        """, [user_id, current_password_hash])
        
        if cursor.fetchone()[0] == 0:
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Yeni şifreyi hashle ve güncelle
        new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        cursor.execute("""
            UPDATE Users 
            SET PasswordHash = %s
            WHERE UserID = %s
        """, [new_password_hash, user_id])
    
    return Response({'message': 'Password changed successfully'})

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])
def request_password_reset(request):
    """Şifre sıfırlama isteği oluşturur"""
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Kullanıcıyı kontrol et
        cursor.execute("""
            SELECT UserID, Username 
            FROM Users
            WHERE Email = %s AND IsActive = 1
        """, [email])
        
        user_data = cursor.fetchone()
        if not user_data:
            # Güvenlik için kullanıcı olmasa bile başarılı yanıt dön
            return Response({'message': 'If your account exists, you will receive a password reset email'})
        
        user_id, username = user_data
        
        # JWT token oluştur (24 saat geçerli)
        expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        
        reset_payload = {
            'user_id': user_id,
            'email': email,
            'exp': int(expiry.timestamp()),
            'iat': int(datetime.datetime.utcnow().timestamp()),
            'type': 'password_reset'
        }
        
        reset_token = jwt.encode(reset_payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Email gönderme işlemi yapılmalı (burada sadece simülasyon)
        # Gerçek bir email gönderme servisi entegre edilmelidir
        
        logger.info(f"Password reset requested for UserID: {user_id}, Token: {reset_token}")
        
        # Etkinlik logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'password_reset_request', 'Password reset requested', GETDATE(), %s, %s)
        """, [
            user_id, 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({'message': 'If your account exists, you will receive a password reset email'})

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([SensitiveOperationsThrottle])
def reset_password(request):
    """Şifre sıfırlama işlemini gerçekleştirir"""
    token = request.data.get('token')
    new_password = request.data.get('newPassword')
    
    if not token or not new_password:
        return Response({'error': 'Token and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Token'ı doğrula
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        # Token tipini kontrol et
        if payload.get('type') != 'password_reset':
            return Response({'error': 'Invalid token type'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = payload.get('user_id')
        email = payload.get('email')
        
        # Şifreyi hashle
        import hashlib
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        with connection.cursor() as cursor:
            # Kullanıcıyı kontrol et
            cursor.execute("""
                SELECT UserID, Email 
                FROM Users
                WHERE UserID = %s AND Email = %s AND IsActive = 1
            """, [user_id, email])
            
            user_data = cursor.fetchone()
            if not user_data:
                return Response({'error': 'User not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
            
            # Şifreyi güncelle
            cursor.execute("""
                UPDATE Users
                SET PasswordHash = %s
                WHERE UserID = %s
            """, [password_hash, user_id])
            
            # Etkinlik logu ekle
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                VALUES (%s, 'password_reset', 'Password reset completed', GETDATE(), %s, %s)
            """, [
                user_id, 
                request.META.get('REMOTE_ADDR', ''),
                request.META.get('HTTP_USER_AGENT', '')
            ])
        
        return Response({'message': 'Password has been reset successfully'})
    
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Reset token has expired'}, status=status.HTTP_400_BAD_REQUEST)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid reset token'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}", exc_info=True)
        return Response({'error': 'Failed to reset password'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Successfully logged out'})