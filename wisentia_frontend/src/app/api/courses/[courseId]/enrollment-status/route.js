import { NextResponse } from 'next/server';
// Use the existing auth service instead of the missing module
import { authService } from '@/services/auth';

export async function GET(request, { params }) {
  try {
    // Properly await params before destructuring
    const resolvedParams = await params;
    const courseId = resolvedParams.courseId;
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // We'll use the token directly since we don't need to verify it here
    // The backend will handle token verification
    
    // Check enrollment status from backend - use correct URL format
    console.log(`Checking enrollment status for course ID: ${courseId}`);
    // For debugging, log the full URL
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/courses/enrollment/status/${courseId}/`;
    console.log('API URL: ' + apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If backend returns 404, user is not enrolled
      if (response.status === 404) {
        return NextResponse.json({ is_enrolled: false });
      }
      
      // For other errors, pass along the error
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }
    
    // Return the enrollment status
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment status' },
      { status: 500 }
    );
  }
} 