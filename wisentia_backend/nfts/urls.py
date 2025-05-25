from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.user_nfts, name='user-nfts'),
    path('<int:nft_id>/', views.nft_detail, name='nft-detail'),
    path('<int:nft_id>/metadata/', views.nft_metadata, name='nft-metadata'),
    path('mint/<int:user_nft_id>/', views.mint_nft, name='mint-nft'),
    path('available/', views.available_nfts, name='available-nfts'),
    path('trade/', views.trade_nft, name='trade-nft'),
    path('trade/history/', views.trade_history, name='trade-history'),
    path('create/', views.create_nft, name='create-nft'),  # Yeni eklenen
    path('purchase/', views.purchase_nft, name='purchase-nft'),  # NFT satın alma işlemi için
    path('purchase/confirm/', views.confirm_purchase, name='confirm-purchase'),
    path('purchase/cancel/', views.cancel_purchase, name='cancel-purchase'),
    path('admin/fix-subscription-plans/', views.fix_subscription_plans, name='fix-subscription-plans'),  # Abonelik planlarını düzeltme endpointi
]