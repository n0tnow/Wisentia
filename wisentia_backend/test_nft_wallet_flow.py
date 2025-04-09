import requests
import json
import time

# API URL'leri
BASE_URL = "http://localhost:8000/api"
LOGIN_URL = f"{BASE_URL}/auth/login/"
CONNECT_WALLET_URL = f"{BASE_URL}/wallet/connect/"
WALLET_INFO_URL = f"{BASE_URL}/wallet/info/"
USER_NFTS_URL = f"{BASE_URL}/nfts/user/"
MINT_NFT_URL = f"{BASE_URL}/nfts/mint/"  # + user_nft_id

# Test kullanıcı bilgileri (değiştirin)
user_credentials = {
    "email": "admin@wisentia.com",
    "password": "Admin123!"
}

# Test wallet adresi (Ethereum formatında)
test_wallet = {
    "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    "network": "educhain"
}

# 1. Giriş işlemi ve token alma
print("\n1. Giriş Testi")
login_response = requests.post(LOGIN_URL, json=user_credentials)
if login_response.status_code == 200:
    print("✅ Giriş başarılı")
    login_data = login_response.json()
    access_token = login_data['tokens']['access']
    headers = {"Authorization": f"Bearer {access_token}"}
else:
    print(f"❌ Giriş başarısız: {login_response.text}")
    exit(1)

# 2. Wallet bağlama
print("\n2. Wallet Bağlama Testi")
connect_response = requests.post(CONNECT_WALLET_URL, json=test_wallet, headers=headers)
if connect_response.status_code == 200:
    print("✅ Wallet başarıyla bağlandı")
    wallet_data = connect_response.json()
    print(f"Bağlanan adres: {wallet_data['address']}")
else:
    print(f"❌ Wallet bağlama başarısız: {connect_response.text}")

# 3. Wallet bilgilerini alma
print("\n3. Wallet Bilgisi Testi")
wallet_info_response = requests.get(WALLET_INFO_URL, headers=headers)
if wallet_info_response.status_code == 200:
    print("✅ Wallet bilgisi başarıyla alındı")
    wallet_info = wallet_info_response.json()
    print(f"Bağlı: {wallet_info['connected']}")
    if wallet_info['connected']:
        print(f"Adres: {wallet_info['address']}")
        print(f"NFT Sayısı: {wallet_info['nftCount']}")
        if wallet_info.get('balance'):
            print(f"Bakiye: {wallet_info['balance']} ETH")
else:
    print(f"❌ Wallet bilgisi alma başarısız: {wallet_info_response.text}")

# 4. Kullanıcının NFT'lerini alma
print("\n4. Kullanıcı NFT'leri Testi")
nfts_response = requests.get(USER_NFTS_URL, headers=headers)
if nfts_response.status_code == 200:
    print("✅ NFT'ler başarıyla alındı")
    nfts = nfts_response.json()
    print(f"NFT Sayısı: {len(nfts)}")
    
    # Mint edilmemiş bir NFT bul
    unminted_nft = None
    for nft in nfts:
        if not nft['IsMinted']:
            unminted_nft = nft
            break
    
    if unminted_nft:
        user_nft_id = unminted_nft['UserNFTID']
        print(f"Mint edilmemiş NFT bulundu: ID: {user_nft_id}, Başlık: {unminted_nft['Title']}")
        
        # 5. NFT mint etme
        print(f"\n5. NFT Mint Etme Testi (NFT ID: {user_nft_id})")
        mint_data = {
            "transactionHash": "0x" + "a" * 64  # Sahte bir transaction hash
        }
        mint_response = requests.post(f"{MINT_NFT_URL}{user_nft_id}/", json=mint_data, headers=headers)
        if mint_response.status_code == 200:
            print("✅ NFT başarıyla mint edildi")
        else:
            print(f"❌ NFT mint etme başarısız: {mint_response.text}")
    else:
        print("⚠️ Mint edilmemiş NFT bulunamadı, mint testi atlanacak.")
else:
    print(f"❌ NFT'leri alma başarısız: {nfts_response.text}")

print("\nNFT ve Wallet Entegrasyonu Testi Tamamlandı!")