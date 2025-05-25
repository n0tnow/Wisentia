import { NextResponse } from 'next/server';

/**
 * Prepare NFT data for a quest (POST)
 * 
 * This endpoint forwards requests to the backend to prepare NFT data for a quest
 */
export async function POST(request, { params }) {
  try {
    const { questId } = params;
    
    if (!questId) {
      return NextResponse.json(
        { error: 'Quest ID is required' },
        { status: 400 }
      );
    }
    
    // Extract the token from the request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No valid authentication token provided' },
        { status: 401 }
      );
    }
    
    // Forward the request to the backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/quests/${questId}/prepare-nft/`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });
    
    // Get the response from the backend
    const responseData = await response.json();
    
    // Return the response with the appropriate status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error preparing NFT data for quest:', error);
    return NextResponse.json(
      { error: 'Failed to prepare NFT data', details: error.message },
      { status: 500 }
    );
  }
} 