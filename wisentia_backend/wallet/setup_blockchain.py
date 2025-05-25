"""
WisentiaCore blockchain entegrasyonu kurulum ve test scripti

Bu script, WisentiaCore akıllı sözleşmesiyle backend entegrasyonu için örnek gösterir
ve gerekli ayarları yapılandırır.

Kullanımı:
python manage.py shell < wallet/setup_blockchain.py
"""

import os
import sys
import logging
from django.core.management import setup_environ
from django.db import connection
from django.conf import settings
from dotenv import load_dotenv
from web3 import Web3

# Django ortamını yükle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import wisentia_backend.settings as settings_module
setup_environ(settings_module)

# Loglama yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('wisentia')

# .env dosyasını oku
load_dotenv()

from wallet.blockchain import BlockchainService, WISENTIA_CONTRACT_ADDRESS, WISENTIA_CONTRACT_ABI

def check_web3_connection():
    """Web3 bağlantısını kontrol et"""
    logger.info("Checking Web3 connection...")
    
    try:
        # BlockchainService nesnesini oluştur
        service = BlockchainService()
        
        # Bağlantıyı kontrol et
        if service.web3.is_connected():
            chain_id = service.web3.eth.chain_id
            block_number = service.web3.eth.block_number
            logger.info(f"Connected to blockchain network. Chain ID: {chain_id}, Latest block: {block_number}")
            return True
        else:
            logger.error("Failed to connect to blockchain network")
            return False
    except Exception as e:
        logger.error(f"Error checking Web3 connection: {str(e)}")
        return False

def check_contract_connection():
    """Akıllı sözleşme bağlantısını kontrol et"""
    logger.info(f"Checking contract connection at {WISENTIA_CONTRACT_ADDRESS}...")
    
    try:
        # BlockchainService nesnesini oluştur
        service = BlockchainService()
        
        # Bağlantıyı kontrol et
        admin_wallet = service.get_admin_wallet()
        admin_address = admin_wallet["address"]
        
        try:
            # Örnek bir okuma işlemi yap (has fonksiyonu)
            result = service.contract.functions.has(admin_address).call()
            logger.info(f"Contract connection successful. Admin {admin_address} has active subscription: {result}")
            return True
        except Exception as e:
            logger.error(f"Failed to call contract function: {str(e)}")
            return False
    except Exception as e:
        logger.error(f"Error checking contract connection: {str(e)}")
        return False

def setup_admin_wallet():
    """Admin cüzdan ayarlarını kontrol et ve yapılandır"""
    logger.info("Setting up admin wallet...")
    
    # Admin cüzdan bilgilerini kontrol et
    admin_address = os.getenv("ADMIN_WALLET_ADDRESS")
    admin_private_key = os.getenv("ADMIN_WALLET_PRIVATE_KEY")
    
    if not admin_address:
        logger.warning("ADMIN_WALLET_ADDRESS not set in environment variables")
        # Örnek bir adres göster
        logger.info("Please set ADMIN_WALLET_ADDRESS in your .env file")
        logger.info("Example: ADMIN_WALLET_ADDRESS=0xc9810b297bC5aAEBEd04Eb1D0862a75Db0D69a43")
    else:
        logger.info(f"Admin wallet address: {admin_address}")
    
    if not admin_private_key:
        logger.warning("ADMIN_WALLET_PRIVATE_KEY not set in environment variables")
        logger.info("Please set ADMIN_WALLET_PRIVATE_KEY in your .env file")
        logger.info("Example: ADMIN_WALLET_PRIVATE_KEY=your_private_key_here")
    else:
        logger.info("Admin wallet private key is set (not displaying for security)")
    
    return bool(admin_address and admin_private_key)

