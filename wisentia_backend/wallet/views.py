from django.db import connection, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import web3
from web3 import Web3
from web3.exceptions import InvalidAddress
import logging

from rest_framework.decorators import throttle_classes
from users.throttling import SensitiveOperationsThrottle
from .blockchain import BlockchainService
from django.conf import settings

logger = logging.getLogger('wisentia')

# Web3 bağlantısı için helper fonksiyon
def get_web3_connection(network="educhain"):
    """Belirtilen blockchain ağı için Web3 bağlantısı sağlar"""
    try:
        # Force Educhain testnet
        network = "educhain"
        
        # Educhain testnet settings
        rpc_url = getattr(settings, 'BLOCKCHAIN_RPC_URLS', {}).get('educhain', 'https://rpc.open-campus-codex.gelato.digital')
        chain_id = getattr(settings, 'BLOCKCHAIN_CHAIN_IDS', {}).get('educhain', 656476)
        
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not w3.is_connected():
            raise ConnectionError("Failed to connect to Educhain testnet")
        
        # Verify chain ID
        connected_chain_id = w3.eth.chain_id
        if connected_chain_id != chain_id:
            logger.warning(f"Connected to unexpected chain ID: got {connected_chain_id}, expected {chain_id}")
        
        return w3
    except Exception as e:
        logger.error(f"Web3 bağlantı hatası: {str(e)}")
        raise

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def connect_wallet(request):
    """Kullanıcı hesabını cüzdan ile bağlayan API endpoint'i"""
    user_id = request.user.id
    address = request.data.get('address')
    network = request.data.get('network', 'educhain')
    
    if not address:
        return Response({'error': 'Wallet address is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Wallet adresini doğrula
        w3 = get_web3_connection(network)
        if not w3.is_address(address):
            return Response({'error': 'Invalid wallet address format'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Adresi checksum formatına dönüştür
        checksum_address = w3.to_checksum_address(address)
        
        # Transaction ile veritabanı işlemlerini yap
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Adresin başka bir kullanıcıya bağlı olup olmadığını kontrol et
                cursor.execute("""
                    SELECT UserID FROM Users
                    WHERE WalletAddress = %s AND UserID != %s
                """, [checksum_address, user_id])
                
                if cursor.fetchone():
                    return Response({'error': 'Wallet address is already linked to another account'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Kullanıcının cüzdan adresini güncelle
                cursor.execute("""
                    UPDATE Users
                    SET WalletAddress = %s
                    WHERE UserID = %s
                """, [checksum_address, user_id])
                
                # Etkinlik logu ekle
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                    VALUES (%s, 'wallet_connected', %s, GETDATE(), %s, %s)
                """, [
                    user_id, 
                    f"Connected wallet address: {checksum_address} on {network}", 
                    request.META.get('REMOTE_ADDR', ''),
                    request.META.get('HTTP_USER_AGENT', '')
                ])
        
        return Response({
            'message': 'Wallet connected successfully',
            'address': checksum_address,
            'network': network
        })
    
    except ConnectionError as e:
        logger.error(f"Wallet connection error: {str(e)}")
        return Response({
            'error': f"Connection to blockchain failed: {str(e)}"
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except InvalidAddress:
        return Response({
            'error': 'Invalid wallet address format'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Wallet connection error: {str(e)}", exc_info=True)
        return Response({
            'error': f"Failed to connect wallet: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet_info(request):
    """Kullanıcının cüzdan bilgilerini getiren API endpoint'i"""
    user_id = request.user.id
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT WalletAddress
                FROM Users
                WHERE UserID = %s
            """, [user_id])
            
            result = cursor.fetchone()
            
            if not result or not result[0]:
                return Response({'connected': False})
            
            wallet_address = result[0]
            
            # NFT sayısını al
            cursor.execute("""
                SELECT COUNT(*)
                FROM UserNFTs
                WHERE UserID = %s AND IsMinted = 1
            """, [user_id])
            
            nft_count = cursor.fetchone()[0]
            
            # Web3 bağlantısı ile cüzdan bakiyesini kontrol et (opsiyonel)
            balance = None
            try:
                w3 = get_web3_connection()
                balance = w3.eth.get_balance(wallet_address)
                balance_eth = w3.from_wei(balance, 'ether')
            except:
                balance_eth = None
                
            # BlockchainService ile abonelik durumunu kontrol et
            subscription_info = {}
            try:
                blockchain_service = BlockchainService()
                subscription_info = blockchain_service.check_subscription_status(wallet_address)
            except Exception as e:
                logger.error(f"Failed to get subscription info: {str(e)}")
                subscription_info = {"error": "Failed to retrieve subscription information"}
            
            return Response({
                'connected': True,
                'address': wallet_address,
                'nftCount': nft_count,
                'balance': str(balance_eth) if balance_eth is not None else None,
                'subscription': subscription_info
            })
    except Exception as e:
        logger.error(f"Get wallet info error: {str(e)}", exc_info=True)
        return Response({
            'error': f"Failed to get wallet info: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([SensitiveOperationsThrottle])
def mint_nft(request):
    """NFT'yi blockchain'e mint etme işlemi"""
    user_id = request.user.id
    nft_id = request.data.get('nftId')
    
    if not nft_id:
        return Response({'error': 'NFT ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Kullanıcının cüzdan adresi var mı kontrol et
                cursor.execute("""
                    SELECT WalletAddress
                    FROM Users
                    WHERE UserID = %s
                """, [user_id])
                
                wallet_result = cursor.fetchone()
                if not wallet_result or not wallet_result[0]:
                    return Response({'error': 'No wallet connected'}, status=status.HTTP_400_BAD_REQUEST)
                
                wallet_address = wallet_result[0]
                
                # NFT'yi kontrol et
                cursor.execute("""
                    SELECT un.UserNFTID, n.Title, n.ImageURI, n.BlockchainMetadata, n.TradeValue, nt.TypeName
                    FROM UserNFTs un
                    JOIN NFTs n ON un.NFTID = n.NFTID
                    JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                    WHERE un.UserID = %s AND un.NFTID = %s AND un.IsMinted = 0
                """, [user_id, nft_id])
                
                nft_data = cursor.fetchone()
                if not nft_data:
                    return Response({
                        'error': 'NFT not found, already minted, or not owned by user'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                user_nft_id, nft_title, nft_image, blockchain_metadata, trade_value, nft_type = nft_data
                
                # NFT tipi takas edilebilir mi belirle
                tradable = nft_type in ['achievement', 'quest_reward']  # Bu tipler takas edilebilir
                
                # BlockchainService ile mint işlemi
                try:
                    blockchain_service = BlockchainService()
                    result = blockchain_service.mint_reward_nft(
                        wallet_address, 
                        nft_title,
                        tradable,
                        trade_value,
                        nft_image
                    )
                    
                    if result["success"]:
                        transaction_hash = result["transactionHash"]
                        blockchain_nft_id = result.get("nftId", "Unknown")
                        
                        # NFT'yi güncelle
                        cursor.execute("""
                            UPDATE UserNFTs
                            SET IsMinted = 1, TransactionHash = %s, 
                            BlockchainNFTID = %s
                            WHERE UserNFTID = %s
                        """, [transaction_hash, blockchain_nft_id, user_nft_id])
                        
                        # Etkinlik logu ekle
                        cursor.execute("""
                            INSERT INTO ActivityLogs
                            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                            VALUES (%s, 'nft_minted', %s, GETDATE(), %s, %s)
                        """, [
                            user_id,
                            f"Minted NFT: {nft_title} (Transaction: {transaction_hash}, BlockchainID: {blockchain_nft_id})",
                            request.META.get('REMOTE_ADDR', ''),
                            request.META.get('HTTP_USER_AGENT', '')
                        ])
                        
                        # Bildirim ekle
                        cursor.execute("""
                            INSERT INTO Notifications
                            (UserID, Title, Message, NotificationType, RelatedEntityID, IsRead, IsDismissed, CreationDate)
                            VALUES (%s, 'NFT Minted', %s, 'achievement', %s, 0, 0, GETDATE())
                        """, [
                            user_id,
                            f"Your NFT '{nft_title}' has been successfully minted to the blockchain.",
                            nft_id
                        ])
                        
                        return Response({
                            'message': 'NFT minted successfully',
                            'blockchainNftId': blockchain_nft_id,
                            'transactionHash': transaction_hash
                        })
                    else:
                        logger.error(f"Blockchain mint failed: {result['error']}")
                        return Response({
                            'error': f"Failed to mint NFT on blockchain: {result['error']}"
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                except Exception as e:
                    logger.error(f"NFT minting error: {str(e)}", exc_info=True)
                    return Response({
                        'error': f"Failed to mint NFT: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Mint NFT error: {str(e)}", exc_info=True)
        return Response({
            'error': f"Failed to process request: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disconnect_wallet(request):
    """Kullanıcının cüzdan bağlantısını kesen API endpoint'i"""
    user_id = request.user.id
    
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Önce cüzdan adresini kontrol et
                cursor.execute("""
                    SELECT WalletAddress
                    FROM Users
                    WHERE UserID = %s
                """, [user_id])
                
                result = cursor.fetchone()
                if not result or not result[0]:
                    return Response({'error': 'No wallet connected'}, status=status.HTTP_400_BAD_REQUEST)
                
                wallet_address = result[0]
                
                # Kullanıcının cüzdan adresini temizle
                cursor.execute("""
                    UPDATE Users
                    SET WalletAddress = NULL
                    WHERE UserID = %s
                """, [user_id])
                
                # Etkinlik logu ekle
                cursor.execute("""
                    INSERT INTO ActivityLogs
                    (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                    VALUES (%s, 'wallet_disconnected', %s, GETDATE(), %s, %s)
                """, [
                    user_id, 
                    f"Disconnected wallet address: {wallet_address}", 
                    request.META.get('REMOTE_ADDR', ''),
                    request.META.get('HTTP_USER_AGENT', '')
                ])
                
                return Response({'message': 'Wallet disconnected successfully'})
    
    except Exception as e:
        logger.error(f"Disconnect wallet error: {str(e)}", exc_info=True)
        return Response({
            'error': f"Failed to disconnect wallet: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_info(request):
    """Kullanıcının blockchain abonelik bilgilerini getiren API endpoint'i"""
    user_id = request.user.id
    
    try:
        # Kullanıcının wallet adresini al
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT WalletAddress
                FROM Users
                WHERE UserID = %s
            """, [user_id])
            
            result = cursor.fetchone()
            if not result or not result[0]:
                return Response({
                    'error': 'No wallet connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            wallet_address = result[0]
        
        # BlockchainService ile abonelik durumunu kontrol et
        blockchain_service = BlockchainService()
        subscription_info = blockchain_service.check_subscription_status(wallet_address)
        
        # Veritabanındaki NFT ve abonelik bilgileriyle eşleştir
        if subscription_info.get("hasSubscription", False):
            with connection.cursor() as cursor:
                # Eğer bir aboneliği varsa veritabanı kayıtlarını güncelle veya ekle
                sub_id = subscription_info.get("subscriptionId")
                tier = subscription_info.get("tier")
                end_time = subscription_info.get("endTime")
                
                # Mevcut aboneliği kontrol et
                cursor.execute("""
                    SELECT SubscriptionID, PlanID
                    FROM UserSubscriptions
                    WHERE UserID = %s AND IsActive = 1
                    ORDER BY EndDate DESC
                """, [user_id])
                
                db_subscription = cursor.fetchone()
                
                # Abonelik tipi ID'sini al
                cursor.execute("""
                    SELECT PlanID, PlanName
                    FROM SubscriptionPlans
                    WHERE PlanName = %s
                """, [tier])
                
                plan_data = cursor.fetchone()
                plan_id = plan_data[0] if plan_data else None
                
                if not db_subscription and plan_id:
                    # Veritabanında abonelik yoksa ama blockchain'de varsa ekle
                    from datetime import datetime, timedelta
                    import time
                    
                    start_date = datetime.fromtimestamp(time.time())
                    end_date = datetime.fromtimestamp(end_time)
                    
                    cursor.execute("""
                        INSERT INTO UserSubscriptions
                        (UserID, PlanID, StartDate, EndDate, IsActive, PaymentMethod, AutoRenew)
                        VALUES (%s, %s, %s, %s, 1, 'blockchain', 0)
                    """, [user_id, plan_id, start_date, end_date])
                    
                    # Etkinlik logu ekle
                    cursor.execute("""
                        INSERT INTO ActivityLogs
                        (UserID, ActivityType, Description, Timestamp)
                        VALUES (%s, 'subscription_synced', %s, GETDATE())
                    """, [
                        user_id,
                        f"Blockchain {tier} subscription synced to database"
                    ])
                    
                    # Bildirim ekle
                    cursor.execute("""
                        INSERT INTO Notifications
                        (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                        VALUES (%s, 'Subscription Activated', %s, 'system', 0, 0, GETDATE())
                    """, [
                        user_id,
                        f"Your {tier} subscription has been activated on the platform."
                    ])
                
        return Response(subscription_info)
    
    except Exception as e:
        logger.error(f"Subscription info error: {str(e)}", exc_info=True)
        return Response({
            'error': f"Failed to get subscription info: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([SensitiveOperationsThrottle])
def purchase_subscription(request):
    """Blockchain üzerinden abonelik satın alma"""
    user_id = request.user.id
    tier = request.data.get('tier')  # 'B', 'P', veya 'L' olarak gelmeli
    private_key = request.data.get('privateKey')  # Frontend'den güvenli bir şekilde alınmalı
    price_wei = request.data.get('priceWei')  # Abonelik ücreti (wei cinsinden)
    
    if not all([tier, private_key, price_wei]):
        return Response({
            'error': 'Missing required parameters: tier, privateKey, priceWei'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Kullanıcının wallet adresini al
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT WalletAddress
                FROM Users
                WHERE UserID = %s
            """, [user_id])
            
            result = cursor.fetchone()
            if not result or not result[0]:
                return Response({
                    'error': 'No wallet connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            wallet_address = result[0]
        
        # BlockchainService ile abonelik satın al
        blockchain_service = BlockchainService()
        result = blockchain_service.purchase_subscription(
            wallet_address,
            tier,
            private_key,
            int(price_wei)
        )
        
        if result["success"]:
            subscription_id = result.get("subscriptionId")
            expiry_timestamp = result.get("expiryTimestamp")
            transaction_hash = result["transactionHash"]
            
            # Veritabanında abonelik kaydını oluştur
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # Önce abonelik planını ID'sini al
                    tier_name = {"B": "Basic", "P": "Premium", "L": "Pro"}.get(tier)
                    
                    cursor.execute("""
                        SELECT PlanID
                        FROM SubscriptionPlans
                        WHERE PlanName = %s
                    """, [tier_name])
                    
                    plan_result = cursor.fetchone()
                    if not plan_result:
                        return Response({
                            'error': f'Subscription plan not found for tier: {tier}'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    plan_id = plan_result[0]
                    
                    # Varsa mevcut aktif aboneliği pasif yap
                    cursor.execute("""
                        UPDATE UserSubscriptions
                        SET IsActive = 0
                        WHERE UserID = %s AND IsActive = 1
                    """, [user_id])
                    
                    # Yeni abonelik kaydını ekle
                    from datetime import datetime, timedelta
                    import time
                    
                    start_date = datetime.fromtimestamp(time.time())
                    end_date = datetime.fromtimestamp(expiry_timestamp)
                    
                    cursor.execute("""
                        INSERT INTO UserSubscriptions
                        (UserID, PlanID, StartDate, EndDate, IsActive, PaymentTransactionID, PaymentMethod, AutoRenew)
                        VALUES (%s, %s, %s, %s, 1, %s, 'blockchain', 0)
                    """, [user_id, plan_id, start_date, end_date, transaction_hash])
                    
                    # Etkinlik logu ekle
                    cursor.execute("""
                        INSERT INTO ActivityLogs
                        (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                        VALUES (%s, 'subscription_purchased', %s, GETDATE(), %s, %s)
                    """, [
                        user_id,
                        f"Purchased {tier_name} subscription (BlockchainID: {subscription_id}, Transaction: {transaction_hash})",
                        request.META.get('REMOTE_ADDR', ''),
                        request.META.get('HTTP_USER_AGENT', '')
                    ])
                    
                    # Bildirim ekle
                    cursor.execute("""
                        INSERT INTO Notifications
                        (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                        VALUES (%s, 'Subscription Activated', %s, 'system', 0, 0, GETDATE())
                    """, [
                        user_id,
                        f"Your {tier_name} subscription has been successfully activated until {end_date.strftime('%Y-%m-%d')}."
                    ])
            
            return Response({
                'message': 'Subscription purchased successfully',
                'subscriptionId': subscription_id,
                'expiryTimestamp': expiry_timestamp,
                'transactionHash': transaction_hash
            })
        else:
            return Response({
                'error': f"Failed to purchase subscription: {result.get('error', 'Unknown error')}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        logger.error(f"Purchase subscription error: {str(e)}", exc_info=True)
        return Response({
            'error': f"Failed to purchase subscription: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([SensitiveOperationsThrottle])
def trade_nfts_for_subscription(request):
    """NFTleri aboneliğe dönüştürme (takas) API endpoint'i"""
    user_id = request.user.id
    nft_ids = request.data.get('nftIds', [])  # Takas edilecek NFT IDs (blockchain ID'leri)
    tier = request.data.get('tier')  # Hedeflenen abonelik tipi: 'B', 'P', veya 'L'
    private_key = request.data.get('privateKey')  # Frontend'den güvenli bir şekilde alınmalı
    
    if not all([nft_ids, tier, private_key]) or not isinstance(nft_ids, list) or len(nft_ids) == 0:
        return Response({
            'error': 'Missing or invalid parameters: nftIds (array), tier, privateKey'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Kullanıcının wallet adresini al
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT WalletAddress
                FROM Users
                WHERE UserID = %s
            """, [user_id])
            
            result = cursor.fetchone()
            if not result or not result[0]:
                return Response({
                    'error': 'No wallet connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            wallet_address = result[0]
            
            # NFTlerin kullanıcıya ait olduğunu kontrol et
            for blockchain_nft_id in nft_ids:
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM UserNFTs
                    WHERE UserID = %s AND BlockchainNFTID = %s AND IsMinted = 1
                """, [user_id, blockchain_nft_id])
                
                count = cursor.fetchone()[0]
                if count == 0:
                    return Response({
                        'error': f'NFT with blockchain ID {blockchain_nft_id} not found or not owned by user'
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        # BlockchainService ile NFT takası yap
        blockchain_service = BlockchainService()
        result = blockchain_service.trade_nfts_for_subscription(
            wallet_address,
            nft_ids,
            tier,
            private_key
        )
        
        if result["success"]:
            subscription_id = result.get("subscriptionId")
            transaction_hash = result["transactionHash"]
            
            # Veritabanında takas edilmiş NFT'leri ve yeni aboneliği kaydet
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # NFT'leri kullanıcı envanterinden kaldır
                    for blockchain_nft_id in nft_ids:
                        cursor.execute("""
                            UPDATE UserNFTs
                            SET IsTraded = 1, TradeDate = GETDATE(), TradeTransactionHash = %s
                            WHERE UserID = %s AND BlockchainNFTID = %s
                        """, [transaction_hash, user_id, blockchain_nft_id])
                    
                    # BlockchainService ile abonelik durumunu kontrol et
                    subscription_details = blockchain_service.check_subscription_status(wallet_address)
                    
                    if subscription_details.get("hasSubscription", False):
                        # Önce abonelik planını ID'sini al
                        tier_name = subscription_details.get("tier", "Unknown")
                        end_time = subscription_details.get("endTime")
                        
                        cursor.execute("""
                            SELECT PlanID
                            FROM SubscriptionPlans
                            WHERE PlanName = %s
                        """, [tier_name])
                        
                        plan_result = cursor.fetchone()
                        if plan_result:
                            plan_id = plan_result[0]
                            
                            # Varsa mevcut aktif aboneliği pasif yap
                            cursor.execute("""
                                UPDATE UserSubscriptions
                                SET IsActive = 0
                                WHERE UserID = %s AND IsActive = 1
                            """, [user_id])
                            
                            # Yeni abonelik kaydını ekle
                            from datetime import datetime
                            import time
                            
                            start_date = datetime.fromtimestamp(time.time())
                            end_date = datetime.fromtimestamp(end_time)
                            
                            cursor.execute("""
                                INSERT INTO UserSubscriptions
                                (UserID, PlanID, StartDate, EndDate, IsActive, PaymentTransactionID, PaymentMethod, AutoRenew)
                                VALUES (%s, %s, %s, %s, 1, %s, 'nft_trade', 0)
                            """, [user_id, plan_id, start_date, end_date, transaction_hash])
                            
                            # Etkinlik logu ekle
                            cursor.execute("""
                                INSERT INTO ActivityLogs
                                (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                                VALUES (%s, 'nft_traded_for_subscription', %s, GETDATE(), %s, %s)
                            """, [
                                user_id,
                                f"Traded {len(nft_ids)} NFTs for {tier_name} subscription (BlockchainID: {subscription_id}, Transaction: {transaction_hash})",
                                request.META.get('REMOTE_ADDR', ''),
                                request.META.get('HTTP_USER_AGENT', '')
                            ])
                            
                            # Bildirim ekle
                            cursor.execute("""
                                INSERT INTO Notifications
                                (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                                VALUES (%s, 'NFTs Traded for Subscription', %s, 'system', 0, 0, GETDATE())
                            """, [
                                user_id,
                                f"You traded {len(nft_ids)} NFTs for a {tier_name} subscription valid until {end_date.strftime('%Y-%m-%d')}."
                            ])
            
            return Response({
                'message': 'NFTs traded for subscription successfully',
                'subscriptionId': subscription_id,
                'transactionHash': transaction_hash
            })
        else:
            return Response({
                'error': f"Failed to trade NFTs for subscription: {result.get('error', 'Unknown error')}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        logger.error(f"Trade NFTs for subscription error: {str(e)}", exc_info=True)
        return Response({
            'error': f"Failed to trade NFTs for subscription: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)