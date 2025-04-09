from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from wisentia_backend.utils import cache_response


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('category', openapi.IN_QUERY, description="Kategori filtresi", type=openapi.TYPE_STRING),
        openapi.Parameter('difficulty', openapi.IN_QUERY, description="Zorluk seviyesi filtresi", type=openapi.TYPE_STRING),
    ],
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'courses': openapi.Schema(
                    type=openapi.TYPE_ARRAY, 
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'CourseID': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'Title': openapi.Schema(type=openapi.TYPE_STRING),
                            'Description': openapi.Schema(type=openapi.TYPE_STRING),
                            'Category': openapi.Schema(type=openapi.TYPE_STRING),
                            'Difficulty': openapi.Schema(type=openapi.TYPE_STRING),
                            'ThumbnailURL': openapi.Schema(type=openapi.TYPE_STRING),
                            'InstructorName': openapi.Schema(type=openapi.TYPE_STRING),
                            'VideoCount': openapi.Schema(type=openapi.TYPE_INTEGER),
                        }
                    )
                )
            }
        ))
    },
    operation_description="Tüm kursları listeler, isteğe bağlı olarak kategori ve zorluk seviyesi filtresi uygulanabilir"
)

@api_view(['GET'])
@permission_classes([AllowAny])
@cache_response(key_prefix='courses_list', timeout=3600)  # 1 saat
def list_courses(request):
    category = request.query_params.get('category')
    difficulty = request.query_params.get('difficulty')
    
    query = """
        SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
            c.CreationDate, c.ThumbnailURL, u.Username as InstructorName,
            COUNT(cv.VideoID) as VideoCount
        FROM Courses c
        LEFT JOIN Users u ON c.CreatedBy = u.UserID
        LEFT JOIN CourseVideos cv ON c.CourseID = cv.CourseID
        WHERE c.IsActive = 1
        GROUP BY c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
                c.CreationDate, c.ThumbnailURL, u.Username
    """
    
    params = []
    
    if category:
        query += " AND c.Category = %s"
        params.append(category)
    
    if difficulty:
        query += " AND c.Difficulty = %s"
        params.append(difficulty)
        
    query += " GROUP BY c.CourseID, c.Title, c.Description, c.Category, c.Difficulty, c.CreationDate, c.ThumbnailURL, u.Username"
    query += " ORDER BY c.CreationDate DESC"
    
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        courses = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(courses)

@swagger_auto_schema(
    method='get',
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'CourseID': openapi.Schema(type=openapi.TYPE_INTEGER),
                'Title': openapi.Schema(type=openapi.TYPE_STRING),
                'Description': openapi.Schema(type=openapi.TYPE_STRING),
                'Category': openapi.Schema(type=openapi.TYPE_STRING),
                'Difficulty': openapi.Schema(type=openapi.TYPE_STRING),
                'videos': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_OBJECT)
                ),
                'userProgress': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'completionPercentage': openapi.Schema(type=openapi.TYPE_NUMBER),
                        'isCompleted': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'lastAccessDate': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                    }
                )
            }
        )),
        404: 'Kurs bulunamadı'
    },
    operation_description="Belirli bir kursun detaylı bilgilerini ve videolarını getirir"
)
@api_view(['GET'])
@permission_classes([AllowAny])
@cache_response(key_prefix='course_detail')
def course_detail(request, course_id):
    with connection.cursor() as cursor:
        # Kurs bilgilerini al
        cursor.execute("""
            SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
                  c.CreationDate, c.ThumbnailURL, u.Username as InstructorName
            FROM Courses c
            LEFT JOIN Users u ON c.CreatedBy = u.UserID
            WHERE c.CourseID = %s AND c.IsActive = 1
        """, [course_id])
        
        columns = [col[0] for col in cursor.description]
        course_data = cursor.fetchone()
        
        if not course_data:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
            
        course = dict(zip(columns, course_data))
        
        # Kurs videolarını al
        cursor.execute("""
            SELECT VideoID, Title, Description, YouTubeVideoID, Duration, OrderInCourse
            FROM CourseVideos
            WHERE CourseID = %s
            ORDER BY OrderInCourse
        """, [course_id])
        
        columns = [col[0] for col in cursor.description]
        videos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        course['videos'] = videos
        
        # Kullanıcı girişi yapmışsa, ilerleme bilgisini ekle
        if request.user and hasattr(request.user, 'is_authenticated') and request.user.is_authenticated:
            user_id = request.user.id
            
            cursor.execute("""
                SELECT CompletionPercentage, IsCompleted, LastAccessDate
                FROM UserCourseProgress
                WHERE UserID = %s AND CourseID = %s
            """, [user_id, course_id])
            
            progress_data = cursor.fetchone()
            
            if progress_data:
                course['userProgress'] = {
                    'completionPercentage': progress_data[0],
                    'isCompleted': progress_data[1],
                    'lastAccessDate': progress_data[2]
                }
    
    return Response(course)

