from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Kullanıcının istatistiklerini getiren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Tamamlanan kurs sayısı
        cursor.execute("""
            SELECT COUNT(*)
            FROM UserCourseProgress
            WHERE UserID = %s AND IsCompleted = 1
        """, [user_id])
        completed_courses = cursor.fetchone()[0]
        
        # Tamamlanan video sayısı
        cursor.execute("""
            SELECT COUNT(*)
            FROM UserVideoViews
            WHERE UserID = %s AND IsCompleted = 1
        """, [user_id])
        completed_videos = cursor.fetchone()[0]
        
        # Tamamlanan görev sayısı
        cursor.execute("""
            SELECT COUNT(*)
            FROM UserQuestProgress
            WHERE UserID = %s AND IsCompleted = 1
        """, [user_id])
        completed_quests = cursor.fetchone()[0]
        
        # Kazanılan NFT sayısı
        cursor.execute("""
            SELECT COUNT(*)
            FROM UserNFTs
            WHERE UserID = %s
        """, [user_id])
        earned_nfts = cursor.fetchone()[0]
        
        # Toplam puanlar
        cursor.execute("""
            SELECT TotalPoints
            FROM Users
            WHERE UserID = %s
        """, [user_id])
        total_points = cursor.fetchone()[0]
        
        # Son 7 günlük aktivite
        cursor.execute("""
            SELECT ActivityType, COUNT(*) as Count
            FROM ActivityLogs
            WHERE UserID = %s AND Timestamp >= DATEADD(day, -7, GETDATE())
            GROUP BY ActivityType
        """, [user_id])
        
        activity_data = {}
        for row in cursor.fetchall():
            activity_data[row[0]] = row[1]
    
    return Response({
        'completedCourses': completed_courses,
        'completedVideos': completed_videos,
        'completedQuests': completed_quests,
        'earnedNFTs': earned_nfts,
        'totalPoints': total_points,
        'recentActivity': activity_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def learning_progress(request):
    """Kullanıcının öğrenme ilerlemesini getiren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Sürmekte olan kurslar
        cursor.execute("""
            SELECT c.CourseID, c.Title, c.Category, c.Difficulty,
                   ucp.CompletionPercentage, ucp.LastAccessDate
            FROM UserCourseProgress ucp
            JOIN Courses c ON ucp.CourseID = c.CourseID
            WHERE ucp.UserID = %s AND ucp.IsCompleted = 0
            ORDER BY ucp.LastAccessDate DESC
        """, [user_id])
        
        ongoing_columns = [col[0] for col in cursor.description]
        ongoing_courses = [dict(zip(ongoing_columns, row)) for row in cursor.fetchall()]
        
        # Tamamlanan kurslar
        cursor.execute("""
            SELECT c.CourseID, c.Title, c.Category, c.Difficulty,
                   ucp.CompletionDate
            FROM UserCourseProgress ucp
            JOIN Courses c ON ucp.CourseID = c.CourseID
            WHERE ucp.UserID = %s AND ucp.IsCompleted = 1
            ORDER BY ucp.CompletionDate DESC
        """, [user_id])
        
        completed_columns = [col[0] for col in cursor.description]
        completed_courses = [dict(zip(completed_columns, row)) for row in cursor.fetchall()]
        
        # Sürmekte olan görevler
        cursor.execute("""
            SELECT q.QuestID, q.Title, q.DifficultyLevel,
                   uqp.CurrentProgress, q.RequiredPoints
            FROM UserQuestProgress uqp
            JOIN Quests q ON uqp.QuestID = q.QuestID
            WHERE uqp.UserID = %s AND uqp.IsCompleted = 0
            ORDER BY q.EndDate DESC
        """, [user_id])
        
        ongoing_quest_columns = [col[0] for col in cursor.description]
        ongoing_quests = [dict(zip(ongoing_quest_columns, row)) for row in cursor.fetchall()]
        
        # Kategori bazında tamamlanan kurslar
        cursor.execute("""
            SELECT c.Category, COUNT(*) as Count
            FROM UserCourseProgress ucp
            JOIN Courses c ON ucp.CourseID = c.CourseID
            WHERE ucp.UserID = %s AND ucp.IsCompleted = 1
            GROUP BY c.Category
        """, [user_id])
        
        category_stats = {}
        for row in cursor.fetchall():
            category_stats[row[0]] = row[1]
    
    return Response({
        'ongoingCourses': ongoing_courses,
        'completedCourses': completed_courses,
        'ongoingQuests': ongoing_quests,
        'categoryStats': category_stats
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def time_spent(request):
    """Kullanıcının platformda geçirdiği zamanı getiren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Son 30 gün için günlük geçirilen süre (dakika)
        cursor.execute("""
            SELECT CAST(Timestamp as DATE) as Date, 
                   SUM(DATEDIFF(MINUTE, SessionStart, SessionEnd)) as MinutesSpent
            FROM (
                SELECT al1.Timestamp, al1.RelatedSessionID as SessionID, 
                       al1.Timestamp as SessionStart,
                       (SELECT MIN(al2.Timestamp) 
                        FROM ActivityLogs al2 
                        WHERE al2.RelatedSessionID = al1.RelatedSessionID 
                          AND al2.Timestamp > al1.Timestamp) as SessionEnd
                FROM ActivityLogs al1
                WHERE al1.UserID = %s 
                  AND al1.ActivityType = 'session_start'
                  AND al1.Timestamp >= DATEADD(day, -30, GETDATE())
            ) as Sessions
            WHERE SessionEnd IS NOT NULL
            GROUP BY CAST(Timestamp as DATE)
            ORDER BY CAST(Timestamp as DATE)
        """, [user_id])
        
        daily_time = {}
        for row in cursor.fetchall():
            daily_time[row[0].strftime('%Y-%m-%d')] = row[1]
        
        # Video izleme süresi (toplam, dakika)
        cursor.execute("""
            SELECT ISNULL(SUM(cv.Duration) / 60, 0) as TotalMinutes
            FROM UserVideoViews uvv
            JOIN CourseVideos cv ON uvv.VideoID = cv.VideoID
            WHERE uvv.UserID = %s AND uvv.IsCompleted = 1
        """, [user_id])
        
        total_video_time = cursor.fetchone()[0]
        
        # Son oturum süresi
        cursor.execute("""
            SELECT TOP 1 DATEDIFF(MINUTE, 
                        (SELECT MIN(Timestamp) 
                         FROM ActivityLogs 
                         WHERE RelatedSessionID = al.RelatedSessionID),
                        (SELECT MAX(Timestamp) 
                         FROM ActivityLogs 
                         WHERE RelatedSessionID = al.RelatedSessionID))
            FROM ActivityLogs al
            WHERE al.UserID = %s AND al.ActivityType = 'session_start'
            ORDER BY al.Timestamp DESC
        """, [user_id])
        
        result = cursor.fetchone()
        last_session_time = result[0] if result else 0
    
    return Response({
        'dailyTimeSpent': daily_time,
        'totalVideoTime': total_video_time,
        'lastSessionTime': last_session_time
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """Admin dashboard istatistiklerini getiren API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()[0]
        
        if user_role != 'admin':
            return Response({'error': 'Only administrators can access the admin dashboard'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Toplam kullanıcı sayısı
        cursor.execute("SELECT COUNT(*) FROM Users")
        total_users = cursor.fetchone()[0]
        
        # Aktif kullanıcı sayısı (son 7 gün)
        cursor.execute("""
            SELECT COUNT(DISTINCT UserID) 
            FROM ActivityLogs
            WHERE Timestamp >= DATEADD(day, -7, GETDATE())
        """)
        active_users = cursor.fetchone()[0]
        
        # Toplam kurs sayısı
        cursor.execute("SELECT COUNT(*) FROM Courses WHERE IsActive = 1")
        total_courses = cursor.fetchone()[0]
        
        # Toplam görev sayısı
        cursor.execute("SELECT COUNT(*) FROM Quests WHERE IsActive = 1")
        total_quests = cursor.fetchone()[0]
        
        # Toplam NFT sayısı
        cursor.execute("SELECT COUNT(*) FROM NFTs WHERE IsActive = 1")
        total_nfts = cursor.fetchone()[0]
        
        # En popüler kurslar
        cursor.execute("""
            SELECT TOP 5 c.CourseID, c.Title, COUNT(ucp.UserID) as EnrolledUsers
            FROM Courses c
            JOIN UserCourseProgress ucp ON c.CourseID = ucp.CourseID
            GROUP BY c.CourseID, c.Title
            ORDER BY EnrolledUsers DESC
        """)
        
        popular_courses_columns = [col[0] for col in cursor.description]
        popular_courses = [dict(zip(popular_courses_columns, row)) for row in cursor.fetchall()]
        
        # Günlük yeni kullanıcılar (son 30 gün)
        cursor.execute("""
            SELECT CAST(JoinDate as DATE) as Date, COUNT(*) as NewUsers
            FROM Users
            WHERE JoinDate >= DATEADD(day, -30, GETDATE())
            GROUP BY CAST(JoinDate as DATE)
            ORDER BY CAST(JoinDate as DATE)
        """)
        
        daily_new_users = {}
        for row in cursor.fetchall():
            daily_new_users[row[0].strftime('%Y-%m-%d')] = row[1]
    
    return Response({
        'totalUsers': total_users,
        'activeUsers': active_users,
        'totalCourses': total_courses,
        'totalQuests': total_quests,
        'totalNFTs': total_nfts,
        'popularCourses': popular_courses,
        'dailyNewUsers': daily_new_users
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_event(request):
    """Kullanıcı etkinliğini takip eden API endpoint'i"""
    user_id = request.user.id
    event_type = request.data.get('eventType')
    description = request.data.get('description', '')
    related_entity_id = request.data.get('relatedEntityId')
    related_session_id = request.data.get('sessionId')
    
    if not event_type:
        return Response({'error': 'Event type is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent, 
             RelatedEntityID, RelatedSessionID)
            VALUES (%s, %s, %s, GETDATE(), %s, %s, %s, %s)
        """, [
            user_id, 
            event_type, 
            description, 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', ''),
            related_entity_id,
            related_session_id
        ])
    
    return Response({'message': 'Event tracked successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activity_summary(request):
    """Kullanıcının son aktivitelerini özet olarak raporlar"""
    user_id = request.user.id
    days = int(request.query_params.get('days', 30))  # Son 30 gün
    
    with connection.cursor() as cursor:
        # Aktivite özetini al
        cursor.execute("""
            SELECT ActivityType, COUNT(*) as Count
            FROM ActivityLogs
            WHERE UserID = %s 
              AND Timestamp >= DATEADD(day, -%s, GETDATE())
            GROUP BY ActivityType
            ORDER BY Count DESC
        """, [user_id, days])
        
        activity_columns = [col[0] for col in cursor.description]
        activities_by_type = [dict(zip(activity_columns, row)) for row in cursor.fetchall()]
        
        # Günlük aktivite sayısını al
        cursor.execute("""
            SELECT CAST(Timestamp as DATE) as Date, COUNT(*) as Count
            FROM ActivityLogs
            WHERE UserID = %s 
              AND Timestamp >= DATEADD(day, -%s, GETDATE())
            GROUP BY CAST(Timestamp as DATE)
            ORDER BY CAST(Timestamp as DATE)
        """, [user_id, days])
        
        daily_columns = [col[0] for col in cursor.description]
        daily_activities = {}
        
        for row in cursor.fetchall():
            data = dict(zip(daily_columns, row))
            daily_activities[data['Date'].strftime('%Y-%m-%d')] = data['Count']
        
        # En aktif zamanları al (saat bazında)
        cursor.execute("""
            SELECT DATEPART(hour, Timestamp) as Hour, COUNT(*) as Count
            FROM ActivityLogs
            WHERE UserID = %s 
              AND Timestamp >= DATEADD(day, -%s, GETDATE())
            GROUP BY DATEPART(hour, Timestamp)
            ORDER BY Hour
        """, [user_id, days])
        
        hour_columns = [col[0] for col in cursor.description]
        hourly_activity = {}
        
        for row in cursor.fetchall():
            data = dict(zip(hour_columns, row))
            hourly_activity[data['Hour']] = data['Count']
    
    return Response({
        'activitiesByType': activities_by_type,
        'dailyActivities': daily_activities,
        'hourlyActivity': hourly_activity,
        'period': f"Last {days} days"
    })