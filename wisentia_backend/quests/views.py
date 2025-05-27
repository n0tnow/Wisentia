from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_quests(request):
    """Tüm görevleri listeleyen API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Aktif görevleri listele
        cursor.execute("""
            SELECT q.QuestID, q.Title, q.Description, q.RequiredPoints, 
                   q.RewardPoints, q.DifficultyLevel, q.IsAIGenerated, 
                   q.StartDate, q.EndDate, n.Title as RewardNFTTitle,
                   n.ImageURI as RewardNFTImage
            FROM Quests q
            LEFT JOIN NFTs n ON q.RewardNFTID = n.NFTID
            WHERE q.IsActive = 1
                AND (q.StartDate IS NULL OR q.StartDate <= GETDATE())
                AND (q.EndDate IS NULL OR q.EndDate >= GETDATE())
            ORDER BY q.CreationDate DESC
        """)
        
        columns = [col[0] for col in cursor.description]
        quests = []
        
        for row in cursor.fetchall():
            quest = dict(zip(columns, row))
            quest_id = quest['QuestID']
            
            # Kullanıcının görev ilerlemesini al
            cursor.execute("""
                SELECT CurrentProgress, IsCompleted, RewardClaimed
                FROM UserQuestProgress
                WHERE UserID = %s AND QuestID = %s
            """, [user_id, quest_id])
            
            progress_data = cursor.fetchone()
            
            if progress_data:
                quest['userProgress'] = {
                    'currentProgress': progress_data[0],
                    'isCompleted': progress_data[1],
                    'rewardClaimed': progress_data[2]
                }
            else:
                quest['userProgress'] = {
                    'currentProgress': 0,
                    'isCompleted': False,
                    'rewardClaimed': False
                }
            
            quests.append(quest)
    
    return Response(quests)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quest_detail(request, quest_id):
    """Görev detaylarını gösteren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Görev bilgilerini al
        cursor.execute("""
            SELECT q.QuestID, q.Title, q.Description, q.RequiredPoints, 
                   q.RewardPoints, q.DifficultyLevel, q.IsAIGenerated, 
                   q.StartDate, q.EndDate, q.CreationDate,
                   n.NFTID as RewardNFTID, n.Title as RewardNFTTitle,
                   n.ImageURI as RewardNFTImage, n.Description as RewardNFTDescription
            FROM Quests q
            LEFT JOIN NFTs n ON q.RewardNFTID = n.NFTID
            WHERE q.QuestID = %s AND q.IsActive = 1
        """, [quest_id])
        
        columns = [col[0] for col in cursor.description]
        quest_data = cursor.fetchone()
        
        if not quest_data:
            return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)
            
        quest = dict(zip(columns, quest_data))
        
        # Görev koşullarını al
        cursor.execute("""
            SELECT ConditionID, ConditionType, TargetID, TargetValue, Description
            FROM QuestConditions
            WHERE QuestID = %s
        """, [quest_id])
        
        columns = [col[0] for col in cursor.description]
        conditions = []
        
        for row in cursor.fetchall():
            condition = dict(zip(columns, row))
            condition_type = condition['ConditionType']
            target_id = condition['TargetID']
            
            # Koşul tipine göre ek bilgileri al
            if condition_type == 'course_completion':
                cursor.execute("""
                    SELECT Title, Description, ImageURL
                    FROM Courses WHERE CourseID = %s
                """, [target_id])
                
                course_data = cursor.fetchone()
                if course_data:
                    condition['targetTitle'] = course_data[0]
                    condition['targetDescription'] = course_data[1]
                    condition['targetImage'] = course_data[2]
                    condition['displayText'] = f"Complete the course: {course_data[0]}"
            
            elif condition_type == 'quiz_score':
                cursor.execute("""
                    SELECT q.Title, q.Description, cv.Title as VideoTitle, c.Title as CourseTitle, c.CourseID
                    FROM Quizzes q
                    LEFT JOIN CourseVideos cv ON q.VideoID = cv.VideoID
                    LEFT JOIN Courses c ON q.CourseID = c.CourseID OR cv.CourseID = c.CourseID
                    WHERE q.QuizID = %s
                """, [target_id])
                
                quiz_data = cursor.fetchone()
                if quiz_data:
                    condition['targetTitle'] = quiz_data[0]
                    condition['targetDescription'] = quiz_data[1]
                    condition['videoTitle'] = quiz_data[2]
                    condition['courseTitle'] = quiz_data[3]
                    condition['courseId'] = quiz_data[4]
                    condition['displayText'] = f"Get at least {condition['TargetValue']}% score in quiz: {quiz_data[0]}"
            
            elif condition_type == 'take_quiz':
                cursor.execute("""
                    SELECT q.Title, q.Description, cv.Title as VideoTitle, c.Title as CourseTitle, c.CourseID
                    FROM Quizzes q
                    LEFT JOIN CourseVideos cv ON q.VideoID = cv.VideoID
                    LEFT JOIN Courses c ON q.CourseID = c.CourseID OR cv.CourseID = c.CourseID
                    WHERE q.QuizID = %s
                """, [target_id])
                
                quiz_data = cursor.fetchone()
                if quiz_data:
                    condition['targetTitle'] = quiz_data[0]
                    condition['targetDescription'] = quiz_data[1]
                    condition['videoTitle'] = quiz_data[2]
                    condition['courseTitle'] = quiz_data[3]
                    condition['courseId'] = quiz_data[4]
                    condition['displayText'] = f"Take the quiz: {quiz_data[0]}"
            
            elif condition_type == 'watch_videos':
                cursor.execute("""
                    SELECT cv.Title, cv.Description, c.Title as CourseTitle, c.CourseID
                    FROM CourseVideos cv
                    LEFT JOIN Courses c ON cv.CourseID = c.CourseID
                    WHERE cv.VideoID = %s
                """, [target_id])
                
                video_data = cursor.fetchone()
                if video_data:
                    condition['targetTitle'] = video_data[0]
                    condition['targetDescription'] = video_data[1]
                    condition['courseTitle'] = video_data[2]
                    condition['courseId'] = video_data[3]
                    condition['displayText'] = f"Watch the video: {video_data[0]}"
            
            elif condition_type == 'start_discussion':
                cursor.execute("""
                    SELECT Title, Description
                    FROM ForumTopics
                    WHERE TopicID = %s
                """, [target_id])
                
                topic_data = cursor.fetchone()
                if topic_data:
                    condition['targetTitle'] = topic_data[0]
                    condition['targetDescription'] = topic_data[1]
                    condition['displayText'] = f"Start a discussion in the topic: {topic_data[0]}"
            
            elif condition_type == 'total_points':
                condition['displayText'] = f"Earn at least {condition['TargetValue']} total points"
            
            conditions.append(condition)
        
        quest['conditions'] = conditions
        
        # Kullanıcının görev ilerlemesini al
        cursor.execute("""
            SELECT ProgressID, CurrentProgress, IsCompleted, CompletionDate, RewardClaimed
            FROM UserQuestProgress
            WHERE UserID = %s AND QuestID = %s
        """, [user_id, quest_id])
        
        progress_data = cursor.fetchone()
        
        if progress_data:
            quest['userProgress'] = {
                'progressId': progress_data[0],
                'currentProgress': progress_data[1],
                'isCompleted': progress_data[2],
                'completionDate': progress_data[3],
                'rewardClaimed': progress_data[4]
            }
    
    return Response(quest)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_quest_detail(request, quest_id):
    """Admin için görev detaylarını gösteren API endpoint'i (IsActive kontrolü yok)"""
    
    with connection.cursor() as cursor:
        # Görev bilgilerini al (IsActive kontrolü olmadan)
        cursor.execute("""
            SELECT q.QuestID, q.Title, q.Description, q.RequiredPoints, 
                   q.RewardPoints, q.DifficultyLevel, q.IsAIGenerated, q.IsActive,
                   q.StartDate, q.EndDate, q.CreationDate,
                   n.NFTID as RewardNFTID, n.Title as RewardNFTTitle,
                   n.ImageURI as RewardNFTImage, n.Description as RewardNFTDescription
            FROM Quests q
            LEFT JOIN NFTs n ON q.RewardNFTID = n.NFTID
            WHERE q.QuestID = %s
        """, [quest_id])
        
        columns = [col[0] for col in cursor.description]
        quest_data = cursor.fetchone()
        
        if not quest_data:
            return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)
            
        quest = dict(zip(columns, quest_data))
        
        # Görev koşullarını al
        cursor.execute("""
            SELECT ConditionID, ConditionType, TargetID, TargetValue, Description
            FROM QuestConditions
            WHERE QuestID = %s
        """, [quest_id])
        
        columns = [col[0] for col in cursor.description]
        conditions = []
        
        for row in cursor.fetchall():
            condition = dict(zip(columns, row))
            condition_type = condition['ConditionType']
            target_id = condition['TargetID']
            
            # Koşul tipine göre ek bilgileri al
            if condition_type == 'course_completion':
                cursor.execute("""
                    SELECT Title, Description, ThumbnailURL
                    FROM Courses WHERE CourseID = %s
                """, [target_id])
                
                course_data = cursor.fetchone()
                if course_data:
                    condition['targetTitle'] = course_data[0]
                    condition['targetDescription'] = course_data[1]
                    condition['targetImage'] = course_data[2]
                    condition['displayText'] = f"Complete the course: {course_data[0]}"
            
            elif condition_type == 'quiz_score':
                cursor.execute("""
                    SELECT q.Title, q.Description, cv.Title as VideoTitle, c.Title as CourseTitle, c.CourseID
                    FROM Quizzes q
                    LEFT JOIN CourseVideos cv ON q.VideoID = cv.VideoID
                    LEFT JOIN Courses c ON q.CourseID = c.CourseID OR cv.CourseID = c.CourseID
                    WHERE q.QuizID = %s
                """, [target_id])
                
                quiz_data = cursor.fetchone()
                if quiz_data:
                    condition['targetTitle'] = quiz_data[0]
                    condition['targetDescription'] = quiz_data[1]
                    condition['videoTitle'] = quiz_data[2]
                    condition['courseTitle'] = quiz_data[3]
                    condition['courseId'] = quiz_data[4]
                    condition['displayText'] = f"Get at least {condition['TargetValue']}% score in quiz: {quiz_data[0]}"
            
            elif condition_type == 'take_quiz':
                cursor.execute("""
                    SELECT q.Title, q.Description, cv.Title as VideoTitle, c.Title as CourseTitle, c.CourseID
                    FROM Quizzes q
                    LEFT JOIN CourseVideos cv ON q.VideoID = cv.VideoID
                    LEFT JOIN Courses c ON q.CourseID = c.CourseID OR cv.CourseID = c.CourseID
                    WHERE q.QuizID = %s
                """, [target_id])
                
                quiz_data = cursor.fetchone()
                if quiz_data:
                    condition['targetTitle'] = quiz_data[0]
                    condition['targetDescription'] = quiz_data[1]
                    condition['videoTitle'] = quiz_data[2]
                    condition['courseTitle'] = quiz_data[3]
                    condition['courseId'] = quiz_data[4]
                    condition['displayText'] = f"Take the quiz: {quiz_data[0]}"
            
            elif condition_type == 'watch_videos':
                cursor.execute("""
                    SELECT cv.Title, cv.Description, c.Title as CourseTitle, c.CourseID
                    FROM CourseVideos cv
                    LEFT JOIN Courses c ON cv.CourseID = c.CourseID
                    WHERE cv.VideoID = %s
                """, [target_id])
                
                video_data = cursor.fetchone()
                if video_data:
                    condition['targetTitle'] = video_data[0]
                    condition['targetDescription'] = video_data[1]
                    condition['courseTitle'] = video_data[2]
                    condition['courseId'] = video_data[3]
                    condition['displayText'] = f"Watch the video: {video_data[0]}"
            
            elif condition_type == 'start_discussion':
                cursor.execute("""
                    SELECT Title, Description
                    FROM CommunityPosts
                    WHERE PostID = %s
                """, [target_id])
                
                topic_data = cursor.fetchone()
                if topic_data:
                    condition['targetTitle'] = topic_data[0]
                    condition['targetDescription'] = topic_data[1]
                    condition['displayText'] = f"Start a discussion: {topic_data[0]}"
            
            elif condition_type == 'total_points':
                condition['displayText'] = f"Earn at least {condition['TargetValue']} total points"
                condition['targetTitle'] = f"{condition['TargetValue']} Points"
            
            conditions.append(condition)
        
        quest['conditions'] = conditions
    
    return Response(quest)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_quest_reward(request, quest_id):
    """Görev ödülünü talep eden API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Görevi ve kullanıcı ilerlemesini kontrol et
        cursor.execute("""
            SELECT q.QuestID, q.Title, q.RewardPoints, q.RewardNFTID,
                   uqp.ProgressID, uqp.IsCompleted, uqp.RewardClaimed
            FROM Quests q
            LEFT JOIN UserQuestProgress uqp ON q.QuestID = uqp.QuestID AND uqp.UserID = %s
            WHERE q.QuestID = %s AND q.IsActive = 1
        """, [user_id, quest_id])
        
        quest_data = cursor.fetchone()
        
        if not quest_data:
            return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)
            
        _, quest_title, reward_points, reward_nft_id, progress_id, is_completed, reward_claimed = quest_data
        
        if not progress_id:
            return Response({'error': 'You have not started this quest'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not is_completed:
            return Response({'error': 'Quest is not completed yet'}, status=status.HTTP_400_BAD_REQUEST)
            
        if reward_claimed:
            return Response({'error': 'Reward already claimed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Kullanıcı puanlarını güncelle
        if reward_points > 0:
            cursor.execute("""
                UPDATE Users
                SET TotalPoints = TotalPoints + %s
                WHERE UserID = %s
            """, [reward_points, user_id])
        
        # NFT ödülü varsa kullanıcıya ekle
        nft_claimed = False
        
        if reward_nft_id:
            # NFT'nin aktif olup olmadığını kontrol et
            cursor.execute("""
                SELECT IsActive, Title, SubscriptionDays
                FROM NFTs
                WHERE NFTID = %s
            """, [reward_nft_id])
            
            nft_data = cursor.fetchone()
            
            if nft_data and nft_data[0]:  # NFT aktifse
                nft_is_active, nft_title, subscription_days = nft_data
                
                # Kullanıcının bu NFT'yi daha önce alıp almadığını kontrol et
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM UserNFTs
                    WHERE UserID = %s AND NFTID = %s
                """, [user_id, reward_nft_id])
                
                user_has_nft = cursor.fetchone()[0] > 0
                
                if not user_has_nft:
                    # NFT tipini hesapla
                    expiry_date = "NULL"
                    if subscription_days:
                        expiry_date = f"DATEADD(day, {subscription_days}, GETDATE())"
                    
                    # Kullanıcıya NFT ekle
                    cursor.execute(f"""
                        INSERT INTO UserNFTs
                        (UserID, NFTID, AcquisitionDate, ExpiryDate, IsMinted)
                        VALUES (%s, %s, GETDATE(), {expiry_date}, 0)
                    """, [user_id, reward_nft_id])
                    
                    nft_claimed = True
        
        # Görev ilerlemesini güncelle
        cursor.execute("""
            UPDATE UserQuestProgress
            SET RewardClaimed = 1
            WHERE ProgressID = %s
        """, [progress_id])
        
        # Aktivite logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'quest_reward_claimed', %s, GETDATE(), %s, %s)
        """, [
            user_id,
            f"Claimed reward for quest: {quest_title}",
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
        
        # Bildirim ekle
        notification_message = f"You have successfully claimed the reward for completing the quest: {quest_title}"
        
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, RelatedEntityID, IsRead, IsDismissed, CreationDate)
            VALUES (%s, 'Quest Reward Claimed', %s, 'achievement', %s, 0, 0, GETDATE())
        """, [user_id, notification_message, quest_id])
    
    return Response({
        'message': 'Quest reward claimed successfully',
        'rewardPoints': reward_points,
        'nftClaimed': nft_claimed
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_quest_progress(request, quest_id):
    """Görev ilerlemesini kontrol eden API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Görevi kontrol et
        cursor.execute("""
            SELECT QuestID, Title
            FROM Quests
            WHERE QuestID = %s AND IsActive = 1
        """, [quest_id])
        
        quest_data = cursor.fetchone()
        
        if not quest_data:
            return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Görev koşullarını al
        cursor.execute("""
            SELECT ConditionID, ConditionType, TargetID, TargetValue
            FROM QuestConditions
            WHERE QuestID = %s
        """, [quest_id])
        
        conditions = cursor.fetchall()
        
        if not conditions:
            return Response({'error': 'Quest has no conditions'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Her bir koşul için ilerlemeyi kontrol et
        total_progress = 0
        max_progress = len(conditions)
        conditions_progress = []
        
        for condition in conditions:
            condition_id, condition_type, target_id, target_value = condition
            progress = 0
            
            if condition_type == 'course_completion':
                # Kurs tamamlama kontrolü
                cursor.execute("""
                    SELECT IsCompleted
                    FROM UserCourseProgress
                    WHERE UserID = %s AND CourseID = %s
                """, [user_id, target_id])
                
                course_data = cursor.fetchone()
                if course_data and course_data[0]:
                    progress = 1
                    total_progress += 1
            
            elif condition_type == 'quiz_score':
                # Quiz skoru kontrolü
                cursor.execute("""
                    SELECT Score, MaxScore
                    FROM UserQuizAttempts
                    WHERE UserID = %s AND QuizID = %s
                    ORDER BY AttemptDate DESC
                    OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY
                """, [user_id, target_id])
                
                quiz_data = cursor.fetchone()
                if quiz_data:
                    score, max_score = quiz_data
                    score_percentage = (score / max_score) * 100
                    
                    if score_percentage >= target_value:
                        progress = 1
                        total_progress += 1
            
            elif condition_type == 'watch_videos':
                # Video izleme kontrolü
                cursor.execute("""
                    SELECT IsCompleted
                    FROM UserVideoViews
                    WHERE UserID = %s AND VideoID = %s
                """, [user_id, target_id])
                
                video_data = cursor.fetchone()
                if video_data and video_data[0]:
                    progress = 1
                    total_progress += 1
            
            elif condition_type == 'total_points':
                # Toplam puan kontrolü
                cursor.execute("""
                    SELECT TotalPoints
                    FROM Users
                    WHERE UserID = %s
                """, [user_id])
                
                user_data = cursor.fetchone()
                if user_data:
                    total_points = user_data[0]
                    
                    if total_points >= target_value:
                        progress = 1
                        total_progress += 1
            
            elif condition_type == 'take_quiz':
                # Quiz katılım kontrolü - sadece katılmış olmak yeterli, skor şartı yok
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM UserQuizAttempts
                    WHERE UserID = %s AND QuizID = %s
                """, [user_id, target_id])
                
                attempt_count = cursor.fetchone()[0]
                if attempt_count > 0:
                    progress = 1
                    total_progress += 1
            
            elif condition_type == 'start_discussion':
                # Belirli bir konuda tartışma başlatma kontrolü
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM ForumThreads
                    WHERE CreatorUserID = %s AND TopicID = %s
                """, [user_id, target_id])
                
                thread_count = cursor.fetchone()[0]
                if thread_count > 0:
                    progress = 1
                    total_progress += 1
            
            conditions_progress.append({
                'conditionId': condition_id,
                'conditionType': condition_type,
                'targetId': target_id,
                'targetValue': target_value,
                'progress': progress
            })
        
        # Genel ilerleme durumu
        is_completed = total_progress == max_progress
        progress_percentage = (total_progress / max_progress) * 100 if max_progress > 0 else 0
        
        # Kullanıcı ilerleme kaydını güncelle veya oluştur
        cursor.execute("""
            SELECT ProgressID, IsCompleted
            FROM UserQuestProgress
            WHERE UserID = %s AND QuestID = %s
        """, [user_id, quest_id])
        
        progress_record = cursor.fetchone()
        
        completion_date = "GETDATE()" if is_completed else "NULL"
        
        if progress_record:
            progress_id, was_completed = progress_record
            
            if not was_completed:  # Önceden tamamlanmamışsa güncelle
                cursor.execute(f"""
                    UPDATE UserQuestProgress
                    SET CurrentProgress = %s,
                        IsCompleted = %s,
                        CompletionDate = {completion_date if is_completed else 'CompletionDate'}
                    WHERE ProgressID = %s
                """, [total_progress, is_completed, progress_id])
        else:
            cursor.execute(f"""
                INSERT INTO UserQuestProgress
                (UserID, QuestID, CurrentProgress, IsCompleted, CompletionDate, RewardClaimed)
                VALUES (%s, %s, %s, %s, {completion_date}, 0)
            """, [user_id, quest_id, total_progress, is_completed])
        
        # Görev tamamlandıysa ve daha önce tamamlanmamışsa bildirim ekle
        if is_completed and (not progress_record or not progress_record[1]):
            cursor.execute("""
                INSERT INTO Notifications
                (UserID, Title, Message, NotificationType, RelatedEntityID, IsRead, IsDismissed, CreationDate)
                VALUES (%s, 'Quest Completed', %s, 'achievement', %s, 0, 0, GETDATE())
            """, [
                user_id,
                f"You have completed the quest: {quest_data[1]}. Claim your reward!",
                quest_id
            ])
    
    return Response({
        'questId': quest_id,
        'progressPercentage': progress_percentage,
        'currentProgress': total_progress,
        'maxProgress': max_progress,
        'isCompleted': is_completed,
        'conditions': conditions_progress
    })

@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def update_quest(request, quest_id):
    """API endpoint to update a quest"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can update quests'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        with connection.cursor() as cursor:
            # Check if quest exists
            cursor.execute("""
                SELECT QuestID FROM Quests WHERE QuestID = %s
            """, [quest_id])
            
            if not cursor.fetchone():
                return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Get update fields from request
            title = request.data.get('title')
            description = request.data.get('description')
            difficulty_level = request.data.get('difficultyLevel')
            required_points = request.data.get('requiredPoints')
            reward_points = request.data.get('rewardPoints')
            is_active = request.data.get('isActive')
            
            # Build update query
            update_parts = []
            params = []
            
            if title:
                update_parts.append("Title = %s")
                params.append(title)
            
            if description:
                update_parts.append("Description = %s")
                params.append(description)
            
            if difficulty_level:
                update_parts.append("DifficultyLevel = %s")
                params.append(difficulty_level)
            
            if required_points is not None:
                update_parts.append("RequiredPoints = %s")
                params.append(required_points)
            
            if reward_points is not None:
                update_parts.append("RewardPoints = %s")
                params.append(reward_points)
            
            if is_active is not None:
                update_parts.append("IsActive = %s")
                params.append(1 if is_active else 0)
            
            if not update_parts:
                return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update the quest
            update_sql = f"UPDATE Quests SET {', '.join(update_parts)} WHERE QuestID = %s"
            params.append(quest_id)
            
            cursor.execute(update_sql, params)
            
            # Get the updated quest
            cursor.execute("""
                SELECT q.QuestID, q.Title, q.Description, q.RequiredPoints, 
                       q.RewardPoints, q.DifficultyLevel, q.IsActive, q.IsAIGenerated,
                       q.CreationDate
                FROM Quests q
                WHERE q.QuestID = %s
            """, [quest_id])
            
            columns = [col[0] for col in cursor.description]
            quest_data = cursor.fetchone()
            
            if not quest_data:
                return Response({'error': 'Failed to fetch updated quest'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            quest = dict(zip(columns, quest_data))
            
            # Get conditions for the quest
            cursor.execute("""
                SELECT ConditionID, ConditionType, TargetID, TargetValue, Description
                FROM QuestConditions
                WHERE QuestID = %s
            """, [quest_id])
            
            columns = [col[0] for col in cursor.description]
            conditions = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            quest['conditions'] = conditions
            
            return Response(quest)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_quests_public(request):
    """Görev detaylarını gösteren public API endpoint'i"""
    
    # Filter parameters
    difficulty = request.query_params.get('difficulty')
    category = request.query_params.get('category')
    search = request.query_params.get('search')
    
    # Base SQL query
    base_query = """
        SELECT q.QuestID, q.Title, q.Description, q.RequiredPoints, 
               q.RewardPoints, q.DifficultyLevel as difficulty, 
               q.IsAIGenerated, q.StartDate, q.EndDate, n.Title as RewardNFTTitle,
               n.ImageURI as RewardNFTImage
        FROM Quests q
        LEFT JOIN NFTs n ON q.RewardNFTID = n.NFTID
        WHERE q.IsActive = 1
            AND (q.StartDate IS NULL OR q.StartDate <= GETDATE())
            AND (q.EndDate IS NULL OR q.EndDate >= GETDATE())
    """
    
    # Add filters
    params = []
    
    if difficulty:
        base_query += " AND q.DifficultyLevel = %s"
        params.append(difficulty)
    
    if search:
        base_query += " AND (q.Title LIKE %s OR q.Description LIKE %s)"
        search_param = f"%{search}%"
        params.append(search_param)
        params.append(search_param)
    
    # Add ordering
    base_query += " ORDER BY q.CreationDate DESC"
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(base_query, params)
            
            columns = [col[0] for col in cursor.description]
            quests = []
            
            for row in cursor.fetchall():
                quest = dict(zip(columns, row))
                
                # Add counts for conditions
                quest_id = quest['QuestID']
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM QuestConditions
                    WHERE QuestID = %s
                """, [quest_id])
                
                condition_count = cursor.fetchone()[0]
                quest['totalConditions'] = condition_count
                
                quests.append(quest)
        
        return Response(quests)
    except Exception as e:
        print(f"Database error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def quest_detail(request, quest_id):
    """Belirli bir görevin (quest) detaylarını getiren API endpoint"""
    
    # Kullanıcı kimliğini al (eğer giriş yapmışsa)
    user_id = None
    if request.user.is_authenticated:
        user_id = request.user.id
    
    try:
        with connection.cursor() as cursor:
            # Quest bilgilerini al
            cursor.execute("""
                SELECT q.QuestID, q.Title, q.Description, q.DifficultyLevel, 
                       q.RequiredPoints, q.RewardPoints, q.IsActive, 
                       q.IsAIGenerated, q.CreationDate, q.RewardNFTID
                FROM Quests q
                WHERE q.QuestID = %s AND q.IsActive = 1
            """, [quest_id])
            
            quest_data = cursor.fetchone()
            
            if not quest_data:
                return Response({"error": "Quest bulunamadı"}, status=status.HTTP_404_NOT_FOUND)
            
            # Sonucu formatla
            result = {
                'QuestID': quest_data[0],
                'Title': quest_data[1],
                'Description': quest_data[2],
                'DifficultyLevel': quest_data[3],
                'RequiredPoints': quest_data[4],
                'RewardPoints': quest_data[5],
                'IsActive': bool(quest_data[6]),
                'IsAIGenerated': bool(quest_data[7]),
                'CreationDate': quest_data[8],
                'RewardNFTID': quest_data[9]
            }
            
            # Eğer ödül NFT'si varsa, NFT bilgilerini al
            if result['RewardNFTID']:
                cursor.execute("""
                    SELECT n.NFTID, n.Title, n.Description, n.ImageURI
                    FROM NFTs n
                    WHERE n.NFTID = %s
                """, [result['RewardNFTID']])
                
                nft_data = cursor.fetchone()
                if nft_data:
                    result['rewardNft'] = {
                        'id': nft_data[0],
                        'title': nft_data[1],
                        'description': nft_data[2],
                        'imageUri': nft_data[3]
                    }
            
            # Quest koşullarını ekle
            try:
                cursor.execute("""
                    SELECT ConditionID, ConditionType, TargetID, TargetValue, Description
                    FROM QuestConditions
                    WHERE QuestID = %s
                """, [quest_id])
                
                conditions = cursor.fetchall()
                
                result['conditions'] = [
                    {
                        'conditionId': condition[0],
                        'conditionType': condition[1],
                        'targetId': condition[2],
                        'targetValue': condition[3],
                        'description': condition[4]
                    } for condition in conditions
                ]
            except Exception as e:
                print(f"Error fetching quest conditions: {str(e)}")
                result['conditions'] = []
            
            # Kullanıcı ilerleme bilgilerini ekle (eğer kullanıcı oturum açtıysa)
            if user_id:
                try:
                    cursor.execute("""
                        SELECT CurrentProgress, IsCompleted, RewardClaimed, CompletionDate
                        FROM UserQuestProgress
                        WHERE UserID = %s AND QuestID = %s
                    """, [user_id, quest_id])
                    
                    progress_data = cursor.fetchone()
                    if progress_data:
                        # Calculate completion percentage in code
                        cursor.execute("""
                            SELECT COUNT(ConditionID)
                            FROM QuestConditions
                            WHERE QuestID = %s
                        """, [quest_id])
                        
                        total_conditions = cursor.fetchone()[0] or 1  # Avoid division by zero
                        current_progress = progress_data[0] or 0
                        completion_percentage = (current_progress / total_conditions) * 100
                        
                        result['progress'] = {
                            'currentProgress': progress_data[0],
                            'isCompleted': bool(progress_data[1]),
                            'rewardClaimed': bool(progress_data[2]),
                            'completionDate': progress_data[3],
                            'completionPercentage': completion_percentage
                        }
                except Exception as e:
                    print(f"Error fetching user progress: {str(e)}")
                    result['progress'] = {
                        'currentProgress': 0,
                        'isCompleted': False,
                        'rewardClaimed': False,
                        'completionDate': None,
                        'completionPercentage': 0
                    }
            
            return Response(result)
    
    except Exception as e:
        print(f"Error in quest_detail: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_quest_progress(request, quest_id):
    """Kullanıcının quest ilerlemesini güncelleyen API endpoint"""
    
    user_id = request.user.id
    
    # Gelen veriyi doğrula
    try:
        completed_condition_ids = request.data.get('completedConditionIds', [])
        if not isinstance(completed_condition_ids, list):
            return Response({"error": "completedConditionIds bir liste olmalıdır"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response({"error": "Geçersiz veri formatı"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with connection.cursor() as cursor:
            # Quest'in varlığını kontrol et
            cursor.execute("SELECT QuestID FROM Quests WHERE QuestID = %s", [quest_id])
            if not cursor.fetchone():
                return Response({"error": "Quest bulunamadı"}, status=status.HTTP_404_NOT_FOUND)
            
            # Quest koşullarının toplam sayısını al
            cursor.execute("""
                SELECT COUNT(ConditionID)
                FROM QuestConditions
                WHERE QuestID = %s
            """, [quest_id])
            
            total_conditions = cursor.fetchone()[0]
            
            # If no conditions exist, create default progress instead of error
            if not total_conditions:
                # No conditions found, but allow enrollment by creating progress with 100% completion
                cursor.execute("""
                    SELECT ProgressID FROM UserQuestProgress
                    WHERE UserID = %s AND QuestID = %s
                """, [user_id, quest_id])
                
                progress_exists = cursor.fetchone()
                
                if not progress_exists:
                    # Create new progress entry with 100% completion since there are no conditions
                    cursor.execute("""
                        INSERT INTO UserQuestProgress
                        (UserID, QuestID, CurrentProgress, IsCompleted, CompletionDate, RewardClaimed)
                        VALUES (%s, %s, 1, 1, GETDATE(), 0)
                    """, [user_id, quest_id])
                
                return Response({
                    "success": True,
                    "message": "Quest enrolled successfully with no conditions",
                    "progress": {
                        "currentProgress": 1,
                        "isCompleted": True,
                        "rewardClaimed": False,
                        "completionDate": None,
                        "completionPercentage": 100
                    },
                    "conditions": []
                })
            
            # Tamamlanan koşulların geçerliliğini kontrol et
            valid_condition_ids = []
            for condition_id in completed_condition_ids:
                cursor.execute("""
                    SELECT ConditionID
                    FROM QuestConditions
                    WHERE ConditionID = %s AND QuestID = %s
                """, [condition_id, quest_id])
                
                if cursor.fetchone():
                    valid_condition_ids.append(condition_id)
            
            # İlerleme yüzdesini hesapla
            current_progress = len(valid_condition_ids)
            completion_percentage = (current_progress / total_conditions) * 100
            
            # Tüm koşullar tamamlandı mı kontrol et
            is_completed = current_progress >= total_conditions
            completion_date = 'GETDATE()' if is_completed else 'NULL'
            
            # UserQuestProgress tablosunda kayıt var mı kontrol et
            cursor.execute("""
                SELECT ProgressID, CurrentProgress, IsCompleted
                FROM UserQuestProgress
                WHERE UserID = %s AND QuestID = %s
            """, [user_id, quest_id])
            
            progress_data = cursor.fetchone()
            
            if progress_data:
                # Var olan kaydı güncelle (eğer ilerleme arttıysa)
                if current_progress > progress_data[1] or (is_completed and not progress_data[2]):
                    update_sql = f"""
                        UPDATE UserQuestProgress
                        SET CurrentProgress = %s,
                            IsCompleted = %s,
                            CompletionDate = {completion_date if is_completed else 'CompletionDate'}
                        WHERE ProgressID = %s
                    """
                    
                    params = [current_progress, is_completed, progress_data[0]]
                    cursor.execute(update_sql, params)
            else:
                # Yeni kayıt oluştur
                cursor.execute("""
                    INSERT INTO UserQuestProgress 
                    (UserID, QuestID, CurrentProgress, IsCompleted, CompletionDate, RewardClaimed)
                    VALUES (%s, %s, %s, %s, NULL, 0)
                """, [user_id, quest_id, current_progress, is_completed])
                
                if is_completed:
                    cursor.execute("""
                        UPDATE UserQuestProgress
                        SET CompletionDate = GETDATE()
                        WHERE UserID = %s AND QuestID = %s
                    """, [user_id, quest_id])
            
            # Güncellenmiş ilerleme bilgisini al
            cursor.execute("""
                SELECT CurrentProgress, IsCompleted, RewardClaimed, CompletionDate
                FROM UserQuestProgress
                WHERE UserID = %s AND QuestID = %s
            """, [user_id, quest_id])
            
            updated_progress = cursor.fetchone()
            
            # Calculate completion percentage from progress values
            completion_percentage = (updated_progress[0] / total_conditions) * 100 if total_conditions > 0 else 0
            
            return Response({
                "success": True,
                "message": "Quest ilerlemesi güncellendi",
                "progress": {
                    "currentProgress": updated_progress[0],
                    "isCompleted": bool(updated_progress[1]),
                    "rewardClaimed": bool(updated_progress[2]),
                    "completionDate": updated_progress[3],
                    "completionPercentage": completion_percentage
                }
            })
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_quest_reward(request, quest_id):
    """Kullanıcının tamamlanan quest ödülünü talep etmesini sağlayan API endpoint"""
    
    user_id = request.user.id
    
    try:
        with connection.cursor() as cursor:
            # İlerlemeyi kontrol et
            cursor.execute("""
                SELECT ProgressID, IsCompleted, RewardClaimed
                FROM UserQuestProgress
                WHERE UserID = %s AND QuestID = %s
            """, [user_id, quest_id])
            
            progress_data = cursor.fetchone()
            
            # İlerleme kaydı yoksa veya tamamlanmamışsa hata döndür
            if not progress_data:
                return Response({"error": "Bu quest için ilerleme kaydı bulunamadı"}, status=status.HTTP_404_NOT_FOUND)
            
            if not progress_data[1]:
                return Response({"error": "Bu quest henüz tamamlanmadı"}, status=status.HTTP_400_BAD_REQUEST)
            
            if progress_data[2]:
                return Response({"error": "Bu quest'in ödülü zaten talep edilmiş"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Quest ödül bilgilerini al
            cursor.execute("""
                SELECT RewardPoints, RewardNFTID
                FROM Quests
                WHERE QuestID = %s
            """, [quest_id])
            
            reward_data = cursor.fetchone()
            
            if not reward_data:
                return Response({"error": "Quest bulunamadı"}, status=status.HTTP_404_NOT_FOUND)
            
            reward_points = reward_data[0] or 0
            reward_nft_id = reward_data[1]
            
            # Kullanıcıya puanları ekle
            cursor.execute("""
                UPDATE Users
                SET TotalPoints = TotalPoints + %s
                WHERE UserID = %s
            """, [reward_points, user_id])
            
            # Eğer NFT ödülü varsa kullanıcıya ekle
            if reward_nft_id:
                cursor.execute("""
                    INSERT INTO UserNFTs (UserID, NFTID, AcquisitionDate)
                    VALUES (%s, %s, GETDATE())
                """, [user_id, reward_nft_id])
            
            # Ödül talep edildi olarak işaretle
            cursor.execute("""
                UPDATE UserQuestProgress
                SET RewardClaimed = 1
                WHERE ProgressID = %s
            """, [progress_data[0]])
            
            return Response({
                "success": True,
                "message": "Quest ödülü başarıyla talep edildi",
                "rewards": {
                    "points": reward_points,
                    "nft": bool(reward_nft_id)
                }
            })
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quest(request):
    """API endpoint to create a new quest directly"""
    user_id = request.user.id
    
    # Admin check
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can create quests'}, 
                       status=status.HTTP_403_FORBIDDEN)
        
        # Check if Category column exists in Quests table, if not add it
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Quests' 
            AND COLUMN_NAME = 'Category'
        """)
        
        category_column_exists = cursor.fetchone() is not None
        
        if not category_column_exists:
            print("Adding Category column to Quests table...")
            cursor.execute("""
                ALTER TABLE Quests 
                ADD Category NVARCHAR(100) NULL
            """)
            print("Category column added successfully")
    
    try:
        # Get request data
        title = request.data.get('title')
        description = request.data.get('description')
        category = request.data.get('category', 'General Learning')
        difficulty_level = request.data.get('difficultyLevel', 'intermediate')
        
        # Convert string values to integers
        try:
            required_points = int(request.data.get('requiredPoints', 0))
        except (ValueError, TypeError):
            required_points = 0
            
        try:
            reward_points = int(request.data.get('rewardPoints', 50))
        except (ValueError, TypeError):
            reward_points = 50
            
        try:
            reward_nft_id = int(request.data.get('rewardNftId')) if request.data.get('rewardNftId') else None
        except (ValueError, TypeError):
            reward_nft_id = None
            
        is_active = request.data.get('isActive', True)
        conditions = request.data.get('conditions', [])
        
        # Basic validation
        if not title:
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not description:
            return Response({'error': 'Description is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        with connection.cursor() as cursor:
            # First create the quest
            cursor.execute("""
                INSERT INTO Quests
                (Title, Description, Category, RequiredPoints, RewardPoints, RewardNFTID, DifficultyLevel, 
                 IsActive, IsAIGenerated, CreationDate)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0, GETDATE())
            """, [
                title, description, category, required_points, reward_points, reward_nft_id, difficulty_level,
                1 if is_active else 0
            ])
            
            # Get the new quest ID using a separate query
            cursor.execute("SELECT SCOPE_IDENTITY()")
            result = cursor.fetchone()
            print(f"Quest creation result: {result}")
            
            if not result or result[0] is None:
                # Try alternative method to get the last inserted ID
                cursor.execute("SELECT MAX(QuestID) FROM Quests WHERE Title = %s AND CreationDate >= DATEADD(second, -10, GETDATE())", [title])
                result = cursor.fetchone()
                print(f"Alternative quest ID fetch result: {result}")
                
                if not result or result[0] is None:
                    return Response({'error': 'Failed to create quest - no ID returned'}, 
                                  status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            quest_id = int(result[0])
            print(f"Created quest with ID: {quest_id}")
            
            # Add quest conditions if provided
            if conditions:
                for condition in conditions:
                    condition_type = condition.get('conditionType', 'total_points')
                    target_id = condition.get('targetId')
                    
                    # Convert targetValue to integer
                    try:
                        target_value = int(condition.get('targetValue', 1))
                    except (ValueError, TypeError):
                        target_value = 1
                        
                    condition_description = condition.get('description', '')
                    
                    # Validate condition type
                    valid_condition_types = [
                        'course_completion', 'quiz_score', 'watch_videos', 'total_points',
                        'take_quiz', 'start_discussion'
                    ]
                    
                    if condition_type not in valid_condition_types:
                        return Response({
                            'error': f'Invalid condition type: {condition_type}',
                            'valid_types': valid_condition_types
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Additional validation for target_id based on condition type
                    if condition_type in ['course_completion', 'quiz_score', 'watch_videos', 
                                         'take_quiz', 'start_discussion'] and not target_id:
                        return Response({
                            'error': f'Target ID is required for condition type: {condition_type}'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    cursor.execute("""
                        INSERT INTO QuestConditions
                        (QuestID, ConditionType, TargetID, TargetValue, Description)
                        VALUES (%s, %s, %s, %s, %s)
                    """, [
                        quest_id, condition_type, target_id, target_value, condition_description
                    ])
            
            # Get the created quest details
            cursor.execute("""
                SELECT q.QuestID, q.Title, q.Description, q.Category, q.RequiredPoints, 
                       q.RewardPoints, q.DifficultyLevel, q.IsActive, q.IsAIGenerated,
                       q.CreationDate
                FROM Quests q
                WHERE q.QuestID = %s
            """, [quest_id])
            
            columns = [col[0] for col in cursor.description]
            quest_data = cursor.fetchone()
            quest = dict(zip(columns, quest_data))
            
            # Get conditions for the quest
            cursor.execute("""
                SELECT ConditionID, ConditionType, TargetID, TargetValue, Description
                FROM QuestConditions
                WHERE QuestID = %s
            """, [quest_id])
            
            columns = [col[0] for col in cursor.description]
            conditions_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
            quest['conditions'] = conditions_data
            
            return Response({
                'message': 'Quest created successfully',
                'questId': quest_id,
                'quest': quest
            })
            
    except Exception as e:
        import traceback
        error_details = {
            'error': str(e),
            'traceback': traceback.format_exc(),
            'request_data': request.data
        }
        print(f"Quest creation error: {error_details}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def prepare_quest_nft(request, quest_id):
    """Prepare NFT creation data for a quest and redirect user to NFT creation page"""
    user_id = request.user.id
    
    # Check admin permissions
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can create NFTs for quests'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get quest details to pre-fill NFT data
        cursor.execute("""
            SELECT Title, Description, RequiredPoints, RewardPoints, DifficultyLevel, RewardNFTID
            FROM Quests
            WHERE QuestID = %s
        """, [quest_id])
        
        quest_data = cursor.fetchone()
        
        if not quest_data:
            return Response({'error': 'Quest not found'}, status=status.HTTP_404_NOT_FOUND)
        
        title, description, required_points, reward_points, difficulty, reward_nft_id = quest_data
        
        # If the quest already has an NFT, return that information
        if reward_nft_id:
            cursor.execute("""
                SELECT NFTID, Title, Description, ImageURI, NFTTypeID, TradeValue, Rarity
                FROM NFTs
                WHERE NFTID = %s
            """, [reward_nft_id])
            
            nft_data = cursor.fetchone()
            
            if nft_data:
                nft_id, nft_title, nft_description, image_uri, nft_type_id, trade_value, rarity = nft_data
                
                return Response({
                    'message': 'Quest already has an NFT reward',
                    'questId': quest_id,
                    'nftId': nft_id,
                    'nftData': {
                        'title': nft_title,
                        'description': nft_description,
                        'imageUri': image_uri,
                        'nftTypeId': nft_type_id,
                        'tradeValue': trade_value,
                        'rarity': rarity
                    }
                })
        
        # Prepare NFT data based on quest
        rarity_map = {
            'beginner': 'Common',
            'easy': 'Common',
            'intermediate': 'Uncommon',
            'advanced': 'Rare',
            'expert': 'Epic',
            'legendary': 'Legendary'
        }
        
        # Use difficulty to determine NFT rarity
        rarity = rarity_map.get(difficulty.lower(), 'Uncommon')
        
        # Determine trade value based on reward points
        trade_value = max(10, reward_points)
        
        # Prepare NFT creation data
        nft_data = {
            'title': f"Quest Reward: {title}",
            'description': f"NFT reward for completing the quest '{title}'. {description}",
            'nftTypeId': 1,  # Default type for quest rewards
            'tradeValue': trade_value,
            'rarity': rarity,
            'questId': quest_id,  # Pass the quest ID for reference
            'redirectUrl': f"/admin/quests/{quest_id}",  # Redirect URL after NFT creation
            'suggestedImageQuery': f"{title} {difficulty} quest reward NFT"  # For image generation
        }
        
        return Response({
            'message': 'NFT data prepared for quest',
            'questId': quest_id,
            'nftData': nft_data
        })
