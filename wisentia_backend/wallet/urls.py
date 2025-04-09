from django.urls import path
from . import views

urlpatterns = [
    path('connect/', views.connect_wallet, name='connect-wallet'),
    path('info/', views.get_wallet_info, name='wallet-info'),
    path('disconnect/', views.disconnect_wallet, name='disconnect-wallet'),
    path('mint-nft/', views.mint_nft, name='mint-nft'),  # Yeni endpoint
]