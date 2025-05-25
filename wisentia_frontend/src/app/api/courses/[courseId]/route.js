import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request, { params }) {
  try {
    // Properly await params before accessing
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    
    // Properly await headers before using
    const headersList = await headers();
    const token = headersList.get('Authorization');
    
    // Check for cache-busting params in the URL
    const { searchParams } = new URL(request.url);
    const cacheBuster = searchParams.get('t') || Date.now();
    
    // Log the request we're making for debugging
    console.log(`Fetching course details for courseId: ${courseId}, cache buster: ${cacheBuster}`);
    
    // Call the backend API to get course details
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/courses/${courseId}/?t=${cacheBuster}`;
    console.log(`Making request to: ${backendUrl}`);
    
    // Add more detailed logging to diagnose the issue
    try {
      const response = await fetch(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        console.error(`Backend API error: ${response.status}, ${response.statusText}`);
        const errorText = await response.text().catch(() => 'No error text available');
        console.error(`Error details: ${errorText}`);
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      
      const courseData = await response.json();
      
      // Log the raw data received from backend
      console.log("Raw course data received from backend:", courseData);
      
      // Ensure consistent naming conventions for thumbnailURL
      if (courseData.ThumbnailURL && !courseData.thumbnailURL) {
        courseData.thumbnailURL = courseData.ThumbnailURL;
      }
      
      // Add default thumbnail URL if missing
      if (!courseData.thumbnailURL && !courseData.ThumbnailURL) {
        courseData.thumbnailURL = '/images/course-default.jpg';
      }
      
      // Ensure enrollment count is properly set
      if (courseData.EnrolledUsers !== undefined) {
        courseData.studentsCount = courseData.EnrolledUsers;
      }
      
      // Add additional processing for duration calculation
      if (courseData && courseData.videos && Array.isArray(courseData.videos)) {
        // Calculate total duration from videos if not already provided
        if (courseData.totalDuration === undefined) {
          courseData.totalDuration = courseData.videos.reduce((total, video) => {
            return total + (video.Duration || 0);
          }, 0);
        }
        
        // Add video count if not provided
        if (courseData.VideoCount === undefined) {
          courseData.VideoCount = courseData.videos.length;
        }
      }
      
      // Log the processed data
      console.log(`Successfully retrieved course data for ${courseId}`);
      console.log("Processed enrollment count:", courseData.studentsCount);
      
      return NextResponse.json(courseData);
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { error: `Failed to fetch course: ${fetchError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
} 