// app/api/admin/quests/[questId]/route.js
import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

// API baz URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Admin yetkisini kontrol et
const checkAdminPermission = async (request) => {
  try {
    const token = await getToken({ req: request });
    
    // Token yoksa ya da admin değilse
    if (!token?.accessToken || !token?.user?.isAdmin) {
      return false;
    }
    
    return {
      token: token.accessToken,
      userId: token.user.id
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
    
    // Try the main admin content endpoint first
    let response;
    try {
      console.log(`API: Calling primary endpoint for quest ID ${questId}`);
      
      response = await fetch(`${API_BASE_URL}/admin/content/?type=quests&quest_id=${questId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`,
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
    } catch (fetchError) {
      console.error('API: Primary endpoint fetch error:', fetchError);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Connection timed out', message: 'Backend did not respond' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
    
    // If the first endpoint fails, try the direct quest endpoint
    if (!response.ok) {
      console.log(`API: Primary endpoint failed (${response.status}), trying secondary endpoint`);
      
      const altController = new AbortController();
      const altTimeoutId = setTimeout(() => altController.abort(), 5000);
      
      try {
        response = await fetch(`${API_BASE_URL}/admin/quests/${questId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${admin.token}`,
            'Cache-Control': 'no-cache'
          },
          signal: altController.signal
        }).finally(() => clearTimeout(altTimeoutId));
      } catch (altFetchError) {
        console.error('API: Secondary endpoint fetch error:', altFetchError);
        if (altFetchError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Connection timed out', message: 'Backend did not respond' },
            { status: 504 }
          );
        }
        throw altFetchError;
      }
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