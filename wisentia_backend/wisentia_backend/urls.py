from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Wisentia API",
      default_version='v1',
      description="Wisentia Learning Platform API",
   ),
   public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),  # users modülü mevcut
    path('api/courses/', include('courses.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('api/quests/', include('quests.urls')),
    path('api/nfts/', include('nfts.urls')),
    path('api/community/', include('community.urls')),
    path('api/ai/', include('ai.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/files/', include('files.urls')),
    path('api/search/', include('search.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)