# Video detaylarını gösteren API endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def video_detail(request, video_id):
    with connection.cursor() as cursor:
        # Video bilgilerini al
        cursor.execute("""
            SELECT cv.VideoID, cv.Title, cv.Description, cv.YouTubeVideoID, cv.Duration,
                   cv.OrderInCourse, c.CourseID, c.Title as CourseTitle
            FROM CourseVideos cv
            JOIN Courses c ON cv.CourseID = c.CourseID
            WHERE cv.VideoID = %s
        """, [video_id])
        
        columns = [col[0] for col in cursor.description]
        video_data = cursor.fetchone()
        
        if not video_data:
            return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
            
        video = dict(zip(columns, video_data))
        
        # Quiz bilgilerini al
        cursor.execute("""
            SELECT QuizID, Title, Description, PassingScore
            FROM Quizzes
            WHERE VideoID = %s AND IsActive = 1
        """, [video_id])
        
        columns = [col[0] for col in cursor.description]
        quizzes = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        video['quizzes'] = quizzes
        
        # Kullanıcı girişi yapmışsa, izleme bilgisini ekle
        if request.user and hasattr(request.user, 'is_authenticated') and request.user.is_authenticated:
            user_id = request.user.id
            
            cursor.execute("""
                SELECT WatchedPercentage, IsCompleted, EarnedPoints
                FROM UserVideoViews
                WHERE UserID = %s AND VideoID = %s
            """, [user_id, video_id])
            
            view_data = cursor.fetchone()
            
            if view_data:
                video['userView'] = {
                    'watchedPercentage': view_data[0],
                    'isCompleted': view_data[1],
                    'earnedPoints': view_data[2]
                }
    
    return Response(video)

