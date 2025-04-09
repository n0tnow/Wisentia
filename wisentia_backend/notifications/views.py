from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Kullanıcının bildirimlerini getiren API endpoint'i"""
    user_id = request.user.id
    is_read = request.query_params.get('is_read')
    limit = int(request.query_params.get('limit', 20))
    
    params = [user_id]
    sql = """
        SELECT NotificationID, Title, Message, NotificationType, 
               RelatedEntityID, IsRead, CreationDate
        FROM Notifications
        WHERE UserID = %s
    """
    
    if is_read is not None:
        is_read_bool = is_read.lower() == 'true'
        sql += " AND IsRead = %s"
        params.append(is_read_bool)
    
    sql += " ORDER BY CreationDate DESC"
    
    if limit:
        sql = f"{sql} OFFSET 0 ROWS FETCH NEXT {limit} ROWS ONLY"
    
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        notifications = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Okunmamış bildirimlerin sayısını al
        cursor.execute("""
            SELECT COUNT(*)
            FROM Notifications
            WHERE UserID = %s AND IsRead = 0
        """, [user_id])
        
        unread_count = cursor.fetchone()[0]
    
    return Response({
        'notifications': notifications,
        'unreadCount': unread_count
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notification_id=None):
    """Bildirimi okundu olarak işaretleyen API endpoint'i"""
    user_id = request.user.id
    
    if notification_id:
        # Tek bildirimi okundu olarak işaretle
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Notifications
                SET IsRead = 1
                WHERE NotificationID = %s AND UserID = %s
            """, [notification_id, user_id])
            
            if cursor.rowcount == 0:
                return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'message': 'Notification marked as read'})
    else:
        # Tüm bildirimleri okundu olarak işaretle
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Notifications
                SET IsRead = 1
                WHERE UserID = %s AND IsRead = 0
            """, [user_id])
        
        return Response({'message': 'All notifications marked as read'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dismiss_notification(request, notification_id):
    """Bildirimi kaldıran API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE Notifications
            SET IsDismissed = 1
            WHERE NotificationID = %s AND UserID = %s
        """, [notification_id, user_id])
        
        if cursor.rowcount == 0:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({'message': 'Notification dismissed'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """Yeni bildirim oluşturan API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()[0]
        
        if user_role != 'admin':
            return Response({'error': 'Only administrators can create notifications'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Bildirim bilgilerini al
    target_user_id = request.data.get('userId')
    title = request.data.get('title')
    message = request.data.get('message')
    notification_type = request.data.get('type', 'system')
    related_entity_id = request.data.get('relatedEntityId')
    
    # Zorunlu alanları kontrol et
    if not all([target_user_id, title, message]):
        return Response({
            'error': 'User ID, title and message are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Kullanıcı kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserID FROM Users WHERE UserID = %s
        """, [target_user_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Target user not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Bildirim oluştur
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, RelatedEntityID, IsRead, IsDismissed, CreationDate)
            VALUES (%s, %s, %s, %s, %s, 0, 0, GETDATE());
            SELECT SCOPE_IDENTITY();
        """, [
            target_user_id, title, message, notification_type, related_entity_id
        ])
        
        notification_id = cursor.fetchone()[0]
    
    return Response({
        'message': 'Notification created successfully',
        'notificationId': notification_id
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_notification(request):
    """Toplu bildirim gönderen API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()[0]
        
        if user_role != 'admin':
            return Response({'error': 'Only administrators can send bulk notifications'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Bildirim bilgilerini al
    title = request.data.get('title')
    message = request.data.get('message')
    notification_type = request.data.get('type', 'system')
    user_filter = request.data.get('userFilter', 'all')  # all, active, subscription
    
    # Zorunlu alanları kontrol et
    if not all([title, message]):
        return Response({
            'error': 'Title and message are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Kullanıcıları filtrele ve bildirim gönder
    with connection.cursor() as cursor:
        user_query = "SELECT UserID FROM Users WHERE 1=1"
        
        if user_filter == 'active':
            user_query += " AND IsActive = 1"
        elif user_filter == 'subscription':
            user_query += " AND UserID IN (SELECT UserID FROM UserSubscriptions WHERE IsActive = 1)"
        
        cursor.execute(user_query)
        user_ids = [row[0] for row in cursor.fetchall()]
        
        if not user_ids:
            return Response({'error': 'No users match the specified filter'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Toplu bildirim oluştur
        notification_ids = []
        for target_user_id in user_ids:
            cursor.execute("""
                INSERT INTO Notifications
                (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                VALUES (%s, %s, %s, %s, 0, 0, GETDATE());
                SELECT SCOPE_IDENTITY();
            """, [
                target_user_id, title, message, notification_type
            ])
            
            notification_ids.append(cursor.fetchone()[0])
    
    return Response({
        'message': f'Sent {len(user_ids)} notifications successfully',
        'notificationCount': len(user_ids)
    }, status=status.HTTP_201_CREATED)