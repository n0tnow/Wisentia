import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request, { params }) {
  try {
    // Get courseId from params - properly awaited
    const { courseId } = await params;
    
    if (!courseId) {
      console.error('Missing courseId parameter');
      return NextResponse.json(
        { error: 'Missing course ID' },
        { status: 400 }
      );
    }
    
    // Log the request
    console.log(`Processing course resources request for courseId: ${courseId}`);
    
    // Get headers - properly awaited
    const headersList = await headers();
    const authToken = headersList.get('Authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Call the backend API to get course resources
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const backendUrl = `${baseUrl}/courses/${courseId}/resources/`;
    
    // Add cache busting parameter
    const timestamp = Date.now();
    const urlWithCacheBuster = `${backendUrl}?t=${timestamp}`;
    
    // Log attempt
    console.log(`Fetching course resources from: ${urlWithCacheBuster}`);
    
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
        console.log(`Backend API returned ${response.status} for course resources. Using empty array fallback.`);
        
        // Return an empty array as fallback
        return NextResponse.json([]);
      }
      
      // Return the actual data from backend
      const data = await response.json();
      return NextResponse.json(Array.isArray(data) ? data : []);
      
    } catch (fetchError) {
      console.error('Error fetching resources from backend:', fetchError);
      
      // Fallback response for network/API errors
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error in course resources API route:', error);
    return NextResponse.json(
      { error: `Failed to get course resources: ${error.message}` },
      { status: 500 }
    );
  }
} 