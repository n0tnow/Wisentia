import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Specialized API endpoint just for course duration
export async function GET(request, { params }) {
  try {
    // Properly await params before accessing
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    
    // Properly await headers before using
    const headersList = await headers();
    const token = headersList.get('Authorization');
    
    console.log(`Fetching duration data for courseId: ${courseId}`);
    
    // Call the backend API to get course details
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/courses/${courseId}/`;
    console.log(`Making request to backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || ''
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`Backend API error: ${response.status}, ${response.statusText}`);
      return NextResponse.json({ duration: 0, formatted: '0 minutes' }, { status: 200 });
    }
    
    const courseData = await response.json();
    console.log(`Received course data for ${courseId}:`, JSON.stringify({
      hasVideos: !!courseData.videos,
      videoCount: courseData.videos?.length,
      totalDuration: courseData.totalDuration,
      formattedDuration: courseData.formattedDuration
    }));
    
    // First try to use the pre-calculated values from backend
    if (courseData.totalDuration !== undefined && courseData.formattedDuration) {
      console.log(`Using pre-calculated duration values: ${courseData.totalDuration}s, formatted: "${courseData.formattedDuration}"`);
      return NextResponse.json({
        duration: courseData.totalDuration,
        formatted: courseData.formattedDuration,
        videoCount: courseData.TotalVideos || courseData.videos?.length || 0
      });
    }
    
    // Otherwise calculate manually
    // Calculate total duration
    let totalDuration = 0;
    let videoCount = 0;
    
    // If we have video data
    if (courseData && courseData.videos && Array.isArray(courseData.videos)) {
      videoCount = courseData.videos.length;
      console.log(`Found ${videoCount} videos, calculating total duration...`);
      
      // Log each video's duration for debugging
      courseData.videos.forEach((video, idx) => {
        console.log(`Video ${idx+1}: Duration = ${video.Duration !== undefined ? video.Duration : 'null/undefined'}`);
      });
      
      totalDuration = courseData.videos.reduce((total, video) => {
        // Handle null/undefined/0 duration values
        const duration = video.Duration;
        if (duration && typeof duration === 'number' && !isNaN(duration)) {
          return total + duration;
        }
        return total;
      }, 0);
    } 
    // If we have TotalDuration from the database
    else if (courseData && typeof courseData.totalDuration === 'number') {
      totalDuration = courseData.totalDuration;
    }
    
    console.log(`Calculated total duration for course ${courseId}: ${totalDuration} seconds`);
    
    // Format the duration for display
    let formattedDuration = formatDuration(totalDuration);
    
    return NextResponse.json({
      duration: totalDuration,
      formatted: formattedDuration,
      videoCount: videoCount
    });
  } catch (error) {
    console.error('Error fetching course duration:', error);
    return NextResponse.json({
      duration: 0,
      formatted: '0 minutes',
      error: error.message
    }, { status: 200 });
  }
}

// Format duration from seconds to hours and minutes
function formatDuration(totalSeconds) {
  if (totalSeconds === undefined || totalSeconds === null) return '-';
  if (totalSeconds === 0) return '0 minutes';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  } else {
    return `${minutes}m`;
  }
} 