from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from wisentia_backend.utils import cache_response
from django.core.cache import cache
import json
from django.http import JsonResponse
import pyodbc
from datetime import datetime, timedelta


# Ensure UserCourseEnrollments table exists
def ensure_course_tables_exist():
    with connection.cursor() as cursor:
        try:
            # Check if UserCourseEnrollments table exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'UserCourseEnrollments'
            """)
            
            table_exists = cursor.fetchone()[0] > 0
            
            if not table_exists:
                print("Creating UserCourseEnrollments table...")
                # Create the UserCourseEnrollments table
                cursor.execute("""
                    CREATE TABLE UserCourseEnrollments (
                        EnrollmentID INT IDENTITY(1,1) PRIMARY KEY,
                        UserID INT NOT NULL,
                        CourseID INT NOT NULL,
                        EnrollmentDate DATETIME NOT NULL DEFAULT GETDATE(),
                        CONSTRAINT FK_UserCourseEnrollments_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
                        CONSTRAINT FK_UserCourseEnrollments_Courses FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
                        CONSTRAINT UQ_UserCourseEnrollments UNIQUE (UserID, CourseID)
                    )
                """)
                print("UserCourseEnrollments table created successfully")
            
            # Also check if UserCourseProgress table exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'UserCourseProgress'
            """)
            
            progress_table_exists = cursor.fetchone()[0] > 0
            
            if not progress_table_exists:
                print("Creating UserCourseProgress table...")
                # Create the UserCourseProgress table
                cursor.execute("""
                    CREATE TABLE UserCourseProgress (
                        ProgressID INT IDENTITY(1,1) PRIMARY KEY,
                        UserID INT NOT NULL,
                        CourseID INT NOT NULL,
                        LastVideoID INT NULL,
                        CompletionPercentage FLOAT NOT NULL DEFAULT 0,
                        LastAccessDate DATETIME NOT NULL DEFAULT GETDATE(),
                        IsCompleted BIT NOT NULL DEFAULT 0,
                        CONSTRAINT FK_UserCourseProgress_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
                        CONSTRAINT FK_UserCourseProgress_Courses FOREIGN KEY (CourseID) REFERENCES Courses(CourseID),
                        CONSTRAINT UQ_UserCourseProgress UNIQUE (UserID, CourseID)
                    )
                """)
                print("UserCourseProgress table created successfully")
                
            # Sync existing records between tables
            print("Syncing existing enrollment records...")
            cursor.execute("""
                INSERT INTO UserCourseEnrollments (UserID, CourseID, EnrollmentDate)
                SELECT DISTINCT UserID, CourseID, LastAccessDate
                FROM UserCourseProgress
                WHERE NOT EXISTS (
                    SELECT 1 FROM UserCourseEnrollments
                    WHERE UserCourseEnrollments.UserID = UserCourseProgress.UserID
                    AND UserCourseEnrollments.CourseID = UserCourseProgress.CourseID
                )
            """)
            print("Enrollment records synced successfully")
                
        except Exception as e:
            print(f"Error ensuring course tables exist: {str(e)}")


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
def list_courses(request):
    category = request.query_params.get('category')
    difficulty = request.query_params.get('difficulty')
    
    with connection.cursor() as cursor:
        # Check if UserCourseRatings table exists
        try:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'UserCourseRatings'
            """)
            ratings_table_exists = cursor.fetchone()[0] > 0
        except Exception as e:
            print(f"Error checking if UserCourseRatings table exists: {str(e)}")
            ratings_table_exists = False
            
        # Check if UserCourseEnrollments table exists
        try:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'UserCourseEnrollments'
            """)
            enrollments_table_exists = cursor.fetchone()[0] > 0
        except Exception as e:
            print(f"Error checking if UserCourseEnrollments table exists: {str(e)}")
            enrollments_table_exists = False
        
        # Modify queries based on table existence
        if enrollments_table_exists:
            enrolled_users_query = "(SELECT COUNT(DISTINCT uce.UserID) FROM UserCourseEnrollments uce WHERE uce.CourseID = c.CourseID)"
        else:
            enrolled_users_query = "(SELECT COUNT(DISTINCT ucp.UserID) FROM UserCourseProgress ucp WHERE ucp.CourseID = c.CourseID)"
            
        if ratings_table_exists:
            rating_query = "(SELECT AVG(CAST(ucr.Rating as FLOAT)) FROM UserCourseRatings ucr WHERE ucr.CourseID = c.CourseID)"
        else:
            rating_query = "NULL"
            
        query = f"""
            SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
                c.CreationDate, c.ThumbnailURL, u.Username as InstructorName,
                COUNT(DISTINCT cv.VideoID) as VideoCount,
                {enrolled_users_query} as EnrolledUsers,
                {rating_query} as Rating
            FROM Courses c
            LEFT JOIN Users u ON c.CreatedBy = u.UserID
            LEFT JOIN CourseVideos cv ON c.CourseID = cv.CourseID
            WHERE c.IsActive = 1
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
def course_detail(request, course_id):
    with connection.cursor() as cursor:
        # Check if UserCourseRatings table exists
        try:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'UserCourseRatings'
            """)
            table_exists = cursor.fetchone()[0] > 0
        except Exception as e:
            print(f"Error checking if UserCourseRatings table exists: {str(e)}")
            table_exists = False
        
        # Kurs bilgilerini al - with modified query based on table existence
        if table_exists:
            rating_query = "(SELECT AVG(CAST(ucr.Rating as FLOAT)) FROM UserCourseRatings ucr WHERE ucr.CourseID = c.CourseID)"
        else:
            rating_query = "NULL"
            
        query = f"""
            SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
                  c.CreationDate, c.ThumbnailURL, u.Username as InstructorName,
                  ISNULL(c.TotalVideos, 0) as TotalVideos,
                  (SELECT COUNT(DISTINCT UserID) FROM UserCourseEnrollments WHERE CourseID = c.CourseID) as EnrolledUsers,
                  {rating_query} as Rating
            FROM Courses c
            LEFT JOIN Users u ON c.CreatedBy = u.UserID
            WHERE c.CourseID = %s AND c.IsActive = 1
        """
        cursor.execute(query, [course_id])
        
        columns = [col[0] for col in cursor.description]
        course_data = cursor.fetchone()
        
        if not course_data:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
            
        course = dict(zip(columns, course_data))
        
        # Debug - Directly check enrollment count for this course
        cursor.execute("""
            SELECT COUNT(DISTINCT UserID) FROM UserCourseEnrollments WHERE CourseID = %s
        """, [course_id])
        direct_count = cursor.fetchone()[0]
        print(f"Debug: Course {course_id} - Direct enrollment count from UserCourseEnrollments: {direct_count}")
        
        # Force the enrollment count to be accurate by overriding any value in course data
        course['EnrolledUsers'] = direct_count
        
        # Log the actual enrollments for this course
        cursor.execute("""
            SELECT EnrollmentID, UserID, EnrollmentDate 
            FROM UserCourseEnrollments 
            WHERE CourseID = %s
        """, [course_id])
        
        enrollment_records = cursor.fetchall()
        print(f"Debug: Course {course_id} - Enrollment records: {enrollment_records}")
        
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
        
        # If TotalVideos is missing, calculate it from videos
        if 'TotalVideos' not in course or course['TotalVideos'] == 0:
            course['TotalVideos'] = len(videos)
            
            # Update the course TotalVideos in the database
            try:
                cursor.execute("""
                    UPDATE Courses
                    SET TotalVideos = %s
                    WHERE CourseID = %s
                """, [len(videos), course_id])
            except Exception as e:
                print(f"Error updating TotalVideos: {str(e)}")
                
        # Calculate totalDuration from videos - ensure we handle NULL values properly
        total_duration = 0
        for video in videos:
            duration = video.get('Duration')
            if duration is not None:
                try:
                    # Ensure the duration is treated as a number
                    duration_seconds = int(duration)
                    total_duration += duration_seconds
                    # Debug log
                    print(f"  Video {video.get('VideoID')}: Duration = {duration_seconds} seconds")
                except (ValueError, TypeError) as e:
                    print(f"  Error converting video duration to integer: {str(e)}, Value: {duration}")
            else:
                print(f"  Video {video.get('VideoID')}: No duration data available")
        
        course['totalDuration'] = total_duration
        
        # Add a formatted duration string
        if total_duration > 0:
            hours = total_duration // 3600
            minutes = (total_duration % 3600) // 60
            seconds = total_duration % 60
            
            if hours > 0:
                course['formattedDuration'] = f"{hours}h {minutes}m"
            elif minutes > 0:
                course['formattedDuration'] = f"{minutes}m {seconds}s"
            else:
                course['formattedDuration'] = f"{seconds}s"
        else:
            course['formattedDuration'] = "0 minutes"
        
        # Log the duration calculation results for debugging
        print(f"Course {course_id} - Videos: {len(videos)}, Total Duration: {total_duration} seconds, Formatted: {course.get('formattedDuration')}")
        
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
def video_detail(request, video_id):
    """API endpoint to retrieve video details and associated quizzes"""
    try:
        with connection.cursor() as cursor:
            # Get video details
            cursor.execute("""
                SELECT cv.VideoID, cv.Title, cv.Description, cv.Duration, cv.CourseID,
                       cv.YouTubeVideoID, cv.OrderInCourse, c.Title as CourseTitle
                FROM CourseVideos cv
                LEFT JOIN Courses c ON cv.CourseID = c.CourseID
                WHERE cv.VideoID = %s
            """, [video_id])
            
            columns = [col[0] for col in cursor.description]
            video = dict(zip(columns, cursor.fetchone()))
            
            if not video:
                return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get user progress if authenticated
            if request.user.is_authenticated:
                cursor.execute("""
                    SELECT uvv.ViewID, uvv.WatchedPercentage, uvv.IsCompleted, 
                           uvv.ViewDate, uvv.EarnedPoints, uvv.lastPosition
                    FROM UserVideoViews uvv
                    WHERE uvv.UserID = %s AND uvv.VideoID = %s
                """, [request.user.id, video_id])
                
                progress_columns = [col[0] for col in cursor.description]
                progress = cursor.fetchone()
                if progress:
                    video['userProgress'] = dict(zip(progress_columns, progress))
            
            # Get quizzes for this video - using YouTubeVideoID
            try:
                # Ensure we're using the YouTubeVideoID for quiz lookup
                youtube_video_id = video['YouTubeVideoID']
                
                cursor.execute("""
                    SELECT q.QuizID, q.Title, q.Description, q.PassingScore,
                           COUNT(qq.QuestionID) AS QuestionCount
                    FROM Quizzes q
                    LEFT JOIN QuizQuestions qq ON q.QuizID = qq.QuizID
                    WHERE q.VideoID = %s AND q.IsActive = 1
                    GROUP BY q.QuizID, q.Title, q.Description, q.PassingScore
                """, [youtube_video_id])
                
                quiz_columns = [col[0] for col in cursor.description]
                quizzes = [dict(zip(quiz_columns, row)) for row in cursor.fetchall()]
                video['quizzes'] = quizzes
                
                print(f"Found {len(quizzes)} quizzes for video {video_id} (YouTube ID: {youtube_video_id})")
                
            except Exception as quiz_error:
                print(f"Quiz bilgisi getirme hatası: {quiz_error}")
                video['quizzes'] = []
            
            return Response(video)
            
    except Exception as e:
        return Response(
            {'error': 'An error occurred while retrieving video details', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['watchedPercentage'],
        properties={
            'watchedPercentage': openapi.Schema(type=openapi.TYPE_NUMBER, description='İzlenen video yüzdesi (0-100)'),
            'isCompleted': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Video tamamlandı mı?'),
            'lastPosition': openapi.Schema(type=openapi.TYPE_NUMBER, description='Videonun izlenen son pozisyonu (saniye)'),
            'viewDuration': openapi.Schema(type=openapi.TYPE_NUMBER, description='Bu izleme oturumunun süresi (ms)')
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
    try:
        user_id = request.user.id
        tracking_id = request.headers.get('X-Tracking-ID', 'unknown')
        
        # Get data from request
        data = request.data
        watched_percentage = float(data.get('watchedPercentage', 0))
        is_completed = bool(data.get('isCompleted', False))
        last_position = float(data.get('lastPosition', 0))
        view_duration = int(data.get('viewDuration', 0))
        
        print(f"[Track:{tracking_id}] Processing video progress: Video #{video_id}, User #{user_id}")
        print(f"[Track:{tracking_id}] Progress data: {watched_percentage}%, Completed: {is_completed}")
        
        with connection.cursor() as cursor:
            # First check if video exists
            cursor.execute("""
                SELECT v.CourseID, v.Duration 
                FROM CourseVideos v 
                WHERE v.VideoID = %s
            """, [video_id])
            video_data = cursor.fetchone()
            if not video_data:
                return Response({'error': 'Video not found'}, status=404)
                
            course_id = video_data[0]
            video_duration = video_data[1] or 0
            
            # Check if user is enrolled in the course
            cursor.execute("""
                SELECT EnrollmentID 
                FROM UserCourseEnrollments 
                WHERE UserID = %s AND CourseID = %s
            """, [user_id, course_id])
            enrollment = cursor.fetchone()
            if not enrollment:
                return Response({'error': 'User not enrolled in course'}, status=403)
                
            # Update or insert video view record using MERGE
            cursor.execute("""
                MERGE UserVideoViews AS target
                USING (SELECT %s AS UserID, %s AS VideoID) AS source
                ON target.UserID = source.UserID AND target.VideoID = source.VideoID
                WHEN MATCHED THEN
                    UPDATE SET 
                        WatchedPercentage = %s,
                        IsCompleted = %s,
                        lastPosition = %s,
                        CompletionDate = CASE WHEN %s = 1 THEN GETDATE() ELSE target.CompletionDate END,
                        EarnedPoints = CASE WHEN %s = 1 AND (target.IsCompleted = 0 OR target.IsCompleted IS NULL) THEN 10 ELSE target.EarnedPoints END
                WHEN NOT MATCHED THEN
                    INSERT (UserID, VideoID, WatchedPercentage, IsCompleted, lastPosition, ViewDate, CompletionDate, EarnedPoints)
                    VALUES (%s, %s, %s, %s, %s, GETDATE(), CASE WHEN %s = 1 THEN GETDATE() ELSE NULL END, CASE WHEN %s = 1 THEN 10 ELSE 0 END);
            """, [user_id, video_id, watched_percentage, is_completed, last_position, is_completed, is_completed,
                  user_id, video_id, watched_percentage, is_completed, last_position, is_completed, is_completed])
            
            # Calculate course completion
            cursor.execute("""
                ;WITH video_completion AS (
                    SELECT 
                        v.CourseID,
                        COUNT(DISTINCT v.VideoID) as total_videos,
                        COUNT(DISTINCT CASE WHEN uv.IsCompleted = 1 THEN v.VideoID END) as completed_videos
                    FROM CourseVideos v
                    LEFT JOIN UserVideoViews uv ON v.VideoID = uv.VideoID AND uv.UserID = %s
                    WHERE v.CourseID = %s
                    GROUP BY v.CourseID
                )
                SELECT 
                    CAST(ROUND(CAST(completed_videos AS FLOAT) / NULLIF(total_videos, 0) * 100, 0) AS INT) as completion_percentage,
                    CASE WHEN completed_videos = total_videos THEN 1 ELSE 0 END as is_completed
                FROM video_completion;
            """, [user_id, course_id])
            
            completion_data = cursor.fetchone()
            course_completion_percentage = completion_data[0] if completion_data else 0
            course_completed = bool(completion_data[1]) if completion_data else False
            
            # Update course progress
            if course_completion_percentage > 0:
                cursor.execute("""
                    MERGE UserCourseProgress AS target
                    USING (SELECT %s AS UserID, %s AS CourseID) AS source
                    ON target.UserID = source.UserID AND target.CourseID = source.CourseID
                    WHEN MATCHED THEN
                        UPDATE SET 
                            CompletionPercentage = %s,
                            IsCompleted = %s,
                            LastAccessDate = GETDATE(),
                            CompletionDate = CASE WHEN %s = 1 AND (target.IsCompleted = 0 OR target.IsCompleted IS NULL) 
                                                THEN GETDATE() ELSE target.CompletionDate END,
                            LastVideoID = %s
                    WHEN NOT MATCHED THEN
                        INSERT (UserID, CourseID, CompletionPercentage, IsCompleted, LastAccessDate, LastVideoID, CompletionDate)
                        VALUES (%s, %s, %s, %s, GETDATE(), %s, CASE WHEN %s = 1 THEN GETDATE() ELSE NULL END);
                """, [user_id, course_id, course_completion_percentage, course_completed, course_completed, 
                      video_id, user_id, course_id, course_completion_percentage, course_completed, 
                      video_id, course_completed])
            
            return Response({
                'success': True,
                'message': 'Progress updated successfully',
                'courseCompletionPercentage': course_completion_percentage,
                'courseCompleted': course_completed
            })
            
    except Exception as e:
        print(f"[Track:{tracking_id}] Error tracking progress:", e)
        return Response({
            'error': f'Failed to track progress: {str(e)}'
        }, status=500)

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

@swagger_auto_schema(
    method='post',
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'success': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'message': openapi.Schema(type=openapi.TYPE_STRING),
                'enrollment_id': openapi.Schema(type=openapi.TYPE_INTEGER)
            }
        )),
        400: 'Geçersiz istek',
        404: 'Kurs bulunamadı'
    },
    operation_description="Kullanıcının belirtilen kursa kaydolmasını sağlar"
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, course_id):
    """Kullanıcıyı belirtilen kursa kaydeden endpoint"""
    user_id = request.user.id
    
    # Ensure necessary tables exist
    ensure_course_tables_exist()
    
    with connection.cursor() as cursor:
        # Önce kursun var olup olmadığını kontrol et
        cursor.execute("""
            SELECT CourseID, Title
            FROM Courses
            WHERE CourseID = %s AND IsActive = 1
        """, [course_id])
        
        course = cursor.fetchone()
        
        if not course:
            return Response({'error': 'Course not found', 'success': False}, status=status.HTTP_404_NOT_FOUND)
        
        # Kullanıcının zaten UserCourseEnrollments tablosunda kayıtlı olup olmadığını kontrol et
        cursor.execute("""
            SELECT EnrollmentID
            FROM UserCourseEnrollments
            WHERE UserID = %s AND CourseID = %s
        """, [user_id, course_id])
        
        existing_enrollment = cursor.fetchone()
        
        if existing_enrollment:
            # Zaten kayıtlı, UserCourseProgress tablosundan da kontrol edelim
            cursor.execute("""
                SELECT ProgressID
                FROM UserCourseProgress
                WHERE UserID = %s AND CourseID = %s
            """, [user_id, course_id])
            
            existing_progress = cursor.fetchone()
            progress_id = None
            
            # Eğer progress kaydı yoksa oluşturalım
            if not existing_progress:
                # İlk videoyu bul
                cursor.execute("""
                    SELECT VideoID FROM CourseVideos
                    WHERE CourseID = %s
                    ORDER BY OrderInCourse ASC
                    OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
                """, [course_id])
                
                first_video = cursor.fetchone()
                first_video_id = first_video[0] if first_video else None
                
                # Progress kaydı oluştur - INSERT ve SCOPE_IDENTITY() ayrı ayrı
                cursor.execute("""
                    INSERT INTO UserCourseProgress 
                    (UserID, CourseID, LastVideoID, CompletionPercentage, LastAccessDate, IsCompleted)
                    VALUES (%s, %s, %s, 0, GETDATE(), 0)
                """, [user_id, course_id, first_video_id])
                
                # Get the ID in a separate query
                cursor.execute("SELECT SCOPE_IDENTITY()")
                progress_id_result = cursor.fetchone()
                progress_id = progress_id_result[0] if progress_id_result else None
            else:
                progress_id = existing_progress[0]
            
            # Invalidate cache for both course detail and course list
            cache.delete(f"course_detail_{course_id}")
            cache.delete("courses_list")
            # Clear all cache to ensure no stale data remains
            cache.clear()
            
            return Response({
                'success': True,
                'message': 'User already enrolled in this course',
                'enrollment_id': existing_enrollment[0],
                'progress_id': progress_id,
                'course_id': course_id,
                'course_title': course[1]
            })
        
        # Kullanıcının UserCourseProgress tablosunda kaydı var mı kontrol et
        cursor.execute("""
            SELECT ProgressID
            FROM UserCourseProgress
            WHERE UserID = %s AND CourseID = %s
        """, [user_id, course_id])
        
        existing_progress = cursor.fetchone()
        progress_id = None
        enrollment_id = None
        
        # Kursa kayıt işlemini gerçekleştir
        try:
            # İlk videoyu bul
            cursor.execute("""
                SELECT VideoID FROM CourseVideos
                WHERE CourseID = %s
                ORDER BY OrderInCourse ASC
                OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
            """, [course_id])
            
            first_video = cursor.fetchone()
            first_video_id = first_video[0] if first_video else None
            
            # UserCourseEnrollments tablosuna kayıt ekle - INSERT ve SCOPE_IDENTITY() ayrı ayrı
            cursor.execute("""
                INSERT INTO UserCourseEnrollments 
                (UserID, CourseID, EnrollmentDate)
                VALUES (%s, %s, GETDATE())
            """, [user_id, course_id])
            
            # Get the ID in a separate query using multiple methods
            try:
                cursor.execute("SELECT @@IDENTITY")
                enrollment_id_result = cursor.fetchone()
                enrollment_id = enrollment_id_result[0] if enrollment_id_result else None
                
                if enrollment_id is None:
                    # Try SCOPE_IDENTITY() as an alternative
                    cursor.execute("SELECT SCOPE_IDENTITY()")
                    enrollment_id_result = cursor.fetchone()
                    enrollment_id = enrollment_id_result[0] if enrollment_id_result else None
                    
                    if enrollment_id is None:
                        # Last resort: try to find the enrollment record we just created
                        cursor.execute("""
                            SELECT EnrollmentID FROM UserCourseEnrollments 
                            WHERE UserID = %s AND CourseID = %s
                            ORDER BY EnrollmentDate DESC
                        """, [user_id, course_id])
                        enrollment_id_result = cursor.fetchone()
                        enrollment_id = enrollment_id_result[0] if enrollment_id_result else None
            except Exception as id_error:
                print(f"Error retrieving enrollment ID: {str(id_error)}")
                enrollment_id = None
            
            # Eğer UserCourseProgress tablosunda kayıt yoksa, oluştur
            if not existing_progress:
                cursor.execute("""
                    INSERT INTO UserCourseProgress 
                    (UserID, CourseID, LastVideoID, CompletionPercentage, LastAccessDate, IsCompleted)
                    VALUES (%s, %s, %s, 0, GETDATE(), 0)
                """, [user_id, course_id, first_video_id])
                
                # Get the ID in a separate query
                try:
                    cursor.execute("SELECT SCOPE_IDENTITY()")
                    progress_id_result = cursor.fetchone()
                    progress_id = progress_id_result[0] if progress_id_result else None
                except Exception as progress_error:
                    print(f"Error retrieving progress ID: {str(progress_error)}")
                    progress_id = None
            else:
                progress_id = existing_progress[0]
            
            # Aktivite logu ekle
            try:
                cursor.execute("""
                    INSERT INTO ActivityLogs 
                    (UserID, ActivityType, Description, Timestamp)
                    VALUES (%s, 'course_enrollment', %s, GETDATE())
                """, [user_id, f"Enrolled in course: {course[1]}"])
            except Exception as log_error:
                print(f"Error adding activity log: {str(log_error)}")
                # Continue despite error in activity log
            
            # Invalidate cache for both course detail and course list
            cache.delete(f"course_detail_{course_id}")
            cache.delete("courses_list")
            # Clear all cache to ensure no stale data remains
            cache.clear()
            
            # Always return a successful response with course information
            # even if we couldn't retrieve IDs
            return Response({
                'success': True,
                'message': 'Successfully enrolled in course',
                'enrollment_id': enrollment_id,
                'progress_id': progress_id,
                'course_id': course_id,
                'course_title': course[1]
            })
            
        except Exception as e:
            print(f"SQL Error during enrollment: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@swagger_auto_schema(
    method='get',
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'is_enrolled': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'progress': openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                    'completion_percentage': openapi.Schema(type=openapi.TYPE_NUMBER),
                    'is_completed': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'last_accessed': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                })
            }
        )),
        404: 'Kurs bulunamadı'
    },
    operation_description="Kullanıcının kurs kaydı durumunu getirir"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def enrollment_status(request, course_id):
    """Kullanıcının kurs kaydı durumunu getiren endpoint"""
    user_id = request.user.id
    
    # Ensure necessary tables exist
    ensure_course_tables_exist()
    
    with connection.cursor() as cursor:
        # Önce kursun var olup olmadığını kontrol et
        cursor.execute("""
            SELECT CourseID
            FROM Courses
            WHERE CourseID = %s AND IsActive = 1
        """, [course_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Kullanıcının enrollments tablosundaki kayıt durumunu kontrol et
        cursor.execute("""
            SELECT EnrollmentID, EnrollmentDate 
            FROM UserCourseEnrollments
            WHERE UserID = %s AND CourseID = %s
        """, [user_id, course_id])
        
        enrollment = cursor.fetchone()
        is_enrolled = enrollment is not None
        
        if not is_enrolled:
            return Response({
                'is_enrolled': False,
                'progress': None
            })
            
        # Kullanıcının progress tablosundaki ilerleme durumunu kontrol et
        cursor.execute("""
            SELECT CompletionPercentage, IsCompleted, LastAccessDate, LastVideoID
            FROM UserCourseProgress
            WHERE UserID = %s AND CourseID = %s
        """, [user_id, course_id])
        
        progress = cursor.fetchone()
        
        # Eğer enrollment var ama progress yoksa, progress kaydı oluştur
        if not progress:
            try:
                # İlk videoyu bul
                cursor.execute("""
                    SELECT VideoID FROM CourseVideos
                    WHERE CourseID = %s
                    ORDER BY OrderInCourse ASC
                    OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
                """, [course_id])
                
                first_video = cursor.fetchone()
                first_video_id = first_video[0] if first_video else None
                
                # Progress kaydı oluştur
                cursor.execute("""
                    INSERT INTO UserCourseProgress 
                    (UserID, CourseID, LastVideoID, CompletionPercentage, LastAccessDate, IsCompleted)
                    VALUES (%s, %s, %s, 0, GETDATE(), 0)
                """, [user_id, course_id, first_video_id])
                
                # Get the ID in a separate query
                cursor.execute("SELECT SCOPE_IDENTITY()")
                progress_id = cursor.fetchone()[0]
                
                # Yeni oluşturulan progress kaydını al
                cursor.execute("""
                    SELECT CompletionPercentage, IsCompleted, LastAccessDate, LastVideoID
                    FROM UserCourseProgress
                    WHERE UserID = %s AND CourseID = %s
                """, [user_id, course_id])
                
                progress = cursor.fetchone()
            except Exception as e:
                print(f"Error creating progress record: {str(e)}")
                return Response({
                    'is_enrolled': True,
                    'progress': {
                        'completion_percentage': 0,
                        'is_completed': False,
                        'last_accessed': enrollment[1],
                        'last_video': None
                    }
                })
        
        completion_percentage, is_completed, last_access_date, last_video_id = progress
        
        # Son izlenen video bilgisini al
        if last_video_id:
            cursor.execute("""
                SELECT Title, OrderInCourse
                FROM CourseVideos
                WHERE VideoID = %s
            """, [last_video_id])
            
            last_video = cursor.fetchone()
            last_video_info = {
                'id': last_video_id,
                'title': last_video[0],
                'order': last_video[1]
            } if last_video else None
        else:
            last_video_info = None
        
        return Response({
            'is_enrolled': True,
            'progress': {
                'completion_percentage': completion_percentage,
                'is_completed': is_completed,
                'last_accessed': last_access_date,
                'last_video': last_video_info
            }
        })

@swagger_auto_schema(
    method='get',
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'courses': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'course_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'title': openapi.Schema(type=openapi.TYPE_STRING),
                            'category': openapi.Schema(type=openapi.TYPE_STRING),
                            'thumbnail_url': openapi.Schema(type=openapi.TYPE_STRING),
                            'completion_percentage': openapi.Schema(type=openapi.TYPE_NUMBER),
                            'is_completed': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                            'last_accessed': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                        }
                    )
                )
            }
        ))
    },
    operation_description="Kullanıcının kayıtlı olduğu kursları listeler"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_enrolled_courses(request):
    """Kullanıcının kayıtlı olduğu kursları listeleyen endpoint"""
    user_id = request.user.id
    
    # Ensure necessary tables exist
    ensure_course_tables_exist()
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
                c.ThumbnailURL, u.Username as InstructorName,
                uce.EnrollmentDate,
                ISNULL(ucp.CompletionPercentage, 0) as CompletionPercentage, 
                ISNULL(ucp.IsCompleted, 0) as IsCompleted, 
                ISNULL(ucp.LastAccessDate, uce.EnrollmentDate) as LastAccessDate,
                ucp.LastVideoID, COUNT(cv.VideoID) as VideoCount
            FROM UserCourseEnrollments uce
            JOIN Courses c ON uce.CourseID = c.CourseID
            LEFT JOIN Users u ON c.CreatedBy = u.UserID
            LEFT JOIN UserCourseProgress ucp ON uce.UserID = ucp.UserID AND uce.CourseID = ucp.CourseID
            LEFT JOIN CourseVideos cv ON c.CourseID = cv.CourseID
            WHERE uce.UserID = %s AND c.IsActive = 1
            GROUP BY c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
                c.ThumbnailURL, u.Username, uce.EnrollmentDate, ucp.CompletionPercentage, ucp.IsCompleted, 
                ucp.LastAccessDate, ucp.LastVideoID
            ORDER BY ISNULL(ucp.LastAccessDate, uce.EnrollmentDate) DESC
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        enrolled_courses = []
        
        for row in cursor.fetchall():
            course = dict(zip(columns, row))
            
            # İlerleme videosu bilgilerini ekle
            if course['LastVideoID']:
                cursor.execute("""
                    SELECT Title, OrderInCourse
                    FROM CourseVideos
                    WHERE VideoID = %s
                """, [course['LastVideoID']])
                
                last_video = cursor.fetchone()
                if last_video:
                    course['last_video'] = {
                        'id': course['LastVideoID'],
                        'title': last_video[0],
                        'order': last_video[1]
                    }
            
            enrolled_courses.append(course)
    
        return Response({'courses': enrolled_courses})

