import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { refresh_token } = await request.json();
    
    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    console.log('Attempting to refresh token');
    
    // Call the backend API to refresh the token
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/refresh-token/`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token }),
    });
    
    if (!response.ok) {
      console.error(`Failed to refresh token, status: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: response.status }
      );
    }
    
    const tokenData = await response.json();
    console.log('Token refreshed successfully');
    
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
} 