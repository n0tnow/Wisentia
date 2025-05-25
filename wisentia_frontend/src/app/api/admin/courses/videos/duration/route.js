import { NextResponse } from 'next/server';

// Helper function to extract YouTube video ID from URLs
function extractYoutubeVideoId(input) {
  if (!input) return '';
  
  // If it's already just an ID (not a URL), return it
  if (!input.includes('/') && !input.includes('.')) {
    return input;
  }
  
  try {
    // Handle youtube.com/watch?v=ID format
    let match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube.com\/shorts\/|youtube\.com\/watch\?.*v=)([^&?#\/\s]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Handle youtu.be/ID format
    match = input.match(/youtu\.be\/([^&?#\/\s]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    // If no match found, return the input (will be validated later)
    return input;
  } catch (e) {
    console.error("Error extracting YouTube ID:", e);
    return input;
  }
}

// We're not using the backend anymore for this operation
export async function POST(request) {
  try {
    const data = await request.json();
    console.log("VIDEO DURATION API: Received data:", JSON.stringify(data, null, 2));
    
    // Get YouTube ID from request
    let youtubeVideoId = data.youtubeVideoId || data.youtube_video_id || data.videoId || '';
    
    if (!youtubeVideoId) {
      console.error("VIDEO DURATION API: Missing YouTube video ID");
      return NextResponse.json({ 
        error: 'YouTube video ID is required' 
      }, { status: 400 });
    }
    
    // Extract ID if a full URL was provided
    const originalVideoId = youtubeVideoId;
    youtubeVideoId = extractYoutubeVideoId(youtubeVideoId);
    
    if (youtubeVideoId !== originalVideoId) {
      console.log(`VIDEO DURATION API: Extracted YouTube ID '${youtubeVideoId}' from '${originalVideoId}'`);
    }
    
    // Validate YouTube ID format
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(youtubeVideoId)) {
      console.error(`VIDEO DURATION API: Invalid YouTube ID format: ${youtubeVideoId}`);
      return NextResponse.json({ 
        error: 'Invalid YouTube ID format. Please use only the ID portion of the URL.' 
      }, { status: 400 });
    }
    
    // Frontend API doesn't have direct access to the YouTube API
    // However, we can still return the validated video ID to the client
    // The client will use the YouTube iframe API to get the duration
    return NextResponse.json({
      youtubeVideoId,
      message: "Please use the YouTube iframe API in the frontend to get video duration"
    });
    
  } catch (error) {
    console.error('VIDEO DURATION API EXCEPTION:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while getting video duration' 
    }, { status: 500 });
  }
} 