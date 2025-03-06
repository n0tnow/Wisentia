from rest_framework import authentication
from rest_framework import exceptions
from django.db import connection
import jwt
from django.conf import settings
import datetime

class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
            
        try:
            # Başlığı ayır
            auth_type, token = auth_header.split()
            if auth_type.lower() != 'bearer':
                return None
                
            # Token'ı çöz
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            exp = payload.get('exp')
            
            # Süre kontrolü
            if datetime.datetime.now().timestamp() > exp:
                raise exceptions.AuthenticationFailed('Token has expired')
                
            # Kullanıcıyı bul
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT UserID, Username, Email, FirstName, LastName
                    FROM Users
                    WHERE UserID = %s
                """, [user_id])
                
                user_data = cursor.fetchone()
                
                if not user_data:
                    raise exceptions.AuthenticationFailed('User not found')
                    
                # Basit bir kullanıcı nesnesi oluştur
                user = type('User', (), {
                    'id': user_data[0],
                    'username': user_data[1],
                    'email': user_data[2],
                    'is_authenticated': True
                })
                
            return (user, token)
                
        except (ValueError, jwt.PyJWTError):
            raise exceptions.AuthenticationFailed('Invalid token')

def generate_token(user_id):
    """Kullanıcı için JWT token oluşturur"""
    access_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(days=1)  # 1 gün süresi olsun
    refresh_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(days=30)  # 30 gün süresi olsun
    
    access_payload = {
        'user_id': user_id,
        'exp': int(access_token_expiry.timestamp()),  # Süre UTC olarak hesaplanıyor
        'token_type': 'access'
    }
    
    refresh_payload = {
        'user_id': user_id,
        'exp': int(refresh_token_expiry.timestamp()),
        'token_type': 'refresh'
    }
    
    access_token = jwt.encode(access_payload, settings.SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, settings.SECRET_KEY, algorithm='HS256')
    
    print(f"✅ Yeni Token Üretildi: {access_token}")  # Konsola token yazdır

    return {
        'access': access_token,
        'refresh': refresh_token,
        'expires_in': 86400  # 1 gün (saniye cinsinden)
    }