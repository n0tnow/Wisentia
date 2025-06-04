import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const userId = params.userId;
  
  // URL'den query parametrelerini al
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = searchParams.get('page') || 1;
  const pageSize = searchParams.get('pageSize') || 10;
  
  // İsteği oluştur
  let queryString = `page=${page}&pageSize=${pageSize}`;
  
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
    
    console.log(`🔄 Activity API Proxy (User ${userId}): Token bilgisi:`, token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('❌ Token erişim hatası:', error);
  }
  
  try {
    // Backend API URL - Django API'sine istek yapıyoruz - FIX: Doğru backend URL
    const backendUrl = `http://localhost:8000/api/admin/users/${userId}/activity/?${queryString}`;
    console.log('🚀 Backend API isteği yapılıyor:', backendUrl);
    
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
    
    console.log('📡 Backend yanıt durumu:', response.status);
    
    if (!response.ok) {
      // Hata durumunu yönet
      console.error('❌ Backend API hatası:', response.status);
      
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('❌ Response text alınamadı:', textError);
        responseText = 'Unknown error';
      }
      
      // HTML yanıt kontrolü
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html')) {
        console.error('❌ HTML yanıtı alındı - kimlik doğrulama sorunu');
        return NextResponse.json(
          { 
            error: 'Backend kimlik doğrulama hatası. Lütfen tekrar giriş yapın.',
            debug: {
              status: response.status,
              url: backendUrl,
              hasToken: !!token
            }
          },
          { status: 401 }
        );
      }
      
      try {
        // JSON yanıtı dene
        const errorData = JSON.parse(responseText);
        console.error('❌ JSON Error:', errorData);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        // JSON parse edilemiyorsa text olarak
        console.error('❌ Non-JSON Error:', responseText.substring(0, 200));
        return NextResponse.json(
          { 
            error: 'API hatası', 
            message: responseText.substring(0, 500),
            debug: {
              status: response.status,
              url: backendUrl,
              hasToken: !!token
            }
          },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al 
    const data = await response.json();
    console.log('✅ Backend API yanıtı başarılı alındı. Activity count:', data?.activities?.length || 0);
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('❌ API Proxy hatası:', error);
    return NextResponse.json(
      { 
        error: 'Sunucu hatası', 
        message: error.message,
        debug: {
          url: `http://localhost:8000/api/admin/users/${userId}/activity/?${queryString}`,
          hasToken: !!token,
          stack: error.stack?.substring(0, 500)
        }
      },
      { status: 500 }
    );
  }
} 