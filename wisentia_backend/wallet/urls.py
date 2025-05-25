from django.urls import path
from . import views

urlpatterns = [
    path('connect/', views.connect_wallet, name='connect-wallet'),
    path('info/', views.get_wallet_info, name='wallet-info'),
    path('disconnect/', views.disconnect_wallet, name='disconnect-wallet'),
    path('mint-nft/', views.mint_nft, name='mint-nft'),  # Yeni endpoint
    path('purchase-subscription/', views.purchase_subscription, name='purchase-subscription'),
    path('trade-nfts-for-subscription/', views.trade_nfts_for_subscription, name='trade-nfts-for-subscription'),
    path('subscription-info/', views.subscription_info, name='subscription-info'),
]