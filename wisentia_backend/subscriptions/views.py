from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from datetime import datetime, timedelta
import json
from datetime import date, datetime
from decimal import Decimal


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

# subscriptions/views.py dosyasına eklenecek fonksiyonlar

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription_plan(request):
    """Admin için yeni abonelik planı oluşturan API endpoint'i"""
    user_id = request.user.id
    
    # Admin kontrolü
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT UserRole FROM Users WHERE UserID = %s
            """, [user_id])
            
            user_role = cursor.fetchone()
            if not user_role or user_role[0] != 'admin':
                return Response({'error': 'Only administrators can create subscription plans'}, 
                            status=status.HTTP_403_FORBIDDEN)
    except Exception as auth_error:
        print(f"Admin yetki kontrolü hatası: {str(auth_error)}")
        return Response({'error': 'Authorization check failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Plan bilgilerini al ve doğrula
    try:
        plan_name = request.data.get('planName')
        description = request.data.get('description', '')
        duration_days = request.data.get('durationDays')
        price = request.data.get('price')
        nft_id = request.data.get('nftId')
        features = request.data.get('features', '')
        is_active = request.data.get('isActive', True)
        
        # Değerlerin tiplerini kontrol et
        if not isinstance(plan_name, str) or not plan_name.strip():
            return Response({'error': 'Plan name must be a non-empty string'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            duration_days = int(duration_days)
            if duration_days <= 0:
                return Response({'error': 'Duration days must be a positive integer'}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({'error': 'Duration days must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            price = float(price)
            if price < 0:
                return Response({'error': 'Price cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({'error': 'Price must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)
        
        # NFT ID kontrolü (varsa)
        if nft_id:
            try:
                nft_id = int(nft_id)
            except (TypeError, ValueError):
                return Response({'error': 'NFT ID must be a valid integer'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as validate_error:
        print(f"Veri validasyon hatası: {str(validate_error)}")
        return Response({'error': 'Invalid data format'}, status=status.HTTP_400_BAD_REQUEST)
    
    plan_id = None
    created_nft_id = None  # Yeni oluşturulan NFT ID'si
    
    # Veritabanı işlemleri
    try:
        with connection.cursor() as cursor:
            # Eğer NFT ID verilmemişse, yeni bir NFT oluştur
            if not nft_id:
                # Subscription NFT type ID'sini al
                cursor.execute("""
                    SELECT NFTTypeID FROM NFTTypes WHERE TypeName = 'subscription'
                """)
                
                nft_type_id_result = cursor.fetchone()
                if not nft_type_id_result:
                    return Response({
                        'error': 'Subscription NFT type not found in the database. Please add it first.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                nft_type_id = nft_type_id_result[0]
                
                # Abonelik için NFT oluştur
                image_uri = request.data.get('imageUri', '/placeholder-subscription.png')
                
                try:
                    cursor.execute("""
                        INSERT INTO NFTs
                        (NFTTypeID, Title, Description, ImageURI, BlockchainMetadata, TradeValue, SubscriptionDays, IsActive)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, 1);
                        SELECT SCOPE_IDENTITY();
                    """, [
                        nft_type_id,
                        plan_name,  # Plan adı NFT adı olarak kullanılıyor
                        description,  # Plan açıklaması NFT açıklaması olarak kullanılıyor
                        image_uri,
                        '{}',  # Boş blockchain metadata
                        price,  # NFT değeri = plan fiyatı
                        duration_days
                    ])
                    
                    created_nft_id_result = cursor.fetchone()
                    created_nft_id = created_nft_id_result[0] if created_nft_id_result else None
                    
                    if not created_nft_id:
                        print("NFT ID alınamadı")
                        return Response({'error': 'Failed to create NFT for subscription plan'}, 
                                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
                    # Oluşturulan NFT ID'sini kullan
                    nft_id = created_nft_id
                    
                except Exception as nft_error:
                    print(f"NFT oluşturma hatası: {str(nft_error)}")
                    return Response({'error': f'Failed to create NFT: {str(nft_error)}'}, 
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Belirtilen NFT'nin varlığını kontrol et
                cursor.execute("SELECT NFTID FROM NFTs WHERE NFTID = %s", [nft_id])
                if not cursor.fetchone():
                    return Response({
                        'error': 'Invalid NFT ID. The specified NFT does not exist in the database.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Yeni plan oluştur
            try:
                cursor.execute("""
                    INSERT INTO SubscriptionPlans
                    (PlanName, Description, DurationDays, Price, NFTID, Features, IsActive)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """, [
                    plan_name, description, duration_days, price, 
                    nft_id, features, is_active
                ])
                
                # Oluşturulan plan ID'sini al
                cursor.execute("SELECT SCOPE_IDENTITY()")
                plan_id_result = cursor.fetchone()
                plan_id = plan_id_result[0] if plan_id_result else None
                
                if not plan_id:
                    print("Plan ID alınamadı")
                    return Response({'error': 'Failed to retrieve plan ID'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as insert_error:
                print(f"Plan ekleme hatası: {str(insert_error)}")
                return Response({'error': f'Database insert error: {str(insert_error)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Etkinlik logu ekle
            try:
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                    VALUES (%s, 'subscription_plan_created', %s, GETDATE(), %s, %s)
                """, [
                    user_id, 
                    f"Created subscription plan: {plan_name}", 
                    request.META.get('REMOTE_ADDR', ''),
                    request.META.get('HTTP_USER_AGENT', '')
                ])
            except Exception as log_error:
                print(f"Aktivite logu ekleme hatası: {str(log_error)}")
                # Log hatası kritik değil, devam et
            
            # Basit yanıt hazırla
            plan_basic = {
                'PlanID': plan_id,
                'PlanName': plan_name,
                'Description': description,
                'DurationDays': duration_days,
                'Price': price,
                'NFTID': nft_id,
                'Features': features,
                'IsActive': is_active
            }
            
            # Daha detaylı plan bilgisini almaya çalış
            try:
                cursor.execute("""
                    SELECT sp.PlanID, sp.PlanName, sp.Description, sp.DurationDays, 
                        sp.Price, sp.Features, n.NFTID, n.Title as NFTTitle, 
                        n.ImageURI as NFTImage, sp.IsActive
                    FROM SubscriptionPlans sp
                    LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
                    WHERE sp.PlanID = %s
                """, [plan_id])
                
                columns = [col[0] for col in cursor.description]
                plan_data = cursor.fetchone()
                
                # Sonuç var mı kontrol et
                if plan_data:
                    # Verileri serileştirilebilir hale getir
                    plan = {}
                    for i, col in enumerate(columns):
                        # Özel veri tiplerini düzgün formatla
                        value = plan_data[i]
                        if isinstance(value, (datetime, date)):
                            plan[col] = value.isoformat()
                        elif isinstance(value, Decimal):
                            plan[col] = float(value)
                        else:
                            plan[col] = value
                else:
                    # Detaylı veri alınamadıysa, basic veriyi kullan
                    print("Detaylı plan verisi alınamadı, temel veriyi kullanıyoruz")
                    plan = plan_basic
            except Exception as fetch_error:
                print(f"Detaylı plan bilgisi alma hatası: {str(fetch_error)}")
                # Hata durumunda basic veriyi kullan
                plan = plan_basic
        
        # Basit JSON yanıtı hazırla
        response_data = {
            'message': 'Subscription plan created successfully',
            'plan': plan
        }
        
        # Eğer yeni bir NFT oluşturulmuşsa, bunu da yanıta ekle
        if created_nft_id:
            response_data['createdNFT'] = {
                'nftId': created_nft_id,
                'title': plan_name,
                'type': 'subscription'
            }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Genel hata: {str(e)}")
        # Plan ID varsa, işlem başarılı kabul et ama hata oluştuğunu bildir
        if plan_id:
            return Response({
                'message': 'Subscription plan created successfully but details could not be retrieved',
                'plan': {'PlanID': plan_id}
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': f'Failed to create subscription plan: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_subscription_plan(request, plan_id):
    """Admin için abonelik planını güncelleyen API endpoint'i"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can update subscription plans'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Güncelleme verilerini al
    plan_name = request.data.get('planName')
    description = request.data.get('description')
    duration_days = request.data.get('durationDays')
    price = request.data.get('price')
    nft_id = request.data.get('nftId')
    features = request.data.get('features')
    is_active = request.data.get('isActive')
    
    # Güncelleme alanlarını hazırla
    update_fields = []
    params = []
    
    if plan_name is not None:
        update_fields.append("PlanName = %s")
        params.append(plan_name)
    
    if description is not None:
        update_fields.append("Description = %s")
        params.append(description)
    
    if duration_days is not None:
        update_fields.append("DurationDays = %s")
        params.append(duration_days)
    
    if price is not None:
        update_fields.append("Price = %s")
        params.append(price)
    
    if nft_id is not None:
        update_fields.append("NFTID = %s")
        params.append(nft_id if nft_id else None)
    
    if features is not None:
        update_fields.append("Features = %s")
        params.append(features)
    
    if is_active is not None:
        update_fields.append("IsActive = %s")
        params.append(is_active)
    
    if not update_fields:
        return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with connection.cursor() as cursor:
            # Planı kontrol et
            cursor.execute("SELECT PlanID FROM SubscriptionPlans WHERE PlanID = %s", [plan_id])
            if not cursor.fetchone():
                return Response({'error': 'Subscription plan not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # NFT ID varsa kontrol et
            if nft_id:
                cursor.execute("SELECT NFTID FROM NFTs WHERE NFTID = %s", [nft_id])
                if not cursor.fetchone():
                    return Response({'error': 'Invalid NFT ID'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Planı güncelle
            sql = f"UPDATE SubscriptionPlans SET {', '.join(update_fields)} WHERE PlanID = %s"
            params.append(plan_id)
            
            cursor.execute(sql, params)
            
            # Etkinlik logu ekle
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                VALUES (%s, 'subscription_plan_updated', %s, GETDATE(), %s, %s)
            """, [
                user_id, 
                f"Updated subscription plan (ID: {plan_id})", 
                request.META.get('REMOTE_ADDR', ''),
                request.META.get('HTTP_USER_AGENT', '')
            ])
            
            # Güncellenmiş planı getir
            cursor.execute("""
                SELECT sp.PlanID, sp.PlanName, sp.Description, sp.DurationDays, 
                       sp.Price, sp.Features, n.NFTID, n.Title as NFTTitle, 
                       n.ImageURI as NFTImage, sp.IsActive
                FROM SubscriptionPlans sp
                LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
                WHERE sp.PlanID = %s
            """, [plan_id])
            
            columns = [col[0] for col in cursor.description]
            plan_data = cursor.fetchone()
            if plan_data:
                plan = dict(zip(columns, plan_data))
            else:
                plan = {'PlanID': plan_id}
        
        return Response({
            'message': 'Subscription plan updated successfully',
            'plan': plan
        })
        
    except Exception as e:
        return Response({
            'error': f'Failed to update subscription plan: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def list_plans(request):
    """Abonelik planlarını listeleyen API endpoint'i"""
    try:
        with connection.cursor() as cursor:
            # Aktif abonelik planlarını almak için sorgu
            cursor.execute("""
                SELECT sp.PlanID, sp.PlanName, sp.Description, sp.DurationDays, 
                       sp.Price, sp.Features, n.NFTID, n.Title as NFTTitle, 
                       n.ImageURI as NFTImage, sp.IsActive
                FROM SubscriptionPlans sp
                LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
                ORDER BY sp.Price
            """)
            
            columns = [col[0] for col in cursor.description]
            plans = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Abonelik istatistiklerini al
            cursor.execute("""
                SELECT COUNT(*) FROM UserSubscriptions
            """)
            total_subscriptions = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM UserSubscriptions WHERE IsActive = 1
            """)
            active_subscriptions = cursor.fetchone()[0]
            
            # Önceki ayın istatistiklerini al (trend hesaplaması için)
            last_month = datetime.now() - timedelta(days=30)
            
            cursor.execute("""
                SELECT COUNT(*) FROM UserSubscriptions WHERE CreateDate < %s
            """, [last_month])
            prev_total_subscriptions = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM UserSubscriptions 
                WHERE IsActive = 1 AND CreateDate < %s
            """, [last_month])
            prev_active_subscriptions = cursor.fetchone()[0]
            
            # Gelir hesaplamaları
            cursor.execute("""
                SELECT SUM(sp.Price)
                FROM UserSubscriptions us
                JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                WHERE us.IsActive = 1
            """)
            result = cursor.fetchone()
            monthly_revenue = result[0] if result[0] else 0
            
            # Önceki ay gelir
            cursor.execute("""
                SELECT SUM(sp.Price)
                FROM UserSubscriptions us
                JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                WHERE us.IsActive = 1 AND us.CreateDate < %s
            """, [last_month])
            result = cursor.fetchone()
            prev_monthly_revenue = result[0] if result[0] else 0
            
            # Toplam kullanıcı sayısı (dönüşüm oranı hesaplamak için)
            cursor.execute("""
                SELECT COUNT(*) FROM Users
            """)
            total_users = cursor.fetchone()[0]
            
            # Önceki ay toplam kullanıcı sayısı
            cursor.execute("""
                SELECT COUNT(*) FROM Users WHERE JoinDate < %s
            """, [last_month])
            prev_total_users = cursor.fetchone()[0]
            
            # Dönüşüm oranı hesaplama
            conversion_rate = (active_subscriptions / total_users * 100) if total_users > 0 else 0
            prev_conversion_rate = (prev_active_subscriptions / prev_total_users * 100) if prev_total_users > 0 else 0
            
            # Plan bazlı istatistikler
            plan_stats = {}
            for plan in plans:
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM UserSubscriptions 
                    WHERE PlanID = %s AND IsActive = 1
                """, [plan['PlanID']])
                active_count = cursor.fetchone()[0]
                
                cursor.execute("""
                    SELECT SUM(sp.Price)
                    FROM UserSubscriptions us
                    JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                    WHERE us.PlanID = %s AND us.IsActive = 1
                """, [plan['PlanID']])
                result = cursor.fetchone()
                plan_revenue = result[0] if result[0] else 0
                
                plan_stats[plan['PlanID']] = {
                    "activeCount": active_count,
                    "totalRevenue": plan_revenue
                }
            
            # Trendleri hesapla
            total_trend = ((total_subscriptions - prev_total_subscriptions) / prev_total_subscriptions * 100) if prev_total_subscriptions > 0 else 0
            active_trend = ((active_subscriptions - prev_active_subscriptions) / prev_active_subscriptions * 100) if prev_active_subscriptions > 0 else 0
            revenue_trend = ((monthly_revenue - prev_monthly_revenue) / prev_monthly_revenue * 100) if prev_monthly_revenue > 0 else 0
            conversion_trend = conversion_rate - prev_conversion_rate
            
            # Son abonelikler
            cursor.execute("""
                SELECT us.SubscriptionID, u.Username, sp.PlanName, 
                       us.StartDate, us.EndDate, us.IsActive
                FROM UserSubscriptions us
                JOIN Users u ON us.UserID = u.UserID
                JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                ORDER BY us.StartDate DESC
                OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY
            """)
            
            recent_columns = [col[0] for col in cursor.description]
            recent_subscriptions = [dict(zip(recent_columns, row)) for row in cursor.fetchall()]
            
        # Tam API yanıtı
        response_data = {
            "plans": plans,
            "stats": {
                "totalSubscribers": total_subscriptions,
                "activeSubscribers": active_subscriptions,
                "monthlyRevenue": float(monthly_revenue),
                "yearlyRevenue": float(monthly_revenue * 12),  # Yıllık gelir tahmini
                "conversionRate": float(conversion_rate),
                "trends": {
                    "totalSubscribers": float(total_trend),
                    "activeSubscribers": float(active_trend),
                    "monthlyRevenue": float(revenue_trend),
                    "conversionRate": float(conversion_trend)
                },
                "planStats": plan_stats
            },
            "recentSubscriptions": recent_subscriptions
        }
        
        # Debug için yanıtı kontrol et
        json_response = json.dumps(response_data)
        print(f"API Response Size: {len(json_response)} bytes")
        
        return Response(response_data)
        
    except Exception as e:
        print(f"Error in list_plans API: {str(e)}")
        return Response({
            "error": str(e), 
            "plans": []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_subscriptions(request):
    """Admin için abonelik istatistiklerini ve planlarını getiren API endpoint'i"""
    user_id = request.user.id
    
    # Admin kontrolü
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can access this API'}, 
                          status=status.HTTP_403_FORBIDDEN)
    
    # Normal list_plans fonksiyonunu kullan ve daha fazla detay ekle
    try:
        # Önce temel plan verilerini al
        base_response = list_plans(request).data
        
        # Daha fazla admin istatistiği ekle
        with connection.cursor() as cursor:
            # Örnek: Planların tüm sürümleri (aktif ve inaktif)
            cursor.execute("""
                SELECT sp.PlanID, sp.PlanName, sp.Description, sp.DurationDays, 
                      sp.Price, sp.Features, n.NFTID, n.Title as NFTTitle, 
                      n.ImageURI as NFTImage, sp.IsActive
                FROM SubscriptionPlans sp
                LEFT JOIN NFTs n ON sp.NFTID = n.NFTID
                ORDER BY sp.Price
            """)
            
            columns = [col[0] for col in cursor.description]
            all_plans = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Detaylı abonelik analizi
            cursor.execute("""
                SELECT 
                    DATEPART(month, StartDate) as Month,
                    DATEPART(year, StartDate) as Year,
                    COUNT(*) as NewSubscriptions,
                    SUM(CASE WHEN AutoRenew = 1 THEN 1 ELSE 0 END) as AutoRenewEnabled
                FROM UserSubscriptions
                WHERE StartDate >= DATEADD(month, -6, GETDATE())
                GROUP BY DATEPART(month, StartDate), DATEPART(year, StartDate)
                ORDER BY Year, Month
            """)
            
            subscription_trends_columns = [col[0] for col in cursor.description]
            subscription_trends = [dict(zip(subscription_trends_columns, row)) for row in cursor.fetchall()]
        
        # Admin yanıtına ek bilgiler ekle
        admin_response = base_response
        admin_response['allPlans'] = all_plans  # Tüm planlar (aktif/inaktif)
        admin_response['subscriptionTrends'] = subscription_trends
        
        return Response(admin_response)
    
    except Exception as e:
        print(f"Error in admin_subscriptions API: {str(e)}")
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)