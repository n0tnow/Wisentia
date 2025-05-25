import { NextResponse } from 'next/server';

// IPFS gateway URLs to try
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.infura.io/ipfs/'
];

/**
 * Resolves IPFS URIs to content through public gateways
 */
export async function GET(request) {
  // Get the URI to resolve from query parameter
  const { searchParams } = new URL(request.url);
  const uri = searchParams.get('uri');
  
  if (!uri) {
    return NextResponse.json({ 
      error: 'Missing URI parameter' 
    }, { status: 400 });
  }
  
  // Handle IPFS protocol URIs
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    return await fetchFromIPFSGateways(cid);
  }
  
  // Handle direct HTTP URIs - just proxy the content
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return await proxyExternalContent(uri);
  }
  
  // If we can't determine the type, return an error
  return NextResponse.json({ 
    error: 'Invalid URI format. Must be ipfs:// or http(s)://'
  }, { status: 400 });
}

/**
 * Try to fetch content from multiple IPFS gateways
 */
async function fetchFromIPFSGateways(cid) {
  // Try each gateway in sequence until one works
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${cid}`;
      const response = await fetch(url, { method: 'GET' });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const data = await response.blob();
        
        return new NextResponse(data, {
          status: 200,
          headers: {
            'Content-Type': contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch from gateway ${gateway}:`, error);
      // Continue to next gateway
    }
  }
  
  // If all gateways fail, return an error
  return NextResponse.json({ 
    error: 'Failed to fetch content from all IPFS gateways',
    cid: cid
  }, { status: 502 });
}

/**
 * Proxy external content from HTTP URLs
 */
async function proxyExternalContent(url) {
  try {
    const response = await fetch(url, { method: 'GET' });
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch external content',
        status: response.status
      }, { status: response.status });
    }
    
    const contentType = response.headers.get('content-type');
    const data = await response.blob();
    
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error proxying external content',
      message: error.message
    }, { status: 502 });
  }
} 