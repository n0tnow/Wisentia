from django.urls import path
from . import views

urlpatterns = [
    path('<int:quiz_id>/', views.quiz_detail, name='quiz-detail'),
    path('<int:quiz_id>/submit/', views.submit_quiz, name='submit-quiz'),
    path('attempts/<int:attempt_id>/', views.quiz_results, name='quiz-results'),
]