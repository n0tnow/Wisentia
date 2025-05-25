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
    path('admin/generate-complete-quest/', views.ai_generate_complete_quest, name='ai-generate-complete-quest'),
    path('admin/approve-quest/<int:content_id>/', views.approve_generated_quest, name='approve-generated-quest'),
    path('admin/quest-status/<int:content_id>/', views.get_quest_generation_status, name='get-quest-generation-status'),
    path('admin/generate-quiz/', views.ai_generate_quiz, name='ai-generate-quiz'),
    path('admin/approve-quiz/<int:content_id>/', views.approve_generated_quiz, name='approve-generated-quiz'),
    path('admin/pending-content/', views.get_pending_content, name='get-pending-content'),
    path('admin/quiz-content-detail/<int:content_id>/', views.get_quiz_content_detail, name='get-quiz-content-detail'),
    
    # New quest queue endpoints
    path('quest-queue/', views.quest_queue, name='quest-queue'),
    path('admin/quest-queue/', views.get_quest_queue, name='get-quest-queue'),
    path('admin/quest-queue/add/', views.add_to_quest_queue, name='add-to-quest-queue'),
    path('admin/quest-queue/process/', views.process_quest_queue, name='process-quest-queue'),
    path('admin/quest-status/<int:content_id>/', views.admin_get_quest_status, name='admin-get-quest-status'),

    path("analyze-video/", views.analyze_video_content, name="analyze-video"),

    # Commenting out functions that don't exist in views.py
    # path('generate-text/', views.generate_text, name='generate-text'),
    # path('generate-response/', views.generate_response_api, name='generate-response'),
    path('transcribe-audio/', views.transcribe_audio, name='transcribe-audio'),
    # path('convert-json/', views.convert_to_json, name='convert-to-json'),
]