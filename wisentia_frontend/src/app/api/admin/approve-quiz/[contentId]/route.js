// app/api/admin/approve-quiz/[contentId]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
  try {
    // İstek verilerini al - await params for Next.js 14 compatibility
    const contentId = await params.contentId;
    const requestData = await request.json();
    const videoId = requestData.videoId;
    
    // Token bilgisini al
    let token = '';
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('access_token');
      token = tokenCookie?.value || '';
      
      // Debug için tüm cookie'leri logla
      const allCookies = cookieStore.getAll();
      console.log('Mevcut cookie\'ler:', allCookies.map(c => c.name).join(', '));
    } catch (error) {
      console.error('Cookie erişim hatası:', error);
    }
    
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/ai/admin/approve-quiz/${contentId}/`;
    console.log('Backend API isteği yapılıyor:', backendUrl);
    console.log('Video ID:', videoId);
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData),
      credentials: 'include'
    });
    
    console.log('Backend yanıt durumu:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Backend hata yanıtı:', responseText.substring(0, 500));
      
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html')) {
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            { error: 'Backend kimlik doğrulama hatası. Lütfen tekrar giriş yapın.' },
            { status: response.status }
          );
        } else {
          return NextResponse.json(
            { error: 'Backend hatası', details: 'Sunucu HTML yanıtı döndürdü' },
            { status: response.status }
          );
        }
      }
      
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
    
    const data = await response.json();
    console.log('Backend API yanıtı başarılı alındı');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}