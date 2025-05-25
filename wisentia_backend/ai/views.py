from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import StreamingHttpResponse, JsonResponse
import json
import requests
from .llm import generate_response, generate_quest, generate_quiz, generate_quiz_with_anthropic, generate_with_anthropic, call_llm
import logging
import re
from .transcriber import download_audio, transcribe_audio
import os
from django.conf import settings
logger = logging.getLogger(__name__)
OLLAMA_API_URL = settings.OLLAMA_API_URL
LLAMA_MODEL = settings.LLAMA_MODEL
from django.db import connection, transaction
import threading
import time
import traceback  # Add missing traceback module import
from datetime import datetime, timedelta
from decimal import Decimal
import random

# JSON encoder to handle datetime objects
def datetime_handler(obj):
    if isinstance(obj, (datetime, timedelta)):
        return obj.isoformat()
    elif isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_message(request):
    """AI chat API endpoint with basic session handling"""
    # Kimlik doğrulaması yapılmış kullanıcı ID'si
    user_id = request.user.id
    
    # Kullanıcı ID'sinin doğru olduğundan emin ol
    if not user_id or not isinstance(user_id, int):
        return Response({
            'error': 'Invalid user ID',
            'success': False
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Önce kullanıcının gerçekten veritabanında var olduğunu kontrol et
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(1) FROM Users WHERE UserID = %s", [user_id])
            user_exists = cursor.fetchone()[0] > 0
            
            if not user_exists:
                logger.error(f"User ID {user_id} does not exist in database")
                return Response({
                    'error': 'User not found in database',
                    'success': False
                }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error checking user existence: {str(e)}", exc_info=True)
        return Response({
            'error': 'Failed to verify user',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    message = request.data.get('message')
    session_id = request.data.get('sessionId')
    
    logger.info(f"Received chat message from user {user_id}: {message[:50] if message else 'None'}... Session ID: {session_id}")
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validate session ID format
        if session_id and not isinstance(session_id, int):
            try:
                session_id = int(session_id)
                logger.info(f"Converted session ID to int: {session_id}")
            except (ValueError, TypeError):
                logger.warning(f"Invalid session ID format: {session_id}, creating new session")
                session_id = None
        
        # Session Management - En basit ve güvenilir yöntem
        if not session_id:
            # Yeni session oluştur - IDENTITY sütununa değer belirtmeden
            logger.info(f"Creating new session for user {user_id}")
            try:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO ChatSessions
                        (UserID, StartTime, IsActive)
                        VALUES (%s, GETDATE(), 1)
                    """, [user_id])
                    
                    # Oluşturulan session ID'yi almak için SQL Server OUTPUT kullan
                    cursor.execute("""
                        SELECT TOP 1 SessionID FROM ChatSessions 
                        WHERE UserID = %s AND IsActive = 1
                        ORDER BY StartTime DESC
                    """, [user_id])
                    
                    result = cursor.fetchone()
                    if not result or result[0] is None:
                        logger.error("Failed to get newly created session ID")
                        return Response({
                            'error': 'Failed to create chat session',
                            'success': False
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
                    session_id = result[0]
                    logger.info(f"Successfully created new session with ID: {session_id}")
            except Exception as e:
                logger.error(f"Error creating new session: {str(e)}", exc_info=True)
                return Response({
                    'error': 'Failed to create chat session',
                    'success': False
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Check if session exists and belongs to current user
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(1)
                    FROM ChatSessions
                    WHERE SessionID = %s AND UserID = %s AND IsActive = 1
                """, [session_id, user_id])
                
                exists = cursor.fetchone()[0] > 0
                
                if not exists:
                    # Session mevcut değil veya bu kullanıcıya ait değil, yeni oluştur
                    logger.info(f"Session {session_id} not found for user {user_id}, creating new one")
                    try:
                        cursor.execute("""
                            INSERT INTO ChatSessions
                            (UserID, StartTime, IsActive)
                            VALUES (%s, GETDATE(), 1)
                        """, [user_id])
                        
                        cursor.execute("""
                            SELECT TOP 1 SessionID FROM ChatSessions 
                            WHERE UserID = %s AND IsActive = 1
                            ORDER BY StartTime DESC
                        """, [user_id])
                        
                        result = cursor.fetchone()
                        if not result or result[0] is None:
                            logger.error("Failed to get newly created session ID")
                            return Response({
                                'error': 'Failed to create chat session',
                                'success': False
                            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
                        session_id = result[0]
                        logger.info(f"Successfully created new session with ID: {session_id}")
                    except Exception as e:
                        logger.error(f"Error creating new session: {str(e)}", exc_info=True)
                        return Response({
                            'error': 'Failed to create chat session',
                            'success': False
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Store user message - session artık var, mesajı ekleyebiliriz
        try:
            with connection.cursor() as cursor:
                logger.info(f"Saving user message to session {session_id}")
                cursor.execute("""
                    INSERT INTO ChatMessages
                    (SessionID, SenderType, MessageContent, Timestamp)
                    VALUES (%s, 'user', %s, GETDATE())
                """, [session_id, message])
        except Exception as e:
            logger.error(f"Error saving user message: {str(e)}", exc_info=True)
            return Response({
                'error': f'Failed to save user message: {str(e)}',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Generate AI response
        system_prompt = "You are Wisentia AI, an educational assistant. Help users with their educational questions and guide them through their learning journey."
        logger.info(f"Generating response with LLM for session {session_id}")
        result = generate_response(message, system_prompt)
        
        if result['success']:
            ai_response = result['response']
            logger.info(f"LLM response generated successfully for session {session_id}")
            
            # Save AI response
            try:
                with connection.cursor() as cursor:
                    logger.info(f"Saving AI response to session {session_id}")
                    cursor.execute("""
                        INSERT INTO ChatMessages
                        (SessionID, SenderType, MessageContent, Timestamp)
                        VALUES (%s, 'ai', %s, GETDATE())
                    """, [session_id, ai_response])
            except Exception as e:
                logger.error(f"Error saving AI response: {str(e)}", exc_info=True)
                # Continue even if we fail to save the AI response
            
            return Response({
                'message': ai_response,
                'sessionId': session_id,
                'success': True
            })
        else:
            logger.error(f"LLM generation failed: {result.get('error', 'Unknown error')}")
            return Response({
                'error': result.get('error', 'Unknown error'),
                'message': "I'm sorry, I'm currently having trouble processing your request.",
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        logger.error(f"Error in chat_message: {str(e)}\n{traceback.format_exc()}")
        return Response({
            'error': f'Unexpected error: {str(e)}',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def chat_message_stream(request):
    """AI chat API endpoint with streaming responses"""
    user_id = request.user.id
    message = request.data.get('message')
    session_id = request.data.get('sessionId')
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Session operations
    try:
        with connection.cursor() as cursor:
            # Session check/creation
            if not session_id:
                # Create new session
                cursor.execute("""
                    INSERT INTO ChatSessions
                    (UserID, StartTime, IsActive)
                    VALUES (%s, GETDATE(), 1)
                """, [user_id])
                
                # Get session ID separately
                cursor.execute("SELECT SCOPE_IDENTITY()")
                session_id = cursor.fetchone()[0]
            else:
                # Check existing session
                cursor.execute("""
                    SELECT SessionID
                    FROM ChatSessions
                    WHERE SessionID = %s AND UserID = %s AND IsActive = 1
                """, [session_id, user_id])
                
                if not cursor.fetchone():
                    # Session not found or not active, create new
                    cursor.execute("""
                        INSERT INTO ChatSessions
                        (UserID, StartTime, IsActive)
                        VALUES (%s, GETDATE(), 1)
                    """, [user_id])
                    
                    # Get session ID separately
                    cursor.execute("SELECT SCOPE_IDENTITY()")
                    session_id = cursor.fetchone()[0]
            
            # Save user message
            cursor.execute("""
                INSERT INTO ChatMessages
                (SessionID, SenderType, MessageContent, Timestamp)
                VALUES (%s, 'user', %s, GETDATE())
            """, [session_id, message])
        
        # Create special system prompt
        system_prompt = "You are Wisentia AI, an educational assistant. Help users with their educational questions and guide them through their learning journey."
        
        # Create streaming response
        def stream_response():
            full_response = ""
            
            # Use streaming function from llm.py
            stream_generator = generate_response(message, system_prompt, stream=True)
            
            for chunk in stream_generator:
                full_response += chunk
                yield f"data: {json.dumps({'chunk': chunk, 'sessionId': session_id})}\n\n"
            
            # Save complete response to database
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ChatMessages
                    (SessionID, SenderType, MessageContent, Timestamp)
                    VALUES (%s, 'ai', %s, GETDATE())
                """, [session_id, full_response])
            
            yield f"data: {json.dumps({'done': True, 'sessionId': session_id})}\n\n"
        
        return StreamingHttpResponse(
            streaming_content=stream_response(),
            content_type='text/event-stream'
        )
    except Exception as e:
        import traceback
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def chat_message_simple(request):
    """Simplified AI chat API endpoint for testing"""
    message = request.data.get('message')
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create special system prompt
        system_prompt = "You are Wisentia AI, an educational assistant. Help users with their educational questions and guide them through their learning journey."
        
        # Use function from llm.py
        result = generate_response(message, system_prompt)
        
        if result['success']:
            return Response({
                'message': result['response'],
                'success': True
            })
        else:
            return Response({
                'error': result.get('error', 'Unknown error'),
                'message': "I'm sorry, I'm currently having trouble processing your request.",
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_chat_history(request, session_id=None):
    """API endpoint to retrieve user's chat history"""
    # Anonymous kullanıcılar için varsayılan ID
    user_id = request.user.id if request.user.is_authenticated else 1
    
    logger.info(f"Get chat history - Session: {session_id}, User: {user_id}")
    
    with connection.cursor() as cursor:
        if session_id:
            # Get messages from a specific session
            cursor.execute("""
                SELECT cs.SessionID
                FROM ChatSessions cs
                WHERE cs.SessionID = %s AND cs.UserID = %s
            """, [session_id, user_id])
            
            if not cursor.fetchone():
                logger.warning(f"Session {session_id} not found for user {user_id}")
                return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
            
            cursor.execute("""
                SELECT cm.MessageID, cm.SenderType, cm.MessageContent as content, cm.Timestamp
                FROM ChatMessages cm
                WHERE cm.SessionID = %s
                ORDER BY cm.Timestamp
            """, [session_id])
            
            columns = [col[0] for col in cursor.description]
            messages = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Frontend'in beklediği isimlerle uyumlu hale getir
            for msg in messages:
                msg['senderType'] = msg.pop('SenderType')
                msg['messageId'] = msg.pop('MessageID')
                msg['timestamp'] = msg.pop('Timestamp').isoformat() if msg.get('Timestamp') else None
            
            logger.info(f"Found {len(messages)} messages for session {session_id}")
            
            return Response({
                'sessionId': session_id,
                'messages': messages
            })
        else:
            # Get all sessions
            cursor.execute("""
                SELECT cs.SessionID, cs.StartTime, cs.EndTime, cs.IsActive,
                       (SELECT TOP 1 cm.MessageContent 
                        FROM ChatMessages cm 
                        WHERE cm.SessionID = cs.SessionID 
                        ORDER BY cm.Timestamp DESC) as LastMessage,
                       (SELECT COUNT(*) 
                        FROM ChatMessages cm 
                        WHERE cm.SessionID = cs.SessionID) as MessageCount
                FROM ChatSessions cs
                WHERE cs.UserID = %s
                ORDER BY cs.StartTime DESC
            """, [user_id])
            
            columns = [col[0] for col in cursor.description]
            sessions = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Tarih alanlarını ISO formatına çevir
            for session in sessions:
                if 'StartTime' in session and session['StartTime']:
                    session['StartTime'] = session['StartTime'].isoformat()
                if 'EndTime' in session and session['EndTime']:
                    session['EndTime'] = session['EndTime'].isoformat()
            
            logger.info(f"Found {len(sessions)} sessions for user {user_id}")
            
            return Response(sessions)

@api_view(['POST'])
@permission_classes([AllowAny])
def end_chat_session(request, session_id):
    """API endpoint to end a chat session"""
    # Anonymous kullanıcılar için varsayılan ID
    user_id = request.user.id if request.user.is_authenticated else 1
    
    logger.info(f"End chat session request - Session: {session_id}, User: {user_id}")
    
    with connection.cursor() as cursor:
        # Check session
        cursor.execute("""
            SELECT SessionID
            FROM ChatSessions
            WHERE SessionID = %s AND UserID = %s AND IsActive = 1
        """, [session_id, user_id])
        
        if not cursor.fetchone():
            logger.warning(f"Session {session_id} not found or already ended for user {user_id}")
            return Response({'error': 'Session not found or already ended'}, status=status.HTTP_404_NOT_FOUND)
        
        # End session
        logger.info(f"Ending session {session_id}")
        cursor.execute("""
            UPDATE ChatSessions
            SET EndTime = GETDATE(), IsActive = 0
            WHERE SessionID = %s
        """, [session_id])
    
    return Response({'message': 'Chat session ended successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_recommendations(request):
    """API endpoint providing recommendations for the user"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Get existing recommendations
        cursor.execute("""
            SELECT r.RecommendationID, r.RecommendationType, r.TargetID,
                   r.RecommendationReason, r.CreationDate, r.IsViewed
            FROM AIRecommendations r
            WHERE r.UserID = %s AND r.IsDismissed = 0
            ORDER BY r.CreationDate DESC
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        recommendations = []
        
        for row in cursor.fetchall():
            recommendation = dict(zip(columns, row))
            rec_type = recommendation['RecommendationType']
            target_id = recommendation['TargetID']
            
            # Add target information based on recommendation type
            if rec_type == 'course':
                cursor.execute("""
                    SELECT Title, Category, Difficulty, ThumbnailURL
                    FROM Courses
                    WHERE CourseID = %s
                """, [target_id])
                
                target_data = cursor.fetchone()
                if target_data:
                    recommendation['target'] = {
                        'title': target_data[0],
                        'category': target_data[1],
                        'difficulty': target_data[2],
                        'thumbnailURL': target_data[3]
                    }
            
            elif rec_type == 'quest':
                cursor.execute("""
                    SELECT Title, Description, DifficultyLevel
                    FROM Quests
                    WHERE QuestID = %s
                """, [target_id])
                
                target_data = cursor.fetchone()
                if target_data:
                    recommendation['target'] = {
                        'title': target_data[0],
                        'description': target_data[1],
                        'difficultyLevel': target_data[2]
                    }
            
            elif rec_type == 'community':
                cursor.execute("""
                    SELECT Title, Category
                    FROM CommunityPosts
                    WHERE PostID = %s
                """, [target_id])
                
                target_data = cursor.fetchone()
                if target_data:
                    recommendation['target'] = {
                        'title': target_data[0],
                        'category': target_data[1]
                    }
            
            recommendations.append(recommendation)
    
    return Response(recommendations)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dismiss_recommendation(request, recommendation_id):
    """API endpoint to dismiss a recommendation"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Check recommendation
        cursor.execute("""
            SELECT RecommendationID
            FROM AIRecommendations
            WHERE RecommendationID = %s AND UserID = %s
        """, [recommendation_id, user_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Dismiss recommendation
        cursor.execute("""
            UPDATE AIRecommendations
            SET IsDismissed = 1
            WHERE RecommendationID = %s
        """, [recommendation_id])
    
    return Response({'message': 'Recommendation dismissed successfully'})

# Admin AI generation functions

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_quest(request):
    """API endpoint to generate quests with AI (admin only)"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can generate quests'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Get parameters
    difficulty = request.data.get('difficulty', 'intermediate')
    category = request.data.get('category', 'General Learning')
    points_required = request.data.get('pointsRequired', 100)
    points_reward = request.data.get('pointsReward')
    
    # Generate quest with AI
    result = generate_quest(difficulty, category, points_required, points_reward)
    
    if not result['success']:
        return Response({
            'error': result.get('error', 'Failed to generate quest'),
            'raw_response': result.get('raw_response', '')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    quest_data = result['data']
    
    # Save AI-generated content
    with connection.cursor() as cursor:
        # First, execute INSERT
        cursor.execute("""
            INSERT INTO AIGeneratedContent
            (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
            VALUES ('quest', %s, %s, GETDATE(), 'pending')
        """, [
            json.dumps(quest_data),
            json.dumps({
                'difficulty': difficulty,
                'category': category,
                'points_required': points_required,
                'points_reward': points_reward
            })
        ])
        
        # Then, get the ID in a separate query
        cursor.execute("SELECT SCOPE_IDENTITY()")
        content_id = cursor.fetchone()[0]
    
    return Response({
        'message': 'Quest generated successfully',
        'contentId': content_id,
        'quest': quest_data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_generated_quest(request, content_id):
    """API endpoint to approve AI-generated quests (admin only)"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can approve quests'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Get generated content
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT ContentID, Content, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentID = %s
        """, [content_id])
        
        row = cursor.fetchone()
        if not row:
            return Response({'error': 'Generated content not found'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        if row[2] != 'completed':
            return Response({
                'error': 'Cannot approve content with status: ' + row[2],
                'status': row[2]
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            content_json = row[1]
            
            # Skip if already approved
            if row[2] == 'approved':
                return Response({'message': 'Content already approved'})
        except Exception as e:
            return Response({'error': f'Error retrieving content: {str(e)}'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        try:
            quest_data = json.loads(content_json)
            
            # Extract NFT recommendation if available
            nft_recommendation = quest_data.get('nftRecommendation')
            created_nft_id = None
            
            # Create NFT if recommendation exists
            if nft_recommendation:
                # Create a new NFT based on recommendation
                nft_title = nft_recommendation.get('title', f"Quest Reward: {quest_data.get('title', 'Unnamed Quest')}")
                nft_description = nft_recommendation.get('description', 'A reward for completing a quest')
                nft_rarity = nft_recommendation.get('rarity', 'Common')
                nft_type_id = nft_recommendation.get('nftTypeId', 1)  # Default to type ID 1 if not specified
                trade_value = nft_recommendation.get('tradeValue', 10)
                
                # Create NFT record
                cursor.execute("""
                    INSERT INTO NFTs 
                    (NFTTypeID, Title, Description, TradeValue, Rarity, IsActive)
                    VALUES (%s, %s, %s, %s, %s, 1)
                """, [
                    nft_type_id,
                    nft_title,
                    nft_description,
                    trade_value,
                    nft_rarity
                ])
                
                # Get the new NFT ID
                cursor.execute("SELECT SCOPE_IDENTITY()")
                created_nft_id = cursor.fetchone()[0]
                
                # Update quest_data with created NFT info
                quest_data['createdNftId'] = created_nft_id
                quest_data['nftRecommendation']['status'] = 'created'
            
            # Create quest
            title = quest_data.get('title')
            description = quest_data.get('description')
            reward_points = quest_data.get('rewardPoints', 50)
            required_points = quest_data.get('requiredPoints', 0)
            difficulty_level = quest_data.get('difficultyLevel', 'intermediate')
            
            # First, execute INSERT
            cursor.execute("""
                INSERT INTO Quests
                (Title, Description, RequiredPoints, RewardPoints, DifficultyLevel, 
                 RewardNFTID, IsActive, IsAIGenerated, CreationDate)
                VALUES (%s, %s, %s, %s, %s, %s, 1, 1, GETDATE())
            """, [
                title, description, required_points, reward_points, difficulty_level, created_nft_id
            ])
            
            # Then, get the ID in a separate query
            cursor.execute("SELECT SCOPE_IDENTITY()")
            quest_id = cursor.fetchone()[0]
            
            # Add quest conditions
            conditions = quest_data.get('conditions', [])
            for condition in conditions:
                # Map AI condition fields to database fields
                condition_type = condition.get('type', 'generic')
                target_id = condition.get('targetId')
                target_value = condition.get('targetValue', 1)
                condition_description = condition.get('description', '')
                
                cursor.execute("""
                    INSERT INTO QuestConditions
                    (QuestID, ConditionType, TargetID, TargetValue, Description)
                    VALUES (%s, %s, %s, %s, %s)
                """, [
                    quest_id, condition_type, target_id, target_value, condition_description
                ])
            
            # Update approval status of the generated content
            cursor.execute("""
                UPDATE AIGeneratedContent
                SET Content = %s, ApprovalStatus = 'approved', ApprovalDate = GETDATE(), ApprovedBy = %s
                WHERE ContentID = %s
            """, [
                json.dumps({
                    **quest_data, 
                    'questId': quest_id,
                    'createdNftId': created_nft_id
                }),
                user_id,
                content_id
            ])
            
            return Response({
                'message': 'Quest approved and created successfully',
                'questId': quest_id,
                'nftId': created_nft_id
            })
            
        except Exception as e:
            logger.error(f"Error approving quest: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({'error': f'Error approving quest: {str(e)}'}, 
                           status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def clean_json_string(json_str):
    """JSON string'ini temizler ve parse edilebilir hale getirir"""
    # Önce BOM karakterini temizle
    json_str = json_str.replace('\ufeff', '')
    
    # Eksik virgülleri düzelt (kapalı kıvrık parantezden önce virgül olmalı)
    json_str = re.sub(r'}\s*\n\s*{', '},\n{', json_str)
    json_str = re.sub(r']\s*\n\s*]', ']\n]', json_str)
    
    # Fazla virgülleri temizle
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    
    # Eksik tırnak işaretlerini düzelt
    json_str = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_str)
    
    return json_str

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_quiz(request):
    """AI tabanlı quiz üretimi (admin only)"""
    user_id = request.user.id

    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])

        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can generate quizzes'}, 
                           status=status.HTTP_403_FORBIDDEN)

    # Parametreleri al
    source_type = request.data.get('source', 'youtube')
    model_type = request.data.get('model', 'llama')  # 'llama' or 'anthropic'
    
    if source_type == 'youtube':
        # YouTube video için quiz oluştur
        video_id = request.data.get('videoId')
        video_title = request.data.get('videoTitle')
        video_url = request.data.get('videoUrl')

        if not video_id or not video_title or not video_url:
            return Response({
                'error': 'Video ID, title and URL are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return generate_quiz_for_youtube_video(request, video_id, video_title, video_url, model_type)
    
    elif source_type == 'course':
        # Kurs videoları için quiz oluştur
        course_id = request.data.get('courseId')
        course_name = request.data.get('courseName')
        selected_videos = request.data.get('selectedVideos', [])
        
        if not course_id or not course_name or not selected_videos:
            return Response({
                'error': 'Course ID, name and selected videos are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return generate_quiz_for_course_videos(request, course_id, course_name, selected_videos, model_type)
    
    else:
        return Response({
            'error': 'Invalid source type. Use "youtube" or "course".'
        }, status=status.HTTP_400_BAD_REQUEST)

def generate_quiz_for_youtube_video(request, video_id, video_title, video_url, model_type):
    """YouTube videosu için quiz oluştur"""
    num_questions = request.data.get('numQuestions', 5)
    difficulty = request.data.get('difficulty', 'intermediate')
    language = request.data.get('language', 'en')
    target_audience = request.data.get('targetAudience', 'general')
    instructional_approach = request.data.get('instructionalApproach', 'conceptual')
    passing_score = request.data.get('passingScore', 70)

    try:
        logger.info(f"[AI] Video indiriliyor: {video_url}")
        audio_path = download_audio(video_url)

        logger.info(f"[AI] Transkript başlatılıyor: {audio_path}")
        transcript = transcribe_audio(audio_path)

        if os.path.exists(audio_path):
            os.remove(audio_path)
            logger.info(f"[AI] Geçici ses dosyası silindi: {audio_path}")

    except Exception as e:
        logger.error(f"[AI] Transkript oluşturulamadı: {str(e)}")
        return Response({
            'error': f'Video transcript işlemi başarısız: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Model tipi kontrolü
    if model_type == 'anthropic':
        # Claude API ile devam et
        try:
            logger.info(f"[AI] Claude API ile quiz oluşturuluyor...")
            
            # Claude API için analiz ve quiz üretimi tek adımda
            result = generate_quiz_with_anthropic(
                video_id, 
                video_title, 
                transcript, 
                num_questions, 
                difficulty,
                passing_score,
                language,
                target_audience,
                instructional_approach
            )
            
            # Maliyet bilgisini ekle
            cost_info = result.get('cost', {})
            logger.info(f"[AI] Claude API tahmini maliyet: ${cost_info.get('total_cost', 0):.6f}")
            
        except Exception as e:
            logger.exception("[AI] Claude ile quiz oluşturulurken hata:")
            return Response({
                'error': f'Quiz oluşturulamadı: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        # Varsayılan Llama modeli ile devam et
        try:
            logger.info(f"[AI] LLM analiz promptu hazırlanıyor...")
            analysis_prompt = f"""
            Analyze the following transcript of an educational video and summarize the key learning concepts covered:

            Transcript:
            {transcript[:2000]}

            Provide a detailed description in 5-6 sentences that can be used as the basis for generating quiz questions.
            """

            logger.info(f"[AI] Prompt uzunluğu: {len(analysis_prompt)} karakter")
            logger.info(f"[AI] LLM API isteği gönderiliyor: {OLLAMA_API_URL} - Model: {LLAMA_MODEL}")

            analysis_response = requests.post(f"{OLLAMA_API_URL}/generate", json={
                'model': LLAMA_MODEL,
                'prompt': analysis_prompt,
                'stream': False,
                'temperature': 0.5,
                'max_tokens': 1024
            }, timeout=1200)

            logger.info(f"[AI] LLM API yanıt kodu: {analysis_response.status_code}")

            if analysis_response.status_code != 200:
                raise Exception(f"LLM analysis failed with status {analysis_response.status_code} - response: {analysis_response.text[:300]}")

            video_content = analysis_response.json().get('response', '').strip()

            result = generate_quiz(
                video_id, 
                video_title, 
                video_content, 
                num_questions, 
                difficulty,
                passing_score,
                language,
                target_audience,
                instructional_approach
            )

        except Exception as e:
            logger.exception("[AI] Quiz oluşturulurken analiz hatası:")
            return Response({
                'error': f'Quiz oluşturulamadı: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Quiz API çıktısını kontrol et
    if not result['success']:
        return Response({
            'error': result.get('error', 'Failed to generate quiz'),
            'raw_response': result.get('raw_response', '')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Handle different response formats - data field or direct structure
    quiz_data = None
    if 'data' in result:
        quiz_data = result['data']
    elif 'quiz' in result:
        quiz_data = result['quiz']
    else:
        # Look for object that contains questions
        for key, value in result.items():
            if isinstance(value, dict) and 'questions' in value:
                quiz_data = value
                logger.info(f"[AI] Found quiz data in unexpected key: {key}")
                break
    
    # Log the structure we received
    logger.info(f"[AI] Result keys: {list(result.keys())}")
    logger.info(f"[AI] Quiz data exists: {quiz_data is not None}")
    
    # Ensure we have valid quiz data
    if not quiz_data:
        logger.error(f"[AI] Missing quiz data in result: {json.dumps(result, default=str)[:500]}")
        return Response({
            'error': 'Invalid quiz data returned from generator',
            'details': f"No valid quiz data found. Result keys: {list(result.keys())}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # JSON doğrulama
    if isinstance(quiz_data, str):
        try:
            cleaned_json = clean_json_string(quiz_data)
            quiz_data = json.loads(cleaned_json)
        except json.JSONDecodeError as e:
            logger.error(f"JSON ayrıştırma hatası: {e}, yanıt: {quiz_data[:2000]}")
            return Response({
                'error': f'Oluşturulan quiz JSON formatında değil: {str(e)}',
                'raw_response': quiz_data[:2000]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        # Metadata bilgisine YouTube video bilgisini ekle
        metadata = {
            'source': 'youtube',
            'video_id': video_id,
            'video_title': video_title,
            'num_questions': num_questions,
            'difficulty': difficulty,
            'model': model_type
        }
        
        # Maliyet bilgisi varsa ekle
        if 'cost' in result:
            metadata['cost'] = result['cost']
        
        content_id = None
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO AIGeneratedContent
                (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
                VALUES ('quiz', %s, %s, GETDATE(), 'pending')
            """, [
                json.dumps(quiz_data),
                json.dumps(metadata)
            ])

            # SCOPE_IDENTITY'yi aynı cursor ile hemen alın
            cursor.execute("SELECT SCOPE_IDENTITY()")
            content_id = cursor.fetchone()[0]

    except Exception as e:
        logger.error(f"Veritabanı hatası: {e}")
        return Response({
            'error': 'Veritabanına kaydedilemedi',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # content_id tanımlı mı kontrol et
    if content_id is None:
        return Response({
            'error': 'Quiz oluşturuldu fakat ID alınamadı',
            'details': 'Database did not return an ID'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        'message': 'Quiz generated successfully',
        'contentId': content_id,
        'quiz': quiz_data,
        'model': model_type,
        'cost': result.get('cost', {})
    })

def generate_quiz_for_course_videos(request, course_id, course_name, selected_videos, model_type):
    """Kurs videoları için quiz oluştur"""
    num_questions = request.data.get('numQuestions', 5)
    difficulty = request.data.get('difficulty', 'intermediate')
    language = request.data.get('language', 'en')
    target_audience = request.data.get('targetAudience', 'general')
    instructional_approach = request.data.get('instructionalApproach', 'conceptual')
    passing_score = request.data.get('passingScore', 70)
    
    # Video sayısına göre soru sayısını belirle
    # Her video için en az 1 soru olacak şekilde ayarla
    video_count = len(selected_videos)
    if video_count > num_questions:
        logger.info(f"[AI] Video sayısı ({video_count}) soru sayısından ({num_questions}) fazla. Her video için en az 1 soru oluşturulacak.")
        num_questions = video_count
    
    try:
        # Tüm videoları işle
        all_transcripts = []
        video_details = []
        
        for i, video in enumerate(selected_videos):
            video_id = video.get('VideoID')
            video_title = video.get('Title')
            youtube_id = video.get('YouTubeVideoID')
            
            if not youtube_id:
                logger.warning(f"[AI] Video {i+1}/{video_count} için YouTube ID bulunamadı: {video_id}")
                continue
            
            video_url = f"https://www.youtube.com/watch?v={youtube_id}"
            video_details.append({
                'video_id': video_id,
                'video_title': video_title,
                'youtube_id': youtube_id
            })
            
            try:
                # Video indirme
                logger.info(f"[AI] Video {i+1}/{video_count} indiriliyor: {video_url}")
                audio_path = download_audio(video_url)
                
                # Transkript
                logger.info(f"[AI] Video {i+1}/{video_count} transkript ediliyor")
                transcript = transcribe_audio(audio_path)
                
                all_transcripts.append({
                    'video_id': video_id,
                    'title': video_title,
                    'transcript': transcript
                })
                
                # Geçici dosyayı sil
                if os.path.exists(audio_path):
                    os.remove(audio_path)
                    logger.info(f"[AI] Geçici ses dosyası silindi: {audio_path}")
                
            except Exception as e:
                logger.error(f"[AI] Video {i+1}/{video_count} işlenirken hata: {str(e)}")
                # Devam et, tek bir video hatası tüm işlemi kesmesin
        
        if not all_transcripts:
            return Response({
                'error': 'Hiçbir video başarıyla işlenemedi'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Tüm transkriptleri birleştir
        combined_content = "\n\n".join([
            f"Video: {t['title']}\nTranscript: {t['transcript'][:3000]}" 
            for t in all_transcripts
        ])
        
        # Model tipi kontrolü
        if model_type == 'anthropic':
            # Claude API ile devam et
            try:
                logger.info(f"[AI] Claude API ile kurs quizi oluşturuluyor...")
                
                # Claude API için analiz ve quiz üretimi tek adımda
                result = generate_quiz_with_anthropic(
                    course_id, 
                    course_name, 
                    combined_content, 
                    num_questions, 
                    difficulty,
                    passing_score,
                    language,
                    target_audience,
                    instructional_approach
                )
                
                # Maliyet bilgisini ekle
                cost_info = result.get('cost', {})
                logger.info(f"[AI] Claude API tahmini maliyet: ${cost_info.get('total_cost', 0):.6f}")
                
            except Exception as e:
                logger.exception("[AI] Claude ile kurs quizi oluşturulurken hata:")
                return Response({
                    'error': f'Quiz oluşturulamadı: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Varsayılan Llama modeli ile devam et
            try:
                # LLM ile transkriptleri özetle
                logger.info(f"[AI] LLM prompt hazırlanıyor (analiz aşaması)")
                
                # Kurs içeriğini özetleyecek LLM promptu
                analysis_prompt = f"""
                Aşağıdaki eğitim videoları transkriptlerini analiz et ve temel öğrenme kavramlarını özetle:

                {combined_content[:4000]}

                Bu videolarda anlatılan temel kavramları ve öğrenme hedeflerini belirle. 
                Cevabında 10-15 cümlelik detaylı bir özet oluştur.
                """
                
                analysis_response = requests.post(f"{OLLAMA_API_URL}/generate", json={
                    'model': LLAMA_MODEL,
                    'prompt': analysis_prompt,
                    'stream': False,
                    'temperature': 0.5,
                    'max_tokens': 1024
                }, timeout=1200)
                
                if analysis_response.status_code != 200:
                    raise Exception(f"LLM analysis failed with status {analysis_response.status_code}")
                
                analysis_content = analysis_response.json().get('response', '').strip()
                
                # LLM ile quiz oluştur
                logger.info(f"[AI] LLM ile quiz oluşturuluyor")
                result = generate_quiz(
                    course_id, 
                    course_name, 
                    analysis_content, 
                    num_questions, 
                    difficulty,
                    passing_score,
                    language,
                    target_audience,
                    instructional_approach
                )
                
            except Exception as e:
                logger.exception("[AI] Kurs quizi oluşturulurken analiz hatası:")
                return Response({
                    'error': f'Quiz oluşturulamadı: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Quiz API çıktısını kontrol et
        if not result['success']:
            return Response({
                'error': result.get('error', 'Failed to generate quiz'),
                'raw_response': result.get('raw_response', '')
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Quiz verilerini al - Handle both data structures
        quiz_data = None
        if 'data' in result:
            quiz_data = result['data']
        elif 'quiz' in result:
            quiz_data = result['quiz']
        else:
            # Look for object that contains questions
            for key, value in result.items():
                if isinstance(value, dict) and 'questions' in value:
                    quiz_data = value
                    logger.info(f"[AI] Found quiz data in unexpected key: {key}")
                    break
        
        # Log the structure we received for debugging
        logger.info(f"[AI] Result keys: {list(result.keys())}")
        logger.info(f"[AI] Quiz data exists: {quiz_data is not None}")
        if quiz_data:
            logger.info(f"[AI] Quiz data keys: {list(quiz_data.keys()) if isinstance(quiz_data, dict) else 'Not a dict'}")
            
        # Quiz verilerini kontrol et
        if not quiz_data or not isinstance(quiz_data, dict):
            logger.error(f"[AI] Geçersiz quiz verisi: {quiz_data}")
            logger.error(f"[AI] Tam sonuç: {json.dumps(result, default=str)[:500]}")
            return Response({
                'error': 'Invalid quiz data returned from generator',
                'details': f"Expected dict, got {type(quiz_data).__name__}. Result keys: {list(result.keys())}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Metadata bilgisine YouTube video bilgisini ekle
            metadata = {
                'source': 'course',
                'course_id': course_id,
                'course_name': course_name,
                'videos': video_details,
                'num_questions': num_questions,
                'difficulty': difficulty,
                'model': model_type
            }
            
            # Maliyet bilgisi varsa ekle
            if 'cost' in result:
                metadata['cost'] = result['cost']
            
            # Veritabanına kaydet
            content_id = None
            
            # Veritabanı işlemi için yeni bir transaction ve cursor başlat
            with transaction.atomic():
                with connection.cursor() as cursor:
                    try:
                        cursor.execute("""
                            INSERT INTO AIGeneratedContent
                            (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
                            VALUES ('quiz', %s, %s, GETDATE(), 'pending')
                        """, [
                            json.dumps(quiz_data),
                            json.dumps(metadata)
                        ])
                        
                        # Aynı cursor'da ID'yi hemen sorgula
                        cursor.execute("SELECT SCOPE_IDENTITY()")
                        result_row = cursor.fetchone()
                        
                        if not result_row or result_row[0] is None:
                            logger.error("[AI] SCOPE_IDENTITY() null döndü, son INSERT ID'si alınamadı")
                            # Son eklenen kaydı bulmak için alternatif yöntem
                            cursor.execute("""
                                SELECT TOP 1 ContentID FROM AIGeneratedContent 
                                WHERE ContentType = 'quiz' AND ApprovalStatus = 'pending'
                                ORDER BY CreationDate DESC
                            """)
                            alt_result = cursor.fetchone()
                            
                            if alt_result and alt_result[0]:
                                content_id = alt_result[0]
                                logger.info(f"[AI] Alternatif ID bulma yöntemi başarılı: {content_id}")
                            else:
                                raise Exception("Failed to retrieve content ID with both methods")
                        else:
                            content_id = result_row[0]
                            logger.info(f"[AI] ContentID başarıyla alındı: {content_id}")
                    except Exception as db_error:
                        logger.exception(f"[AI] Veritabanı işleminde hata: {str(db_error)}")
                        raise db_error

        except Exception as e:
            logger.error(f"Veritabanı hatası: {e}")
            return Response({
                'error': 'Veritabanına kaydedilemedi',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # content_id tanımlı mı kontrol et
        if content_id is None:
            return Response({
                'error': 'Course quiz oluşturuldu fakat ID alınamadı',
                'details': 'Database did not return an ID'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Başarılı yanıt
        return Response({
            'message': 'Course quiz generated successfully',
            'contentId': content_id,
            'quiz': quiz_data,
            'model': model_type,
            'cost': result.get('cost', {})
        })
        
    except Exception as e:
        logger.exception(f"[AI] Kurs quizi oluşturulurken genel hata:")
        return Response({
            'error': f'Quiz oluşturulamadı: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_generated_quiz(request, content_id):
    """API endpoint to approve AI-generated quizzes (admin only)"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can approve quizzes'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Get quiz content first before entering the transaction
    quiz_data = None
    generation_params = None
    
    with connection.cursor() as cursor:
        # Check content
        cursor.execute("""
            SELECT ContentType, Content, GenerationParams, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentID = %s
        """, [content_id])
        
        content_data = cursor.fetchone()
        
        if not content_data:
            return Response({'error': 'Generated content not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_type, content_json, generation_params_json, approval_status = content_data
        
        if content_type != 'quiz':
            return Response({'error': 'Content is not a quiz'}, status=status.HTTP_400_BAD_REQUEST)
        
        if approval_status == 'approved':
            return Response({'error': 'Quiz is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse JSON data outside the transaction to catch errors early
        try:
            quiz_data = json.loads(content_json)
            generation_params = json.loads(generation_params_json)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON content'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save quiz to database
    quiz_id = None
    formatted_questions = []
    
    try:
        # Use a transaction to ensure data consistency
        with transaction.atomic():
            # Extract all needed data
            title = quiz_data.get('title', 'Untitled Quiz')
            description = quiz_data.get('description', '')
            passing_score = quiz_data.get('passing_score', 70)
            
            # Source type - 'youtube' or 'course'
            source_type = generation_params.get('source', 'youtube')
            logger.info(f"Quiz source type: {source_type}")
            
            # Variables to hold database IDs
            video_db_id = None
            course_db_id = None
            
            # Create a new cursor for the creation of the quiz
            with connection.cursor() as cursor:
                if source_type == 'youtube':
                    # For YouTube video source, get the CourseVideos.VideoID from the YouTube ID
                    youtube_video_id = generation_params.get('video_id')
                    logger.info(f"YouTube quiz - video_id from params: {youtube_video_id}")
                    
                    if not youtube_video_id:
                        logger.error("Missing YouTube video ID in generation parameters")
                        return Response({
                            'error': 'Missing YouTube video ID in generation parameters'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Find the corresponding VideoID from CourseVideos table
                    cursor.execute("""
                        SELECT VideoID FROM CourseVideos 
                        WHERE YouTubeVideoID = %s
                    """, [youtube_video_id])
                    
                    video_row = cursor.fetchone()
                    if not video_row:
                        logger.error(f"No CourseVideo found for YouTube ID: {youtube_video_id}")
                        
                        # Let's see what YouTubeVideoIDs we do have in the database
                        cursor.execute("SELECT TOP 5 YouTubeVideoID FROM CourseVideos")
                        sample_ids = [row[0] for row in cursor.fetchall()]
                        logger.info(f"Sample YouTube IDs in database: {sample_ids}")
                        
                        return Response({
                            'error': f'No course video found for YouTube ID: {youtube_video_id}'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    video_db_id = video_row[0]
                    logger.info(f"Found VideoID: {video_db_id} for YouTube ID: {youtube_video_id}")
                
                elif source_type == 'course':
                    # For course source, get the CourseID
                    course_db_id = generation_params.get('course_id')
                    logger.info(f"Course quiz - Raw course_id from params: {course_db_id} (type: {type(course_db_id).__name__})")
                    
                    if not course_db_id:
                        logger.error("Missing course ID in generation parameters")
                        return Response({
                            'error': 'Missing course ID in generation parameters'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Ensure course_db_id is an integer
                    try:
                        course_db_id = int(course_db_id)
                        logger.info(f"Course quiz - Converted course_id: {course_db_id}")
                        
                        # Verify course exists
                        cursor.execute("SELECT COUNT(*) FROM Courses WHERE CourseID = %s", [course_db_id])
                        course_exists = cursor.fetchone()[0] > 0
                        if not course_exists:
                            logger.error(f"Course ID {course_db_id} does not exist in Courses table")
                            return Response({
                                'error': f'Course ID {course_db_id} not found in database'
                            }, status=status.HTTP_404_NOT_FOUND)
                        
                    except (ValueError, TypeError) as e:
                        logger.error(f"Invalid course_id format: {course_db_id}, Error: {str(e)}")
                        return Response({
                            'error': f'Invalid course ID format: {course_db_id}'
                        }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'error': 'Invalid source type. Must be "youtube" or "course".'
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Create the quiz - create separate INSERT and ID retrieval
                sql_insert = None
                params = None
                
                if video_db_id:
                    logger.info(f"Creating quiz with VideoID: {video_db_id}")
                    sql_insert = """
                        INSERT INTO Quizzes
                        (VideoID, Title, Description, PassingScore, IsActive)
                        VALUES (%s, %s, %s, %s, 1)
                    """
                    params = [video_db_id, title, description, passing_score]
                elif course_db_id:
                    logger.info(f"Creating quiz with CourseID: {course_db_id}")
                    sql_insert = """
                        INSERT INTO Quizzes
                        (CourseID, Title, Description, PassingScore, IsActive)
                        VALUES (%s, %s, %s, %s, 1)
                    """
                    params = [course_db_id, title, description, passing_score]
                
                # Execute INSERT
                cursor.execute(sql_insert, params)
                logger.info("Quiz INSERT completed")
                
                # Try multiple methods to get the ID to ensure reliability
                quiz_id = None
                
                # Method 1: Try SCOPE_IDENTITY() first
                try:
                    cursor.execute("SELECT SCOPE_IDENTITY()")
                    result = cursor.fetchone()
                    if result and result[0] is not None:
                        quiz_id = result[0]
                        logger.info(f"[AI] Got quiz ID using SCOPE_IDENTITY(): {quiz_id}")
                except Exception as e:
                    logger.error(f"SCOPE_IDENTITY() failed: {str(e)}")
                
                # Method 2: If SCOPE_IDENTITY fails, try retrieving the ID by querying for the most recent insert
                if quiz_id is None:
                    logger.info("Trying alternative method to get quiz ID")
                    try:
                        if video_db_id:
                            cursor.execute("""
                                SELECT TOP 1 QuizID FROM Quizzes 
                                WHERE VideoID = %s
                                ORDER BY QuizID DESC
                            """, [video_db_id])
                        elif course_db_id:
                            cursor.execute("""
                                SELECT TOP 1 QuizID FROM Quizzes 
                                WHERE CourseID = %s
                                ORDER BY QuizID DESC
                            """, [course_db_id])
                        
                        result = cursor.fetchone()
                        if result and result[0] is not None:
                            quiz_id = result[0]
                            logger.info(f"[AI] Got quiz ID using alternative query: {quiz_id}")
                    except Exception as e:
                        logger.error(f"Alternative ID query failed: {str(e)}")
                
                # Method 3: Last resort, try to get max ID
                if quiz_id is None:
                    logger.warning("Using last resort method to get quiz ID")
                    try:
                        cursor.execute("SELECT TOP 1 QuizID FROM Quizzes ORDER BY QuizID DESC")
                        result = cursor.fetchone()
                        if result and result[0] is not None:
                            quiz_id = result[0]
                            logger.info(f"[AI] Got quiz ID using max ID query: {quiz_id}")
                    except Exception as e:
                        logger.error(f"Max ID query failed: {str(e)}")
                
                if quiz_id is None:
                    raise Exception("Failed to get quiz ID using all available methods")
                
                logger.info(f"[AI] New quiz added, QuizID: {quiz_id}")
                
                # For course quizzes, create QuizVideoRelations
                if source_type == 'course' and course_db_id and quiz_id:
                    videos = generation_params.get('videos', [])
                    if videos:
                        logger.info(f"Adding video relations for {len(videos)} videos")
                        for video in videos:
                            try:
                                video_id = video.get('video_id')
                                if not video_id:
                                    logger.warning(f"Video ID missing in video object: {video}")
                                    continue
                                    
                                # Ensure video_id is an integer
                                video_id = int(video_id)
                                
                                # Verify video exists
                                cursor.execute("SELECT COUNT(*) FROM CourseVideos WHERE VideoID = %s", [video_id])
                                video_exists = cursor.fetchone()[0] > 0
                                
                                if not video_exists:
                                    logger.error(f"Video ID {video_id} does not exist in CourseVideos table")
                                    continue
                                
                                # Insert the relation
                                cursor.execute("""
                                    INSERT INTO QuizVideoRelations
                                    (QuizID, VideoID)
                                    VALUES (%s, %s)
                                """, [quiz_id, video_id])
                                logger.info(f"Added video relation: Quiz {quiz_id} - Video {video_id}")
                            except (ValueError, TypeError) as e:
                                logger.warning(f"Invalid video_id format in video: {video}. Error: {str(e)}")
                            except Exception as e:
                                logger.error(f"Error adding video relation: {str(e)}")
            
            # Add quiz questions - use a separate cursor for each question to avoid the closed cursor issue
            questions = quiz_data.get('questions', [])
            logger.info(f"Processing {len(questions)} questions for quiz {quiz_id}")
            
            for i, question in enumerate(questions):
                try:
                    with connection.cursor() as question_cursor:
                        # Log the question structure for debugging
                        logger.info(f"Question {i+1} structure: {json.dumps(question)[:200]}")
                        
                        # Extract question_text using multiple approaches to ensure we get a value
                        question_text = None
                        
                        # Try different possible field names for question text
                        for field in ['question_text', 'text', 'question', 'prompt']:
                            if field in question and question[field]:
                                question_text = question[field]
                                logger.info(f"  Found question text in field '{field}': {question_text[:50]}...")
                                break
                        
                        # If still no text, check if question itself is a string
                        if question_text is None and isinstance(question, str):
                            question_text = question
                            logger.info(f"  Question is a string: {question_text[:50]}...")
                        
                        # Final fallback - use a placeholder if we couldn't extract question text
                        if not question_text:
                            question_text = f"Question {i+1}"
                            logger.warning(f"  Using fallback question text: {question_text}")
                        
                        question_type = question.get('question_type', 'multiple_choice')
                        
                        # Insert the question into QuizQuestions table
                        try:
                            question_cursor.execute("""
                                INSERT INTO QuizQuestions
                                (QuizID, QuestionText, QuestionType, OrderInQuiz)
                                VALUES (%s, %s, %s, %s)
                            """, [quiz_id, question_text, question_type, i + 1])
                            logger.info(f"Added question to QuizQuestions table")
                            
                            # Get the question ID using SCOPE_IDENTITY()
                            question_cursor.execute("SELECT SCOPE_IDENTITY()")
                            result = question_cursor.fetchone()
                            if not result or result[0] is None:
                                logger.error(f"Failed to get question ID for question {i+1}")
                                
                                # Try alternative method to get the question ID
                                try:
                                    question_cursor.execute("""
                                        SELECT TOP 1 QuestionID FROM QuizQuestions 
                                        WHERE QuizID = %s AND OrderInQuiz = %s
                                        ORDER BY QuestionID DESC
                                    """, [quiz_id, i + 1])
                                    result = question_cursor.fetchone()
                                    if not result or result[0] is None:
                                        raise Exception("Could not retrieve question ID through any method")
                                except Exception as alt_id_error:
                                    logger.error(f"Alternative method to get question ID failed: {str(alt_id_error)}")
                                    continue
                            
                            question_id = result[0]
                            logger.info(f"New question added, QuestionID: {question_id}, QuizID: {quiz_id}")
                            
                        except Exception as question_insert_error:
                            logger.error(f"Failed to insert question: {str(question_insert_error)}")
                            logger.error(f"Question data: quizId={quiz_id}, text={question_text}, type={question_type}, order={i+1}")
                            
                            # Try alternative parameter style
                            try:
                                question_cursor.execute("""
                                    INSERT INTO QuizQuestions
                                    (QuizID, QuestionText, QuestionType, OrderInQuiz)
                                    VALUES (?, ?, ?, ?)
                                """, [quiz_id, question_text, question_type, i + 1])
                                logger.info(f"Added question using alternative parameter style with ? placeholders")
                                
                                # Get the question ID
                                question_cursor.execute("SELECT SCOPE_IDENTITY()")
                                result = question_cursor.fetchone()
                                if not result or result[0] is None:
                                    # Try immediate lookup as the last resort
                                    question_cursor.execute("""
                                        SELECT MAX(QuestionID) FROM QuizQuestions 
                                        WHERE QuizID = ?
                                    """, [quiz_id])
                                    result = question_cursor.fetchone()
                                    if not result or result[0] is None:
                                        raise Exception("Failed to get question ID after alternative insert")
                                
                                question_id = result[0]
                                logger.info(f"New question added with alt method, QuestionID: {question_id}")
                            except Exception as alt_question_error:
                                logger.error(f"Alternative question insert failed: {str(alt_question_error)}")
                                # Last attempt with direct values
                                try:
                                    insert_sql = f"""
                                        INSERT INTO QuizQuestions
                                        (QuizID, QuestionText, QuestionType, OrderInQuiz)
                                        VALUES ({quiz_id}, '{question_text.replace("'", "''")}', 
                                                '{question_type.replace("'", "''")}', {i + 1})
                                    """
                                    question_cursor.execute(insert_sql)
                                    logger.info(f"Added question using direct SQL values")
                                    
                                    # Get the question ID using last resort method
                                    question_cursor.execute("""
                                        SELECT TOP 1 QuestionID FROM QuizQuestions 
                                        WHERE QuizID = %s 
                                        ORDER BY QuestionID DESC
                                    """, [quiz_id])
                                    result = question_cursor.fetchone()
                                    if result and result[0] is not None:
                                        question_id = result[0]
                                        logger.info(f"Retrieved question ID with last resort method: {question_id}")
                                    else:
                                        # Skip this question if we cannot get the ID
                                        logger.error("Failed to get question ID with all methods")
                                        continue
                                except Exception as final_error:
                                    logger.error(f"Final question insert attempt failed: {str(final_error)}")
                                    continue  # Skip this question and move to the next one
                        
                        # Process options for this question
                        options = []
                        
                        # Check for different possible option structures
                        if 'options' in question and question['options']:
                            logger.info(f"Found {len(question['options'])} options")
                            for j, option in enumerate(question.get('options', [])):
                                try:
                                    # Handle both dictionary and string options
                                    option_text = None
                                    is_correct = False
                                    
                                    if isinstance(option, dict):
                                        # Try different possible field names for option text
                                        for field in ['text', 'option_text', 'content', 'value']:
                                            if field in option and option[field]:
                                                option_text = option[field]
                                                break
                                        
                                        if not option_text:
                                            option_text = f"Option {j+1}"
                                        
                                        is_correct = option.get('is_correct', False) or option.get('correct', False)
                                    else:
                                        # If option is a string
                                        option_text = str(option)
                                        is_correct = False  # Default for string options
                                    
                                    options.append({
                                        'option_text': option_text,
                                        'is_correct': is_correct
                                    })
                                    
                                    # Insert the option
                                    try:
                                        # Using %s style placeholders for SQL Server
                                        question_cursor.execute("""
                                            INSERT INTO QuestionOptions
                                            (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                            VALUES (%s, %s, %s, %s)
                                        """, [question_id, option_text, 1 if is_correct else 0, j + 1])
                                        logger.info(f"Option added for question {question_id}: {option_text[:20]}...")
                                    except Exception as option_insert_error:
                                        logger.error(f"Failed to insert option: {str(option_insert_error)}")
                                        logger.error(f"Option data: questionId={question_id}, text={option_text}, isCorrect={1 if is_correct else 0}, order={j+1}")
                                        # Try alternative parameter style for SQL Server
                                        try:
                                            question_cursor.execute("""
                                                INSERT INTO QuestionOptions
                                                (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                                VALUES (?, ?, ?, ?)
                                            """, [question_id, option_text, 1 if is_correct else 0, j + 1])
                                            logger.info(f"Option added using ? parameter style")
                                        except Exception as alt_insert_error:
                                            logger.error(f"Alternative insert style also failed: {str(alt_insert_error)}")
                                            # Final attempt with direct SQL
                                            try:
                                                # Escape single quotes in the text
                                                safe_text = option_text.replace("'", "''") if option_text else f"Option {j+1}"
                                                insert_sql = f"""
                                                    INSERT INTO QuestionOptions
                                                    (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                                    VALUES ({question_id}, '{safe_text}', {1 if is_correct else 0}, {j + 1})
                                                """
                                                question_cursor.execute(insert_sql)
                                                logger.info(f"Option added using direct SQL values")
                                            except Exception as final_error:
                                                logger.error(f"All option insert attempts failed: {str(final_error)}")
                                
                                except Exception as e:
                                    logger.error(f"Error processing option {j+1} for question {i+1}: {str(e)}")
                                    # Add a placeholder option to maintain numbering
                                    fallback_text = f"Option {j+1} (Error: {str(e)})"
                                    options.append({
                                        'option_text': fallback_text,
                                        'is_correct': False
                                    })
                                    
                                    # Insert placeholder option
                                    try:
                                        question_cursor.execute("""
                                            INSERT INTO QuestionOptions
                                            (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                            VALUES (?, ?, ?, ?)
                                        """, [question_id, fallback_text, 0, j + 1])
                                        logger.info(f"Fallback option added: {fallback_text}")
                                    except Exception as fallback_error:
                                        logger.error(f"Failed to insert fallback option: {str(fallback_error)}")
                                        # Try alternative SQL syntax as a last resort
                                        try:
                                            question_cursor.execute("""
                                                INSERT INTO QuestionOptions
                                                (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                                VALUES (@p1, @p2, @p3, @p4)
                                            """, (question_id, fallback_text, 0, j + 1))
                                        except:
                                            logger.error("All attempts to save option failed")
                        
                        elif isinstance(question.get('answer'), (list, tuple)):
                            # Some formats might have a separate answer field
                            answers = question.get('answer', [])
                            logger.info(f"Found {len(answers)} answers in answer field")
                            for j, answer in enumerate(answers):
                                try:
                                    if isinstance(answer, dict):
                                        text = answer.get('text', f"Answer {j+1}")
                                        is_correct = answer.get('is_correct', False)
                                    else:
                                        text = str(answer)
                                        is_correct = j == 0  # Assume first is correct by default
                                    
                                    options.append({
                                        'option_text': text,
                                        'is_correct': is_correct
                                    })
                                    
                                    # Insert the option
                                    try:
                                        # Using ? style placeholders for SQL Server
                                        question_cursor.execute("""
                                            INSERT INTO QuestionOptions
                                            (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                            VALUES (?, ?, ?, ?)
                                        """, [question_id, text, 1 if is_correct else 0, j + 1])
                                        logger.info(f"Answer option added: {text[:20]}...")
                                    except Exception as option_insert_error:
                                        logger.error(f"Failed to insert answer option: {str(option_insert_error)}")
                                        logger.error(f"Option data: questionId={question_id}, text={text}, isCorrect={1 if is_correct else 0}, order={j+1}")
                                        # Try alternative parameter style for SQL Server
                                        try:
                                            question_cursor.execute("""
                                                INSERT INTO QuestionOptions
                                                (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                                VALUES (@p1, @p2, @p3, @p4)
                                            """, (question_id, text, 1 if is_correct else 0, j + 1))
                                            logger.info(f"Answer option added using alternative parameter style")
                                        except Exception as alt_insert_error:
                                            logger.error(f"Alternative insert also failed: {str(alt_insert_error)}")
                                            raise alt_insert_error
                                
                                except Exception as e:
                                    logger.error(f"Error processing answer {j+1} for question {i+1}: {str(e)}")
                                    # Add a placeholder option
                                    fallback_text = f"Answer {j+1} (Error: {str(e)})"
                                    options.append({
                                        'option_text': fallback_text,
                                        'is_correct': False
                                    })
                                    
                                    # Insert placeholder option
                                    try:
                                        question_cursor.execute("""
                                            INSERT INTO QuestionOptions
                                            (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                            VALUES (?, ?, ?, ?)
                                        """, [question_id, fallback_text, 0, j + 1])
                                        logger.info(f"Fallback answer option added: {fallback_text}")
                                    except Exception as fallback_error:
                                        logger.error(f"Failed to insert fallback answer option: {str(fallback_error)}")
                                        # Try alternative SQL syntax as a last resort
                                        try:
                                            question_cursor.execute("""
                                                INSERT INTO QuestionOptions
                                                (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                                VALUES (@p1, @p2, @p3, @p4)
                                            """, (question_id, fallback_text, 0, j + 1))
                                            logger.info(f"Fallback answer option added with alternative style")
                                        except Exception:
                                            logger.error("All attempts to save answer option failed")
                        
                        # If no options were found, add some dummy options
                        if not options:
                            logger.warning(f"No options found for question {i+1}, adding default options")
                            default_options = [
                                {'option_text': 'Yes', 'is_correct': True},
                                {'option_text': 'No', 'is_correct': False}
                            ]
                            
                            for j, default_option in enumerate(default_options):
                                options.append(default_option)
                                
                                # Insert default option
                                try:
                                    question_cursor.execute("""
                                        INSERT INTO QuestionOptions
                                        (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                        VALUES (?, ?, ?, ?)
                                    """, [
                                        question_id, 
                                        default_option['option_text'], 
                                        1 if default_option['is_correct'] else 0, 
                                        j + 1
                                    ])
                                    logger.info(f"Default option added: {default_option['option_text']}")
                                except Exception as option_insert_error:
                                    logger.error(f"Failed to insert default option: {str(option_insert_error)}")
                                    logger.error(f"Default option data: questionId={question_id}, text={default_option['option_text']}, isCorrect={1 if default_option['is_correct'] else 0}, order={j+1}")
                                    # Try alternative parameter style for SQL Server
                                    try:
                                        question_cursor.execute("""
                                            INSERT INTO QuestionOptions
                                            (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                            VALUES (@p1, @p2, @p3, @p4)
                                        """, (question_id, default_option['option_text'], 1 if default_option['is_correct'] else 0, j + 1))
                                        logger.info(f"Default option added using alternative parameter style")
                                    except Exception as alt_insert_error:
                                        logger.error(f"Alternative insert also failed: {str(alt_insert_error)}")
                                        logger.error("All attempts to save default option failed")
                    
                    # Add the processed question to our tracking list (outside the cursor context)
                    formatted_questions.append({
                        'question_text': question_text,
                        'question_type': question_type,
                        'options': options
                    })
                    
                except Exception as e:
                    logger.error(f"Error adding question {i+1}: {str(e)}")
                    # Continue with next question instead of failing the whole quiz
            
            # Mark content as approved in a new cursor
            with connection.cursor() as approval_cursor:
                approval_cursor.execute("""
                    UPDATE AIGeneratedContent
                    SET ApprovalStatus = 'approved', ApprovalDate = GETDATE(), ApprovedBy = %s
                    WHERE ContentID = %s
                """, [user_id, content_id])
                logger.info(f"Marked content ID {content_id} as approved")
        
        # We're outside the transaction block now, which means it succeeded
        logger.info(f"Transaction completed successfully. Quiz ID: {quiz_id}, Questions: {len(formatted_questions)}")
        return Response({
            'message': 'Quiz approved and created successfully',
            'quizId': quiz_id,
            'questionCount': len(formatted_questions)
        })
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return Response({'error': f'Invalid JSON content: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception(f"Error approving quiz: {e}")
        return Response({'error': f'Error approving quiz: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_content(request):
    """API endpoint to list pending AI content (admin only)"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can view pending content'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Get pending content
        cursor.execute("""
            SELECT ContentID, ContentType, Content, GenerationParams, CreationDate
            FROM AIGeneratedContent
            WHERE ApprovalStatus = 'pending'
            ORDER BY CreationDate DESC
        """)
        
        columns = [col[0] for col in cursor.description]
        pending_contents = []
        
        for row in cursor.fetchall():
            content = dict(zip(columns, row))
            
            # Parse JSON data
            try:
                content['Content'] = json.loads(content['Content'])
            except json.JSONDecodeError:
                content['Content'] = content['Content']  # Keep text as is if JSON parsing fails
                
            try:
                content['GenerationParams'] = json.loads(content['GenerationParams'])
            except json.JSONDecodeError:
                content['GenerationParams'] = content['GenerationParams']  # Keep text as is if JSON parsing fails
            
            pending_contents.append(content)
    
    return Response(pending_contents)

@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_video_content(request):
    video_url = request.data.get("videoUrl")

    if not video_url:
        return Response({"error": "videoUrl parametresi zorunludur."}, status=400)

    try:
        logger.info(f"[AI] Video indiriliyor: {video_url}")
        audio_path = download_audio(video_url)

        logger.info(f"[AI] Transkript başlatılıyor: {audio_path}")
        transcript = transcribe_audio(audio_path)

        if os.path.exists(audio_path):
            os.remove(audio_path)
            logger.info(f"[AI] Dosya silindi: {audio_path}")

        return Response({"transcript": transcript})

    except Exception as e:
        logger.exception("analyze_video_content sırasında hata oluştu:")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_content_detail(request, content_id):
    """API endpoint to get detailed content of a pending or approved quiz"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can access quiz content details'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Get quiz content
        cursor.execute("""
            SELECT ContentID, ContentType, Content, GenerationParams, CreationDate, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentID = %s AND ContentType = 'quiz'
        """, [content_id])
        
        row = cursor.fetchone()
        if not row:
            return Response({'error': 'Quiz content not found'}, status=status.HTTP_404_NOT_FOUND)
        
        columns = [col[0] for col in cursor.description]
        content = dict(zip(columns, row))
        
        # Parse JSON data
        try:
            # Get the raw content for debugging
            raw_content = content['Content']
            print(f"Raw quiz content: {raw_content[:500]}...")
            
            content_json = json.loads(raw_content)
            print(f"Parsed content structure: {list(content_json.keys())}")
            
            # Extract questions from content
            questions = content_json.get('questions', [])
            if questions:
                print(f"Found {len(questions)} questions")
                print(f"First question structure: {list(questions[0].keys()) if questions else 'No questions'}")
            else:
                print("No questions found in content_json")
            
            # Add sample questions for debugging if needed
            if not questions or len(questions) == 0:
                print("Using sample questions for debugging")
                questions = [
                    {
                        "question_text": "What is Git?",
                        "question_type": "multiple_choice",
                        "options": [
                            {"text": "A distributed version control system", "is_correct": True},
                            {"text": "A programming language", "is_correct": False},
                            {"text": "A database system", "is_correct": False},
                            {"text": "An operating system", "is_correct": False}
                        ]
                    },
                    {
                        "question_text": "What command creates a Git repository?",
                        "question_type": "multiple_choice",
                        "options": [
                            {"text": "git init", "is_correct": True},
                            {"text": "git create", "is_correct": False},
                            {"text": "git start", "is_correct": False},
                            {"text": "git new", "is_correct": False}
                        ]
                    }
                ]
            
            # Format questions and options for the frontend
            formatted_questions = []
            for i, question in enumerate(questions):
                logger.info(f"Processing question {i+1} for display")
                
                # Get question_text with proper fallback
                question_text = None
                # Try different possible field names for question text
                for field in ['question_text', 'text', 'question', 'prompt']:
                    if field in question and question[field]:
                        question_text = question[field]
                        logger.info(f"  Found question text in field '{field}': {question_text[:50]}...")
                        break
                
                # If still no text, check if question itself is a string
                if question_text is None and isinstance(question, str):
                    question_text = question
                    logger.info(f"  Question is a string: {question_text[:50]}...")
                
                # Final fallback
                if not question_text:
                    question_text = f"Question {i+1}"
                    logger.warning(f"  Using fallback question text: {question_text}")
                
                question_type = question.get('question_type', 'multiple_choice')
                logger.info(f"  Question type: {question_type}")
                
                options = []
                # Check for different possible option structures
                if 'options' in question and question['options']:
                    logger.info(f"Found {len(question['options'])} options")
                    for j, option in enumerate(question.get('options', [])):
                        try:
                            # Handle both dictionary and string options
                            option_text = None
                            is_correct = False
                            
                            if isinstance(option, dict):
                                # Try different possible field names for option text
                                for field in ['text', 'option_text', 'content', 'value']:
                                    if field in option and option[field]:
                                        option_text = option[field]
                                        break
                                
                                if not option_text:
                                    option_text = f"Option {j+1}"
                                
                                is_correct = option.get('is_correct', False) or option.get('correct', False)
                            else:
                                # If option is a string
                                option_text = str(option)
                                is_correct = False  # Default for string options
                                
                            logger.info(f"    Option {j+1}: {option_text[:30] if option_text else ''} (Correct: {is_correct})")
                            
                            options.append({
                                'option_text': option_text,
                                'is_correct': is_correct
                            })
                        except Exception as e:
                            logger.error(f"Error processing option {j+1} for question {i+1}: {str(e)}")
                            # Add a placeholder option to maintain numbering
                            options.append({
                                'option_text': f"Option {j+1} (Error: {str(e)})",
                                'is_correct': False
                            })
                elif isinstance(question.get('answer'), (list, tuple)):
                    # Some formats might have a separate answer field
                    answers = question.get('answer', [])
                    logger.info(f"Found {len(answers)} answers in answer field")
                    for j, answer in enumerate(answers):
                        try:
                            if isinstance(answer, dict):
                                text = answer.get('text', f"Answer {j+1}")
                                is_correct = answer.get('is_correct', False)
                            else:
                                text = str(answer)
                                is_correct = j == 0  # Assume first is correct by default
                            
                            options.append({
                                'option_text': text,
                                'is_correct': is_correct
                            })
                        except Exception as e:
                            logger.error(f"Error processing answer {j+1} for question {i+1}: {str(e)}")
                            # Add a placeholder option
                            options.append({
                                'option_text': f"Answer {j+1} (Error: {str(e)})",
                                'is_correct': False
                            })
                
                # If no options were found, add some dummy options
                if not options:
                    logger.warning(f"No options found for question {i+1}, adding default options")
                    options = [
                        {'option_text': 'Yes', 'is_correct': True},
                        {'option_text': 'No', 'is_correct': False}
                    ]
                
                # Add processed question to the list
                formatted_questions.append({
                    'question_text': question_text,
                    'question_type': question_type,
                    'options': options
                })
            
            # Create response with all necessary data
            response_data = {
                'title': content_json.get('title', 'Untitled Quiz'),
                'description': content_json.get('description', ''),
                'passing_score': content_json.get('passing_score', 70),
                'questions': formatted_questions
            }
            
            # Print summary of formatted data
            print(f"Returning {len(formatted_questions)} formatted questions")
            
            return Response(response_data)
                
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Content that failed to parse: {content['Content'][:500]}...")
            return Response({'error': 'Invalid JSON content'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Error retrieving quiz content detail: {e}")
            return Response(
                {'error': f'Error retrieving quiz content: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_complete_quest(request):
    """API endpoint to generate fully populated quests with AI that automatically selects targets from database"""
    try:
        user_id = request.user.id
        
        # Admin check
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT UserRole FROM Users WHERE UserID = %s
            """, [user_id])
            
            user_role = cursor.fetchone()
            if not user_role or user_role[0] != 'admin':
                return Response({'error': 'Only administrators can generate quests'}, 
                              status=status.HTTP_403_FORBIDDEN)
        
        # Get parameters
        difficulty = request.data.get('difficulty', 'intermediate')
        category = request.data.get('category', 'General Learning')
        points_required = request.data.get('pointsRequired', 0)
        points_reward = request.data.get('pointsReward', 50)
        auto_create = request.data.get('autoCreate', False)  # Whether to create the quest immediately
        
        # Create a generation parameters object
        generation_params = {
            'difficulty': difficulty,
            'category': category,
            'points_required': points_required,
            'points_reward': points_reward,
            'auto_create': auto_create
        }
        
        # Create AIGeneratedContent record
        content_id = None
        with connection.cursor() as cursor:
            try:
                # First, execute INSERT
                cursor.execute("""
                    INSERT INTO AIGeneratedContent
                    (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
                    VALUES ('quest', %s, %s, GETDATE(), 'queued')
                """, [
                    json.dumps({'status': 'queued'}),
                    json.dumps(generation_params)
                ])
                
                # Then, get the ID in a separate query for better compatibility
                cursor.execute("SELECT SCOPE_IDENTITY()")
                content_id_result = cursor.fetchone()
                
                # Check if we got a valid result
                if content_id_result is None or content_id_result[0] is None:
                    # Try alternative method to get the ID
                    cursor.execute("""
                        SELECT TOP 1 ContentID FROM AIGeneratedContent 
                        WHERE ContentType = 'quest' 
                        ORDER BY CreationDate DESC
                    """)
                    content_id_result = cursor.fetchone()
                    logger.debug(f"Alternative query result: {content_id_result}")
                    
                    if content_id_result is None or content_id_result[0] is None:
                        raise Exception("Failed to retrieve content ID after insertion")
                
                # Now we should have a valid content_id_result
                logger.debug(f"Raw content_id_result: {content_id_result}")
                
                # Convert to int - use safer conversion
                if isinstance(content_id_result[0], Decimal):
                    content_id = int(content_id_result[0])
                else:
                    content_id = int(float(content_id_result[0]))
                
                logger.debug(f"Generated content_id: {content_id}, type: {type(content_id)}")
                
                # Verify we got the content ID
                cursor.execute("SELECT ContentID FROM AIGeneratedContent WHERE ContentID = %s", [content_id])
                verification = cursor.fetchone()
                logger.debug(f"Verification query result: {verification}")
                
                if verification is None:
                    raise Exception(f"Verification failed - ContentID {content_id} not found in database")
                    
            except Exception as db_error:
                logger.error(f"Database error in quest generation: {str(db_error)}")
                return Response({
                    'error': f'Database error: {str(db_error)}',
                    'details': 'Error while creating quest generation record'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if content_id is None:
            return Response({
                'error': 'Failed to generate content ID',
                'details': 'Database did not return a valid ID'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Start background processing
        # In a real Django application with Celery, you would do:
        # process_quest_generation_task.delay(content_id, generation_params)
        # For this demo without Celery, we'll run in a thread
        thread = threading.Thread(
            target=process_quest_generation_background, 
            args=(content_id, generation_params)
        )
        thread.daemon = True
        thread.start()
        
        response_data = {
            'message': 'Quest generation started',
            'contentId': content_id,
            'status': 'queued'
        }
        
        logger.debug(f"Response data: {response_data}")
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error starting quest generation: {str(e)}", exc_info=True)
        return Response({
            'error': 'Failed to start quest generation',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def process_quest_generation_background(content_id, generation_params):
    """Background process to generate a quest"""
    max_retries = 3
    retry_count = 0
    retry_delay = 10  # seconds between retries
    
    try:
        logger.info(f"Starting background quest generation for content ID {content_id}")
        
        # Extract parameters
        difficulty = generation_params.get('difficulty', 'intermediate')
        category = generation_params.get('category', 'General Learning')
        points_required = generation_params.get('points_required', 0)
        points_reward = generation_params.get('points_reward', 50)
        auto_create = generation_params.get('auto_create', False)
        
        # Check if we already have database data in the parameters to avoid refetching
        database_data = generation_params.get('cached_database_data')
        
        # Only fetch database data if not already cached
        if not database_data:
            logger.info("Fetching database data for quest generation")
            database_data = get_quest_database_data()
            
            # Database data will always be returned now, even if empty
            # Update the content record with cached database data to avoid refetching
            with connection.cursor() as cursor:
                try:
                    # Convert any datetime objects to strings for JSON serialization
                    # Store the database data in the content to avoid refetching it
                    cursor.execute("""
                        UPDATE AIGeneratedContent
                        SET GenerationParams = %s
                        WHERE ContentID = %s
                    """, [
                        json.dumps({
                            **generation_params, 
                            'cached_database_data': database_data
                        }, default=datetime_handler),
                        content_id
                    ])
                except Exception as e:
                    logger.warning(f"Could not update GenerationParams with cached database data: {str(e)}")
        
        # Check if we have enough actual data or need to use fallback
        use_fallback = (len(database_data.get('popular_courses', [])) == 0 and 
                       len(database_data.get('popular_videos', [])) == 0)
        
        if use_fallback:
            logger.warning("Using fallback quest generation due to insufficient database data")
            
            # Update status to 'processing'
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE AIGeneratedContent
                    SET Content = %s, ApprovalStatus = %s
                    WHERE ContentID = %s
                """, [
                    json.dumps({
                        "status": "processing", 
                        "message": "Generating fallback quest due to limited database content"
                    }, default=datetime_handler),
                    'processing',
                    content_id
                ])
            
            # Generate a fallback quest
            fallback_quest = create_fallback_quest(database_data, difficulty, category, points_required, points_reward)
            
            # Update content in the database with the fallback quest
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE AIGeneratedContent
                    SET Content = %s, ApprovalStatus = %s
                    WHERE ContentID = %s
                """, [
                    json.dumps(fallback_quest, default=datetime_handler),
                    'completed',
                    content_id
                ])
            
            # If auto-create is enabled, create the quest immediately
            if auto_create:
                try:
                    # Create the quest
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO Quests
                            (Title, Description, RequiredPoints, RewardPoints, DifficultyLevel, 
                             IsActive, IsAIGenerated, CreationDate)
                            VALUES (%s, %s, %s, %s, %s, 1, 1, GETDATE())
                        """, [
                            fallback_quest['title'], 
                            fallback_quest['description'], 
                            fallback_quest['requiredPoints'], 
                            fallback_quest['rewardPoints'], 
                            fallback_quest['difficultyLevel']
                        ])
                        
                        cursor.execute("SELECT SCOPE_IDENTITY()")
                        quest_id = cursor.fetchone()[0]
                        
                        if quest_id:
                            # Add quest conditions (if any)
                            for condition in fallback_quest.get('conditions', []):
                                cursor.execute("""
                                    INSERT INTO QuestConditions
                                    (QuestID, ConditionType, TargetID, TargetValue, Description)
                                    VALUES (%s, %s, %s, %s, %s)
                                """, [
                                    quest_id, 
                                    condition.get('type', 'generic'), 
                                    condition.get('targetId', 0), 
                                    condition.get('targetValue', 1), 
                                    condition.get('description', '')
                                ])
                            
                            # Update content with created quest ID
                            fallback_quest['createdQuestId'] = quest_id
                            cursor.execute("""
                                UPDATE AIGeneratedContent
                                SET Content = %s
                                WHERE ContentID = %s
                            """, [
                                json.dumps(fallback_quest, default=datetime_handler),
                                content_id
                            ])
                    
                    logger.info(f"Successfully created fallback quest with ID {quest_id}")
                except Exception as create_error:
                    logger.error(f"Error creating fallback quest: {str(create_error)}")
            
            return
        
        # Update status to 'processing'
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE AIGeneratedContent
                SET Content = %s, ApprovalStatus = %s
                WHERE ContentID = %s
            """, [
                json.dumps({
                    "status": "processing", 
                    "message": "AI generating quest content"
                }, default=datetime_handler),
                'processing',
                content_id
            ])
        
        # Get available NFT types
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT NFTTypeID, TypeName, Description 
                FROM NFTTypes
            """)
            nft_types = []
            for row in cursor.fetchall():
                nft_types.append({
                    "id": row[0],
                    "name": row[1],
                    "description": row[2]
                })
            
            # Get available NFTs
            cursor.execute("""
                SELECT TOP 10 NFTID, Title, Description, Rarity, TradeValue, NFTTypeID
                FROM NFTs
                WHERE IsActive = 1
                ORDER BY NFTID DESC
            """)
            available_nfts = []
            for row in cursor.fetchall():
                available_nfts.append({
                    "id": row[0],
                    "title": row[1],
                    "description": row[2],
                    "rarity": row[3],
                    "tradeValue": float(row[4]) if row[4] is not None else 0,
                    "nftTypeId": row[5]
                })
        
        # Generate quest with AI, including the database info
        system_prompt = (
            "You are an AI specialized in creating educational quests based on real database content. "
            "You will receive actual course, quiz, and video data from the database. "
            "Create a coherent quest that uses REAL content IDs and targets from the provided database information. "
            "Your response should be a COMPLETE quest with title, description, and properly defined conditions "
            "that reference the actual database items by ID. "
            "Additionally, you should recommend a specific NFT reward with detailed properties that would be appropriate "
            "for this quest's completion."
        )
        
        user_prompt = f"""
        Create a fully-defined quest with the following parameters:
        
        Difficulty level: {difficulty}
        Category: {category}
        Required points to start: {points_required}
        Reward points: {points_reward}
        
        DATABASE CONTENT AVAILABLE:
        
        COURSES:
        {json.dumps(database_data.get('popular_courses', []), indent=2, default=datetime_handler)}
        
        QUIZZES:
        {json.dumps(database_data.get('recent_quizzes', []), indent=2, default=datetime_handler)}
        
        VIDEOS:
        {json.dumps(database_data.get('popular_videos', []), indent=2, default=datetime_handler)}
        
        AVAILABLE NFT TYPES:
        {json.dumps(nft_types, indent=2, default=datetime_handler)}
        
        AVAILABLE NFT REWARDS:
        {json.dumps(available_nfts, indent=2, default=datetime_handler)}
        
        Create a complete quest that:
        1. Has a compelling title and description
        2. Includes 2-4 conditions using ACTUAL items from the database (reference real CourseID, QuizID, VideoID values)
        3. Uses appropriate condition types (course_completion, quiz_score, take_quiz, watch_videos)
        4. Makes logical sense for the specified difficulty level
        
        IMPORTANTLY, create a detailed NFT recommendation that matches the quest's theme:
        - Include a suggested NFT title
        - Include a detailed NFT description
        - Specify NFT rarity (Common, Uncommon, Rare, Epic, Legendary)
        - Suggest an appropriate NFT type ID from the available types
        - Suggest a trade value appropriate for the difficulty level
        - Include a brief visual description of how the NFT should look
        
        Return your response as a clean JSON object with these fields:
        - title: A compelling quest title
        - description: Detailed quest description
        - difficultyLevel: Should be set to the specified difficulty level
        - requiredPoints: Should be set to the specified required points
        - rewardPoints: Should be set to the specified reward points
        - conditions: An array of condition objects with the following properties:
          * type: One of the supported condition types listed below
          * targetId: A real ID from the database (like a CourseID, QuizID, or VideoID)
          * targetValue: The target value needed to fulfill the condition
          * description: Clear description of what this condition requires
        - nftRecommendation: An object with properties for title, description, rarity, nftTypeId, tradeValue, and visualDescription
        - estimated_completion_time: Estimated time to complete in minutes
        
        Use only these condition types: "course_completion", "quiz_score", "quiz_completion", "watch_video"
        For "targetId", use REAL IDs from the database content provided.
        Make the quest challenging but achievable based on the difficulty level.
        """
        
        try:
            # Implement retry logic with exponential backoff
            success = False
            last_error = None
            
            while retry_count < max_retries and not success:
                try:
                    if retry_count > 0:
                        logger.info(f"Retry attempt {retry_count}/{max_retries} for quest generation after waiting {retry_delay} seconds")
                        # Update status to show retrying
                        with connection.cursor() as cursor:
                            cursor.execute("""
                                UPDATE AIGeneratedContent
                                SET Content = %s
                                WHERE ContentID = %s
                            """, [
                                json.dumps({
                                    "status": "processing", 
                                    "message": f"AI generating quest content (retry {retry_count}/{max_retries})"
                                }, default=datetime_handler),
                                content_id
                            ])
                    
                    # Call LLM with increasing timeout for retries
                    result = call_llm(system_prompt, user_prompt)
                    success = True
                    
                except Exception as e:
                    last_error = e
                    logger.error(f"Error on attempt {retry_count+1}/{max_retries}: {str(e)}")
                    retry_count += 1
                    if retry_count < max_retries:
                        time.sleep(retry_delay)
                        # Increase delay for next retry (exponential backoff)
                        retry_delay *= 2
                    else:
                        logger.error(f"All {max_retries} attempts failed. Giving up on quest generation.")
                        raise e
            
            # After retries, check if we have a valid result
            if not success or not result:
                error_message = "Failed after multiple attempts"
                logger.error(f"AI service error in quest generation: {error_message}")
            elif isinstance(result, dict) and (not result.get('success', True) or "error" in result):
                error_message = result.get("error", "Unknown AI service error") 
                logger.error(f"AI service error in quest generation: {error_message}")
                
                # Generate a fallback quest rather than failing
                logger.info("Generating fallback quest due to AI service issues")
                
                # Create a simple fallback quest using database data
                fallback_quest = create_fallback_quest(database_data, difficulty, category, points_required, points_reward)
                
                # Update with fallback quest instead of failing
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE AIGeneratedContent
                        SET Content = %s, ApprovalStatus = %s
                        WHERE ContentID = %s
                    """, [
                        json.dumps({
                            **fallback_quest,
                            "status": "completed",
                            "message": "Fallback quest generation completed successfully",
                            "completedAt": datetime.now().isoformat()
                        }, default=datetime_handler),
                        'completed',
                        content_id
                    ])
                    
                logger.info(f"Fallback quest generation completed successfully for content ID {content_id}")
                
                # If auto_create is enabled, create the fallback quest
                if auto_create:
                    try:
                        # Create the quest
                        with connection.cursor() as cursor:
                            cursor.execute("""
                                INSERT INTO Quests
                                (Title, Description, RequiredPoints, RewardPoints, DifficultyLevel, 
                                 IsActive, IsAIGenerated, CreationDate)
                                VALUES (%s, %s, %s, %s, %s, 1, 1, GETDATE())
                            """, [
                                fallback_quest['title'], 
                                fallback_quest['description'], 
                                fallback_quest['requiredPoints'], 
                                fallback_quest['rewardPoints'], 
                                fallback_quest['difficultyLevel']
                            ])
                            
                            # Get the ID in a separate query using different methods
                            try:
                                cursor.execute("SELECT @@IDENTITY")
                                quest_id_result = cursor.fetchone()
                                quest_id = quest_id_result[0] if quest_id_result else None
                                
                                if quest_id is None:
                                    # Try SCOPE_IDENTITY() as an alternative
                                    cursor.execute("SELECT SCOPE_IDENTITY()")
                                    quest_id_result = cursor.fetchone()
                                    quest_id = quest_id_result[0] if quest_id_result else None
                                    
                                    if quest_id is None:
                                        # Last resort: try to find the most recently created quest
                                        cursor.execute("""
                                            SELECT TOP 1 QuestID FROM Quests 
                                            WHERE Title = %s AND Description = %s
                                            ORDER BY CreationDate DESC
                                        """, [
                                            fallback_quest['title'], 
                                            fallback_quest['description']
                                        ])
                                        quest_id_result = cursor.fetchone()
                                        quest_id = quest_id_result[0] if quest_id_result else None
                            except Exception as id_error:
                                logger.error(f"Error retrieving quest ID: {str(id_error)}")
                                quest_id = None
                            
                            if not quest_id:
                                logger.error("Failed to get quest ID after insert for fallback quest, conditions will not be saved")
                            else:
                                logger.info(f"Successfully created fallback quest with ID {quest_id}, adding conditions")
                                
                                # Add quest conditions
                                condition_count = 0
                                
                                # Build a single bulk insert for all conditions
                                if fallback_quest.get('conditions', []):
                                    try:
                                        # Prepare values for bulk insert
                                        condition_values = []
                                        value_params = []
                                        
                                        for i, condition in enumerate(fallback_quest.get('conditions', [])):
                                            # Ensure targetId is an integer or NULL
                                            target_id = condition.get('targetId')
                                            if target_id is not None:
                                                try:
                                                    target_id = int(target_id)
                                                except (ValueError, TypeError):
                                                    # If conversion fails, log the issue and set to NULL
                                                    logger.warning(f"Invalid targetId (not an integer): {target_id}, setting to NULL")
                                                    target_id = None
                                            
                                            condition_type = condition.get('type', 'generic')
                                            target_value = condition.get('targetValue', 1)
                                            description = condition.get('description', '')
                                            
                                            # Add to parameters
                                            value_params.extend([
                                                quest_id, 
                                                condition_type, 
                                                target_id, 
                                                target_value, 
                                                description
                                            ])
                                            
                                            # Add placeholder
                                            condition_values.append(f"(%s, %s, %s, %s, %s)")
                                            condition_count += 1
                                        
                                        if condition_values:
                                            # Create bulk insert statement
                                            sql = f"""
                                                INSERT INTO QuestConditions
                                                (QuestID, ConditionType, TargetID, TargetValue, Description)
                                                VALUES {', '.join(condition_values)}
                                            """
                                            
                                            cursor.execute(sql, value_params)
                                            logger.info(f"Bulk inserted {condition_count} conditions for fallback quest {quest_id}")
                                    except Exception as condition_error:
                                        logger.error(f"Error bulk adding fallback quest conditions: {str(condition_error)}")
                                
                                logger.info(f"Added {condition_count} conditions to fallback quest {quest_id}")
                            
                            # Update content to include created quest ID and completion message
                            cursor.execute("""
                                UPDATE AIGeneratedContent
                                SET Content = %s, ApprovalStatus = %s, ApprovalDate = GETDATE(), ApprovedBy = NULL
                                WHERE ContentID = %s
                            """, [
                                json.dumps({
                                    **fallback_quest, 
                                    "createdQuestId": quest_id,
                                    "status": "completed",
                                    "message": f"Fallback quest created successfully with ID {quest_id}",
                                    "completedAt": datetime.now().isoformat()
                                }, default=datetime_handler),
                                'approved',
                                content_id
                            ])
                    except Exception as e:
                        logger.error(f"Error creating fallback quest: {str(e)}")
                        # Continue despite error in auto-creation
                
                # Return here as we've handled the failure with a fallback
                return
            
            # Parse the AI response
            try:
                content = result.get("content", "") if isinstance(result, dict) else result
                
                # Try to extract JSON from the content (handling potential text wrapping)
                content = content.strip()
                json_start = content.find('{')
                json_end = content.rfind('}')
                
                if json_start >= 0 and json_end > json_start:
                    json_content = content[json_start:json_end+1]
                    quest_data = json.loads(json_content)
                else:
                    quest_data = json.loads(content)
                
                # Validate the quest data has required fields
                if not all(k in quest_data for k in ['title', 'description', 'conditions']):
                    raise ValueError("Generated quest data is missing required fields")
                
                # Handle potential missing fields with defaults
                quest_data['difficultyLevel'] = quest_data.get('difficultyLevel', difficulty)
                quest_data['requiredPoints'] = quest_data.get('requiredPoints', points_required)
                quest_data['rewardPoints'] = quest_data.get('rewardPoints', points_reward)
                
                # Update content in the database
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE AIGeneratedContent
                        SET Content = %s, ApprovalStatus = %s
                        WHERE ContentID = %s
                    """, [
                        json.dumps({
                            **quest_data,
                            "status": "completed",
                            "message": "Quest generation completed successfully",
                            "completedAt": datetime.now().isoformat()
                        }, default=datetime_handler),
                        'completed',
                        content_id
                    ])
                
                logger.info(f"Quest generation completed successfully for content ID {content_id}")
                
                # If auto-create is enabled, create the quest immediately
                if auto_create:
                    # Create the quest
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO Quests
                            (Title, Description, RequiredPoints, RewardPoints, DifficultyLevel, 
                             IsActive, IsAIGenerated, CreationDate)
                            VALUES (%s, %s, %s, %s, %s, 1, 1, GETDATE())
                        """, [
                            quest_data['title'], 
                            quest_data['description'], 
                            quest_data['requiredPoints'], 
                            quest_data['rewardPoints'], 
                            quest_data['difficultyLevel']
                        ])
                        
                        # Get the ID in a separate query using different methods
                        try:
                            cursor.execute("SELECT @@IDENTITY")
                            quest_id_result = cursor.fetchone()
                            quest_id = quest_id_result[0] if quest_id_result else None
                            
                            if quest_id is None:
                                # Try SCOPE_IDENTITY() as an alternative
                                cursor.execute("SELECT SCOPE_IDENTITY()")
                                quest_id_result = cursor.fetchone()
                                quest_id = quest_id_result[0] if quest_id_result else None
                                
                                if quest_id is None:
                                    # Last resort: try to find the most recently created quest
                                    cursor.execute("""
                                        SELECT TOP 1 QuestID FROM Quests 
                                        WHERE Title = %s AND Description = %s
                                        ORDER BY CreationDate DESC
                                    """, [
                                        quest_data['title'], 
                                        quest_data['description']
                                    ])
                                    quest_id_result = cursor.fetchone()
                                    quest_id = quest_id_result[0] if quest_id_result else None
                        except Exception as id_error:
                            logger.error(f"Error retrieving quest ID: {str(id_error)}")
                            quest_id = None
                        
                        if not quest_id:
                            logger.error("Failed to get quest ID after insert, quest conditions will not be saved")
                        else:
                            logger.info(f"Successfully created quest with ID {quest_id}, adding conditions")
                            
                            # Add quest conditions
                            condition_count = 0
                            
                            # Build a single bulk insert for all conditions
                            if quest_data.get('conditions', []):
                                try:
                                    # Prepare values for bulk insert
                                    condition_values = []
                                    value_params = []
                                    
                                    for i, condition in enumerate(quest_data.get('conditions', [])):
                                        # Ensure targetId is an integer or NULL
                                        target_id = condition.get('targetId')
                                        if target_id is not None:
                                            try:
                                                target_id = int(target_id)
                                            except (ValueError, TypeError):
                                                # If conversion fails, log the issue and set to NULL
                                                logger.warning(f"Invalid targetId (not an integer): {target_id}, setting to NULL")
                                                target_id = None
                                        
                                        condition_type = condition.get('type', 'generic')
                                        target_value = condition.get('targetValue', 1)
                                        description = condition.get('description', '')
                                        
                                        # Add to parameters
                                        value_params.extend([
                                            quest_id, 
                                            condition_type, 
                                            target_id, 
                                            target_value, 
                                            description
                                        ])
                                        
                                        # Add placeholder
                                        condition_values.append(f"(%s, %s, %s, %s, %s)")
                                        condition_count += 1
                                    
                                    if condition_values:
                                        # Create bulk insert statement
                                        sql = f"""
                                            INSERT INTO QuestConditions
                                            (QuestID, ConditionType, TargetID, TargetValue, Description)
                                            VALUES {', '.join(condition_values)}
                                        """
                                        
                                        cursor.execute(sql, value_params)
                                        logger.info(f"Bulk inserted {condition_count} conditions for quest {quest_id}")
                                except Exception as condition_error:
                                    logger.error(f"Error bulk adding quest conditions: {str(condition_error)}")
                            
                            logger.info(f"Added {condition_count} conditions to quest {quest_id}")
                        
                        # Update content to include created quest ID and completion message
                        cursor.execute("""
                            UPDATE AIGeneratedContent
                            SET Content = %s, ApprovalStatus = %s, ApprovalDate = GETDATE(), ApprovedBy = NULL
                            WHERE ContentID = %s
                        """, [
                            json.dumps({
                                **quest_data, 
                                "createdQuestId": quest_id,
                                "status": "completed",
                                "message": f"Quest created successfully with ID {quest_id}",
                                "completedAt": datetime.now().isoformat()
                            }, default=datetime_handler),
                            'approved',
                            content_id
                        ])
                
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Error parsing AI response: {str(e)}")
                
                # Update status to 'failed'
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE AIGeneratedContent
                        SET Content = %s, ApprovalStatus = %s
                        WHERE ContentID = %s
                    """, [
                        json.dumps({
                            "status": "failed", 
                            "error": f"Failed to parse AI response: {str(e)}",
                            "raw_response": content,
                            "errorDetails": traceback.format_exc()
                        }),
                        'failed',
                        content_id
                    ])
            
        except Exception as e:
            logger.error(f"Error in quest generation: {str(e)}")
            
            # Update status to 'failed'
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE AIGeneratedContent
                    SET Content = %s, ApprovalStatus = %s
                    WHERE ContentID = %s
                """, [
                    json.dumps({
                        "status": "failed", 
                        "error": str(e),
                        "errorDetails": traceback.format_exc()
                    }),
                    'failed',
                    content_id
                ])
    
    except Exception as e:
        logger.error(f"Unexpected error in background quest generation: {str(e)}")
        
        try:
            # Update status to 'failed'
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE AIGeneratedContent
                    SET Content = %s, ApprovalStatus = %s
                    WHERE ContentID = %s
                """, [
                    json.dumps({
                        "status": "failed", 
                        "error": f"Unexpected error: {str(e)}",
                        "errorDetails": traceback.format_exc()
                    }, default=datetime_handler),
                    'failed',
                    content_id
                ])
        except Exception as db_error:
            logger.error(f"Failed to update error status: {str(db_error)}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quest_generation_status(request, content_id):
    """Get the status of a quest generation task"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can check quest generation status'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get content
        cursor.execute("""
            SELECT ContentID, ContentType, Content, GenerationParams, CreationDate, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentID = %s AND ContentType = 'quest'
        """, [content_id])
        
        row = cursor.fetchone()
        if not row:
            return Response({'error': 'Quest generation task not found'}, status=status.HTTP_404_NOT_FOUND)
        
        columns = [col[0] for col in cursor.description]
        content = dict(zip(columns, row))
        
        # Parse JSON data
        try:
            content['Content'] = json.loads(content['Content'])
        except json.JSONDecodeError:
            content['Content'] = {'status': 'error', 'message': 'Invalid content format'}
            
        try:
            content['GenerationParams'] = json.loads(content['GenerationParams'])
        except json.JSONDecodeError:
            content['GenerationParams'] = {}
        
        # Format response
        response_data = {
            'contentId': content['ContentID'],
            'status': content['ApprovalStatus'],
            'creationDate': content['CreationDate'],
            'content': content['Content'],
            'generationParams': content['GenerationParams']
        }
        
        return Response(response_data)

@api_view(['POST'])
@permission_classes([AllowAny])
def transcribe_audio(request):
    """Transcribe audio from a file or URL"""
    try:
        data = request.data
        
        if 'url' in data:
            # Download audio from URL first
            from .transcriber import download_audio, transcribe_audio as transcribe
            
            audio_path = download_audio(data['url'])
            transcript = transcribe(audio_path)
            
            # Cleanup downloaded file
            try:
                import os
                os.remove(audio_path)
            except:
                pass
                
            return Response({
                'success': True,
                'transcript': transcript
            })
        else:
            return Response({
                'error': 'No URL provided'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quest_queue(request):
    """Get the list of queued quests"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can view quest queue'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Get all queued and recently completed quests from AIGeneratedContent
        cursor.execute("""
            SELECT ContentID, ContentType, Content, GenerationParams, CreationDate, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentType = 'quest' AND ApprovalStatus IN ('queued', 'processing', 'completed')
            ORDER BY CASE 
                WHEN ApprovalStatus = 'queued' THEN 1
                WHEN ApprovalStatus = 'processing' THEN 2
                ELSE 3
            END, CreationDate ASC
        """)
        
        columns = [col[0] for col in cursor.description]
        queue_items = []
        
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            
            # Parse JSON fields
            try:
                item['Content'] = json.loads(item['Content'])
            except json.JSONDecodeError:
                item['Content'] = {'status': 'error', 'message': 'Invalid content format'}
                
            try:
                item['GenerationParams'] = json.loads(item['GenerationParams'])
            except json.JSONDecodeError:
                item['GenerationParams'] = {}
            
            queue_items.append({
                'contentId': item['ContentID'],
                'status': item['ApprovalStatus'],
                'creationDate': item['CreationDate'],
                'content': item['Content'],
                'generationParams': item['GenerationParams']
            })
        
        # Also include items that are failed or completed but recent (last 24 hours)
        cursor.execute("""
            SELECT ContentID, ContentType, Content, GenerationParams, CreationDate, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentType = 'quest' 
            AND ApprovalStatus IN ('failed', 'pending', 'approved')
            AND CreationDate > DATEADD(day, -1, GETDATE())
            ORDER BY CreationDate DESC
        """)
        
        recent_items = []
        for row in cursor.fetchall():
            item = dict(zip(columns, row))
            
            # Parse JSON fields
            try:
                item['Content'] = json.loads(item['Content'])
            except json.JSONDecodeError:
                item['Content'] = {'status': 'error', 'message': 'Invalid content format'}
                
            try:
                item['GenerationParams'] = json.loads(item['GenerationParams'])
            except json.JSONDecodeError:
                item['GenerationParams'] = {}
            
            recent_items.append({
                'contentId': item['ContentID'],
                'status': item['ApprovalStatus'],
                'creationDate': item['CreationDate'],
                'content': item['Content'],
                'generationParams': item['GenerationParams']
            })
        
        return Response({
            'queue': queue_items,
            'recent': recent_items
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_quest_queue(request):
    """Add a quest generation task to the queue without immediately processing it"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can add to quest queue'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Get parameters
    difficulty = request.data.get('difficulty', 'intermediate')
    category = request.data.get('category', 'General Learning')
    points_required = request.data.get('pointsRequired', 0)
    points_reward = request.data.get('pointsReward', 50)
    auto_create = request.data.get('autoCreate', False)
    
    # Get database content for quest generation
    database_data = get_quest_database_data()
    
    if not database_data:
        return Response({
            'error': 'Insufficient database content',
            'details': 'Not enough courses, quizzes or videos in database to generate meaningful quests'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Prepare generation parameters
    generation_params = {
        'difficulty': difficulty,
        'category': category,
        'points_required': points_required,
        'points_reward': points_reward,
        'auto_create': auto_create,
        'database_data': database_data
    }
    
    try:
        with connection.cursor() as cursor:
            # Create a placeholder entry in AIGeneratedContent
            cursor.execute("""
                INSERT INTO AIGeneratedContent
                (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
                VALUES ('quest', %s, %s, GETDATE(), 'queued')
            """, [
                json.dumps({"status": "queued", "message": "Quest queued for generation"}),
                json.dumps(generation_params)
            ])
            
            # Get the content ID
            cursor.execute("SELECT @@IDENTITY")
            content_id_result = cursor.fetchone()
            
            # Debug logging
            print(f"DEBUG: Raw content_id_result: {content_id_result}")
            
            # Handle potential None result properly
            if content_id_result is None or content_id_result[0] is None:
                # Try alternative method to get the ID
                cursor.execute("""
                    SELECT TOP 1 ContentID FROM AIGeneratedContent 
                    WHERE ContentType = 'quest' 
                    ORDER BY CreationDate DESC
                """)
                content_id_result = cursor.fetchone()
                print(f"DEBUG: Alternative query result: {content_id_result}")
                
                if content_id_result is None or content_id_result[0] is None:
                    raise Exception("Failed to retrieve content ID after insertion")
            
            # Convert to int only if we have a valid value
            content_id = int(float(content_id_result[0])) if content_id_result and content_id_result[0] is not None else None
            
            # Debug logging
            print(f"DEBUG: Generated content_id: {content_id}, type: {type(content_id)}")
            
            # Verify content_id exists in the database
            if content_id is not None:
                cursor.execute("""
                    SELECT ContentID FROM AIGeneratedContent WHERE ContentID = %s
                """, [content_id])
                verify_id = cursor.fetchone()
                print(f"DEBUG: Verification query result: {verify_id}")
                
                if verify_id is None:
                    raise Exception(f"Verification failed - ContentID {content_id} not found in database")
            else:
                raise Exception("Failed to generate a valid content ID")
            
    except Exception as db_error:
        print(f"DEBUG: Database error in add_to_quest_queue: {str(db_error)}")
        logger.error(f"Database error in add_to_quest_queue: {str(db_error)}")
        return Response({
            'error': f'Database error: {str(db_error)}',
            'details': 'Error while creating queue entry'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    response_data = {
        'message': 'Quest added to generation queue',
        'contentId': content_id,
        'status': 'queued'
    }
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_quest_queue(request):
    """Process the next item in the quest generation queue"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can process quest queue'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Find the next queued item
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT TOP 1 ContentID, Content, GenerationParams
            FROM AIGeneratedContent
            WHERE ContentType = 'quest' AND ApprovalStatus = 'queued'
            ORDER BY CreationDate ASC
        """)
        
        row = cursor.fetchone()
        if not row:
            return Response({'message': 'No quests in queue to process'})
        
        content_id = row[0]
        
        try:
            generation_params = json.loads(row[2])
        except json.JSONDecodeError:
            return Response({
                'error': 'Invalid generation parameters',
                'contentId': content_id
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Start a background thread to process the quest generation
    thread = threading.Thread(
        target=process_quest_generation_background,
        args=(content_id, generation_params)
    )
    thread.daemon = True
    thread.start()
    
    return Response({
        'message': 'Quest generation started',
        'contentId': content_id,
        'status': 'processing'
    })

# Add this function to help with quest generation
def get_quest_database_data():
    """Gather database content for quest generation"""
    database_data = {
        'popular_courses': [],
        'recent_quizzes': [],
        'popular_videos': [],
        'available_nfts': []
    }
    
    try:
        with connection.cursor() as cursor:
            # Get popular courses
            try:
                cursor.execute("""
                    SELECT TOP 10 c.CourseID, c.Title, c.Description, c.Difficulty, c.CreationDate,
                          COUNT(uce.EnrollmentID) as EnrollmentCount
                    FROM Courses c
                    LEFT JOIN UserCourseEnrollments uce ON c.CourseID = uce.CourseID
                    WHERE c.IsActive = 1
                    GROUP BY c.CourseID, c.Title, c.Description, c.Difficulty, c.CreationDate
                    ORDER BY EnrollmentCount DESC, c.CreationDate DESC
                """)
                
                columns = [col[0] for col in cursor.description]
                database_data['popular_courses'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
                logger.info(f"Fetched {len(database_data['popular_courses'])} courses for quest generation")
            except Exception as e:
                logger.warning(f"Error fetching courses: {str(e)}")
            
            # Get recent quizzes
            try:
                cursor.execute("""
                    SELECT TOP 10 q.QuizID, q.Title, q.Description, q.CourseID,
                          c.Title as CourseName
                    FROM Quizzes q
                    LEFT JOIN Courses c ON q.CourseID = c.CourseID
                    WHERE q.IsActive = 1
                    ORDER BY q.QuizID DESC
                """)
                
                columns = [col[0] for col in cursor.description]
                database_data['recent_quizzes'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
                logger.info(f"Fetched {len(database_data['recent_quizzes'])} quizzes for quest generation")
            except Exception as e:
                logger.warning(f"Error fetching quizzes: {str(e)}")
            
            # Get popular videos - fixed query with proper GROUP BY
            try:
                cursor.execute("""
                    SELECT TOP 40 v.VideoID, v.Title, v.Description, cv.CourseID,
                          c.Title as CourseName, COUNT(uvv.ViewID) as ViewCount
                    FROM CourseVideos cv
                    JOIN Videos v ON cv.YouTubeVideoID = v.YouTubeVideoID
                    LEFT JOIN Courses c ON cv.CourseID = c.CourseID
                    LEFT JOIN UserVideoViews uvv ON v.VideoID = uvv.VideoID
                    WHERE v.IsActive = 1
                    GROUP BY v.VideoID, v.Title, v.Description, cv.CourseID, c.Title
                    ORDER BY COUNT(uvv.ViewID) DESC, v.VideoID DESC
                """)
                
                columns = [col[0] for col in cursor.description]
                database_data['popular_videos'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
                logger.info(f"Fetched {len(database_data['popular_videos'])} videos for quest generation")
            except Exception as e:
                logger.warning(f"Error fetching videos: {str(e)}")
            
            # Get available NFTs
            try:
                cursor.execute("""
                    SELECT NFTID, Title, Description, Rarity
                    FROM NFTs
                    WHERE IsActive = 1
                    ORDER BY NFTID DESC
                """)
                
                columns = [col[0] for col in cursor.description]
                database_data['available_nfts'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
                logger.info(f"Fetched {len(database_data['available_nfts'])} NFTs for quest generation")
            except Exception as e:
                logger.warning(f"Error fetching NFTs: {str(e)}")
            
            # Get user count for fallback
            try:
                cursor.execute("SELECT COUNT(*) FROM Users")
                database_data['user_count'] = cursor.fetchone()[0] or 0
                logger.info(f"Fetched user count: {database_data['user_count']}")
            except Exception as e:
                database_data['user_count'] = 0
                logger.warning(f"Error fetching user count: {str(e)}")

    except Exception as e:
        logger.error(f"Error fetching quest database data: {str(e)}")
        # Still return the database_data with empty arrays
    
    # Log data availability status
    logger.info(f"Database data availability - Courses: {len(database_data['popular_courses'])}, "
                f"Videos: {len(database_data['popular_videos'])}, "
                f"Quizzes: {len(database_data['recent_quizzes'])}, "
                f"NFTs: {len(database_data['available_nfts'])}")
    
    # Always return the data, even if empty
    return database_data

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_quest_status(request, content_id):
    """API endpoint to get the status of a quest generation task"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can view quest status'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Get quest status - Only fetch essential data without joins to related tables
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT ContentID, ContentType, Content, CreationDate, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentID = %s
        """, [content_id])
        
        row = cursor.fetchone()
        if not row:
            return Response({'error': 'Quest content not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_id, content_type, content_json, creation_date, approval_status = row
        
        # Parse content if available
        try:
            content = json.loads(content_json) if content_json else {}
        except json.JSONDecodeError:
            return Response({
                'error': 'Invalid JSON content',
                'contentId': content_id,
                'status': approval_status
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Only fetch additional details if the quest is completed or approved
        # to avoid unnecessary database queries during processing
        quest = None
        nft = None
        
        if approval_status in ['completed', 'approved']:
            # Get additional details only when necessary (quest completed)
            quest_id = content.get('questId') or content.get('createdQuestId')
            if quest_id:
                cursor.execute("""
                    SELECT QuestID, Title, Description
                    FROM Quests
                    WHERE QuestID = %s
                """, [quest_id])
                
                quest_row = cursor.fetchone()
                if quest_row:
                    quest = {
                        'id': quest_row[0],
                        'title': quest_row[1],
                        'description': quest_row[2]
                    }
        
        # Construct response - minimal data during processing
        response_data = {
            'contentId': content_id,
            'status': approval_status,
            'creationDate': creation_date.isoformat() if creation_date else None,
            'content': content
        }
        
        # Only include quest data if it exists
        if quest:
            response_data['quest'] = quest
        
        return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quest_queue(request):
    """Get the AI quest generation queue"""
    user_id = request.user.id
    
    # Check if user is admin
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can view the quest queue'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get queue data - use minimal data selection to reduce load
        cursor.execute("""
            SELECT ContentID, CreationDate, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentType = 'quest' AND ApprovalStatus IN ('queued', 'processing', 'completed', 'failed')
            ORDER BY CreationDate DESC
        """)
        
        queue_items = []
        for row in cursor.fetchall():
            content_id = row[0]
            creation_date = row[1]
            approval_status = row[2]
            
            # Only include basic information in the list view
            queue_items.append({
                "contentId": content_id,
                "status": approval_status,
                "creationDate": creation_date.isoformat() if creation_date else None
            })
        
        return Response({
            "queueItems": queue_items,
            "queueCount": len(queue_items)
        })

def create_fallback_quest(database_data, difficulty, category, points_required, points_reward):
    """Creates a simple fallback quest when there isn't enough database data"""
    logger.info("Creating fallback quest")
    
    # Extract available data for quest components
    available_courses = database_data.get('popular_courses', [])
    available_quizzes = database_data.get('recent_quizzes', [])
    available_videos = database_data.get('popular_videos', [])
    available_nfts = database_data.get('available_nfts', [])
    user_count = database_data.get('user_count', 0)
    
    # Default title templates based on difficulty
    title_templates = {
        "beginner": [
            "Learning Explorer: Start Your Journey",
            "Knowledge Seeker: First Steps",
            "Educational Adventurer: Getting Started",
            "Wisdom Path: Beginner's Route"
        ],
        "intermediate": [
            "Knowledge Enhancer: Skill Building Challenge",
            "Learning Accelerator: Mid-Level Quest",
            "Education Master: Intermediate Path",
            "Skill Booster: Advancing Your Knowledge"
        ],
        "advanced": [
            "Expert Challenger: Advanced Learning Path",
            "Knowledge Mastery: Expert-Level Quest",
            "Wisdom Summit: Advanced Learning Journey",
            "Ultimate Scholar: High-Level Challenge"
        ]
    }
    
    # Default description templates
    description_templates = {
        "beginner": [
            "Begin your learning journey by completing these introductory activities. Perfect for newcomers looking to build a foundation of knowledge.",
            "Take your first steps on the path to knowledge. This beginner-friendly quest will introduce you to essential concepts."
        ],
        "intermediate": [
            "Ready for a challenge? This intermediate quest will test your growing knowledge and help you build more advanced skills.",
            "Designed for those with some experience, this quest will help you strengthen your understanding and tackle more complex concepts."
        ],
        "advanced": [
            "Put your expertise to the test with this advanced quest. Only those with significant knowledge should attempt this challenging journey.",
            "The ultimate challenge for experienced learners. This advanced quest requires deep understanding and refined skills."
        ]
    }
    
    # Normalize difficulty to match our templates
    norm_difficulty = difficulty.lower()
    if norm_difficulty not in title_templates:
        if norm_difficulty in ["easy", "basic"]:
            norm_difficulty = "beginner"
        elif norm_difficulty in ["hard", "expert"]:
            norm_difficulty = "advanced"
        else:
            norm_difficulty = "intermediate"
    
    # Select random templates
    title = random.choice(title_templates[norm_difficulty])
    description = random.choice(description_templates[norm_difficulty])
    
    # Personalize with category if provided
    if category and category != "General Learning":
        title = f"{title}: {category} Edition"
        description = f"{description} Focus area: {category}."
    
    # Create base quest data
    quest_data = {
        "title": title,
        "description": description,
        "difficultyLevel": norm_difficulty.capitalize(),
        "requiredPoints": points_required,
        "rewardPoints": points_reward,
        "conditions": []
    }
    
    # Try to create at least one valid condition based on available data
    conditions = []
    
    # Add login condition
    conditions.append({
        "type": "login",
        "targetId": None,
        "targetValue": 5,
        "description": "Log in to the platform for 5 days"
    })
    
    # Add profile completion if we have users
    if user_count > 0:
        conditions.append({
            "type": "profile",
            "targetId": None,
            "targetValue": 1,
            "description": "Complete your user profile"
        })
    
    # Try to add course-related condition if available
    if available_courses:
        course = random.choice(available_courses)
        conditions.append({
            "type": "course_enroll",
            "targetId": course.get('CourseID', 1),
            "targetValue": 1,
            "description": f"Enroll in the course: {course.get('Title', 'Any course')}"
        })
    else:
        # Generic course condition
        conditions.append({
            "type": "course_enroll",
            "targetId": None,
            "targetValue": 1,
            "description": "Enroll in any course"
        })
    
    # Try to add video-related condition if available
    if available_videos:
        video = random.choice(available_videos)
        conditions.append({
            "type": "video_watch",
            "targetId": video.get('VideoID', 1),
            "targetValue": 1,
            "description": f"Watch the video: {video.get('Title', 'Any video')}"
        })
    else:
        # Generic video condition
        conditions.append({
            "type": "video_watch",
            "targetId": None,
            "targetValue": 3,
            "description": "Watch any 3 videos"
        })
    
    # Try to add quiz-related condition if available
    if available_quizzes:
        quiz = random.choice(available_quizzes)
        conditions.append({
            "type": "quiz_complete",
            "targetId": quiz.get('QuizID', 1),
            "targetValue": 1,
            "description": f"Complete the quiz: {quiz.get('Title', 'Any quiz')}"
        })
    else:
        # Generic quiz condition
        conditions.append({
            "type": "quiz_complete",
            "targetId": None,
            "targetValue": 1,
            "description": "Complete any quiz"
        })
    
    # Pick a random subset of conditions (2-4) to keep the quest varied
    if len(conditions) > 1:
        # Always include at least 2 conditions, up to 4
        num_conditions = min(max(2, random.randint(2, 4)), len(conditions))
        selected_conditions = random.sample(conditions, num_conditions)
        quest_data["conditions"] = selected_conditions
    else:
        quest_data["conditions"] = conditions
    
    # Add a recommended NFT reward if available
    if available_nfts:
        nft = random.choice(available_nfts)
        quest_data["recommendedNFT"] = {
            "id": nft.get('NFTID', 1),
            "title": nft.get('Title', 'Knowledge Token'),
            "description": nft.get('Description', 'A token of achievement'),
            "rarity": nft.get('Rarity', 'Common')
        }
    
    logger.info(f"Created fallback quest: {quest_data['title']}")
    return quest_data