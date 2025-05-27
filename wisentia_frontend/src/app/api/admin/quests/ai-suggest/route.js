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
    
    // Extract parameters for AI suggestion
    const difficulty = requestData.difficulty || 'intermediate';
    const category = requestData.category || 'General Learning';
    const pointsRequired = requestData.requiredPoints || 0;
    const pointsReward = requestData.rewardPoints || 50;
    
    // Backend API URL - use NEXT_PUBLIC_API_URL or default to localhost
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const backendUrl = `${apiBaseUrl}/api/ai/admin/generate-quest/`;
    
    console.log('AI quest suggestion request to:', backendUrl);
    console.log('Request data:', JSON.stringify({
      difficulty,
      category,
      pointsRequired,
      pointsReward
    }, null, 2));
    
    // Set a timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for AI
    
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
        pointsReward
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    console.log('AI quest suggestion response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('AI quest suggestion error:', responseText);
      
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
    const data = await response.json();
    console.log('AI quest suggestion successful:', data);
    
    // Return the response as-is since backend now formats it correctly
    return NextResponse.json({
      success: data.success,
      quest: data.quest,
      suggestions: data.suggestions,
      cost: data.cost,
      usage: data.usage,
      message: data.message
    });
    
  } catch (error) {
    console.error('AI quest suggestion error:', error);
    
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