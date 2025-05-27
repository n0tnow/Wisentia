import { NextResponse } from 'next/server';

export async function POST(request) {
  // Get token information
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token access error:', error);
  }
  
  try {
    // Get request data
    const requestData = await request.json();
    
    // Extract parameters for AI auto-generation
    const difficulty = requestData.difficulty || 'intermediate';
    const category = requestData.category || 'General Learning';
    const pointsRequired = requestData.pointsRequired || 0;
    const pointsReward = requestData.pointsReward || 50;
    const autoCreate = requestData.autoCreate || false;
    const enableDatabaseAnalysis = requestData.enableDatabaseAnalysis !== undefined ? requestData.enableDatabaseAnalysis : true;
    const includeNFTRewards = requestData.includeNFTRewards !== undefined ? requestData.includeNFTRewards : true;
    const questComplexity = requestData.questComplexity || 'medium';
    
    // Backend API URL - use NEXT_PUBLIC_API_URL or default to localhost
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = `${apiBaseUrl}/api/ai/admin/generate-complete-quest/`;
    
    console.log('AI complete quest generation request to:', backendUrl);
    console.log('Request data:', JSON.stringify({
      difficulty,
      category,
      pointsRequired,
      pointsReward,
      autoCreate,
      enableDatabaseAnalysis,
      includeNFTRewards,
      questComplexity
    }, null, 2));
    
    // Set a timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for database operations
    
    try {
      // Make API request to backend
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          difficulty,
          category,
          pointsRequired,
          pointsReward,
          autoCreate,
          enableDatabaseAnalysis,
          includeNFTRewards,
          questComplexity
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('AI complete quest generation response status:\n', response.status);
      
      // Read response as text first for debugging
      const responseText = await response.text();
      console.log('API raw response text:', responseText);
      
      // Handle special error cases first, before trying to parse JSON
      if (response.status === 500 && responseText.includes('Database error')) {
        // Try to extract the error details if possible
        let errorDetails = 'Database operation failed';
        try {
          const errorData = JSON.parse(responseText);
          errorDetails = errorData.details || errorData.error || 'Database operation failed';
        } catch (e) {
          // If we can't parse the JSON, just use the raw text
          errorDetails = responseText.substring(0, 200);
        }
        
        return NextResponse.json({
          success: false,
          error: 'Database error',
          details: errorDetails
        }, { status: 500 });
      }
      
      if (!response.ok) {
        // For other error cases
        try {
          const errorData = JSON.parse(responseText);
          return NextResponse.json(errorData, { status: response.status });
        } catch (e) {
          return NextResponse.json(
            { error: 'API error', message: responseText.substring(0, 500) },
            { status: response.status }
          );
        }
      }
      
      // Parse JSON response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('Failed to parse JSON response:', err);
        return NextResponse.json(
          { error: 'Invalid JSON response', message: 'The server returned an invalid JSON response' },
          { status: 500 }
        );
      }
      
      console.log('AI complete quest generation response data:', data);
      
      // Check if contentId is present and valid
      if (!data.contentId) {
        console.error('Missing contentId in response:', data);
        // Create a fallback contentId by using a timestamp if none is provided
        // This is temporary for debugging and should be fixed properly in the backend
        const fallbackId = Date.now();
        console.log(`Using fallback contentId: ${fallbackId}`);
        
        return NextResponse.json({
          success: false,
          error: 'Backend returned null contentId',
          message: 'The server accepted the request but did not return a valid content ID',
          fallbackContentId: fallbackId,
          originalResponse: data
        }, { status: 500 });
      }
      
      // Return formatted response with contentId and status
      return NextResponse.json({
        success: true,
        message: data.message || 'Quest generation started',
        contentId: data.contentId,
        status: data.status || 'queued',
        quest: data.quest // This might be undefined now since we're using queue
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
    
  } catch (error) {
    console.error('AI complete quest generation error:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Connection timeout', message: 'AI service did not respond in time' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

// Add a GET method to check status of quest generation
export async function GET(request) {
  // Get token information
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token access error:', error);
  }
  
  try {
    // Extract contentId from URL
    const url = new URL(request.url);
    const contentId = url.searchParams.get('contentId');
    
    if (!contentId) {
      return NextResponse.json(
        { error: 'Missing parameter', message: 'contentId is required' },
        { status: 400 }
      );
    }
    
    // Backend API URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = `${apiBaseUrl}/api/ai/admin/quest-status/${contentId}/`;
    
    console.log('Checking quest status at URL:', backendUrl);
    
    // Make API request to check status
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('Quest status check response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Quest status check error:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API error', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // Get JSON response
    const responseText = await response.text();
    console.log('Status check raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.error('Failed to parse JSON status response:', err);
      return NextResponse.json(
        { error: 'Invalid JSON response', message: 'The server returned an invalid JSON response' },
        { status: 500 }
      );
    }
    
    console.log('Quest status check response data:', data);
    
    // Return formatted response
    return NextResponse.json({
      success: true,
      contentId: data.contentId,
      status: data.status,
      content: data.content
    });
  } catch (error) {
    console.error('Quest status check error:', error);
    
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
} 