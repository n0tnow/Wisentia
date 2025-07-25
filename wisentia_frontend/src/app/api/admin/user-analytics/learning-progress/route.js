import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET() {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    const response = await fetch(`${API_URL}/admin/user-analytics/learning-progress/`, {
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
    console.error('Error fetching learning progress:', error);
    return Response.json(
      { error: 'Failed to fetch learning progress' }, 
      { status: 500 }
    );
  }
} 