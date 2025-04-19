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


logger = logging.getLogger('wisentia')


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
    
    offset = (page - 1) * page_size
    
    with connection.cursor() as cursor:
        if content_type == 'courses':
            # Kursları listele
            cursor.execute("SELECT COUNT(*) FROM Courses")
            total_count = cursor.fetchone()[0]
            
            cursor.execute(f"""
                SELECT c.CourseID, c.Title, c.Category, c.Difficulty, c.CreationDate, 
                       c.IsActive, u.Username as Creator,
                       (SELECT COUNT(*) FROM UserCourseProgress WHERE CourseID = c.CourseID) as EnrolledUsers
                FROM Courses c
                LEFT JOIN Users u ON c.CreatedBy = u.UserID
                ORDER BY c.CreationDate DESC
                OFFSET {offset} ROWS
                FETCH NEXT {page_size} ROWS ONLY
            """)
            
            columns = [col[0] for col in cursor.description]
            items = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
        elif content_type == 'quests':
            # Görevleri listele
            cursor.execute("SELECT COUNT(*) FROM Quests")
            total_count = cursor.fetchone()[0]
            
            cursor.execute(f"""
                SELECT q.QuestID, q.Title, q.DifficultyLevel, q.RequiredPoints, 
                       q.RewardPoints, q.IsActive, q.IsAIGenerated, q.CreationDate
                FROM Quests q
                ORDER BY q.CreationDate DESC
                OFFSET {offset} ROWS
                FETCH NEXT {page_size} ROWS ONLY
            """)
            
            columns = [col[0] for col in cursor.description]
            items = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
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
    
    if not is_admin(user_id):
        return Response({'error': 'You do not have permission to access this resource'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Kurs bilgilerini al
    title = request.data.get('title')
    description = request.data.get('description')
    category = request.data.get('category')
    difficulty = request.data.get('difficulty')
    thumbnail_url = request.data.get('thumbnailUrl')
    
    # Zorunlu alanları kontrol et
    if not all([title, category, difficulty]):
        return Response({
            'error': 'Title, category and difficulty are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Yeni kurs oluştur
        cursor.execute("""
            INSERT INTO Courses
            (Title, Description, Category, Difficulty, CreationDate, UpdatedDate, 
             IsActive, ThumbnailURL, CreatedBy)
            VALUES (%s, %s, %s, %s, GETDATE(), GETDATE(), 1, %s, %s);
            SELECT SCOPE_IDENTITY();
        """, [
            title, description, category, difficulty, thumbnail_url, user_id
        ])
        
        course_id = cursor.fetchone()[0]
    
    invalidate_cache(f"{settings.CACHE_KEY_PREFIX}courses_list*")

    return Response({
        'message': 'Course created successfully',
        'courseId': course_id
    }, status=status.HTTP_201_CREATED)

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