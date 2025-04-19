import os
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'NaxrE8XybIS_ZYw9ducyHtj9LYXgK-noltfxxihmbe2MNKrC-QqkDuvXn9TcuNMWyqI'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'users',
    'courses',
    'quizzes',
    'quests',
    'nfts',
    'community',
    'ai',
    'wallet',
    'files',
    'search',
    'notifications',
    'analytics',
    'admin_panel',
    'subscriptions',
    'drf_yasg',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'wisentia_backend.middleware.FixUserMiddleware',  # Yeni eklenen middleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'wisentia_backend.middleware.APIExceptionMiddleware',
    'wisentia_backend.middleware.RateLimitHeaderMiddleware',
]


ROOT_URLCONF = 'wisentia_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'wisentia_backend.wsgi.application'
# Cache ayarları
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "IGNORE_EXCEPTIONS": True,
        }
    }
}

# Cache key prefixes
CACHE_KEY_PREFIX = 'wisentia_'

# Cache timeouts (saniye cinsinden)
CACHE_TIMEOUT = {
    'default': 60 * 15,  # 15 dakika
    'courses': 60 * 60,  # 1 saat
    'user_profile': 60 * 10,  # 10 dakika
    'popular_content': 60 * 60 * 24,  # 1 gün
}
# Database
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'WisentiaDB',
        'HOST': 'BILALKAYA\\SQLEXPRESS',  # SQL Server adınıza göre değiştirin
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'trusted_connection': 'yes',
        },
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'users.auth.CustomJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # Rate limiting ayarları
    'DEFAULT_THROTTLE_CLASSES': [
        'users.throttling.CustomUserRateThrottle',  # Özel throttling sınıfımızı kullanıyoruz
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '1000/hour',          # Kayıtlı kullanıcılar için saatte 1000 istek
        'auth': '20/minute',          # Kimlik doğrulama istekleri için dakikada 20 istek
        'sensitive': '30/minute',     # Hassas işlemler için dakikada 30 istek
    },
    'DEFAULT_RENDERER_CLASSES': (
        'users.utils.CustomJSONRenderer',
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
}
# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # Geliştirme ortamında
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js frontend
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Tüm CORS header'larını etkinleştirin
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
# Çerezleri güvenliliği düşürmeden etkinleştir
SESSION_COOKIE_SAMESITE = 'Lax'  # 'None' kullanırsanız, güvenli=True olmalı
SESSION_COOKIE_SECURE = False  # False sadece geliştirme ortamında


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js frontend
]

# Loglama ayarları
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/wisentia.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'wisentia': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# logs dizini oluşturulduğundan emin olalım
if not os.path.exists(os.path.join(BASE_DIR, 'logs')):
    os.makedirs(os.path.join(BASE_DIR, 'logs'))


OLLAMA_API_URL = config('OLLAMA_API_URL', default='http://localhost:11434/api')
LLAMA_MODEL = config('LLAMA_MODEL', default='llama3:8b')