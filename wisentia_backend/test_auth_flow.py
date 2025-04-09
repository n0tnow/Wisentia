import requests
import json
import time

# API URL'leri
BASE_URL = "http://localhost:8000/api"
REGISTER_URL = f"{BASE_URL}/auth/register/"
LOGIN_URL = f"{BASE_URL}/auth/login/"
PROFILE_URL = f"{BASE_URL}/auth/profile/"
REFRESH_TOKEN_URL = f"{BASE_URL}/auth/refresh-token/"

# Test kullanıcı bilgileri
test_user = {
    "username": f"testuser_{int(time.time())}",  # Benzersiz kullanıcı adı
    "email": f"test_{int(time.time())}@example.com",
    "password": "TestPassword123!"
}

print(f"Test Kullanıcısı: {test_user['username']} / {test_user['email']}")

# 1. Kayıt İşlemi
print("\n1. Kayıt Testi")
register_response = requests.post(REGISTER_URL, json=test_user)
print(f"Durum Kodu: {register_response.status_code}")
if register_response.status_code == 201:
    print("✅ Kayıt başarılı")
    register_data = register_response.json()
    print(f"Kullanıcı ID: {register_data['user']['id']}")
    print(f"Token: {register_data['tokens']['access'][:30]}...")
else:
    print(f"❌ Kayıt başarısız: {register_response.text}")
    exit(1)

# 2. Giriş İşlemi
print("\n2. Giriş Testi")
login_data = {
    "email": test_user["email"],
    "password": test_user["password"]
}
login_response = requests.post(LOGIN_URL, json=login_data)
print(f"Durum Kodu: {login_response.status_code}")
if login_response.status_code == 200:
    print("✅ Giriş başarılı")
    login_data = login_response.json()
    access_token = login_data['tokens']['access']
    refresh_token = login_data['tokens']['refresh']
    print(f"Access Token: {access_token[:30]}...")
    print(f"Refresh Token: {refresh_token[:30]}...")
else:
    print(f"❌ Giriş başarısız: {login_response.text}")
    exit(1)

# 3. Profil Erişimi
print("\n3. Profil Erişim Testi")
headers = {"Authorization": f"Bearer {access_token}"}
profile_response = requests.get(PROFILE_URL, headers=headers)
print(f"Durum Kodu: {profile_response.status_code}")
if profile_response.status_code == 200:
    print("✅ Profil erişimi başarılı")
    profile_data = profile_response.json()
    print(f"Kullanıcı Adı: {profile_data['username']}")
    print(f"E-posta: {profile_data['email']}")
else:
    print(f"❌ Profil erişimi başarısız: {profile_response.text}")

# 4. Token Yenileme
print("\n4. Token Yenileme Testi")
refresh_data = {"refresh_token": refresh_token}
refresh_response = requests.post(REFRESH_TOKEN_URL, json=refresh_data)
print(f"Durum Kodu: {refresh_response.status_code}")
if refresh_response.status_code == 200:
    print("✅ Token yenileme başarılı")
    new_access_token = refresh_response.json()['access']
    print(f"Yeni Access Token: {new_access_token[:30]}...")
else:
    print(f"❌ Token yenileme başarısız: {refresh_response.text}")

# 5. Yeni Token ile Profil Erişimi
print("\n5. Yeni Token ile Profil Erişim Testi")
new_headers = {"Authorization": f"Bearer {new_access_token}"}
new_profile_response = requests.get(PROFILE_URL, headers=new_headers)
print(f"Durum Kodu: {new_profile_response.status_code}")
if new_profile_response.status_code == 200:
    print("✅ Yeni token ile profil erişimi başarılı")
else:
    print(f"❌ Yeni token ile profil erişimi başarısız: {new_profile_response.text}")

print("\nKayıt/Giriş Akışı Testi Tamamlandı!")