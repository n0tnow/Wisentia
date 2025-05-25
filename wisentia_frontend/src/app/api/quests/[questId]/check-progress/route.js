import { NextResponse } from 'next/server';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request, { params }) {
  // Get quest ID from route params
  const questId = params?.questId;
  
  if (!questId) {
    return NextResponse.json(
      { error: 'Quest ID is required', success: false },
      { status: 400 }
    );
  }
  
  try {
    // Get auth token from header
    let authHeader = {};
    const authorization = request.headers.get('authorization');
    
    if (authorization) {
      authHeader = { 'Authorization': authorization };
    }
    
    // Return error if no auth token
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authentication required to check quest progress', success: false },
        { status: 401 }
      );
    }
    
    // Call backend API to check progress
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/check-progress/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      let errorData = { error: `Failed to check quest progress: ${response.status}` };
      try {
        errorData = await response.json();
      } catch (e) {
        console.error("Error parsing response:", e);
      }
      
      return NextResponse.json(
        { 
          error: errorData.error || errorData.detail || `Failed to check quest progress: ${response.status}`,
          success: false 
        },
        { status: response.status }
      );
    }
    
    // Parse response data
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing success response:", e);
      data = { success: true, message: "Progress checked" };
    }
    
    // Return formatted response
    return NextResponse.json({
      ...data,
      success: true
    });
    
  } catch (error) {
    console.error('Error checking quest progress:', error);
    return NextResponse.json(
      { error: 'Server error', success: false, details: error.message },
      { status: 500 }
    );
  }
} 