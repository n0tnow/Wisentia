import { NextResponse } from 'next/server';

export async function POST(request) {
  // Request body'den verileri al
  const data = await request.json();
  const { targetNftId, offeredNftIds } = data;
  
  if (!targetNftId || !offeredNftIds || !offeredNftIds.length) {
    return NextResponse.json({ 
      error: 'Missing required fields',
      message: 'targetNftId and non-empty offeredNftIds array are required'
    }, { status: 400 });
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
    console.error('Token access error:', error);
  }
  
  // Token yoksa hata dön
  if (!token) {
    return NextResponse.json({ 
      error: 'Authentication required', 
      message: 'Please login to trade NFTs' 
    }, { status: 401 });
  }
  
  try {
    console.log("Sending trade request to backend:", { targetNftId, offeredNftIds });
    const response = await fetch('http://localhost:8000/api/nfts/trade/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ targetNftId, offeredNftIds })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`NFT trade API error: ${response.status}`, errorData);
      return NextResponse.json({ 
        error: errorData.error || `API Error: ${response.status}`,
        message: errorData.message || 'Could not complete NFT trade'
      }, { status: response.status });
    }
    
    const responseData = await response.json();
    console.log("Trade completed successfully:", responseData);
    
    // Otomatik tamamlanan takas sonucunu dön
    return NextResponse.json({
      ...responseData,
      // İstemci tarafında otomatik yönlendirme için bir delay ekle
      clientRedirect: responseData.isSubscription ? '/subscriptions' : '/nfts'
    });
  } catch (error) {
    console.error(`NFT trade API call error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
} 