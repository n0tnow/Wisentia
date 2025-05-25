import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request, { params }) {
  try {
    // Ensure params is properly awaited if it's a promise
    const resolvedParams = await params;
    const courseId = String(resolvedParams.courseId);
    
    // Get headers with proper awaiting if needed
    const headersList = await headers();
    const token = headersList.get('Authorization');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Call the backend API to get enrollment status
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/courses/enrollment/status/${courseId}/`;
    
    console.log(`Fetching enrollment status from: ${backendUrl}`);
    
    // Make sure token has Bearer prefix
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });
    
    // Try to parse the response body
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Error parsing enrollment status response:', e);
      data = { error: 'Invalid response from server' };
    }
    
    if (!response.ok) {
      // Return a more specific error message
      const errorMessage = data.error || data.detail || 
        (response.status === 404 ? 'Course not found' : 'Failed to fetch enrollment status');
      
      console.error(`Enrollment status error: ${errorMessage}, Status: ${response.status}`);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    console.log('Enrollment status fetched successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching enrollment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment status. Please try again later.' },
      { status: 500 }
    );
  }
} 