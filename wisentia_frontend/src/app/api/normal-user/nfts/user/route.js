// src/app/api/normal-user/nfts/user/route.js
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
  
  // Token yoksa hata dön
  if (!token) {
    return NextResponse.json({ 
      error: 'Authentication required', 
      message: 'Please login to view your NFTs' 
    }, { status: 401 });
  }
  
  try {
    const response = await fetch('http://localhost:8000/api/nfts/user/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`User NFT API error: ${response.status}`);
      return NextResponse.json({ 
        error: `API Error: ${response.status}`,
        message: 'Could not fetch user NFTs'
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // API yanıtını frontend'in beklediği formata dönüştür
    const formattedData = data.map(nft => ({
      userNftId: nft.UserNFTID,
      nftId: nft.NFTID,
      title: nft.Title,
      description: nft.Description,
      imageUri: nft.ImageURI,
      type: nft.NFTType,
      acquisitionDate: nft.AcquisitionDate,
      expiryDate: nft.ExpiryDate,
      isMinted: nft.IsMinted === 1 || nft.IsMinted === true,
      transactionHash: nft.TransactionHash,
      rarity: nft.Rarity || 'Common',
      collection: nft.Collection || 'General',
      tradeValue: nft.TradeValue
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error(`User NFT API call error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
}