@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['watchedPercentage'],
        properties={
            'watchedPercentage': openapi.Schema(type=openapi.TYPE_NUMBER, description='İzlenen video yüzdesi (0-100)'),
            'isCompleted': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Video tamamlandı mı?')
        }
    ),
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        400: 'Geçersiz istek verisi',
        404: 'Video bulunamadı'
    },
    operation_description="Kullanıcının video izleme ilerlemesini kaydeder"
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_video_progress(request, video_id):
    user_id = request.user.id
    watched_percentage = request.data.get('watchedPercentage', 0)
    is_completed = request.data.get('isCompleted', False)
    
    # Video varlığını kontrol et
    with connection.cursor() as cursor:
        # Video bilgilerini al ve puan hesapla
        cursor.execute("""
            SELECT cv.CourseID, cv.Duration, 
                   CASE 
                      WHEN cv.VideoPoints IS NOT NULL THEN cv.VideoPoints
                      WHEN cv.Duration IS NULL THEN 10
                      ELSE CASE 
                            WHEN cv.Duration / 60 < 5 THEN 5
                            WHEN cv.Duration / 60 > 30 THEN 30
                            ELSE cv.Duration / 60
                           END
                   END as CalculatedPoints
            FROM CourseVideos cv
            WHERE cv.VideoID = %s
        """, [video_id])
        
        video_data = cursor.fetchone()
        
        if not video_data:
            return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
            
        course_id, video_duration, video_points = video_data
            
        # Mevcut izleme kaydını kontrol et
        cursor.execute("""
            SELECT ViewID, WatchedPercentage, IsCompleted
            FROM UserVideoViews
            WHERE UserID = %s AND VideoID = %s
        """, [user_id, video_id])
        
        view_data = cursor.fetchone()
        
        # Tamamlanma durumuna göre puan hesapla
        earned_points = 0
        if is_completed and (not view_data or not view_data[2]):
            # Hesaplanan puanları kullan
            earned_points = int(video_points)
        
        # İzleme kaydını güncelle veya oluştur
        completion_date = "GETDATE()" if is_completed else "NULL"
        
        if view_data:
            # Mevcut kaydı güncelle
            cursor.execute(f"""
                UPDATE UserVideoViews
                SET WatchedPercentage = %s,
                    IsCompleted = %s,
                    CompletionDate = {completion_date if is_completed else 'CompletionDate'},
                    EarnedPoints = CASE WHEN IsCompleted = 0 AND %s = 1 THEN %s ELSE EarnedPoints END
                WHERE ViewID = %s
            """, [watched_percentage, is_completed, is_completed, earned_points, view_data[0]])
        else:
            # Yeni kayıt oluştur
            cursor.execute(f"""
                INSERT INTO UserVideoViews
                (UserID, VideoID, ViewDate, WatchedPercentage, IsCompleted, CompletionDate, EarnedPoints)
                VALUES (%s, %s, GETDATE(), %s, %s, {completion_date}, %s)
            """, [user_id, video_id, watched_percentage, is_completed, earned_points])
            
        # Video tamamlandıysa kullanıcı puanını güncelle
        if is_completed and earned_points > 0:
            cursor.execute("""
                UPDATE Users
                SET TotalPoints = TotalPoints + %s
                WHERE UserID = %s
            """, [earned_points, user_id])
            
        # Kurs ilerleme durumunu güncelle
        # Kursun tüm videolarını al
        cursor.execute("""
            SELECT COUNT(VideoID) 
            FROM CourseVideos 
            WHERE CourseID = %s
        """, [course_id])
        
        total_videos = cursor.fetchone()[0]
        
        # Kullanıcının izlediği videoları say
        cursor.execute("""
            SELECT COUNT(uv.ViewID)
            FROM UserVideoViews uv
            JOIN CourseVideos cv ON uv.VideoID = cv.VideoID
            WHERE uv.UserID = %s AND cv.CourseID = %s AND uv.IsCompleted = 1
        """, [user_id, course_id])
        
        completed_videos = cursor.fetchone()[0]
        
        # Tamamlama yüzdesini hesapla
        completion_percentage = (completed_videos / total_videos * 100) if total_videos > 0 else 0
        is_course_completed = (completed_videos == total_videos) and (total_videos > 0)
        
        # Kurs ilerleme tablosunu güncelle
        cursor.execute("""
            SELECT ProgressID 
            FROM UserCourseProgress 
            WHERE UserID = %s AND CourseID = %s
        """, [user_id, course_id])
        
        progress_data = cursor.fetchone()
        
        course_completion_date = "GETDATE()" if is_course_completed else "NULL"
        
        if progress_data:
            # Mevcut ilerlemeyi güncelle
            cursor.execute(f"""
                UPDATE UserCourseProgress
                SET LastVideoID = %s,
                    CompletionPercentage = %s,
                    LastAccessDate = GETDATE(),
                    IsCompleted = %s,
                    CompletionDate = {course_completion_date if is_course_completed else 'CompletionDate'}
                WHERE ProgressID = %s
            """, [video_id, completion_percentage, is_course_completed, progress_data[0]])
        else:
            # Yeni ilerleme kaydı oluştur
            cursor.execute(f"""
                INSERT INTO UserCourseProgress
                (UserID, CourseID, LastVideoID, CompletionPercentage, LastAccessDate, IsCompleted, CompletionDate)
                VALUES (%s, %s, %s, %s, GETDATE(), %s, {course_completion_date})
            """, [user_id, course_id, video_id, completion_percentage, is_course_completed])
        
        # Kurs tamamlandıysa kurs tamamlama puanı ver
        if is_course_completed and is_completed:
            # Kurs tamamlama puanını dinamik olarak hesapla
            cursor.execute("""
                SELECT c.Difficulty, c.CourseCompletionPoints,
                       COUNT(cv.VideoID) as TotalVideos,
                       SUM(cv.Duration) as TotalDuration
                FROM Courses c
                JOIN CourseVideos cv ON c.CourseID = cv.CourseID
                WHERE c.CourseID = %s
                GROUP BY c.Difficulty, c.CourseCompletionPoints
            """, [course_id])
            
            course_data = cursor.fetchone()
            
            if course_data:
                difficulty, custom_points, total_videos, total_duration = course_data
                
                # Özel puan varsa onu kullan, yoksa hesapla
                if custom_points:
                    course_completion_points = custom_points
                else:
                    # Zorluk seviyesine göre çarpanlar
                    difficulty_multiplier = {
                        'beginner': 1.0,
                        'intermediate': 1.5,
                        'advanced': 2.0
                    }.get(difficulty.lower(), 1.0)
                    
                    # Toplam süreye göre baz puan (saat başına)
                    hours = (total_duration or 0) / 3600
                    base_points = 50
                    
                    # Final puan hesaplama
                    course_completion_points = int(base_points * max(1, hours) * difficulty_multiplier)
                
                # Daha önce bu kursu tamamlamamışsa puan ver
                cursor.execute("""
                    UPDATE Users
                    SET TotalPoints = TotalPoints + %s
                    WHERE UserID = %s AND
                    (SELECT COUNT(*) FROM UserCourseProgress 
                    WHERE UserID = %s AND CourseID = %s AND IsCompleted = 1 AND CompletionDate < DATEADD(day, -1, GETDATE())) = 0
                """, [course_completion_points, user_id, user_id, course_id])
    
    return Response({'message': 'Video progress updated successfully'})

