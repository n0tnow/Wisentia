from django.core.cache import cache
from django.conf import settings
import hashlib
import json
from functools import wraps
from rest_framework.response import Response

def get_cache_key(prefix, identifier, params=None):
    """Önbellek için benzersiz bir anahtar oluşturur"""
    key = f"{settings.CACHE_KEY_PREFIX}{prefix}_{identifier}"
    
    if params:
        if isinstance(params, dict):
            params_str = json.dumps(params, sort_keys=True)
        else:
            params_str = str(params)
        
        params_hash = hashlib.md5(params_str.encode()).hexdigest()
        key = f"{key}_{params_hash}"
    
    return key

def cache_data(key, data, timeout=None):
    """Veriyi önbelleğe kaydeder"""
    if timeout is None:
        timeout = settings.CACHE_TIMEOUT.get('default', 900)  # Varsayılan: 15 dakika
    
    cache.set(key, data, timeout)
    return data

def get_cached_data(key):
    """Önbellekten veri getirir"""
    return cache.get(key)

def invalidate_cache(key_or_pattern):
    """Belirli bir anahtarı veya deseni önbellekten siler"""
    if '*' in key_or_pattern:
        keys = cache.keys(key_or_pattern)
        if keys:
            cache.delete_many(keys)
    else:
        cache.delete(key_or_pattern)


def cache_response(timeout=None, key_prefix=None):
    """API yanıtlarını önbellekleyen bir dekoratör"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Önbellek anahtarı oluştur
            identifier = '_'.join([str(arg) for arg in args])
            for k, v in kwargs.items():
                identifier = f"{identifier}_{k}_{v}"
            
            if not identifier:
                identifier = 'default'
            
            prefix = key_prefix or view_func.__name__
            
            # GET parametrelerini kullan
            params = None
            if request.query_params:
                params = dict(request.query_params)
            
            cache_key = get_cache_key(prefix, identifier, params)
            
            # Önbellekten veri al
            cached_data = get_cached_data(cache_key)
            if cached_data is not None:
                return Response(cached_data)
            
            # Veri önbellekte yoksa fonksiyonu çalıştır
            response = view_func(request, *args, **kwargs)
            
            # Sadece başarılı yanıtları önbelleğe al
            if response.status_code == 200:
                cache_timeout = timeout or settings.CACHE_TIMEOUT.get(prefix, None)
                cache_data(cache_key, response.data, cache_timeout)
            
            return response
        return wrapper
    return decorator