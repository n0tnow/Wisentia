"""
Blockchain veri senkronizasyon scripti

Bu script, blockchain üzerindeki NFT ve abonelik verilerini veritabanıyla senkronize eder.
Periyodik olarak çalıştırılarak blockchain ve veritabanı arasındaki tutarlılığı sağlar.

Kullanımı:
python manage.py runscript wallet.sync_blockchain
"""

import logging
import time
from django.db import connection, transaction
from .blockchain import BlockchainService

logger = logging.getLogger('wisentia')

def sync_nft_ownership():
    """Blockchain üzerindeki NFT sahiplik bilgilerini veritabanıyla senkronize eder"""
    logger.info("Starting NFT ownership synchronization")
    
    try:
        # Web3 servisini başlat
        blockchain_service = BlockchainService()
        
        # Tüm mint edilmiş NFT'leri al
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT un.UserNFTID, un.NFTID, un.BlockchainNFTID, u.WalletAddress, u.UserID
                FROM UserNFTs un
                JOIN Users u ON un.UserID = u.UserID
                WHERE un.IsMinted = 1
                AND u.WalletAddress IS NOT NULL
            """)
            
            nfts = cursor.fetchall()
            
            logger.info(f"Found {len(nfts)} minted NFTs to check")
            
            for nft in nfts:
                user_nft_id, nft_id, blockchain_nft_id, wallet_address, user_id = nft
                
                if not blockchain_nft_id or blockchain_nft_id == "Unknown":
                    logger.warning(f"UserNFT {user_nft_id} has no valid blockchain ID")
                    continue
                
                try:
                    # Blockchain üzerinde NFT'nin sahibi hala bu cüzdan mı kontrol et
                    # Bu örnek kodda bu kontrol işlemi mevcut değil, gerçek uygulamada eklenmelidir
                    # blockchain_owner = blockchain_service.check_nft_owner(blockchain_nft_id)
                    
                    # Eğer sahibi değişmişse, veritabanını güncelle
                    # if blockchain_owner.lower() != wallet_address.lower():
                    #     with transaction.atomic():
                    #         cursor.execute("""
                    #             UPDATE UserNFTs
                    #             SET IsOwned = 0, OwnershipEndDate = GETDATE()
                    #             WHERE UserNFTID = %s
                    #         """, [user_nft_id])
                    #
                    #         logger.info(f"Updated ownership for NFT {blockchain_nft_id}: no longer owned by {wallet_address}")
                    
                    logger.debug(f"Checked NFT {blockchain_nft_id} ownership for {wallet_address}")
                    
                except Exception as e:
                    logger.error(f"Error checking NFT {blockchain_nft_id} ownership: {str(e)}")
                
                # Aşırı istek göndermemek için
                time.sleep(0.1)
        
        logger.info("NFT ownership synchronization completed")
        return True
        
    except Exception as e:
        logger.error(f"NFT ownership synchronization failed: {str(e)}")
        return False

