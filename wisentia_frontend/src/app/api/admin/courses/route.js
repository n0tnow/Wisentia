// app/api/admin/courses/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MOCK_COURSES, generateMockCourseResponse } from './mock-data';

// Force dynamic route for Vercel deployment - fixes cookies() usage error
export const dynamic = 'force-dynamic';

// Helper function to get token - updated to be async
async function getToken(request) {
  try {
    // Try to get token from cookies first
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('access_token');
    const token = tokenCookie?.value || '';
    
    // If no token in cookies, check headers
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }
    
    return token;
  } catch (error) {
    console.error('Token access error:', error);
    return '';
  }
}

export async function GET(request) {
  // Get token
  const token = await getToken(request);
  console.log('API Proxy: Courses - Token info:', token ? `${token.substring(0, 15)}...` : 'None');
  
  try {
    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 1;
    const pageSize = searchParams.get('pageSize') || 20;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const status = searchParams.get('status') || '';
    
    // Check if fallback data was explicitly requested
    const useFallback = searchParams.get('fallback') === 'true';
    if (useFallback) {
      console.log('Using fallback data as requested');
      return generateFallbackResponse(page, pageSize);
    }
    
    // Convert parameters to query string
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      search,
      category,
      difficulty,
      status
    }).toString();
    
    // Backend API URL - use NEXT_PUBLIC_API_URL or default to localhost
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = `${apiBaseUrl}/api/admin/content/?type=courses&${queryParams}`;
    console.log('Courses Backend API request:', backendUrl);
    
    // Set a timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // API request to backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store',
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    console.log('Courses Backend response status:', response.status);
    
    if (!response.ok) {
      // Handle error state
      console.error('Courses Backend API error:', response.status);
      
      // If error is 500 or timeout, return fallback data
      if (response.status === 500 || response.status === 504) {
        console.log('Backend unavailable, using fallback data');
        return generateFallbackResponse(page, pageSize);
      }
      
      const responseText = await response.text();
      
      // Check for HTML response
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html')) {
        console.error('HTML response received');
        return generateFallbackResponse(page, pageSize);
      }
      
      try {
        // Try to parse JSON response
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { 
          status: response.status,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': 'application/json'
          }
        });
      } catch (e) {
        // If JSON cannot be parsed, return as text
        return NextResponse.json(
          { error: 'API error', message: responseText.substring(0, 500) },
          { 
            status: response.status,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }
    
    // Get JSON response
    const data = await response.json();
    console.log('Courses Backend API response received successfully');
    
    // Transform the response to match what the frontend expects
    // The backend returns 'items' but the frontend expects 'courses'
    const transformedData = {
      courses: data.items || [],
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 20,
      totalPages: data.totalPages || 1
    };
    
    // Return response to frontend
    return NextResponse.json(transformedData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Courses API Proxy error:', error);
    // In case of fetch error or timeout, return fallback data with default values
    if (error.name === 'AbortError') {
      console.log('Request timed out, using fallback data');
    }
    
    // Make sure we have values for page and pageSize even if URL parsing failed
    let page = 1;
    let pageSize = 20;
    
    try {
      // Try to get params again if possible
      const { searchParams } = new URL(request.url);
      page = searchParams.get('page') || 1;
      pageSize = searchParams.get('pageSize') || 20;
    } catch (e) {
      console.log('Failed to get URL parameters, using defaults');
    }
    
    return generateFallbackResponse(page, pageSize);
  }
}

// Function to generate fallback response with sample data
function generateFallbackResponse(page = 1, pageSize = 20) {
  return NextResponse.json(
    generateMockCourseResponse(page, pageSize),
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Using-Fallback': 'true'
      }
    }
  );
}

export async function POST(request) {
  // Get token
  const token = await getToken(request);
  
  try {
    // Get request data
    const requestData = await request.json();
    
    // Backend API URL - use NEXT_PUBLIC_API_URL or default to localhost
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = `${apiBaseUrl}/api/admin/courses/create/`;
    console.log('Courses Backend POST request:', backendUrl);
    
    // Send API request to backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: 'API error', message: errorText.substring(0, 500) };
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course', message: error.message },
      { status: 500 }
    );
  }
}