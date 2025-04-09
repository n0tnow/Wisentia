from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from datetime import datetime, timedelta

@api_view(['GET'])
@permission_classes([AllowAny])
def list_plans(request):
    """Abonelik planlarını listeleyen API endpoint'i"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT sp.PlanID, sp.PlanName, sp.Description, sp.DurationDays, 
                   sp.Price, sp.Features, n.NFTID, n.Title as NFTTitle, 
                   n.ImageURI as NFTImage
            FROM SubscriptionPlans sp
            LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
            WHERE sp.IsActive = 1
            ORDER BY sp.Price
        """)
        
        columns = [col[0] for col in cursor.description]
        plans = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(plans)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_subscription(request):
    """Kullanıcının aktif aboneliklerini getiren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT us.SubscriptionID, us.StartDate, us.EndDate, 
                   us.IsActive, us.AutoRenew, us.PaymentMethod,
                   sp.PlanID, sp.PlanName, sp.DurationDays, sp.Price,
                   n.NFTID, n.Title as NFTTitle, n.ImageURI as NFTImage
            FROM UserSubscriptions us
            JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
            LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
            WHERE us.UserID = %s AND us.IsActive = 1
            ORDER BY us.EndDate DESC
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        subscriptions = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Abonelik geçmişi
        cursor.execute("""
            SELECT us.SubscriptionID, us.StartDate, us.EndDate, 
                   sp.PlanName, us.PaymentMethod
            FROM UserSubscriptions us
            JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
            WHERE us.UserID = %s AND (us.IsActive = 0 OR us.EndDate < GETDATE())
            ORDER BY us.EndDate DESC
        """, [user_id])
        
        history_columns = [col[0] for col in cursor.description]
        history = [dict(zip(history_columns, row)) for row in cursor.fetchall()]
    
    return Response({
        'activeSubscriptions': subscriptions,
        'history': history
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe(request):
    """Yeni abonelik satın alan API endpoint'i"""
    user_id = request.user.id
    plan_id = request.data.get('planId')
    payment_method = request.data.get('paymentMethod', 'wallet')
    payment_transaction_id = request.data.get('transactionId')
    auto_renew = request.data.get('autoRenew', False)
    
    if not plan_id:
        return Response({'error': 'Plan ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Planı kontrol et
        cursor.execute("""
            SELECT PlanID, DurationDays, NFTID
            FROM SubscriptionPlans
            WHERE PlanID = %s AND IsActive = 1
        """, [plan_id])
        
        plan_data = cursor.fetchone()
        
        if not plan_data:
            return Response({'error': 'Invalid or inactive plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        _, duration_days, nft_id = plan_data
        
        # Kullanıcının aktif aboneliği var mı kontrol et
        cursor.execute("""
            SELECT SubscriptionID
            FROM UserSubscriptions
            WHERE UserID = %s AND IsActive = 1
        """, [user_id])
        
        if cursor.fetchone():
            return Response({
                'error': 'User already has an active subscription. Please cancel it first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Ödeme işlemi (gerçek projede ödeme gateway entegrasyonu olacak)
        # Bu örnekte ödeme başarılı kabul ediyoruz
        
        # Abonelik tarihleri
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        
        # Abonelik oluştur
        cursor.execute("""
            INSERT INTO UserSubscriptions
            (UserID, PlanID, StartDate, EndDate, IsActive, PaymentTransactionID, PaymentMethod, AutoRenew)
            VALUES (%s, %s, %s, %s, 1, %s, %s, %s);
            SELECT SCOPE_IDENTITY();
        """, [
            user_id, plan_id, start_date, end_date, 
            payment_transaction_id, payment_method, auto_renew
        ])
        
        subscription_id = cursor.fetchone()[0]
        
        # Abonelik NFT'sini kullanıcıya ekle
        if nft_id:
            cursor.execute("""
                INSERT INTO UserNFTs
                (UserID, NFTID, AcquisitionDate, ExpiryDate, IsMinted)
                VALUES (%s, %s, GETDATE(), %s, 0)
            """, [user_id, nft_id, end_date])
        
        # Bildirim oluştur
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
            VALUES (%s, 'Subscription Activated', 'Your subscription has been successfully activated.', 
                    'system', 0, 0, GETDATE())
        """, [user_id])
        
        # Etkinlik logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'subscription_created', 'Subscription activated', GETDATE(), %s, %s)
        """, [
            user_id, 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({
        'message': 'Subscription activated successfully',
        'subscriptionId': subscription_id,
        'startDate': start_date,
        'endDate': end_date
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request, subscription_id):
    """Aboneliği iptal eden API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Aboneliği kontrol et
        cursor.execute("""
            SELECT us.SubscriptionID, sp.PlanName
            FROM UserSubscriptions us
            JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
            WHERE us.SubscriptionID = %s AND us.UserID = %s AND us.IsActive = 1
        """, [subscription_id, user_id])
        
        subscription_data = cursor.fetchone()
        
        if not subscription_data:
            return Response({
                'error': 'Subscription not found or already inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Aboneliği iptal et (endDate'i değiştirmeden sadece isActive'i 0 yap)
        cursor.execute("""
            UPDATE UserSubscriptions
            SET IsActive = 0, AutoRenew = 0
            WHERE SubscriptionID = %s
        """, [subscription_id])
        
        # İlgili NFT'nin süresini güncelle
        cursor.execute("""
            UPDATE UserNFTs
            SET ExpiryDate = GETDATE()
            FROM UserNFTs un
            JOIN SubscriptionPlans sp ON un.NFTID = sp.NFTID
            JOIN UserSubscriptions us ON sp.PlanID = us.PlanID
            WHERE us.SubscriptionID = %s AND un.UserID = %s
        """, [subscription_id, user_id])
        
        # Bildirim oluştur
        plan_name = subscription_data[1]
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
            VALUES (%s, 'Subscription Cancelled', %s, 'system', 0, 0, GETDATE())
        """, [
            user_id, 
            f"Your {plan_name} subscription has been cancelled."
        ])
        
        # Etkinlik logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'subscription_cancelled', %s, GETDATE(), %s, %s)
        """, [
            user_id, 
            f"Cancelled {plan_name} subscription", 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({'message': 'Subscription cancelled successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_auto_renew(request, subscription_id):
    """Otomatik yenilemeyi açıp kapatan API endpoint'i"""
    user_id = request.user.id
    auto_renew = request.data.get('autoRenew')
    
    if auto_renew is None:
        return Response({'error': 'autoRenew parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Aboneliği kontrol et
        cursor.execute("""
            SELECT SubscriptionID
            FROM UserSubscriptions
            WHERE SubscriptionID = %s AND UserID = %s AND IsActive = 1
        """, [subscription_id, user_id])
        
        if not cursor.fetchone():
            return Response({
                'error': 'Subscription not found or already inactive'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Otomatik yenilemeyi güncelle
        cursor.execute("""
            UPDATE UserSubscriptions
            SET AutoRenew = %s
            WHERE SubscriptionID = %s
        """, [auto_renew, subscription_id])
        
        # Etkinlik logu ekle
        action = "enabled" if auto_renew else "disabled"
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'subscription_update', %s, GETDATE(), %s, %s)
        """, [
            user_id, 
            f"Auto-renew {action} for subscription", 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({
        'message': f'Auto-renew {action} successfully'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trade_nfts_for_subscription(request):
    """NFT'leri abonelik için takas eden API endpoint'i"""
    user_id = request.user.id
    plan_id = request.data.get('planId')
    nft_ids = request.data.get('nftIds', [])
    
    if not plan_id:
        return Response({'error': 'Plan ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not nft_ids:
        return Response({'error': 'At least one NFT ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Planı kontrol et
        cursor.execute("""
            SELECT sp.PlanID, sp.DurationDays, sp.NFTID, sp.Price, n.TradeValue
            FROM SubscriptionPlans sp
            LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
            WHERE sp.PlanID = %s AND sp.IsActive = 1
        """, [plan_id])
        
        plan_data = cursor.fetchone()
        
        if not plan_data:
            return Response({'error': 'Invalid or inactive plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        _, duration_days, sub_nft_id, plan_price, sub_nft_value = plan_data
        
        # Kullanıcının NFT'lerini kontrol et
        total_value = 0
        valid_user_nfts = []
        
        for nft_id in nft_ids:
            cursor.execute("""
                SELECT un.UserNFTID, n.NFTID, n.Title, n.TradeValue
                FROM UserNFTs un
                JOIN NFTs n ON un.NFTID = n.NFTID
                WHERE un.UserID = %s AND n.NFTID = %s AND un.IsMinted = 0
                  AND (un.ExpiryDate IS NULL OR un.ExpiryDate > GETDATE())
            """, [user_id, nft_id])
            
            nft_data = cursor.fetchone()
            
            if not nft_data:
                return Response({
                    'error': f'NFT with ID {nft_id} not found, not owned by user, or not eligible for trade'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user_nft_id, _, nft_title, nft_value = nft_data
            total_value += nft_value
            valid_user_nfts.append((user_nft_id, nft_title))
        
        # Toplam değerin yeterli olup olmadığını kontrol et
        required_value = plan_price if sub_nft_value is None else sub_nft_value
        
        if total_value < required_value:
            return Response({
                'error': f'Total NFT value ({total_value}) is less than required value ({required_value})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Kullanıcının aktif aboneliği var mı kontrol et
        cursor.execute("""
            SELECT SubscriptionID
            FROM UserSubscriptions
            WHERE UserID = %s AND IsActive = 1
        """, [user_id])
        
        if cursor.fetchone():
            return Response({
                'error': 'User already has an active subscription. Please cancel it first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Abonelik tarihleri
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        
        # Abonelik oluştur
        cursor.execute("""
            INSERT INTO UserSubscriptions
            (UserID, PlanID, StartDate, EndDate, IsActive, PaymentMethod, AutoRenew)
            VALUES (%s, %s, %s, %s, 1, 'nft_trade', 0);
            SELECT SCOPE_IDENTITY();
        """, [
            user_id, plan_id, start_date, end_date
        ])
        
        subscription_id = cursor.fetchone()[0]
        
        # Takas edilen NFT'leri işaretle
        for user_nft_id, _ in valid_user_nfts:
            cursor.execute("""
                UPDATE UserNFTs
                SET IsTradedForSubscription = 1, TradedAt = GETDATE()
                WHERE UserNFTID = %s
            """, [user_nft_id])
        
        # Abonelik NFT'sini kullanıcıya ekle
        if sub_nft_id:
            cursor.execute("""
                INSERT INTO UserNFTs
                (UserID, NFTID, AcquisitionDate, ExpiryDate, IsMinted)
                VALUES (%s, %s, GETDATE(), %s, 0)
            """, [user_id, sub_nft_id, end_date])
        
        # Takas kaydı oluştur
        cursor.execute("""
            INSERT INTO NFTTrades
            (OfferUserID, TargetNFTID, TradeStatus, CreationDate, CompletionDate)
            VALUES (%s, %s, 'completed', GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY();
        """, [user_id, sub_nft_id])
        
        trade_id = cursor.fetchone()[0]
        
        # Takas detaylarını ekle
        for user_nft_id, _ in valid_user_nfts:
            cursor.execute("""
                INSERT INTO NFTTradeDetails
                (TradeID, OfferedUserNFTID)
                VALUES (%s, %s)
            """, [trade_id, user_nft_id])
        
        # Bildirim oluştur
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
            VALUES (%s, 'Subscription Activated via NFT Trade', 
                   'Your subscription has been activated using your NFTs.', 
                   'system', 0, 0, GETDATE())
        """, [user_id])
        
        # Etkinlik logu ekle
        nft_names = ', '.join([name for _, name in valid_user_nfts])
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'nft_trade_for_subscription', %s, GETDATE(), %s, %s)
        """, [
            user_id, 
            f"Traded NFTs ({nft_names}) for subscription", 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({
        'message': 'NFTs successfully traded for subscription',
        'subscriptionId': subscription_id,
        'startDate': start_date,
        'endDate': end_date,
        'tradedNFTs': [name for _, name in valid_user_nfts]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def renew_subscription(request, subscription_id):
    """Aboneliği yenileyen API endpoint'i"""
    user_id = request.user.id
    payment_method = request.data.get('paymentMethod', 'wallet')
    payment_transaction_id = request.data.get('transactionId')
    
    with connection.cursor() as cursor:
        # Aboneliği kontrol et
        cursor.execute("""
            SELECT us.SubscriptionID, us.PlanID, sp.DurationDays, sp.NFTID
            FROM UserSubscriptions us
            JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
            WHERE us.SubscriptionID = %s AND us.UserID = %s
        """, [subscription_id, user_id])
        
        subscription_data = cursor.fetchone()
        
        if not subscription_data:
            return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
        
        _, plan_id, duration_days, nft_id = subscription_data
        
        # Ödeme işlemi (gerçek projede ödeme gateway entegrasyonu olacak)
        # Bu örnekte ödeme başarılı kabul ediyoruz
        
        # Abonelik tarihleri
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        
        # Aboneliği güncelle
        cursor.execute("""
            UPDATE UserSubscriptions
            SET StartDate = %s, EndDate = %s, IsActive = 1, 
                PaymentTransactionID = %s, PaymentMethod = %s
            WHERE SubscriptionID = %s
        """, [
            start_date, end_date, payment_transaction_id, payment_method, subscription_id
        ])
        
        # Abonelik NFT'sini güncelle
        if nft_id:
            cursor.execute("""
                UPDATE UserNFTs
                SET ExpiryDate = %s
                WHERE UserID = %s AND NFTID = %s
            """, [end_date, user_id, nft_id])
        
        # Bildirim oluştur
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
            VALUES (%s, 'Subscription Renewed', 'Your subscription has been successfully renewed.', 
                    'system', 0, 0, GETDATE())
        """, [user_id])
        
        # Etkinlik logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'subscription_renewed', 'Subscription renewed', GETDATE(), %s, %s)
        """, [
            user_id, 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({
        'message': 'Subscription renewed successfully',
        'startDate': start_date,
        'endDate': end_date
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def check_subscription_access(request):
    """Kullanıcının abonelik erişimini kontrol eden API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT us.SubscriptionID, sp.PlanName, us.EndDate
            FROM UserSubscriptions us
            JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
            WHERE us.UserID = %s AND us.IsActive = 1 AND us.EndDate > GETDATE()
        """, [user_id])
        
        subscription = cursor.fetchone()
        
        if not subscription:
            return Response({
                'hasAccess': False,
                'message': 'No active subscription found'
            })
        
        _, plan_name, end_date = subscription
    
    return Response({
        'hasAccess': True,
        'subscriptionPlan': plan_name,
        'expiresAt': end_date
    })