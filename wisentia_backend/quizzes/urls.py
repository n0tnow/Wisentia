from django.urls import path
from . import views

urlpatterns = [
    path('quiz/<int:quiz_id>/', views.quiz_detail, name='quiz_detail'),
    path('submit/<int:quiz_id>/', views.submit_quiz, name='submit_quiz'),
    path('results/<int:attempt_id>/', views.quiz_results, name='quiz_results'),
    path('video/<int:video_id>/', views.video_quizzes, name='video_quizzes'),
    path('course/<int:course_id>/', views.course_quizzes, name='course_quizzes'),
]