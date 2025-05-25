-- Wisentia NFT Database Fixes

PRINT 'Starting database fixes...';

-- 1. Fix NULL NFTID values in SubscriptionPlans table
PRINT 'Checking SubscriptionPlans with NULL NFTID values...';

DECLARE @NullNftIdCount INT;
SELECT @NullNftIdCount = COUNT(*) 
FROM SubscriptionPlans 
WHERE NFTID IS NULL OR NFTID = 0;

PRINT 'Found ' + CAST(@NullNftIdCount AS VARCHAR) + ' SubscriptionPlans with NULL NFTID values';

IF @NullNftIdCount > 0
BEGIN
    -- First attempt: Match subscription plans with NFTs based on name and other attributes
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
    JOIN NFTMatches nm ON sp.PlanID = nm.PlanID;

    -- Second attempt: Match based on duration and price
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
    WHERE sp.NFTID IS NULL OR sp.NFTID = 0;

    -- Check if there are still NULL values
    SELECT @NullNftIdCount = COUNT(*) 
    FROM SubscriptionPlans 
    WHERE NFTID IS NULL OR NFTID = 0;

    PRINT 'After fixes, ' + CAST(@NullNftIdCount AS VARCHAR) + ' SubscriptionPlans still have NULL NFTID values';
END

-- 2. Fix UserSubscriptions records with invalid PlanID
PRINT 'Checking UserSubscriptions with invalid PlanID...';

DECLARE @InvalidSubscriptionsCount INT;
SELECT @InvalidSubscriptionsCount = COUNT(*)
FROM UserSubscriptions us
LEFT JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
WHERE us.PlanID IS NULL OR sp.PlanID IS NULL;

PRINT 'Found ' + CAST(@InvalidSubscriptionsCount AS VARCHAR) + ' UserSubscriptions with invalid PlanID';

IF @InvalidSubscriptionsCount > 0
BEGIN
    -- Create a temporary table to store subscription fixes
    CREATE TABLE #SubscriptionFixes (
        SubscriptionID INT,
        NewPlanID INT
    );

    -- Find appropriate plan for each subscription based on NFTID from UserNFTs
    INSERT INTO #SubscriptionFixes (SubscriptionID, NewPlanID)
    SELECT 
        us.SubscriptionID,
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
    WHERE us.PlanID IS NULL OR sp.PlanID IS NULL;

    -- For subscriptions where we couldn't find a specific plan, use the default active plan
    UPDATE sf
    SET sf.NewPlanID = (
        SELECT TOP 1 PlanID FROM SubscriptionPlans WHERE IsActive = 1 ORDER BY PlanID
    )
    FROM #SubscriptionFixes sf
    WHERE sf.NewPlanID IS NULL;

    -- Update UserSubscriptions with the new PlanIDs
    UPDATE us
    SET us.PlanID = sf.NewPlanID
    FROM UserSubscriptions us
    JOIN #SubscriptionFixes sf ON us.SubscriptionID = sf.SubscriptionID
    WHERE sf.NewPlanID IS NOT NULL;

    -- Clean up
    DROP TABLE #SubscriptionFixes;
END

-- 3. Fix UserSubscriptions where UserNFTID is NULL
PRINT 'Checking UserSubscriptions with NULL UserNFTID...';

DECLARE @NullUserNftIdCount INT;
SELECT @NullUserNftIdCount = COUNT(*)
FROM UserSubscriptions us
WHERE us.UserNFTID IS NULL;

PRINT 'Found ' + CAST(@NullUserNftIdCount AS VARCHAR) + ' UserSubscriptions with NULL UserNFTID';

IF @NullUserNftIdCount > 0
BEGIN
    -- Create a temporary table for matches
    CREATE TABLE #UserNFTMatches (
        SubscriptionID INT,
        UserNFTID INT
    );

    -- Match UserNFTIDs based on NFTID from the plan
    INSERT INTO #UserNFTMatches (SubscriptionID, UserNFTID)
    SELECT 
        us.SubscriptionID,
        (
            -- Match based on NFTID from the plan and the user
            SELECT TOP 1 un.UserNFTID
            FROM UserNFTs un
            JOIN SubscriptionPlans sp ON un.NFTID = sp.NFTID
            WHERE sp.PlanID = us.PlanID
            AND un.UserID = us.UserID
            ORDER BY un.AcquisitionDate DESC
        ) AS MatchedUserNFTID
    FROM UserSubscriptions us
    WHERE us.UserNFTID IS NULL;

    -- Update subscriptions with the matched UserNFTID
    UPDATE us
    SET us.UserNFTID = unm.UserNFTID
    FROM UserSubscriptions us
    JOIN #UserNFTMatches unm ON us.SubscriptionID = unm.SubscriptionID
    WHERE unm.UserNFTID IS NOT NULL;

    -- Clean up
    DROP TABLE #UserNFTMatches;
    
    -- After updates, count how many are still NULL
    SELECT @NullUserNftIdCount = COUNT(*)
    FROM UserSubscriptions us
    WHERE us.UserNFTID IS NULL;
    
    PRINT 'After fixes, ' + CAST(@NullUserNftIdCount AS VARCHAR) + ' UserSubscriptions still have NULL UserNFTID';
