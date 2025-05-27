// app/api/admin/quests/[questId]/route.js
import { NextResponse } from 'next/server';

// API baz URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function to extract token from request
const extractToken = (request) => {
  try {
    // Get token from either Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    const tokenCookie = request.cookies.get('access_token');
    return tokenCookie?.value || '';
  } catch (error) {
    console.error('Token extraction error:', error);
    return '';
  }
};

// Admin yetkisini kontrol et
const checkAdminPermission = async (request) => {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return false;
    }
    
    // Token'ı backend'e gönderip kullanıcı bilgilerini al
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Profile fetch failed:', response.status, response.statusText);
      return false;
    }
    
    const userData = await response.json();
    console.log('User data from backend:', userData);
    
    // Admin kontrolü - role alanını kontrol et (backend'den 'role' olarak dönüyor)
    if (userData.role !== 'admin') {
      console.log('User is not admin. Role:', userData.role);
      return false;
    }
    
    console.log('Admin permission granted for user:', userData.id);
    return {
      token: token,
      userId: userData.id
    };
  } catch (error) {
    console.error('Admin permission check failed:', error);
    return false;
  }
};

// Quest detaylarını al
export async function GET(request, { params }) {
  const { questId } = params;
  
  console.log(`API: Getting quest details for ID ${questId}`);
  
  try {
    const admin = await checkAdminPermission(request);
    
    if (!admin) {
      console.log('API: Admin permission denied');
      return NextResponse.json(
        { error: 'This operation requires admin permission' },
        { status: 403 }
      );
    }
    
    // Backend API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Use the authenticated quest detail endpoint directly
    let response;
    try {
      console.log(`API: Calling quest detail endpoint for quest ID ${questId}`);
      
      response = await fetch(`${API_BASE_URL}/quests/admin/${questId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`,
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    } catch (fetchError) {
      console.error('API: Quest detail endpoint fetch error:', fetchError);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Connection timed out', message: 'Backend did not respond' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API: Both endpoints failed for quest ${questId}. Response:`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Failed to get quest details', message: errorText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // Parse response
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
      console.log(`API: Successfully retrieved quest ${questId} data`);
    } catch (parseError) {
      console.error('API: Error parsing quest response:', parseError);
      return NextResponse.json(
        { error: 'Error parsing response', message: responseText.substring(0, 500) },
        { status: 500 }
      );
    }
    
    // Handle different response formats
    let quest;
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      quest = data.items[0];
    } else if (Array.isArray(data) && data.length > 0) {
      quest = data[0];
    } else if (data.quest) {
      quest = data.quest;
    } else {
      quest = data; // Assume the response is the quest object directly
    }
    
    return NextResponse.json(quest);
    
  } catch (error) {
    console.error('API: Quest details error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

// Update quest details
export async function PUT(request, { params }) {
  const { questId } = params;
  
  console.log(`API: Updating quest ID ${questId}`);
  
  try {
    const admin = await checkAdminPermission(request);
    
    if (!admin) {
      console.log('API: Admin permission denied for update');
      return NextResponse.json(
        { error: 'This operation requires admin permission' },
        { status: 403 }
      );
    }
    
    // Get request data
    const requestData = await request.json();
    console.log('API: Update quest data:', requestData);
    
    // Backend API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/admin/quests/${questId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    } catch (fetchError) {
      console.error('API: Update endpoint fetch error:', fetchError);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Connection timed out', message: 'Backend did not respond' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API: Failed to update quest ${questId}. Response:`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Failed to update quest', message: errorText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // Parse response
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
      console.log(`API: Successfully updated quest ${questId}`);
    } catch (parseError) {
      console.error('API: Error parsing update response:', parseError);
      return NextResponse.json(
        { error: 'Error parsing response', message: responseText.substring(0, 500) },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API: Quest update error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

// Delete quest
export async function DELETE(request, { params }) {
  const { questId } = params;
  
  console.log(`API: Deleting quest ID ${questId}`);
  
  try {
    const admin = await checkAdminPermission(request);
    
    if (!admin) {
      console.log('API: Admin permission denied for delete');
      return NextResponse.json(
        { error: 'This operation requires admin permission' },
        { status: 403 }
      );
    }
    
    // Backend API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/admin/quests/${questId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`,
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    } catch (fetchError) {
      console.error('API: Delete endpoint fetch error:', fetchError);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Connection timed out', message: 'Backend did not respond' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API: Failed to delete quest ${questId}. Response:`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Failed to delete quest', message: errorText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // Parse response
    const responseText = await response.text();
    let data = { success: true };
    
    try {
      if (responseText.trim()) {
        data = JSON.parse(responseText);
      }
      console.log(`API: Successfully deleted quest ${questId}`);
    } catch (parseError) {
      console.error('API: Error parsing delete response:', parseError);
      // Continue with default success response
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API: Quest delete error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}