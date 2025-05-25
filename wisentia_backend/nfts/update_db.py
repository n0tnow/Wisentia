import os
import django
import sys
import logging
import pyodbc
from datetime import datetime, timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wisentia_backend.settings')
django.setup()

from django.conf import settings
from django.db import connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("db_update.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("db_updater")

def execute_sql_safely(cursor, sql, params=None):
    """Execute SQL query safely with error handling"""
    try:
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        return True
    except Exception as e:
        logger.error(f"SQL error: {e}")
        logger.error(f"Failed query: {sql}")
        if params:
            logger.error(f"Parameters: {params}")
        return False

def get_connection_string():
    """Get the SQL Server connection string from Django settings"""
    try:
        db_settings = settings.DATABASES['default']
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={db_settings['HOST']};"
            f"DATABASE={db_settings['NAME']};"
            f"UID={db_settings['USER']};"
            f"PWD={db_settings['PASSWORD']};"
        )
        return conn_str
    except Exception as e:
        logger.error(f"Failed to get connection string: {e}")
        return None

def fix_subscription_plans():
    """Fix NULL NFTID values in SubscriptionPlans table"""
    with connection.cursor() as cursor:
        # First check if any subscription plans have NULL NFTID
        cursor.execute("""
            SELECT COUNT(*) 
            FROM SubscriptionPlans 
            WHERE NFTID IS NULL OR NFTID = 0
        """)
        null_count = cursor.fetchone()[0]
        
        if null_count == 0:
            logger.info("No NULL NFTID values found in SubscriptionPlans table")
            return True
        
        logger.info(f"Found {null_count} subscription plans with NULL NFTID values")
        
        # Try to match subscription plans with NFTs based on name and other attributes
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
            SELECT PlanID, NFTID, Title FROM NFTMatches
        """)
        
        matches = cursor.fetchall()
        fixed_count = 0
        
        for plan_id, nft_id, title in matches:
            logger.info(f"Matching PlanID {plan_id} with NFTID {nft_id} ({title})")
            result = execute_sql_safely(cursor, """
                UPDATE SubscriptionPlans
                SET NFTID = %s
                WHERE PlanID = %s
            """, [nft_id, plan_id])
            
            if result:
                fixed_count += 1
        
        logger.info(f"Fixed {fixed_count} out of {null_count} subscription plans")
        
        # For any remaining NULL values, check if we can find subscription NFTs without plans
        if fixed_count < null_count:
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
                SELECT 
                    p.PlanID,
                    n.NFTID,
                    n.Title,
                    p.PlanName
                FROM PlansWithoutNFTs p
                CROSS JOIN NFTsWithoutPlans n
                WHERE 
                    p.DurationDays = n.SubscriptionDays
                    OR ABS(p.Price - n.TradeValue) < 10  -- Price is similar
                ORDER BY p.PlanID
            """)
            
            potential_matches = cursor.fetchall()
            
            for plan_id, nft_id, nft_title, plan_name in potential_matches:
                logger.info(f"Potential match - PlanID {plan_id} ({plan_name}) with NFTID {nft_id} ({nft_title})")
                result = execute_sql_safely(cursor, """
                    UPDATE SubscriptionPlans
                    SET NFTID = %s
                    WHERE PlanID = %s AND (NFTID IS NULL OR NFTID = 0)
                """, [nft_id, plan_id])
                
                if result:
                    fixed_count += 1
                    
        return fixed_count > 0

