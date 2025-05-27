from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
import requests  # Eksik import eklendi
from django.conf import settings  # Eksik import eklendi
import logging
from wisentia_backend.utils import invalidate_cache
from django.core.cache import cache
from django.http import JsonResponse
import json
import sys
import re
import os
import uuid

# Yeni importlar
from nfts.nft_service import NFTService
from nfts.ipfs import IPFSService
import base64

logger = logging.getLogger('wisentia')


def fetch_youtube_channel_name(video_id):
    """Fetch YouTube channel name for a given video ID"""
    try:
        # Using the oEmbed endpoint which doesn't require API key
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            # The author_name field contains the channel name
            channel_name = data.get('author_name', '')
            print(f"✅ Successfully fetched YouTube channel name: {channel_name}")
            return channel_name
        else:
            print(f"⚠️ Failed to fetch YouTube data: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error fetching YouTube channel name: {str(e)}")
        return None


def is_admin(user_id):
    """Kullanıcının admin olup olmadığını kontrol eder"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        return user_role and user_role[0] == 'admin'

@api_view(['GET'])  # Sadece GET metodunu kabul ettiğini belirtin
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """Admin dashboard verilerini getiren API endpoint'i"""
    print(f"✅ API HIT: /admin/dashboard/")
    print(f"✅ Authenticated user ID: {request.user.id}")
    print(f"✅ Authenticated user role: {request.user.role if hasattr(request.user, 'role') else 'unknown'}")
    
    user_id = request.user.id
    
    if not is_admin(user_id):
        print(f"❌ Access denied for user {user_id}: Not admin")
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    with connection.cursor() as cursor:
        # Özet istatistikler
        cursor.execute("""
            SELECT
                (SELECT COUNT(*) FROM Users) as TotalUsers,
                (SELECT COUNT(*) FROM Users WHERE DATEDIFF(day, JoinDate, GETDATE()) <= 30) as NewUsers,
                (SELECT COUNT(*) FROM Courses WHERE IsActive = 1) as ActiveCourses,
                (SELECT COUNT(*) FROM Quests WHERE IsActive = 1) as ActiveQuests,
                (SELECT COUNT(*) FROM NFTs WHERE IsActive = 1) as TotalNFTs,
                (SELECT COUNT(*) FROM UserSubscriptions WHERE IsActive = 1) as ActiveSubscriptions
        """)
        
        stats = cursor.fetchone()
        summary = {
            'totalUsers': stats[0],
            'newUsers': stats[1],
            'activeCourses': stats[2],
            'activeQuests': stats[3],
            'totalNFTs': stats[4],
            'activeSubscriptions': stats[5]
        }
        
        # En aktif kullanıcılar (son 30 gün)
        cursor.execute("""
            SELECT TOP 5 u.UserID, u.Username, COUNT(al.LogID) as ActivityCount
            FROM Users u
            JOIN ActivityLogs al ON u.UserID = al.UserID
            WHERE al.Timestamp >= DATEADD(day, -30, GETDATE())
            GROUP BY u.UserID, u.Username
            ORDER BY ActivityCount DESC
        """)
        
        active_users_columns = [col[0] for col in cursor.description]
        active_users = [dict(zip(active_users_columns, row)) for row in cursor.fetchall()]
        
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
        
        # En son aktiviteler
        cursor.execute("""
            SELECT TOP 20 al.LogID, u.Username, al.ActivityType, 
                   al.Description, al.Timestamp
            FROM ActivityLogs al
            JOIN Users u ON al.UserID = u.UserID
            ORDER BY al.Timestamp DESC
        """)
        
        recent_activities_columns = [col[0] for col in cursor.description]
        recent_activities = [dict(zip(recent_activities_columns, row)) for row in cursor.fetchall()]
    
    return Response({
        'summary': summary,
        'activeUsers': active_users,
        'popularCourses': popular_courses,
        'dailyNewUsers': daily_new_users,
        'recentActivities': recent_activities
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_management(request):
    """Kullanıcı yönetimi için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('pageSize', 20))
    search = request.query_params.get('search', '')
    role_filter = request.query_params.get('role', '')
    
    offset = (page - 1) * page_size
    
    query_params = []
    where_clauses = []
    
    if search:
        where_clauses.append("(Username LIKE %s OR Email LIKE %s)")
        search_pattern = f"%{search}%"
        query_params.extend([search_pattern, search_pattern])
    
    if role_filter:
        where_clauses.append("UserRole = %s")
        query_params.append(role_filter)
    
    where_sql = " AND ".join(where_clauses)
    if where_sql:
        where_sql = "WHERE " + where_sql
    
    count_sql = f"SELECT COUNT(*) FROM Users {where_sql}"
    
    with connection.cursor() as cursor:
        cursor.execute(count_sql, query_params)
        total_count = cursor.fetchone()[0]
        
        user_sql = f"""
            SELECT UserID, Username, Email, WalletAddress, JoinDate, LastLogin, 
                   UserRole, ProfileImage, ThemePreference, TotalPoints, IsActive
            FROM Users
            {where_sql}
            ORDER BY JoinDate DESC
            OFFSET {offset} ROWS
            FETCH NEXT {page_size} ROWS ONLY
        """
        
        cursor.execute(user_sql, query_params)
        columns = [col[0] for col in cursor.description]
        users = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response({
        'users': users,
        'totalCount': total_count,
        'page': page,
        'pageSize': page_size,
        'totalPages': (total_count + page_size - 1) // page_size
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_details(request, user_id):
    """Kullanıcı detaylarını getiren API endpoint'i"""
    admin_id = request.user.id
    
    if not is_admin(admin_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    with connection.cursor() as cursor:
        # Kullanıcı bilgilerini al
        cursor.execute("""
            SELECT UserID, Username, Email, WalletAddress, JoinDate, LastLogin, 
                   UserRole, ProfileImage, ThemePreference, TotalPoints, IsActive
            FROM Users
            WHERE UserID = %s
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        user_data = cursor.fetchone()
        
        if not user_data:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = dict(zip(columns, user_data))
        
        # Kullanıcı istatistiklerini al
        cursor.execute("""
            SELECT
                (SELECT COUNT(*) FROM UserCourseProgress WHERE UserID = %s AND IsCompleted = 1) as CompletedCourses,
                (SELECT COUNT(*) FROM UserVideoViews WHERE UserID = %s AND IsCompleted = 1) as WatchedVideos,
                (SELECT COUNT(*) FROM UserQuizAttempts WHERE UserID = %s AND Passed = 1) as PassedQuizzes,
                (SELECT COUNT(*) FROM UserQuestProgress WHERE UserID = %s AND IsCompleted = 1) as CompletedQuests,
                (SELECT COUNT(*) FROM UserNFTs WHERE UserID = %s) as OwnedNFTs,
                (SELECT COUNT(*) FROM UserSubscriptions WHERE UserID = %s AND IsActive = 1) as ActiveSubscriptions
        """, [user_id, user_id, user_id, user_id, user_id, user_id])
        
        stats = cursor.fetchone()
        user_stats = {
            'completedCourses': stats[0],
            'watchedVideos': stats[1],
            'passedQuizzes': stats[2],
            'completedQuests': stats[3],
            'ownedNFTs': stats[4],
            'activeSubscriptions': stats[5]
        }
        
        # Son aktiviteler
        cursor.execute("""
            SELECT TOP 10 ActivityType, Description, Timestamp
            FROM ActivityLogs
            WHERE UserID = %s
            ORDER BY Timestamp DESC
        """, [user_id])
        
        activity_columns = [col[0] for col in cursor.description]
        recent_activities = [dict(zip(activity_columns, row)) for row in cursor.fetchall()]
    
    return Response({
        'user': user,
        'stats': user_stats,
        'recentActivities': recent_activities
    })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    """Kullanıcı bilgilerini güncelleyen API endpoint'i"""
    admin_id = request.user.id
    
    if not is_admin(admin_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Güncellenecek alanları al
    username = request.data.get('username')
    email = request.data.get('email')
    user_role = request.data.get('userRole')
    is_active = request.data.get('isActive')
    
    update_fields = []
    params = []
    
    if username:
        update_fields.append("Username = %s")
        params.append(username)
    
    if email:
        update_fields.append("Email = %s")
        params.append(email)
    
    if user_role:
        update_fields.append("UserRole = %s")
        params.append(user_role)
    
    if is_active is not None:
        update_fields.append("IsActive = %s")
        params.append(is_active)
    
    if not update_fields:
        return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Kullanıcıyı kontrol et
        cursor.execute("SELECT UserID FROM Users WHERE UserID = %s", [user_id])
        if not cursor.fetchone():
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Kullanıcıyı güncelle
        sql = f"UPDATE Users SET {', '.join(update_fields)} WHERE UserID = %s"
        params.append(user_id)
        
        cursor.execute(sql, params)
        
        # Güncellenmiş kullanıcıyı getir
        cursor.execute("""
            SELECT UserID, Username, Email, UserRole, IsActive
            FROM Users
            WHERE UserID = %s
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        updated_user = dict(zip(columns, cursor.fetchone()))
    
    return Response({
        'message': 'User updated successfully',
        'user': updated_user
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def content_management(request):
    """İçerik yönetimi için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    content_type = request.query_params.get('type', 'courses')  # courses, quests, nfts
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('pageSize', 20))
    course_id = request.query_params.get('course_id')
    
    offset = (page - 1) * page_size
    
    with connection.cursor() as cursor:
        if content_type == 'courses':
            # Check if we're requesting a specific course with videos
            if course_id:
                try:
                    # Fetch basic course information
                    cursor.execute("""
                        SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty, 
                               c.CreationDate, c.UpdatedDate, c.IsActive, c.ThumbnailURL, 
                               COALESCE(c.YouTubeChannelName, '') as YouTubeChannelName,
                               u.Username as AdminCreator,
                               ISNULL(c.TotalVideos, 0) as TotalVideos
                        FROM Courses c
                        LEFT JOIN Users u ON c.CreatedBy = u.UserID
                        WHERE c.CourseID = %s
                    """, [course_id])
                    
                    columns = [col[0] for col in cursor.description]
                    course_data = cursor.fetchone()
                    
                    if not course_data:
                        return Response({
                            'error': f'Course with ID {course_id} not found'
                        }, status=status.HTTP_404_NOT_FOUND)
                    
                    course = dict(zip(columns, course_data))
                    
                    # Use YouTube channel name as Creator if available, otherwise use admin username
                    if course.get('YouTubeChannelName'):
                        course['Creator'] = course['YouTubeChannelName']
                    else:
                        course['Creator'] = course['AdminCreator']
                        
                    # Remove the original fields to clean up the response
                    if 'YouTubeChannelName' in course:
                        del course['YouTubeChannelName']
                    if 'AdminCreator' in course:
                        del course['AdminCreator']
                    
                    # Fetch videos for the course
                    cursor.execute("""
                        SELECT VideoID, Title, Description, YouTubeVideoID, Duration, OrderInCourse
                        FROM CourseVideos
                        WHERE CourseID = %s
                        ORDER BY OrderInCourse
                    """, [course_id])
                    
                    video_columns = [col[0] for col in cursor.description]
                    videos = [dict(zip(video_columns, row)) for row in cursor.fetchall()]
                    
                    # Add videos to the course data
                    course['videos'] = videos
                    
                    # Calculate totalDuration from videos
                    total_duration = sum(video.get('Duration', 0) or 0 for video in videos)
                    course['totalDuration'] = total_duration
                    
                    # Update the TotalVideos value if it doesn't match
                    if course.get('TotalVideos', 0) != len(videos):
                        try:
                            cursor.execute("""
                                UPDATE Courses
                                SET TotalVideos = %s
                                WHERE CourseID = %s
                            """, [len(videos), course_id])
                            course['TotalVideos'] = len(videos)
                        except Exception as e:
                            print(f"Error updating TotalVideos: {str(e)}")
                    
                    return Response(course)
                    
                except Exception as e:
                    print(f"Error fetching course details: {e}")
                    return Response({
                        'error': f'Error fetching course details: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # List all courses if no course_id specified
            cursor.execute("SELECT COUNT(*) FROM Courses")
            total_count = cursor.fetchone()[0]
            
            # Check if YouTubeChannelName column exists, add it if not
            try:
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Courses' AND COLUMN_NAME = 'YouTubeChannelName'
                """)
                
                if cursor.fetchone()[0] == 0:
                    cursor.execute("""
                        ALTER TABLE Courses
                        ADD YouTubeChannelName NVARCHAR(255) NULL
                    """)
                    print("✅ Added YouTubeChannelName column to Courses table in content_management")
            except Exception as e:
                print(f"⚠️ Error checking/adding YouTubeChannelName column: {str(e)}")
                # Continue anyway
            
            # Use COALESCE to handle NULL values safely
            cursor.execute(f"""
                SELECT c.CourseID, c.Title, c.Category, c.Difficulty, c.CreationDate, 
                       c.IsActive, u.Username as AdminCreator, COALESCE(c.YouTubeChannelName, '') as YouTubeChannelName,
                       (SELECT COUNT(*) FROM UserCourseProgress WHERE CourseID = c.CourseID) as EnrolledUsers
                FROM Courses c
                LEFT JOIN Users u ON c.CreatedBy = u.UserID
                ORDER BY c.CreationDate DESC
                OFFSET {offset} ROWS
                FETCH NEXT {page_size} ROWS ONLY
            """)
            
            columns = [col[0] for col in cursor.description]
            raw_items = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Process each item to use YouTubeChannelName as Creator where available
            items = []
            for course in raw_items:
                # Use YouTube channel name as Creator if available, otherwise use admin username
                if course.get('YouTubeChannelName'):
                    course['Creator'] = course['YouTubeChannelName']
                else:
                    course['Creator'] = course['AdminCreator']
                # Remove the original fields to clean up the response
                if 'YouTubeChannelName' in course:
                    del course['YouTubeChannelName']
                if 'AdminCreator' in course:
                    del course['AdminCreator']
                items.append(course)
            
        elif content_type == 'quests':
            # Get query parameters for filtering
            search = request.query_params.get('search', '')
            difficulty = request.query_params.get('difficulty', '')
            status = request.query_params.get('active')
            ai_generated = request.query_params.get('aiGenerated')
            
            # Build query conditions
            conditions = []
            params = []
            
            if search:
                conditions.append("(q.Title LIKE %s OR q.Description LIKE %s)")
                search_pattern = f"%{search}%"
                params.extend([search_pattern, search_pattern])
                
            if difficulty:
                conditions.append("q.DifficultyLevel = %s")
                params.append(difficulty)
                
            if status is not None:
                is_active = 1 if status.lower() == 'true' else 0
                conditions.append("q.IsActive = %s")
                params.append(is_active)
                
            if ai_generated is not None:
                is_ai_generated = 1 if ai_generated.lower() == 'true' else 0
                conditions.append("q.IsAIGenerated = %s")
                params.append(is_ai_generated)
                
            where_clause = ""
            if conditions:
                where_clause = "WHERE " + " AND ".join(conditions)
            
            # Count total quests with filters
            count_sql = f"SELECT COUNT(*) FROM Quests q {where_clause}"
            cursor.execute(count_sql, params)
            total_count = cursor.fetchone()[0]
            
            # Get quests with pagination
            quest_sql = f"""
                SELECT q.QuestID, q.Title, q.Description, q.DifficultyLevel, 
                       q.RequiredPoints, q.RewardPoints, q.IsActive, q.IsAIGenerated, 
                       q.CreationDate, q.StartDate, q.EndDate, q.RewardNFTID
                FROM Quests q
                {where_clause}
                ORDER BY q.CreationDate DESC
                OFFSET {offset} ROWS
                FETCH NEXT {page_size} ROWS ONLY
            """
            
            cursor.execute(quest_sql, params)
            columns = [col[0] for col in cursor.description]
            items = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Add quest conditions count
            for quest in items:
                quest_id = quest['QuestID']
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM QuestConditions
                    WHERE QuestID = %s
                """, [quest_id])
                
                condition_count = cursor.fetchone()[0]
                quest['ConditionCount'] = condition_count
            
        elif content_type == 'nfts':
            # NFT'leri listele
            cursor.execute("SELECT COUNT(*) FROM NFTs")
            total_count = cursor.fetchone()[0]
            
            cursor.execute(f"""
                SELECT n.NFTID, n.Title, nt.TypeName as NFTType, n.TradeValue, 
                       n.SubscriptionDays, n.IsActive,
                       (SELECT COUNT(*) FROM UserNFTs WHERE NFTID = n.NFTID) as OwnedCount
                FROM NFTs n
                JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                ORDER BY n.NFTID DESC
                OFFSET {offset} ROWS
                FETCH NEXT {page_size} ROWS ONLY
            """)
            
            columns = [col[0] for col in cursor.description]
            items = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
        else:
            return Response({'error': 'Invalid content type'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'items': items,
        'totalCount': total_count,
        'page': page,
        'pageSize': page_size,
        'totalPages': (total_count + page_size - 1) // page_size
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_management(request):
    """Abonelik yönetimi için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    with connection.cursor() as cursor:
        # Abonelik planları
        cursor.execute("""
            SELECT sp.PlanID, sp.PlanName, sp.Description, sp.DurationDays, sp.Price,
                   n.Title as NFTTitle, sp.Features, sp.IsActive
            FROM SubscriptionPlans sp
            LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
        """)
        
        plan_columns = [col[0] for col in cursor.description]
        plans = [dict(zip(plan_columns, row)) for row in cursor.fetchall()]
        
        # Aktif abonelikler sayısı
        cursor.execute("""
            SELECT sp.PlanID, sp.PlanName, COUNT(us.SubscriptionID) as ActiveCount
            FROM SubscriptionPlans sp
            LEFT JOIN UserSubscriptions us ON sp.PlanID = us.PlanID AND us.IsActive = 1
            GROUP BY sp.PlanID, sp.PlanName
        """)
        
        subscription_stats = {}
        for row in cursor.fetchall():
            subscription_stats[row[0]] = {
                'planName': row[1],
                'activeCount': row[2]
            }
        
        # Son abonelikler
        cursor.execute("""
            SELECT TOP 10 us.SubscriptionID, u.Username, sp.PlanName, 
                   us.StartDate, us.EndDate, us.IsActive
            FROM UserSubscriptions us
            JOIN Users u ON us.UserID = u.UserID
            JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
            ORDER BY us.StartDate DESC
        """)
        
        recent_columns = [col[0] for col in cursor.description]
        recent_subscriptions = [dict(zip(recent_columns, row)) for row in cursor.fetchall()]
    
    return Response({
        'plans': plans,
        'stats': subscription_stats,
        'recentSubscriptions': recent_subscriptions
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    """Yeni kurs oluşturan API endpoint'i"""
    user_id = request.user.id
    
    # Debug logging
    print(f"✅ Create course API called by user ID: {user_id}")
    print(f"✅ Request data: {request.data}")
    
    if not is_admin(user_id):
        print(f"❌ User {user_id} is not admin - Access denied")
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Kurs bilgilerini al
    title = request.data.get('title')
    description = request.data.get('description')
    category = request.data.get('category')
    difficulty = request.data.get('difficulty')
    thumbnail_url = request.data.get('thumbnailUrl')
    
    # Log each field individually for better debugging
    print(f"✅ title: {title}")
    print(f"✅ description: {description}")
    print(f"✅ category: {category}")
    print(f"✅ difficulty: {difficulty}")
    print(f"✅ thumbnail_url: {thumbnail_url}")
    
    # Zorunlu alanları kontrol et
    if not all([title, category, difficulty]):
        print(f"❌ Missing required fields")
        return Response({
            'error': 'Title, category and difficulty are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Add TotalVideos column if it doesn't exist
        with connection.cursor() as cursor:
            try:
                # Check if TotalVideos column exists
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Courses' AND COLUMN_NAME = 'TotalVideos'
                """)
                
                if cursor.fetchone()[0] == 0:
                    # Add the TotalVideos column to the Courses table
                    cursor.execute("""
                        ALTER TABLE Courses
                        ADD TotalVideos INT DEFAULT 0
                    """)
                    print("✅ Added TotalVideos column to Courses table")
                
                # Check if YouTubeChannelName column exists
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Courses' AND COLUMN_NAME = 'YouTubeChannelName'
                """)
                
                if cursor.fetchone()[0] == 0:
                    # Add the YouTubeChannelName column to the Courses table
                    cursor.execute("""
                        ALTER TABLE Courses
                        ADD YouTubeChannelName NVARCHAR(255) NULL
                    """)
                    print("✅ Added YouTubeChannelName column to Courses table")
            except Exception as e:
                print(f"⚠️ Error checking or adding columns: {str(e)}")
                # Continue with course creation even if column check/add fails
        
        course_id = None
        with connection.cursor() as cursor:
            # Yeni kurs oluştur - SQL Server için düzeltme
            cursor.execute("""
                INSERT INTO Courses
                (Title, Description, Category, Difficulty, CreationDate, UpdatedDate, 
                 IsActive, ThumbnailURL, CreatedBy, TotalVideos)
                VALUES (%s, %s, %s, %s, GETDATE(), GETDATE(), 1, %s, %s, 0);
            """, [
                title, description, category, difficulty, thumbnail_url, user_id
            ])
            print("✅ Course inserted into database")
            
            # Ayrı bir sorgu ile son eklenen ID'yi al
            cursor.execute("SELECT SCOPE_IDENTITY();")
            course_id = cursor.fetchone()[0]
            print(f"✅ Retrieved course_id: {course_id}")
            
            # Verify the course ID by querying the newly created course
            try:
                cursor.execute("""
                    SELECT CourseID, Title FROM Courses 
                    WHERE CourseID = %s
                """, [course_id])
                verification = cursor.fetchone()
                if verification:
                    print(f"✅ Verified course in database. ID: {verification[0]}, Title: {verification[1]}")
                else:
                    print(f"⚠️ Course created but not found in verification query")
            except Exception as e:
                print(f"⚠️ Error verifying created course: {str(e)}")
        
        # Aktivite logu ekle
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp)
                    VALUES (%s, 'admin_action', %s, GETDATE())
                """, [
                    user_id, f"Created course: {title}"
                ])
                print("✅ Added activity log entry")
        except Exception as e:
            print(f"⚠️ Error adding activity log: {str(e)}")
            # Non-critical, continue
        
        # Cache temizle
        try:
            invalidate_cache(f"{settings.CACHE_KEY_PREFIX}courses_list*")
            print("✅ Cache invalidated")
        except Exception as e:
            print(f"⚠️ Error invalidating cache: {str(e)}")
            # Non-critical, continue

        # Ensure course_id is an integer
        if course_id:
            try:
                course_id = int(float(course_id))
                print(f"✅ Final course_id for response: {course_id}")
            except (ValueError, TypeError) as e:
                print(f"⚠️ Error converting course_id to int: {str(e)}")
        
        # Add both camelCase and snake_case versions of the ID to prevent naming issues
        response_data = {
            'message': 'Course created successfully',
            'courseId': course_id,
            'course_id': course_id
        }
        print(f"✅ Response data: {response_data}")
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"❌ Error creating course: {str(e)}")
        return Response({
            'error': f'Error creating course: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_by_title(request):
    """Get most recently created course by title (used to retrieve course ID after creation)"""
    user_id = request.user.id
    
    # Debug logging
    print(f"✅ Get course by title API called by user ID: {user_id}")
    
    if not is_admin(user_id):
        print(f"❌ User {user_id} is not admin - Access denied")
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Get title parameter
    title = request.GET.get('title')
    if not title:
        print(f"❌ Missing required parameter: title")
        return Response({
            'error': 'Title parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    print(f"✅ Searching for course with title: {title}")
    
    try:
        with connection.cursor() as cursor:
            # Find the most recent course with the given title
            cursor.execute("""
                SELECT TOP 1 CourseID, Title, Category, Difficulty, CreationDate, IsActive
                FROM Courses 
                WHERE Title = %s
                ORDER BY CreationDate DESC, CourseID DESC
            """, [title])
            
            columns = [col[0] for col in cursor.description]
            course = cursor.fetchone()
            
            if not course:
                print(f"❌ No course found with title: {title}")
                return Response({
                    'error': f'No course found with title: {title}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Convert to dict
            course_dict = dict(zip(columns, course))
            
            # Add camelCase version of courseId to prevent field name issues
            result = {
                'courseId': course_dict['CourseID'],
                'title': course_dict['Title'],
                'category': course_dict['Category'],
                'difficulty': course_dict['Difficulty'],
                'creationDate': course_dict['CreationDate'].isoformat() if course_dict['CreationDate'] else None,
                'isActive': bool(course_dict['IsActive'])
            }
            
            print(f"✅ Found course with ID: {result['courseId']}")
            return Response(result)
            
    except Exception as e:
        print(f"❌ Error finding course by title: {str(e)}")
        return Response({
            'error': f'Error finding course by title: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_health(request):
    """Sistem sağlığı ve istatistikleri hakkında bilgi veren API endpoint'i"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can access system health'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Sistem istatistikleri
        system_stats = {}
        
        # Kullanıcı istatistikleri
        cursor.execute("""
            SELECT 
                COUNT(*) as TotalUsers,
                SUM(CASE WHEN DATEDIFF(day, JoinDate, GETDATE()) <= 30 THEN 1 ELSE 0 END) as NewUsers30Days,
                SUM(CASE WHEN LastLogin >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END) as ActiveUsers7Days,
                SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) as InactiveUsers
            FROM Users
        """)
        
        user_stats = cursor.fetchone()
        system_stats['users'] = {
            'total': user_stats[0],
            'newLast30Days': user_stats[1],
            'activeLast7Days': user_stats[2],
            'inactive': user_stats[3]
        }
        
        # İçerik istatistikleri
        cursor.execute("""
            SELECT
                (SELECT COUNT(*) FROM Courses WHERE IsActive = 1) as ActiveCourses,
                (SELECT COUNT(*) FROM Quests WHERE IsActive = 1) as ActiveQuests,
                (SELECT COUNT(*) FROM NFTs WHERE IsActive = 1) as TotalNFTs,
                (SELECT COUNT(*) FROM CommunityPosts WHERE IsActive = 1) as CommunityPosts
        """)
        
        content_stats = cursor.fetchone()
        system_stats['content'] = {
            'courses': content_stats[0],
            'quests': content_stats[1],
            'nfts': content_stats[2],
            'communityPosts': content_stats[3]
        }
        
        # Aktivite istatistikleri
        cursor.execute("""
            SELECT 
                COUNT(*) as TotalActivities,
                COUNT(DISTINCT UserID) as UniqueUsers,
                MAX(Timestamp) as LastActivity
            FROM ActivityLogs
            WHERE Timestamp >= DATEADD(day, -7, GETDATE())
        """)
        
        activity_stats = cursor.fetchone()
        system_stats['activity'] = {
            'totalLast7Days': activity_stats[0],
            'uniqueUsersLast7Days': activity_stats[1],
            'lastActivityTime': activity_stats[2]
        }
        
        # Günlük yeni kullanıcılar (son 30 gün)
        cursor.execute("""
            SELECT CAST(JoinDate as DATE) as Date, COUNT(*) as Count
            FROM Users
            WHERE JoinDate >= DATEADD(day, -30, GETDATE())
            GROUP BY CAST(JoinDate as DATE)
            ORDER BY CAST(JoinDate as DATE)
        """)
        
        daily_new_users = {}
        for row in cursor.fetchall():
            daily_new_users[row[0].strftime('%Y-%m-%d')] = row[1]
        
        system_stats['userGrowth'] = daily_new_users
        
        # Abonelik istatistikleri
        cursor.execute("""
            SELECT 
                COUNT(*) as TotalSubscriptions,
                SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) as ActiveSubscriptions,
                SUM(CASE WHEN AutoRenew = 1 THEN 1 ELSE 0 END) as AutoRenewEnabled
            FROM UserSubscriptions
        """)
        
        subscription_stats = cursor.fetchone()
        system_stats['subscriptions'] = {
            'total': subscription_stats[0],
            'active': subscription_stats[1],
            'autoRenewEnabled': subscription_stats[2]
        }
        
        # Sistem uyarıları
        warnings = []
        
        # Yakında sona erecek abonelikler
        cursor.execute("""
            SELECT COUNT(*)
            FROM UserSubscriptions
            WHERE IsActive = 1 
              AND EndDate BETWEEN GETDATE() AND DATEADD(day, 7, GETDATE())
              AND AutoRenew = 0
        """)
        
        expiring_subs = cursor.fetchone()[0]
        if expiring_subs > 0:
            warnings.append({
                'type': 'subscription',
                'severity': 'info',
                'message': f"{expiring_subs} subscription(s) will expire in the next 7 days"
            })
        
        # AI servis kontrolü
        try:
            health_check_url = f"{settings.OLLAMA_API_URL}/health"
            response = requests.get(health_check_url, timeout=3)
            if response.status_code != 200:
                warnings.append({
                    'type': 'ai',
                    'severity': 'error',
                    'message': 'AI service is not responding properly'
                })
        except:
            warnings.append({
                'type': 'ai',
                'severity': 'error',
                'message': 'Unable to connect to AI service'
            })
        
        system_stats['warnings'] = warnings
    
    return Response(system_stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cache_stats(request):
    """Cache istatistiklerini getiren API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Redis istatistiklerini al
        redis_client = cache.client.get_client()
        info = redis_client.info()
        
        # Bellek kullanımı
        used_memory = info.get('used_memory_human', 'N/A')
        used_memory_peak = info.get('used_memory_peak_human', 'N/A')
        
        # Anahtar sayısı
        db = info.get('db1', {})
        keys = db.get('keys', 0)
        expires = db.get('expires', 0)
        
        # Hit/Miss oranı
        keyspace_hits = info.get('keyspace_hits', 0)
        keyspace_misses = info.get('keyspace_misses', 0)
        hit_ratio = 0
        if keyspace_hits + keyspace_misses > 0:
            hit_ratio = keyspace_hits / (keyspace_hits + keyspace_misses) * 100
        
        return Response({
            'memory': {
                'used': used_memory,
                'peak': used_memory_peak
            },
            'keys': {
                'total': keys,
                'with_expiry': expires
            },
            'performance': {
                'hits': keyspace_hits,
                'misses': keyspace_misses,
                'hit_ratio': f"{hit_ratio:.2f}%"
            }
        })
    except Exception as e:
        return Response({
            'error': f"Failed to get cache stats: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_debug(request):
    """Admin dashboard debug bilgilerini getiren API endpoint'i"""
    print(f"✅ DEBUG API HIT: /admin/dashboard/debug/")
    print(f"✅ Authenticated user ID: {request.user.id}")
    print(f"✅ Authenticated user role: {request.user.role if hasattr(request.user, 'role') else 'unknown'}")
    
    # Debug bilgileri
    debug_info = {
        'user': {
            'id': request.user.id,
            'username': request.user.username if hasattr(request.user, 'username') else 'unknown',
            'role': request.user.role if hasattr(request.user, 'role') else 'unknown'
        },
        'request': {
            'method': request.method,
            'path': request.path,
            'content_type': request.content_type,
            'headers': dict(request.headers),
        },
        'server': {
            'python_version': sys.version,
            'timestamp': datetime.now().isoformat(),
            'django_auth_user': str(request.user),
        }
    }
    
    # Sadece JSON döndürdüğümüzden emin olalım
    response = JsonResponse(debug_info)
    response['Content-Type'] = 'application/json'
    
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course_video(request):
    """Admin API endpoint to create a new course video"""
    user_id = request.user.id
    
    # Debug logging
    print(f"✅ Video creation API called by user ID: {user_id}")
    print(f"✅ Request data: {request.data}")
    
    if not is_admin(user_id):
        print(f"❌ User {user_id} is not admin - Access denied")
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Get video details with fallbacks and detailed logging
    try:
        course_id = request.data.get('course_id')
        youtube_video_id = request.data.get('youtube_video_id')
        title = request.data.get('title')
        description = request.data.get('description', '')
        duration = request.data.get('duration', 0)
        order_in_course = request.data.get('order_in_course', 1)
        
        # Clean YouTube video ID to ensure only the ID is stored, not the full URL
        if youtube_video_id and ('youtube.com' in youtube_video_id or 'youtu.be' in youtube_video_id):
            try:
                # Extract ID from youtube.com/watch?v=ID format
                match = re.search(r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube.com\/shorts\/|youtube\.com\/watch\?.*v=)([^&?#\/\s]+)', youtube_video_id)
                if match and match.group(1):
                    youtube_video_id = match.group(1)
                    print(f"✅ Extracted YouTube ID: {youtube_video_id}")
                else:
                    # Try youtu.be format
                    match = re.search(r'youtu\.be\/([^&?#\/\s]+)', youtube_video_id)
                    if match and match.group(1):
                        youtube_video_id = match.group(1)
                        print(f"✅ Extracted YouTube ID from youtu.be format: {youtube_video_id}")
            except Exception as e:
                print(f"⚠️ Error extracting YouTube ID: {str(e)}")
        
        # Further validate YouTube ID (should be 11 chars typically)
        if youtube_video_id and len(youtube_video_id) > 20:
            print(f"⚠️ YouTube ID seems too long, might be a full URL: {youtube_video_id}")
            youtube_video_id = youtube_video_id[:20]  # Truncate to prevent database errors
        
        # Log each field individually for better debugging
        print(f"✅ course_id: {course_id}")
        print(f"✅ youtube_video_id: {youtube_video_id}")
        print(f"✅ title: {title}")
        print(f"✅ description: {description}")
        print(f"✅ duration: {duration}")
        print(f"✅ order_in_course: {order_in_course}")
        
        # Convert numeric values if needed
        try:
            duration = int(duration)
        except (ValueError, TypeError):
            duration = 0
            
        try:
            order_in_course = int(order_in_course)
        except (ValueError, TypeError):
            order_in_course = 1
            
        # Ensure course_id is properly handled
        if not course_id:
            print(f"❌ Missing required field: course_id")
            return Response({
                'error': 'Course ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            course_id = int(course_id)
        except (ValueError, TypeError):
            print(f"❌ Invalid course_id format: {course_id}")
            return Response({
                'error': f'Invalid course_id format: {course_id}'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"❌ Error parsing request data: {str(e)}")
        return Response({
            'error': f'Error parsing request data: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate required fields
    if not all([course_id, youtube_video_id, title]):
        print(f"❌ Missing required fields: course_id={course_id}, title={title}, youtube_id={youtube_video_id}")
        return Response({
            'error': 'Course ID, YouTube Video ID, and Title are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to fetch YouTube channel name
    channel_name = None
    try:
        channel_name = fetch_youtube_channel_name(youtube_video_id)
        print(f"✅ Channel name for video: {channel_name}")
    except Exception as e:
        print(f"⚠️ Error fetching channel name: {str(e)}")
        # Non-critical, continue even if fetching channel name fails
    
    try:
        with connection.cursor() as cursor:
            # Check if course exists
            cursor.execute("""
                SELECT COUNT(*) FROM Courses WHERE CourseID = %s
            """, [course_id])
            
            course_exists = cursor.fetchone()[0]
            if course_exists == 0:
                print(f"❌ Course with ID {course_id} does not exist")
                return Response({
                    'error': f'Course with ID {course_id} does not exist'
                }, status=status.HTTP_404_NOT_FOUND)
            
            print(f"✅ Found course with ID {course_id}")
            
            # First check if YouTubeChannelName column exists, add it if not
            try:
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Courses' AND COLUMN_NAME = 'YouTubeChannelName'
                """)
                
                if cursor.fetchone()[0] == 0:
                    cursor.execute("""
                        ALTER TABLE Courses
                        ADD YouTubeChannelName NVARCHAR(255) NULL
                    """)
                    print("✅ Added YouTubeChannelName column to Courses table")
            except Exception as col_err:
                print(f"⚠️ Error checking or adding YouTubeChannelName column: {str(col_err)}")
                # Continue anyway
            
            # Update the course's channel name if we have a channel name
            if channel_name:
                try:
                    cursor.execute("""
                        UPDATE Courses
                        SET YouTubeChannelName = %s
                        WHERE CourseID = %s AND
                        (YouTubeChannelName IS NULL OR YouTubeChannelName = '')
                    """, [channel_name, course_id])
                    
                    if cursor.rowcount > 0:
                        print(f"✅ Updated course with channel name: {channel_name}")
                except Exception as update_err:
                    print(f"⚠️ Error updating channel name: {str(update_err)}")
                    # Continue even if this fails
            
            # Insert video - fix SQL Server issue
            try:
                cursor.execute("""
                    INSERT INTO CourseVideos
                    (CourseID, YouTubeVideoID, Title, Description, Duration, OrderInCourse)
                    VALUES (%s, %s, %s, %s, %s, %s);
                """, [
                    course_id, youtube_video_id, title, description, duration, order_in_course
                ])
                
                print(f"✅ Inserted video into CourseVideos table")
                
                # Get the inserted video ID in a separate query
                cursor.execute("SELECT SCOPE_IDENTITY();")
                video_id = cursor.fetchone()[0]
                print(f"✅ New video ID: {video_id}")
                
            except Exception as sql_err:
                print(f"❌ SQL error when inserting video: {str(sql_err)}")
                raise sql_err
            
            # Update the total videos count in the course
            try:
                cursor.execute("""
                    UPDATE Courses
                    SET TotalVideos = (
                        SELECT COUNT(*) FROM CourseVideos WHERE CourseID = %s
                    )
                    WHERE CourseID = %s
                """, [course_id, course_id])
                
                print(f"✅ Updated TotalVideos count for course {course_id}")
            except Exception as count_err:
                print(f"❌ Error updating TotalVideos count: {str(count_err)}")
                # Continue even if this fails
        
        # Log activity
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp)
                    VALUES (%s, 'admin_action', %s, GETDATE())
                """, [
                    user_id, f"Added video '{title}' to course ID {course_id}"
                ])
            print(f"✅ Added activity log entry")
        except Exception as log_err:
            print(f"❌ Error adding activity log: {str(log_err)}")
            # Non-critical, continue
        
        # Invalidate any caches related to the course
        try:
            cache_key_prefix = getattr(settings, 'CACHE_KEY_PREFIX', '')
            cache.delete(f"{cache_key_prefix}course_detail_{course_id}")
            print(f"✅ Invalidated cache for course {course_id}")
        except Exception as cache_err:
            print(f"❌ Error invalidating cache: {str(cache_err)}")
            # Non-critical, continue
        
        print(f"✅ Video created successfully: {title} for course {course_id}")
        return Response({
            'message': 'Video created successfully',
            'videoId': video_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"❌ Error creating video: {str(e)}")
        return Response({
            'error': f'Error creating video: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_course(request, course_id):
    """Update an existing course"""
    user_id = request.user.id
    
    # Debug logging
    print(f"✅ Update course API called by user ID: {user_id} for course ID: {course_id}")
    print(f"✅ Request data: {request.data}")
    
    if not is_admin(user_id):
        print(f"❌ User {user_id} is not admin - Access denied")
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Get course data
    title = request.data.get('title')
    description = request.data.get('description')
    category = request.data.get('category')
    difficulty = request.data.get('difficulty')
    thumbnail_url = request.data.get('thumbnailUrl')
    is_active = request.data.get('isActive')
    
    # Log fields
    print(f"✅ title: {title}")
    print(f"✅ description: {description}")
    print(f"✅ category: {category}")
    print(f"✅ difficulty: {difficulty}")
    print(f"✅ thumbnail_url: {thumbnail_url}")
    print(f"✅ is_active: {is_active}")
    
    # Build update query dynamically
    update_fields = []
    params = []
    
    if title:
        update_fields.append("Title = %s")
        params.append(title)
    
    if description is not None:  # Allow empty description
        update_fields.append("Description = %s")
        params.append(description)
    
    if category:
        update_fields.append("Category = %s")
        params.append(category)
    
    if difficulty:
        update_fields.append("Difficulty = %s")
        params.append(difficulty)
    
    if thumbnail_url is not None:  # Allow empty thumbnail URL
        update_fields.append("ThumbnailURL = %s")
        params.append(thumbnail_url)
    
    if is_active is not None:  # Allow setting to false
        update_fields.append("IsActive = %s")
        params.append(1 if is_active else 0)
    
    # Always update the UpdatedDate field
    update_fields.append("UpdatedDate = GETDATE()")
    
    if not update_fields:
        print("❌ No fields to update")
        return Response({
            'error': 'No fields to update'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with connection.cursor() as cursor:
            # Verify course exists
            cursor.execute("""
                SELECT COUNT(*) FROM Courses WHERE CourseID = %s
            """, [course_id])
            
            if cursor.fetchone()[0] == 0:
                print(f"❌ Course with ID {course_id} not found")
                return Response({
                    'error': f'Course with ID {course_id} not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Update course
            query = f"""
                UPDATE Courses
                SET {', '.join(update_fields)}
                WHERE CourseID = %s
            """
            params.append(course_id)
            
            cursor.execute(query, params)
            print(f"✅ Course updated with ID: {course_id}")
            
            # Check if we need to update YouTubeChannelName
            cursor.execute("""
                SELECT cv.YouTubeVideoID 
                FROM CourseVideos cv 
                WHERE cv.CourseID = %s 
                ORDER BY cv.OrderInCourse
            """, [course_id])
            
            first_video_id = None
            for row in cursor.fetchall():
                if row[0]:  # Get the first non-empty video ID
                    first_video_id = row[0]
                    break
            
            if first_video_id:
                print(f"✅ Found first video ID: {first_video_id}")
                # Try to fetch and update YouTube channel name
                try:
                    channel_name = fetch_youtube_channel_name(first_video_id)
                    if channel_name:
                        print(f"✅ Fetched channel name for course update: {channel_name}")
                        cursor.execute("""
                            UPDATE Courses
                            SET YouTubeChannelName = %s
                            WHERE CourseID = %s AND
                            (YouTubeChannelName IS NULL OR YouTubeChannelName = '')
                        """, [channel_name, course_id])
                        
                        if cursor.rowcount > 0:
                            print(f"✅ Updated course channel name during update: {channel_name}")
                except Exception as channel_err:
                    print(f"⚠️ Error updating channel name during course update: {str(channel_err)}")
                    # Non-critical, continue
            
            # Get updated course data
            cursor.execute("""
                SELECT CourseID, Title, Description, Category, Difficulty, 
                       CreationDate, UpdatedDate, IsActive, ThumbnailURL, YouTubeChannelName
                FROM Courses
                WHERE CourseID = %s
            """, [course_id])
            
            columns = [col[0] for col in cursor.description]
            updated_course = dict(zip(columns, cursor.fetchone()))
            
        # Log activity
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp)
                    VALUES (%s, 'admin_action', %s, GETDATE())
                """, [
                    user_id, f"Updated course: {updated_course['Title']} (ID: {course_id})"
                ])
            print("✅ Added activity log entry for course update")
        except Exception as e:
            print(f"⚠️ Error adding activity log: {str(e)}")
            # Non-critical, continue
        
        # Invalidate cache
        try:
            cache_key_prefix = getattr(settings, 'CACHE_KEY_PREFIX', '')
            cache.delete(f"{cache_key_prefix}course_detail_{course_id}")
            cache.delete(f"{cache_key_prefix}courses_list*")
            print("✅ Cache invalidated")
        except Exception as e:
            print(f"⚠️ Error invalidating cache: {str(e)}")
            # Non-critical, continue
        
        return Response({
            'message': 'Course updated successfully',
            'course': updated_course
        })
        
    except Exception as e:
        print(f"❌ Error updating course: {str(e)}")
        return Response({
            'error': f'Error updating course: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    """Delete a course"""
    user_id = request.user.id
    
    # Debug logging
    print(f"✅ Delete course API called by user ID: {user_id} for course ID: {course_id}")
    
    if not is_admin(user_id):
        print(f"❌ User {user_id} is not admin - Access denied")
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        course_title = None
        
        with connection.cursor() as cursor:
            # Get course information before deletion for logging
            cursor.execute("""
                SELECT Title FROM Courses WHERE CourseID = %s
            """, [course_id])
            
            result = cursor.fetchone()
            if not result:
                print(f"❌ Course with ID {course_id} not found")
                return Response({
                    'error': f'Course with ID {course_id} not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            course_title = result[0]
            print(f"✅ Found course to delete: {course_title} (ID: {course_id})")
            
            # Check if course has enrolled users
            cursor.execute("""
                SELECT COUNT(*) FROM UserCourseProgress WHERE CourseID = %s
            """, [course_id])
            
            enrolled_count = cursor.fetchone()[0]
            if enrolled_count > 0:
                print(f"⚠️ Course has {enrolled_count} enrolled users, marking as inactive instead of deleting")
                
                # Mark as inactive instead of deleting
                cursor.execute("""
                    UPDATE Courses
                    SET IsActive = 0, UpdatedDate = GETDATE()
                    WHERE CourseID = %s
                """, [course_id])
                
                return Response({
                    'message': f'Course marked as inactive because it has {enrolled_count} enrolled users',
                    'action': 'deactivated'
                })
            
            # Delete associated videos first
            print("✅ Deleting associated videos...")
            cursor.execute("""
                DELETE FROM CourseVideos WHERE CourseID = %s
            """, [course_id])
            videos_deleted = cursor.rowcount
            print(f"✅ Deleted {videos_deleted} videos")
            
            # Delete the course
            print("✅ Deleting course...")
            cursor.execute("""
                DELETE FROM Courses WHERE CourseID = %s
            """, [course_id])
            
            if cursor.rowcount == 0:
                print("⚠️ No course was deleted, might have been deleted already")
                return Response({
                    'error': 'Course not found or already deleted'
                }, status=status.HTTP_404_NOT_FOUND)
            
            print(f"✅ Successfully deleted course with ID: {course_id}")
        
        # Log activity
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp)
                    VALUES (%s, 'admin_action', %s, GETDATE())
                """, [
                    user_id, f"Deleted course: {course_title} (ID: {course_id})"
                ])
            print("✅ Added activity log entry for course deletion")
        except Exception as e:
            print(f"⚠️ Error adding activity log: {str(e)}")
            # Non-critical, continue
        
        # Invalidate cache
        try:
            cache_key_prefix = getattr(settings, 'CACHE_KEY_PREFIX', '')
            cache.delete(f"{cache_key_prefix}course_detail_{course_id}")
            cache.delete(f"{cache_key_prefix}courses_list*")
            print("✅ Cache invalidated")
        except Exception as e:
            print(f"⚠️ Error invalidating cache: {str(e)}")
            # Non-critical, continue
        
        return Response({
            'message': 'Course deleted successfully',
            'action': 'deleted',
            'courseId': course_id,
            'title': course_title
        })
        
    except Exception as e:
        print(f"❌ Error deleting course: {str(e)}")
        return Response({
            'error': f'Error deleting course: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# NFT YÖNETİM FONKSİYONLARI

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nft_management(request):
    """NFT yönetimi için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('pageSize', 20))
    search = request.query_params.get('search', '')
    nft_type = request.query_params.get('type', '')
    is_active = request.query_params.get('active')
    
    offset = (page - 1) * page_size
    
    conditions = []
    params = []
    
    if search:
        conditions.append("(n.Title LIKE %s OR n.Description LIKE %s)")
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern])
    
    if nft_type:
        conditions.append("nt.TypeName = %s")
        params.append(nft_type)
    
    if is_active is not None:
        is_active_value = 1 if is_active.lower() == 'true' else 0
        conditions.append("n.IsActive = %s")
        params.append(is_active_value)
    
    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)
    
    with connection.cursor() as cursor:
        # Toplam NFT sayısını al
        count_sql = f"""
            SELECT COUNT(*)
            FROM NFTs n
            JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
            {where_clause}
        """
        cursor.execute(count_sql, params)
        total_count = cursor.fetchone()[0]
        
        # NFT'leri listele
        nft_sql = f"""
            SELECT n.NFTID, n.Title, n.Description, n.ImageURI, n.TradeValue,
                  n.SubscriptionDays, n.BlockchainMetadata, n.IsActive,
                  nt.TypeName as NFTType, nt.NFTTypeID,
                  (SELECT COUNT(*) FROM UserNFTs WHERE NFTID = n.NFTID) as OwnersCount,
                  (SELECT COUNT(*) FROM UserNFTs WHERE NFTID = n.NFTID AND IsMinted = 1) as MintedCount
            FROM NFTs n
            JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
            {where_clause}
            ORDER BY n.NFTID DESC
            OFFSET {offset} ROWS
            FETCH NEXT {page_size} ROWS ONLY
        """
        
        cursor.execute(nft_sql, params)
        columns = [col[0] for col in cursor.description]
        nfts = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # NFT'lerin IPFS metadata URI'larını ekle
        for nft in nfts:
            if nft['BlockchainMetadata']:
                try:
                    metadata_json = json.loads(nft['BlockchainMetadata'])
                    nft['IPFSUri'] = metadata_json.get('ipfsUri', '')
                    nft['IPFSGateway'] = metadata_json.get('ipfsGateway', '')
                except:
                    nft['IPFSUri'] = ''
                    nft['IPFSGateway'] = ''
            else:
                nft['IPFSUri'] = ''
                nft['IPFSGateway'] = ''
    
    return Response({
        'nfts': nfts,
        'totalCount': total_count,
        'page': page,
        'pageSize': page_size,
        'totalPages': (total_count + page_size - 1) // page_size
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nft_types(request):
    """NFT tiplerini listeleyen API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT NFTTypeID, TypeName, Description
            FROM NFTTypes
            ORDER BY NFTTypeID
        """)
        
        columns = [col[0] for col in cursor.description]
        nft_types = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(nft_types)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_nft(request):
    """Admin - Yeni NFT oluşturan API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # NFT bilgilerini al
    title = request.data.get('title')
    description = request.data.get('description')
    image_uri = request.data.get('imageUri')
    nft_type_id = request.data.get('nftTypeId')
    trade_value = request.data.get('tradeValue', 0)
    subscription_days = request.data.get('subscriptionDays')
    attributes = request.data.get('attributes', [])
    
    # Zorunlu alanları kontrol et
    if not all([title, description, image_uri, nft_type_id]):
        missing_fields = []
        if not title: missing_fields.append('title')
        if not description: missing_fields.append('description')
        if not image_uri: missing_fields.append('imageUri')
        if not nft_type_id: missing_fields.append('nftTypeId')
        
        return Response({
            'error': f'Missing required fields: {", ".join(missing_fields)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # NFT Service kullanarak NFT oluştur
    nft_service = NFTService()
    result = nft_service.create_nft_with_metadata(
        admin_id=user_id,
        title=title,
        description=description,
        image_path=image_uri,
        nft_type_id=nft_type_id,
        trade_value=trade_value,
        subscription_days=subscription_days,
        attributes=attributes
    )
    
    if result["success"]:
        return Response({
            'message': 'NFT created successfully with IPFS metadata',
            'nftId': result["nftId"],
            'title': result["title"],
            'ipfsUri': result["ipfsUri"],
            'ipfsGateway': result["ipfsGateway"]
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({
            'error': result["error"]
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_nft_details(request, nft_id):
    """Admin - NFT detaylarını gösteren API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        with connection.cursor() as cursor:
            # Improved error logging
            logger.info(f"Fetching NFT details for NFTID={nft_id}")
            
            cursor.execute("""
                SELECT n.NFTID, n.Title, n.Description, n.ImageURI, n.TradeValue,
                      n.SubscriptionDays, n.BlockchainMetadata, n.IsActive, n.Rarity,
                      nt.TypeName as NFTType, nt.NFTTypeID
                FROM NFTs n
                JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                WHERE n.NFTID = %s
            """, [nft_id])
            
            columns = [col[0] for col in cursor.description]
            nft_data = cursor.fetchone()
            
            if not nft_data:
                logger.error(f"NFT not found for NFTID={nft_id}")
                return Response({'error': 'NFT not found'}, status=status.HTTP_404_NOT_FOUND)
                
            nft = dict(zip(columns, nft_data))
            
            # IPFS ve blockchain bilgilerini ekle
            if nft['BlockchainMetadata']:
                try:
                    metadata_json = json.loads(nft['BlockchainMetadata'])
                    nft['IPFSMetadata'] = metadata_json
                except Exception as e:
                    logger.error(f"Failed to parse BlockchainMetadata for NFTID={nft_id}: {str(e)}")
                    nft['IPFSMetadata'] = {}
            else:
                nft['IPFSMetadata'] = {}
            
            # Get subscription plan information if this is a subscription NFT
            if nft['NFTType'] == 'subscription':
                cursor.execute("""
                    SELECT PlanID, PlanName, DurationDays, Price, Description, IsActive
                    FROM SubscriptionPlans
                    WHERE NFTID = %s
                """, [nft_id])
                
                plan_columns = [col[0] for col in cursor.description]
                plan_data = cursor.fetchone()
                
                if plan_data:
                    subscription_plan = dict(zip(plan_columns, plan_data))
                    nft['SubscriptionPlan'] = subscription_plan
                    logger.info(f"Found subscription plan for NFTID={nft_id}")
                else:
                    # Check for plans with NULL NFTID that might match this NFT
                    logger.warning(f"No subscription plan found with NFTID={nft_id}, checking for unlinked plans")
                    cursor.execute("""
                        SELECT PlanID, PlanName, DurationDays, Price, Description, IsActive
                        FROM SubscriptionPlans
                        WHERE NFTID IS NULL 
                          AND DurationDays = %s 
                          AND Price = %s
                    """, [nft['SubscriptionDays'], nft['TradeValue']])
                    
                    plan_columns = [col[0] for col in cursor.description]
                    plan_data = cursor.fetchone()
                    
                    if plan_data:
                        subscription_plan = dict(zip(plan_columns, plan_data))
                        nft['SubscriptionPlan'] = subscription_plan
                        
                        # Update the subscription plan with the proper NFTID
                        cursor.execute("""
                            UPDATE SubscriptionPlans
                            SET NFTID = %s
                            WHERE PlanID = %s
                        """, [nft_id, subscription_plan['PlanID']])
                        
                        logger.info(f"Updated unlinked subscription plan (PlanID={subscription_plan['PlanID']}) with NFTID={nft_id}")
                    else:
                        nft['SubscriptionPlan'] = None
                        logger.warning(f"No matching subscription plan found for NFTID={nft_id}")
            
            # Sahip kullanıcı sayısını ekle
            cursor.execute("""
                SELECT COUNT(*)
                FROM UserNFTs
                WHERE NFTID = %s
            """, [nft_id])
            
            nft['OwnersCount'] = cursor.fetchone()[0]
            
            # NFT sahibi kullanıcıları listele
            cursor.execute("""
                SELECT un.UserNFTID, u.UserID, u.Username, u.Email, 
                       un.AcquisitionDate, un.IsMinted, un.TransactionHash
                FROM UserNFTs un
                JOIN Users u ON un.UserID = u.UserID
                WHERE un.NFTID = %s
                ORDER BY un.AcquisitionDate DESC
            """, [nft_id])
            
            owner_columns = [col[0] for col in cursor.description]
            owners = [dict(zip(owner_columns, row)) for row in cursor.fetchall()]
            nft['Owners'] = owners
            
            logger.info(f"Successfully fetched NFT details for NFTID={nft_id}")
        
        return Response(nft)
    except Exception as e:
        logger.error(f"Error in admin_nft_details for NFTID={nft_id}: {str(e)}")
        return Response({'error': f'Server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_nft(request, nft_id):
    """NFT bilgilerini güncelleyen API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Güncellenecek bilgileri al
    title = request.data.get('title')
    description = request.data.get('description')
    trade_value = request.data.get('tradeValue')
    subscription_days = request.data.get('subscriptionDays')
    is_active = request.data.get('isActive')
    
    # Güncellenecek en az bir alan olmalı
    if not any([title, description, trade_value is not None, subscription_days is not None, is_active is not None]):
        return Response({
            'error': 'At least one field to update must be provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    update_fields = []
    params = []
    
    if title:
        update_fields.append("Title = %s")
        params.append(title)
    
    if description:
        update_fields.append("Description = %s")
        params.append(description)
    
    if trade_value is not None:
        update_fields.append("TradeValue = %s")
        params.append(trade_value)
    
    if subscription_days is not None:
        update_fields.append("SubscriptionDays = %s")
        params.append(subscription_days)
    
    if is_active is not None:
        update_fields.append("IsActive = %s")
        params.append(1 if is_active else 0)
    
    # NFT'nin varlığını kontrol et
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM NFTs WHERE NFTID = %s", [nft_id])
        if cursor.fetchone()[0] == 0:
            return Response({'error': 'NFT not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # NFT'yi güncelle
        update_sql = f"""
            UPDATE NFTs
            SET {", ".join(update_fields)}
            WHERE NFTID = %s
        """
        params.append(nft_id)
        
        cursor.execute(update_sql, params)
        
        # Güncelleme logunu kaydet
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp)
            VALUES (%s, 'nft_updated', %s, GETDATE())
        """, [
            user_id,
            f"Updated NFT: ID {nft_id}"
        ])
    
    return Response({
        'message': 'NFT updated successfully',
        'nftId': nft_id
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_nft_image(request):
    """NFT resmi yüklemek için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    if 'image' not in request.FILES:
        # Base64 olarak gönderilmiş olabilir
        if 'imageBase64' not in request.data:
            return Response({'error': 'No image file found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Base64 görselini dosyaya dönüştür
        try:
            image_data = request.data.get('imageBase64')
            # Base64 verinin format bilgisini kaldır (örn: "data:image/png;base64,")
            if ',' in image_data:
                image_data = image_data.split(',')[1]
                
            image_bytes = base64.b64decode(image_data)
            
            # Dosya adını oluştur
            file_ext = request.data.get('fileType', 'png').lower()
            if not file_ext.startswith('.'):
                file_ext = '.' + file_ext
                
            file_name = f"nft_{uuid.uuid4().hex}{file_ext}"
            
            # NFT resimlerinin kaydedileceği dizini kontrol et
            media_dir = os.path.join(settings.MEDIA_ROOT, 'nft_images')
            if not os.path.exists(media_dir):
                os.makedirs(media_dir, exist_ok=True)
            
            file_path = os.path.join(media_dir, file_name)
            
            # Dosyayı kaydet
            with open(file_path, 'wb') as f:
                f.write(image_bytes)
            
            relative_path = os.path.join('nft_images', file_name)
            media_url = os.path.join(settings.MEDIA_URL.rstrip('/'), relative_path)
            
        except Exception as e:
            return Response({
                'error': f"Failed to process base64 image: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Dosya olarak yükleme işlemi
        image_file = request.FILES['image']
        
        # NFT resimlerinin kaydedileceği dizini kontrol et
        media_dir = os.path.join(settings.MEDIA_ROOT, 'nft_images')
        if not os.path.exists(media_dir):
            os.makedirs(media_dir, exist_ok=True)
        
        # Dosya adı oluştur
        file_name = f"nft_{uuid.uuid4().hex}{os.path.splitext(image_file.name)[1]}"
        file_path = os.path.join(media_dir, file_name)
        
        # Dosyayı kaydet
        with open(file_path, 'wb+') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)
        
        relative_path = os.path.join('nft_images', file_name)
        media_url = os.path.join(settings.MEDIA_URL.rstrip('/'), relative_path)
    
    # Eğer IPFS'e doğrudan yüklenmesini istiyorsak
    ipfs_uri = None
    ipfs_gateway = None
    if request.data.get('uploadToIPFS'):
        ipfs_service = IPFSService()
        result = ipfs_service.upload_image(file_path)
        
        if result["success"]:
            ipfs_uri = result["ipfs_uri"]
            ipfs_gateway = result["gateway_url"]
    
    return Response({
        'imageUri': media_url,
        'imagePath': file_path,
        'ipfsUri': ipfs_uri,
        'ipfsGateway': ipfs_gateway
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nft_statistics(request):
    """NFT istatistiklerini getiren API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    with connection.cursor() as cursor:
        # Genel NFT istatistikleri
        cursor.execute("""
            SELECT
                (SELECT COUNT(*) FROM NFTs) as TotalNFTs,
                (SELECT COUNT(*) FROM NFTs WHERE IsActive = 1) as ActiveNFTs,
                (SELECT COUNT(*) FROM UserNFTs) as OwnedNFTs,
                (SELECT COUNT(*) FROM UserNFTs WHERE IsMinted = 1) as MintedNFTs
        """)
        
        stats = cursor.fetchone()
        general_stats = {
            'totalNFTs': stats[0],
            'activeNFTs': stats[1],
            'ownedNFTs': stats[2],
            'mintedNFTs': stats[3]
        }
        
        # NFT tipi dağılımı
        cursor.execute("""
            SELECT nt.TypeName, COUNT(n.NFTID) as Count
            FROM NFTs n
            JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
            GROUP BY nt.TypeName
        """)
        
        type_distribution = {}
        for row in cursor.fetchall():
            type_distribution[row[0]] = row[1]
        
        # Son 30 gündeki NFT aktiviteleri
        cursor.execute("""
            SELECT CAST(AcquisitionDate AS DATE) as Date, COUNT(*) as Count
            FROM UserNFTs
            WHERE AcquisitionDate >= DATEADD(day, -30, GETDATE())
            GROUP BY CAST(AcquisitionDate AS DATE)
            ORDER BY CAST(AcquisitionDate AS DATE)
        """)
        
        activity_columns = [col[0] for col in cursor.description]
        activities = [dict(zip(activity_columns, row)) for row in cursor.fetchall()]
    
    return Response({
        'generalStats': general_stats,
        'typeDistribution': type_distribution,
        'activities': activities
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request):
    """Manuel quiz oluşturmak için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        
        # Gerekli alanları kontrol et
        required_fields = ['title', 'description', 'questions']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response({'error': f'Missing required field: {field}'}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        if not isinstance(data['questions'], list) or len(data['questions']) == 0:
            return Response({'error': 'At least one question is required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        with connection.cursor() as cursor:
            # Quiz'i oluştur - yapay zeka fonksiyonuna benzer şekilde
            course_id = data.get('course_id')
            video_id = data.get('video_id')
            
            # CourseID'yi integer'a çevir
            if course_id:
                try:
                    course_id = int(course_id)
                    # Kursun varlığını kontrol et
                    cursor.execute("SELECT COUNT(*) FROM Courses WHERE CourseID = %s", [course_id])
                    if cursor.fetchone()[0] == 0:
                        return Response({'error': f'Course ID {course_id} not found'}, 
                                       status=status.HTTP_404_NOT_FOUND)
                except (ValueError, TypeError):
                    return Response({'error': f'Invalid course ID format: {course_id}'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
            
            # VideoID'yi integer'a çevir
            if video_id:
                try:
                    video_id = int(video_id)
                    # Videonun varlığını kontrol et
                    cursor.execute("SELECT COUNT(*) FROM CourseVideos WHERE VideoID = %s", [video_id])
                    if cursor.fetchone()[0] == 0:
                        return Response({'error': f'Video ID {video_id} not found'}, 
                                       status=status.HTTP_404_NOT_FOUND)
                except (ValueError, TypeError):
                    return Response({'error': f'Invalid video ID format: {video_id}'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
            
            # Quiz'i oluştur
            if course_id and video_id:
                cursor.execute("""
                    INSERT INTO Quizzes 
                    (Title, Description, PassingScore, CourseID, VideoID, IsActive)
                    VALUES (%s, %s, %s, %s, %s, 1)
                """, [
                    data['title'],
                    data['description'],
                    data.get('passing_score', 70),
                    course_id,
                    video_id
                ])
            elif course_id:
                cursor.execute("""
                    INSERT INTO Quizzes 
                    (Title, Description, PassingScore, CourseID, IsActive)
                    VALUES (%s, %s, %s, %s, 1)
                """, [
                    data['title'],
                    data['description'],
                    data.get('passing_score', 70),
                    course_id
                ])
            elif video_id:
                cursor.execute("""
                    INSERT INTO Quizzes 
                    (Title, Description, PassingScore, VideoID, IsActive)
                    VALUES (%s, %s, %s, %s, 1)
                """, [
                    data['title'],
                    data['description'],
                    data.get('passing_score', 70),
                    video_id
                ])
            else:
                cursor.execute("""
                    INSERT INTO Quizzes 
                    (Title, Description, PassingScore, IsActive)
                    VALUES (%s, %s, %s, 1)
                """, [
                    data['title'],
                    data['description'],
                    data.get('passing_score', 70)
                ])
            
            # Quiz ID'yi al - yapay zeka fonksiyonuna benzer şekilde
            quiz_id = None
            
            # Method 1: SCOPE_IDENTITY() kullan
            try:
                cursor.execute("SELECT SCOPE_IDENTITY()")
                result = cursor.fetchone()
                if result and result[0] is not None:
                    quiz_id = result[0]
                    print(f"Manual quiz created with ID: {quiz_id}")
            except Exception as e:
                print(f"SCOPE_IDENTITY() failed: {str(e)}")
            
            # Method 2: Alternatif yöntem
            if quiz_id is None:
                try:
                    cursor.execute("""
                        SELECT TOP 1 QuizID FROM Quizzes 
                        WHERE Title = %s
                        ORDER BY QuizID DESC
                    """, [data['title']])
                    result = cursor.fetchone()
                    if result and result[0] is not None:
                        quiz_id = result[0]
                        print(f"Got quiz ID using alternative method: {quiz_id}")
                except Exception as e:
                    print(f"Alternative method failed: {str(e)}")
            
            if quiz_id is None:
                raise Exception("Failed to get quiz ID")
            
            # Soruları ekle - yapay zeka fonksiyonuna benzer şekilde
            print(f"Processing {len(data['questions'])} questions for quiz {quiz_id}")
            
            for i, question_data in enumerate(data['questions']):
                if not question_data.get('question_text'):
                    return Response({
                        'error': f'Question {i+1} is missing question text. Please add question text for all questions.',
                        'details': f'Available fields: {list(question_data.keys())}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    with connection.cursor() as question_cursor:
                        question_text = question_data['question_text']
                        question_type = question_data.get('question_type', 'multiple_choice')
                        
                        # Soruyu ekle
                        try:
                            question_cursor.execute("""
                                INSERT INTO QuizQuestions 
                                (QuizID, QuestionText, QuestionType, OrderInQuiz)
                                VALUES (%s, %s, %s, %s)
                            """, [
                                quiz_id,
                                question_text,
                                question_type,
                                i + 1
                            ])
                            
                            # Question ID'yi al
                            question_cursor.execute("SELECT SCOPE_IDENTITY()")
                            result = question_cursor.fetchone()
                            if not result or result[0] is None:
                                # Alternatif yöntem
                                question_cursor.execute("""
                                    SELECT TOP 1 QuestionID FROM QuizQuestions 
                                    WHERE QuizID = %s AND OrderInQuiz = %s
                                    ORDER BY QuestionID DESC
                                """, [quiz_id, i + 1])
                                result = question_cursor.fetchone()
                                if not result or result[0] is None:
                                    raise Exception("Could not retrieve question ID")
                            
                            question_id = result[0]
                            
                        except Exception as question_error:
                            continue
                        
                        # Seçenekleri ekle
                        if question_type == 'multiple_choice' and question_data.get('options'):
                            for j, option_data in enumerate(question_data['options']):
                                if not option_data.get('option_text'):
                                    continue
                                
                                try:
                                    option_text = option_data['option_text']
                                    is_correct = option_data.get('is_correct', False)
                                    
                                    question_cursor.execute("""
                                        INSERT INTO QuestionOptions 
                                        (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                        VALUES (%s, %s, %s, %s)
                                    """, [
                                        question_id,
                                        option_text,
                                        1 if is_correct else 0,
                                        j + 1
                                    ])
                                    
                                except Exception as option_error:
                                    pass
                        
                        # True/False soruları için
                        elif question_type == 'true_false':
                            correct_answer = question_data.get('correct_answer', True)
                            
                            try:
                                # True seçeneği
                                question_cursor.execute("""
                                    INSERT INTO QuestionOptions 
                                    (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                    VALUES (%s, %s, %s, %s)
                                """, [
                                    question_id, 'True', 1 if correct_answer else 0, 1
                                ])
                                
                                # False seçeneği
                                question_cursor.execute("""
                                    INSERT INTO QuestionOptions 
                                    (QuestionID, OptionText, IsCorrect, OrderInQuestion)
                                    VALUES (%s, %s, %s, %s)
                                """, [
                                    question_id, 'False', 1 if not correct_answer else 0, 2
                                ])
                                
                            except Exception as tf_error:
                                pass
                
                except Exception as e:
                    continue
            
            # Aktivite logunu kaydet
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp)
                VALUES (%s, 'quiz_created', %s, GETDATE())
            """, [
                user_id,
                f"Created manual quiz: {data['title']}"
            ])
        
        return Response({
            'success': True,
            'message': 'Quiz created successfully',
            'id': quiz_id,
            'quiz_id': quiz_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Failed to create quiz',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quiz_details(request, quiz_id):
    """Quiz detaylarını getiren API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        with connection.cursor() as cursor:
            # Quiz bilgilerini getir
            cursor.execute("""
                SELECT q.QuizID, q.Title, q.Description, q.PassingScore, 
                       q.IsActive, q.CourseID, q.VideoID,
                       c.Title as CourseTitle, cv.Title as VideoTitle
                FROM Quizzes q
                LEFT JOIN Courses c ON q.CourseID = c.CourseID
                LEFT JOIN CourseVideos cv ON q.VideoID = cv.VideoID
                WHERE q.QuizID = %s
            """, [quiz_id])
            
            quiz_row = cursor.fetchone()
            if not quiz_row:
                return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            
            quiz_data = {
                'QuizID': quiz_row[0],
                'Title': quiz_row[1],
                'Description': quiz_row[2],
                'PassingScore': quiz_row[3],
                'IsActive': quiz_row[4],
                'CourseID': quiz_row[5],
                'VideoID': quiz_row[6],
                'course': {'CourseTitle': quiz_row[7]} if quiz_row[7] else None,
                'video': {'VideoTitle': quiz_row[8]} if quiz_row[8] else None,
                'questions': []
            }
            
            # Soruları getir
            cursor.execute("""
                SELECT qq.QuestionID, qq.QuestionText, qq.QuestionType, qq.OrderInQuiz
                FROM QuizQuestions qq
                WHERE qq.QuizID = %s
                ORDER BY qq.OrderInQuiz, qq.QuestionID
            """, [quiz_id])
            
            questions = cursor.fetchall()
            for question in questions:
                question_data = {
                    'QuestionID': question[0],
                    'QuestionText': question[1],
                    'QuestionType': question[2],
                    'OrderInQuiz': question[3],
                    'options': []
                }
                
                # Seçenekleri getir
                cursor.execute("""
                    SELECT OptionID, OptionText, IsCorrect
                    FROM QuestionOptions
                    WHERE QuestionID = %s
                    ORDER BY OptionID
                """, [question[0]])
                
                options = cursor.fetchall()
                for option in options:
                    question_data['options'].append({
                        'OptionID': option[0],
                        'OptionText': option[1],
                        'IsCorrect': bool(option[2])
                    })
                
                quiz_data['questions'].append(question_data)
        
        return Response(quiz_data)
        
    except Exception as e:
        return Response({
            'error': 'Failed to get quiz details',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_quiz(request, quiz_id):
    """Quiz güncellemek için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data
        
        with connection.cursor() as cursor:
            # Quiz'in varlığını kontrol et
            cursor.execute("""
                SELECT COUNT(*) FROM Quizzes 
                WHERE QuizID = %s
            """, [quiz_id])
            
            if cursor.fetchone()[0] == 0:
                return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Quiz'i güncelle
            update_fields = []
            params = []
            
            if 'title' in data:
                update_fields.append("Title = %s")
                params.append(data['title'])
            
            if 'description' in data:
                update_fields.append("Description = %s")
                params.append(data['description'])
            
            if 'passing_score' in data:
                update_fields.append("PassingScore = %s")
                params.append(data['passing_score'])
            
            if 'is_active' in data:
                update_fields.append("IsActive = %s")
                params.append(1 if data['is_active'] else 0)
            
            if update_fields:
                update_sql = f"""
                    UPDATE Quizzes
                    SET {", ".join(update_fields)}
                    WHERE QuizID = %s
                """
                params.append(quiz_id)
                cursor.execute(update_sql, params)
            
            # Aktivite logunu kaydet
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp)
                VALUES (%s, 'quiz_updated', %s, GETDATE())
            """, [
                user_id,
                f"Updated quiz: ID {quiz_id}"
            ])
        
        return Response({
            'success': True,
            'message': 'Quiz updated successfully'
        })
        
    except Exception as e:
        print(f"Quiz update error: {str(e)}")
        return Response({
            'error': 'Failed to update quiz',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_quiz(request, quiz_id):
    """Quiz silmek için API endpoint'i"""
    user_id = request.user.id
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        with connection.cursor() as cursor:
            # Quiz'in varlığını kontrol et
            cursor.execute("""
                SELECT Title FROM Quizzes 
                WHERE QuizID = %s
            """, [quiz_id])
            
            quiz_row = cursor.fetchone()
            if not quiz_row:
                return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
            
            quiz_title = quiz_row[0]
            
            # İlişkili verileri sil
            cursor.execute("DELETE FROM QuestionOptions WHERE QuestionID IN (SELECT QuestionID FROM QuizQuestions WHERE QuizID = %s)", [quiz_id])
            cursor.execute("DELETE FROM QuizQuestions WHERE QuizID = %s", [quiz_id])
            cursor.execute("DELETE FROM Quizzes WHERE QuizID = %s", [quiz_id])
            
            # Aktivite logunu kaydet
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp)
                VALUES (%s, 'quiz_deleted', %s, GETDATE())
            """, [
                user_id,
                f"Deleted quiz: {quiz_title}"
            ])
        
        return Response({
            'success': True,
            'message': 'Quiz deleted successfully'
        })
        
    except Exception as e:
        print(f"Quiz deletion error: {str(e)}")
        return Response({
            'error': 'Failed to delete quiz',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
