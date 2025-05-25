import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ 
      error: 'Missing NFT ID', 
      message: 'NFT ID is required' 
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
  
  try {
    const response = await fetch(`http://localhost:8000/api/nfts/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`NFT detail API error: ${response.status}`);
      return NextResponse.json({ 
        error: `API Error: ${response.status}`,
        message: 'Could not fetch NFT details'
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`NFT detail API call error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
} 