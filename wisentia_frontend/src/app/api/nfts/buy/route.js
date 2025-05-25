import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Contract address to use as fallback if the backend doesn't provide one
const CONTRACT_ADDRESS = '0xA0d87B07774193d8685258573597269EdbE51412';

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
    
    // Get token from cookies - properly await cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value || '';
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'Please login to purchase NFTs' 
      }, { status: 401 });
    }
    
    try {
      // Send purchase request to backend
      const response = await fetch('http://localhost:8000/api/nfts/purchase/', {
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
        let errorCode = null;
        try {
          const errorText = await response.text();
          let errorData = {};
          try {
            errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
            errorCode = errorData.code || null;
          } catch (parseError) {
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          // If we can't even read the response text, use the status code
          console.error('Failed to parse error response:', parseError);
        }
        
        // Special handling for specific errors
        if (errorCode === 'ALREADY_OWNS_NFT') {
          return NextResponse.json({ 
            error: errorMessage,
            code: errorCode,
            message: 'You already own this NFT'
          }, { status: 400 });
        }
        
        // Special handling for rate limiting errors (429)
        if (response.status === 429) {
          console.log('Rate limiting detected');
          return NextResponse.json({ 
            error: 'Service temporarily busy',
            message: 'Too many requests, please try again in a moment',
            retryAfter: response.headers.get('retry-after') || 5
          }, { status: 429 });
        }
        
        return NextResponse.json({ 
          error: errorMessage,
          message: 'Could not purchase NFT'
        }, { status: response.status });
      }
      
      const responseData = await response.json();
      
      // Eğer transactionData yoksa, varsayılan bir değer oluştur
      if (!responseData.transactionData) {
        console.log('Backend did not provide transactionData, creating default structure');
        responseData.transactionData = {
          to: CONTRACT_ADDRESS,
          // ETH değeri olarak hex formatında NFT fiyatını veya 0 kullan
          value: '0x0',  
          // EIP-1559 transaction type
          type: '0x2'
        };
      }
      
      // Clean up transaction data to prevent MetaMask errors
      if (responseData.transactionData) {
        // If 'to' is missing or empty, use the contract address
        if (!responseData.transactionData.to) {
          console.log('Backend did not provide a recipient address, using default contract address');
          responseData.transactionData.to = CONTRACT_ADDRESS;
        }
        
        // Make sure 'to' address is a valid Ethereum address format
        if (responseData.transactionData.to && !responseData.transactionData.to.startsWith('0x')) {
          responseData.transactionData.to = '0x' + responseData.transactionData.to;
        }
        
        // ALWAYS remove data field for ETH transfers to prevent "External transactions to internal accounts cannot include data" error
        if (responseData.transactionData.data) {
          delete responseData.transactionData.data;
        }
        
        // Remove any zero value fields
        if (responseData.transactionData.value === '0x0' || responseData.transactionData.value === '0x') {
          delete responseData.transactionData.value;
        }
        
        // Let MetaMask estimate gas - remove gas to avoid issues
        if (responseData.transactionData.gas) {
          delete responseData.transactionData.gas;
        }
      }
      
      // Return transaction data for MetaMask
      return NextResponse.json({
        success: true,
        message: 'NFT purchase initiated',
        transactionData: responseData.transactionData || null
      });
    } catch (fetchError) {
      // Handle network errors or server unavailable
      return NextResponse.json({ 
        error: 'Service temporarily unavailable',
        message: 'Unable to connect to the purchase service. Please try again later.'
      }, { status: 503 });
    }
  } catch (error) {
    console.error(`NFT purchase API call error:`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message
    }, { status: 500 });
  }
} 