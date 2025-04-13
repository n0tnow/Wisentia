# users/throttling.py

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

class AuthenticationThrottle(AnonRateThrottle):
    scope = 'auth'

# Ana UserRateThrottle sınıfımızı özelleştirelim
class CustomUserRateThrottle(UserRateThrottle):
    scope = 'user'
    
    
    def get_cache_key(self, request, view):
        # Özel kullanıcı modeli kullanıyoruz, Django User modeli değil
        if hasattr(request, 'user') and hasattr(request.user, 'id'):
            ident = request.user.id
        elif hasattr(request, 'user') and hasattr(request.user, 'UserID'):
            ident = request.user.UserID
        else:
            # Kullanıcı kimliği bulunamadıysa, IP'ye göre throttle uygula
            ident = self.get_ident(request)
            
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }

class SensitiveOperationsThrottle(CustomUserRateThrottle):
    scope = 'sensitive'
    # CustomUserRateThrottle'dan miras aldığımız için get_cache_key metodunu tekrar tanımlamamıza gerek yok