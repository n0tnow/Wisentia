// app/api/nfts/[id]/route.js
import { NextResponse } from 'next/server';

// Belirli bir NFT'yi getirmek için
export async function GET(request, { params }) {
  // Access params correctly using await
  const id = (await Promise.resolve(params)).id;
  
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Geçerli bir NFT ID\'si gerekli' },
      { status: 400 }
    );
  }
  
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
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Backend API URL - Belirli bir NFT'nin detaylarını alın
    const backendUrl = `http://localhost:8000/api/nfts/${id}/`;
    console.log(`Fetching NFT details from: ${backendUrl}`);
    
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
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      // Hata durumunu yönet
      console.error('Backend API error:', response.status);
      
      const responseText = await response.text();
      console.error('Error response text:', responseText.substring(0, 500));
      
      // If we get a 404, try to fetch from the admin endpoint as fallback
      if (response.status === 404) {
        console.log('Trying admin endpoint as fallback');
        const adminUrl = `http://localhost:8000/api/admin/nfts/${id}/`;
        
        const adminResponse = await fetch(adminUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          cache: 'no-store'
        });
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          console.log('Successfully retrieved NFT data from admin endpoint');
          
          // Process and return the admin data
          return processAndReturnNFTData(adminData);
        }
      }
      
      try {
        // JSON yanıtı dene
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        // JSON parse edilemiyorsa text olarak
        return NextResponse.json(
          { error: 'API error', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al
    const data = await response.json();
    console.log('Backend API response received:', data);

    return processAndReturnNFTData(data);
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to process and normalize NFT data
function processAndReturnNFTData(data) {
  try {
    // Fix image URI paths
    if (data.ImageURI && data.ImageURI.startsWith('/media')) {
      data.ImageURI = `http://localhost:8000${data.ImageURI}`;
    } else if (data.imageUri && data.imageUri.startsWith('/media')) {
      data.imageUri = `http://localhost:8000${data.imageUri}`;
      data.ImageURI = data.imageUri;
    }
    
    // Make sure the active status is properly formatted
    if (data.IsActive === undefined && data.isActive !== undefined) {
      data.IsActive = data.isActive === true || data.isActive === 1;
    } else if (data.IsActive !== undefined) {
      data.IsActive = data.IsActive === true || data.IsActive === 1;
    } else {
      data.IsActive = true; // Default to active if not specified
    }
    
    // Extract and fix rarity if it's in the metadata
    if (data.BlockchainMetadata) {
      try {
        // Parse the blockchain metadata if it's a string
        const metadata = typeof data.BlockchainMetadata === 'string'
          ? JSON.parse(data.BlockchainMetadata)
          : data.BlockchainMetadata;
          
        // Check for rarity in different possible locations within metadata
        if (metadata.attributes) {
          // Look for rarity in attributes array
          const rarityAttribute = metadata.attributes.find(
            attr => attr.trait_type?.toLowerCase() === 'rarity' ||
                    attr.trait_type?.toLowerCase() === 'tier'
          );
            
          if (rarityAttribute) {
            data.Rarity = rarityAttribute.value;
          }
        }
          
        // Also check if rarity is directly specified in the metadata
        if (metadata.rarity && !data.Rarity) {
          data.Rarity = metadata.rarity;
        }
          
        // Ensure proper capitalization if rarity was found
        if (data.Rarity) {
          data.Rarity = data.Rarity.charAt(0).toUpperCase() + data.Rarity.slice(1).toLowerCase();
        }
      } catch (e) {
        console.warn('Could not parse BlockchainMetadata to extract rarity:', e);
      }
    }
    
    // Handle subscription plan data if available
    if (data.SubscriptionPlan) {
      console.log('NFT has subscription plan data:', data.SubscriptionPlan);
      // Make sure we have consistent property naming
      if (!data.SubscriptionDays && data.SubscriptionPlan.DurationDays) {
        data.SubscriptionDays = data.SubscriptionPlan.DurationDays;
      }
      if (!data.TradeValue && data.SubscriptionPlan.Price) {
        data.TradeValue = data.SubscriptionPlan.Price;
      }
    }
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing NFT data:', error);
    return NextResponse.json(data); // Return original data if processing fails
  }
}

// Belirli bir NFT'yi güncellemek için
export async function PUT(request, { params }) {
  // Access params correctly using await
  const id = (await Promise.resolve(params)).id;
  
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Geçerli bir NFT ID\'si gerekli' },
      { status: 400 }
    );
  }
  
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
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token access error:', error);
  }
  
  try {
    // Request body'i al
    const nftData = await request.json();
    
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/nfts/${id}/`;
    console.log('Sending update request to backend:', backendUrl);
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(nftData)
    });
    
    if (!response.ok) {
      // Handle error response
      const responseText = await response.text();
      
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        // Return text if not JSON
        return NextResponse.json(
          { error: 'API error', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // Process response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

// Belirli bir NFT'yi silmek için
export async function DELETE(request, { params }) {
  // Access params correctly using await
  const id = (await Promise.resolve(params)).id;
  
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Geçerli bir NFT ID\'si gerekli' },
      { status: 400 }
    );
  }
  
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
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/nfts/${id}/`;
    console.log(`Sending NFT delete request to backend: ${backendUrl}`);
    
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
      console.error(`NFT deletion failed with status ${response.status}:`, responseText);
      
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
      { success: true, message: 'NFT deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}