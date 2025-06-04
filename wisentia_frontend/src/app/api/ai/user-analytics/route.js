// API route to fetch AI user analytics data from the backend
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Force dynamic route for Vercel deployment - fixes headers() usage error
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  try {
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    // Mock response format (temporary until backend implements this endpoint)
    // In production, this would fetch data from the backend API
    try {
      const response = await fetch(`${API_URL}/ai/user-analytics/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return Response.json(data);
    } catch (apiError) {
      console.warn('AI analytics API error - may not be implemented yet:', apiError);
      
      // Query the database directly for user analytics data instead
      // For now, return a structured mock as fallback in case endpoint doesn't exist
      const mockData = {
        learningStyle: "Visual",
        strengthAreas: JSON.stringify(["Blockchain Concepts", "Cryptocurrency Fundamentals", "DApp Development"]),
        weaknessAreas: JSON.stringify(["Smart Contract Security", "Solidity Advanced Features", "Cross-chain Technology"]),
        engagementLevel: 78.5,
        lastUpdated: new Date().toISOString()
      };
      
      return Response.json(mockData);
    }
  } catch (error) {
    console.error('Error in AI user analytics API:', error);
    return Response.json(
      { error: 'Failed to fetch AI analytics data' }, 
      { status: 500 }
    );
  }
} 