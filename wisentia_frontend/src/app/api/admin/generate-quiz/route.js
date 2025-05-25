// app/api/admin/generate-quiz/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  // Token bilgisini al
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('access_token');
      token = tokenCookie?.value || '';
    }
    
    if (!token) {
      console.error('API Proxy: No authentication token found');
      return NextResponse.json(
        { error: 'Authentication error', message: 'No access token available' },
        { status: 401 }
      );
    }
    
    console.log('API Proxy: Token retrieved successfully:', token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('Token erişim hatası:', error);
    return NextResponse.json(
      { error: 'Cookie access error', message: error.message },
      { status: 500 }
    );
  }
  
  try {
    // İstek verilerini al
    const requestData = await request.json();
    
    // Backend API URL
    const backendUrl = 'http://localhost:8000/api/ai/admin/generate-quiz/';
    console.log('Making backend API request to:', backendUrl);
    console.log('Request type:', requestData.source, 'Model:', requestData.model);
    
    // Timeout için AbortController - increased to 60 minutes to match frontend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3600000); // 60 minute timeout (increased from 2 minutes)
    
    try {
      // Backend'e API isteği
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Version': '1.0', // Add version for debugging
          'X-Request-Timeout': '3600' // Inform backend this is a long-running request (60 minutes)
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      // Timeout temizle
      clearTimeout(timeoutId);
      
      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        console.error(`Backend error (${response.status}):`, responseText.substring(0, 500));
        console.error('Content-Type:', contentType);
        
        if (contentType?.includes('html') || 
            responseText.trim().startsWith('<!DOCTYPE html>') || 
            responseText.trim().startsWith('<html')) {
          if (response.status === 401 || response.status === 403) {
            return NextResponse.json(
              { error: 'Authentication error', message: 'Please login again to continue.' },
              { status: response.status }
            );
          } else {
            return NextResponse.json(
              { 
                error: 'Server error', 
                message: `The server returned HTML instead of JSON. Status: ${response.status}`,
                details: responseText.substring(0, 200)
              },
              { status: response.status }
            );
          }
        }
        
        try {
          // Try to parse error response as JSON
          const errorData = JSON.parse(responseText);
          
          return NextResponse.json({
            error: errorData.error || 'API error',
            message: errorData.message || errorData.error || responseText.substring(0, 200),
            details: errorData.details || null,
            status: response.status,
            backendError: true
          }, { status: response.status });
        } catch (e) {
          return NextResponse.json({
            error: 'Invalid server response',
            message: responseText.substring(0, 300) || 'The server returned an invalid response',
            status: response.status,
            parseError: e.message
          }, { status: response.status });
        }
      }
      
      const data = await response.json();
      console.log('Backend API response successfully received');
      
      return NextResponse.json(data);
    } catch (fetchError) {
      // Clear timeout if it's still active
      clearTimeout(timeoutId);
      
      // Special handling for timeout errors
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout after 60 minutes');
        return NextResponse.json(
          { 
            error: 'İşlem zaman aşımına uğradı', 
            message: 'Quiz oluşturma işlemi çok uzun sürdüğü için (60 dakika) timeout oldu. Lütfen daha kısa bir video veya daha az soru deneyin.',
            details: 'Videoların uzunluğu ve kompleksliği arttıkça işlem süresi de artabilir. Kısa videolar veya daha az sayıda soru seçerek tekrar deneyebilirsiniz.'
          },
          { status: 504 }
        );
      }
      
      // Network errors
      if (fetchError.message.includes('fetch failed') || fetchError.message.includes('network')) {
        return NextResponse.json(
          { 
            error: 'Ağ hatası', 
            message: 'Backend sunucusuna bağlanılamadı. Sunucunun çalıştığından emin olun.',
            details: fetchError.message
          },
          { status: 503 }
        );
      }
      
      throw fetchError; // Other errors will be caught by outer catch
    }
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Sunucu hatası', 
        message: error.message,
        details: error.stack ? error.stack.split('\n')[0] : 'Detaylı hata bilgisi yok'  
      },
      { status: 500 }
    );
  }
}