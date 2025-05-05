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
    console.error('Token erişim hatası:', error);
  }
  
  try {
    const response = await fetch(`http://localhost:8000/api/subscriptions/check-access/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Subscription check API hatası: ${response.status}`);
      
      // Kimlik doğrulama hatası durumunda
      if(response.status === 401) {
        return NextResponse.json({ 
          hasAccess: false,
          message: 'Authentication required'
        }, { status: 200 }); // Authentication error still returns 200 with hasAccess: false
      }
      
      return NextResponse.json({ 
        hasAccess: false,
        message: `API Error: ${response.status}`
      }, { status: 200 }); // Return 200 with hasAccess: false
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Subscription check API çağrısı hatası:`, error);
    
    // Hata durumunda bile 200 dönüp hasAccess: false diyelim
    return NextResponse.json({ 
      hasAccess: false,
      message: 'API Connection Error',
      error: error.message
    }, { status: 200 });
  }
}