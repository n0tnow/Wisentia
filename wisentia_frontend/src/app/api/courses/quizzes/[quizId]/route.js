import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { quizId } = params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authHeader = req.headers.get('authorization');

  try {
    const response = await fetch(`${backendUrl}/api/quizzes/quiz/${quizId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quiz details', details: error.message }, { status: 500 });
  }
} 