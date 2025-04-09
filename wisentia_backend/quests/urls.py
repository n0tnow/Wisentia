from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_quests, name='list-quests'),
    path('<int:quest_id>/', views.quest_detail, name='quest-detail'),
    path('<int:quest_id>/claim-reward/', views.claim_quest_reward, name='claim-quest-reward'),
    path('<int:quest_id>/check-progress/', views.check_quest_progress, name='check-quest-progress'),
]