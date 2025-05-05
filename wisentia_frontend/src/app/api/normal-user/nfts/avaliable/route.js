// src/app/api/normal-user/nfts/available/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Token bilgisini al
  let token = '';
  try {
    // Önce Authorization header'ından token'ı almaya çalış
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Cookie'den token kontrolü
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token access error:', error);
  }
  
  try {
    // Abonelik planlarını her zaman getir (giriş yapmış olmak gerekmez)
    const plansResponse = await fetch('http://localhost:8000/api/subscriptions/plans/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // NFT'leri getir (token varsa)
    let nftsResponse = null;
    if (token) {
      try {
        nftsResponse = await fetch('http://localhost:8000/api/nfts/available/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      } catch (nftError) {
        console.error('Failed to fetch available NFTs:', nftError);
      }
    }
    
    // Tüm verileri birleştir
    const combinedData = [];
    
    // Abonelik planlarından NFT'leri ekle
    if (plansResponse.ok) {
      const plans = await plansResponse.json();
      // Planları NFT formatına dönüştür ve ekle
      plans.forEach(plan => {
        combinedData.push({
          nftId: plan.NFTID || `plan-${plan.PlanID}`, // Eğer NFTID varsa kullan yoksa geçici ID oluştur
          title: plan.PlanName,
          description: plan.Description || `Subscription plan for ${plan.DurationDays} days`,
          imageUri: plan.NFTImage || '/placeholder-subscription.png',
          type: 'subscription',
          rarity: getSubscriptionRarity(plan.Price),
          collection: 'Subscription Plans',
          price: plan.Price,
          subscriptionDays: plan.DurationDays,
          isPublic: true,
          planId: plan.PlanID
        });
      });
    }
    
    // Normal NFT'leri ekle (eğer varsa)
    if (nftsResponse && nftsResponse.ok) {
      const nfts = await nftsResponse.json();
      nfts.forEach(nft => {
        // Aynı ID ile zaten eklenmiş bir abonelik NFT'si yoksa ekle
        if (!combinedData.some(item => item.nftId === nft.NFTID)) {
          combinedData.push({
            nftId: nft.NFTID,
            title: nft.Title,
            description: nft.Description,
            imageUri: nft.ImageURI,
            type: nft.NFTType,
            rarity: nft.Rarity || 'Common',
            collection: nft.Collection || 'General',
            tradeValue: nft.TradeValue,
            isPublic: true
          });
        }
      });
    }
    
    // Hiç veri yoksa mock veri göster
    if (combinedData.length === 0) {
      return NextResponse.json([
        {
          nftId: 1001,
          title: 'Annual Subscription',
          description: 'Access to premium features for 365 days with special benefits.',
          imageUri: '/placeholder-nft7.jpg',
          type: 'subscription',
          rarity: 'Epic',
          collection: 'Subscriptions',
          price: 299.99,
          subscriptionDays: 365,
          isPublic: true
        },
        {
          nftId: 1002,
          title: 'Premium Subscription',
          description: 'Access to premium features for 30 days.',
          imageUri: '/placeholder-nft4.jpg',
          type: 'subscription',
          rarity: 'Uncommon',
          collection: 'Subscriptions',
          price: 29.99,
          subscriptionDays: 30,
          isPublic: true
        }
      ]);
    }
    
    return NextResponse.json(combinedData);
    
  } catch (error) {
    console.error('API call error:', error);
    return NextResponse.json([]);
  }
}

// Fiyata göre abonelik NFT'si nadirliğini belirler
function getSubscriptionRarity(price) {
  if (price >= 200) return 'Legendary';
  if (price >= 100) return 'Epic';
  if (price >= 50) return 'Rare';
  if (price >= 20) return 'Uncommon';
  return 'Common';
}