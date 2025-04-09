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

logger = logging.getLogger('wisentia')

# Web3 bağlantısı için helper fonksiyon
def get_web3_connection(network="educhain"):
    """Belirtilen blockchain ağı için Web3 bağlantısı sağlar"""
    try:
        # Eğitim zinciri için test RPC url'si (örnek)
        rpc_urls = {
            "educhain": "http://localhost:8545",  # Test RPC - gerçek adresi buraya ekleyin
            "ethereum": "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",  # Gerçek ağ için örnek
            "polygon": "https://polygon-rpc.com",
        }
        
        if network not in rpc_urls:
            raise ValueError(f"Unsupported network: {network}")
        
        w3 = Web3(Web3.HTTPProvider(rpc_urls[network]))
        if not w3.is_connected():
            raise ConnectionError(f"Failed to connect to {network}")
        
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
            
            return Response({
                'connected': True,
                'address': wallet_address,
                'nftCount': nft_count,
                'balance': str(balance_eth) if balance_eth is not None else None
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
                    SELECT un.UserNFTID, n.Title, n.ImageURI, n.BlockchainMetadata
                    FROM UserNFTs un
                    JOIN NFTs n ON un.NFTID = n.NFTID
                    WHERE un.UserID = %s AND un.NFTID = %s AND un.IsMinted = 0
                """, [user_id, nft_id])
                
                nft_data = cursor.fetchone()
                if not nft_data:
                    return Response({
                        'error': 'NFT not found, already minted, or not owned by user'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                user_nft_id, nft_title, nft_image, blockchain_metadata = nft_data
                
                # Blockchain ile etkileşim (örnek)
                try:
                    w3 = get_web3_connection()
                    
                    # Burada gerçek NFT mint işlemi yapılacak
                    # Örnek için basit bir transaction hash döndürüyoruz
                    transaction_hash = "0x" + "0123456789abcdef" * 4
                    
                    # NFT'yi güncelle
                    cursor.execute("""
                        UPDATE UserNFTs
                        SET IsMinted = 1, TransactionHash = %s
                        WHERE UserNFTID = %s
                    """, [transaction_hash, user_nft_id])
                    
                    # Etkinlik logu ekle
                    cursor.execute("""
                        INSERT INTO ActivityLogs
                        (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
                        VALUES (%s, 'nft_minted', %s, GETDATE(), %s, %s)
                    """, [
                        user_id,
                        f"Minted NFT: {nft_title} (Transaction: {transaction_hash})",
                        request.META.get('REMOTE_ADDR', ''),
                        request.META.get('HTTP_USER_AGENT', '')
                    ])
                    
                    return Response({
                        'message': 'NFT minted successfully',
                        'transactionHash': transaction_hash
                    })
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
    
    with connection.cursor() as cursor:
        # Kullanıcının wallet adresini sıfırla
        cursor.execute("""
            UPDATE Users
            SET WalletAddress = NULL
            WHERE UserID = %s
        """, [user_id])
        
        # Etkinlik logu ekle
        cursor.execute("""
            INSERT INTO ActivityLogs
            (UserID, ActivityType, Description, Timestamp, IPAddress, UserAgent)
            VALUES (%s, 'wallet_disconnected', 'Wallet disconnected', GETDATE(), %s, %s)
        """, [
            user_id, 
            request.META.get('REMOTE_ADDR', ''),
            request.META.get('HTTP_USER_AGENT', '')
        ])
    
    return Response({'message': 'Wallet disconnected successfully'})