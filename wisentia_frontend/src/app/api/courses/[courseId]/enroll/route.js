import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request, { params }) {
  try {
    // Ensure params is properly awaited if it's a promise
    const resolvedParams = await params;
    const courseId = String(resolvedParams.courseId);
    
    console.log(`Enrolling in course ID: ${courseId}`);
    
    // Get headers with proper awaiting if needed
    const headersList = await headers();
    const token = headersList.get('Authorization');
    
    if (!token) {
      console.error('No authorization token provided for enrollment');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Call the backend API to enroll in the course - FIX URL FORMAT
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/${courseId}/enroll/`;
    console.log(`Making enrollment request to: ${backendUrl}`);
    
    // Make sure token has Bearer prefix
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });
    
    console.log(`Enrollment response status: ${response.status}`);
    
    // Try to parse the response body
    let data;
    try {
      data = await response.json();
      console.log('Enrollment response data:', data);
    } catch (e) {
      console.error('Error parsing enrollment response:', e);
      data = { error: 'Invalid response from server' };
    }
    
    if (!response.ok) {
      // Return a more specific error message
      const errorMessage = data.error || data.detail || 
        (response.status === 404 ? 'Course not found' : 'Failed to enroll in course');
      
      console.error(`Enrollment error: ${errorMessage}`);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    console.log('Enrollment successful');
    return NextResponse.json({
      ...data,
      success: true
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course. Please try again later.' },
      { status: 500 }
    );
  }
} 