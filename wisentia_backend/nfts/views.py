from datetime import datetime
from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import NFTSerializer
from drf_yasg.utils import swagger_auto_schema

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
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT un.UserNFTID, un.AcquisitionDate, un.ExpiryDate, un.IsMinted, un.TransactionHash,
                   n.NFTID, n.Title, n.Description, n.ImageURI, n.BlockchainMetadata, 
                   n.TradeValue, n.SubscriptionDays, nt.TypeName as NFTType, nt.Description as NFTTypeDescription
            FROM UserNFTs un
            JOIN NFTs n ON un.NFTID = n.NFTID
            JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
            WHERE un.UserID = %s AND n.NFTID = %s
        """, [user_id, nft_id])
        
        columns = [col[0] for col in cursor.description]
        nft_data = cursor.fetchone()
        
        if not nft_data:
            return Response({'error': 'NFT not found'}, status=status.HTTP_404_NOT_FOUND)
            
        nft = dict(zip(columns, nft_data))
    
    return Response(nft)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mint_nft(request, user_nft_id):
    """NFT'yi blockchain'e mint eden API endpoint'i"""
    user_id = request.user.id
    transaction_hash = request.data.get('transactionHash')
    
    if not transaction_hash:
        return Response({'error': 'Transaction hash is required'}, status=status.HTTP_400_BAD_REQUEST)
    
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_nfts(request):
    """Mağazada satın alınabilecek NFT'leri listeleyen API endpoint'i"""
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT n.NFTID, n.Title, n.Description, n.ImageURI, n.TradeValue, 
                   n.SubscriptionDays, nt.TypeName as NFTType
            FROM NFTs n
            JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
            WHERE n.IsActive = 1 AND nt.TypeName = 'subscription'
            ORDER BY n.TradeValue, n.SubscriptionDays
        """)
        
        columns = [col[0] for col in cursor.description]
        nfts = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    return Response(nfts)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trade_nft(request):
    """NFT takası oluşturan API endpoint'i"""
    user_id = request.user.id
    target_nft_id = request.data.get('targetNftId')
    offered_nft_ids = request.data.get('offeredNftIds', [])
    
    if not target_nft_id:
        return Response({'error': 'Target NFT ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
    if not offered_nft_ids:
        return Response({'error': 'At least one offered NFT is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    with connection.cursor() as cursor:
        # Hedef NFT'yi kontrol et
        cursor.execute("""
            SELECT NFTID, Title, TradeValue
            FROM NFTs
            WHERE NFTID = %s AND IsActive = 1
        """, [target_nft_id])
        
        target_nft = cursor.fetchone()
        
        if not target_nft:
            return Response({'error': 'Target NFT not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
        
        target_nft_title = target_nft[1]
        target_nft_value = target_nft[2]
        
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
            if expiry_date and expiry_date < datetime.datetime.now():
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
        
        # Takas işlemini oluştur
        cursor.execute("""
            INSERT INTO NFTTrades
            (OfferUserID, TargetNFTID, TradeStatus, CreationDate)
            VALUES (%s, %s, 'pending', GETDATE());
            SELECT SCOPE_IDENTITY();
        """, [user_id, target_nft_id])
        
        trade_id = cursor.fetchone()[0]
        
        # Teklif edilen NFT'leri takas detaylarına ekle
        for user_nft_id in valid_user_nfts:
            cursor.execute("""
                INSERT INTO NFTTradeDetails
                (TradeID, OfferedUserNFTID)
                VALUES (%s, %s)
            """, [trade_id, user_nft_id])
        
        # Admin'e bildirim gönder
        cursor.execute("""
            INSERT INTO Notifications
            (UserID, Title, Message, NotificationType, RelatedEntityID, IsRead, IsDismissed, CreationDate)
            SELECT UserID, 'New NFT Trade Request', %s, 'system', %s, 0, 0, GETDATE()
            FROM Users
            WHERE UserRole = 'admin'
        """, [
            f"User has requested to trade {len(valid_user_nfts)} NFTs for {target_nft_title}",
            trade_id
        ])
    
    return Response({
        'message': 'NFT trade request created successfully',
        'tradeId': trade_id
    })

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
    """Yeni NFT oluşturan API endpoint'i (sadece admin)"""
    user_id = request.user.id
    
    # Admin kontrolü ekle
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserRole FROM Users WHERE UserID = %s
        """, [user_id])
        
        user_role = cursor.fetchone()[0]
        
        if user_role != 'admin':
            return Response({'error': 'Only administrators can create NFTs'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    # NFT bilgilerini al
    title = request.data.get('title')
    description = request.data.get('description')
    image_uri = request.data.get('imageUri')
    nft_type_id = request.data.get('nftTypeId')
    trade_value = request.data.get('tradeValue', 0)
    subscription_days = request.data.get('subscriptionDays')
    blockchain_metadata = request.data.get('blockchainMetadata', '{}')
    
    # Zorunlu alanları kontrol et
    if not all([title, description, image_uri, nft_type_id]):
        return Response({
            'error': 'Title, description, imageUri and nftTypeId are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # NFT türünü kontrol et
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT NFTTypeID FROM NFTTypes WHERE NFTTypeID = %s
        """, [nft_type_id])
        
        if not cursor.fetchone():
            return Response({'error': 'Invalid NFT type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Yeni NFT oluştur
        cursor.execute("""
            INSERT INTO NFTs
            (NFTTypeID, Title, Description, ImageURI, BlockchainMetadata, TradeValue, 
             SubscriptionDays, IsActive)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 1);
            SELECT SCOPE_IDENTITY();
        """, [
            nft_type_id, title, description, image_uri, blockchain_metadata, 
            trade_value, subscription_days
        ])
        
        nft_id = cursor.fetchone()[0]
        
        # Etkinlik logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'nft_created', %s, GETDATE(), %s, %s)
        """, [
            user_id, 
            f"Created NFT: {title} (ID: {nft_id})", 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({
        'message': 'NFT created successfully',
        'nftId': nft_id
    }, status=status.HTTP_201_CREATED)