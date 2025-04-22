// src/app/api/nfts/create/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
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
    
    console.log('NFT Create API Proxy: Token bilgisi:', token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // Request body'i al
    const nftData = await request.json();
    
    // Backend API URL - Django'daki NFT oluşturma endpoint'i
    const backendUrl = 'http://localhost:8000/api/nfts/create/';
    console.log('Backend API isteği yapılıyor:', backendUrl);
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(nftData)
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