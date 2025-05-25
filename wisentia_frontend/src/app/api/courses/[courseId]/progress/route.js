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

    // Await and extract the courseId from params
    const courseId = params.courseId;
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Fetch progress data from the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const apiUrl = `${backendUrl}/api/courses/${courseId}/progress`;

    console.log(`Fetching course progress from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Error fetching course progress: ${error}`);
      return NextResponse.json(
        { error: `Failed to fetch progress: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Course progress fetched successfully for course ${courseId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in course progress API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 