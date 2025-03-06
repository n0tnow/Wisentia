from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
import datetime

def dictfetchall(cursor):
    """Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@api_view(['GET'])
@permission_classes([AllowAny])
def nft_list(request):
    """NFT'leri listeler, filtreleme seçenekleri ile"""
    category = request.query_params.get('category')
    rarity = request.query_params.get('rarity')
    buyable = request.query_params.get('buyable')
    
    query = """
        SELECT NFTID, Name, Description, ImageURL, Category, Rarity, 
               TokenValue, UnlockConditionType, UnlockConditionID, 
               UnlockLevel, MinimumPoints, Buyable
        FROM NFTs
        WHERE 1=1
    """
    params = []
    
    if category:
        query += " AND Category = %s"
        params.append(category)
    
    if rarity:
        query += " AND Rarity = %s"
        params.append(rarity)
        
    if buyable is not None:
        buyable_val = 1 if buyable.lower() == 'true' else 0
        query += " AND Buyable = %s"
        params.append(buyable_val)
    
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        nfts = dictfetchall(cursor)
    
    return Response(nfts)

@api_view(['GET'])
@permission_classes([AllowAny])
def nft_detail(request, nft_id):
    """Belirli bir NFT'nin detaylarını döndürür"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT NFTID, Name, Description, ImageURL, Category, Rarity, 
                   TokenValue, UnlockConditionType, UnlockConditionID, 
                   UnlockLevel, MinimumPoints, Buyable, CreatedAt
            FROM NFTs
            WHERE NFTID = %s
        """, [nft_id])
        
        nfts = dictfetchall(cursor)
        
        if not nfts:
            return Response({"error": "NFT not found"}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(nfts[0])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_nfts(request):
    """Oturum açmış kullanıcının NFT'lerini listeler"""
    user_id = request.user.id
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT n.NFTID, n.Name, n.Description, n.ImageURL, n.Category, n.Rarity, 
                   n.TokenValue, un.TokenID, un.AcquiredAt, un.TransactionHash
            FROM UserNFTs un
            JOIN NFTs n ON un.NFTID = n.NFTID
            WHERE un.UserID = %s
        """, [user_id])
        
        nfts = dictfetchall(cursor)
    
    return Response(nfts)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acquire_nft(request, nft_id):
    """Kullanıcının bir NFT kazanmasını sağlar (koşullar sağlanıyorsa)"""
    user_id = request.user.id
    token_id = request.data.get('token_id')
    transaction_hash = request.data.get('transaction_hash')
    
    with connection.cursor() as cursor:
        # NFT'nin var olup olmadığını kontrol et
        cursor.execute("""
            SELECT NFTID, TokenValue, UnlockConditionType, UnlockConditionID, 
                   UnlockLevel, MinimumPoints, Buyable
            FROM NFTs 
            WHERE NFTID = %s
        """, [nft_id])
        
        nft = dictfetchall(cursor)
        if not nft:
            return Response({"error": "NFT not found"}, status=status.HTTP_404_NOT_FOUND)
        
        nft = nft[0]
        
        # Kullanıcının bu NFT'yi zaten sahip olup olmadığını kontrol et
        cursor.execute("""
            SELECT COUNT(*) FROM UserNFTs 
            WHERE UserID = %s AND NFTID = %s
        """, [user_id, nft_id])
        
        if cursor.fetchone()[0] > 0:
            return Response({"error": "User already owns this NFT"}, status=status.HTTP_400_BAD_REQUEST)
        
        # NFT'nin kilidinin açılıp açılamayacağını kontrol et
        # Bu kısım NFT tipine göre farklı kontroller yapabilir
        # Örneğin: kurs tamamlama, görev tamamlama, puan eşiği
        
        # Kullanıcı bilgilerini al
        cursor.execute("""
            SELECT Points FROM Users WHERE UserID = %s
        """, [user_id])
        
        user = dictfetchall(cursor)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        user_points = user[0]['Points']
        
        # Puan kontrolü
        if nft['MinimumPoints'] > user_points:
            return Response({
                "error": "Not enough points", 
                "required": nft['MinimumPoints'], 
                "current": user_points
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Kurs tamamlama kontrolü
        if nft['UnlockConditionType'] == 1:  # Course
            course_id = nft['UnlockConditionID']
            cursor.execute("""
                SELECT IsCompleted FROM UserCourseProgress 
                WHERE UserID = %s AND CourseID = %s
            """, [user_id, course_id])
            
            course_progress = cursor.fetchone()
            if not course_progress or not course_progress[0]:
                return Response({"error": "Course completion required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Görev tamamlama kontrolü
        elif nft['UnlockConditionType'] == 2:  # Quest
            quest_id = nft['UnlockConditionID']
            cursor.execute("""
                SELECT IsCompleted FROM UserQuestProgress 
                WHERE UserID = %s AND QuestID = %s
            """, [user_id, quest_id])
            
            quest_progress = cursor.fetchone()
            if not quest_progress or not quest_progress[0]:
                return Response({"error": "Quest completion required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # NFT'yi kullanıcıya ekle
        cursor.execute("""
            INSERT INTO UserNFTs (UserID, NFTID, TokenID, AcquiredAt, TransactionHash)
            VALUES (%s, %s, %s, %s, %s)
        """, [
            user_id, nft_id, token_id, datetime.datetime.now(), transaction_hash
        ])
        
        # İşlemi kaydet
        cursor.execute("""
            INSERT INTO Transactions 
            (UserID, TransactionType, NFTID, Description, CreatedAt)
            VALUES (%s, %s, %s, %s, %s)
        """, [
            user_id, 3, nft_id, f"Acquired NFT: {nft['Name']}", datetime.datetime.now()
        ])
        
    return Response({"message": "NFT acquired successfully"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_nft(request, nft_id):
    """Kullanıcının bir NFT satın almasını sağlar"""
    user_id = request.user.id
    token_id = request.data.get('token_id')
    transaction_hash = request.data.get('transaction_hash')
    
    with connection.cursor() as cursor:
        # NFT'nin var olup olmadığını ve satın alınabilir olup olmadığını kontrol et
        cursor.execute("""
            SELECT NFTID, Name, TokenValue, Buyable
            FROM NFTs 
            WHERE NFTID = %s
        """, [nft_id])
        
        nft = dictfetchall(cursor)
        if not nft:
            return Response({"error": "NFT not found"}, status=status.HTTP_404_NOT_FOUND)
        
        nft = nft[0]
        
        if not nft['Buyable']:
            return Response({"error": "This NFT cannot be purchased"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Kullanıcının bu NFT'yi zaten sahip olup olmadığını kontrol et
        cursor.execute("""
            SELECT COUNT(*) FROM UserNFTs 
            WHERE UserID = %s AND NFTID = %s
        """, [user_id, nft_id])
        
        if cursor.fetchone()[0] > 0:
            return Response({"error": "User already owns this NFT"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Kullanıcının yeterli puanı olup olmadığını kontrol et
        cursor.execute("""
            SELECT Points FROM Users WHERE UserID = %s
        """, [user_id])
        
        user = dictfetchall(cursor)
        user_points = user[0]['Points']
        
        if user_points < nft['TokenValue']:
            return Response({
                "error": "Not enough points", 
                "required": nft['TokenValue'], 
                "current": user_points
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Puanları güncelle
        cursor.execute("""
            UPDATE Users
            SET Points = Points - %s
            WHERE UserID = %s
        """, [nft['TokenValue'], user_id])
        
        # NFT'yi kullanıcıya ekle
        cursor.execute("""
            INSERT INTO UserNFTs (UserID, NFTID, TokenID, AcquiredAt, TransactionHash)
            VALUES (%s, %s, %s, %s, %s)
        """, [
            user_id, nft_id, token_id, datetime.datetime.now(), transaction_hash
        ])
        
        # İşlemi kaydet
        cursor.execute("""
            INSERT INTO Transactions 
            (UserID, TransactionType, Amount, NFTID, Description, CreatedAt)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, [
            user_id, 2, nft['TokenValue'], nft_id, 
            f"Purchased NFT: {nft['Name']} for {nft['TokenValue']} points", 
            datetime.datetime.now()
        ])
        
    return Response({"message": "NFT purchased successfully"})