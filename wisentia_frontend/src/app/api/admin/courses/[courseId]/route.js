import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper function to get token from request
async function getToken() {
  let token = '';
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('access_token');
  if (tokenCookie) {
    token = tokenCookie.value;
  }
  return token;
}

// Get course by ID endpoint
export async function GET(request, { params }) {
  try {
    const courseId = params.courseId;
    console.log(`GET COURSE API: Fetching course ID ${courseId}`);
    
    const token = await getToken();
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBaseUrl}/api/admin/content/?content_type=courses&course_id=${courseId}`;
    
    console.log(`GET COURSE API: Calling backend at ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    console.log(`GET COURSE API: Backend response status: ${response.status}`);
    
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`GET COURSE API: Error parsing response: ${parseError.message}`);
      responseData = { message: responseText };
    }
    
    if (!response.ok) {
      console.error("GET COURSE API ERROR:", responseData);
      return NextResponse.json({ 
        error: responseData.error || 'Failed to fetch course' 
      }, { status: response.status });
    }
    
    // If we got back a list of courses, find the one with matching ID
    if (responseData.items && Array.isArray(responseData.items)) {
      const course = responseData.items.find(item => 
        item.CourseID == courseId || item.courseId == courseId || item.course_id == courseId
      );
      
      if (!course) {
        console.error(`GET COURSE API: Course with ID ${courseId} not found in response`);
        return NextResponse.json({ 
          error: `Course with ID ${courseId} not found` 
        }, { status: 404 });
      }
      
      console.log("GET COURSE API: Success result:", course);
      return NextResponse.json(course);
    }
    
    // If it's already a single course object
    console.log("GET COURSE API: Success result:", responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('GET COURSE API EXCEPTION:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while fetching the course' 
    }, { status: 500 });
  }
}

// Update course endpoint
export async function PUT(request, { params }) {
  try {
    const courseId = params.courseId;
    const data = await request.json();
    console.log(`UPDATE COURSE API: Updating course ID ${courseId}`, data);
    
    const token = await getToken();
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBaseUrl}/api/admin/courses/update/${courseId}/`;
    
    console.log(`UPDATE COURSE API: Calling backend at ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    console.log(`UPDATE COURSE API: Backend response status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`UPDATE COURSE API: Backend response text: ${responseText}`);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`UPDATE COURSE API: Error parsing response: ${parseError.message}`);
      responseData = { message: responseText };
    }
    
    if (!response.ok) {
      console.error("UPDATE COURSE API ERROR:", responseData);
      return NextResponse.json({ 
        error: responseData.error || 'Failed to update course' 
      }, { status: response.status });
    }
    
    console.log("UPDATE COURSE API: Success result:", responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('UPDATE COURSE API EXCEPTION:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while updating the course' 
    }, { status: 500 });
  }
}

// Delete course endpoint
export async function DELETE(request, { params }) {
  try {
    const courseId = params.courseId;
    console.log(`DELETE COURSE API: Deleting course ID ${courseId}`);
    
    const token = await getToken();
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBaseUrl}/api/admin/courses/delete/${courseId}/`;
    
    console.log(`DELETE COURSE API: Calling backend at ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`DELETE COURSE API: Backend response status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`DELETE COURSE API: Backend response text: ${responseText}`);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`DELETE COURSE API: Error parsing response: ${parseError.message}`);
      responseData = { message: responseText };
    }
    
    if (!response.ok) {
      console.error("DELETE COURSE API ERROR:", responseData);
      return NextResponse.json({ 
        error: responseData.error || 'Failed to delete course' 
      }, { status: response.status });
    }
    
    console.log("DELETE COURSE API: Success result:", responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('DELETE COURSE API EXCEPTION:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while deleting the course' 
    }, { status: 500 });
  }
} 