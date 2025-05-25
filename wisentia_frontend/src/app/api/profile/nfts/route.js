import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

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
    
    // Fetch user NFT data from the NFTs API endpoint
    const response = await fetch(`${API_URL}/nfts/user/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NFTs API error: ${response.status}`);
    }
    
    const nftData = await response.json();
    
    return NextResponse.json(nftData);
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user NFT data' },
      { status: 500 }
    );
  }
} 