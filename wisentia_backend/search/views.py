from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    """Genel arama yapan API endpoint'i"""
    query = request.query_params.get('q', '').strip()
    category = request.query_params.get('category', 'all')  # all, courses, quests, community, nfts
    
    if not query:
        return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # SQL like sorgusu için hazırlık
    query_pattern = f"%{query}%"
    
    results = {
        'courses': [],
        'quests': [],
        'community': [],
        'nfts': []
    }
    
    with connection.cursor() as cursor:
        # Kursları ara
        if category in ['all', 'courses']:
            cursor.execute("""
                SELECT TOP 5 c.CourseID, c.Title, c.Description, c.Category, c.Difficulty, 
                       c.ThumbnailURL, u.Username as InstructorName
                FROM Courses c
                LEFT JOIN Users u ON c.CreatedBy = u.UserID
                WHERE c.IsActive = 1 AND 
                      (c.Title LIKE %s OR c.Description LIKE %s OR c.Category LIKE %s)
                ORDER BY c.CreationDate DESC
            """, [query_pattern, query_pattern, query_pattern])
            
            columns = [col[0] for col in cursor.description]
            results['courses'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Görevleri ara
        if category in ['all', 'quests']:
            cursor.execute("""
                SELECT TOP 5 q.QuestID, q.Title, q.Description, q.DifficultyLevel,
                       q.RewardPoints, n.Title as RewardNFTTitle
                FROM Quests q
                LEFT JOIN NFTs n ON q.RewardNFTID = n.NFTID
                WHERE q.IsActive = 1 AND 
                      (q.Title LIKE %s OR q.Description LIKE %s)
                ORDER BY q.CreationDate DESC
            """, [query_pattern, query_pattern])
            
            columns = [col[0] for col in cursor.description]
            results['quests'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Topluluk gönderilerini ara
        if category in ['all', 'community']:
            cursor.execute("""
                SELECT TOP 5 cp.PostID, cp.Title, cp.Content, cp.CreationDate, cp.Category,
                       cp.Likes, cp.Views, u.Username
                FROM CommunityPosts cp
                JOIN Users u ON cp.UserID = u.UserID
                WHERE cp.IsActive = 1 AND 
                      (cp.Title LIKE %s OR cp.Content LIKE %s OR cp.Category LIKE %s)
                ORDER BY cp.CreationDate DESC
            """, [query_pattern, query_pattern, query_pattern])
            
            columns = [col[0] for col in cursor.description]
            results['community'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # NFT'leri ara
        if category in ['all', 'nfts']:
            cursor.execute("""
                SELECT TOP 5 n.NFTID, n.Title, n.Description, n.ImageURI, n.TradeValue,
                       nt.TypeName as NFTType
                FROM NFTs n
                JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                WHERE n.IsActive = 1 AND 
                      (n.Title LIKE %s OR n.Description LIKE %s)
                ORDER BY n.NFTID DESC
            """, [query_pattern, query_pattern])
            
            columns = [col[0] for col in cursor.description]
            results['nfts'] = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(results)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_courses(request):
    """Kurslar içinde arama yapan API endpoint'i"""
    query = request.query_params.get('q', '').strip()
    category = request.query_params.get('category', '')
    difficulty = request.query_params.get('difficulty', '')
    
    query_pattern = f"%{query}%"
    params = [query_pattern, query_pattern]
    
    sql = """
        SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty,
               c.CreationDate, c.ThumbnailURL, u.Username as InstructorName,
               (SELECT COUNT(*) FROM CourseVideos WHERE CourseID = c.CourseID) as VideoCount
        FROM Courses c
        LEFT JOIN Users u ON c.CreatedBy = u.UserID
        WHERE c.IsActive = 1 AND (c.Title LIKE %s OR c.Description LIKE %s)
    """
    
    if category:
        sql += " AND c.Category = %s"
        params.append(category)
    
    if difficulty:
        sql += " AND c.Difficulty = %s"
        params.append(difficulty)
    
    sql += " ORDER BY c.CreationDate DESC"
    
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        courses = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(courses)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_quests(request):
    """Görevler içinde arama yapan API endpoint'i"""
    query = request.query_params.get('q', '').strip()
    difficulty = request.query_params.get('difficulty', '')
    
    query_pattern = f"%{query}%"
    params = [query_pattern, query_pattern]
    
    sql = """
        SELECT q.QuestID, q.Title, q.Description, q.RequiredPoints, q.RewardPoints,
               q.DifficultyLevel, q.IsAIGenerated, q.StartDate, q.EndDate,
               n.Title as RewardNFTTitle, n.ImageURI as RewardNFTImage
        FROM Quests q
        LEFT JOIN NFTs n ON q.RewardNFTID = n.NFTID
        WHERE q.IsActive = 1 AND (q.Title LIKE %s OR q.Description LIKE %s)
    """
    
    if difficulty:
        sql += " AND q.DifficultyLevel = %s"
        params.append(difficulty)
    
    sql += " ORDER BY q.CreationDate DESC"
    
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        quests = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(quests)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_community(request):
    """Topluluk gönderileri içinde arama yapan API endpoint'i"""
    query = request.query_params.get('q', '').strip()
    category = request.query_params.get('category', '')
    
    query_pattern = f"%{query}%"
    params = [query_pattern, query_pattern, query_pattern]
    
    sql = """
        SELECT cp.PostID, cp.Title, cp.Content, cp.CreationDate, cp.Category,
               cp.PointsCost, cp.Likes, cp.Views, u.UserID, u.Username,
               (SELECT COUNT(*) FROM CommunityComments cc WHERE cc.PostID = cp.PostID) as CommentCount
        FROM CommunityPosts cp
        JOIN Users u ON cp.UserID = u.UserID
        WHERE cp.IsActive = 1 AND (cp.Title LIKE %s OR cp.Content LIKE %s OR cp.Category LIKE %s)
    """
    
    if category:
        sql += " AND cp.Category = %s"
        params.append(category)
    
    sql += " ORDER BY cp.CreationDate DESC"
    
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        posts = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(posts)

@api_view(['GET'])
@permission_classes([AllowAny])
def advanced_search(request):
    """Gelişmiş içerik arama API endpoint'i"""
    query = request.query_params.get('q', '').strip()
    category = request.query_params.get('category', '')
    difficulty = request.query_params.get('difficulty', '')
    content_type = request.query_params.get('type', 'all')  # all, courses, quests, nfts, community
    sort_by = request.query_params.get('sort_by', 'relevance')  # relevance, date, popularity
    
    if not query and not category and not difficulty:
        return Response({'error': 'At least one search parameter (q, category, difficulty) is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # SQL sorguları için hazırlık
    query_pattern = f"%{query}%" if query else "%"
    params = []
    
    # SQL sorgularını ve sonuçları saklayacak sözlük
    results = {}
    
    with connection.cursor() as cursor:
        # Kurslar için arama
        if content_type in ['all', 'courses']:
            course_query = """
                SELECT c.CourseID, c.Title, c.Description, c.Category, c.Difficulty, 
                       c.CreationDate, c.ThumbnailURL, u.Username as Creator,
                       (SELECT COUNT(*) FROM UserCourseProgress WHERE CourseID = c.CourseID) as EnrolledCount
                FROM Courses c
                LEFT JOIN Users u ON c.CreatedBy = u.UserID
                WHERE c.IsActive = 1
            """
            
            course_conditions = []
            course_params = []
            
            if query:
                course_conditions.append("(c.Title LIKE %s OR c.Description LIKE %s)")
                course_params.extend([query_pattern, query_pattern])
            
            if category:
                course_conditions.append("c.Category = %s")
                course_params.append(category)
            
            if difficulty:
                course_conditions.append("c.Difficulty = %s")
                course_params.append(difficulty)
            
            if course_conditions:
                course_query += " AND " + " AND ".join(course_conditions)
            
            # Sıralama
            if sort_by == 'date':
                course_query += " ORDER BY c.CreationDate DESC"
            elif sort_by == 'popularity':
                course_query += " ORDER BY EnrolledCount DESC"
            else:
                # Varsayılan: İlgililik
                if query:
                    course_query += f" ORDER BY CASE WHEN c.Title LIKE '{query}%' THEN 1 WHEN c.Title LIKE '%{query}%' THEN 2 ELSE 3 END"
                else:
                    course_query += " ORDER BY c.CreationDate DESC"
            
            cursor.execute(course_query, course_params)
            course_columns = [col[0] for col in cursor.description]
            results['courses'] = [dict(zip(course_columns, row)) for row in cursor.fetchall()]
        
        # Görevler (Quests) için arama
        if content_type in ['all', 'quests']:
            quest_query = """
                SELECT q.QuestID, q.Title, q.Description, q.DifficultyLevel, q.RequiredPoints,
                       q.RewardPoints, q.IsAIGenerated, q.CreationDate, q.StartDate, q.EndDate,
                       (SELECT COUNT(*) FROM UserQuestProgress WHERE QuestID = q.QuestID AND IsCompleted = 1) as CompletionCount
                FROM Quests q
                WHERE q.IsActive = 1
            """
            
            quest_conditions = []
            quest_params = []
            
            if query:
                quest_conditions.append("(q.Title LIKE %s OR q.Description LIKE %s)")
                quest_params.extend([query_pattern, query_pattern])
            
            if difficulty:
                quest_conditions.append("q.DifficultyLevel = %s")
                quest_params.append(difficulty)
            
            if quest_conditions:
                quest_query += " AND " + " AND ".join(quest_conditions)
            
            # Sıralama
            if sort_by == 'date':
                quest_query += " ORDER BY q.CreationDate DESC"
            elif sort_by == 'popularity':
                quest_query += " ORDER BY CompletionCount DESC"
            else:
                if query:
                    quest_query += f" ORDER BY CASE WHEN q.Title LIKE '{query}%' THEN 1 WHEN q.Title LIKE '%{query}%' THEN 2 ELSE 3 END"
                else:
                    quest_query += " ORDER BY q.CreationDate DESC"
            
            cursor.execute(quest_query, quest_params)
            quest_columns = [col[0] for col in cursor.description]
            results['quests'] = [dict(zip(quest_columns, row)) for row in cursor.fetchall()]
        
        # NFT'ler için arama
        if content_type in ['all', 'nfts']:
            nft_query = """
                SELECT n.NFTID, n.Title, n.Description, n.ImageURI, n.TradeValue,
                       nt.TypeName as NFTType, n.SubscriptionDays
                FROM NFTs n
                JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                WHERE n.IsActive = 1
            """
            
            nft_conditions = []
            nft_params = []
            
            if query:
                nft_conditions.append("(n.Title LIKE %s OR n.Description LIKE %s)")
                nft_params.extend([query_pattern, query_pattern])
            
            if category:
                nft_conditions.append("nt.TypeName = %s")
                nft_params.append(category)
            
            if nft_conditions:
                nft_query += " AND " + " AND ".join(nft_conditions)
            
            # Sıralama
            if sort_by == 'date':
                nft_query += " ORDER BY n.NFTID DESC"  # Assuming ID is creation order
            elif sort_by == 'value':
                nft_query += " ORDER BY n.TradeValue DESC"
            else:
                if query:
                    nft_query += f" ORDER BY CASE WHEN n.Title LIKE '{query}%' THEN 1 WHEN n.Title LIKE '%{query}%' THEN 2 ELSE 3 END"
                else:
                    nft_query += " ORDER BY n.NFTID DESC"
            
            cursor.execute(nft_query, nft_params)
            nft_columns = [col[0] for col in cursor.description]
            results['nfts'] = [dict(zip(nft_columns, row)) for row in cursor.fetchall()]
        
        # Topluluk (Community) gönderileri için arama
        if content_type in ['all', 'community']:
            community_query = """
                SELECT cp.PostID, cp.Title, cp.Content, cp.CreationDate, cp.Category,
                       cp.Likes, cp.Views, u.Username, u.ProfileImage,
                       (SELECT COUNT(*) FROM CommunityComments WHERE PostID = cp.PostID) as CommentCount
                FROM CommunityPosts cp
                JOIN Users u ON cp.UserID = u.UserID
                WHERE cp.IsActive = 1
            """
            
            community_conditions = []
            community_params = []
            
            if query:
                community_conditions.append("(cp.Title LIKE %s OR cp.Content LIKE %s)")
                community_params.extend([query_pattern, query_pattern])
            
            if category:
                community_conditions.append("cp.Category = %s")
                community_params.append(category)
            
            if community_conditions:
                community_query += " AND " + " AND ".join(community_conditions)
            
            # Sıralama
            if sort_by == 'date':
                community_query += " ORDER BY cp.CreationDate DESC"
            elif sort_by == 'popularity':
                community_query += " ORDER BY (cp.Likes + cp.Views) DESC"
            else:
                if query:
                    community_query += f" ORDER BY CASE WHEN cp.Title LIKE '{query}%' THEN 1 WHEN cp.Title LIKE '%{query}%' THEN 2 ELSE 3 END"
                else:
                    community_query += " ORDER BY cp.CreationDate DESC"
            
            cursor.execute(community_query, community_params)
            community_columns = [col[0] for col in cursor.description]
            results['community'] = [dict(zip(community_columns, row)) for row in cursor.fetchall()]
    
    return Response(results)