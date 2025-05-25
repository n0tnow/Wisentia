// app/api/admin/approve-quiz/[contentId]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
  try {
    // İstek verilerini al - await params for Next.js 14 compatibility
    const contentId = await params.contentId;
    const requestData = await request.json();
    
    console.log(`Processing approval request for content ID: ${contentId}`);
    
    // Token bilgisini al
    let token = '';
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('access_token');
      token = tokenCookie?.value || '';
      
      if (!token) {
        console.error('No access token found in cookies');
        return NextResponse.json(
          { error: 'Authentication error', message: 'No access token available' },
          { status: 401 }
        );
      }
      
      console.log('Token retrieved successfully:', token ? `${token.substring(0, 15)}...` : 'Yok');
    } catch (error) {
      console.error('Cookie erişim hatası:', error);
      return NextResponse.json(
        { error: 'Cookie access error', message: error.message },
        { status: 500 }
      );
    }
    
    // Backend API URL
    const backendUrl = `http://localhost:8000/api/ai/admin/approve-quiz/${contentId}/`;
    console.log('Making backend API request to:', backendUrl);
    
    // Abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      // Backend'e API isteği
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Version': '1.0' // Add version for debugging
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        console.error(`Backend error (${response.status}):`, responseText.substring(0, 500));
        console.error('Content-Type:', contentType);
        
        if (contentType?.includes('html') || responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html')) {
          if (response.status === 401 || response.status === 403) {
            return NextResponse.json(
              { error: 'Authentication error', message: 'Please login again.' },
              { status: response.status }
            );
          } else {
            return NextResponse.json(
              { error: 'Server error', message: `The server returned HTML instead of JSON. Status: ${response.status}` },
              { status: response.status }
            );
          }
        }
        
        try {
          // Try to parse error response as JSON
          const errorData = JSON.parse(responseText);
          
          // Return with status code from backend
          return NextResponse.json({
            error: errorData.error || 'API error',
            message: errorData.message || errorData.error || responseText.substring(0, 200),
            details: errorData.details || null,
            status: response.status,
            backendError: true
          }, { status: response.status });
        } catch (e) {
          // Return with text response if not JSON
          return NextResponse.json({
            error: 'Invalid response format',
            message: responseText.substring(0, 300),
            status: response.status,
            parseError: e.message
          }, { status: response.status });
        }
      }
      
      const data = await response.json();
      console.log('Backend API response successfully received:', JSON.stringify(data).substring(0, 200));
      
      return NextResponse.json(data);
      
    } catch (fetchError) {
      // Clear timeout if it's still active
      clearTimeout(timeoutId);
      
      // Special handling for timeout errors
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout after 60 seconds');
        return NextResponse.json(
          { error: 'Request timeout', message: 'The backend server did not respond in time. Please try again later.' },
          { status: 504 }
        );
      }
      
      // Rethrow to be caught by outer try-catch
      throw fetchError;
    }
  } catch (error) {
    console.error('API Proxy error:', error);
    return NextResponse.json({
      error: 'Server error',
      message: `An unexpected error occurred: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}