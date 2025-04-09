from django.urls import path
from . import views

urlpatterns = [
    # Chat endpoints
    path('chat/message/', views.chat_message, name='chat-message'),
    path('chat/message/stream/', views.chat_message_stream, name='chat-message-stream'),
    path('chat/message/simple/', views.chat_message_simple, name='chat-message-simple'),
    path('chat/sessions/', views.get_chat_history, name='chat-sessions'),
    path('chat/sessions/<int:session_id>/', views.get_chat_history, name='chat-session-history'),
    path('chat/sessions/<int:session_id>/end/', views.end_chat_session, name='end-chat-session'),
    
    # Recommendation endpoints
    path('recommendations/', views.get_recommendations, name='get-recommendations'),
    path('recommendations/<int:recommendation_id>/dismiss/', views.dismiss_recommendation, name='dismiss-recommendation'),
    
    # Admin AI generation endpoints
    path('admin/generate-quest/', views.ai_generate_quest, name='ai-generate-quest'),
    path('admin/approve-quest/<int:content_id>/', views.approve_generated_quest, name='approve-generated-quest'),
    path('admin/generate-quiz/', views.ai_generate_quiz, name='ai-generate-quiz'),
    path('admin/approve-quiz/<int:content_id>/', views.approve_generated_quiz, name='approve-generated-quiz'),
    path('admin/pending-content/', views.get_pending_content, name='get-pending-content'),
]