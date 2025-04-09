from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import StreamingHttpResponse
import json
import requests
from .llm import generate_response, generate_quest, generate_quiz

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_message(request):
    """Yapay zeka ile sohbet API endpoint'i"""
    user_id = request.user.id
    message = request.data.get('message')
    session_id = request.data.get('sessionId')
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with connection.cursor() as cursor:
            # Oturum kontrolü/oluşturma
            if not session_id:
                # Yeni oturum oluştur
                cursor.execute("""
                    INSERT INTO ChatSessions
                    (UserID, StartTime, IsActive)
                    VALUES (%s, GETDATE(), 1);
                    SELECT SCOPE_IDENTITY();
                """, [user_id])
                
                session_id = cursor.fetchone()[0]
            else:
                # Mevcut oturumu kontrol et
                cursor.execute("""
                    SELECT SessionID
                    FROM ChatSessions
                    WHERE SessionID = %s AND UserID = %s AND IsActive = 1
                """, [session_id, user_id])
                
                if not cursor.fetchone():
                    # Oturum bulunamadı veya aktif değil, yeni oluştur
                    cursor.execute("""
                        INSERT INTO ChatSessions
                        (UserID, StartTime, IsActive)
                        VALUES (%s, GETDATE(), 1);
                        SELECT SCOPE_IDENTITY();
                    """, [user_id])
                    
                    session_id = cursor.fetchone()[0]
            
            # Kullanıcı mesajını kaydet
            cursor.execute("""
                INSERT INTO ChatMessages
                (SessionID, SenderType, MessageContent, Timestamp)
                VALUES (%s, 'user', %s, GETDATE())
            """, [session_id, message])
        
        # Özel sistem prompt oluştur
        system_prompt = "You are Wisentia AI, an educational assistant. Help users with their educational questions and guide them through their learning journey."
        
        # llm.py dosyasındaki fonksiyonu kullan
        result = generate_response(message, system_prompt)
        
        if result['success']:
            ai_response = result['response']
            
            # Yapay zeka yanıtını kaydet
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ChatMessages
                    (SessionID, SenderType, MessageContent, Timestamp)
                    VALUES (%s, 'ai', %s, GETDATE())
                """, [session_id, ai_response])
            
            return Response({
                'message': ai_response,
                'sessionId': session_id,
                'success': True
            })
        else:
            return Response({
                'error': result.get('error', 'Unknown error'),
                'message': "Üzgünüm, şu anda isteğinizi işlemekte sorun yaşıyorum.",
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        import traceback
        return Response({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_message_stream(request):
    """Yapay zeka ile sohbet API endpoint'i (streaming)"""
    user_id = request.user.id
    message = request.data.get('message')
    session_id = request.data.get('sessionId')
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Oturum işlemleri
    try:
        with connection.cursor() as cursor:
            # Oturum kontrolü/oluşturma
            if not session_id:
                # Yeni oturum oluştur
                cursor.execute("""
                    INSERT INTO ChatSessions
                    (UserID, StartTime, IsActive)
                    VALUES (%s, GETDATE(), 1);
                    SELECT SCOPE_IDENTITY();
                """, [user_id])
                
                session_id = cursor.fetchone()[0]
            else:
                # Mevcut oturumu kontrol et
                cursor.execute("""
                    SELECT SessionID
                    FROM ChatSessions
                    WHERE SessionID = %s AND UserID = %s AND IsActive = 1
                """, [session_id, user_id])
                
                if not cursor.fetchone():
                    # Oturum bulunamadı veya aktif değil, yeni oluştur
                    cursor.execute("""
                        INSERT INTO ChatSessions
                        (UserID, StartTime, IsActive)
                        VALUES (%s, GETDATE(), 1);
                        SELECT SCOPE_IDENTITY();
                    """, [user_id])
                    
                    session_id = cursor.fetchone()[0]
            
            # Kullanıcı mesajını kaydet
            cursor.execute("""
                INSERT INTO ChatMessages
                (SessionID, SenderType, MessageContent, Timestamp)
                VALUES (%s, 'user', %s, GETDATE())
            """, [session_id, message])
        
        # Özel sistem prompt oluştur
        system_prompt = "You are Wisentia AI, an educational assistant. Help users with their educational questions and guide them through their learning journey."
        
        # Stream yanıt oluştur
        def stream_response():
            full_response = ""
            
            # llm.py'deki stream fonksiyonunu kullan
            stream_generator = generate_response(message, system_prompt, stream=True)
            
            for chunk in stream_generator:
                full_response += chunk
                yield f"data: {json.dumps({'chunk': chunk, 'sessionId': session_id})}\n\n"
            
            # Yanıt tamamlandığında veritabanına kaydet
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
    """Test için basitleştirilmiş yapay zeka sohbet API endpoint'i"""
    message = request.data.get('message')
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Özel sistem prompt oluştur
        system_prompt = "You are Wisentia AI, an educational assistant. Help users with their educational questions and guide them through their learning journey."
        
        # llm.py dosyasındaki fonksiyonu kullan
        result = generate_response(message, system_prompt)
        
        if result['success']:
            return Response({
                'message': result['response'],
                'success': True
            })
        else:
            return Response({
                'error': result.get('error', 'Unknown error'),
                'message': "Üzgünüm, şu anda isteğinizi işlemekte sorun yaşıyorum.",
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
@permission_classes([IsAuthenticated])
def get_chat_history(request, session_id=None):
    """Kullanıcının sohbet geçmişini getiren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        if session_id:
            # Belirli bir oturumun mesajlarını getir
            cursor.execute("""
                SELECT cs.SessionID
                FROM ChatSessions cs
                WHERE cs.SessionID = %s AND cs.UserID = %s
            """, [session_id, user_id])
            
            if not cursor.fetchone():
                return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
            
            cursor.execute("""
                SELECT cm.MessageID, cm.SenderType, cm.MessageContent, cm.Timestamp
                FROM ChatMessages cm
                WHERE cm.SessionID = %s
                ORDER BY cm.Timestamp
            """, [session_id])
            
            columns = [col[0] for col in cursor.description]
            messages = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            return Response({
                'sessionId': session_id,
                'messages': messages
            })
        else:
            # Tüm oturumları getir
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
            
            return Response(sessions)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_chat_session(request, session_id):
    """Sohbet oturumunu sonlandıran API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Oturumu kontrol et
        cursor.execute("""
            SELECT SessionID
            FROM ChatSessions
            WHERE SessionID = %s AND UserID = %s AND IsActive = 1
        """, [session_id, user_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Session not found or already ended'}, status=status.HTTP_404_NOT_FOUND)
        
        # Oturumu sonlandır
        cursor.execute("""
            UPDATE ChatSessions
            SET EndTime = GETDATE(), IsActive = 0
            WHERE SessionID = %s
        """, [session_id])
    
    return Response({'message': 'Chat session ended successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    """Kullanıcı için öneriler sunan API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Mevcut önerileri getir
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
            
            # Öneri tipine göre hedef bilgilerini ekle
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
    """Öneriyi reddeden API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Öneriyi kontrol et
        cursor.execute("""
            SELECT RecommendationID
            FROM AIRecommendations
            WHERE RecommendationID = %s AND UserID = %s
        """, [recommendation_id, user_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Öneriyi reddet
        cursor.execute("""
            UPDATE AIRecommendations
            SET IsDismissed = 1
            WHERE RecommendationID = %s
        """, [recommendation_id])
    
    return Response({'message': 'Recommendation dismissed successfully'})

# Admin için yapay zeka oluşturma fonksiyonları

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_quest(request):
    """Yapay zeka ile quest oluşturan API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can generate quests'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Parametereleri al
    difficulty = request.data.get('difficulty', 'intermediate')
    category = request.data.get('category', 'General Learning')
    points_required = request.data.get('pointsRequired', 100)
    points_reward = request.data.get('pointsReward')
    
    # Yapay zeka ile quest oluştur
    result = generate_quest(difficulty, category, points_required, points_reward)
    
    if not result['success']:
        return Response({
            'error': result.get('error', 'Failed to generate quest'),
            'raw_response': result.get('raw_response', '')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    quest_data = result['data']
    
    # Yapay zeka tarafından oluşturulan içeriği kaydet
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO AIGeneratedContent
            (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
            VALUES ('quest', %s, %s, GETDATE(), 'pending');
            SELECT SCOPE_IDENTITY();
        """, [
            json.dumps(quest_data),
            json.dumps({
                'difficulty': difficulty,
                'category': category,
                'points_required': points_required,
                'points_reward': points_reward
            })
        ])
        
        content_id = cursor.fetchone()[0]
    
    return Response({
        'message': 'Quest generated successfully',
        'contentId': content_id,
        'quest': quest_data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_generated_quest(request, content_id):
    """Yapay zeka tarafından oluşturulan quest'i onaylayan API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can approve quests'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Quest'i veritabanına kaydet
    with connection.cursor() as cursor:
        # İçeriği kontrol et
        cursor.execute("""
            SELECT ContentType, Content, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentID = %s
        """, [content_id])
        
        content_data = cursor.fetchone()
        
        if not content_data:
            return Response({'error': 'Generated content not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_type, content_json, approval_status = content_data
        
        if content_type != 'quest':
            return Response({'error': 'Content is not a quest'}, status=status.HTTP_400_BAD_REQUEST)
        
        if approval_status == 'approved':
            return Response({'error': 'Quest is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quest_data = json.loads(content_json)
            
            # Quest oluştur
            title = quest_data.get('title')
            description = quest_data.get('description')
            reward_points = request.data.get('rewardPoints', 50)
            required_points = request.data.get('requiredPoints', 0)
            difficulty_level = request.data.get('difficultyLevel', 'intermediate')
            
            cursor.execute("""
                INSERT INTO Quests
                (Title, Description, RequiredPoints, RewardPoints, DifficultyLevel, 
                 IsActive, IsAIGenerated, CreationDate)
                VALUES (%s, %s, %s, %s, %s, 1, 1, GETDATE());
                SELECT SCOPE_IDENTITY();
            """, [
                title, description, required_points, reward_points, difficulty_level
            ])
            
            quest_id = cursor.fetchone()[0]
            
            # Quest koşullarını ekle
            conditions = quest_data.get('conditions', [])
            for condition in conditions:
                condition_type = request.data.get('conditionType', 'total_points')
                target_id = request.data.get('targetId')
                target_value = condition.get('target_value', 1)
                condition_description = condition.get('description', '')
                
                cursor.execute("""
                    INSERT INTO QuestConditions
                    (QuestID, ConditionType, TargetID, TargetValue, Description)
                    VALUES (%s, %s, %s, %s, %s)
                """, [
                    quest_id, condition_type, target_id, target_value, condition_description
                ])
            
            # İçeriği onaylandı olarak işaretle
            cursor.execute("""
                UPDATE AIGeneratedContent
                SET ApprovalStatus = 'approved', ApprovalDate = GETDATE(), ApprovedBy = %s
                WHERE ContentID = %s
            """, [user_id, content_id])
            
            return Response({
                'message': 'Quest approved and created successfully',
                'questId': quest_id
            })
            
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON content'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_quiz(request):
    """Yapay zeka ile quiz oluşturan API endpoint'i (sadece admin)"""
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
    
    # Parametereleri al
    video_id = request.data.get('videoId')
    video_title = request.data.get('videoTitle')
    video_content = request.data.get('videoContent', '')
    num_questions = request.data.get('numQuestions', 5)
    difficulty = request.data.get('difficulty', 'intermediate')
    
    if not video_id or not video_title:
        return Response({
            'error': 'Video ID and title are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Yapay zeka ile quiz oluştur
    result = generate_quiz(video_id, video_title, video_content, num_questions, difficulty)
    
    if not result['success']:
        return Response({
            'error': result.get('error', 'Failed to generate quiz'),
            'raw_response': result.get('raw_response', '')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    quiz_data = result['data']
    
    # Yapay zeka tarafından oluşturulan içeriği kaydet
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO AIGeneratedContent
            (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
            VALUES ('quiz', %s, %s, GETDATE(), 'pending');
            SELECT SCOPE_IDENTITY();
        """, [
            json.dumps(quiz_data),
            json.dumps({
                'video_id': video_id,
                'video_title': video_title,
                'num_questions': num_questions,
                'difficulty': difficulty
            })
        ])
        
        content_id = cursor.fetchone()[0]
    
    return Response({
        'message': 'Quiz generated successfully',
        'contentId': content_id,
        'quiz': quiz_data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_generated_quiz(request, content_id):
    """Yapay zeka tarafından oluşturulan quiz'i onaylayan API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can approve quizzes'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Quiz'i veritabanına kaydet
    with connection.cursor() as cursor:
        # İçeriği kontrol et
        cursor.execute("""
            SELECT ContentType, Content, ApprovalStatus
            FROM AIGeneratedContent
            WHERE ContentID = %s
        """, [content_id])
        
        content_data = cursor.fetchone()
        
        if not content_data:
            return Response({'error': 'Generated content not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_type, content_json, approval_status = content_data
        
        if content_type != 'quiz':
            return Response({'error': 'Content is not a quiz'}, status=status.HTTP_400_BAD_REQUEST)
        
        if approval_status == 'approved':
            return Response({'error': 'Quiz is already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quiz_data = json.loads(content_json)
            
            # Quiz oluştur
            title = quiz_data.get('title')
            description = quiz_data.get('description')
            passing_score = quiz_data.get('passing_score', 70)
            video_id = quiz_data.get('video_id')
            
            cursor.execute("""
                INSERT INTO Quizzes
                (VideoID, Title, Description, PassingScore, IsActive)
                VALUES (%s, %s, %s, %s, 1);
                SELECT SCOPE_IDENTITY();
            """, [
                video_id, title, description, passing_score
            ])
            
            quiz_id = cursor.fetchone()[0]
            
            # Quiz sorularını ekle
            questions = quiz_data.get('questions', [])
            for i, question in enumerate(questions):
                question_text = question.get('question_text')
                question_type = question.get('question_type', 'multiple_choice')
                
                cursor.execute("""
                    INSERT INTO QuizQuestions
                    (QuizID, QuestionText, QuestionType, OrderInQuiz)
                    VALUES (%s, %s, %s, %s);
                    SELECT SCOPE_IDENTITY();
                """, [
                    quiz_id, question_text, question_type, i + 1
                ])
                
                question_id = cursor.fetchone()[0]
                
                # Soru seçeneklerini ekle
                options = question.get('options', [])
                for j, option in enumerate(options):
                    option_text = option.get('text')
                    is_correct = option.get('is_correct', False)
                    
                    cursor.execute("""
                        INSERT INTO QuestionOptions
                        (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                        VALUES (%s, %s, %s, %s)
                    """, [
                        question_id, option_text, is_correct, j + 1
                    ])
            
            # İçeriği onaylandı olarak işaretle
            cursor.execute("""
                UPDATE AIGeneratedContent
                SET ApprovalStatus = 'approved', ApprovalDate = GETDATE(), ApprovedBy = %s
                WHERE ContentID = %s
            """, [user_id, content_id])
            
            return Response({
                'message': 'Quiz approved and created successfully',
                'quizId': quiz_id
            })
            
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON content'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_content(request):
    """Onay bekleyen AI içerikleri listeleyen API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can view pending content'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Onay bekleyen içerikleri getir
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
            
            # JSON veriyi ayrıştır
            try:
                content['Content'] = json.loads(content['Content'])
            except json.JSONDecodeError:
                content['Content'] = content['Content']  # JSON ayrıştırılamıyorsa metni olduğu gibi tut
                
            try:
                content['GenerationParams'] = json.loads(content['GenerationParams'])
            except json.JSONDecodeError:
                content['GenerationParams'] = content['GenerationParams']  # JSON ayrıştırılamıyorsa metni olduğu gibi tut
            
            pending_contents.append(content)
    
    return Response(pending_contents)