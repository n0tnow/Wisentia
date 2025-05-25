// src/app/api/quizzes/attempts/[attemptId]/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Access attemptId directly without destructuring
    const attemptId = params.attemptId;
    
    // Get token from request headers (sent from the client side)
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Construct the backend URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/api/quizzes/results/${attemptId}/`;
    
    console.log(`Making backend request to: ${url}`);
    
    // Make request to backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store'
    });

    // Forward response from backend
    const data = await response.json();
    if (!response.ok) {
      console.error(`Error from backend: ${response.status}`, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quiz attempt details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempt details' },
      { status: 500 }
    );
  }
} 