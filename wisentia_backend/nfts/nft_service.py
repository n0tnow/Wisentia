import os
import json
import logging
from django.db import connection, transaction
from django.conf import settings
from .ipfs import IPFSService
from wallet.blockchain import BlockchainService

logger = logging.getLogger('wisentia')

class NFTService:
    """
    NFT Service - Manages NFT operations including:
    - NFT minting with IPFS metadata storage
    - Integration with blockchain
    - Database updates
    """
    
    def __init__(self):        self.ipfs = IPFSService()                # Try to initialize blockchain service, but don't fail if it can't connect        try:            self.blockchain = BlockchainService(network="educhain")  # Use the educhain testnet            self.blockchain_available = True            logger.info("Blockchain service initialized successfully")        except Exception as e:            self.blockchain_available = False            logger.error(f"Failed to initialize blockchain service: {str(e)}")            logger.warning("Proceeding without blockchain connection - some features may be limited")                # Initialize directories if needed        self.media_dir = os.path.join(settings.MEDIA_ROOT, 'nft_images')        if not os.path.exists(self.media_dir):            os.makedirs(self.media_dir, exist_ok=True)                    logger.info("NFT Service initialized")
    
    def mint_nft(self, user_id, user_address, user_nft_id, title, description, attributes=None):
        """
        Mint an NFT with metadata stored on IPFS
        
        Args:
            user_id (int): User ID
            user_address (str): User's blockchain wallet address
            user_nft_id (int): The UserNFTID from the database
            title (str): NFT title
            description (str): NFT description
            attributes (list): Optional attributes list for metadata
            
        Returns:
            dict: Response with transaction details
        """
        try:
            # Get NFT details from database
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT un.UserNFTID, un.IsMinted, n.NFTID, n.Title, n.Description, n.ImageURI, 
                           n.TradeValue, nt.TypeName
                    FROM UserNFTs un
                    JOIN NFTs n ON un.NFTID = n.NFTID
                    JOIN NFTTypes nt ON n.NFTTypeID = nt.NFTTypeID
                    WHERE un.UserNFTID = %s AND un.UserID = %s
                """, [user_nft_id, user_id])
                
                nft_data = cursor.fetchone()
                if not nft_data:
                    return {
                        "success": False,
                        "error": "NFT not found or not owned by user"
                    }
                
                nft_id = nft_data[2]
                title = nft_data[3] or title
                description = nft_data[4] or description
                image_uri = nft_data[5]
                trade_value = nft_data[6] or 0
                nft_type = nft_data[7]
                
                # Check if NFT is already minted
                if nft_data[1]:
                    return {
                        "success": False,
                        "error": "NFT is already minted"
                    }
                
            # Path to local image file - may need adjustment based on your storage system
            if image_uri and image_uri.startswith('/media/'):
                image_path = os.path.join(settings.BASE_DIR, image_uri.lstrip('/'))
            else:
                image_path = os.path.join(settings.MEDIA_ROOT, image_uri) if image_uri else None
            
            # If we have a local image, upload it to IPFS
            ipfs_image_url = None
            if image_path and os.path.exists(image_path):
                image_upload = self.ipfs.upload_image(
                    image_path, 
                    name=f"Wisentia-{nft_type}-{title}"
                )
                
                if not image_upload["success"]:
                    logger.error(f"Failed to upload image to IPFS: {image_upload['error']}")
                    return {
                        "success": False,
                        "error": f"IPFS image upload failed: {image_upload['error']}"
                    }
                
                ipfs_image_url = image_upload["ipfs_uri"]
            elif image_uri and (image_uri.startswith('ipfs://') or image_uri.startswith('http')):
                # Already an IPFS or HTTP URI
                ipfs_image_url = image_uri
            else:
                # Fallback to a placeholder if no image available
                ipfs_image_url = "ipfs://QmSbtyNa6xLvYLdpvmHzAJc8Z8vkpFUDUAVcpkpLAxHdXK"  # Placeholder image
            
            # Prepare NFT metadata with dynamic attributes based on NFT type
            if not attributes:
                attributes = []
                
                # Add type-specific attributes
                attributes.append({
                    "trait_type": "Type", 
                    "value": nft_type
                })
                
                # Add subscription attributes if applicable
                if nft_type == "subscription":
                    attributes.append({
                        "trait_type": "Subscription Tier",
                        "value": "Basic" if trade_value < 100 else "Premium" if trade_value < 300 else "Pro"
                    })
                
                # Add tradable attribute
                tradable = nft_type != "achievement"  # Achievements typically aren't tradable
                attributes.append({
                    "trait_type": "Tradable",
                    "value": "Yes" if tradable else "No"
                })
                
                # Add trade value
                if trade_value > 0:
                    attributes.append({
                        "trait_type": "Trade Value",
                        "value": trade_value
                    })
            
            # Create and upload metadata to IPFS
            nft_metadata = self.ipfs.create_nft_metadata(
                name=title,
                description=description,
                image_url=ipfs_image_url,
                attributes=attributes,
                external_url=f"{settings.FRONTEND_URL}/nfts/{nft_id}"
            )
            
            metadata_upload = self.ipfs.upload_metadata(
                nft_metadata, 
                name=f"Wisentia-{nft_type}-{title}-Metadata"
            )
            
            if not metadata_upload["success"]:
                logger.error(f"Failed to upload metadata to IPFS: {metadata_upload['error']}")
                return {
                    "success": False,
                    "error": f"IPFS metadata upload failed: {metadata_upload['error']}"
                }
            
            # Mint NFT on blockchain
            mint_result = self.blockchain.mint_reward_nft(
                user_address=user_address,
                nft_title=title,
                tradable=tradable,  
                trade_value=trade_value,
                image_uri=metadata_upload["ipfs_uri"]  # Using metadata URI
            )
            
            if not mint_result["success"]:
                logger.error(f"Failed to mint NFT on blockchain: {mint_result['error']}")
                return {
                    "success": False,
                    "error": f"Blockchain minting failed: {mint_result['error']}"
                }
            
            # Update database with blockchain transaction info
            with connection.cursor() as cursor:
                # Update UserNFT record with blockchain data
                cursor.execute("""
                    UPDATE UserNFTs
                    SET IsMinted = 1, 
                        TransactionHash = %s,
                        BlockchainNFTID = %s
                    WHERE UserNFTID = %s
                """, [
                    mint_result["transactionHash"],
                    mint_result.get("nftId"),
                    user_nft_id
                ])
                
                # Update NFT with blockchain metadata
                blockchain_metadata = {
                    "ipfsUri": metadata_upload["ipfs_uri"],
                    "ipfsGateway": metadata_upload["gateway_url"],
                    "mintTransaction": mint_result["transactionHash"],
                    "blockchainNftId": mint_result.get("nftId"),
                }
                
                cursor.execute("""
                    UPDATE NFTs
                    SET BlockchainMetadata = %s
                    WHERE NFTID = %s
                """, [json.dumps(blockchain_metadata), nft_id])
                
                # Add notification
                cursor.execute("""
                    INSERT INTO Notifications
                    (UserID, Title, Message, NotificationType, RelatedEntityID, IsRead, IsDismissed, CreationDate)
                    VALUES (%s, 'NFT Minted', %s, 'achievement', %s, 0, 0, GETDATE())
                """, [
                    user_id,
                    f"Your NFT '{title}' has been minted to the blockchain successfully!",
                    nft_id
                ])
            
            # Return success with transaction details
            return {
                "success": True,
                "transactionHash": mint_result["transactionHash"],
                "blockchainNftId": mint_result.get("nftId"),
                "ipfsUri": metadata_upload["ipfs_uri"],
                "ipfsGateway": metadata_upload["gateway_url"]
            }
        
        except Exception as e:
            logger.error(f"Error in NFT minting process: {str(e)}")
            return {
                "success": False,
                "error": f"NFT minting failed: {str(e)}"
            }
    
    def create_nft_with_metadata(self, admin_id, title, description, image_path, nft_type_id, 
                               trade_value=0, subscription_days=None, attributes=None, rarity=None):
        """
        Create a new NFT with metadata stored on IPFS
        
        Args:
            admin_id (int): Admin user ID creating the NFT
            title (str): NFT title
            description (str): NFT description
            image_path (str): Path to image file
            nft_type_id (int): NFT type ID
            trade_value (int): Trade value for NFT
            subscription_days (int): Subscription days (for subscription NFTs)
            attributes (list): Optional attributes list for metadata
            rarity (str): NFT rarity level (common, uncommon, rare, epic, legendary)
            
        Returns:
            dict: Response with NFT details
        """
        try:
            # Verify admin permissions
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT UserRole FROM Users WHERE UserID = %s
                """, [admin_id])
                
                user_role = cursor.fetchone()[0]
                if user_role != 'admin':
                    return {
                        "success": False,
                        "error": "Only administrators can create NFTs"
                    }
                
                # Get NFT type information
                cursor.execute("""
                    SELECT TypeName FROM NFTTypes WHERE NFTTypeID = %s
                """, [nft_type_id])
                
                nft_type_data = cursor.fetchone()
                if not nft_type_data:
                    return {
                        "success": False,
                        "error": "Invalid NFT type"
                    }
                
                nft_type = nft_type_data[0]
            
            # Ensure rarity has a valid value
            if not rarity or rarity.lower() not in ["common", "uncommon", "rare", "epic", "legendary"]:
                # Set a default based on type/value if not provided
                if nft_type == "subscription":
                    if trade_value >= 300:
                        rarity = "legendary"
                    elif trade_value >= 100:
                        rarity = "rare"
                    else:
                        rarity = "common"
                else:
                    rarity = "common"
            else:
                rarity = rarity.lower()
            
            # Upload image to IPFS if it exists
            ipfs_image_url = None
            if image_path and os.path.exists(image_path):
                image_upload = self.ipfs.upload_image(
                    image_path, 
                    name=f"Wisentia-{nft_type}-{title}"
                )
                
                if not image_upload["success"]:
                    logger.error(f"Failed to upload image to IPFS: {image_upload['error']}")
                    return {
                        "success": False,
                        "error": f"IPFS image upload failed: {image_upload['error']}"
                    }
                
                ipfs_image_url = image_upload["ipfs_uri"]
                image_gateway_url = image_upload["gateway_url"]
            else:
                # Use provided image path or placeholder
                ipfs_image_url = image_path or "ipfs://QmSbtyNa6xLvYLdpvmHzAJc8Z8vkpFUDUAVcpkpLAxHdXK"
                image_gateway_url = None
            
            # Prepare NFT metadata with dynamic attributes based on NFT type
            if not attributes:
                attributes = []
            
            # Check if rarity already exists in attributes
            has_rarity = False
            for attr in attributes:
                if attr.get("trait_type", "").lower() == "rarity":
                    has_rarity = True
                    # Update the value to match our standardized rarity
                    attr["value"] = rarity.capitalize()
                    break
            
            # Add rarity if not already present
            if not has_rarity:
                attributes.append({
                    "trait_type": "Rarity",
                    "value": rarity.capitalize()
                })
            
            # Add type-specific attributes if not already in the list
            has_type = False
            for attr in attributes:
                if attr.get("trait_type", "").lower() == "type":
                    has_type = True
                    break
            
            if not has_type:
                attributes.append({
                    "trait_type": "Type", 
                    "value": nft_type
                })
                
            # Add subscription attributes if applicable and not already present
            if nft_type == "subscription":
                tier = "Basic"
                if trade_value >= 300:
                    tier = "Pro"
                elif trade_value >= 100:
                    tier = "Premium"
                
                has_tier = False
                for attr in attributes:
                    if attr.get("trait_type", "").lower() == "subscription tier":
                        has_tier = True
                        break
                
                if not has_tier:        
                    attributes.append({
                        "trait_type": "Subscription Tier",
                        "value": tier
                    })
                
                if subscription_days:
                    has_sub_length = False
                    for attr in attributes:
                        if attr.get("trait_type", "").lower() == "subscription length":
                            has_sub_length = True
                            break
                    
                    if not has_sub_length:
                        attributes.append({
                            "trait_type": "Subscription Length",
                            "value": f"{subscription_days} days"
                        })
            
            # Create and upload metadata to IPFS
            nft_metadata = self.ipfs.create_nft_metadata(
                name=title,
                description=description,
                image_url=ipfs_image_url,
                attributes=attributes
            )
            
            metadata_upload = self.ipfs.upload_metadata(
                nft_metadata, 
                name=f"Wisentia-{nft_type}-{title}-Metadata"
            )
            
            if not metadata_upload["success"]:
                logger.error(f"Failed to upload metadata to IPFS: {metadata_upload['error']}")
                return {
                    "success": False,
                    "error": f"IPFS metadata upload failed: {metadata_upload['error']}"
                }
            
            # Prepare blockchain metadata            
            blockchain_metadata = {
                "ipfsUri": metadata_upload["ipfs_uri"],
                "ipfsGateway": metadata_upload["gateway_url"],
                "imageIpfsUri": ipfs_image_url,
                "imageGateway": image_gateway_url,
                "rarity": rarity.capitalize()  # Always explicitly include rarity in the metadata
            }
            
            # NFT'yi transaction içinde oluştur
            with connection.cursor() as cursor:
                logger.info("ADIM 1: NFT kaydı oluşturuluyor...")
                
                # SQL Server için OUTPUT Inserted.NFTID kullanımı deneyelim
                try:
                    insert_sql = """
                        INSERT INTO NFTs
                        (NFTTypeID, Title, Description, ImageURI, BlockchainMetadata, 
                        TradeValue, SubscriptionDays, IsActive, Rarity)
                        OUTPUT Inserted.NFTID
                        VALUES (%s, %s, %s, %s, %s, %s, %s, 1, %s)
                    """
                    
                    params = [
                        nft_type_id,
                        title,
                        description,
                        ipfs_image_url,
                        json.dumps(blockchain_metadata),
                        trade_value,
                        subscription_days,
                        rarity.capitalize()
                    ]
                    
                    cursor.execute(insert_sql, params)
                    
                    # OUTPUT Inserted.NFTID kullanıldığında, ID doğrudan sonuç kümesinde olacaktır
                    result_row = cursor.fetchone()
                    if result_row and result_row[0]:
                        nft_id = result_row[0]
                        logger.info(f"BAŞARILI: OUTPUT ifadesi ile NFT oluşturuldu - ID: {nft_id}")
                    else:
                        # OUTPUT çalışmazsa, alternatif yöntemler deneyelim
                        logger.warning("OUTPUT ifadesi başarısız oldu, alternatif ID alma yöntemleri deneniyor...")
                        
                        # Alternatif 1: SCOPE_IDENTITY()
                        cursor.execute("SELECT SCOPE_IDENTITY()")
                        scope_id_result = cursor.fetchone()
                        
                        if scope_id_result and scope_id_result[0]:
                            nft_id = scope_id_result[0]
                            logger.info(f"BAŞARILI: SCOPE_IDENTITY() ile NFT ID alındı: {nft_id}")
                        else:
                            # Alternatif 2: @@IDENTITY 
                            cursor.execute("SELECT @@IDENTITY")
                            identity_result = cursor.fetchone()
                            
                            if identity_result and identity_result[0]:
                                nft_id = identity_result[0]
                                logger.info(f"BAŞARILI: @@IDENTITY ile NFT ID alındı: {nft_id}")
                            else:
                                # Alternatif 3: En son eklenen kaydı bul
                                cursor.execute("""
                                    SELECT TOP 1 NFTID FROM NFTs 
                                    WHERE Title = %s AND Description = %s
                                    ORDER BY NFTID DESC
                                """, [title, description])
                                
                                last_record = cursor.fetchone()
                                if last_record:
                                    nft_id = last_record[0]
                                    logger.info(f"BAŞARILI: En son kayıt sorgusu ile NFT ID alındı: {nft_id}")
                                else:
                                    logger.error("HATA: Hiçbir yöntemle NFT ID alınamadı!")
                                    return {
                                        "success": False,
                                        "error": "NFT oluşturuldu ancak ID alınamadı"
                                    }
                except Exception as e:
                    # OUTPUT ifadesi çalışmazsa, normal INSERT kullan
                    logger.warning(f"OUTPUT ifadesi hata verdi: {str(e)}, normal INSERT kullanılıyor...")
                    
                    # Normal INSERT işlemi
                    cursor.execute("""
                        INSERT INTO NFTs
                        (NFTTypeID, Title, Description, ImageURI, BlockchainMetadata, 
                        TradeValue, SubscriptionDays, IsActive, Rarity)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, 1, %s)
                    """, [
                        nft_type_id,
                        title,
                        description,
                        ipfs_image_url,
                        json.dumps(blockchain_metadata),
                        trade_value,
                        subscription_days,
                        rarity.capitalize()
                    ])
                    
                    # ID almak için alternatif yöntemler
                    cursor.execute("SELECT SCOPE_IDENTITY()")
                    scope_id_result = cursor.fetchone()
                    
                    if scope_id_result and scope_id_result[0]:
                        nft_id = scope_id_result[0]
                        logger.info(f"BAŞARILI: SCOPE_IDENTITY() ile NFT ID alındı: {nft_id}")
                    else:
                        # @@IDENTITY kullan
                        cursor.execute("SELECT @@IDENTITY")
                        identity_result = cursor.fetchone()
                        
                        if identity_result and identity_result[0]:
                            nft_id = identity_result[0]
                            logger.info(f"BAŞARILI: @@IDENTITY ile NFT ID alındı: {nft_id}")
                        else:
                            # En son eklenen kaydı bul
                            cursor.execute("""
                                SELECT TOP 1 NFTID FROM NFTs 
                                WHERE Title = %s AND Description = %s
                                ORDER BY NFTID DESC
                            """, [title, description])
                            
                            last_record = cursor.fetchone()
                            if last_record:
                                nft_id = last_record[0]
                                logger.info(f"BAŞARILI: En son kayıt sorgusu ile NFT ID alındı: {nft_id}")
                            else:
                                logger.error("HATA: Hiçbir yöntemle NFT ID alınamadı!")
                                return {
                                    "success": False,
                                    "error": "NFT oluşturuldu ancak ID alınamadı"
                                }
                    
                    # Eğer NFT ID'yi alabildiysel, etkinlik günlüğü oluştur
                    if nft_id:
                        cursor.execute("""
                            INSERT INTO ActivityLogs
                            (UserID, ActivityType, Description, Timestamp)
                            VALUES (%s, 'nft_created', %s, GETDATE())
                        """, [
                            admin_id,
                            f"Created {rarity.capitalize()} NFT '{title}' with IPFS metadata",
                        ])
            
            # İkinci adım: Abonelik planı oluşturma (sadece abonelik NFT'leri için)
            if nft_type == "subscription" and subscription_days and nft_id:
                try:
                    with connection.cursor() as cursor:
                        # Subscription tier hesapla
                        tier = "Basic"
                        if trade_value >= 300:
                            tier = "Pro"
                        elif trade_value >= 100:
                            tier = "Premium"
                        
                        logger.info(f"ADIM 2: NFTID={nft_id} için abonelik planı oluşturuluyor...")
                        
                        # Plan adı ve açıklaması
                        plan_name = f"{tier} {subscription_days}-Day Access"
                        plan_description = f"{tier} level subscription providing {subscription_days} days of premium access. {description}"
                        
                        # Parametreleri log ile yazdır
                        logger.info(f"Subscription Plan Parametreleri:")
                        logger.info(f"- NFTID: {nft_id}")
                        logger.info(f"- PlanName: {plan_name}")
                        logger.info(f"- DurationDays: {subscription_days}")
                        logger.info(f"- Price: {trade_value}")
                        
                        # OUTPUT ile planı oluşturmayı dene
                        try:
                            # OUTPUT kullanarak plan ID'yi doğrudan al
                            insert_sql = """
                                INSERT INTO SubscriptionPlans
                                (NFTID, PlanName, DurationDays, Price, Description, IsActive)
                                OUTPUT Inserted.PlanID
                                VALUES (%s, %s, %s, %s, %s, 1)
                            """
                            
                            params = [
                                nft_id,
                                plan_name,
                                subscription_days,
                                trade_value,
                                plan_description
                            ]
                            
                            cursor.execute(insert_sql, params)
                            result_row = cursor.fetchone()
                            
                            if result_row and result_row[0]:
                                plan_id = result_row[0]
                                logger.info(f"BAŞARILI: OUTPUT ifadesi ile abonelik planı oluşturuldu - Plan ID: {plan_id}")
                            else:
                                # Alternatif yöntemlerle ID almayı dene
                                cursor.execute("SELECT SCOPE_IDENTITY()")
                                scope_id_result = cursor.fetchone()
                                
                                if scope_id_result and scope_id_result[0]:
                                    plan_id = scope_id_result[0]
                                    logger.info(f"BAŞARILI: SCOPE_IDENTITY() ile plan ID alındı: {plan_id}")
                                else:
                                    cursor.execute("SELECT @@IDENTITY")
                                    identity_result = cursor.fetchone()
                                    
                                    if identity_result and identity_result[0]:
                                        plan_id = identity_result[0]
                                        logger.info(f"BAŞARILI: @@IDENTITY ile plan ID alındı: {plan_id}")
                                    else:
                                        logger.warning("Plan ID alınamadı, doğrulama yapılabilir")
                                        plan_id = None
                        except Exception as e:
                            logger.warning(f"OUTPUT ifadesi hata verdi: {str(e)}, normal INSERT kullanılıyor...")
                            
                            # Normal INSERT kullan
                            cursor.execute("""
                                INSERT INTO SubscriptionPlans
                                (NFTID, PlanName, DurationDays, Price, Description, IsActive)
                                VALUES (%s, %s, %s, %s, %s, 1)
                            """, [
                                nft_id,
                                plan_name,
                                subscription_days,
                                trade_value,
                                plan_description
                            ])
                            
                            # Plan ID'yi al
                            cursor.execute("SELECT SCOPE_IDENTITY()")
                            plan_id_result = cursor.fetchone()
                            
                            if plan_id_result and plan_id_result[0]:
                                plan_id = plan_id_result[0]
                                logger.info(f"BAŞARILI: Normal INSERT ile abonelik planı oluşturuldu - Plan ID: {plan_id}")
                            else:
                                logger.warning("Plan ID alınamadı, doğrulama yapılabilir")
                                plan_id = None
                        
                        # NFTID doğru ayarlandı mı kontrol et
                        if plan_id:
                            cursor.execute("SELECT NFTID FROM SubscriptionPlans WHERE PlanID = %s", [plan_id])
                            plan_nft_id = cursor.fetchone()
                            
                            if plan_nft_id:
                                if plan_nft_id[0] == nft_id:
                                    logger.info(f"DOĞRULAMA: NFTID doğru ayarlandı: {plan_nft_id[0]}")
                                else:
                                    logger.warning(f"UYARI: NFTID farklı: Beklenen={nft_id}, Gerçek={plan_nft_id[0]}")
                                    
                                    # NFTID'yi güncelle
                                    cursor.execute("""
                                        UPDATE SubscriptionPlans 
                                        SET NFTID = %s 
                                        WHERE PlanID = %s
                                    """, [nft_id, plan_id])
                                    logger.info(f"NFTID güncellemesi yapıldı")
                            else:
                                logger.warning("Plan bulundu ama NFTID bulunamadı")
                        else:
                            # Plan ID alınamadıysa en son eklenen planı kontrol et
                            cursor.execute("""
                                SELECT TOP 1 PlanID, NFTID FROM SubscriptionPlans 
                                WHERE PlanName = %s AND DurationDays = %s
                                ORDER BY PlanID DESC
                            """, [plan_name, subscription_days])
                            
                            last_plan = cursor.fetchone()
                            if last_plan:
                                plan_id = last_plan[0]
                                plan_nft_id = last_plan[1]
                                
                                logger.info(f"En son eklenen plan bulundu - Plan ID: {plan_id}")
                                
                                # NFTID'yi kontrol et
                                if plan_nft_id != nft_id:
                                    logger.warning(f"UYARI: NFTID farklı: Beklenen={nft_id}, Gerçek={plan_nft_id}")
                                    
                                    # NFTID'yi güncelle
                                    cursor.execute("""
                                        UPDATE SubscriptionPlans 
                                        SET NFTID = %s 
                                        WHERE PlanID = %s
                                    """, [nft_id, plan_id])
                                    logger.info(f"NFTID güncellemesi yapıldı")
                except Exception as e:
                    logger.error(f"Abonelik planı oluşturma hatası: {str(e)}")
                    # Abonelik oluşturma hatası NFT oluşturma başarısını etkilemez
                    # Sadece log kaydı tutalım
            
            # İşlem sonucunu dön
            return {
                "success": True,
                "nftId": nft_id,
                "title": title,
                "rarity": rarity.capitalize(),
                "ipfsUri": metadata_upload["ipfs_uri"],
                "ipfsGateway": metadata_upload["gateway_url"],
                "imageUri": ipfs_image_url
            }
            
        except Exception as e:
            logger.error(f"Error creating NFT with metadata: {str(e)}")
            return {
                "success": False,
                "error": f"NFT creation failed: {str(e)}"
            } 