// src/app/api/normal-user/nfts/mint/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Request body'den verileri al
  const data = await request.json();
  const { userNftId, transactionHash } = data;
  
  if (!userNftId || !transactionHash) {
    return NextResponse.json({ 
      error: 'Missing required fields',
      message: 'userNftId and transactionHash are required'
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
      message: 'Please login to mint NFTs' 
    }, { status: 401 });
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/nfts/mint/${userNftId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ transactionHash })
    });
    
    if (!response.ok) {
      console.error(`NFT mint API error: ${response.status}`);
      return NextResponse.json({ 
        error: `API Error: ${response.status}`,
        message: 'Could not mint NFT'
      }, { status: response.status });
    }
    
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`NFT mint API call error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
}