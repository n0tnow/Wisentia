import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; // Important for token extraction from request headers

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  // Get token information
  let token = '';
  try {
    // Get headers from the request - properly await headers()
    const headersList = await headers();
    
    // Try to get token from Authorization header first
    const authHeader = headersList.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // If no token in header, check if it's in the request object directly
    if (!token) {
      // Try to get from cookies if not in headers
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
    
    // Last resort: check local storage via client-side JS (can't be done here)
    // We'll rely on the client passing the token in Authorization header
  } catch (error) {
    console.error('Token access error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
  }
  
  // Validate token exists
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    // Fetch user profile from backend
    const response = await fetch(`${API_URL}/auth/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching profile: ${response.status}`, errorText);
      
      return NextResponse.json(
        { error: `Failed to fetch profile: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    // Get the profile data
    const profileData = await response.json();
    return NextResponse.json(profileData);
    
  } catch (error) {
    console.error('API error when fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  // Get token information
  let token = '';
  try {
    // Properly await headers()
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token access error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
  }
  
  // Validate token exists
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  try {
    // Get request body
    const updateData = await request.json();
    
    // Send update to backend
    const response = await fetch(`${API_URL}/auth/profile/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || `Failed to update profile: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    // Return updated profile
    const updatedProfile = await response.json();
    return NextResponse.json(updatedProfile);
    
  } catch (error) {
    console.error('API error when updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 