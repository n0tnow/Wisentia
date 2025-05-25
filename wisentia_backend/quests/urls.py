from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_quests_public, name='list-quests-public'),
    path('auth/', views.list_quests, name='list-quests'),
    path('<int:quest_id>/', views.quest_detail, name='quest-detail'),
    path('<int:quest_id>/update/', views.update_quest, name='update-quest'),
    path('<int:quest_id>/claim-reward/', views.claim_quest_reward, name='claim-quest-reward'),
    path('<int:quest_id>/check-progress/', views.check_quest_progress, name='check-quest-progress'),
    path('<int:quest_id>/progress/', views.track_quest_progress, name='track-quest-progress'),
    path('create/', views.create_quest, name='create-quest'),
    path('<int:quest_id>/prepare-nft/', views.prepare_quest_nft, name='prepare-quest-nft'),
]