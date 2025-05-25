import { NextResponse } from 'next/server';

// Mock data to use when backend is unavailable
const MOCK_NFT_DATA = [
  {
    NFTID: 9,
    Title: "qqqqq",
    Description: "qqqqq",
    ImageURI: "/media/uploads/nft_images/3c5bef8d2534456cb1d589cf18d890b4.jpg",
    BlockchainMetadata: JSON.stringify({
      ipfsUri: "ipfs://QmcroNLuWGUaDz91zaKWZiuWAPCmGZM3KJv3PqTHVzzq2p",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/QmcroNLuWGUaDz91zaKWZiuWAPCmGZM3KJv3PqTHVzzq2p",
      imageIpfsUri: "/media/uploads/nft_images/3c5bef8d2534456cb1d589cf18d890b4.jpg",
      imageGateway: null,
      rarity: "Legendary"
    }),
    TradeValue: 111.0,
    SubscriptionDays: 11,
    IsActive: true,
    Rarity: "Legendary",
    NFTTypeID: 2
  },
  {
    NFTID: 10,
    Title: "SUBS",
    Description: "SUBS",
    ImageURI: "/media/uploads/nft_images/21baa3ce1c1643fcb2717ee8efcc6b15.png",
    BlockchainMetadata: JSON.stringify({
      ipfsUri: "ipfs://QmQkxRm5ghSCau2FEon2ihKEkp4NyGvFHQXTWR1aQdZvNr",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/QmQkxRm5ghSCau2FEon2ihKEkp4NyGvFHQXTWR1aQdZvNr",
      imageIpfsUri: "/media/uploads/nft_images/21baa3ce1c1643fcb2717ee8efcc6b15.png",
      imageGateway: null,
      rarity: "Epic"
    }),
    TradeValue: 0.0,
    SubscriptionDays: 10,
    IsActive: true,
    Rarity: "Epic",
    NFTTypeID: 2
  },
  {
    NFTID: 11,
    Title: "trial",
    Description: "heelo",
    ImageURI: "/media/uploads/nft_images/181c5428d8264ef98ecfeb97355959d2.jpg",
    BlockchainMetadata: JSON.stringify({
      ipfsUri: "ipfs://QmdfHMzxF2FFc8pf9sRAYiFWHtJenfbgMNve73ryr6K56i",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/QmdfHMzxF2FFc8pf9sRAYiFWHtJenfbgMNve73ryr6K56i",
      imageIpfsUri: "/media/uploads/nft_images/181c5428d8264ef98ecfeb97355959d2.jpg",
      imageGateway: null,
      rarity: "Epic"
    }),
    TradeValue: 0.0,
    SubscriptionDays: 1,
    IsActive: true,
    Rarity: "Epic",
    NFTTypeID: 2
  },
  {
    NFTID: 12,
    Title: "SUBSCRIPTION",
    Description: "PLAN1",
    ImageURI: "/media/uploads/nft_images/198e11c13085471a83da46a6836a1718.jpg",
    BlockchainMetadata: JSON.stringify({
      ipfsUri: "ipfs://QmRfCitkzPm13TnCWwDQPbj2HRvpQ3hZKp6tqdKQipCJ6G",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/QmRfCitkzPm13TnCWwDQPbj2HRvpQ3hZKp6tqdKQipCJ6G",
      imageIpfsUri: "/media/uploads/nft_images/198e11c13085471a83da46a6836a1718.jpg",
      imageGateway: null,
      rarity: "Epic"
    }),
    TradeValue: 0.0,
    SubscriptionDays: 1,
    IsActive: true,
    Rarity: "Epic",
    NFTTypeID: 2
  },
  {
    NFTID: 14,
    Title: "plan2",
    Description: "subscription",
    ImageURI: "/media/uploads/nft_images/d5936932aa3c4e62a825c05e02054a4e.jpg",
    BlockchainMetadata: JSON.stringify({
      ipfsUri: "ipfs://QmPWvrt7TB1H4hagKVJnpUztdPyaXFba4XwSRFeuZLYYTT",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/QmPWvrt7TB1H4hagKVJnpUztdPyaXFba4XwSRFeuZLYYTT",
      imageIpfsUri: "/media/uploads/nft_images/d5936932aa3c4e62a825c05e02054a4e.jpg",
      imageGateway: null,
      rarity: "Rare"
    }),
    TradeValue: 0.0,
    SubscriptionDays: 1,
    IsActive: true,
    Rarity: "Rare",
    NFTTypeID: 2
  },
  {
    NFTID: 15,
    Title: "plan3",
    Description: "plan3",
    ImageURI: "/media/uploads/nft_images/4d3a00fea0414a5b99617275429fdef5.jpg",
    BlockchainMetadata: JSON.stringify({
      ipfsUri: "ipfs://QmeSjVog2dSyGw1xpGKq6HeWVDBFfi3xvbQHLHFjwrv8bH",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/QmeSjVog2dSyGw1xpGKq6HeWVDBFfi3xvbQHLHFjwrv8bH",
      imageIpfsUri: "/media/uploads/nft_images/4d3a00fea0414a5b99617275429fdef5.jpg",
      imageGateway: null,
      rarity: "Legendary"
    }),
    TradeValue: 0.0,
    SubscriptionDays: 1,
    IsActive: true,
    Rarity: "Legendary",
    NFTTypeID: 2
  },
  {
    NFTID: 16,
    Title: "RRR",
    Description: "RRR",
    ImageURI: "/media/uploads/nft_images/b6f1974e91614578b2b9e908c3417821.jpg",
    BlockchainMetadata: JSON.stringify({
      ipfsUri: "ipfs://QmXRNGMLSWRmfPBM72AbqhDzyqGuA8KVJYi6VHUJCQ8Zd4",
      ipfsGateway: "https://gateway.pinata.cloud/ipfs/QmXRNGMLSWRmfPBM72AbqhDzyqGuA8KVJYi6VHUJCQ8Zd4",
      imageIpfsUri: "/media/uploads/nft_images/b6f1974e91614578b2b9e908c3417821.jpg",
      imageGateway: null,
      rarity: "Legendary"
    }),
    TradeValue: 1.0,
    SubscriptionDays: 11,
    IsActive: true,
    Rarity: "Legendary",
    NFTTypeID: 2
  }
];

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
    // Backend API'den NFT'leri getir
    const response = await fetch('http://localhost:8000/api/nfts/available/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Set longer timeout to ensure proper connection to backend
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.error(`NFT API error: ${response.status}`);
      return NextResponse.json({ 
        error: true, 
        message: 'Failed to fetch NFT data from the server. The backend service may be unavailable.' 
      }, { status: 503 });
    }
    
    const data = await response.json();
    
    // NFT'leri düzenle
    const enhancedData = data.map(nft => {
      try {
        // Handle image URI
        let imageUri = nft.ImageURI || nft.imageUri || nft.ImageURL || nft.imageUrl;
        
        // Fix for broken image references
        if (imageUri && imageUri.startsWith('/media')) {
          imageUri = `http://localhost:8000${imageUri}`;
        }
        
        // CRITICAL: Always prioritize the database Rarity field
        let rarity = nft.Rarity; // Use the database field first
        let collection = nft.Title || "";
        let metadata = {};
        
        // Parse blockchain metadata for additional fields
        try {
          if (nft.BlockchainMetadata && typeof nft.BlockchainMetadata === 'string') {
            metadata = JSON.parse(nft.BlockchainMetadata);
            // Only use metadata rarity if database field is not available
            if (!rarity && metadata.rarity) {
              rarity = metadata.rarity;
            }
            if (metadata.collection) {
              collection = metadata.collection;
            }
          }
        } catch (e) {
          console.error("Error parsing BlockchainMetadata:", e);
        }
        
        // Ensure consistent capitalization for rarity
        if (typeof rarity === 'string') {
          rarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
        } else {
          // Only as last resort, set a default rarity based on NFT type
          if (nft.NFTTypeID === 2) rarity = "Legendary"; // Subscription
          else if (nft.NFTTypeID === 1) rarity = "Epic"; // Achievement
          else if (nft.NFTTypeID === 4) rarity = "Rare"; // Course completion
          else rarity = "Common"; // Default fallback
        }
        
        return {
          ...nft,
          rarity: rarity,
          collection: collection,
          imageUri: imageUri
        };
      } catch (error) {
        console.error("Error processing NFT:", error, nft);
        // Return the original NFT with minimal processing to avoid failures
        return {
          ...nft,
          rarity: nft.Rarity || "Common",
          imageUri: nft.ImageURI || nft.imageUri || "https://place-hold.it/400x400/0a192f/64ffda.png?text=NFT&fontsize=30"
        };
      }
    });
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error(`NFT API call error:`, error);
    return NextResponse.json({ 
      error: true, 
      message: 'Failed to fetch NFT data. Please check your connection and try again.' 
    }, { status: 500 });
  }
}

