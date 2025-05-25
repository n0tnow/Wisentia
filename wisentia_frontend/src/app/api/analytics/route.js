// API route to fetch analytics data from the backend
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Helper function to make API requests to the backend
 */
const fetchFromBackend = async (endpoint, token) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Route handler for GET /api/analytics/user-stats
 */
export async function GET(request) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    // Extract the endpoint from the request URL
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Map frontend routes to backend routes
    let backendEndpoint;
    
    if (pathname.includes('/user-stats')) {
      backendEndpoint = '/analytics/user-stats/';
    } else if (pathname.includes('/learning-progress')) {
      backendEndpoint = '/analytics/learning-progress/';
    } else if (pathname.includes('/time-spent')) {
      backendEndpoint = '/analytics/time-spent/'; 
    } else if (pathname.includes('/activity-summary')) {
      backendEndpoint = '/analytics/user-activity-summary/';
    } else {
      return Response.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    
    const data = await fetchFromBackend(backendEndpoint, token);
    return Response.json(data);
  } catch (error) {
    console.error('Error in analytics API route:', error);
    return Response.json(
      { error: 'Failed to fetch analytics data' }, 
      { status: 500 }
    );
  }
} 