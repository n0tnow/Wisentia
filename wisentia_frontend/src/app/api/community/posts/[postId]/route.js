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

export async function GET(req, context) {
  try {
    // Properly extract and await params
    const params = await context.params;
    const postId = params.postId;
    
    const token = await getToken(req);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_URL}/community/posts/${postId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch post details' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching post details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add comment to a post
export async function POST(req, context) {
  try {
    // Properly extract and await params
    const params = await context.params;
    const postId = params.postId;
    
    const token = await getToken(req);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    // Log request body to help debug
    console.log('Creating comment for post:', postId, {
      content: body.content.substring(0, 50) + (body.content.length > 50 ? '...' : ''),
      parentCommentId: body.parentCommentId
    });
    
    const response = await fetch(`${API_URL}/community/posts/${postId}/comment/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: body.content,
        parentCommentId: body.parentCommentId || null
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
        { error: data.error || 'Failed to add comment' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 