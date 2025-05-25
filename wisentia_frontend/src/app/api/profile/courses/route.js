import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  try {
    // Get token from headers
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch user course data from learning progress endpoint
    const courseResponse = await fetch(`${API_URL}/analytics/learning-progress/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!courseResponse.ok) {
      throw new Error(`Learning progress API error: ${courseResponse.status}`);
    }
    
    const progressData = await courseResponse.json();
    
    // Extract only course-related data
    const courseData = {
      ongoingCourses: progressData.ongoingCourses || [],
      completedCourses: progressData.completedCourses || [],
      categoryStats: progressData.categoryStats || {}
    };
    
    return NextResponse.json(courseData);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user course data' },
      { status: 500 }
    );
  }
} 