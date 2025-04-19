// app/api/admin/courses/route.js
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
    
    console.log('API Proxy: Courses - Token bilgisi:', token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // URL'den query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const pageSize = searchParams.get('pageSize') || 20;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const status = searchParams.get('status') || '';
    
    // Parametreleri query string'e dönüştür
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      search,
      category,
      difficulty,
      status
    }).toString();
    
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/admin/content/?type=courses&${queryParams}`;
    console.log('Courses Backend API isteği yapılıyor:', backendUrl);
    
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
    
    console.log('Courses Backend yanıt durumu:', response.status);
    
    if (!response.ok) {
      // Hata durumunu yönet
      console.error('Courses Backend API hatası:', response.status);
      
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
    console.log('Courses Backend API yanıtı başarılı alındı');
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Courses API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Token bilgisini al
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
    // İstek verisini al
    const requestData = await request.json();
    
    // Backend API URL
    const backendUrl = 'http://localhost:8000/api/admin/courses/create/';
    console.log('Courses Backend POST isteği yapılıyor:', backendUrl);
    
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
    
    console.log('Courses Backend POST yanıt durumu:', response.status);
    
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
    console.log('Courses Backend POST yanıtı başarılı alındı');
    
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Courses API POST hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}