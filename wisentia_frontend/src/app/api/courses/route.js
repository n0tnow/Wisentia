import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = searchParams.get('page') || '1';
    
    // Build query parameters for backend
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (difficulty) queryParams.append('difficulty', difficulty);
    if (search) queryParams.append('search', search);
    if (page) queryParams.append('page', page);
    
    // Fetch from backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/courses/?${queryParams.toString()}`;
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      // If there's an error from the backend, return an empty array instead of mock data
      console.error(`Backend API returned error: ${response.status}`);
      return NextResponse.json([]);
    }
    
    const courses = await response.json();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return empty array on error
    return NextResponse.json([]);
  }
} 