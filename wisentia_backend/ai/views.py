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
    """AI chat API endpoint"""
    user_id = request.user.id
    message = request.data.get('message')
    session_id = request.data.get('sessionId')
    
    if not message:
        return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
    
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
        
        # Use function from llm.py
        result = generate_response(message, system_prompt)
        
        if result['success']:
            ai_response = result['response']
            
            # Save AI response
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def get_chat_history(request, session_id=None):
    """API endpoint to retrieve user's chat history"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        if session_id:
            # Get messages from a specific session
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
            
            return Response(sessions)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_chat_session(request, session_id):
    """API endpoint to end a chat session"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Check session
        cursor.execute("""
            SELECT SessionID
            FROM ChatSessions
            WHERE SessionID = %s AND UserID = %s AND IsActive = 1
        """, [session_id, user_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Session not found or already ended'}, status=status.HTTP_404_NOT_FOUND)
        
        # End session
        cursor.execute("""
            UPDATE ChatSessions
            SET EndTime = GETDATE(), IsActive = 0
            WHERE SessionID = %s
        """, [session_id])
    
    return Response({'message': 'Chat session ended successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
    
    # Save quest to database
    with connection.cursor() as cursor:
        # Check content
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
            
            # Create quest
            title = quest_data.get('title')
            description = quest_data.get('description')
            reward_points = request.data.get('rewardPoints', 50)
            required_points = request.data.get('requiredPoints', 0)
            difficulty_level = request.data.get('difficultyLevel', 'intermediate')
            
            # First, execute INSERT
            cursor.execute("""
                INSERT INTO Quests
                (Title, Description, RequiredPoints, RewardPoints, DifficultyLevel, 
                 IsActive, IsAIGenerated, CreationDate)
                VALUES (%s, %s, %s, %s, %s, 1, 1, GETDATE())
            """, [
                title, description, required_points, reward_points, difficulty_level
            ])
            
            # Then, get the ID in a separate query
            cursor.execute("SELECT SCOPE_IDENTITY()")
            quest_id = cursor.fetchone()[0]
            
            # Add quest conditions
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
            
            # Mark content as approved
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
    """API endpoint to generate quizzes with AI (admin only)"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can generate quizzes'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Get parameters
    video_id = request.data.get('videoId')
    video_title = request.data.get('videoTitle')
    video_content = request.data.get('videoContent', '')
    num_questions = request.data.get('numQuestions', 5)
    difficulty = request.data.get('difficulty', 'intermediate')
    
    if not video_id or not video_title:
        return Response({
            'error': 'Video ID and title are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate quiz with AI
    result = generate_quiz(video_id, video_title, video_content, num_questions, difficulty)
    
    if not result['success']:
        return Response({
            'error': result.get('error', 'Failed to generate quiz'),
            'raw_response': result.get('raw_response', '')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    quiz_data = result['data']
    
    # Save AI-generated content
    with connection.cursor() as cursor:
        # First, execute INSERT
        cursor.execute("""
            INSERT INTO AIGeneratedContent
            (ContentType, Content, GenerationParams, CreationDate, ApprovalStatus)
            VALUES ('quiz', %s, %s, GETDATE(), 'pending')
        """, [
            json.dumps(quiz_data),
            json.dumps({
                'video_id': video_id,
                'video_title': video_title,
                'num_questions': num_questions,
                'difficulty': difficulty
            })
        ])
        
        # Then, get the ID in a separate query
        cursor.execute("SELECT SCOPE_IDENTITY()")
        content_id = cursor.fetchone()[0]
    
    return Response({
        'message': 'Quiz generated successfully',
        'contentId': content_id,
        'quiz': quiz_data
    })

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
    
    # Save quiz to database
    with connection.cursor() as cursor:
        # Check content
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
            
            # Create quiz
            title = quiz_data.get('title')
            description = quiz_data.get('description')
            passing_score = quiz_data.get('passing_score', 70)
            video_id = quiz_data.get('video_id')
            
            # First, execute INSERT
            cursor.execute("""
                INSERT INTO Quizzes
                (VideoID, Title, Description, PassingScore, IsActive)
                VALUES (%s, %s, %s, %s, 1)
            """, [
                video_id, title, description, passing_score
            ])
            
            # Then, get the ID in a separate query
            cursor.execute("SELECT SCOPE_IDENTITY()")
            quiz_id = cursor.fetchone()[0]
            
            # Add quiz questions
            questions = quiz_data.get('questions', [])
            for i, question in enumerate(questions):
                question_text = question.get('question_text')
                question_type = question.get('question_type', 'multiple_choice')
                
                # First, execute INSERT
                cursor.execute("""
                    INSERT INTO QuizQuestions
                    (QuizID, QuestionText, QuestionType, OrderInQuiz)
                    VALUES (%s, %s, %s, %s)
                """, [
                    quiz_id, question_text, question_type, i + 1
                ])
                
                # Then, get the ID in a separate query
                cursor.execute("SELECT SCOPE_IDENTITY()")
                question_id = cursor.fetchone()[0]
                
                # Add question options
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
            
            # Mark content as approved
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