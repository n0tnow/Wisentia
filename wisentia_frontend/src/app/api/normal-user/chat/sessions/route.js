import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic route for Vercel deployment - fixes cookies() usage error
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Backend URL'sini doğru şekilde belirle - api/ai/ altında
    const apiEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/ai/chat/sessions/`;
    
    console.log('Fetching sessions from:', apiEndpoint);
    
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
        return NextResponse.json([], { status: 200 }); // Oturum yoksa boş dizi döndür
      }
      
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Backend API error:', response.status, errorText);
      } catch (e) {
        errorText = 'Could not read error response';
      }
      
      return NextResponse.json({ 
        error: 'Failed to fetch chat sessions',
        details: errorText,
        success: false
      }, { status: response.status });
    }
    
    // Yanıtı döndür
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch chat sessions: ' + error.message,
      success: false
    }, { status: 500 });
  }
}