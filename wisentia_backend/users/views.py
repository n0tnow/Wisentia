from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
import hashlib
from .auth import (
    generate_token, 
    generate_email_verification_token,
    store_email_verification_code,
    store_password_reset_code, 
    verify_email_code, 
    verify_password_reset_code,
    clear_password_reset_code
)
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
from django.core.mail import send_mail




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
            SELECT UserID, Username, Email, UserRole, IsActive, IsEmailVerified
            FROM Users
            WHERE Email = %s AND PasswordHash = %s
        """, [email, password_hash])

        user_data = cursor.fetchone()

        if not user_data:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user_id, username, email, user_role, is_active, is_email_verified = user_data

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
                'isEmailVerified': bool(is_email_verified)
            },
            'tokens': tokens
        })

        # 🔥 COOKIE'yi burada set ediyoruz
        response.set_cookie(
            key='user',
            value=json.dumps({
                'id': user_id,
                'username': username,
                'role': user_role,
                'isEmailVerified': bool(is_email_verified)
            }),
            httponly=False,
            secure=False,              # ✅ HTTPS olmadığı için False olmalı
            samesite='Lax',           # ✅ Third-party cookie'ler için şart
            path='/'
        )


        return response

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])
def register(request):
    """Kullanıcı kaydı yapar ve doğrulama kodu gönderir"""
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
                # Kullanıcı ekle - IsEmailVerified alanı eklendi ve varsayılan olarak 0 (false) değeri atandı
                cursor.execute("""
                    INSERT INTO Users 
                    (Username, Email, PasswordHash, WalletAddress, JoinDate, UserRole, 
                    ThemePreference, TotalPoints, IsActive, IsEmailVerified)
                    VALUES (%s, %s, %s, %s, GETDATE(), 'regular', 'light', 0, 1, 0);
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
            
            # E-posta doğrulama kodu oluştur ve cache'de sakla
            verification_code = store_email_verification_code(
                email, 
                user_id, 
                expiry_seconds=getattr(settings, 'VERIFICATION_CODE_EXPIRY', 86400)
            )
            
            # E-posta gönder
            email_sent = send_verification_code_email(email, verification_code, username)
            
            if email_sent:
                logger.info(f"Verification code sent to {email}")
                
                # Aktivite log kaydı ekle
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                    VALUES (%s, 'register', 'User registered and verification code sent', GETDATE(), %s, %s)
                """, [
                    user_id, 
                    request.META.get('REMOTE_ADDR', ''),
                    request.META.get('HTTP_USER_AGENT', '')
                ])
            else:
                logger.warning(f"Failed to send verification code to {email}")
                
                # E-posta gönderilemese bile kullanıcı kaydını tamamla
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                    VALUES (%s, 'register', 'User registered but verification code email failed', GETDATE(), %s, %s)
                """, [
                    user_id, 
                    request.META.get('REMOTE_ADDR', ''),
                    request.META.get('HTTP_USER_AGENT', '')
                ])
            
            # JWT token oluştur
            tokens = generate_token(user_id)
            
            # Yanıtta geçici cüzdan adresi yerine orijinal boş değeri gönder
            wallet_to_return = '' if wallet_address and wallet_address.startswith('temp_') else wallet_address
            
            # Response verisini hazırla
            response_data = {
                'user': {
                    'id': user_id,
                    'username': username,
                    'email': email,
                    'walletAddress': wallet_to_return,
                    'role': 'regular',
                    'isEmailVerified': False
                },
                'tokens': tokens,
                'verificationEmailSent': email_sent
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
            UserRole, ProfileImage, ThemePreference, TotalPoints, IsEmailVerified
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
            'isEmailVerified': bool(user_data[10]),
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
        
        # E-posta değiştiğinde IsEmailVerified'ı false yap
        sql_parts.append("IsEmailVerified = 0")
    
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
    """Şifre sıfırlama isteği oluşturur ve doğrulama kodu gönderir"""
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
            return Response({'message': 'If your account exists, you will receive a password reset code'})
        
        user_id, username = user_data
        
        # Şifre sıfırlama kodu oluştur ve cache'de sakla
        reset_code = store_password_reset_code(email, user_id, 
                             expiry_seconds=getattr(settings, 'PASSWORD_RESET_CODE_EXPIRY', 86400))
        
        # E-posta gönderme işlemi
        email_sent = send_password_reset_code_email(email, reset_code, username)
        
        if email_sent:
            logger.info(f"Password reset code sent to email: {email}")
        else:
            logger.error(f"Failed to send password reset code to email: {email}")
        
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
    
    return Response({'message': 'If your account exists, you will receive a password reset code'})

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

@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['token'],
        properties={
            'token': openapi.Schema(type=openapi.TYPE_STRING, description='E-posta doğrulama token\'ı'),
        }
    ),
    responses={
        200: 'E-posta doğrulama başarılı',
        400: 'Geçersiz token',
        404: 'Kullanıcı bulunamadı'
    },
    operation_description="E-posta doğrulama işlemini gerçekleştirir"
)
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])
def verify_email(request):
    """E-posta doğrulama işlemini gerçekleştirir"""
    token = request.data.get('token')
    
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Token'ı doğrula
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        # Token tipini kontrol et
        if payload.get('token_type') != 'email_verification':
            return Response({'error': 'Invalid token type'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = payload.get('user_id')
        email = payload.get('email')
        
        with connection.cursor() as cursor:
            # Kullanıcıyı kontrol et
            cursor.execute("""
                SELECT UserID, Email, IsEmailVerified
                FROM Users
                WHERE UserID = %s AND Email = %s
            """, [user_id, email])
            
            user_data = cursor.fetchone()
            if not user_data:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Kullanıcı zaten doğrulanmışsa bilgi ver
            if user_data[2]:  # IsEmailVerified
                return Response({'message': 'Email already verified'})
            
            # E-posta doğrulama durumunu güncelle
            cursor.execute("""
                UPDATE Users
                SET IsEmailVerified = 1
                WHERE UserID = %s
            """, [user_id])
            
            # Etkinlik logu ekle
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                VALUES (%s, 'email_verification', 'Email verification completed', GETDATE(), %s, %s)
            """, [
                user_id, 
                request.META.get('REMOTE_ADDR', ''),
                request.META.get('HTTP_USER_AGENT', '')
            ])
        
        return Response({'message': 'Email verified successfully'})
    
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Verification token has expired'}, status=status.HTTP_400_BAD_REQUEST)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}", exc_info=True)
        return Response({'error': 'Failed to verify email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Successfully logged out'})


def send_verification_code_email(email, code, username):
    """E-posta doğrulama kodu içeren e-posta gönderir"""
    subject = "Your Email Verification Code - Wisentia Learning Platform"
    
    message = f"""
Hello {username},

Thank you for registering with Wisentia Learning Platform.

Your email verification code is:

{code}

Please enter this code on our website to verify your email address. This code will expire in 24 hours.

If you did not register on our platform, please ignore this email.

Best regards,
The Wisentia Team
    """
    
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    try:
        send_mail(subject, message, from_email, recipient_list)
        logger.info(f"Verification code email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {email}: {str(e)}")
        return False

def send_password_reset_code_email(email, code, username):
    """Şifre sıfırlama kodu içeren e-posta gönderir"""
    subject = "Your Password Reset Code - Wisentia Learning Platform"
    
    message = f"""
Hello {username},

You have requested to reset your password.

Your password reset code is:

{code}

Please enter this code on our website to reset your password. This code will expire in 24 hours.

If you did not request a password reset, please ignore this email.

Best regards,
The Wisentia Team
    """
    
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    try:
        send_mail(subject, message, from_email, recipient_list)
        logger.info(f"Password reset code email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {str(e)}")
        return False
    

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([SensitiveOperationsThrottle])
def reset_password_with_code(request):
    """Doğrulama kodu ile şifre sıfırlama işlemini gerçekleştirir"""
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    if not email or not code or not new_password:
        return Response({
            'error': 'Email, verification code and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Doğrulama kodunu kontrol et
    user_id = verify_password_reset_code(email, code)
    
    if not user_id:
        return Response({'error': 'Invalid or expired verification code'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Şifreyi hashle
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
                return Response({'error': 'User not found or inactive'}, 
                               status=status.HTTP_404_NOT_FOUND)
            
            # Şifreyi güncelle
            cursor.execute("""
                UPDATE Users
                SET PasswordHash = %s
                WHERE UserID = %s
            """, [password_hash, user_id])
            
            # Doğrulama kodunu temizle
            clear_password_reset_code(email)
            
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
    
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}", exc_info=True)
        return Response({'error': 'Failed to reset password'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])
def verify_email_with_code(request):
    """E-posta doğrulama kodunu kontrol eder ve kullanıcı e-postasını doğrular"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response({'error': 'Email and verification code are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Doğrulama kodunu kontrol et
    user_id = verify_email_code(email, code)
    
    if not user_id:
        return Response({'error': 'Invalid or expired verification code'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with connection.cursor() as cursor:
            # Kullanıcıyı kontrol et
            cursor.execute("""
                SELECT UserID, Email, IsEmailVerified
                FROM Users
                WHERE UserID = %s AND Email = %s
            """, [user_id, email])
            
            user_data = cursor.fetchone()
            if not user_data:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Kullanıcı zaten doğrulanmışsa bilgi ver
            if user_data[2]:  # IsEmailVerified
                return Response({'message': 'Email already verified'})
            
            # E-posta doğrulama durumunu güncelle
            cursor.execute("""
                UPDATE Users
                SET IsEmailVerified = 1
                WHERE UserID = %s
            """, [user_id])
            
            # Etkinlik logu ekle
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                VALUES (%s, 'email_verification', 'Email verification completed', GETDATE(), %s, %s)
            """, [
                user_id, 
                request.META.get('REMOTE_ADDR', ''),
                request.META.get('HTTP_USER_AGENT', '')
            ])
        
        return Response({'message': 'Email verified successfully'})
    
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}", exc_info=True)
        return Response({'error': 'Failed to verify email'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthenticationThrottle])
def resend_verification_code(request):
    """Yeni bir e-posta doğrulama kodu gönderir"""
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Kullanıcıyı kontrol et
        cursor.execute("""
            SELECT UserID, Username, IsEmailVerified 
            FROM Users
            WHERE Email = %s AND IsActive = 1
        """, [email])
        
        user_data = cursor.fetchone()
        if not user_data:
            # Güvenlik için kullanıcı olmasa bile başarılı yanıt dön
            return Response({'message': 'If your account exists, you will receive a verification code'})
        
        user_id, username, is_email_verified = user_data
        
        # Zaten doğrulanmışsa bilgi ver
        if is_email_verified:
            return Response({'message': 'Your email is already verified'})
        
        # Yeni doğrulama kodu oluştur ve gönder
        verification_code = store_email_verification_code(
            email, 
            user_id, 
            expiry_seconds=getattr(settings, 'VERIFICATION_CODE_EXPIRY', 86400)
        )
        
        # E-posta gönder
        email_sent = send_verification_code_email(email, verification_code, username)
        
        if email_sent:
            logger.info(f"New verification code sent to {email}")
            
            # Aktivite log kaydı ekle
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                VALUES (%s, 'resend_verification', 'New verification code sent', GETDATE(), %s, %s)
            """, [
                user_id, 
                request.META.get('REMOTE_ADDR', ''),
                request.META.get('HTTP_USER_AGENT', '')
            ])
        else:
            logger.warning(f"Failed to send new verification code to {email}")
    
    return Response({'message': 'If your account exists, a new verification code has been sent'})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    """Verify a token and check if user is admin"""
    try:
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        
        # Get user info
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT UserID, UserRole FROM Users WHERE UserID = %s
            """, [user_id])
            
            user = cursor.fetchone()
            
            if not user:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            is_admin = user[1] == 'admin'
            
            return Response({
                'valid': True,
                'user_id': user[0],
                'is_admin': is_admin
            })
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)