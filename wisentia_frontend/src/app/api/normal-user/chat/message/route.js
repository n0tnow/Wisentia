import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const data = await request.json();
    const { message, sessionId } = data;
    
    // Check if message exists
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Get auth token from cookies - await the cookies() operation
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    // Authentication check - Reject if no token
    if (!accessToken) {
      return NextResponse.json({ 
        error: "Authentication required",
        success: false
      }, { status: 401 });
    }
    
    // Convert sessionId to number if it's a string, null if undefined
    const sessionIdValue = sessionId ? parseInt(sessionId) : null;
    
    console.log('Sending message to backend:', {
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      sessionId: sessionIdValue
    });
    
    // Get the backend URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const apiEndpoint = `${backendUrl}/api/ai/chat/message/`;
    
    console.log('Sending request to:', apiEndpoint);
    
    // Create request body
    const requestBody = {
      message,
      sessionId: sessionIdValue // Will be null or a number
    };
    
    // Log the headers being sent
    console.log('Sending with auth header:', `Bearer ${accessToken.substring(0, 10)}...`);
    
    // Send request to backend API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody)
    });

    // Log response details
    console.log('Response status:', response.status);
    
    // Handle errors
    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorText = await response.text();
        console.error('Backend API error details:', errorText);
        
        // Try to parse JSON error if possible
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.error || errorJson.details || errorText;
        } catch (jsonError) {
          errorDetails = errorText;
        }
      } catch (e) {
        errorDetails = 'Could not read error response';
      }
      
      return NextResponse.json({ 
        error: 'Failed to process message',
        details: errorDetails,
        success: false
      }, { status: response.status });
    }
    
    // Process successful response
    const responseData = await response.json();
    console.log('Response data received');
    
    return NextResponse.json({
      message: responseData.message || responseData.response,
      sessionId: responseData.sessionId,
      success: true
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json({ 
      error: 'Failed to process message: ' + error.message,
      success: false
    }, { status: 500 });
  }
}