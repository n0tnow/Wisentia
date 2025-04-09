from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
                    SELECT Title FROM Courses WHERE CourseID = %s
                """, [target_id])
                
                course_data = cursor.fetchone()
                if course_data:
                    condition['targetTitle'] = course_data[0]
            
            elif condition_type == 'quiz_score':
                cursor.execute("""
                    SELECT q.Title, cv.Title as VideoTitle
                    FROM Quizzes q
                    JOIN CourseVideos cv ON q.VideoID = cv.VideoID
                    WHERE q.QuizID = %s
                """, [target_id])
                
                quiz_data = cursor.fetchone()
                if quiz_data:
                    condition['targetTitle'] = quiz_data[0]
                    condition['videoTitle'] = quiz_data[1]
            
            elif condition_type == 'watch_videos':
                cursor.execute("""
                    SELECT Title FROM CourseVideos WHERE VideoID = %s
                """, [target_id])
                
                video_data = cursor.fetchone()
                if video_data:
                    condition['targetTitle'] = video_data[0]
            
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
                    LIMIT 1
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