import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to get token from cookies or headers - updated to properly await cookies
async function getToken(req) {
  // Properly await the cookies() call
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  
  if (token) return token;
  
  // Fallback to Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

export async function GET(req) {
  try {
    const token = await getToken(req);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || 1;
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || 'newest';
    
    // Construct backend API URL with query parameters
    let apiUrl = `${API_URL}/community/posts/?page=${page}`;
    if (category) apiUrl += `&category=${encodeURIComponent(category)}`;
    if (search) apiUrl += `&search=${encodeURIComponent(search)}`;
    if (sort) apiUrl += `&sort=${encodeURIComponent(sort)}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch posts' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const token = await getToken(req);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Title, content and category are required' },
        { status: 400 }
      );
    }
    
    // Log request body to help debug
    console.log('Creating post with data:', {
      title: body.title,
      category: body.category,
      pointsCost: body.pointsCost || 0
    });
    
    const response = await fetch(`${API_URL}/community/posts/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: body.title,
        content: body.content,
        category: body.category,
        pointsCost: body.pointsCost || 0
      })
    });
    
    // Log complete response for debugging
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
      console.log('API response:', data);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      console.error('Error from backend:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to create post' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error('Error creating community post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 