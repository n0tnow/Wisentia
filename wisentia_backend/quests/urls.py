from django.urls import path
from . import api

urlpatterns = [
    path('', api.quest_list, name='quest-list'),
    path('<int:quest_id>/', api.quest_detail, name='quest-detail'),
    path('<int:quest_id>/start/', api.start_quest, name='start-quest'),
    path('<int:quest_id>/submit/', api.submit_quest, name='submit-quest'),
]