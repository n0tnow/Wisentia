import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Get request data
    const data = await request.json();
    const { nftId, walletAddress, transactionHash } = data;
    
    if (!nftId || !walletAddress || !transactionHash) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'NFT ID, wallet address, and transaction hash are required'
      }, { status: 400 });
    }
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value || '';
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'Please login to confirm purchases' 
      }, { status: 401 });
    }
    
    console.log(`Confirming purchase - NFT ID: ${nftId}, Wallet: ${walletAddress.substring(0, 10)}..., Tx: ${transactionHash.substring(0, 10)}...`);
    
    // Send confirmation request to backend
    const response = await fetch('http://localhost:8000/api/nfts/purchase/confirm/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        nftId,
        walletAddress,
        transactionHash
      })
    });
    
    // Log raw response for debugging
    const responseText = await response.text();
    console.log(`Backend confirmation response status: ${response.status}`);
    console.log(`Backend confirmation response body: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
    
    // Parse response if it's valid JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse backend response as JSON:', parseError);
      return NextResponse.json({ 
        error: 'Invalid response from server',
        message: 'Server returned invalid response format'
      }, { status: 500 });
    }
    
    if (!response.ok) {
      // Handle specific error types
      const errorMessage = responseData?.error || `API Error: ${response.status}`;
      
      // Handle rate limiting errors specially
      if (response.status === 429) {
        console.log('Rate limiting detected in confirm request, returning custom error');
        return NextResponse.json({ 
          error: 'Service temporarily busy',
          message: 'Too many requests, please try again in a moment',
          retryAfter: response.headers.get('retry-after') || 5
        }, { status: 429 });
      }
      
      // Check for already_owns_nft error
      if (responseData?.code === 'ALREADY_OWNS_NFT') {
        return NextResponse.json({ 
          success: true, // Return success anyway since the user owns the NFT
          message: 'You already own this NFT',
          alreadyOwned: true
        });
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        message: 'Could not confirm NFT purchase'
      }, { status: response.status });
    }
    
    console.log('Purchase confirmed successfully');
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Purchase confirmed successfully',
      subscriptionDetails: responseData.subscriptionDetails || null,
      userNftId: responseData.userNftId,
      nftId: responseData.nftId
    });
  } catch (error) {
    console.error(`NFT purchase confirmation error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
} 