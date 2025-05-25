import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("VIDEO CREATE API: Received data:", JSON.stringify(data, null, 2));
    
    let token = '';

    // For server-side rendering, get token from cookies (await the cookies call)
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('access_token');
    if (tokenCookie) {
      token = tokenCookie.value;
    }
    
    // Get the courseId from either field name (camelCase or snake_case)
    const courseId = data.courseId || data.course_id;
    
    // Validate each field individually for better debugging
    if (!courseId) {
      console.error("VIDEO CREATE API: Missing courseId field");
      return NextResponse.json({ 
        error: 'Missing required field: courseId' 
      }, { status: 400 });
    }
    
    // Ensure courseId is a number
    let parsedCourseId;
    try {
      parsedCourseId = parseInt(courseId);
      if (isNaN(parsedCourseId)) {
        console.error(`VIDEO CREATE API: Invalid courseId format: ${courseId}`);
        return NextResponse.json({ 
          error: `Invalid courseId format: ${courseId}` 
        }, { status: 400 });
      }
      console.log(`VIDEO CREATE API: Parsed courseId as: ${parsedCourseId}`);
    } catch (e) {
      console.error(`VIDEO CREATE API: Error parsing courseId: ${e.message}`);
      return NextResponse.json({ 
        error: `Error parsing courseId: ${e.message}` 
      }, { status: 400 });
    }
    
    if (!data.title) {
      console.error("VIDEO CREATE API: Missing title field");
      return NextResponse.json({ 
        error: 'Missing required field: title' 
      }, { status: 400 });
    }
    
    // Get the YouTube video ID from either field name (camelCase or snake_case)
    let youtubeVideoId = data.youtubeVideoId || data.youtube_video_id;
    if (!youtubeVideoId) {
      console.error("VIDEO CREATE API: Missing youtubeVideoId field");
      return NextResponse.json({ 
        error: 'Missing required field: youtubeVideoId' 
      }, { status: 400 });
    }
    
    // Extract the video ID if a full URL was provided
    const originalVideoId = youtubeVideoId;
    youtubeVideoId = extractYoutubeVideoId(youtubeVideoId);
    
    if (youtubeVideoId !== originalVideoId) {
      console.log(`VIDEO CREATE API: Extracted YouTube ID '${youtubeVideoId}' from '${originalVideoId}'`);
    }
    
    // Validate YouTube ID format
    if (youtubeVideoId.length > 20) {
      console.warn(`VIDEO CREATE API: YouTube ID seems too long, truncating: ${youtubeVideoId}`);
      youtubeVideoId = youtubeVideoId.substring(0, 20);
    }
    
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(youtubeVideoId)) {
      console.error(`VIDEO CREATE API: Invalid YouTube ID format: ${youtubeVideoId}`);
      return NextResponse.json({ 
        error: 'Invalid YouTube ID format. Please use only the ID portion of the URL (e.g., "dQw4w9WgXcQ")' 
      }, { status: 400 });
    }
    
    // Get the duration and order with fallbacks
    const duration = data.duration || 0;
    const orderInCourse = data.orderInCourse || data.order_in_course || 1;
    
    // Map frontend field names to backend field names - ensure we use snake_case for the backend
    const videoData = {
      course_id: parsedCourseId,
      title: data.title,
      description: data.description || '',
      youtube_video_id: youtubeVideoId,
      duration: parseInt(duration),
      order_in_course: parseInt(orderInCourse)
    };
    
    console.log("VIDEO CREATE API: Prepared backend data:", JSON.stringify(videoData, null, 2));
    
    // Use a default URL if the environment variable is not set
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBaseUrl}/api/admin/courses/videos/create/`;
    
    console.log(`VIDEO CREATE API: Calling backend at ${apiUrl}`);
    
    // Point to the admin_panel endpoint instead of courses
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(videoData)
    });
    
    console.log(`VIDEO CREATE API: Backend response status: ${response.status}`);
    
    // Try to parse the response text first before assuming it's JSON
    const responseText = await response.text();
    console.log(`VIDEO CREATE API: Backend response text: ${responseText}`);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(`VIDEO CREATE API: Error parsing response as JSON: ${jsonError.message}`);
      responseData = { message: responseText };
    }
    
    if (!response.ok) {
      console.error("VIDEO CREATE API ERROR:", responseData);
      return NextResponse.json({ 
        error: responseData.error || responseData.message || 'Failed to create video' 
      }, { status: response.status });
    }
    
    // Standardize field names in the response
    const transformedResult = {
      ...responseData,
      videoId: responseData.videoId || responseData.video_id
    };
    
    console.log("VIDEO CREATE API: Success result:", transformedResult);
    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('VIDEO CREATE API EXCEPTION:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while creating the video' 
    }, { status: 500 });
  }
} 