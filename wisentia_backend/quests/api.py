from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import datetime

def dictfetchall(cursor):
    """Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@api_view(['GET'])
@permission_classes([AllowAny])
def quest_list(request):
    """Görevleri listeler, filtreleme seçenekleri ile"""
    category_id = request.query_params.get('category_id')
    education_level = request.query_params.get('education_level')
    is_active = request.query_params.get('is_active')
    
    query = """
        SELECT q.QuestID, q.Title, q.Description, q.CategoryID, cat.Name as CategoryName,
               q.EducationLevel, q.DifficultyLevel, q.Points, q.TimeLimitMinutes, 
               q.IsActive, q.StartDate, q.EndDate
        FROM Quests q
        JOIN Categories cat ON q.CategoryID = cat.CategoryID
        WHERE 1=1
    """
    params = []
    
    if category_id:
        query += " AND q.CategoryID = %s"
        params.append(category_id)
    
    if education_level:
        query += " AND q.EducationLevel = %s"
        params.append(education_level)
        
    if is_active is not None:
        is_active_val = 1 if is_active.lower() == 'true' else 0
        query += " AND q.IsActive = %s"
        params.append(is_active_val)
    
    # Varsayılan olarak sadece aktif görevleri göster
    else:
        query += " AND q.IsActive = 1"
    
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        quests = dictfetchall(cursor)
    
    return Response(quests)

@api_view(['GET'])
@permission_classes([AllowAny])
def quest_detail(request, quest_id):
    """Belirli bir görevin detaylarını döndürür"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT q.QuestID, q.Title, q.Description, q.CategoryID, cat.Name as CategoryName,
                   q.EducationLevel, q.DifficultyLevel, q.Points, q.TimeLimitMinutes, 
                   q.IsActive, q.StartDate, q.EndDate, q.CreatedAt
            FROM Quests q
            JOIN Categories cat ON q.CategoryID = cat.CategoryID
            WHERE q.QuestID = %s
        """, [quest_id])
        
        quests = dictfetchall(cursor)
        
        if not quests:
            return Response({"error": "Quest not found"}, status=status.HTTP_404_NOT_FOUND)
        
        quest = quests[0]
        
        # Görevin sorularını al
        cursor.execute("""
            SELECT QuestionID, QuestionText, DifficultyLevel, Points, Explanation
            FROM Questions
            WHERE QuestID = %s
        """, [quest_id])
        
        questions = dictfetchall(cursor)
        
        # Soruların seçeneklerini getir
        for question in questions:
            cursor.execute("""
                SELECT OptionID, OptionText, IsCorrect, Sequence
                FROM QuestionOptions
                WHERE QuestionID = %s
                ORDER BY Sequence
            """, [question['QuestionID']])
            
            options = dictfetchall(cursor)
            question['options'] = options
        
        quest['questions'] = questions
    
    return Response(quest)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_quest(request, quest_id):
    """Kullanıcının görevi başlatmasını kaydeder"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Görevin var olup olmadığını ve aktif olup olmadığını kontrol et
        cursor.execute("""
            SELECT QuestID, IsActive FROM Quests WHERE QuestID = %s
        """, [quest_id])
        
        quest = cursor.fetchone()
        if not quest:
            return Response({"error": "Quest not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not quest[1]:  # IsActive değeri
            return Response({"error": "Quest is not active"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Kullanıcının bu görevi daha önce tamamlayıp tamamlamadığını kontrol et
        cursor.execute("""
            SELECT IsCompleted FROM UserQuestProgress 
            WHERE UserID = %s AND QuestID = %s
        """, [user_id, quest_id])
        
        user_progress = cursor.fetchone()
        if user_progress and user_progress[0]:  # Tamamlanmış
            return Response({"error": "Quest already completed"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Görevi başlat veya ilerlemeyi sıfırla
        cursor.execute("""
            IF EXISTS (SELECT 1 FROM UserQuestProgress WHERE UserID = %s AND QuestID = %s)
                UPDATE UserQuestProgress
                SET ProgressPercentage = 0,
                    Score = 0,
                    IsCompleted = 0,
                    CompletionTimeSeconds = NULL,
                    CompletedAt = NULL,
                    StartedAt = %s
                WHERE UserID = %s AND QuestID = %s
            ELSE
                INSERT INTO UserQuestProgress 
                (UserID, QuestID, ProgressPercentage, Score, IsCompleted, StartedAt)
                VALUES (%s, %s, 0, 0, 0, %s)
        """, [
            user_id, quest_id, 
            datetime.datetime.now(),
            user_id, quest_id,
            user_id, quest_id, datetime.datetime.now()
        ])
    
    return Response({"message": "Quest started successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quest(request, quest_id):
    """Kullanıcının görev yanıtlarını işler ve ilerlemeyi günceller"""
    user_id = request.user.id
    answers = request.data.get('answers', [])  # [{question_id: X, option_id: Y}, ...]
    completion_time = request.data.get('completion_time')  # saniye cinsinden
    
    if not answers:
        return Response({"error": "No answers provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Görevin var olup olmadığını kontrol et
        cursor.execute("""
            SELECT COUNT(*) FROM Quests WHERE QuestID = %s
        """, [quest_id])
        
        if cursor.fetchone()[0] == 0:
            return Response({"error": "Quest not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Her cevabı işle
        total_points = 0
        correct_answers = 0
        total_questions = len(answers)
        
        for answer in answers:
            question_id = answer.get('question_id')
            option_id = answer.get('option_id')
            
            if not question_id or not option_id:
                continue
            
            # Seçeneğin doğru olup olmadığını kontrol et
            cursor.execute("""
                SELECT IsCorrect, q.Points 
                FROM QuestionOptions o
                JOIN Questions q ON o.QuestionID = q.QuestionID
                WHERE o.OptionID = %s AND o.QuestionID = %s
            """, [option_id, question_id])
            
            result = cursor.fetchone()
            if not result:
                continue
            
            is_correct = result[0]
            question_points = result[1]
            
            # Cevabı kaydet
            points_earned = question_points if is_correct else 0
            
            if is_correct:
                correct_answers += 1
                total_points += points_earned
            
            # UserQuestionAnswers tablosuna kaydet
            cursor.execute("""
                IF EXISTS (SELECT 1 FROM UserQuestionAnswers WHERE UserID = %s AND QuestionID = %s)
                    UPDATE UserQuestionAnswers
                    SET SelectedOptionID = %s,
                        IsCorrect = %s,
                        PointsEarned = %s,
                        AnsweredAt = %s
                    WHERE UserID = %s AND QuestionID = %s
                ELSE
                    INSERT INTO UserQuestionAnswers 
                    (UserID, QuestionID, SelectedOptionID, IsCorrect, PointsEarned, AnsweredAt)
                    VALUES (%s, %s, %s, %s, %s, %s)
            """, [
                user_id, question_id,
                option_id, is_correct, points_earned, datetime.datetime.now(),
                user_id, question_id,
                user_id, question_id, option_id, is_correct, points_earned, datetime.datetime.now()
            ])
        
        # Görev ilerlemesini güncelle
        progress_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        is_completed = True
        completed_at = datetime.datetime.now()
        
        cursor.execute("""
            UPDATE UserQuestProgress
            SET ProgressPercentage = %s,
                Score = %s,
                CompletionTimeSeconds = %s,
                IsCompleted = %s,
                CompletedAt = %s
            WHERE UserID = %s AND QuestID = %s
        """, [
            progress_percentage, total_points, completion_time,
            is_completed, completed_at,
            user_id, quest_id
        ])
        
        # Kullanıcının puanlarını güncelle
        cursor.execute("""
            UPDATE Users
            SET Points = Points + %s
            WHERE UserID = %s
        """, [total_points, user_id])
        
    return Response({
        "message": "Quest submitted successfully",
        "score": total_points,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "progress_percentage": progress_percentage
    })