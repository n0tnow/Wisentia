import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token is missing' }, { status: 401 });
    }

    const { courseId } = await params;
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Fetch quiz data from the backend
    console.log(`Calling backend API: http://localhost:8000/api/quizzes/course/${courseId}/`);
    const timestamp = new Date().getTime(); // Add cache busting
    const response = await fetch(`http://localhost:8000/api/quizzes/course/${courseId}/?_=${timestamp}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    // Log status for troubleshooting
    console.log(`Backend API response status: ${response.status}`);

    // Handle potential errors from the backend
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Error fetching course quizzes';
      
      try {
        // Try to parse as JSON if possible
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.detail || errorMessage;
        console.error('Error fetching course quizzes from backend:', errorData);
      } catch {
        // If not JSON, use text
        console.error('Error fetching course quizzes from backend:', errorText);
      }
      
      return NextResponse.json(
        { error: errorMessage }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in course quizzes API route:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching course quizzes' }, 
      { status: 500 }
    );
  }
} 