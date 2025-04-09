from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.user_nfts, name='user-nfts'),
    path('<int:nft_id>/', views.nft_detail, name='nft-detail'),
    path('mint/<int:user_nft_id>/', views.mint_nft, name='mint-nft'),
    path('available/', views.available_nfts, name='available-nfts'),
    path('trade/', views.trade_nft, name='trade-nft'),
    path('trade/history/', views.trade_history, name='trade-history'),
    path('create/', views.create_nft, name='create-nft'),  # Yeni eklenen
]