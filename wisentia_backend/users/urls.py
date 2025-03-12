from django.urls import path
from . import api

urlpatterns = [
    path('', api.user_list, name='user-list'),
    path('<int:user_id>/', api.user_detail, name='user-detail'),
    path('register/', api.register_user, name='register-user'),
    path('login/', api.login_user, name='login-user'),

    #path('wallet/', api.update_wallet_address, name='update-wallet-address'),  # POST
   # path('wallet/address/', api.get_wallet_address, name='get-wallet-address'),  # GET
]