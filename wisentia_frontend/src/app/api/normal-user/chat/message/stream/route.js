import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const { message, sessionId } = data;
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Django API endpoint for streaming chat messages
    const apiEndpoint = `${process.env.BACKEND_API_URL}/chat/message/stream/`;
    
    // Forward the request to the Django streaming endpoint
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        message,
        sessionId
      })
    });

    // Handle possible errors
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to process message',
        success: false
      }, { status: response.status });
    }
    
    // Set up streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        // Process the stream from Django
        const reader = response.body.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            
            // Forward the chunks to the client
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });

    // Return streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
    
  } catch (error) {
    console.error('Error processing streaming chat message:', error);
    return NextResponse.json({ 
      error: 'Failed to process message',
      success: false
    }, { status: 500 });
  }
}