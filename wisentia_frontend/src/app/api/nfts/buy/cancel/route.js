import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Get request data
    const data = await request.json();
    const { nftId, walletAddress } = data;
    
    if (!nftId || !walletAddress) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'NFT ID and wallet address are required'
      }, { status: 400 });
    }
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value || '';
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'Please login to cancel purchases' 
      }, { status: 401 });
    }
    
    // Send cancellation request to backend
    const response = await fetch('http://localhost:8000/api/nfts/purchase/cancel/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        nftId,
        walletAddress
      })
    });
    
    if (!response.ok) {
      // Handle error without trying to parse JSON if response isn't valid JSON
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Not JSON, use the text directly
          if (errorText) errorMessage = errorText;
        }
      } catch (parseError) {
        console.error('Failed to parse error response as JSON:', parseError);
      }
      
      // Handle rate limiting errors specially
      if (response.status === 429) {
        console.log('Rate limiting detected in cancel request, returning custom error');
        return NextResponse.json({ 
          error: 'Service temporarily busy',
          message: 'Too many requests, please try again in a moment',
          retryAfter: response.headers.get('retry-after') || 5
        }, { status: 429 });
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        message: 'Could not cancel NFT purchase'
      }, { status: response.status });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Purchase cancelled successfully'
    });
  } catch (error) {
    console.error(`NFT purchase cancellation error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
} 