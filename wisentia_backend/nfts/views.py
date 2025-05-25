from datetime import datetime, timedelta
from django.db import connection, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from .serializers import NFTSerializer
from drf_yasg.utils import swagger_auto_schema
from .nft_service import NFTService
import json
import logging
from django.conf import settings
from django.http import HttpResponse
import os
import uuid
import requests
from .ipfs import IPFSService
from wallet.blockchain import BlockchainService

logger = logging.getLogger(__name__)

# Define a rate limiter for sensitive operations like purchasing
class SensitiveOperationsThrottle(UserRateThrottle):
    rate = '100/hour'

@swagger_auto_schema(
    method='get',  # HTTP metodunu belirttik
    responses={200: NFTSerializer(many=True)},
    operation_description="Kullanıcının sahip olduğu NFT'leri listeler"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_nfts(request):
    """Kullanıcının sahip olduğu NFT'leri listeleyen API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT un.UserNFTID, un.AcquisitionDate, un.ExpiryDate, un.IsMinted, un.TransactionHash,
                   n.NFTID, n.Title, n.Description, n.ImageURI, n.TradeValue, n.SubscriptionDays,
                   nt.TypeName as NFTType
            FROM UserNFTs un
            JOIN NFTs n ON un.NFTID = n.NFTID
            JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
            WHERE un.UserID = %s
            ORDER BY un.AcquisitionDate DESC
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        nfts = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(nfts)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nft_detail(request, nft_id):
    """NFT detaylarını gösteren API endpoint'i"""
    user_id = request.user.id
    
    try:
        with connection.cursor() as cursor:
            logger.info(f"Fetching NFT details for NFTID={nft_id}, UserID={user_id}")
            
            # 1. First check if the user owns this NFT
            cursor.execute("""
                SELECT un.UserNFTID, un.AcquisitionDate, un.ExpiryDate, un.IsMinted, un.TransactionHash,
                       n.NFTID, n.Title, n.Description, n.ImageURI, n.BlockchainMetadata, 
                       n.TradeValue, n.SubscriptionDays, n.Rarity, nt.TypeName as NFTType, 
                       nt.Description as NFTTypeDescription, nt.NFTTypeID
                FROM UserNFTs un
                JOIN NFTs n ON un.NFTID = n.NFTID
                JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                WHERE un.UserID = %s AND n.NFTID = %s
            """, [user_id, nft_id])
            
            columns = [col[0] for col in cursor.description]
            nft_data = cursor.fetchone()
            
            if nft_data:
                # User owns this NFT
                nft = dict(zip(columns, nft_data))
                nft['IsOwned'] = True
                logger.info(f"User {user_id} owns NFT {nft_id}")
            else:
                # 2. If not owned, check if the NFT exists and is viewable
                cursor.execute("""
                    SELECT n.NFTID, n.Title, n.Description, n.ImageURI, n.BlockchainMetadata, 
                           n.TradeValue, n.SubscriptionDays, n.Rarity, nt.TypeName as NFTType,
                           nt.Description as NFTTypeDescription, nt.NFTTypeID, n.IsActive
                    FROM NFTs n
                    JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                    WHERE n.NFTID = %s
                """, [nft_id])
                
                columns = [col[0] for col in cursor.description]
                nft_data = cursor.fetchone()
                
                if not nft_data:
                    logger.error(f"NFT {nft_id} not found")
                    return Response({'error': 'NFT not found'}, status=status.HTTP_404_NOT_FOUND)
                
                nft = dict(zip(columns, nft_data))
                nft['IsOwned'] = False
                
                # Don't allow viewing inactive NFTs unless the user is admin
                if not nft.get('IsActive', True):
                    # Check if user is admin
                    cursor.execute("SELECT UserRole FROM Users WHERE UserID = %s", [user_id])
                    user_role = cursor.fetchone()[0]
                    
                    if user_role != 'admin':
                        logger.warning(f"User {user_id} attempted to view inactive NFT {nft_id}")
                        return Response({'error': 'NFT not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # 3. Parse blockchain metadata if available
            if nft.get('BlockchainMetadata'):
                try:
                    metadata = json.loads(nft['BlockchainMetadata']) if isinstance(nft['BlockchainMetadata'], str) else nft['BlockchainMetadata']
                    nft['BlockchainMetadata'] = metadata
                except Exception as e:
                    logger.warning(f"Failed to parse blockchain metadata for NFT {nft_id}: {str(e)}")
                    # Keep as is if parsing fails
            
            # 4. Add subscription plan information if this is a subscription NFT
            if nft.get('NFTType') == 'subscription':
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
                    logger.info(f"Found subscription plan for NFT {nft_id}")
                else:
                    # Try to find matching plan based on days and price
                    cursor.execute("""
                        SELECT PlanID, PlanName, DurationDays, Price, Description, IsActive
                        FROM SubscriptionPlans
                        WHERE NFTID IS NULL 
                          AND DurationDays = %s 
                          AND Price = %s
                    """, [nft.get('SubscriptionDays'), nft.get('TradeValue')])
                    
                    plan_data = cursor.fetchone()
                    
                    if plan_data:
                        subscription_plan = dict(zip(plan_columns, plan_data))
                        nft['SubscriptionPlan'] = subscription_plan
                        
                        # Link the plan to this NFT
                        cursor.execute("""
                            UPDATE SubscriptionPlans
                            SET NFTID = %s
                            WHERE PlanID = %s
                        """, [nft_id, subscription_plan['PlanID']])
                        
                        logger.info(f"Linked orphaned subscription plan {subscription_plan['PlanID']} to NFT {nft_id}")
                    else:
                        logger.warning(f"No subscription plan found for subscription NFT {nft_id}")
                        nft['SubscriptionPlan'] = None
        
        return Response(nft)
    
    except Exception as e:
        logger.error(f"Error fetching NFT details for NFTID={nft_id}, UserID={user_id}: {str(e)}")
        return Response(
            {'error': 'Failed to retrieve NFT details', 'message': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mint_nft(request, user_nft_id):
    """NFT'yi blockchain'e mint eden API endpoint'i"""
    user_id = request.user.id
    user_address = request.data.get('walletAddress')
    transaction_hash = request.data.get('transactionHash')
    
    # Wallet adresinin mevcut olduğunu kontrol et
    if not user_address:
        return Response({'error': 'Wallet address is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Eğer transaction_hash zaten sağlandıysa, manuel minting işlemi yap
    if transaction_hash:
        with connection.cursor() as cursor:
            # NFT'nin kullanıcıya ait olup olmadığını kontrol et
            cursor.execute("""
                SELECT un.UserNFTID, n.Title
                FROM UserNFTs un
                JOIN NFTs n ON un.NFTID = n.NFTID
                WHERE un.UserNFTID = %s AND un.UserID = %s
            """, [user_nft_id, user_id])
            
            nft_data = cursor.fetchone()
            
            if not nft_data:
                return Response({'error': 'NFT not found or not owned by user'}, status=status.HTTP_404_NOT_FOUND)
            
            # NFT'yi güncelle
            cursor.execute("""
                UPDATE UserNFTs
                SET IsMinted = 1, TransactionHash = %s
                WHERE UserNFTID = %s
            """, [transaction_hash, user_nft_id])
            
            # Bildirim ekle
            nft_title = nft_data[1]
            notification_message = f"Your NFT '{nft_title}' has been successfully minted to the blockchain."
            
            cursor.execute("""
                INSERT INTO Notifications
                (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                VALUES (%s, 'NFT Minted', %s, 'achievement', 0, 0, GETDATE())
            """, [user_id, notification_message])
        
        return Response({'message': 'NFT minted successfully'})
    
    # NFT service aracılığıyla mint işlemini yap
    nft_service = NFTService()
    result = nft_service.mint_nft(
        user_id=user_id,
        user_address=user_address,
        user_nft_id=user_nft_id,
        title=None,  # NFT Service içinde veritabanından alınacak
        description=None  # NFT Service içinde veritabanından alınacak
    )
    
    if result["success"]:
        return Response({
            'message': 'NFT minted successfully',
            'transactionHash': result["transactionHash"],
            'ipfsUri': result.get("ipfsUri"),
            'ipfsGateway': result.get("ipfsGateway")
        })
    else:
        return Response({'error': result["error"]}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def available_nfts(request):
    """Mağazada satın alınabilecek NFT'leri listeleyen API endpoint'i"""
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT n.NFTID, n.Title, n.Description, n.ImageURI, n.TradeValue, 
                   n.SubscriptionDays, nt.TypeName as NFTType, n.BlockchainMetadata,
                   n.NFTTypeID, n.Rarity,
                   (SELECT COUNT(*) FROM UserNFTs un WHERE un.NFTID = n.NFTID) as OwnersCount
            FROM NFTs n
            JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
            WHERE n.IsActive = 1
            ORDER BY n.NFTID DESC
        """)
        
        columns = [col[0] for col in cursor.description]
        nfts = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
        # Extract rarity from blockchain metadata if available
        for nft in nfts:
            # Ensure OwnersCount is an integer
            if 'OwnersCount' in nft:
                nft['OwnersCount'] = int(nft['OwnersCount'])
            else:
                nft['OwnersCount'] = 0
                
            # If Rarity is directly available from the database, use it
            if nft.get('Rarity'):
                # Ensure proper capitalization
                nft['Rarity'] = nft['Rarity'].strip().capitalize()
            else:
                # As a fallback, try to extract from blockchain metadata
                if nft.get('BlockchainMetadata'):
                    try:
                        metadata = json.loads(nft['BlockchainMetadata'])
                        
                        # Look for direct rarity property first
                        if 'rarity' in metadata:
                            nft['Rarity'] = metadata['rarity'].capitalize()
                        # Then try attributes if direct property not found
                        elif 'attributes' in metadata:
                            for attr in metadata['attributes']:
                                if attr.get('trait_type', '').lower() in ['rarity', 'tier']:
                                    nft['Rarity'] = attr.get('value').capitalize()
                                    break
                                    
                        # If still no rarity, set default
                        if not nft.get('Rarity'):
                            nft['Rarity'] = 'Common'
                    except Exception as e:
                        logger.warning(f"Failed to parse metadata for NFT {nft['NFTID']}: {str(e)}")
                        nft['Rarity'] = 'Common'  # Default fallback
                else:
                    nft['Rarity'] = 'Common'  # Default fallback if no metadata
    
    # If admin parameter is provided, include additional information
    is_admin_view = request.query_params.get('admin', 'false').lower() == 'true'
    if is_admin_view:
        logger.info("Admin view requested, returning full NFT details")
    return Response(nfts)
    
    # For regular users, filter out certain fields
    filtered_nfts = []
    for nft in nfts:
        filtered_nft = {
            'NFTID': nft['NFTID'],
            'Title': nft['Title'],
            'Description': nft['Description'],
            'ImageURI': nft['ImageURI'],
            'TradeValue': nft['TradeValue'],
            'SubscriptionDays': nft['SubscriptionDays'],
            'NFTType': nft['NFTType'],
            'Rarity': nft['Rarity'],
            'OwnersCount': nft['OwnersCount']
        }
        filtered_nfts.append(filtered_nft)
    
    return Response(filtered_nfts)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trade_nft(request):
    """NFT takası oluşturan ve otomatik tamamlayan API endpoint'i"""
    user_id = request.user.id
    target_nft_id = request.data.get('targetNftId')
    offered_nft_ids = request.data.get('offeredNftIds', [])
    
    if not target_nft_id:
        return Response({'error': 'Target NFT ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    if not offered_nft_ids:
        return Response({'error': 'At least one offered NFT is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        try:
            # Hedef NFT'yi kontrol et
            cursor.execute("""
                SELECT n.NFTID, n.Title, n.TradeValue, nt.TypeName
                FROM NFTs n
                JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                WHERE n.NFTID = %s AND IsActive = 1
            """, [target_nft_id])
            
            target_nft = cursor.fetchone()
            
            if not target_nft:
                return Response({'error': 'Target NFT not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
            
            target_nft_id, target_nft_title, target_nft_value, target_nft_type = target_nft
            
            # Sadece 'subscription' tipindeki NFT'leri kabul et
            if target_nft_type.lower() != 'subscription':
                return Response({
                    'error': 'Only subscription NFTs can be acquired through trade',
                    'nftType': target_nft_type
                }, status=status.HTTP_400_BAD_REQUEST)
            
            is_subscription = True
            
            # Kullanıcının teklif ettiği NFT'leri kontrol et
            total_offered_value = 0
            valid_user_nfts = []
            
            for nft_id in offered_nft_ids:
                cursor.execute("""
                    SELECT un.UserNFTID, n.NFTID, n.Title, n.TradeValue, n.NFTTypeID,
                        un.ExpiryDate, un.IsMinted
                    FROM UserNFTs un
                    JOIN NFTs n ON un.NFTID = n.NFTID
                    WHERE un.UserID = %s AND n.NFTID = %s
                """, [user_id, nft_id])
                
                user_nft = cursor.fetchone()
                
                if not user_nft:
                    return Response({
                        'error': f'NFT with ID {nft_id} not found or not owned by user'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                user_nft_id, nft_id, nft_title, nft_value, nft_type_id, expiry_date, is_minted = user_nft
                
                # Abonelik NFT'leri süresi dolmuşsa kullanılamaz
                if expiry_date and expiry_date < datetime.now():
                    return Response({
                        'error': f'NFT {nft_title} has expired and cannot be traded'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Mint edilmiş NFT'ler takas edilemez
                if is_minted:
                    return Response({
                        'error': f'NFT {nft_title} has been minted and cannot be traded'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                total_offered_value += nft_value
                valid_user_nfts.append(user_nft_id)
            
            # Teklif edilen değerin hedef NFT değerine eşit veya daha fazla olup olmadığını kontrol et
            if total_offered_value < target_nft_value:
                return Response({
                    'error': f'Total offered value ({total_offered_value}) is less than target NFT value ({target_nft_value})'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Takas işlemini oluştur - Artık "completed" olarak başlatıyoruz
            cursor.execute("""
                INSERT INTO NFTTrades
                (OfferUserID, TargetNFTID, TradeStatus, CreationDate, CompletionDate)
                VALUES (%s, %s, 'completed', GETDATE(), GETDATE())
            """, [user_id, target_nft_id])
            
            # Son eklenen ID'yi ayrı bir sorgu ile al
            cursor.execute("SELECT SCOPE_IDENTITY()")
            trade_id = cursor.fetchone()[0]
            
            # Teklif edilen NFT'leri takas detaylarına ekle
            for user_nft_id in valid_user_nfts:
                cursor.execute("""
                    INSERT INTO NFTTradeDetails
                    (TradeID, OfferedUserNFTID)
                    VALUES (%s, %s)
                """, [trade_id, user_nft_id])
            
                # Kullanıcının NFT'lerini "takas edildi" olarak işaretle
                cursor.execute("""
                    UPDATE UserNFTs
                    SET IsTraded = 1, TradeDate = GETDATE()
                    WHERE UserNFTID = %s
                """, [user_nft_id])
            
            # Hedef NFT için abonelik süresi bilgisini al
            subscription_days = None
            cursor.execute("SELECT SubscriptionDays FROM NFTs WHERE NFTID = %s", [target_nft_id])
            subscription_result = cursor.fetchone()
            subscription_days = subscription_result[0] if subscription_result else None
                
            # Expiry date formülünü oluştur
            expiry_clause = f"DATEADD(day, {subscription_days}, GETDATE())" if subscription_days else "NULL"
            
            # Kullanıcıya yeni NFT ekle
            cursor.execute(f"""
                INSERT INTO UserNFTs
                (UserID, NFTID, AcquisitionDate, ExpiryDate, IsMinted)
                VALUES (%s, %s, GETDATE(), {expiry_clause}, 0)
            """, [user_id, target_nft_id])
            
            # Abonelik NFT'si ise kullanıcının aboneliğini de güncelle
            if subscription_days:
                # İlgili abonelik planını bul
                cursor.execute("""
                    SELECT sp.PlanID
                    FROM SubscriptionPlans sp
                    JOIN NFTs n ON sp.NFTID = n.NFTID
                    WHERE n.NFTID = %s
                """, [target_nft_id])
                
                plan_result = cursor.fetchone()
                
                if plan_result:
                    plan_id = plan_result[0]
                    
                    # Mevcut aktif aboneliği kontrol et
                    cursor.execute("""
                        SELECT SubscriptionID 
                        FROM UserSubscriptions 
                        WHERE UserID = %s AND PlanID = %s AND IsActive = 1
                    """, [user_id, plan_id])
                    
                    existing_sub = cursor.fetchone()
                    
                    if existing_sub:
                        # Mevcut aboneliği güncelle (süreyi uzat)
                        cursor.execute("""
                            UPDATE UserSubscriptions
                            SET EndDate = DATEADD(day, %s, EndDate)
                            WHERE SubscriptionID = %s
                        """, [subscription_days, existing_sub[0]])
                    else:
                        # Yeni abonelik oluştur
                        cursor.execute("""
                            INSERT INTO UserSubscriptions 
                            (UserID, PlanID, StartDate, EndDate, IsActive, PaymentMethod)
                            VALUES (%s, %s, GETDATE(), DATEADD(day, %s, GETDATE()), 1, 'NFT Trade')
                        """, [user_id, plan_id, subscription_days])
            
            # Kullanıcı için bildirim oluştur
            cursor.execute("""
                INSERT INTO Notifications
                (UserID, Title, Message, NotificationType, RelatedEntityID, IsRead, IsDismissed, CreationDate)
                VALUES (%s, 'NFT Trade Completed', %s, 'achievement', %s, 0, 0, GETDATE())
            """, [
                user_id,
                f"You have successfully traded for {target_nft_title}" + 
                (f" with {subscription_days} days subscription" if subscription_days else ""),
                target_nft_id
            ])
            
            return Response({
                'message': 'NFT trade completed successfully',
                'tradeId': trade_id,
                'success': True,
                'targetNftId': target_nft_id,
                'targetNftTitle': target_nft_title,
                'isSubscription': is_subscription,
                'subscriptionDays': subscription_days
            })
            
        except Exception as e:
            # Hata durumunda detaylı bilgi dön
            return Response({
                'error': f'Database error: {str(e)}',
                'success': False,
                'details': str(e.__traceback__)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trade_history(request):
    """Kullanıcının takas geçmişini listeleyen API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT t.TradeID, t.TradeStatus, t.CreationDate, t.CompletionDate,
                   n.NFTID as TargetNFTID, n.Title as TargetNFTTitle, n.ImageURI as TargetNFTImage
            FROM NFTTrades t
            JOIN NFTs n ON t.TargetNFTID = n.NFTID
            WHERE t.OfferUserID = %s
            ORDER BY t.CreationDate DESC
        """, [user_id])
        
        columns = [col[0] for col in cursor.description]
        trades = []
        
        for row in cursor.fetchall():
            trade = dict(zip(columns, row))
            trade_id = trade['TradeID']
            
            # Takas detaylarını al
            cursor.execute("""
                SELECT td.TradeDetailID, un.UserNFTID, n.NFTID, n.Title, n.ImageURI, n.TradeValue
                FROM NFTTradeDetails td
                JOIN UserNFTs un ON td.OfferedUserNFTID = un.UserNFTID
                JOIN NFTs n ON un.NFTID = n.NFTID
                WHERE td.TradeID = %s
            """, [trade_id])
            
            detail_columns = [col[0] for col in cursor.description]
            trade_details = [dict(zip(detail_columns, detail_row)) for detail_row in cursor.fetchall()]
            
            trade['offeredNFTs'] = trade_details
            trades.append(trade)
    
    return Response(trades)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_nft(request):
    """NFT oluşturma endpointi - sadece adminler için"""
    user_id = request.user.id
    
    # Kullanıcının admin olup olmadığını kontrol et
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can create NFTs'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # Admin ise, NFT servisini kullanarak işlemi gerçekleştir
    nft_service = NFTService()
    
    # Request verilerini al
    title = request.data.get('title')
    description = request.data.get('description')
    image_uri = request.data.get('imageUri')
    nft_type_id = request.data.get('nftTypeId')
    trade_value = request.data.get('tradeValue', 0)
    subscription_days = request.data.get('subscriptionDays')
    attributes = request.data.get('attributes')
    rarity = request.data.get('rarity', 'common')  # Extract rarity from request
    
    # Check if this NFT is for a quest
    quest_id = request.data.get('questId')
    redirect_url = request.data.get('redirectUrl')
    
    # Temel doğrulama
    if not all([title, description, image_uri, nft_type_id]):
        missing_fields = []
        if not title: missing_fields.append('title')
        if not description: missing_fields.append('description')
        if not image_uri: missing_fields.append('imageUri')
        if not nft_type_id: missing_fields.append('nftTypeId')
        
        return Response({
            'error': f'Missing required fields: {", ".join(missing_fields)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Admin panel'deki create_nft fonksiyonunu çağır
    result = nft_service.create_nft_with_metadata(
        admin_id=user_id,
        title=title,
        description=description,
        image_path=image_uri,
        nft_type_id=nft_type_id,
        trade_value=trade_value,
        subscription_days=subscription_days,
        attributes=attributes,
        rarity=rarity  # Pass rarity to the service function
    )
    
    if result["success"]:
        # NFT oluşturma başarılı, subscriptionPlans tablosundaki NFTID'yi kontrol et
        nft_id = result["nftId"]
        
        # Sadece abonelik NFT'leri için
        if nft_type_id == 2 and subscription_days:  # 2 = abonelik tipi
            with connection.cursor() as cursor:
                # Plan ID'yi kontrol et
                cursor.execute("""
                    SELECT PlanID, NFTID
                    FROM SubscriptionPlans
                    WHERE PlanName LIKE %s AND DurationDays = %s
                    ORDER BY PlanID DESC
                """, [f"%{subscription_days}-Day Access", subscription_days])
                
                plan_result = cursor.fetchone()
                
                if plan_result:
                    plan_id, plan_nft_id = plan_result
                    
                    # NFTID NULL ise güncelle
                    if plan_nft_id is None:
                        logger.info(f"Subscription Plan {plan_id} found with NULL NFTID, updating to {nft_id}")
                        cursor.execute("""
                            UPDATE SubscriptionPlans
                            SET NFTID = %s
                            WHERE PlanID = %s
                        """, [nft_id, plan_id])
                    else:
                        logger.info(f"Subscription Plan {plan_id} already has NFTID={plan_nft_id}")
                else:
                    # Plan bulunamadı, yeni bir plan oluştur
                    logger.info(f"No subscription plan found for NFT {nft_id}, creating a new one")
                    
                    # Calculate subscription tier based on trade value
                    tier = "Basic"
                    if trade_value >= 300:
                        tier = "Pro"
                    elif trade_value >= 100:
                        tier = "Premium"
                    
                    cursor.execute("""
                        INSERT INTO SubscriptionPlans
                        (NFTID, PlanName, DurationDays, Price, Description, IsActive)
                        VALUES (%s, %s, %s, %s, %s, 1)
                    """, [
                        nft_id,
                        f"{tier} {subscription_days}-Day Access",
                        subscription_days,
                        trade_value,
                        f"{tier} level subscription providing {subscription_days} days of premium access. {description}"
                    ])
                    
                    # Get the new plan ID
                    cursor.execute("SELECT SCOPE_IDENTITY()")
                    new_plan_id = cursor.fetchone()[0]
                    logger.info(f"Created new subscription plan with ID {new_plan_id} for NFT {nft_id}")
        
        # If this NFT is for a quest, update the quest's RewardNFTID
        if quest_id:
            try:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE Quests
                        SET RewardNFTID = %s
                        WHERE QuestID = %s
                    """, [nft_id, quest_id])
                    
                    # Check if the update was successful
                    cursor.execute("""
                        SELECT RewardNFTID
                        FROM Quests
                        WHERE QuestID = %s
                    """, [quest_id])
                    
                    updated_nft_id = cursor.fetchone()[0]
                    if updated_nft_id == nft_id:
                        logger.info(f"Successfully updated Quest {quest_id} with RewardNFTID {nft_id}")
                    else:
                        logger.error(f"Failed to update Quest {quest_id} with RewardNFTID {nft_id}")
            except Exception as e:
                logger.error(f"Error updating quest with NFT: {str(e)}")
        
        response_data = {
            'message': 'NFT created successfully with IPFS metadata',
            'nftId': result["nftId"],
            'ipfsUri': result["ipfsUri"],
            'ipfsGateway': result["ipfsGateway"]
        }
        
        # Add redirect URL if provided
        if redirect_url:
            response_data['redirectUrl'] = redirect_url
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    else:
        return Response({
            'error': result["error"]
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nft_metadata(request, nft_id):
    """NFT'nin IPFS metaverilerini getiren API endpoint'i"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        # Önce UserNFTs tablosunda kullanıcının bu NFT'ye sahip olup olmadığını kontrol et
        cursor.execute("""
            SELECT COUNT(*) 
            FROM UserNFTs 
            WHERE UserID = %s AND NFTID = %s
        """, [user_id, nft_id])
        
        if cursor.fetchone()[0] == 0:
            # Eğer NFT kullanıcıya ait değilse, aleni NFT mi diye kontrol et
            cursor.execute("""
                SELECT NFTs.BlockchainMetadata
                FROM NFTs
                WHERE NFTID = %s AND IsActive = 1
            """, [nft_id])
        else:
            # Kullanıcının NFT'si ise detaylı bilgileri getir
            cursor.execute("""
                SELECT NFTs.BlockchainMetadata
                FROM NFTs
                JOIN UserNFTs ON NFTs.NFTID = UserNFTs.NFTID
                WHERE NFTs.NFTID = %s AND UserNFTs.UserID = %s
            """, [nft_id, user_id])
        
        result = cursor.fetchone()
        
        if not result:
            return Response({'error': 'NFT not found or not accessible'}, status=status.HTTP_404_NOT_FOUND)
        
        blockchain_metadata = result[0]
            
        # Eğer blockchain metadatasında IPFS URI yoksa hata döndür
        try:
            metadata_json = json.loads(blockchain_metadata) if blockchain_metadata else {}
            ipfs_uri = metadata_json.get('ipfsUri')
            ipfs_gateway = metadata_json.get('ipfsGateway')
            
            if not ipfs_uri:
                return Response({
                    'error': 'No IPFS metadata available for this NFT', 
                    'metadata': metadata_json
                })
            
            return Response({
                'ipfsUri': ipfs_uri,
                'ipfsGateway': ipfs_gateway,
                'blockchainMetadata': metadata_json
            })
            
        except Exception as e:
            return Response({
                'error': f'Error parsing blockchain metadata: {str(e)}',
                'rawMetadata': blockchain_metadata
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_nft(request):
    """NFT satın alma API endpoint'i"""
    user_id = request.user.id
    nft_id = request.data.get('nftId')
    wallet_address = request.data.get('walletAddress')
    
    if not nft_id or not wallet_address:
        return Response({
            'error': 'Missing required parameters: nftId, walletAddress'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Log request details
        logger.info(f"Purchase NFT request - User ID: {user_id}, NFT ID: {nft_id}, Wallet: {wallet_address[:10]}...")
        
        # Check if user already owns this NFT to avoid duplicate key error
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT UserNFTID
                FROM UserNFTs
                WHERE UserID = %s AND NFTID = %s
            """, [user_id, nft_id])
            
            existing_nft = cursor.fetchone()
            
            if existing_nft:
                logger.warning(f"User {user_id} already owns NFT {nft_id}")
                return Response({
                    'error': 'You already own this NFT',
                    'code': 'ALREADY_OWNS_NFT'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get NFT details and validate it's purchasable
            cursor.execute("""
                SELECT n.NFTTypeID, n.SubscriptionDays, n.TradeValue, n.Title, n.IsActive, nt.TypeName 
                FROM NFTs n
                JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID 
                WHERE n.NFTID = %s
            """, [nft_id])
            
            nft_details = cursor.fetchone()
            if not nft_details:
                logger.error(f"NFT {nft_id} not found")
                return Response({
                    'error': 'NFT not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            nft_type_id, subscription_days, trade_value, nft_title, is_active, nft_type_name = nft_details
            
            if not is_active:
                logger.warning(f"NFT {nft_id} is not active/available for purchase")
                return Response({
                    'error': 'This NFT is not available for purchase'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Extra validation for subscription NFTs
            if nft_type_id == 2:  # 2 = Subscription type
                if not subscription_days:
                    logger.warning(f"Subscription NFT {nft_id} has no subscription days set")
                    subscription_days = 30  # Default to 30 days if not set
                    
                # Kullanıcının halihazırda aktif bir aboneliği var mı kontrol et
                cursor.execute("""
                    SELECT us.SubscriptionID, us.EndDate, sp.PlanID 
                    FROM UserSubscriptions us
                    JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                    WHERE us.UserID = %s AND us.IsActive = 1 AND sp.NFTID = %s
                """, [user_id, nft_id])
                
                existing_subscription = cursor.fetchone()
                if existing_subscription:
                    # Kullanıcının bu NFT için zaten aboneliği varsa, sadece ek bilgi verelim
                    logger.info(f"User {user_id} already has subscription for NFT {nft_id}")
                    
                    # Detaylı bilgi için NFT detayları ve abonelik bilgilerini döndürelim
                    return Response({
                        'status': 'pending',
                        'message': 'You already have an active subscription for this NFT. This purchase will extend your current subscription.',
                        'nftId': nft_id,
                        'nftTitle': nft_title,
                        'nftType': nft_type_name,
                        'subscriptionDays': subscription_days,
                        'existingSubscription': {
                            'subscriptionId': existing_subscription[0],
                            'endDate': existing_subscription[1].isoformat() if existing_subscription[1] else None,
                            'planId': existing_subscription[2]
                        }
                    })
            
            # Kullanıcı bilgilerini güncelle - doğrudan veritabanı güncellemesi kullanarak
            if wallet_address:
                cursor.execute("""
                    UPDATE Users
                    SET WalletAddress = %s
                    WHERE UserID = %s AND (WalletAddress IS NULL OR WalletAddress != %s)
                """, [wallet_address, user_id, wallet_address])
                logger.info(f"Updated wallet address for user {user_id}: {wallet_address[:10]}...")
            
            # Calculate expiry date for subscription NFTs
            expiry_date = None
            if nft_type_id == 2 and subscription_days:  # 2 = Subscription type
                expiry_date = datetime.now() + timedelta(days=subscription_days)
                logger.info(f"Calculated expiry date: {expiry_date} for subscription NFT")
            
            # Bu satın alma için NFT ve abonelik bilgilerini döndür
            nft_info = {
                'nftId': nft_id,
                'nftTitle': nft_title,
                'nftType': nft_type_name,
                'price': float(trade_value) if trade_value else 0,
                'walletAddress': wallet_address
            }
            
            # Abonelik NFT'si için ek detaylar ekle
            if nft_type_id == 2:  # 2 = Subscription type
                # PlanID bul veya oluştur
                cursor.execute("""
                    SELECT PlanID 
                    FROM SubscriptionPlans
                    WHERE NFTID = %s AND IsActive = 1
                """, [nft_id])
                
                plan_id_result = cursor.fetchone()
                plan_id = None
                
                if plan_id_result:
                    plan_id = plan_id_result[0]
                    logger.info(f"Found subscription plan with ID: {plan_id} for NFT ID: {nft_id}")
                else:
                    # Plan bulunamadıysa, ön hazırlık amaçlı bilgileri döndür
                    tier = "Basic"
                    if trade_value >= 300:
                        tier = "Pro"
                    elif trade_value >= 100:
                        tier = "Premium"
                    
                    nft_info['subscriptionInfo'] = {
                        'subscriptionDays': subscription_days,
                        'tier': tier,
                        'willCreatePlan': True  # confirm_purchase aşamasında planın oluşturulacağını belirt
                    }
                
                if plan_id:
                    nft_info['subscriptionInfo'] = {
                        'planId': plan_id,
                        'subscriptionDays': subscription_days,
                        'expiryDate': expiry_date.isoformat() if expiry_date else None
                    }
            
            # Get the contract address from settings or use wallet_address if not set
            contract_address = getattr(settings, 'NFT_CONTRACT_ADDRESS', wallet_address)
            
            # Frontend için gerekli blockchain veri yapısı
            trade_value_wei = int(float(trade_value) * (10**18)) if trade_value else 0
            blockchain_data = {
                'to': contract_address,  # Akıllı sözleşme adresi veya kullanıcı cüzdanı
                'value': hex(trade_value_wei),  # Wei cinsinden değer
                'type': '0x2'  # EIP-1559 transaction
            }
            
            # Add gas limit for contract interactions
            if nft_type_id == 2:  # Subscription type
                blockchain_data['gas'] = '0x7A120'  # ~500,000 gas
            
            # NFT işlemleri için ERC-721 token verisi eklemeye çalış
            try:
                from wallet.blockchain import create_erc721_transfer_data
                # NFT ID'sini token ID olarak kullan
                token_id = int(nft_id)
                # ERC-721 transfer verisi oluştur
                nft_data = create_erc721_transfer_data(contract_address, wallet_address, token_id)
                blockchain_data['data'] = nft_data
            except Exception as e:
                logger.warning(f"Could not generate ERC-721 data: {str(e)}")
                # Veri oluşturulamazsa basit bir veri ekle
                blockchain_data['data'] = '0x'
            
            # Frontend'in beklediği şekilde yanıt döndür
            return Response({
                'success': True,
                'message': 'NFT purchase initiated',
                'transactionData': blockchain_data,  # Frontend'in beklediği transactionData alanı
                'nftId': nft_id,
                'title': nft_title,
                'isSubscription': nft_type_id == 2,
                'subscriptionDays': subscription_days if nft_type_id == 2 else None,
                'nftInfo': nft_info  # Yeni veri yapısını da ekle
            })
        
    except Exception as e:
        logger.error(f"Purchase NFT error: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_purchase(request):
    """Confirm a successful NFT purchase after MetaMask transaction"""
    user_id = request.user.id
    nft_id = request.data.get('nftId')
    wallet_address = request.data.get('walletAddress')
    transaction_hash = request.data.get('transactionHash')
    
    # Log all parameters for debugging
    logger.info(f"confirm_purchase called with: user_id={user_id}, nft_id={nft_id}, wallet_address={wallet_address[:10] if wallet_address else None}..., transaction_hash={transaction_hash[:10] if transaction_hash else None}...")
    logger.info(f"Request data: {request.data}")
    
    # Veritabanı yapısını kontrol et
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'UserSubscriptions'
            """)
            columns = cursor.fetchall()
            column_list = ", ".join([col[0] for col in columns])
            logger.info(f"UserSubscriptions table columns: {column_list}")
    except Exception as schema_error:
        logger.error(f"Error checking table structure: {str(schema_error)}")
    
    if not all([nft_id, wallet_address, transaction_hash]):
        logger.warning(f"Missing required parameters: nftId={nft_id}, walletAddress={wallet_address}, transactionHash={transaction_hash}")
        return Response({
            'error': 'Missing required parameters: nftId, walletAddress, transactionHash'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get current user data for logging
        with connection.cursor() as cursor:
            cursor.execute("SELECT Username, WalletAddress FROM Users WHERE UserID = %s", [user_id])
            user_data = cursor.fetchone()
            username = user_data[0] if user_data else "Unknown"
            
            # Kullanıcının cüzdan adresini güncelle - API çağrısı olmadan doğrudan veritabanı güncellemesi
            if wallet_address:
                cursor.execute("""
                    UPDATE Users
                    SET WalletAddress = %s
                    WHERE UserID = %s AND (WalletAddress IS NULL OR WalletAddress != %s)
                """, [wallet_address, user_id, wallet_address])
                logger.info(f"Updated wallet address for user {user_id}: {wallet_address[:10]}...")
        
        # Use transaction atomic to ensure all database operations succeed or fail together
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Check if user already owns this NFT
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM UserNFTs
                    WHERE UserID = %s AND NFTID = %s
                """, [user_id, nft_id])
                
                already_owns = cursor.fetchone()[0] > 0
                
                if already_owns:
                    return Response({
                        'error': 'You already own this NFT',
                        'code': 'ALREADY_OWNS_NFT'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Get NFT details
                cursor.execute("""
                    SELECT NFTTypeID, SubscriptionDays, TradeValue, Title
                    FROM NFTs
                    WHERE NFTID = %s
                """, [nft_id])
                
                nft_details = cursor.fetchone()
                if not nft_details:
                    return Response({
                        'error': 'NFT not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                nft_type_id, subscription_days, trade_value, nft_title = nft_details
                
                # Calculate expiry date for subscription NFTs
                expiry_date = None
                if nft_type_id == 2 and subscription_days:  # 2 = Subscription type
                    expiry_date = datetime.now() + timedelta(days=subscription_days)
                    logger.info(f"Setting expiry date for subscription NFT: {expiry_date}")
                    
                # Use the NFT ID directly as the blockchain NFT ID to ensure consistency
                blockchain_nft_id = int(nft_id)
                
                # UserNFT kaydı oluştur
                try:
                    # İlk olarak UserNFT kaydını ekle (SCOPE_IDENTITY kullanmadan)
                    cursor.execute("""
                        INSERT INTO UserNFTs (UserID, NFTID, AcquisitionDate, ExpiryDate, TransactionHash, IsMinted, BlockchainNFTID)
                        VALUES (%s, %s, GETDATE(), %s, %s, 1, %s)
                    """, [user_id, nft_id, expiry_date, transaction_hash, blockchain_nft_id])
                    
                    # Sonra ayrı bir sorgu ile son eklenen kaydın ID'sini al
                    cursor.execute("SELECT SCOPE_IDENTITY()")
                    user_nft_id_result = cursor.fetchone()
                    
                    if user_nft_id_result and user_nft_id_result[0]:
                        user_nft_id = int(user_nft_id_result[0])
                        logger.info(f"Created UserNFT with ID: {user_nft_id} for user {user_id}, NFT {nft_id}")
                    else:
                        # Eğer ID alınamazsa, başka bir yöntem dene
                        cursor.execute("""
                            SELECT TOP 1 UserNFTID 
                            FROM UserNFTs 
                            WHERE UserID = %s AND NFTID = %s AND TransactionHash = %s
                            ORDER BY UserNFTID DESC
                        """, [user_id, nft_id, transaction_hash])
                        
                        last_record = cursor.fetchone()
                        if last_record:
                            user_nft_id = last_record[0]
                            logger.info(f"Retrieved UserNFT ID using alternative method: {user_nft_id}")
                        else:
                            raise Exception("Failed to retrieve UserNFT ID after insert")
                except Exception as e:
                    logger.error(f"Failed to insert UserNFT: {str(e)}")
                    return Response({
                        'error': f'Failed to create user NFT record: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # If this is a subscription NFT, set up the subscription
                subscription_details = None
                if nft_type_id == 2:  # 2 = Subscription type
                    try:
                        logger.info(f"Setting up subscription for NFT {nft_id}, type: subscription")
                        
                        # Calculate new end date for subscription (starting from now)
                        new_end_date = datetime.now() + timedelta(days=subscription_days or 30)  # Varsayılan 30 gün
                        
                        logger.info(f"Setting subscription end date: {new_end_date} for user {user_id}")
                        
                        # Önce NFT'nin bağlı olduğu SubscriptionPlan'ı bulalım
                        cursor.execute("""
                            SELECT PlanID 
                            FROM SubscriptionPlans
                            WHERE NFTID = %s AND IsActive = 1
                        """, [nft_id])
                        
                        plan_id_result = cursor.fetchone()
                        plan_id = plan_id_result[0] if plan_id_result else None
                        
                        # Tablonun şemasını kontrol et ve tüm alanları doğru şekilde belirt
                        cursor.execute("""
                            SELECT COLUMN_NAME
                            FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_NAME = 'UserSubscriptions'
                            ORDER BY ORDINAL_POSITION
                        """)
                        column_names = [col[0] for col in cursor.fetchall()]
                        logger.info(f"UserSubscriptions columns: {column_names}")
                        
                        if plan_id:
                            logger.info(f"Found subscription plan with ID: {plan_id} for NFT ID: {nft_id}")
                        else:
                            # Create a subscription plan if one doesn't exist
                            tier = "Basic"
                            if trade_value >= 300:
                                tier = "Pro"
                            elif trade_value >= 100:
                                tier = "Premium"
                            
                            duration_days = subscription_days or 30  # Varsayılan 30 gün
                            
                            # İlk olarak plan kaydını ekle
                            cursor.execute("""
                                INSERT INTO SubscriptionPlans
                                (NFTID, PlanName, DurationDays, Price, Description, IsActive)
                                VALUES (%s, %s, %s, %s, %s, 1)
                            """, [
                                nft_id,
                                f"{tier} {duration_days}-Day Access",
                                duration_days,
                                trade_value,
                                f"{tier} level subscription providing {duration_days} days of premium access."
                            ])
                            
                            # Sonra ayrı bir sorgu ile son eklenen planın ID'sini al
                            cursor.execute("SELECT SCOPE_IDENTITY()")
                            plan_id_result = cursor.fetchone()
                            
                            if plan_id_result and plan_id_result[0]:
                                plan_id = int(plan_id_result[0])
                                logger.info(f"Created new subscription plan ID {plan_id} for NFT ID {nft_id}")
                            else:
                                # Eğer ID alınamazsa, başka bir yöntem dene
                                cursor.execute("""
                                    SELECT TOP 1 PlanID 
                                    FROM SubscriptionPlans 
                                    WHERE NFTID = %s AND IsActive = 1
                                    ORDER BY PlanID DESC
                                """, [nft_id])
                                
                                last_plan = cursor.fetchone()
                                if last_plan:
                                    plan_id = last_plan[0]
                                    logger.info(f"Retrieved plan ID using alternative method: {plan_id}")
                                else:
                                    logger.error("Failed to create or retrieve plan ID")
                                    raise Exception("Subscription plan creation failed")
                        
                        # UserSubscriptions tablosuna kayıt ekleme - TÜM ALANLARI DOĞRU DOLDURARAK
                        logger.info(f"Setting up UserSubscription record with UserNFTID: {user_nft_id}, PlanID: {plan_id}")
                        
                        # Önce mevcut bir kayıt var mı kontrol edelim
                        cursor.execute("""
                            SELECT SubscriptionID, EndDate
                            FROM UserSubscriptions 
                            WHERE UserID = %s AND PlanID = %s AND IsActive = 1
                        """, [user_id, plan_id])
                        
                        logger.info(f"Checking for existing subscription: User {user_id}, Plan {plan_id}")
                        
                        existing_subscription = cursor.fetchone()
                        
                        if existing_subscription:
                            # Mevcut aboneliği güncelle
                            subscription_id = existing_subscription[0]
                            existing_end_date = existing_subscription[1]
                            
                            # Mevcut bitiş tarihinden uzatma yap
                            if existing_end_date and existing_end_date > datetime.now():
                                new_end_date = existing_end_date + timedelta(days=subscription_days or 30)
                            
                            cursor.execute("""
                                UPDATE UserSubscriptions
                                SET EndDate = %s, 
                                    PaymentTransactionID = %s,
                                    AutoRenew = 0
                                WHERE SubscriptionID = %s
                            """, [new_end_date, transaction_hash, subscription_id])
                            
                            logger.info(f"Updated existing UserSubscription with ID: {subscription_id}")
                        else:
                            # Yeni abonelik kaydı oluştur - UserNFTID sütunu olmadan
                            logger.info(f"Creating new UserSubscription for User: {user_id}, Plan: {plan_id}")
                            
                            # INSERT işlemini UserNFTID olmadan gerçekleştir
                            cursor.execute("""
                                INSERT INTO UserSubscriptions 
                                (UserID, PlanID, StartDate, EndDate, IsActive, PaymentMethod, PaymentTransactionID)
                                VALUES (%s, %s, GETDATE(), %s, 1, 'NFT', %s)
                            """, [user_id, plan_id, new_end_date, transaction_hash])
                            
                            # Sonra ayrı bir sorgu ile son eklenen kaydın ID'sini al (SCOPE_IDENTITY güvenli)
                            try:
                                cursor.execute("SELECT SCOPE_IDENTITY()")
                                subscription_id_result = cursor.fetchone()
                                
                                if subscription_id_result and subscription_id_result[0]:
                                    subscription_id = int(subscription_id_result[0])
                                    logger.info(f"Created new UserSubscription with ID: {subscription_id}")
                                else:
                                    # Başarısız olursa @@IDENTITY dene
                                    cursor.execute("SELECT @@IDENTITY")
                                    identity_result = cursor.fetchone()
                                    
                                    if identity_result and identity_result[0]:
                                        subscription_id = int(identity_result[0])
                                        logger.info(f"Created new UserSubscription with ID (@@IDENTITY): {subscription_id}")
                                    else:
                                        # Son çare olarak eklenen kaydı bulmaya çalış
                                        cursor.execute("""
                                            SELECT TOP 1 SubscriptionID 
                                            FROM UserSubscriptions 
                                            WHERE UserID = %s AND PlanID = %s AND UserNFTID = %s
                                            ORDER BY SubscriptionID DESC
                                        """, [user_id, plan_id, user_nft_id])
                                        
                                        last_record = cursor.fetchone()
                                        if last_record:
                                            subscription_id = last_record[0]
                                            logger.info(f"Retrieved UserSubscription ID using query: {subscription_id}")
                                        else:
                                            logger.warning("Failed to retrieve UserSubscription ID after insert")
                                            subscription_id = None
                            except Exception as sub_error:
                                logger.error(f"Error retrieving subscription ID: {str(sub_error)}")
                                # Hataya rağmen işlemi devam ettirelim, sistemde subscription oluştu ama ID alamadık
                                subscription_id = None
                        
                        # Get subscription details for response
                        if subscription_id:
                            cursor.execute("""
                                SELECT us.StartDate, us.EndDate, sp.PlanName
                                FROM UserSubscriptions us
                                JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                                WHERE us.SubscriptionID = %s
                            """, [subscription_id])
                            
                            sub_result = cursor.fetchone()
                            if sub_result:
                                sub_start, sub_end, plan_name = sub_result
                                
                                days_remaining = 0
                                if sub_end:
                                    days_remaining = (sub_end - datetime.now()).days
                                
                                subscription_details = {
                                    'subscriptionId': subscription_id,
                                    'planId': plan_id,
                                    'planName': plan_name,
                                    'status': 'active',
                                    'startDate': sub_start.isoformat() if sub_start else None,
                                    'endDate': sub_end.isoformat() if sub_end else None,
                                    'daysRemaining': max(0, days_remaining)
                                }
                    
                    except Exception as e:
                        logger.error(f"Subscription setup error: {str(e)}", exc_info=True)
                        # Continue with the purchase even if subscription setup fails
                        # We'll at least have the UserNFT record
                
                # Add notification
                try:
                    cursor.execute("""
                        INSERT INTO Notifications
                        (UserID, Title, Message, NotificationType, IsRead, CreationDate)
                        VALUES (%s, %s, %s, 'purchase', 0, GETDATE())
                    """, [
                        user_id,
                        f"NFT Purchase Successful",
                        f"You've successfully purchased {nft_title}."
                    ])
                except Exception as e:
                    logger.warning(f"Failed to create notification: {str(e)}")
                
                # Log purchase activity
                try:
                    cursor.execute("""
                        INSERT INTO ActivityLogs
                        (UserID, ActivityType, Description, Timestamp)
                        VALUES (%s, 'nft_purchase', %s, GETDATE())
                    """, [
                        user_id,
                        f"Purchased NFT ID {nft_id} with transaction {transaction_hash[:10]}..."
                    ])
                except Exception as e:
                    logger.warning(f"Failed to log activity: {str(e)}")
        
        # Return successful response with subscription details if applicable
        return Response({
            'success': True,
            'message': 'NFT purchase confirmed successfully',
            'userNftId': user_nft_id,
            'nftId': nft_id,
            'transactionHash': transaction_hash,  # Frontend için transaction hash bilgisini ekle
            'walletAddress': wallet_address,  # Cüzdan adresi bilgisini ekle
            'title': nft_title,  # NFT başlığını ekle
            'subscriptionDetails': subscription_details
        })
                
    except Exception as e:
        logger.error(f"Purchase confirmation error: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_purchase(request):
    """Cancel a pending NFT purchase if the user rejected MetaMask transaction"""
    user_id = request.user.id
    nft_id = request.data.get('nftId')
    wallet_address = request.data.get('walletAddress')
    
    if not all([nft_id, wallet_address]):
        return Response({
            'error': 'Missing required parameters: nftId, walletAddress'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Delete the pending UserNFT record
        with connection.cursor() as cursor:
            # First find the UserNFT to delete
            cursor.execute("""
                SELECT UserNFTID
                FROM UserNFTs
                WHERE UserID = %s AND NFTID = %s AND IsMinted = 0
            """, [user_id, nft_id])
            
            user_nft = cursor.fetchone()
            
            if not user_nft:
                # No pending purchase found, this is fine
                return Response({
                    'success': True,
                    'message': 'No pending purchase found to cancel'
                })
            
            user_nft_id = user_nft[0]
            
            # Check if this is a subscription NFT
            cursor.execute("""
                SELECT nft.NFTTypeID
                FROM NFTs nft
                WHERE nft.NFTID = %s
            """, [nft_id])
            
            nft_type_result = cursor.fetchone()
            if nft_type_result and nft_type_result[0] == 2:  # Subscription type
                # Check for any subscription entries
                cursor.execute("""
                    SELECT SubscriptionID
                    FROM UserSubscriptions
                    WHERE UserNFTID = %s AND IsActive = 1
                """, [user_nft_id])
                
                sub_result = cursor.fetchone()
                if sub_result:
                    # Deactivate the subscription
                    cursor.execute("""
                        UPDATE UserSubscriptions
                        SET IsActive = 0, 
                            LastUpdated = GETDATE(),
                            CancellationDate = GETDATE(),
                            Notes = 'Cancelled due to rejected transaction'
                        WHERE SubscriptionID = %s
                    """, [sub_result[0]])
                    
                    logger.info(f"Deactivated subscription ID {sub_result[0]} for cancelled NFT purchase")
            
            # Delete the UserNFT record
            cursor.execute("""
                DELETE FROM UserNFTs
                WHERE UserNFTID = %s
            """, [user_nft_id])
            
            # Log the cancellation
            cursor.execute("""
                INSERT INTO ActivityLogs
                (UserID, ActivityType, Description, Timestamp)
                VALUES (%s, 'nft_purchase_cancelled', %s, GETDATE())
            """, [
                user_id,
                f"Cancelled purchase of NFT ID {nft_id}"
            ])
            
            return Response({
                'success': True,
                'message': 'NFT purchase cancelled successfully'
            })
            
    except Exception as e:
        logger.error(f"Error cancelling NFT purchase: {e}")
        return Response({
            'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add a new endpoint to fix all subscription plans with NULL NFTIDs
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fix_subscription_plans(request):
    """Abonelik planlarındaki NULL NFTID değerlerini düzeltme endpoint'i - sadece adminler için"""
    user_id = request.user.id
    
    # Kullanıcının admin olup olmadığını kontrol et
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()
        if not user_role or user_role[0] != 'admin':
            return Response({'error': 'Only administrators can use this function'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    try:
        results = {
            'subscription_plans_fixed': 0,
            'user_subscriptions_fixed': 0,
            'user_nfts_fixed': 0,
            'missing_subs_created': 0
        }
        
        with transaction.atomic():
            with connection.cursor() as cursor:
                # 1. Önce NULL NFTID değerleri olan abonelik planlarını düzelt
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM SubscriptionPlans 
                    WHERE NFTID IS NULL OR NFTID = 0
                """)
                
                null_plans_count = cursor.fetchone()[0]
                logger.info(f"Found {null_plans_count} subscription plans with NULL NFTID values")
                
                if null_plans_count > 0:
                    # İsim ve süre bilgisini kullanarak eşleşen NFT'leri bul
                    cursor.execute("""
                        WITH NFTMatches AS (
                            SELECT 
                                sp.PlanID,
                                n.NFTID,
                                n.Title
                            FROM SubscriptionPlans sp
                            JOIN NFTs n ON 
                                (n.Title LIKE '%' + sp.PlanName + '%' OR sp.PlanName LIKE '%' + n.Title + '%')
                                AND n.NFTTypeID = 2  -- Subscription type
                                AND n.SubscriptionDays = sp.DurationDays
                            WHERE sp.NFTID IS NULL OR sp.NFTID = 0
                        )
                        UPDATE sp
                        SET sp.NFTID = nm.NFTID
                        FROM SubscriptionPlans sp
                        JOIN NFTMatches nm ON sp.PlanID = nm.PlanID
                        OUTPUT INSERTED.PlanID
                    """)
                    
                    updated_plans = cursor.fetchall()
                    results['subscription_plans_fixed'] += len(updated_plans)
                    
                    logger.info(f"Fixed {len(updated_plans)} subscription plans by name and duration match")
                    
                    # İkinci deneme: Süre ve fiyat eşleşmesiyle bul
                    cursor.execute("""
                        WITH NFTsWithoutPlans AS (
                            SELECT n.NFTID, n.Title, n.SubscriptionDays, n.TradeValue
                            FROM NFTs n
                            LEFT JOIN SubscriptionPlans sp ON n.NFTID = sp.NFTID
                            WHERE n.NFTTypeID = 2
                            AND sp.PlanID IS NULL
                        ),
                        PlansWithoutNFTs AS (
                            SELECT sp.PlanID, sp.PlanName, sp.DurationDays, sp.Price
                            FROM SubscriptionPlans sp
                            WHERE sp.NFTID IS NULL OR sp.NFTID = 0
                        )
                        UPDATE sp
                        SET sp.NFTID = n.NFTID
                        FROM SubscriptionPlans sp
                        JOIN NFTs n ON 
                            n.NFTTypeID = 2 -- Subscription type
                            AND n.SubscriptionDays = sp.DurationDays
                            AND ABS(ISNULL(n.TradeValue, 0) - ISNULL(sp.Price, 0)) < 10  -- Price is similar
                        WHERE sp.NFTID IS NULL OR sp.NFTID = 0
                        OUTPUT INSERTED.PlanID
                    """)
                    
                    updated_plans2 = cursor.fetchall()
                    results['subscription_plans_fixed'] += len(updated_plans2)
                    
                    logger.info(f"Fixed {len(updated_plans2)} subscription plans by duration and price match")
                
                # 2. UserSubscriptions tablosundaki hatalı PlanID veya eksik UserNFTID değerlerini düzelt
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM UserSubscriptions us
                    LEFT JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                    WHERE us.PlanID IS NULL OR sp.PlanID IS NULL
                """)
                
                invalid_subs_count = cursor.fetchone()[0]
                logger.info(f"Found {invalid_subs_count} user subscriptions with invalid PlanID")
                
                if invalid_subs_count > 0:
                    # Uygun planlar ile eşleştir
                    cursor.execute("""
                        WITH SubscriptionFixes AS (
                            SELECT 
                                us.SubscriptionID,
                                us.UserID,
                                us.UserNFTID,
                                (
                                    -- Try to find plan based on UserNFTID
                                    SELECT TOP 1 sp.PlanID
                                    FROM UserNFTs un
                                    JOIN SubscriptionPlans sp ON un.NFTID = sp.NFTID
                                    WHERE un.UserNFTID = us.UserNFTID
                                    AND sp.IsActive = 1
                                    ORDER BY sp.PlanID
                                ) AS NewPlanID
                            FROM UserSubscriptions us
                            LEFT JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                            WHERE us.PlanID IS NULL OR sp.PlanID IS NULL
                        )
                        -- Update subscriptions with the new PlanIDs
                        UPDATE us
                        SET us.PlanID = sf.NewPlanID
                        FROM UserSubscriptions us
                        JOIN SubscriptionFixes sf ON us.SubscriptionID = sf.SubscriptionID
                        WHERE sf.NewPlanID IS NOT NULL
                        OUTPUT INSERTED.SubscriptionID
                    """)
                    
                    updated_subs = cursor.fetchall()
                    results['user_subscriptions_fixed'] += len(updated_subs)
                    
                    logger.info(f"Fixed {len(updated_subs)} user subscriptions with missing PlanID")
                
                # 3. UserNFTID eksik olan UserSubscriptions kayıtlarını düzelt
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM UserSubscriptions us
                    WHERE us.UserNFTID IS NULL
                """)
                
                null_user_nft_count = cursor.fetchone()[0]
                logger.info(f"Found {null_user_nft_count} user subscriptions with NULL UserNFTID")
                
                if null_user_nft_count > 0:
                    # Uygun UserNFTID'yi bul
                    cursor.execute("""
                        WITH UserNFTMatches AS (
                            SELECT 
                                us.SubscriptionID,
                                us.PlanID,
                                us.UserID,
                                (
                                    -- Match based on NFTID from the plan
                                    SELECT TOP 1 un.UserNFTID
                                    FROM UserNFTs un
                                    JOIN SubscriptionPlans sp ON un.NFTID = sp.NFTID
                                    WHERE sp.PlanID = us.PlanID
                                    AND un.UserID = us.UserID
                                    ORDER BY un.AcquisitionDate DESC
                                ) AS MatchedUserNFTID
                            FROM UserSubscriptions us
                            WHERE us.UserNFTID IS NULL
                        )
                        -- Update subscriptions with the matched UserNFTID
                        UPDATE us
                        SET us.UserNFTID = unm.MatchedUserNFTID
                        FROM UserSubscriptions us
                        JOIN UserNFTMatches unm ON us.SubscriptionID = unm.SubscriptionID
                        WHERE unm.MatchedUserNFTID IS NOT NULL
                        OUTPUT INSERTED.SubscriptionID
                    """)
                    
                    updated_user_nfts = cursor.fetchall()
                    results['user_nfts_fixed'] += len(updated_user_nfts)
                    
                    logger.info(f"Fixed {len(updated_user_nfts)} user subscriptions by adding UserNFTID")
                
                # 4. UserNFTs tablosunda BlockchainNFTID NULL değerlerini düzelt
                cursor.execute("""
                    UPDATE un
                    SET un.BlockchainNFTID = un.NFTID
                    FROM UserNFTs un
                    WHERE (un.BlockchainNFTID IS NULL OR un.BlockchainNFTID = 0)
                        AND un.NFTID IS NOT NULL
                    OUTPUT INSERTED.UserNFTID
                """)
                
                blockchain_updates = cursor.fetchall()
                logger.info(f"Fixed {len(blockchain_updates)} UserNFTs with NULL BlockchainNFTID")
                
                # 5. Abonelik NFT'si olan kullanıcılar için UserSubscriptions olmayan kayıtları oluştur
                cursor.execute("""
                    WITH MissingSubscriptions AS (
                        SELECT 
                            un.UserID,
                            un.UserNFTID,
                            un.NFTID,
                            un.AcquisitionDate,
                            un.ExpiryDate,
                            un.TransactionHash,
                            sp.PlanID
                        FROM UserNFTs un
                        JOIN NFTs n ON un.NFTID = n.NFTID
                        JOIN SubscriptionPlans sp ON n.NFTID = sp.NFTID
                        LEFT JOIN UserSubscriptions us ON un.UserID = us.UserID AND sp.PlanID = us.PlanID
                        WHERE n.NFTTypeID = 2 -- Subscription type
                            AND us.SubscriptionID IS NULL
                            AND sp.IsActive = 1
                    )
                    -- Eksik abonelikleri ekle
                    INSERT INTO UserSubscriptions
                        (UserID, PlanID, UserNFTID, StartDate, EndDate, IsActive, PaymentTransactionID)
                    SELECT 
                        ms.UserID,
                        ms.PlanID,
                        ms.UserNFTID,
                        ms.AcquisitionDate,
                        ms.ExpiryDate,
                        1,  -- IsActive
                        ms.TransactionHash
                    FROM MissingSubscriptions ms
                    OUTPUT INSERTED.SubscriptionID
                """)
                
                created_subs = cursor.fetchall()
                results['missing_subs_created'] += len(created_subs)
                
                logger.info(f"Created {len(created_subs)} missing UserSubscriptions records")
                
                # İşlemi kaydet
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp)
                    VALUES (%s, 'admin_action', %s, GETDATE())
                """, [
                    user_id,
                    f"Database fix: {results['subscription_plans_fixed']} plans, {results['user_subscriptions_fixed']} subscriptions, {results['user_nfts_fixed']} user NFTs fixed, {results['missing_subs_created']} subscriptions created"
                ])
        
        # Tüm değişiklikleri göster
        return Response({
            'message': 'Database fixes completed successfully',
            'results': results
        })
    
    except Exception as e:
        logger.error(f"Error fixing database records: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)