def setup_subscription_plans():
    """Abonelik planlarını veritabanında kontrol et ve gerekirse oluştur"""
    logger.info("Setting up subscription plans...")
    
    try:
        # Mevcut abonelik planlarını kontrol et
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*)
                FROM SubscriptionPlans
                WHERE PlanName IN ('Basic', 'Premium', 'Pro')
            """)
            
            count = cursor.fetchone()[0]
            
            if count < 3:
                logger.info("Creating subscription plans...")
                
                # Basic Plan
                cursor.execute("""
                    INSERT INTO SubscriptionPlans
                    (PlanName, Description, DurationDays, Price, Features, IsActive)
                    VALUES ('Basic', 'Basic subscription with essential features', 30, 0.01, 
                    '["Basic courses", "Community access", "Standard support"]', 1)
                """)
                
                # Premium Plan
                cursor.execute("""
                    INSERT INTO SubscriptionPlans
                    (PlanName, Description, DurationDays, Price, Features, IsActive)
                    VALUES ('Premium', 'Premium subscription with advanced features', 30, 0.03, 
                    '["All courses", "Community access", "Priority support", "Certificate of completion"]', 1)
                """)
                
                # Pro Plan
                cursor.execute("""
                    INSERT INTO SubscriptionPlans
                    (PlanName, Description, DurationDays, Price, Features, IsActive)
                    VALUES ('Pro', 'Professional subscription with all features', 60, 0.08, 
                    '["All courses", "Community access", "24/7 support", "Certificate of completion", "Mentor sessions", "Downloadable resources"]', 1)
                """)
                
                logger.info("Subscription plans created successfully")
            else:
                logger.info("Subscription plans already exist")
                
            # Planları göster
            cursor.execute("""
                SELECT PlanID, PlanName, DurationDays, Price
                FROM SubscriptionPlans
                WHERE IsActive = 1
                ORDER BY Price
            """)
            
            plans = cursor.fetchall()
            for plan in plans:
                logger.info(f"Plan {plan[0]}: {plan[1]}, {plan[2]} days, {plan[3]} ETH")
        
        return True
    except Exception as e:
        logger.error(f"Error setting up subscription plans: {str(e)}")
        return False

def run_demo():
    """Temel özellikleri gösteren bir demo çalıştır"""
    logger.info("Running blockchain integration demo...")
    
    try:
        # BlockchainService nesnesini oluştur
        service = BlockchainService()
        
        # Admin cüzdan bilgilerini al
        admin_wallet = service.get_admin_wallet()
        admin_address = admin_wallet["address"]
        
        # Admin hesabını kontrol et
        is_admin = service.web3.eth.contract(
            address=service.contract_address,
            abi=WISENTIA_CONTRACT_ABI
        ).functions.ia(admin_address).call()
        
        logger.info(f"Address {admin_address} is admin: {is_admin}")
        
        # Örnek bir kullanıcı hesabını kontrol et
        test_user_address = "0x0000000000000000000000000000000000000000"  # Gerçek bir adresle değiştirin
        
        # Kullanıcının abonelik durumunu kontrol et
        logger.info(f"Checking subscription status for {test_user_address}...")
        subscription_info = service.check_subscription_status(test_user_address)
        
        if subscription_info.get("hasSubscription", False):
            logger.info(f"User has an active {subscription_info['tier']} subscription")
            logger.info(f"Subscription ID: {subscription_info['subscriptionId']}")
            logger.info(f"Valid until: {subscription_info['endTime']}")
        else:
            logger.info("User does not have an active subscription")
            
    except Exception as e:
        logger.error(f"Error running demo: {str(e)}")

def main():
    """Ana fonksiyon"""
    logger.info("Starting WisentiaCore blockchain integration setup...")
    
    # Web3 bağlantısını kontrol et
    if not check_web3_connection():
        logger.error("Web3 connection failed, exiting...")
        return False
    
    # Akıllı sözleşme bağlantısını kontrol et
    if not check_contract_connection():
        logger.error("Contract connection failed, exiting...")
        return False
    
    # Admin cüzdan ayarlarını kontrol et
    setup_admin_wallet()
    
    # Abonelik planlarını kontrol et/oluştur
    setup_subscription_plans()
    
    # Demo çalıştır
    run_demo()
    
    logger.info("WisentiaCore blockchain integration setup completed")
    return True

if __name__ == "__main__":
    main() 