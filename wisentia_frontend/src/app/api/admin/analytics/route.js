// app/api/admin/analytics/route.js
import { headers } from 'next/headers';

// Force dynamic route for Vercel deployment - fixes headers() usage error
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * OPTIMIZED Analytics API Route Handler
 * Features:
 * - Response caching with headers
 * - Connection timeout optimization
 * - Faster response processing
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    console.log('📊 [ANALYTICS API] Request started');
    
    // OPTIMIZATION: Faster fetch with timeout and optimized headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/admin/analytics/`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache', // Force fresh data from backend
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`📊 [ANALYTICS API] Backend error: ${response.status}`);
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;
    
    console.log(`📊 [ANALYTICS API] Response completed in ${responseTime}ms`);
    
    // OPTIMIZATION: Return response with caching headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=120', // Cache for 1-2 minutes
        'X-Response-Time': `${responseTime}ms`,
        'X-Data-Source': 'backend',
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`📊 [ANALYTICS API] Error after ${responseTime}ms:`, error.message);
    
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      return Response.json(
        { 
          error: 'Request timeout - analytics data took too long to load',
          responseTime,
          suggestion: 'Try refreshing the page or contact support if this persists'
        }, 
        { status: 408 } // Request Timeout
      );
    }
    
    return Response.json(
      { 
        error: 'Failed to fetch analytics data', 
        details: error.message,
        responseTime,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}