import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const response = await fetch(`${backendUrl}/api/admin/quizzes/categories/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching quiz categories:', error);
    
    // Return fallback categories if backend fails
    const fallbackCategories = [
      { id: 1, name: 'Technology', count: 0 },
      { id: 2, name: 'Science', count: 0 },
      { id: 3, name: 'Mathematics', count: 0 },
      { id: 4, name: 'Programming', count: 0 },
      { id: 5, name: 'Business', count: 0 },
      { id: 6, name: 'General', count: 0 }
    ];
    
    return NextResponse.json(fallbackCategories);
  }
} 