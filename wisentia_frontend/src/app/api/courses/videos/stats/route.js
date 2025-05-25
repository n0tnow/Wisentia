import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request) {
  try {
    const headersList = headers();
    const token = headersList.get('Authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Call the backend API to get user video stats
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/courses/videos/stats/`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.warn(`Error fetching user video stats: ${response.status}`);
      
      // Return empty data instead of error
      return NextResponse.json({
        videoStats: [],
        totalWatched: 0,
        totalCompleted: 0
      });
    }
    
    const statsData = await response.json();
    return NextResponse.json(statsData);
  } catch (error) {
    console.error('Error fetching user video stats:', error);
    
    // Return empty data structure on error
    return NextResponse.json({
      videoStats: [],
      totalWatched: 0,
      totalCompleted: 0
    });
  }
} 