# users/auth.py
from rest_framework import authentication
from rest_framework import exceptions
from django.db import connection
import jwt
from django.conf import settings
import datetime
import re
import random
import string
from django.core.cache import cache


class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
            
        try:
            # Extract token - handle case both when "Bearer " is included or not
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # Remove 'Bearer ' prefix
            else:
                token = auth_header  # Assume the token is provided directly
                
            if not token or token.isspace():
                return None
                
            # Decode token
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                raise exceptions.AuthenticationFailed('Token has expired')
            except jwt.InvalidTokenError:
                raise exceptions.AuthenticationFailed('Invalid token')
                
            user_id = payload.get('user_id')
            exp = payload.get('exp')
            token_type = payload.get('token_type')
            
            # Token tipi kontrolü
            if token_type != 'access':
                raise exceptions.AuthenticationFailed('Invalid token type')
                
            # Süre kontrolü
            if datetime.datetime.now().timestamp() > exp:
                raise exceptions.AuthenticationFailed('Token has expired')
                
            # Kullanıcıyı bul
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT UserID, Username, Email, UserRole, IsActive, LastLogin, IsEmailVerified
                    FROM Users
                    WHERE UserID = %s
                """, [user_id])
                
                user_data = cursor.fetchone()
                
                if not user_data:
                    raise exceptions.AuthenticationFailed('User not found')
                
                if not user_data[4]:  # IsActive kontrolü
                    raise exceptions.AuthenticationFailed('User is inactive')
                    
                # Son giriş zamanını güncelle (isteğe bağlı)
                # cursor.execute("UPDATE Users SET LastLogin = GETDATE() WHERE UserID = %s", [user_id])
                    
                # Basit bir kullanıcı nesnesi oluştur
                user = type('User', (), {
                    'id': user_data[0],
                    'pk': user_data[0],  # DRF için pk özelliği ekledik
                    'username': user_data[1],
                    'email': user_data[2],
                    'role': user_data[3],
                    'is_authenticated': True,
                    'is_email_verified': bool(user_data[6]),
                    # Django Model benzeri özellikler ekleyelim
                    '__str__': lambda self: self.username
                })
                
            return (user, token)
                
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication error: {str(e)}')

def generate_token(user_id):
    """Kullanıcı için JWT token oluşturur"""
    access_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=12)  # 12 saat süresi
    refresh_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(days=7)  # 7 gün süresi
    
    access_payload = {
        'user_id': user_id,
        'exp': int(access_token_expiry.timestamp()),
        'iat': int(datetime.datetime.utcnow().timestamp()),
        'token_type': 'access'
    }
    
    refresh_payload = {
        'user_id': user_id,
        'exp': int(refresh_token_expiry.timestamp()),
        'iat': int(datetime.datetime.utcnow().timestamp()),
        'token_type': 'refresh'
    }
    
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')

    # PyJWT 2.x'te string'e dönüştür
    if isinstance(access_token, bytes):
        access_token = access_token.decode('utf-8')
    if isinstance(refresh_token, bytes):
        refresh_token = refresh_token.decode('utf-8')

    return {
        'access': access_token,
        'refresh': refresh_token,
        'expires_in': 60 * 60 * 12  # 12 saat (saniye cinsinden)
    }

def generate_email_verification_token(user_id, email):
    """Kullanıcı için e-posta doğrulama token'ı oluşturur"""
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=24)  # 24 saat geçerli

    payload = {
        'user_id': user_id,
        'email': email,
        'exp': int(expiry.timestamp()),
        'iat': int(datetime.datetime.utcnow().timestamp()),
        'token_type': 'email_verification'
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    # PyJWT 2.x compatibility
    if isinstance(token, bytes):
        token = token.decode('utf-8')
        
    return token



def generate_verification_code(length=None):
    """Rastgele bir doğrulama kodu oluşturur"""
    if length is None:
        length = getattr(settings, 'VERIFICATION_CODE_LENGTH', 6)
    return ''.join(random.choices(string.digits, k=length))

def store_email_verification_code(email, user_id, expiry_seconds=None):
    """Email doğrulama kodunu oluşturur ve cache'de saklar"""
    if expiry_seconds is None:
        expiry_seconds = getattr(settings, 'VERIFICATION_CODE_EXPIRY', 86400)
        
    code = generate_verification_code()
    cache_key = f"{settings.EMAIL_VERIFICATION_CACHE_PREFIX}{email}"
    
    # Cache'e kaydet: (kod, user_id)
    cache.set(cache_key, (code, user_id), expiry_seconds)
    
    return code

def store_password_reset_code(email, user_id, expiry_seconds=None):
    """Şifre sıfırlama kodunu oluşturur ve cache'de saklar"""
    if expiry_seconds is None:
        expiry_seconds = getattr(settings, 'PASSWORD_RESET_CODE_EXPIRY', 86400)
        
    code = generate_verification_code()
    cache_key = f"{settings.PASSWORD_RESET_CACHE_PREFIX}{email}"
    
    # Cache'e kaydet: (kod, user_id)
    cache.set(cache_key, (code, user_id), expiry_seconds)
    
    return code

def verify_email_code(email, code):
    """Email doğrulama kodunu kontrol eder"""
    cache_key = f"{settings.EMAIL_VERIFICATION_CACHE_PREFIX}{email}"
    cached_data = cache.get(cache_key)
    
    if not cached_data:
        return None  # Kod bulunamadı veya süresi doldu
    
    stored_code, user_id = cached_data
    
    if stored_code == code:
        # Doğrulama başarılı, cache'den kaldır
        cache.delete(cache_key)
        return user_id
    
    return None  # Geçersiz kod

def verify_password_reset_code(email, code):
    """Şifre sıfırlama kodunu kontrol eder"""
    cache_key = f"{settings.PASSWORD_RESET_CACHE_PREFIX}{email}"
    cached_data = cache.get(cache_key)
    
    if not cached_data:
        return None  # Kod bulunamadı veya süresi doldu
    
    stored_code, user_id = cached_data
    
    if stored_code == code:
        # Kod doğrulanmış ama şifre sıfırlamasında kullanılacağı için
        # şu aşamada cache'den kaldırmıyoruz
        return user_id
    
    return None  # Geçersiz kod

# Şifre sıfırlama işlemi tamamlandığında kodun cache'den temizlenmesi için
def clear_password_reset_code(email):
    """Şifre sıfırlama kodunu cache'den temizler"""
    cache_key = f"{settings.PASSWORD_RESET_CACHE_PREFIX}{email}"
    cache.delete(cache_key)