@swagger_auto_schema(
    method='get',
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'totalStats': openapi.Schema(type=openapi.TYPE_OBJECT),
                'categoryStats': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)),
                'dailyTrends': openapi.Schema(type=openapi.TYPE_OBJECT)
            }
        ))
    },
    operation_description="Kullanıcının izlediği videoların kapsamlı istatistiklerini getirir"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_video_stats(request):
    """Kullanıcının izlediği videoların kapsamlı istatistiklerini getirir"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Toplam izleme istatistikleri
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT VideoID) as TotalVideosWatched,
                SUM(CASE WHEN IsCompleted = 1 THEN 1 ELSE 0 END) as CompletedVideos,
                SUM(CASE WHEN IsCompleted = 0 THEN 1 ELSE 0 END) as InProgressVideos,
                SUM(uvv.EarnedPoints) as TotalPointsFromVideos,
                SUM(CASE WHEN cv.Duration IS NOT NULL THEN cv.Duration ELSE 0 END) / 60 as TotalMinutesWatched
            FROM UserVideoViews uvv
            JOIN CourseVideos cv ON uvv.VideoID = cv.VideoID
            WHERE uvv.UserID = %s
        """, [user_id])
        
        stats = cursor.fetchone()
        
        total_stats = {
            'totalVideosWatched': stats[0],
            'completedVideos': stats[1],
            'inProgressVideos': stats[2],
            'totalPointsEarned': stats[3],
            'totalMinutesWatched': stats[4]
        }
        
        # Kategori bazında izleme istatistikleri
        cursor.execute("""
            SELECT 
                c.Category,
                COUNT(DISTINCT uvv.VideoID) as VideosWatched,
                SUM(CASE WHEN uvv.IsCompleted = 1 THEN 1 ELSE 0 END) as CompletedVideos
            FROM UserVideoViews uvv
            JOIN CourseVideos cv ON uvv.VideoID = cv.VideoID
            JOIN Courses c ON cv.CourseID = c.CourseID
            WHERE uvv.UserID = %s
            GROUP BY c.Category
            ORDER BY VideosWatched DESC
        """, [user_id])
        
        category_columns = [col[0] for col in cursor.description]
        category_stats = [dict(zip(category_columns, row)) for row in cursor.fetchall()]
        
        # Günlük izleme trendi
        cursor.execute("""
            SELECT 
                CAST(uvv.ViewDate as DATE) as Date,
                COUNT(DISTINCT uvv.VideoID) as VideosWatched,
                SUM(CASE WHEN cv.Duration IS NOT NULL THEN cv.Duration ELSE 0 END) / 60 as MinutesWatched
            FROM UserVideoViews uvv
            JOIN CourseVideos cv ON uvv.VideoID = cv.VideoID
            WHERE uvv.UserID = %s
              AND uvv.ViewDate >= DATEADD(day, -30, GETDATE())
            GROUP BY CAST(uvv.ViewDate as DATE)
            ORDER BY CAST(uvv.ViewDate as DATE)
        """, [user_id])
        
        trend_columns = [col[0] for col in cursor.description]
        daily_trends = {}
        
        for row in cursor.fetchall():
            data = dict(zip(trend_columns, row))
            daily_trends[data['Date'].strftime('%Y-%m-%d')] = {
                'videosWatched': data['VideosWatched'],
                'minutesWatched': data['MinutesWatched']
            }
    
    return Response({
        'totalStats': total_stats,
        'categoryStats': category_stats,
        'dailyTrends': daily_trends
    })