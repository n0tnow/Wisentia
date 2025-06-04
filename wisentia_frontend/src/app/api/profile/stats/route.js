import { NextResponse } from 'next/server';

// Force dynamic route for Vercel deployment - fixes headers() usage error
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  try {
    // Get token from headers
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch user stats from analytics endpoint
    const statsResponse = await fetch(`${API_URL}/analytics/user-stats/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!statsResponse.ok) {
      throw new Error(`Analytics API error: ${statsResponse.status}`);
    }
    
    const statsData = await statsResponse.json();
    
    return NextResponse.json(statsData);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile statistics' },
      { status: 500 }
    );
  }
} 