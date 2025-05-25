import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request, { params }) {
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
    
    // Get headers - properly awaited
    const headersList = await headers();
    const token = headersList.get('Authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Call the backend API to get user's video view data
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const backendUrl = `${baseUrl}/courses/videos/${videoId}/views/`;
    
    // Add cache busting parameter
    const timestamp = Date.now();
    const urlWithCacheBuster = `${backendUrl}?t=${timestamp}`;
    
    console.log(`Fetching user video view data for videoId: ${videoId}`);
    console.log(`Sending request to: ${urlWithCacheBuster}`);
    
    try {
      const response = await fetch(urlWithCacheBuster, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      // Parse response if possible
      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = { message: 'No response data available' };
      }
      
      if (!response.ok) {
        // Determine the appropriate error message
        let errorMessage = responseData.error || responseData.detail || 'Failed to get video view data';
        
        if (response.status === 404) {
          errorMessage = 'Video not found';
        } else if (response.status === 403) {
          errorMessage = 'You do not have access to this video';
        }
        
        console.error(`Error getting video view data for video ${videoId}: Status ${response.status}, Message: ${errorMessage}`);
        
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        );
      }
      
      // Log successful fetch
      console.log(`Successfully fetched video view data for video ${videoId} from UserVideoViews table`);
      
      return NextResponse.json({
        videoView: responseData.videoView || null,
        message: 'User video view data retrieved successfully'
      });
    } catch (fetchError) {
      console.error(`Fetch error for video view data ${videoId}:`, fetchError);
      return NextResponse.json(
        { error: `Failed to get video view data: ${fetchError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in video views API route:', error);
    return NextResponse.json(
      { error: `Failed to get video view data: ${error.message}` },
      { status: 500 }
    );
  }
} 