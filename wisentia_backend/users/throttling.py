# users/throttling.py

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class AuthenticationThrottle(AnonRateThrottle):
    scope = 'auth'

class SensitiveOperationsThrottle(UserRateThrottle):
    scope = 'sensitive'
    
    # Özel get_cache_key metodu ekleyin
    def get_cache_key(self, request, view):
        # Django User modeli yerine doğrudan request.user.id kullan
        if hasattr(request, 'user') and hasattr(request.user, 'id'):
            ident = request.user.id
        else:
            ident = self.get_ident(request)
            
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }