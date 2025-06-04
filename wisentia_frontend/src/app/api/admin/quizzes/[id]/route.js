import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic route for Vercel deployment - fixes cookies() usage error
export const dynamic = 'force-dynamic';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Check if user is admin based on cookies
function checkAdminAuth(cookieStore) {
  try {
    const userCookie = cookieStore.get('user');
    const tokenCookie = cookieStore.get('access_token');
    
    if (!userCookie || !tokenCookie) {
      return { isAuthenticated: false, isAdmin: false, token: null };
    }
    
    const userData = JSON.parse(userCookie.value);
    
    // Check if user is admin
    const isAdmin = userData.role === 'admin' || userData.UserRole === 'admin';
    
    return {
      isAuthenticated: true,
      isAdmin,
      token: tokenCookie.value,
      user: userData
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, isAdmin: false, token: null };
  }
}

export async function GET(request, { params }) {
  try {
    const cookieStore = cookies();
    const auth = checkAdminAuth(cookieStore);
    
    // Check if user is authenticated and is an admin
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const quizId = params.id;
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }
    
    // Call backend API to get quiz details
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      }
    });
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        error = { detail: 'Failed to fetch quiz' };
      }
      return NextResponse.json(
        { error: error.detail || error.error || 'Failed to fetch quiz' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const cookieStore = cookies();
    const auth = checkAdminAuth(cookieStore);
    
    // Check if user is authenticated and is an admin
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const quizId = params.id;
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Call backend API to update quiz
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        error = { detail: 'Failed to update quiz' };
      }
      return NextResponse.json(
        { error: error.detail || error.error || 'Failed to update quiz' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const auth = checkAdminAuth(cookieStore);
    
    // Check if user is authenticated and is an admin
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const quizId = params.id;
    
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }
    
    // Call backend API to delete quiz
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      }
    });
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        error = { detail: 'Failed to delete quiz' };
      }
      return NextResponse.json(
        { error: error.detail || error.error || 'Failed to delete quiz' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ message: 'Quiz deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
