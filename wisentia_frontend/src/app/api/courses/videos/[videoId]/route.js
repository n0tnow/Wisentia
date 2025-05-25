import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Handler for GET requests to fetch video details
export async function GET(request, { params }) {
  try {
    // Get videoId from params - properly awaited
    const { videoId } = await params;

    if (!videoId) {
      console.error('Missing videoId parameter');
      return NextResponse.json(
        { error: 'Missing videoId parameter' },
        { status: 400 }
      );
    }

    console.log('Processing video fetch request for videoId:', videoId);

    // Get headers - must await headers()
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    
    // Extract token from Authorization header
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Cache busting timestamp
    const timestamp = Date.now();
    const apiUrl = `${process.env.BACKEND_API_URL || 'http://localhost:8000'}/api/courses/videos/${videoId}/?t=${timestamp}`;
    
    console.log('Fetching video from backend:', apiUrl);

    // Make request to backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Error fetching video: ${response.status}`, errorData);
      
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch video data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully retrieved video data for video ID:', videoId);
    console.log('Video data structure: YouTubeVideoID:', data.YouTubeVideoID);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in video fetch handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 