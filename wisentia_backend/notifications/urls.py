from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_notifications, name='get-notifications'),
    path('<int:notification_id>/read/', views.mark_as_read, name='mark-notification-read'),
    path('read-all/', views.mark_as_read, name='mark-all-notifications-read'),
    path('<int:notification_id>/dismiss/', views.dismiss_notification, name='dismiss-notification'),
    path('create/', views.create_notification, name='create-notification'),
    path('send-bulk/', views.send_bulk_notification, name='send-bulk-notification'),
]