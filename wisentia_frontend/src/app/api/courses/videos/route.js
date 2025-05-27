import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const category = searchParams.get('category');
    
    // Build query parameters for backend
    const queryParams = new URLSearchParams();
    if (courseId) queryParams.append('course_id', courseId);
    if (category) queryParams.append('category', category);
    
    // Fetch from backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/courses/videos/?${queryParams.toString()}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Backend API returned error: ${response.status}`);
      return NextResponse.json([]);
    }
    
    const videos = await response.json();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json([]);
  }
} 