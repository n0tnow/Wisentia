from django.urls import path
from . import api

urlpatterns = [
    path('', api.user_list, name='user-list'),
    path('<int:user_id>/', api.user_detail, name='user-detail'),
    path('register/', api.register_user, name='register-user'),
    path('login/', api.login_user, name='login-user'),
]