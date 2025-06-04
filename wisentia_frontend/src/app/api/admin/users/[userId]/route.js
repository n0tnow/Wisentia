// app/api/admin/users/[userId]/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const userId = params.userId;
  
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
    
    console.log(`API Proxy (User ${userId} Details): Token bilgisi:`, token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Backend API URL - Django API'sine istek yapıyoruz
    const backendUrl = `http://localhost:8000/api/admin/users/${userId}/`;
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
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json(data, {
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

// Add PATCH method for user updates
export async function PATCH(request, { params }) {
  const userId = params.userId;
  
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
    
    console.log(`API Proxy (PATCH User ${userId}): Token bilgisi:`, token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Request body'yi al
    const body = await request.json();
    console.log('Güncelleme verisi:', body);
    
    // Convert frontend field names to backend field names
    const backendData = {};
    if (body.username) backendData.Username = body.username;
    if (body.email) backendData.Email = body.email;
    if (body.userRole) backendData.UserRole = body.userRole;
    if (body.hasOwnProperty('isActive')) backendData.IsActive = body.isActive;
    
    console.log('Backend için dönüştürülmüş veri:', backendData);
    
    // Backend API URL - Django API'sine istek yapıyoruz
    const backendUrl = `http://localhost:8000/api/admin/users/${userId}/update/`;
    console.log('Backend API isteği yapılıyor:', backendUrl);
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      body: JSON.stringify(backendData),
      cache: 'no-store'
    });
    
    console.log('Backend yanıt durumu:', response.status);
    
    if (!response.ok) {
      // Hata durumunu yönet
      console.error('Backend API hatası:', response.status);
      
      const responseText = await response.text();
      console.error('Backend hata yanıtı:', responseText);
      
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
          { error: 'Kullanıcı güncelleme hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al 
    const data = await response.json();
    console.log('Backend API yanıtı başarılı alındı:', data);
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: data
    }, {
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

export async function PUT(request, { params }) {
  const userId = params.userId;
  
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
    
    console.log(`API Proxy (Update User ${userId}): Token bilgisi:`, token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Request body'yi al
    const body = await request.json();
    console.log('Güncelleme verisi:', body);
    
    // Backend API URL - Django API'sine istek yapıyoruz
    const backendUrl = `http://localhost:8000/api/admin/users/${userId}/update/`;
    console.log('Backend API isteği yapılıyor:', backendUrl);
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      body: JSON.stringify(body),
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
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json(data, {
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