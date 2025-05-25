import { NextResponse } from 'next/server';

// This route handles proxying media files from the backend API
export async function GET(request, { params }) {
  // Get the path from the dynamic route
  const fullPath = params.path || [];
  const mediaPath = fullPath.join('/');
  
  if (!mediaPath) {
    return NextResponse.json({ error: 'No media path specified' }, { status: 400 });
  }
  
  // Construct the full backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const mediaUrl = `${API_URL}/media/${mediaPath}`;
  
  try {
    // Fetch the media file from the backend
    const response = await fetch(mediaUrl, {
      method: 'GET',
      headers: {
        // Forward any authorization if present
        ...request.headers.has('authorization') 
          ? { 'Authorization': request.headers.get('authorization') } 
          : {}
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch media: ${response.status}`);
      return NextResponse.json({ 
        error: 'Failed to fetch media',
        path: mediaPath
      }, { status: response.status });
    }
    
    // Get content type of the original response
    const contentType = response.headers.get('content-type');
    
    // Get the file data as blob
    const data = await response.blob();
    
    // Return the file with the original content type
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400' // Cache for 1 day
      }
    });
  } catch (error) {
    console.error(`Media proxy error:`, error);
    return NextResponse.json({ 
      error: 'Media fetch error',
      message: error.message
    }, { status: 500 });
  }
} 