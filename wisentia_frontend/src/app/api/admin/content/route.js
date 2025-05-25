import { NextResponse } from 'next/server';

export async function GET(request) {
  // Extract token from Authorization header or cookies
  let token = '';
  try {
    // Get token from either Authorization header or cookies
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }

    console.log('Admin Content API: Token available:', !!token);
  } catch (error) {
    console.error('Admin Content API: Token access error:', error);
  }

  try {
    // Extract query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || ''; // courses, quests, etc.
    const page = searchParams.get('page') || 1;
    const pageSize = searchParams.get('pageSize') || 20;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const active = searchParams.get('active');
    const aiGenerated = searchParams.get('aiGenerated');
    const courseId = searchParams.get('course_id') || searchParams.get('courseId');
    const questId = searchParams.get('quest_id') || searchParams.get('questId');

    // Log request parameters
    console.log('Admin Content API Request:', {
      type,
      page,
      pageSize,
      search,
      category,
      difficulty,
      active,
      aiGenerated,
      courseId,
      questId
    });

    // Prepare query params
    const queryParams = new URLSearchParams({
      page,
      page_size: pageSize
    });

    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (difficulty) queryParams.append('difficulty', difficulty);
    if (active !== null) queryParams.append('active', active);
    if (aiGenerated !== null) queryParams.append('ai_generated', aiGenerated);
    if (courseId) queryParams.append('course_id', courseId);
    if (questId) queryParams.append('quest_id', questId);

    // Backend API URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Different endpoints based on content type
    let backendUrl;
    if (type === 'courses') {
      backendUrl = `${apiBaseUrl}/api/admin/courses/?${queryParams.toString()}`;
    } else if (type === 'quests') {
      backendUrl = `${apiBaseUrl}/api/admin/quests/?${queryParams.toString()}`;
    } else {
      backendUrl = `${apiBaseUrl}/api/admin/content/?${queryParams.toString()}`;
    }

    console.log('Admin Content API calling backend:', backendUrl);

    // Set timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Make backend API request
    let response;
    try {
      response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      // Try alternative endpoint if first one fails
      if (!response.ok) {
        console.log('Admin Content API primary endpoint failed, trying alternative...');
        
        // Choose alternative endpoint based on content type
        let altBackendUrl;
        if (type === 'quests') {
          altBackendUrl = `${apiBaseUrl}/api/ai/admin/quests/?${queryParams.toString()}`;
        } else if (type === 'courses') {
          altBackendUrl = `${apiBaseUrl}/api/courses/?${queryParams.toString()}`;
        } else {
          altBackendUrl = `${apiBaseUrl}/api/admin/all-content/?${queryParams.toString()}`;
        }
        
        console.log('Admin Content API trying alternative:', altBackendUrl);
        
        const altController = new AbortController();
        const altTimeoutId = setTimeout(() => altController.abort(), 5000);
        
        response = await fetch(altBackendUrl, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          cache: 'no-store',
          signal: altController.signal
        }).finally(() => clearTimeout(altTimeoutId));
      }
    } catch (fetchError) {
      console.error('Admin Content API fetch error:', fetchError);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Connection timed out', message: 'Backend did not respond' },
          { status: 504 }
        );
      }
      throw fetchError;
    }

    console.log('Admin Content API backend response status:', response.status);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Admin Content API backend error:', responseText);
      
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
    const data = await response.json();
    console.log('Admin Content API received response structure:', Object.keys(data));

    // Transform response based on content type
    let formattedResponse;

    if (type === 'courses') {
      formattedResponse = transformCourseResponse(data);
    } else if (type === 'quests') {
      formattedResponse = transformQuestResponse(data);
    } else {
      // Generic content transformation
      formattedResponse = transformGenericResponse(data);
    }

    // Return response to frontend
    return NextResponse.json(formattedResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Admin Content API error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

// Transform response for courses
function transformCourseResponse(data) {
  if (data.items) {
    return {
      items: data.items,
      totalCount: data.totalCount || data.items.length,
      page: data.page || 1,
      pageSize: data.pageSize || 20
    };
  } else if (data.courses) {
    return {
      items: data.courses,
      totalCount: data.count || data.courses.length
    };
  } else if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length
    };
  } else if (data.results) {
    return {
      items: data.results,
      totalCount: data.count || data.results.length
    };
  } else {
    return {
      items: [data],
      totalCount: 1
    };
  }
}

// Transform response for quests
function transformQuestResponse(data) {
  if (data.items) {
    return {
      items: data.items,
      totalCount: data.totalCount || data.items.length,
      page: data.page || 1,
      pageSize: data.pageSize || 20
    };
  } else if (data.quests) {
    return {
      items: data.quests,
      totalCount: data.count || data.quests.length
    };
  } else if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length
    };
  } else if (data.results) {
    return {
      items: data.results,
      totalCount: data.count || data.results.length
    };
  } else {
    return {
      items: [data],
      totalCount: 1
    };
  }
}

// Transform generic response
function transformGenericResponse(data) {
  if (data.items) {
    return data;
  } else if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length,
      page: 1,
      pageSize: data.length
    };
  } else {
    return {
      items: [data],
      totalCount: 1,
      page: 1,
      pageSize: 1
    };
  }
} 