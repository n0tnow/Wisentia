// src/app/api/admin/nfts/create/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Create a new NFT (POST)
 * 
 * This endpoint forwards requests to the backend NFT creation API.
 * It requires admin authentication.
 */
export async function POST(request) {
  try {
    // Extract the token from the request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No valid authentication token provided' },
        { status: 401 }
      );
    }
    
    // Extract NFT data from the request
    const nftData = await request.json();
    
    // Forward the request to the backend
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/nfts/create/`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(nftData)
    });
    
    // Get the response from the backend
    const responseData = await response.json();
    
    // Return the response with the appropriate status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Error creating NFT:', error);
    return NextResponse.json(
      { error: 'Failed to create NFT', details: error.message },
      { status: 500 }
    );
  }
}