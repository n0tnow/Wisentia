from django.urls import path
from . import views

urlpatterns = [
    path('', views.search, name='search'),
    path('courses/', views.search_courses, name='search-courses'),
    path('quests/', views.search_quests, name='search-quests'),
    path('community/', views.search_community, name='search-community'),
    path('advanced/', views.advanced_search, name='advanced-search'),
]