// Process mock data with the same logic as real data
function processMockData(mockData) {
  return mockData.map(nft => {
    try {
      // Handle image URI
      let imageUri = nft.ImageURI || nft.imageUri || nft.ImageURL || nft.imageUrl;
      
      // For mock data with relative paths, use a public placeholder
      if (imageUri && imageUri.startsWith('/media')) {
        // For demo purposes use placeholders that will always work
        imageUri = `https://place-hold.it/400x400/0a192f/64ffda.png?text=${encodeURIComponent(nft.Title)}&fontsize=30`;
      }
      
      // IMPORTANT: First prioritize the database Rarity field
      let rarity = nft.Rarity; // Use the database field directly
      let collection = nft.Title || "";
      let metadata = {};
      
      // Only if we don't have a Rarity value from database, try to get it from metadata
      if (!rarity) {
        try {
          if (nft.BlockchainMetadata && typeof nft.BlockchainMetadata === 'string') {
            metadata = JSON.parse(nft.BlockchainMetadata);
            if (metadata.rarity) {
              rarity = metadata.rarity;
            }
            if (metadata.collection) {
              collection = metadata.collection;
            }
          }
        } catch (e) {
          console.error("Error parsing mock BlockchainMetadata:", e);
          // Silently handle metadata parsing errors
        }
        
        // Set defaults only if we still don't have rarity
        if (!rarity) {
          // Check NFT type for appropriate default rarity
          if (nft.NFTTypeID === 2) rarity = "Legendary"; // Subscription
          else if (nft.NFTTypeID === 1) rarity = "Epic"; // Achievement
          else if (nft.NFTTypeID === 4) rarity = "Rare"; // Course completion
          else rarity = "Common"; // Default fallback
        }
      }
      
      // Ensure consistent capitalization if we have a string value
      if (typeof rarity === 'string') {
        rarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
      }
      
      return {
        ...nft,
        rarity: rarity,
        collection: collection,
        imageUri: imageUri
      };
    } catch (error) {
      console.error("Error processing mock NFT:", error, nft);
      // Return the original NFT with minimal processing to avoid failures
      return {
        ...nft,
        rarity: nft.Rarity || "Common",
        imageUri: "https://place-hold.it/400x400/0a192f/64ffda.png?text=NFT&fontsize=30"
      };
    }
  });
}

// Fiyata göre abonelik NFT'si nadirliğini belirler
function getSubscriptionRarity(price) {
  if (price >= 200) return 'Legendary';
  if (price >= 100) return 'Epic';
  if (price >= 50) return 'Rare';
  if (price >= 20) return 'Uncommon';
  return 'Common';
} 