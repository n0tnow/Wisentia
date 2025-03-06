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
def category_list(request):
    """Tüm kategorileri listeler"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT CategoryID, Name, Description, EducationLevel, IconURL
            FROM Categories
        """)
        categories = dictfetchall(cursor)
    return Response(categories)

@api_view(['GET'])
@permission_classes([AllowAny])
def course_list(request):
    """Kursları listeler, filtreleme seçenekleri ile"""
    category_id = request.query_params.get('category_id')
    education_level = request.query_params.get('education_level')
    
    query = """
        SELECT c.CourseID, c.Title, c.Description, c.CategoryID, cat.Name as CategoryName,
               c.EducationLevel, c.DifficultyLevel, c.DurationMinutes, c.Points, c.Price, c.IsPremium
        FROM Courses c
        JOIN Categories cat ON c.CategoryID = cat.CategoryID
        WHERE 1=1
    """
    params = []
    
    if category_id:
        query += " AND c.CategoryID = %s"
        params.append(category_id)
    
    if education_level:
        query += " AND c.EducationLevel = %s"
        params.append(education_level)
    
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        courses = dictfetchall(cursor)
    
    return Response(courses)

@api_view(['GET'])
@permission_classes([AllowAny])
def course_detail(request, course_id):
    """Belirli bir kursun detaylarını döndürür"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT c.CourseID, c.Title, c.Description, c.CategoryID, cat.Name as CategoryName,
                   c.EducationLevel, c.DifficultyLevel, c.DurationMinutes, c.Points, c.Price, 
                   c.IsPremium, c.CreatedAt
            FROM Courses c
            JOIN Categories cat ON c.CategoryID = cat.CategoryID
            WHERE c.CourseID = %s
        """, [course_id])
        
        courses = dictfetchall(cursor)
        
        if not courses:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        course = courses[0]
        
        # Kursun içeriklerini al
        cursor.execute("""
            SELECT ContentID, Title, ContentType, ContentURL, Sequence, DurationMinutes
            FROM CourseContents
            WHERE CourseID = %s
            ORDER BY Sequence
        """, [course_id])
        
        contents = dictfetchall(cursor)
        course['contents'] = contents
    
    return Response(course)

@api_view(['GET'])
@permission_classes([AllowAny])
def course_contents(request, course_id):
    """Belirli bir kursun içeriklerini döndürür"""
    with connection.cursor() as cursor:
        # Önce kursun var olup olmadığını kontrol et
        cursor.execute("""
            SELECT COUNT(*) FROM Courses WHERE CourseID = %s
        """, [course_id])
        
        if cursor.fetchone()[0] == 0:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Kurs içeriklerini getir
        cursor.execute("""
            SELECT ContentID, Title, ContentType, ContentURL, ContentText, 
                   Sequence, DurationMinutes, CreatedAt
            FROM CourseContents
            WHERE CourseID = %s
            ORDER BY Sequence
        """, [course_id])
        
        contents = dictfetchall(cursor)
        
        # İçeriklerin sorularını getir
        for content in contents:
            cursor.execute("""
                SELECT q.QuestionID, q.QuestionText, q.DifficultyLevel, q.Points, q.Explanation
                FROM Questions q
                WHERE q.ContentID = %s
            """, [content['ContentID']])
            
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
            
            content['questions'] = questions
    
    return Response(contents)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_course_progress(request, course_id):
    """Kullanıcının kurs ilerlemesini kaydeder"""
    user_id = request.user.id
    progress = request.data.get('progress')  # 0-100 arası
    is_completed = request.data.get('is_completed', False)
    content_id = request.data.get('content_id')  # Son içerik
    
    if progress is None:
        return Response({"error": "Progress value is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Kursun var olup olmadığını kontrol et
        cursor.execute("""
            SELECT COUNT(*) FROM Courses WHERE CourseID = %s
        """, [course_id])
        
        if cursor.fetchone()[0] == 0:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # İçerik ID'sinin geçerli olup olmadığını kontrol et
        if content_id:
            cursor.execute("""
                SELECT COUNT(*) FROM CourseContents 
                WHERE ContentID = %s AND CourseID = %s
            """, [content_id, course_id])
            
            if cursor.fetchone()[0] == 0:
                return Response({"error": "Invalid content ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        # İlerlemeyi kaydet veya güncelle
        completed_at = datetime.datetime.now() if is_completed else None
        
        cursor.execute("""
            IF EXISTS (SELECT 1 FROM UserCourseProgress WHERE UserID = %s AND CourseID = %s)
                UPDATE UserCourseProgress
                SET ProgressPercentage = %s,
                    LastContentID = %s,
                    IsCompleted = %s,
                    CompletedAt = %s,
                    LastActivityAt = %s
                WHERE UserID = %s AND CourseID = %s
            ELSE
                INSERT INTO UserCourseProgress 
                (UserID, CourseID, ProgressPercentage, LastContentID, IsCompleted, CompletedAt, LastActivityAt)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, [
            user_id, course_id, 
            progress, content_id, is_completed, completed_at, datetime.datetime.now(),
            user_id, course_id,
            user_id, course_id, progress, content_id, is_completed, completed_at, datetime.datetime.now()
        ])
        
    return Response({"message": "Progress updated successfully"})