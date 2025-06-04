import { NextResponse } from 'next/server';

// Force dynamic route for Vercel deployment - fixes cookies() usage error
export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Get token information
  let token = '';
  try {
    // First try to get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check token from cookie if not in header
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
    
    console.log('System Health API: Token info:', token ? `${token.substring(0, 15)}...` : 'Not found');
  } catch (error) {
    console.error('Token access error:', error);
  }
  
  try {
    // Backend API URL - Make request to Django API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000/api/admin/system-health/';
    console.log('Making backend API request to:', backendUrl);
    
    // API request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      next: { revalidate: 0 }, // Disable Next.js cache
      cache: 'no-store'
    });
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      // Handle error scenario
      console.error('Backend API error:', response.status);
      
      const responseText = await response.text();
      
      // Check if response is HTML
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html')) {
        console.error('HTML response received');
        return NextResponse.json(
          { error: 'Backend authentication error. Please log in again.' },
          { status: response.status }
        );
      }
      
      try {
        // Try to parse JSON response
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        // If JSON parsing fails, return as text
        return NextResponse.json(
          { error: 'API error', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // Get JSON response
    const data = await response.json();
    console.log('Backend API response successfully received');
    
    // Format response for frontend
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('System Health API Proxy error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}