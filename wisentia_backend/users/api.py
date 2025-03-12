from django.db import connection
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .auth import generate_token
import json
import hashlib
import datetime

def dictfetchall(cursor):
    """Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """Kullanıcıların listesini döndürür"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserID, Username, Email, FirstName, LastName, EducationLevel, Points, CreatedAt
            FROM Users
        """)
        users = dictfetchall(cursor)
    return Response(users)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Belirli bir kullanıcının detaylarını döndürür"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserID, Username, Email, FirstName, LastName, DateOfBirth, 
                   EducationLevel, Points, WalletAddress, LastLoginAt, CreatedAt, UpdatedAt
            FROM Users
            WHERE UserID = %s
        """, [user_id])
        user = dictfetchall(cursor)
        
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(user[0])

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Yeni kullanıcı kaydı oluşturur"""
    data = request.data

    # Gerekli alanları kontrol et
    required_fields = ['username', 'email', 'password', 'education_level']
    for field in required_fields:
        if field not in data:
            return Response({"error": f"Missing required field: {field}"}, 
                            status=status.HTTP_400_BAD_REQUEST)

    # Kullanıcı adı ve email benzersiz olmalı
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) FROM Users WHERE Username = %s OR Email = %s
        """, [data['username'], data['email']])
        
        if cursor.fetchone()[0] > 0:
            return Response({"error": "Username or email already exists"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Şifreyi hash'le
        password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
        
        # Varsayılan değerler ekleyerek NULL hatasını engelle
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        date_of_birth = data.get('date_of_birth', None)
        wallet_address = data.get('wallet_address', '')  # NULL gelirse boş string ekle

        # Kullanıcıyı ekle
        cursor.execute("""
            INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, 
                               DateOfBirth, EducationLevel, WalletAddress, CreatedAt, UpdatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, [
            data['username'], 
            data['email'], 
            password_hash,
            first_name,
            last_name,
            date_of_birth,
            data['education_level'],
            wallet_address,
            datetime.datetime.now(),
            datetime.datetime.now()
        ])

        # En son eklenen ID'yi almak için ikinci bir sorgu çalıştır
        cursor.execute("SELECT @@IDENTITY;")
        user_id = cursor.fetchone()[0]

    return Response({"user_id": user_id, "message": "User registered successfully"}, 
                    status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Kullanıcı girişi yapar ve JWT token döndürür"""
    data = request.data  # DRF'nin native data parsing'i

    if 'email' not in data or 'password' not in data:
        return Response({"error": "Email and password are required"},
                        status=status.HTTP_400_BAD_REQUEST)

    # Kullanıcının girdiği şifreyi hash'le
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    print(f"🔹 Hashed Password: {password_hash}")  # Konsolda hash'i yazdır

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT UserID, Username, Email, FirstName, LastName, EducationLevel, Points, PasswordHash
            FROM Users
            WHERE Email = %s
        """, [data['email']])
        
        user = dictfetchall(cursor)

        if not user:
            print("❌ Kullanıcı bulunamadı!")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Kullanıcının hash'lenmiş şifresini al
        stored_password_hash = user[0]['PasswordHash']
        print(f"🔹 Stored Password Hash: {stored_password_hash}")  # Konsolda kayıtlı hash'i yazdır

        # Eğer hash'ler eşleşmiyorsa giriş başarısız olur
        if stored_password_hash != password_hash:
            print("❌ Şifreler eşleşmiyor!")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Son giriş zamanını güncelle
        cursor.execute("""
            UPDATE Users
            SET LastLoginAt = %s
            WHERE UserID = %s
        """, [datetime.datetime.now(), user[0]['UserID']])

    # JWT token oluştur
    token = generate_token(user[0]['UserID'])

    print(f"✅ API Login Yanıtı: {token}")  # Terminale dönen tokenı yazdır

    return Response({
        "user": user[0],
        "token": token
    })


# users/api.py dosyasına eklenecek yeni fonksiyonlar

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_wallet_address(request):
    """Kullanıcının cüzdan adresini günceller"""
    user_id = request.user.id
    data = request.data
    
    if 'wallet_address' not in data:
        return Response({"error": "Cüzdan adresi gerekli"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Ethereum cüzdan adresi formatını doğrula (0x ile başlayan 42 karakter)
    wallet_address = data['wallet_address']
    if not wallet_address.startswith('0x') or len(wallet_address) != 42:
        return Response({"error": "Geçersiz cüzdan adresi formatı"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Kullanıcı cüzdan adresini güncelle
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Users
                SET WalletAddress = %s
                WHERE UserID = %s
            """, [wallet_address, user_id])
        
        return Response({"message": "Cüzdan adresi başarıyla güncellendi"})
    except Exception as e:
        print(f"Cüzdan adresi güncelleme hatası: {e}")
        return Response({"error": "Cüzdan adresi güncellenirken bir hata oluştu"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

