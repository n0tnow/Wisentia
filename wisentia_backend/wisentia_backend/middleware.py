import json
import traceback
from django.http import JsonResponse
from rest_framework import status

class APIExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        # API isteklerini kontrol et
        if request.path.startswith('/api/'):
            error_message = str(exception)
            error_detail = traceback.format_exc() if hasattr(exception, '__traceback__') else None
            
            # JSON yanıtı oluştur
            response_data = {
                'error': error_message,
                'success': False
            }
            
            # Debug modunda daha fazla detay ekle
            from django.conf import settings
            if settings.DEBUG and error_detail:
                response_data['traceback'] = error_detail
            
            # HTTP durumu belirle
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            
            # Log the error
            import logging
            logger = logging.getLogger('django')
            logger.error(f"API Error: {error_message}")
            if error_detail:
                logger.error(error_detail)
            
            return JsonResponse(response_data, status=status_code)
        
        return None
    

class RateLimitHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # X-RateLimit bilgilerini ekle
        if hasattr(request, 'throttle_status'):
            for scope, status in request.throttle_status.items():
                if status:
                    response['X-RateLimit-Scope'] = scope
                    response['X-RateLimit-Remaining'] = status['remaining']
                    response['X-RateLimit-Reset'] = status['reset']
        
        return response