import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Force dynamic route for Vercel deployment - fixes headers() usage error
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Log the request
    console.log('Processing unread chat count request');
    
    // Get headers - properly awaited
    const headersList = await headers();
    const authToken = headersList.get('Authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Call the backend API to get unread chat count
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const backendUrl = `${baseUrl}/normal-user/chat/unread-count/`;
    
    // Add cache busting parameter
    const timestamp = Date.now();
    const urlWithCacheBuster = `${backendUrl}?t=${timestamp}`;
    
    // Log attempt
    console.log(`Fetching unread chat count from: ${urlWithCacheBuster}`);
    
    try {
      // Call backend API
      const response = await fetch(urlWithCacheBuster, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      // If backend returns an error, create a fallback response
      if (!response.ok) {
        console.log(`Backend API returned ${response.status} for unread chat count. Using fallback.`);
        
        // Return a zero count as fallback
        return NextResponse.json({ unreadCount: 0 });
      }
      
      // Return the actual data from backend
      const data = await response.json();
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('Error fetching unread count from backend:', fetchError);
      
      // Fallback response for network/API errors
      return NextResponse.json({ unreadCount: 0 });
    }
  } catch (error) {
    console.error('Error in unread chat count API route:', error);
    return NextResponse.json(
      { error: `Failed to get unread count: ${error.message}` },
      { status: 500 }
    );
  }
}