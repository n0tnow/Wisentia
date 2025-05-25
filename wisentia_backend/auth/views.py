from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection
import jwt
from django.conf import settings
from rest_framework import status

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