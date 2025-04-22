// app/api/nfts/[id]/route.js
import { NextResponse } from 'next/server';

// Belirli bir NFT'yi getirmek için
export async function GET(request, { params }) {
  const { id } = params;
  
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
    console.log(`NFT detayı için isteği yapılıyor: ${backendUrl}`);
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'GET',
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
    
    // JSON yanıtı al
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}

// Belirli bir NFT'yi güncellemek için
export async function PUT(request, { params }) {
  const { id } = params;
  
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
    // Request body'i al
    const requestData = await request.json();
    
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/nfts/${id}/`;
    console.log(`NFT güncelleme için istek yapılıyor: ${backendUrl}`);
    
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
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}

// Belirli bir NFT'yi silmek için
export async function DELETE(request, { params }) {
  const { id } = params;
  
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
    console.log(`NFT silme için istek yapılıyor: ${backendUrl}`);
    
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