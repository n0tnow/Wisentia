import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Parametreleri doğru şekilde kullanarak düzeltilmiş versiyon
export async function GET(request, context) {
  try {
    // Parametreleri await kullanarak doğru şekilde al
    const params = await context.params;
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID is required',
        success: false
      }, { status: 400 });
    }
    
    // SessionId'nin tipine dikkat edin, eğer string ise number'a çevirin
    const sessionIdValue = parseInt(sessionId);
    
    // Backend URL'sini doğru şekilde belirle - api/ai/ altında
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const apiEndpoint = `${backendUrl}/api/ai/chat/sessions/${sessionIdValue}/`;
    
    console.log('Fetching session messages from:', apiEndpoint);
    
    // Cookie'leri almak için await kullanın
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    // Backend'e isteği yönlendir
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
    });

    // Debug: backend yanıtını logla
    console.log('Response status:', response.status);
    
    // Olası hataları ele al
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Session not found',
          success: false
        }, { status: 404 });
      }
      
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Backend API error:', response.status, errorText);
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch session messages',
        details: errorText,
        success: false
      }, { status: response.status });
    }
    
    // Yanıtı döndür - backend'in yapısına göre ayarla
    const data = await response.json();
    return NextResponse.json({
      sessionId: sessionIdValue,
      messages: data.messages || []
    });
    
  } catch (error) {
    console.error('Error fetching session messages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch session messages: ' + error.message,
      success: false
    }, { status: 500 });
  }
}