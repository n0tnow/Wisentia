import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request, { params }) {
  try {
    // Get videoId from params - properly awaited
    const { videoId } = await params;
    
    if (!videoId) {
      console.error('Missing videoId parameter');
      return NextResponse.json(
        { error: 'Missing video ID' },
        { status: 400 }
      );
    }
    
    // Log the request for debugging
    console.log(`Processing track progress request for videoId: ${videoId}`);
    
    // Get headers
    const headersList = headers();
    const token = headersList.get('Authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (body.watchedPercentage === undefined) {
      return NextResponse.json(
        { error: 'watchedPercentage is required' },
        { status: 400 }
      );
    }
    
    // Prepare the data for the UserVideoViews table
    const trackingData = {
      watchedPercentage: body.watchedPercentage,
      isCompleted: !!body.isCompleted,
      lastPosition: body.lastPosition || 0, // The exact position in seconds
      viewDuration: body.viewDuration || 0,  // View duration in milliseconds
      timestamp: body.timestamp || new Date().toISOString()
    };
    
    // Call the backend API to track video progress
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Adjust videoId format - if it's numeric, use as is, otherwise it might be a YouTube ID
    // and we need to ensure backend can handle it (check backend implementation)
    const backendUrl = `${baseUrl}/courses/videos/${videoId}/track/`;
    
    // Add cache busting parameter
    const timestamp = Date.now();
    const urlWithCacheBuster = `${backendUrl}?t=${timestamp}`;
    
    // Log tracking attempt with all the details going to UserVideoViews table
    console.log(`Tracking progress for video ${videoId}:`);
    console.log(`- Watched: ${trackingData.watchedPercentage}%`);
    console.log(`- Completed: ${trackingData.isCompleted}`);
    console.log(`- Position: ${trackingData.lastPosition} seconds`);
    console.log(`- View duration: ${trackingData.viewDuration} ms`);
    console.log(`Sending request to: ${urlWithCacheBuster}`);
    console.log(`Using token: ${token.substring(0, 15)}...`); // Log token prefix for debugging
    
    try {
      // Ensure the request is properly formatted
      const response = await fetch(urlWithCacheBuster, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(trackingData),
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      // Get the raw response text first
      const responseText = await response.text();
      
      // Log the raw response for debugging
      console.log(`Backend response status: ${response.status}`);
      console.log(`Backend response body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      
      // Parse the response if it's valid JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = { message: responseText || 'No response data available' };
      }
      
      if (!response.ok) {
        // Determine the appropriate error message
        let errorMessage = responseData.error || responseData.detail || 'Failed to track video progress';
        
        if (response.status === 404) {
          errorMessage = 'Video not found';
        } else if (response.status === 403) {
          errorMessage = 'You do not have access to this video';
        } else if (response.status === 401) {
          errorMessage = 'Authentication required or token expired';
        }
        
        console.error(`Error tracking video ${videoId} progress: Status ${response.status}, Message: ${errorMessage}`);
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }
      
      // Log successful tracking
      console.log(`Successfully tracked progress for video ${videoId} in UserVideoViews table`);
      
      return NextResponse.json(responseData);
    } catch (fetchError) {
      console.error(`Fetch error for tracking video ${videoId}:`, fetchError);
      return NextResponse.json(
        { error: `Failed to track video progress: ${fetchError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in track progress API route:', error);
    return NextResponse.json(
      { error: `Failed to track video progress: ${error.message}` },
      { status: 500 }
    );
  }
} 