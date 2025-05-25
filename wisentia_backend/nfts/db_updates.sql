-- NFT System Database Updates for IPFS and Blockchain Integration

-- Check if columns exist and add if missing for blockchain NFT IDs
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'BlockchainNFTID' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD BlockchainNFTID INT NULL;
END

-- Add column for tracking if NFT has been traded
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'IsTraded' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD IsTraded BIT DEFAULT 0;
END

-- Add column for tracking when NFT was traded
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'TradeDate' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD TradeDate DATETIME NULL;
END

-- Add column for storing trade transaction hash
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'TradeTransactionHash' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD TradeTransactionHash NVARCHAR(100) NULL;
END

-- Add Rarity column to NFTs table if it doesn't exist
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'Rarity' AND Object_ID = Object_ID('NFTs'))
BEGIN
    ALTER TABLE NFTs ADD Rarity NVARCHAR(50) NULL;
END

-- Update existing NFTs with blank BlockchainMetadata if it's NULL
UPDATE NFTs
SET BlockchainMetadata = '{}'
WHERE BlockchainMetadata IS NULL;

-- Update NFTs with NULL Rarity to set a default value of 'Common'
UPDATE NFTs
SET Rarity = 'Common'
WHERE Rarity IS NULL;

-- Create index for faster lookups by blockchain NFT ID
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserNFTs_BlockchainNFTID' AND object_id = OBJECT_ID('UserNFTs'))
BEGIN
    CREATE INDEX IX_UserNFTs_BlockchainNFTID ON UserNFTs(BlockchainNFTID);
END

-- Create index for faster lookups by TransactionHash
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserNFTs_TransactionHash' AND object_id = OBJECT_ID('UserNFTs'))
BEGIN
    CREATE INDEX IX_UserNFTs_TransactionHash ON UserNFTs(TransactionHash);
END

-- Fix SubscriptionPlans table - ensure NFTID is properly set
-- First check if any NULL NFTIDs exist and print warning
DECLARE @NullNFTIDs INT;
SELECT @NullNFTIDs = COUNT(*) FROM SubscriptionPlans WHERE NFTID IS NULL;
IF @NullNFTIDs > 0
BEGIN
    PRINT 'WARNING: ' + CAST(@NullNFTIDs AS VARCHAR) + ' subscription plans found with NULL NFTID values.';
END

-- Create index for faster lookups by NFTID in SubscriptionPlans
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SubscriptionPlans_NFTID' AND object_id = OBJECT_ID('SubscriptionPlans'))
BEGIN
    CREATE INDEX IX_SubscriptionPlans_NFTID ON SubscriptionPlans(NFTID);
END

-- Create index for faster lookups by NFTID in UserSubscriptions
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserSubscriptions_NFTID' AND object_id = OBJECT_ID('UserSubscriptions'))
BEGIN
    CREATE INDEX IX_UserSubscriptions_NFTID ON UserSubscriptions(NFTID);
END

-- Create index for faster lookups by UserNFTID in UserSubscriptions
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserSubscriptions_UserNFTID' AND object_id = OBJECT_ID('UserSubscriptions'))
BEGIN
    CREATE INDEX IX_UserSubscriptions_UserNFTID ON UserSubscriptions(UserNFTID);
END

-- Check for foreign key constraint between SubscriptionPlans and NFTs
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SubscriptionPlans_NFTs' AND parent_object_id = OBJECT_ID('SubscriptionPlans'))
BEGIN
    -- Run this if you want to add a foreign key constraint
    -- WARNING: This may fail if there are existing NULL or invalid NFTID values
    -- PRINT 'Adding foreign key constraint from SubscriptionPlans.NFTID to NFTs.NFTID';
    -- ALTER TABLE SubscriptionPlans ADD CONSTRAINT FK_SubscriptionPlans_NFTs FOREIGN KEY (NFTID) REFERENCES NFTs(NFTID);
    
    -- Instead, just log that this might be needed after fixing data issues
    PRINT 'Foreign key constraint FK_SubscriptionPlans_NFTs does not exist. Consider adding after fixing any data issues.';
END 