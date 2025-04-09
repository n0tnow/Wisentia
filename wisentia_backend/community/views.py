from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Sayfalama eklenmiş sorgu
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_posts(request):
    """Topluluk gönderilerini listeleyen API endpoint'i"""
    category = request.query_params.get('category')
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    
    # Sayfalama için OFFSET hesapla
    offset = (page - 1) * page_size
    
    query = """
        SELECT cp.PostID, cp.Title, cp.Content, cp.CreationDate, cp.Category,
               cp.PointsCost, cp.Likes, cp.Views, u.UserID, u.Username, u.ProfileImage,
               (SELECT COUNT(*) FROM CommunityComments cc WHERE cc.PostID = cp.PostID) as CommentCount
        FROM CommunityPosts cp
        JOIN Users u ON cp.UserID = u.UserID
        WHERE cp.IsActive = 1
    """
    
    params = []
    
    if category:
        query += " AND cp.Category = %s"
        params.append(category)
    
    # Toplam kayıt sayısını almak için count sorgusu
    count_query = """
        SELECT COUNT(*) 
        FROM CommunityPosts cp
        WHERE cp.IsActive = 1
    """
    
    if category:
        count_query += " AND cp.Category = %s"
    
    # Sayfalama ekle
    query += " ORDER BY cp.CreationDate DESC OFFSET %s ROWS FETCH NEXT %s ROWS ONLY"
    params.extend([offset, page_size])
    
    with connection.cursor() as cursor:
        # Toplam kayıt sayısını al
        cursor.execute(count_query, [category] if category else [])
        total_count = cursor.fetchone()[0]
        
        # Sayfalanmış verileri al
        cursor.execute(query, params)
        columns = [col[0] for col in cursor.description]
        posts = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response({
        'posts': posts,
        'total': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size  # Ceiling division
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def post_detail(request, post_id):
    """Gönderi detaylarını ve yorumlarını gösteren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Gönderi bilgilerini al
        cursor.execute("""
            SELECT cp.PostID, cp.Title, cp.Content, cp.CreationDate, cp.Category,
                   cp.PointsCost, cp.Likes, cp.Views, u.UserID, u.Username, u.ProfileImage
            FROM CommunityPosts cp
            JOIN Users u ON cp.UserID = u.UserID
            WHERE cp.PostID = %s AND cp.IsActive = 1
        """, [post_id])
        
        columns = [col[0] for col in cursor.description]
        post_data = cursor.fetchone()
        
        if not post_data:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
            
        post = dict(zip(columns, post_data))
        
        # Görüntüleme sayısını artır
        cursor.execute("""
            UPDATE CommunityPosts
            SET Views = Views + 1
            WHERE PostID = %s
        """, [post_id])
        
        # Kullanıcı beğenip beğenmediğini kontrol et
        cursor.execute("""
            SELECT COUNT(*)
            FROM UserLikes
            WHERE UserID = %s AND PostID = %s
        """, [user_id, post_id])
        
        post['isLiked'] = cursor.fetchone()[0] > 0
        
        # Yorumları al
        cursor.execute("""
            SELECT cc.CommentID, cc.Content, cc.CreationDate, cc.Likes,
                   cc.ParentCommentID, u.UserID, u.Username, u.ProfileImage
            FROM CommunityComments cc
            JOIN Users u ON cc.UserID = u.UserID
            WHERE cc.PostID = %s AND cc.IsActive = 1
            ORDER BY CASE WHEN cc.ParentCommentID IS NULL THEN cc.CreationDate ELSE NULL END DESC,
                     cc.ParentCommentID, cc.CreationDate
        """, [post_id])
        
        columns = [col[0] for col in cursor.description]
        comments = []
        
        for row in cursor.fetchall():
            comment = dict(zip(columns, row))
            comment_id = comment['CommentID']
            
            # Kullanıcı yorumu beğenip beğenmediğini kontrol et
            cursor.execute("""
                SELECT COUNT(*)
                FROM UserLikes
                WHERE UserID = %s AND CommentID = %s
            """, [user_id, comment_id])
            
            comment['isLiked'] = cursor.fetchone()[0] > 0
            comments.append(comment)
        
        post['comments'] = comments
    
    return Response(post)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    """Yeni bir gönderi oluşturan API endpoint'i"""
    user_id = request.user.id
    title = request.data.get('title')
    content = request.data.get('content')
    category = request.data.get('category')
    points_cost = request.data.get('pointsCost', 0)
    
    if not title or not content or not category:
        return Response({
            'error': 'Title, content and category are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Kullanıcının yeterli puanı var mı kontrol et
        if points_cost > 0:
            cursor.execute("""
                SELECT TotalPoints
                FROM Users
                WHERE UserID = %s
            """, [user_id])
            
            total_points = cursor.fetchone()[0]
            
            if total_points < points_cost:
                return Response({
                    'error': f'Not enough points. You have {total_points} points, but {points_cost} points are required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Kullanıcı puanlarını güncelle
            cursor.execute("""
                UPDATE Users
                SET TotalPoints = TotalPoints - %s
                WHERE UserID = %s
            """, [points_cost, user_id])
        
        # Gönderiyi oluştur
        cursor.execute("""
            INSERT INTO CommunityPosts
            (UserID, Title, Content, CreationDate, Category, PointsCost, Likes, Views, IsActive)
            VALUES (%s, %s, %s, GETDATE(), %s, %s, 0, 0, 1);
            SELECT SCOPE_IDENTITY();
        """, [user_id, title, content, category, points_cost])
        
        post_id = cursor.fetchone()[0]
        
        # Etkinlik logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'post_created', %s, GETDATE(), %s, %s)
        """, [
            user_id, 
            f"Created post: {title}", 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({
        'message': 'Post created successfully',
        'postId': post_id
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    """Gönderi için yorum oluşturan API endpoint'i"""
    user_id = request.user.id
    content = request.data.get('content')
    parent_comment_id = request.data.get('parentCommentId')
    
    if not content:
        return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Gönderi kontrolü
        cursor.execute("""
            SELECT PostID
            FROM CommunityPosts
            WHERE PostID = %s AND IsActive = 1
        """, [post_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Ebeveyn yorum kontrolü (varsa)
        if parent_comment_id:
            cursor.execute("""
                SELECT CommentID
                FROM CommunityComments
                WHERE CommentID = %s AND PostID = %s AND IsActive = 1
            """, [parent_comment_id, post_id])
            
            if not cursor.fetchone():
                return Response({'error': 'Parent comment not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Yorumu oluştur
        cursor.execute("""
            INSERT INTO CommunityComments
            (PostID, UserID, Content, CreationDate, ParentCommentID, Likes, IsActive)
            VALUES (%s, %s, %s, GETDATE(), %s, 0, 1);
            SELECT SCOPE_IDENTITY();
        """, [post_id, user_id, content, parent_comment_id])
        
        comment_id = cursor.fetchone()[0]
    
    return Response({
        'message': 'Comment created successfully',
        'commentId': comment_id
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    """Gönderiyi beğenen API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Gönderi kontrolü
        cursor.execute("""
            SELECT PostID
            FROM CommunityPosts
            WHERE PostID = %s AND IsActive = 1
        """, [post_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Kullanıcı daha önce beğendi mi kontrol et
        cursor.execute("""
            SELECT LikeID
            FROM UserLikes
            WHERE UserID = %s AND PostID = %s
        """, [user_id, post_id])
        
        like_data = cursor.fetchone()
        
        if like_data:
            # Beğeniyi kaldır
            cursor.execute("""
                DELETE FROM UserLikes
                WHERE LikeID = %s
            """, [like_data[0]])
            
            cursor.execute("""
                UPDATE CommunityPosts
                SET Likes = Likes - 1
                WHERE PostID = %s
            """, [post_id])
            
            return Response({'message': 'Post unliked successfully'})
        else:
            # Beğeni ekle
            cursor.execute("""
                INSERT INTO UserLikes
                (UserID, PostID, LikeDate)
                VALUES (%s, %s, GETDATE())
            """, [user_id, post_id])
            
            cursor.execute("""
                UPDATE CommunityPosts
                SET Likes = Likes + 1
                WHERE PostID = %s
            """, [post_id])
            
            return Response({'message': 'Post liked successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_comment(request, comment_id):
    """Yorumu beğenen API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Yorum kontrolü
        cursor.execute("""
            SELECT CommentID
            FROM CommunityComments
            WHERE CommentID = %s AND IsActive = 1
        """, [comment_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Kullanıcı daha önce beğendi mi kontrol et
        cursor.execute("""
            SELECT LikeID
            FROM UserLikes
            WHERE UserID = %s AND CommentID = %s
        """, [user_id, comment_id])
        
        like_data = cursor.fetchone()
        
        if like_data:
            # Beğeniyi kaldır
            cursor.execute("""
                DELETE FROM UserLikes
                WHERE LikeID = %s
            """, [like_data[0]])
            
            cursor.execute("""
                UPDATE CommunityComments
                SET Likes = Likes - 1
                WHERE CommentID = %s
            """, [comment_id])
            
            return Response({'message': 'Comment unliked successfully'})
        else:
            # Beğeni ekle
            cursor.execute("""
                INSERT INTO UserLikes
                (UserID, CommentID, LikeDate)
                VALUES (%s, %s, GETDATE())
            """, [user_id, comment_id])
            
            cursor.execute("""
                UPDATE CommunityComments
                SET Likes = Likes + 1
                WHERE CommentID = %s
            """, [comment_id])
            
            return Response({'message': 'Comment liked successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_categories(request):
    """Topluluk kategorilerini listeleyen API endpoint'i"""
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT DISTINCT Category
            FROM CommunityPosts
            WHERE IsActive = 1
            ORDER BY Category
        """)
        
        categories = [row[0] for row in cursor.fetchall()]
    
    return Response(categories)