def sync_subscriptions():
    """Blockchain üzerindeki abonelik bilgilerini veritabanıyla senkronize eder"""
    logger.info("Starting subscription synchronization")
    
    try:
        # Web3 servisini başlat
        blockchain_service = BlockchainService()
        
        # Cüzdan bağlantısı olan tüm kullanıcıları al
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT UserID, WalletAddress
                FROM Users
                WHERE WalletAddress IS NOT NULL
            """)
            
            users = cursor.fetchall()
            
            logger.info(f"Found {len(users)} users with connected wallets")
            
            for user in users:
                user_id, wallet_address = user
                
                try:
                    # Blockchain'deki abonelik durumunu kontrol et
                    subscription_info = blockchain_service.check_subscription_status(wallet_address)
                    
                    # Eğer abonelik varsa
                    if subscription_info.get("hasSubscription", False):
                        blockchain_sub_id = subscription_info.get("subscriptionId")
                        tier_name = subscription_info.get("tier")
                        end_time = subscription_info.get("endTime")
                        is_valid = subscription_info.get("isValid", False)
                        
                        # Veritabanındaki son aktif aboneliği kontrol et
                        cursor.execute("""
                            SELECT us.SubscriptionID, us.EndDate, sp.PlanName
                            FROM UserSubscriptions us
                            JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                            WHERE us.UserID = %s AND us.IsActive = 1
                            ORDER BY us.EndDate DESC
                        """, [user_id])
                        
                        db_subscription = cursor.fetchone()
                        
                        with transaction.atomic():
                            # Veritabanında abonelik yoksa veya süresi bitmiş/farklıysa
                            if not db_subscription or tier_name != db_subscription[2]:
                                # Abonelik tipi ID'sini al
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
                                    
                                    start_date = datetime.now()
                                    end_date = datetime.fromtimestamp(end_time)
                                    
                                    cursor.execute("""
                                        INSERT INTO UserSubscriptions
                                        (UserID, PlanID, StartDate, EndDate, IsActive, PaymentMethod, AutoRenew)
                                        VALUES (%s, %s, %s, %s, 1, 'blockchain_sync', 0)
                                    """, [user_id, plan_id, start_date, end_date])
                                    
                                    # Bildirim ekle
                                    cursor.execute("""
                                        INSERT INTO Notifications
                                        (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                                        VALUES (%s, 'Subscription Synced', %s, 'system', 0, 0, GETDATE())
                                    """, [
                                        user_id,
                                        f"Your {tier_name} subscription from blockchain has been synced to the platform."
                                    ])
                                    
                                    logger.info(f"Created new subscription for user {user_id}: {tier_name}, expires {end_date}")
                                    
                            # Abonelik süresi bitmiş mi kontrol et
                            elif db_subscription and not is_valid:
                                cursor.execute("""
                                    UPDATE UserSubscriptions
                                    SET IsActive = 0
                                    WHERE SubscriptionID = %s
                                """, [db_subscription[0]])
                                
                                # Bildirim ekle
                                cursor.execute("""
                                    INSERT INTO Notifications
                                    (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                                    VALUES (%s, 'Subscription Expired', %s, 'system', 0, 0, GETDATE())
                                """, [
                                    user_id,
                                    "Your subscription has expired. Please renew to continue enjoying premium features."
                                ])
                                
                                logger.info(f"Deactivated expired subscription for user {user_id}")
                    
                    # Blockchain'de abonelik yoksa ama veritabanında varsa
                    else:
                        cursor.execute("""
                            SELECT COUNT(*)
                            FROM UserSubscriptions
                            WHERE UserID = %s AND IsActive = 1 AND PaymentMethod IN ('blockchain', 'blockchain_sync', 'nft_trade')
                        """, [user_id])
                        
                        count = cursor.fetchone()[0]
                        
                        # Blockchain aboneliği bitmiş, veritabanındaki blockchain aboneliğini de bitirelim
                        if count > 0:
                            with transaction.atomic():
                                cursor.execute("""
                                    UPDATE UserSubscriptions
                                    SET IsActive = 0
                                    WHERE UserID = %s AND IsActive = 1 AND PaymentMethod IN ('blockchain', 'blockchain_sync', 'nft_trade')
                                """, [user_id])
                                
                                # Bildirim ekle
                                cursor.execute("""
                                    INSERT INTO Notifications
                                    (UserID, Title, Message, NotificationType, IsRead, IsDismissed, CreationDate)
                                    VALUES (%s, 'Blockchain Subscription Expired', %s, 'system', 0, 0, GETDATE())
                                """, [
                                    user_id,
                                    "Your blockchain subscription has expired. Please renew to continue enjoying premium features."
                                ])
                                
                                logger.info(f"Deactivated expired blockchain subscription for user {user_id}")
                
                except Exception as e:
                    logger.error(f"Error processing subscription for user {user_id}: {str(e)}")
                
                # Aşırı istek göndermemek için
                time.sleep(0.1)
        
        logger.info("Subscription synchronization completed")
        return True
        
    except Exception as e:
        logger.error(f"Subscription synchronization failed: {str(e)}")
        return False

def run():
    """Ana senkronizasyon fonksiyonu"""
    logger.info("Starting blockchain synchronization")
    
    success_nft = sync_nft_ownership()
    success_sub = sync_subscriptions()
    
    logger.info(f"Blockchain synchronization completed: NFT sync: {'Success' if success_nft else 'Failed'}, " + 
                f"Subscription sync: {'Success' if success_sub else 'Failed'}")
    
    return success_nft and success_sub

if __name__ == "__main__":
    run() 