@swagger_auto_schema(
    method='post',
    responses={
        200: openapi.Response('Başarılı yanıt', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'success': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        400: 'Geçersiz istek',
        404: 'Kayıt bulunamadı'
    },
    operation_description="Kullanıcı için kursu tamamlandı olarak işaretler"
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_course_complete(request, course_id):
    """Kursu tamamlandı olarak işaretleyen endpoint"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Kullanıcının kursa kayıtlı olup olmadığını kontrol et
        cursor.execute("""
            SELECT ProgressID
            FROM UserCourseProgress
            WHERE UserID = %s AND CourseID = %s
        """, [user_id, course_id])
        
        enrollment = cursor.fetchone()
        
        if not enrollment:
            return Response({
                'success': False,
                'error': 'User is not enrolled in this course'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Kursu tamamlandı olarak işaretle
        cursor.execute("""
            UPDATE UserCourseProgress
            SET CompletionPercentage = 100, IsCompleted = 1, CompletionDate = GETDATE()
            WHERE UserID = %s AND CourseID = %s
        """, [user_id, course_id])
        
        # Kurs bilgilerini al
        cursor.execute("""
            SELECT Title FROM Courses WHERE CourseID = %s
        """, [course_id])
        
        course_title = cursor.fetchone()[0]
        
        # Aktivite logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs 
            (UserID, ActivityType, Description, Timestamp)
            VALUES (%s, 'course_completion', %s, GETDATE())
        """, [user_id, f"Completed course: {course_title}"])
        
        # Tamamlama bildirimini ekle
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, RelatedEntityID, CreationDate)
            VALUES (%s, %s, %s, 'achievement', %s, GETDATE())
        """, [
            user_id, 
            "Course Completed", 
            f"Congratulations! You have successfully completed the course: {course_title}", 
            course_id
        ])
        
        # Kullanıcıya puan ekle (örneğin 50 puan)
        cursor.execute("""
            UPDATE Users
            SET TotalPoints = TotalPoints + 50
            WHERE UserID = %s
        """, [user_id])
        
        return Response({
            'success': True,
            'message': 'Course marked as completed successfully'
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_video(request):
    """API endpoint to create a new course video - admin only"""
    user_id = request.user.id
    
    # Check if user is admin
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can create videos'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Get video details
    course_id = request.data.get('course_id')
    youtube_video_id = request.data.get('youtube_video_id')
    title = request.data.get('title')
    description = request.data.get('description', '')
    duration = request.data.get('duration', 0)
    order_in_course = request.data.get('order_in_course', 1)
    
    # Validate required fields
    if not all([course_id, youtube_video_id, title]):
        return Response({
            'error': 'Course ID, YouTube Video ID, and Title are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with connection.cursor() as cursor:
            # Check if course exists
            cursor.execute("""
                SELECT COUNT(*) FROM Courses WHERE CourseID = %s
            """, [course_id])
            
            if cursor.fetchone()[0] == 0:
                return Response({
                    'error': f'Course with ID {course_id} does not exist'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Insert video
            cursor.execute("""
                INSERT INTO CourseVideos
                (CourseID, YouTubeVideoID, Title, Description, Duration, OrderInCourse)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, [
                course_id, youtube_video_id, title, description, duration, order_in_course
            ])
            
            # Get the inserted ID in a separate query
            cursor.execute("SELECT SCOPE_IDENTITY()")
            video_id = cursor.fetchone()[0]
            
            # Update the total videos count in the course
            try:
                cursor.execute("""
                    UPDATE Courses
                    SET TotalVideos = (
                        SELECT COUNT(*) FROM CourseVideos WHERE CourseID = %s
                    )
                    WHERE CourseID = %s
                """, [course_id, course_id])
            except Exception as e:
                print(f"Error updating TotalVideos count: {str(e)}")
        
        # Invalidate cache for course data
        cache.delete(f"course_detail_{course_id}")
        cache.delete_pattern(f"list_courses*")
        
        return Response({
            'message': 'Video created successfully',
            'videoId': video_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error creating video: {str(e)}")
        return Response({
            'error': f'Error creating video: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_enrollment_count(request, course_id):
    """Debugging endpoint to directly check enrollment count for a course"""
    with connection.cursor() as cursor:
        # Directly query the enrollment count
        cursor.execute("""
            SELECT COUNT(DISTINCT UserID) 
            FROM UserCourseEnrollments 
            WHERE CourseID = %s
        """, [course_id])
        
        enrollment_count = cursor.fetchone()[0]
        
        # Also query actual enrollment records
        cursor.execute("""
            SELECT EnrollmentID, UserID, CourseID, EnrollmentDate
            FROM UserCourseEnrollments 
            WHERE CourseID = %s
        """, [course_id])
        
        columns = [col[0] for col in cursor.description]
        enrollments = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Print a detailed log to the server console
        print(f"DEBUG - Course {course_id} enrollment count: {enrollment_count}")
        print(f"DEBUG - Raw enrollment records: {enrollments}")
        
        # Check if the tables exist
        cursor.execute("""
            SELECT 
                OBJECT_ID('UserCourseEnrollments') as EnrollmentsExists,
                OBJECT_ID('UserCourseProgress') as ProgressExists
        """)
        
        table_check = cursor.fetchone()
        tables_exist = {
            'enrollments_table_exists': table_check[0] is not None,
            'progress_table_exists': table_check[1] is not None,
        }
        
    return Response({
        'course_id': course_id,
        'enrollment_count': enrollment_count,
        'enrollments': enrollments,
        'tables_exist': tables_exist
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_video_views(request, video_id):
    """
    Get user's video viewing history for a specific video
    """
    user_id = request.user.id
    
    try:
        # First check if the video exists
        cursor = connection.cursor()
        cursor.execute("""
            SELECT VideoID, YouTubeVideoID, Title, Duration 
            FROM CourseVideos 
            WHERE VideoID = %s
        """, [video_id])
        
        video_data = cursor.fetchone()
        if not video_data:
            # If we didn't find by VideoID, try looking up by YouTubeVideoID
            cursor.execute("""
                SELECT VideoID, YouTubeVideoID, Title, Duration 
                FROM CourseVideos 
                WHERE YouTubeVideoID = %s
            """, [video_id])
            video_data = cursor.fetchone()
            
        if not video_data:
            return Response({"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Get the correct video ID if we found the video
        actual_video_id = video_data[0]
        
        # Check if the lastPosition column exists in UserVideoViews
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'UserVideoViews' 
            AND COLUMN_NAME = 'lastPosition'
        """)
        has_last_position = cursor.fetchone() is not None
        
        # Query for user's viewing history
        if has_last_position:
            query = """
                SELECT ViewID, UserID, VideoID, ViewDate, WatchedPercentage, 
                       IsCompleted, CompletionDate, EarnedPoints, lastPosition
                FROM UserVideoViews
                WHERE UserID = %s AND VideoID = %s
            """
        else:
            query = """
                SELECT ViewID, UserID, VideoID, ViewDate, WatchedPercentage, 
                       IsCompleted, CompletionDate, EarnedPoints
                FROM UserVideoViews
                WHERE UserID = %s AND VideoID = %s
            """
        
        cursor.execute(query, [user_id, actual_video_id])
        view_data = cursor.fetchone()
        
        if view_data:
            video_view = {
                "ViewID": view_data[0],
                "UserID": view_data[1],
                "VideoID": view_data[2],
                "ViewDate": view_data[3].isoformat() if view_data[3] else None,
                "WatchedPercentage": float(view_data[4]) if view_data[4] else 0,
                "IsCompleted": bool(view_data[5]),
                "CompletionDate": view_data[6].isoformat() if view_data[6] else None,
                "EarnedPoints": view_data[7] if view_data[7] else 0
            }
            
            # Add lastPosition if available
            if has_last_position and len(view_data) > 8:
                video_view["lastPosition"] = float(view_data[8]) if view_data[8] else 0
        else:
            video_view = None
        
        return Response({
            "videoId": actual_video_id,
            "videoView": video_view
        })
        
    except Exception as e:
        print(f"Error getting video view data for video {video_id}: {str(e)}")
        return Response(
            {"error": f"Failed to retrieve video view data: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    """Get user's progress for a specific course with detailed video progress information"""
    user_id = request.user.id
    
    try:
        with connection.cursor() as cursor:
            # First check if course exists
            cursor.execute("""
                SELECT CourseID FROM Courses WHERE CourseID = %s
            """, [course_id])
            
            if not cursor.fetchone():
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if user is enrolled in the course
            cursor.execute("""
                SELECT EnrollmentID FROM UserCourseEnrollments 
                WHERE UserID = %s AND CourseID = %s
            """, [user_id, course_id])
            
            is_enrolled = cursor.fetchone() is not None
            
            # Get progress data
            cursor.execute("""
                SELECT CompletionPercentage, IsCompleted, LastAccessDate, LastVideoID
                FROM UserCourseProgress
                WHERE UserID = %s AND CourseID = %s
            """, [user_id, course_id])
            
            progress = cursor.fetchone()
            
            # Check if UserVideoViews table has lastPosition column
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'UserVideoViews' 
                AND COLUMN_NAME = 'lastPosition'
            """)
            has_last_position = cursor.fetchone() is not None
            
            # Get the course videos
            cursor.execute("""
                SELECT cv.VideoID, v.Title, cv.OrderInCourse, v.Duration, v.YouTubeVideoID, 
                       v.Description
                FROM CourseVideos cv
                JOIN Videos v ON cv.VideoID = v.VideoID
                WHERE cv.CourseID = %s
                ORDER BY cv.OrderInCourse
            """, [course_id])
            
            columns = [col[0] for col in cursor.description]
            videos = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Get all video progress in one query for efficiency
            if has_last_position:
                video_progress_query = """
                    SELECT uvv.VideoID, uvv.WatchedPercentage, uvv.IsCompleted, 
                           uvv.LastPosition, uvv.ViewDate
                    FROM UserVideoViews uvv
                    JOIN CourseVideos cv ON uvv.VideoID = cv.VideoID
                    WHERE uvv.UserID = %s AND cv.CourseID = %s
                """
            else:
                video_progress_query = """
                    SELECT uvv.VideoID, uvv.WatchedPercentage, uvv.IsCompleted, 
                           NULL as LastPosition, uvv.ViewDate
                    FROM UserVideoViews uvv
                    JOIN CourseVideos cv ON uvv.VideoID = cv.VideoID
                    WHERE uvv.UserID = %s AND cv.CourseID = %s
                """
            
            cursor.execute(video_progress_query, [user_id, course_id])
            video_progress_data = cursor.fetchall()
            
            # Transform into a dictionary for easy lookup
            video_progress_map = {}
            for row in video_progress_data:
                video_progress_map[row[0]] = {
                    'VideoID': row[0],
                    'WatchedPercentage': float(row[1]) if row[1] else 0,
                    'IsCompleted': bool(row[2]),
                    'LastPosition': float(row[3]) if row[3] else 0,
                    'ViewDate': row[4].isoformat() if row[4] else None
                }
            
            # Get detailed video progress
            video_progress = []
            completed_videos = 0
            total_videos = len(videos)
            
            for video in videos:
                video_id = video['VideoID']
                if video_id in video_progress_map:
                    progress_data = video_progress_map[video_id]
                    if progress_data['IsCompleted']:
                        completed_videos += 1
                    video_progress.append(progress_data)
                else:
                    # No progress data for this video
                    video_progress.append({
                        'VideoID': video_id,
                        'WatchedPercentage': 0,
                        'IsCompleted': False,
                        'LastPosition': 0,
                        'ViewDate': None
                    })
            
            # Calculate actual percentage based on completed videos
            calculated_percentage = (completed_videos / total_videos * 100) if total_videos > 0 else 0
            
            # Last video details
            last_video = None
            if progress and progress[3]:  # LastVideoID
                last_video_id = progress[3]
                matching_videos = [v for v in videos if v['VideoID'] == last_video_id]
                if matching_videos:
                    video = matching_videos[0]
                    last_video = {
                        "id": video['VideoID'],
                        "title": video['Title'],
                        "order": video['OrderInCourse'],
                        "youtube_id": video['YouTubeVideoID']
                    }
            
            # Determine overall progress data
            progress_percentage = float(progress[0]) if progress and progress[0] else calculated_percentage
            is_completed = bool(progress[1]) if progress else False
            last_accessed = progress[2].isoformat() if progress and progress[2] else None
            
            return Response({
                "percentage": progress_percentage,
                "is_completed": is_completed,
                "is_enrolled": is_enrolled,
                "last_accessed": last_accessed,
                "last_video": last_video,
                "completed_videos": completed_videos,
                "total_videos": total_videos,
                "videoProgress": video_progress
            })
            
    except Exception as e:
        print(f"Error getting course progress: {str(e)}")
        return Response(
            {"error": f"Failed to retrieve course progress: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def course_resources(request, course_id):
    """Get resources for a specific course"""
    try:
        with connection.cursor() as cursor:
            # First check if course exists
            cursor.execute("""
                SELECT CourseID FROM Courses WHERE CourseID = %s
            """, [course_id])
            
            if not cursor.fetchone():
                return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if CourseResources table exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'CourseResources'
            """)
            
            if cursor.fetchone()[0] == 0:
                # Table doesn't exist, return empty array
                return Response({"resources": []})
            
            # Get resources for the course
            cursor.execute("""
                SELECT ResourceID, Title, Description, ResourceType, FileURL, OrderInCourse
                FROM CourseResources
                WHERE CourseID = %s
                ORDER BY OrderInCourse
            """, [course_id])
            
            columns = [col[0] for col in cursor.description]
            resources = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            return Response({"resources": resources})
            
    except Exception as e:
        print(f"Error getting course resources: {str(e)}")
        # Return empty array instead of error to not block the UI
        return Response({"resources": []})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def video_quizzes(request, video_id):
    """
    Get quizzes associated with a specific video.
    Delegates to the quizzes app's video_quizzes function.
    """
    from quizzes.views import video_quizzes as quizzes_video_quizzes
    return quizzes_video_quizzes(request, video_id)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_quizzes(request, course_id):
    """
    Get quizzes associated with a specific course.
    Delegates to the quizzes app's course_quizzes function.
    """
    from quizzes.views import course_quizzes as quizzes_course_quizzes
    return quizzes_course_quizzes(request, course_id)

def get_db_connection():
    """Get a connection to the SQL Server database"""
    conn = pyodbc.connect('Driver={SQL Server};'
                      'Server=localhost;'
                      'Database=wisentia;'
                      'Trusted_Connection=yes;')
    return conn

