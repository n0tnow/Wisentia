import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
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

    // Extract quizId from params - fixed with await
    const { quizId } = await params;
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Parse request body to get answers
    const body = await request.json();
    
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: 'Answers array is required in request body' }, { status: 400 });
    }

    // Fetch quiz submission from the backend - corrected URL path
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const apiUrl = `${backendUrl}/api/quizzes/submit/${quizId}/`;

    console.log(`Submitting quiz answers to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Error submitting quiz: ${error}`);
      return NextResponse.json(
        { error: `Failed to submit quiz: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Quiz submitted successfully for quiz ID: ${quizId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in quiz submission API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 