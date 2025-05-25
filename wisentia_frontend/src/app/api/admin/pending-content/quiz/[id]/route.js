import { NextResponse } from 'next/server';

// New approach that avoids the params.id access issue
export async function GET(request) {
  // Extract the ID from the URL path directly
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const quizId = pathParts[pathParts.length - 1];
  
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
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID gereklidir' }, { status: 400 });
    }
    
    console.log(`Quiz detaylarını getir: ${quizId}`);
    
    // Backend API URL'si
    const backendUrl = `http://localhost:8000/api/ai/admin/quiz-content-detail/${quizId}/`;
    
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
    
    if (!response.ok) {
      console.error(`Backend yanıt hatası: ${response.status} - ${response.statusText}`);
      // Hata durumunda gerçek hata mesajı döndürülüyor, mock veri oluşturulmuyor
      const errorData = await response.text();
      console.error('Backend error response:', errorData);
      
      return NextResponse.json(
        { error: `Backend API hatası: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Quiz veri API hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
} 