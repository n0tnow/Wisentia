from django.urls import path
from . import api

urlpatterns = [
    path('', api.nft_list, name='nft-list'),
    path('<int:nft_id>/', api.nft_detail, name='nft-detail'),
    path('my-nfts/', api.user_nfts, name='user-nfts'),
    path('<int:nft_id>/acquire/', api.acquire_nft, name='acquire-nft'),
    path('<int:nft_id>/purchase/', api.purchase_nft, name='purchase-nft'),
]