def fix_user_subscriptions():
    """Fix UserSubscriptions table to ensure all entries have correct foreign keys"""
    with connection.cursor() as cursor:
        try:
            # Check for UserSubscriptions records that don't have a valid PlanID
            cursor.execute("""
                SELECT 
                    us.SubscriptionID, 
                    us.UserID, 
                    us.StartDate, 
                    us.EndDate,
                    us.PaymentTransactionID
                FROM UserSubscriptions us
                LEFT JOIN SubscriptionPlans sp ON us.PlanID = sp.PlanID
                WHERE us.PlanID IS NULL OR sp.PlanID IS NULL
            """)
            
            invalid_subscriptions = cursor.fetchall()
            fixed_count = 0
            
            for sub_id, user_id, start_date, end_date, transaction_id in invalid_subscriptions:
                logger.info(f"Fixing UserSubscription ID {sub_id} for User {user_id}")
                
                # Find an appropriate plan based on the subscription duration
                duration_days = None
                if start_date and end_date:
                    try:
                        duration_days = (end_date - start_date).days
                    except:
                        duration_days = 30  # Default to 30 days
                
                # First try to find an existing plan with matching duration
                if duration_days:
                    cursor.execute("""
                        SELECT TOP 1 PlanID
                        FROM SubscriptionPlans
                        WHERE DurationDays = %s AND IsActive = 1
                        ORDER BY PlanID
                    """, [duration_days])
                    
                    matching_plan = cursor.fetchone()
                    
                    if matching_plan:
                        plan_id = matching_plan[0]
                        logger.info(f"Found matching plan {plan_id} for subscription {sub_id}")
                        
                        result = execute_sql_safely(cursor, """
                            UPDATE UserSubscriptions
                            SET PlanID = %s
                            WHERE SubscriptionID = %s
                        """, [plan_id, sub_id])
                        
                        if result:
                            fixed_count += 1
                            continue
                
                # If no plan found or update failed, get the default active plan
                cursor.execute("""
                    SELECT TOP 1 PlanID
                    FROM SubscriptionPlans
                    WHERE IsActive = 1
                    ORDER BY PlanID
                """)
                
                default_plan = cursor.fetchone()
                
                if default_plan:
                    plan_id = default_plan[0]
                    logger.info(f"Using default plan {plan_id} for subscription {sub_id}")
                    
                    result = execute_sql_safely(cursor, """
                        UPDATE UserSubscriptions
                        SET PlanID = %s
                        WHERE SubscriptionID = %s
                    """, [plan_id, sub_id])
                    
                    if result:
                        fixed_count += 1
            
            logger.info(f"Fixed {fixed_count} user subscriptions with invalid PlanID")
            return fixed_count > 0
            
        except Exception as e:
            logger.error(f"Error fixing user subscriptions: {e}")
            return False

