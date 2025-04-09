from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_detail(request, quiz_id):
    """Quiz detaylarını ve sorularını getiren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Quiz bilgilerini al
        cursor.execute("""
            SELECT q.QuizID, q.Title, q.Description, q.PassingScore, 
                   cv.VideoID, cv.Title as VideoTitle, c.CourseID, c.Title as CourseTitle
            FROM Quizzes q
            JOIN CourseVideos cv ON q.VideoID = cv.VideoID
            JOIN Courses c ON cv.CourseID = c.CourseID
            WHERE q.QuizID = %s AND q.IsActive = 1
        """, [quiz_id])
        
        columns = [col[0] for col in cursor.description]
        quiz_data = cursor.fetchone()
        
        if not quiz_data:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            
        quiz = dict(zip(columns, quiz_data))
        
        # Kullanıcının daha önce quiz denemesi var mı kontrol et
        cursor.execute("""
            SELECT AttemptID, Score, MaxScore, AttemptDate, Passed, EarnedPoints
            FROM UserQuizAttempts
            WHERE UserID = %s AND QuizID = %s
            ORDER BY AttemptDate DESC
        """, [user_id, quiz_id])
        
        columns = [col[0] for col in cursor.description]
        attempts = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        quiz['attempts'] = attempts
        
        # Quiz sorularını al
        cursor.execute("""
            SELECT QuestionID, QuestionText, QuestionType, OrderInQuiz
            FROM QuizQuestions
            WHERE QuizID = %s
            ORDER BY OrderInQuiz
        """, [quiz_id])
        
        columns = [col[0] for col in cursor.description]
        questions = []
        
        for row in cursor.fetchall():
            question = dict(zip(columns, row))
            question_id = question['QuestionID']
            
            # Soru seçeneklerini al
            cursor.execute("""
                SELECT OptionID, OptionText, OrderInQuestion
                FROM QuestionOptions
                WHERE QuestionID = %s
                ORDER BY OrderInQuestion
            """, [question_id])
            
            option_columns = [col[0] for col in cursor.description]
            options = [dict(zip(option_columns, option_row)) for option_row in cursor.fetchall()]
            
            question['options'] = options
            questions.append(question)
        
        quiz['questions'] = questions
    
    return Response(quiz)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_id):
    """Quiz cevaplarını kaydeden API endpoint'i"""
    user_id = request.user.id
    answers = request.data.get('answers', [])
    
    if not answers:
        return Response({'error': 'No answers provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Quiz bilgilerini al
        cursor.execute("""
            SELECT q.QuizID, q.PassingScore, cv.VideoID, c.CourseID
            FROM Quizzes q
            JOIN CourseVideos cv ON q.VideoID = cv.VideoID
            JOIN Courses c ON cv.CourseID = c.CourseID
            WHERE q.QuizID = %s AND q.IsActive = 1
        """, [quiz_id])
        
        quiz_data = cursor.fetchone()
        
        if not quiz_data:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            
        _, passing_score, video_id, course_id = quiz_data
        
        # Soru sayısını al
        cursor.execute("SELECT COUNT(*) FROM QuizQuestions WHERE QuizID = %s", [quiz_id])
        total_questions = cursor.fetchone()[0]
        
        if total_questions == 0:
            return Response({'error': 'Quiz has no questions'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Quiz denemesi oluştur
        cursor.execute("""
            INSERT INTO UserQuizAttempts (UserID, QuizID, Score, MaxScore, AttemptDate, Passed, EarnedPoints)
            VALUES (%s, %s, 0, %s, GETDATE(), 0, 0);
            SELECT SCOPE_IDENTITY();
        """, [user_id, quiz_id, total_questions])
        
        attempt_id = cursor.fetchone()[0]
        
        # Cevapları işle ve doğru sayısını hesapla
        correct_count = 0
        
        for answer in answers:
            question_id = answer.get('questionId')
            selected_option_id = answer.get('selectedOptionId')
            text_answer = answer.get('textAnswer')
            
            # Soru geçerliliğini kontrol et
            cursor.execute("""
                SELECT QuestionType FROM QuizQuestions
                WHERE QuestionID = %s AND QuizID = %s
            """, [question_id, quiz_id])
            
            question_data = cursor.fetchone()
            
            if not question_data:
                continue  # Geçersiz soru, atla
            
            question_type = question_data[0]
            is_correct = False
            
            if question_type in ('multiple_choice', 'true_false'):
                # Cevabın doğruluğunu kontrol et
                cursor.execute("""
                    SELECT IsCorrect FROM QuestionOptions
                    WHERE OptionID = %s AND QuestionID = %s
                """, [selected_option_id, question_id])
                
                option_data = cursor.fetchone()
                is_correct = option_data[0] if option_data else False
                
                # Cevabı kaydet
                cursor.execute("""
                    INSERT INTO UserQuizAnswers 
                    (AttemptID, QuestionID, SelectedOptionID, IsCorrect)
                    VALUES (%s, %s, %s, %s)
                """, [attempt_id, question_id, selected_option_id, is_correct])
            
            elif question_type == 'short_answer':
                # Kısa cevaplı sorular için değerlendirme
                # Burada basit bir kontrol yapıyoruz, gerçek uygulamada 
                # daha gelişmiş bir değerlendirme mekanizması kullanabilirsiniz
                
                cursor.execute("""
                    SELECT OptionText FROM QuestionOptions
                    WHERE QuestionID = %s AND IsCorrect = 1
                    LIMIT 1
                """, [question_id])
                
                correct_answer_data = cursor.fetchone()
                correct_answer = correct_answer_data[0] if correct_answer_data else ''
                
                # Basit karşılaştırma (case-insensitive)
                is_correct = correct_answer.lower() == text_answer.lower() if text_answer else False
                
                # Cevabı kaydet
                cursor.execute("""
                    INSERT INTO UserQuizAnswers 
                    (AttemptID, QuestionID, TextAnswer, IsCorrect)
                    VALUES (%s, %s, %s, %s)
                """, [attempt_id, question_id, text_answer, is_correct])
            
            if is_correct:
                correct_count += 1
        
        # Toplam skoru ve geçme durumunu hesapla
        score_percentage = (correct_count / total_questions) * 100
        passed = score_percentage >= passing_score
        
        # Puanları hesapla
        earned_points = 0
        if passed:
            # Quiz zorluğuna göre dinamik puanlama
            cursor.execute("""
                SELECT c.Difficulty
                FROM Courses c
                WHERE c.CourseID = %s
            """, [course_id])
            
            difficulty_data = cursor.fetchone()
            difficulty = difficulty_data[0] if difficulty_data else 'beginner'
            
            # Zorluk seviyesine ve geçiş skoruna göre puan hesapla
            difficulty_multiplier = {
                'beginner': 1.0,
                'intermediate': 1.5,
                'advanced': 2.0
            }.get(difficulty.lower(), 1.0)
            
            # Temel puan (20) + skor performansı * zorluk çarpanı
            score_ratio = score_percentage / 100
            earned_points = int(20 + (score_ratio * 30) * difficulty_multiplier)
        
        # Quiz denemesini güncelle
        cursor.execute("""
            UPDATE UserQuizAttempts
            SET Score = %s, Passed = %s, EarnedPoints = %s
            WHERE AttemptID = %s
        """, [correct_count, passed, earned_points, attempt_id])
        
        # Kullanıcı puanlarını güncelle
        if earned_points > 0:
            cursor.execute("""
                UPDATE Users
                SET TotalPoints = TotalPoints + %s
                WHERE UserID = %s
            """, [earned_points, user_id])
        
        # Sonuçları hazırla
        result = {
            'attemptId': attempt_id,
            'score': correct_count,
            'maxScore': total_questions,
            'scorePercentage': score_percentage,
            'passed': passed,
            'earnedPoints': earned_points
        }
    
    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_results(request, attempt_id):
    """Quiz deneme sonuçlarını gösteren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Denemeyi kontrol et
        cursor.execute("""
            SELECT ua.AttemptID, ua.QuizID, ua.Score, ua.MaxScore, 
                   ua.AttemptDate, ua.Passed, ua.EarnedPoints,
                   q.Title as QuizTitle, q.PassingScore
            FROM UserQuizAttempts ua
            JOIN Quizzes q ON ua.QuizID = q.QuizID
            WHERE ua.AttemptID = %s AND ua.UserID = %s
        """, [attempt_id, user_id])
        
        columns = [col[0] for col in cursor.description]
        attempt_data = cursor.fetchone()
        
        if not attempt_data:
            return Response({'error': 'Quiz attempt not found'}, status=status.HTTP_404_NOT_FOUND)
            
        attempt = dict(zip(columns, attempt_data))
        quiz_id = attempt['QuizID']
        
        # Sorular ve kullanıcı cevaplarını al
        cursor.execute("""
            SELECT qq.QuestionID, qq.QuestionText, qq.QuestionType, qq.OrderInQuiz,
                   uqa.SelectedOptionID, uqa.TextAnswer, uqa.IsCorrect
            FROM QuizQuestions qq
            LEFT JOIN UserQuizAnswers uqa ON qq.QuestionID = uqa.QuestionID AND uqa.AttemptID = %s
            WHERE qq.QuizID = %s
            ORDER BY qq.OrderInQuiz
        """, [attempt_id, quiz_id])
        
        columns = [col[0] for col in cursor.description]
        questions = []
        
        for row in cursor.fetchall():
            question = dict(zip(columns, row))
            question_id = question['QuestionID']
            
            # Tüm seçenekleri al
            cursor.execute("""
                SELECT OptionID, OptionText, IsCorrect, OrderInQuestion
                FROM QuestionOptions
                WHERE QuestionID = %s
                ORDER BY OrderInQuestion
            """, [question_id])
            
            option_columns = [col[0] for col in cursor.description]
            options = [dict(zip(option_columns, option_row)) for option_row in cursor.fetchall()]
            
            question['options'] = options
            questions.append(question)
        
        attempt['questions'] = questions
    
    return Response(attempt)