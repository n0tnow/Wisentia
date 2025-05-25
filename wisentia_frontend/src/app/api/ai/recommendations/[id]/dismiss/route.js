import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function POST(request, { params }) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    const recommendationId = params.id;
    
    if (!recommendationId) {
      return Response.json(
        { error: 'Recommendation ID is required' }, 
        { status: 400 }
      );
    }
    
    const response = await fetch(`${API_URL}/ai/recommendations/${recommendationId}/dismiss/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return Response.json(
      { error: 'Failed to dismiss recommendation' }, 
      { status: 500 }
    );
  }
} 