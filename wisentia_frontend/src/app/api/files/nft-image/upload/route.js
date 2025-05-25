import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Fallback image service for when backend is unavailable
async function mockImageUpload(imageFile) {
  // Generate a unique filename for the mock response
  const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${imageFile.name.split('.').pop() || 'png'}`;
  const mockUrl = `/media/uploads/nft_images/${filename}`;
  
  console.log('Backend ulaşılamıyor: Mock görsel URL oluşturuldu:', mockUrl);
  
  // Simulate a short processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    url: mockUrl,
    success: true,
    message: 'Image upload simulated (backend offline)'
  };
}

export async function POST(request) {
  try {
    console.log('NFT image upload API called');
    
    // Get auth token from cookies - cookies() await edilmelidir
    const cookieStore = await cookies();
    // get() metodu senkrondur
    const token = cookieStore.get('access_token')?.value || '';
    
    if (!token) {
      console.error('NFT image upload: Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get form data from request
    const formData = await request.formData();
    
    // Check if an image file was uploaded
    if (!formData.has('image')) {
      console.error('NFT image upload: No image file provided');
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    const imageFile = formData.get('image');
    console.log('NFT image upload: Processing file', 
      imageFile.name, 
      'Size:', imageFile.size, 
      'Type:', imageFile.type
    );
    
    try {
      // Forward the request to backend
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/files/nft-image/upload/`;
      console.log('NFT image upload: Sending to backend', backendUrl);
      
      // Backend'e API isteği
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('NFT image upload: Backend response status:', backendResponse.status);
      
      // Get response text
      const responseText = await backendResponse.text();
      
      // Check for error response
      if (!backendResponse.ok) {
        console.error('NFT image upload: Backend error', backendResponse.status);
        return NextResponse.json(
          { error: `Backend error: ${responseText}` },
          { status: backendResponse.status }
        );
      }
      
      // Parse response data
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('NFT image upload: Failed to parse response', parseError);
        return NextResponse.json(
          { error: 'Invalid response format from server' },
          { status: 500 }
        );
      }
      
      // Return success response
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('NFT image upload: Network error', fetchError);
      return NextResponse.json(
        { error: 'Network error connecting to backend', message: fetchError.message },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error('NFT image upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 