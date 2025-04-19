# users/auth.py
from rest_framework import authentication
from rest_framework import exceptions
from django.db import connection
import jwt
from django.conf import settings
import datetime
import re

class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
            
        try:
            # Başlığı ayır
            auth_pattern = re.compile(r'^[Bb]earer\s+(.+)$')
            match = auth_pattern.match(auth_header)
            if not match:
                return None
                
            token = match.group(1)
                
            # Token'ı çöz
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
                    SELECT UserID, Username, Email, UserRole, IsActive, LastLogin
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
                    'username': user_data[1],
                    'email': user_data[2],
                    'role': user_data[3],
                    'is_authenticated': True
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