def repair_subscription_records():
    """Manually repair subscription records for NFT purchases"""
    logger.info("Starting subscription record repair process...")
    
    with connection.cursor() as cursor:
        try:
            # Find UserNFTs for subscription NFTs that don't have matching UserSubscription records
            cursor.execute("""
                SELECT 
                    un.UserNFTID, 
                    un.UserID, 
                    un.NFTID, 
                    un.AcquisitionDate, 
                    un.ExpiryDate,
                    n.Title,
                    n.SubscriptionDays
                FROM UserNFTs un
                JOIN NFTs n ON un.NFTID = n.NFTID
                WHERE n.NFTTypeID = 2  -- Subscription type
                AND NOT EXISTS (
                    SELECT 1 
                    FROM UserSubscriptions us 
                    WHERE us.UserNFTID = un.UserNFTID
                )
            """)
            
            missing_subscriptions = cursor.fetchall()
            logger.info(f"Found {len(missing_subscriptions)} UserNFTs without matching UserSubscription records")
            
            created_count = 0
            for user_nft_id, user_id, nft_id, acquisition_date, expiry_date, title, sub_days in missing_subscriptions:
                logger.info(f"Processing UserNFT {user_nft_id} for User {user_id}, NFT: {title}")
                
                # Find the subscription plan for this NFT
                cursor.execute("""
                    SELECT PlanID 
                    FROM SubscriptionPlans 
                    WHERE NFTID = %s AND IsActive = 1
                """, [nft_id])
                
                plan_result = cursor.fetchone()
                
                if not plan_result:
                    logger.warning(f"No active subscription plan found for NFT {nft_id}")
                    # Try to create a subscription plan
                    try:
                        cursor.execute("""
                            SELECT TradeValue
                            FROM NFTs
                            WHERE NFTID = %s
                        """, [nft_id])
                        
                        trade_value_result = cursor.fetchone()
                        trade_value = trade_value_result[0] if trade_value_result else 0
                        
                        # Calculate tier
                        tier = "Basic"
                        if trade_value >= 300:
                            tier = "Pro"
                        elif trade_value >= 100:
                            tier = "Premium"
                        
                        # Create plan
                        duration_days = sub_days or 30
                        
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
                        
                        # Get the plan ID
                        cursor.execute("SELECT SCOPE_IDENTITY()")
                        plan_id_result = cursor.fetchone()
                        
                        if plan_id_result and plan_id_result[0]:
                            plan_id = plan_id_result[0]
                            logger.info(f"Created new subscription plan ID {plan_id} for NFT {nft_id}")
                        else:
                            logger.error(f"Failed to create plan for NFT {nft_id}")
                            continue
                    except Exception as e:
                        logger.error(f"Error creating plan: {str(e)}")
                        continue
                else:
                    plan_id = plan_result[0]
                
                # Now create the UserSubscription record
                try:
                    # Use a transaction to ensure both INSERT and ID retrieval work
                    with connection.cursor() as sub_cursor:
                        # First the insert - without UserNFTID
                        sub_cursor.execute("""
                            INSERT INTO UserSubscriptions 
                            (UserID, PlanID, StartDate, EndDate, IsActive, PaymentMethod, PaymentTransactionID)
                            VALUES (%s, %s, %s, %s, 1, 'NFT Purchase', 'manual_repair')
                        """, [
                            user_id, 
                            plan_id, 
                            acquisition_date or datetime.now(),
                            expiry_date or (datetime.now() + timedelta(days=sub_days or 30))
                        ])
                        
                        # Commit to ensure the insert is completed before querying
                        connection.commit()
                        
                        # Now get the ID in a separate transaction
                        sub_cursor.execute("""
                            SELECT TOP 1 SubscriptionID 
                            FROM UserSubscriptions 
                            WHERE UserID = %s AND PlanID = %s
                            ORDER BY SubscriptionID DESC
                        """, [user_id, plan_id])
                        
                        sub_id_result = sub_cursor.fetchone()
                        
                        if sub_id_result:
                            logger.info(f"Created UserSubscription with ID {sub_id_result[0]} for UserNFT {user_nft_id}")
                            created_count += 1
                        else:
                            logger.warning(f"Created UserSubscription but couldn't retrieve ID for UserNFT {user_nft_id}")
                            created_count += 1
                except Exception as e:
                    logger.error(f"Error creating UserSubscription: {str(e)}")
            
            logger.info(f"Created {created_count} UserSubscription records out of {len(missing_subscriptions)} missing")
            return created_count
        
        except Exception as e:
            logger.error(f"Error repairing subscription records: {str(e)}")
            return 0

def main():
    """Main function to run database updates"""
    logger.info("Starting database update process...")
    
    # Fix subscription plans with NULL NFTID
    logger.info("Fixing SubscriptionPlans with NULL NFTID values...")
    plans_fixed = fix_subscription_plans()
    
    # Fix user subscriptions with NULL or invalid PlanID
    logger.info("Fixing UserSubscriptions with invalid PlanID...")
    subs_fixed = fix_user_subscriptions()
    
    # Repair missing subscription records
    logger.info("Repairing missing subscription records...")
    records_created = repair_subscription_records()
    
    if plans_fixed or subs_fixed or records_created:
        logger.info(f"Database updates completed successfully: {plans_fixed} plans fixed, {subs_fixed} subscriptions fixed, {records_created} records created")
    else:
        logger.info("No database updates required")
    
if __name__ == "__main__":
    main() 