import { NextResponse } from 'next/server';

// NFT type mapping functions
const mapTypeIdToString = (typeId) => {
  const typeMap = {
    1: 'achievement',
    2: 'subscription',
    3: 'quest_reward',
    4: 'course_completion'
  };
  return typeMap[typeId] || 'standard';
};

export async function GET(request) {
  // Token bilgisini al
  let token = '';
  try {
    // Authorization header'dan token kontrolü
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
  
  if (!token) {
    return NextResponse.json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access your NFTs'
    }, { status: 401 });
  }
  
  try {
    // Backend API'dan kullanıcının NFT'lerini getir
    const response = await fetch('http://localhost:8000/api/nfts/user/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`User NFTs API error: ${response.status}`);
      return NextResponse.json({ 
        error: `API Error: ${response.status}`,
        message: 'Could not fetch your NFTs'
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // NFT'leri düzenle
    const enhancedData = data.map(nft => {
      // Rarity ve diğer özellikleri BlockchainMetadata'dan çıkar
      let metadata = {};
      let collection = nft.Title || "";
      let rarity = "common";
      
      try {
        if (nft.BlockchainMetadata) {
          metadata = JSON.parse(nft.BlockchainMetadata);
          if (metadata.rarity) {
            rarity = metadata.rarity;
          }
          if (metadata.collection) {
            collection = metadata.collection;
          }
        }
      } catch (e) {
        console.error('Metadata parse error:', e);
      }
      
      // NFTTypeID veya NFTType'a göre varsayılan değerler ata
      if (!rarity) {
        if (nft.NFTTypeID === 2 || nft.NFTType === 'subscription') rarity = "legendary";
        else if (nft.NFTTypeID === 1 || nft.NFTType === 'achievement') rarity = "rare";
        else rarity = "common";
      }
      
      return {
        ...nft,
        rarity: rarity,
        collection: collection
      };
    });
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error(`User NFT API call error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
} 