// app/api/admin/nfts/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Query parametrelerini al
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || 1;
  const pageSize = url.searchParams.get('pageSize') || 20;
  const search = url.searchParams.get('search') || '';
  const type = url.searchParams.get('type') || '';
  const rarity = url.searchParams.get('rarity') || '';
  const status = url.searchParams.get('status') || '';
  
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
    
    // Token information available
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Query parametrelerini oluştur
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      search,
      type,
      rarity,
      status,
      admin: true  // Admin görünümü için özel parametre
    });
    
    // Backend API URL - Available NFTs endpoint'ini kullanıyoruz
    const backendUrl = `http://localhost:8000/api/nfts/available/?${queryParams.toString()}`;
    // Send request to backend API
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      cache: 'no-store'
    });
    
    // Response received from backend
    
    if (!response.ok) {
      // Hata durumunu yönet
      console.error('Backend API hatası:', response.status);
      
      const responseText = await response.text();
      
      // HTML yanıt kontrolü
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html')) {
        console.error('HTML yanıtı alındı');
        return NextResponse.json(
          { error: 'Backend kimlik doğrulama hatası. Lütfen tekrar giriş yapın.' },
          { status: response.status }
        );
      }
      
      try {
        // JSON yanıtı dene
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        // JSON parse edilemiyorsa text olarak
        return NextResponse.json(
          { error: 'API hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al
    const data = await response.json();
    // Successfully received response
    
    // Process the NFT data to ensure consistent format
    const processedNfts = Array.isArray(data) ? data : (data.nfts || data.results || []);
    
    // Fix image URIs and normalize data structure
    const normalizedNfts = processedNfts.map(nft => {
      // Handle image URI paths
      let imageUri = nft.ImageURI || nft.imageUri || nft.ImageURL || nft.imageUrl;
      if (imageUri && imageUri.startsWith('/media')) {
        imageUri = `http://localhost:8000${imageUri}`;
      }
      
      // Extract rarity from blockchain metadata if available
      let rarity = nft.Rarity || nft.rarity || 'Common';
      
      if (nft.BlockchainMetadata) {
        try {
          // Parse the blockchain metadata if it's a string
          const metadata = typeof nft.BlockchainMetadata === 'string' 
            ? JSON.parse(nft.BlockchainMetadata) 
            : nft.BlockchainMetadata;
          
          // Check for rarity in different possible locations within metadata
          if (metadata.attributes) {
            // Look for rarity in attributes array
            const rarityAttribute = metadata.attributes.find(
              attr => attr.trait_type?.toLowerCase() === 'rarity' || 
                     attr.trait_type?.toLowerCase() === 'tier'
            );
            
            if (rarityAttribute) {
              rarity = rarityAttribute.value;
            }
          }
          
          // Also check if rarity is directly specified in the metadata
          if (metadata.rarity) {
            rarity = metadata.rarity;
          }
          
          // Ensure proper capitalization
          rarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
        } catch (e) {
          console.warn('Could not parse BlockchainMetadata:', e);
        }
      }
      
      // Get proper owners count - fall back through different properties
      const ownersCount = nft.OwnersCount !== undefined 
                       ? Number(nft.OwnersCount) 
                       : (nft.ownersCount !== undefined 
                          ? Number(nft.ownersCount) 
                          : (nft.OwnedCount !== undefined 
                             ? Number(nft.OwnedCount) 
                             : 0));
      
      return {
        NFTID: nft.NFTID || nft.nftId,
        Title: nft.Title || nft.title,
        Description: nft.Description || nft.description,
        ImageURI: imageUri,
        TradeValue: nft.TradeValue || nft.tradeValue || nft.price || 0,
        SubscriptionDays: nft.SubscriptionDays || nft.subscriptionDays || 0,
        NFTTypeID: nft.NFTTypeID || nft.nftTypeId,
        NFTType: nft.NFTType || nft.type,
        Rarity: rarity,
        Collection: nft.Collection || nft.collection || 'General',
        CreationDate: nft.CreationDate || nft.creationDate,
        OwnersCount: ownersCount,
        IsActive: nft.IsActive === undefined 
          ? (nft.isActive === undefined ? true : nft.isActive) 
          : nft.IsActive === 1 || nft.IsActive === true
      };
    });
    
    // Yanıtı admin paneline uygun formatta yeniden yapılandır
    const formattedData = {
      nfts: normalizedNfts,
      totalCount: normalizedNfts.length
    };
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json(formattedData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}

// Tek bir NFT oluşturmak için POST isteği
export async function POST(request) {
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
    
    if (!token) {
      console.error('NFT creation failed: No authentication token found');
      return NextResponse.json(
        { error: 'Authentication required. Please log in again.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Request body'i al
    const requestData = await request.json();
    console.log('NFT creation request data:', JSON.stringify(requestData, null, 2));
    
    // Required fields check
    const requiredFields = ['title', 'description', 'imageUri', 'nftTypeId'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      console.error(`NFT creation failed: Missing required fields: ${missingFields.join(', ')}`);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Backend API URL - Mevcut create endpoint'ini kullanıyoruz
    const backendUrl = 'http://localhost:8000/api/nfts/create/';
    console.log(`Sending NFT creation request to backend: ${backendUrl}`);
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log(`Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`NFT creation failed with status ${response.status}:`, responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al
    const data = await response.json();
    console.log('NFT creation successful:', data);
    
    return NextResponse.json(data, {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('NFT creation API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}

// Belirli bir NFT'yi güncellemek için PUT isteği
export async function PUT(request) {
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // URL'den NFT ID'sini almak için
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const nftId = pathSegments[pathSegments.length - 1];
    
    if (!nftId || isNaN(parseInt(nftId))) {
      return NextResponse.json(
        { error: 'NFT ID gerekli', message: 'Valid NFT ID required' },
        { status: 400 }
      );
    }
    
    // Request body'i al
    const requestData = await request.json();
    
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/nfts/${nftId}/`;
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}

// Belirli bir NFT'yi silmek için DELETE isteği
export async function DELETE(request) {
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // URL'den NFT ID'sini almak için
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const nftId = pathSegments[pathSegments.length - 1];
    
    if (!nftId || isNaN(parseInt(nftId))) {
      return NextResponse.json(
        { error: 'NFT ID gerekli', message: 'Valid NFT ID required' },
        { status: 400 }
      );
    }
    
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/nfts/${nftId}/`;
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    return NextResponse.json(
      { success: true, message: 'NFT başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}