END

-- 4. Fix UserNFTs where BlockchainNFTID is NULL
PRINT 'Checking UserNFTs with NULL BlockchainNFTID...';

-- For simplicity, set the BlockchainNFTID equal to the NFTID where it's NULL
UPDATE un
SET un.BlockchainNFTID = un.NFTID
FROM UserNFTs un
WHERE (un.BlockchainNFTID IS NULL OR un.BlockchainNFTID = 0)
    AND un.NFTID IS NOT NULL;

-- 5. Check for purchased NFTs without corresponding UserSubscriptions
PRINT 'Checking for purchased NFTs without corresponding UserSubscriptions...';

DECLARE @MissingSubscriptionsCount INT;
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
SELECT @MissingSubscriptionsCount = COUNT(*) FROM MissingSubscriptions;

PRINT 'Found ' + CAST(@MissingSubscriptionsCount AS VARCHAR) + ' subscription NFTs without UserSubscriptions';

IF @MissingSubscriptionsCount > 0
BEGIN
    -- Create UserSubscriptions for missing entries
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
    FROM MissingSubscriptions ms;
    
    PRINT 'Created missing UserSubscriptions records';
END

-- Check if UserNFTID column exists in UserSubscriptions table
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'UserSubscriptions' 
    AND COLUMN_NAME = 'UserNFTID'
)
BEGIN
    PRINT 'Adding UserNFTID column to UserSubscriptions table...'
    
    -- Add the UserNFTID column to UserSubscriptions table
    ALTER TABLE UserSubscriptions
    ADD UserNFTID INT NULL
    
    -- Add a foreign key constraint
    ALTER TABLE UserSubscriptions
    ADD CONSTRAINT FK_UserSubscriptions_UserNFTs
    FOREIGN KEY (UserNFTID) REFERENCES UserNFTs(UserNFTID)
    
    PRINT 'UserNFTID column added to UserSubscriptions table successfully'
END
ELSE
BEGIN
    PRINT 'UserNFTID column already exists in UserSubscriptions table'
END

-- Fix missing fields and constraints
IF COL_LENGTH('UserSubscriptions', 'PaymentTransactionID') IS NULL
BEGIN
    PRINT 'Adding PaymentTransactionID column to UserSubscriptions table...'
    ALTER TABLE UserSubscriptions
    ADD PaymentTransactionID NVARCHAR(255) NULL
END

IF COL_LENGTH('UserSubscriptions', 'AutoRenew') IS NULL
BEGIN
    PRINT 'Adding AutoRenew column to UserSubscriptions table...'
    ALTER TABLE UserSubscriptions
    ADD AutoRenew BIT DEFAULT 0 NOT NULL
END

-- Update existing UserSubscriptions records that don't have UserNFTID
-- Link them to UserNFTs based on user and NFT ID
UPDATE us
SET us.UserNFTID = un.UserNFTID
FROM UserSubscriptions us
JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
JOIN UserNFTs un ON un.NFTID = sp.NFTID AND un.UserID = us.UserID
WHERE us.UserNFTID IS NULL
AND EXISTS (
    SELECT 1 
    FROM UserNFTs un2 
    WHERE un2.NFTID = sp.NFTID 
    AND un2.UserID = us.UserID
)

-- Print update statistics
DECLARE @UpdatedCount INT
SELECT @UpdatedCount = @@ROWCOUNT
PRINT CAST(@UpdatedCount AS VARCHAR) + ' UserSubscriptions records updated with UserNFTID'

PRINT 'Database fix script completed';

PRINT 'Completion time: ' + CONVERT(VARCHAR, GETDATE(), 126) + '|'; 