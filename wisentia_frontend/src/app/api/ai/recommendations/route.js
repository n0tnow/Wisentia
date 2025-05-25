// API route to fetch AI recommendations data from the backend
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    const response = await fetch(`${API_URL}/ai/recommendations/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    return Response.json(
      { error: 'Failed to fetch recommendations' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    const body = await request.json();
    
    // Extract recommendation ID from URL if dismissing a recommendation
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Check if it's a dismiss action
    if (pathname.includes('/dismiss/')) {
      const parts = pathname.split('/');
      const recommendationId = parts[parts.length - 2]; // Get the ID before /dismiss/
      
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
    }
    
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in AI recommendations API:', error);
    return Response.json(
      { error: 'Failed to process AI recommendation action' }, 
      { status: 500 }
    );
  }
} 