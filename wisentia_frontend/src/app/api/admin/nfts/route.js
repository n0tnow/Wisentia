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
    
    console.log('NFT API Proxy: Token bilgisi:', token ? `${token.substring(0, 15)}...` : 'Yok');
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
    console.log('Backend API isteği yapılıyor:', backendUrl);
    
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
    
    console.log('Backend yanıt durumu:', response.status);
    
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
    console.log('Backend API yanıtı başarılı alındı');
    
    // Yanıtı admin paneline uygun formatta yeniden yapılandır
    const formattedData = {
      nfts: data.nfts || data.results || data,  // API'nin döndürdüğü veri yapısına göre uyarla
      totalCount: data.totalCount || data.count || (data.nfts ? data.nfts.length : (Array.isArray(data) ? data.length : 0))
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
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Request body'i al
    const requestData = await request.json();
    
    // Backend API URL - Mevcut create endpoint'ini kullanıyoruz
    const backendUrl = 'http://localhost:8000/api/nfts/create/';
    
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
      status: 201,
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