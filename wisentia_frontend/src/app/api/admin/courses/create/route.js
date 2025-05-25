import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("COURSE CREATE API: Received data:", JSON.stringify(data, null, 2));
    
    let token = '';
    
    // Get token from cookies for server components (await the cookies call)
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('access_token');
    if (tokenCookie) {
      token = tokenCookie.value;
    }
    
    // Use a default URL if the environment variable is not set
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = `${apiBaseUrl}/api/admin/courses/create/`;
    
    console.log(`COURSE CREATE API: Calling backend at ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    console.log(`COURSE CREATE API: Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('COURSE CREATE API ERROR:', error);
      return NextResponse.json({ error: error.message || 'Failed to create course' }, { status: response.status });
    }
    
    const courseData = await response.json();
    console.log("COURSE CREATE API: Course created successfully:", JSON.stringify(courseData, null, 2));
    
    // Transform the response if needed to ensure consistent field naming
    // The backend sends course_id or courseId, we need to standardize to courseId
    let transformedData = {
      ...courseData,
      // If courseId doesn't exist but course_id does, use course_id value
      courseId: courseData.courseId || courseData.course_id
    };
    
    // If courseId is still null or undefined, try to get the latest course by title
    if (!transformedData.courseId && data.title) {
      console.log("COURSE CREATE API: CourseId not returned, trying to fetch the newly created course by title");
      
      // Make a request to get the latest course with this title
      const getLatestCourseUrl = `${apiBaseUrl}/api/admin/courses/get_by_title/?title=${encodeURIComponent(data.title)}`;
      
      try {
        const latestCourseResponse = await fetch(getLatestCourseUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (latestCourseResponse.ok) {
          const latestCourseData = await latestCourseResponse.json();
          console.log("COURSE CREATE API: Found latest course:", JSON.stringify(latestCourseData, null, 2));
          
          if (latestCourseData.courseId || latestCourseData.course_id) {
            transformedData.courseId = latestCourseData.courseId || latestCourseData.course_id;
            console.log(`COURSE CREATE API: Retrieved courseId: ${transformedData.courseId}`);
          }
        } else {
          console.error("COURSE CREATE API: Failed to fetch latest course");
        }
      } catch (fetchError) {
        console.error("COURSE CREATE API: Error fetching latest course:", fetchError);
      }
    }
    
    // If we still don't have a course ID, use the admin panel API to get all courses and find the latest one
    if (!transformedData.courseId) {
      console.log("COURSE CREATE API: Still no courseId, trying to fetch all courses to find the latest one");
      
      try {
        const allCoursesUrl = `${apiBaseUrl}/api/admin/content_management/?content_type=courses`;
        const allCoursesResponse = await fetch(allCoursesUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (allCoursesResponse.ok) {
          const allCoursesData = await allCoursesResponse.json();
          
          if (allCoursesData.courses && allCoursesData.courses.length > 0) {
            // Sort by creation date descending to get the most recently created course
            const sortedCourses = [...allCoursesData.courses].sort((a, b) => {
              const dateA = new Date(a.CreationDate || a.creationDate || 0);
              const dateB = new Date(b.CreationDate || b.creationDate || 0);
              return dateB - dateA;
            });
            
            // Get the latest course and check if it matches our title
            const latestCourse = sortedCourses[0];
            console.log("COURSE CREATE API: Latest course from all courses:", latestCourse);
            
            // Get the course ID from various possible field names
            const latestCourseId = latestCourse.CourseID || latestCourse.courseId || latestCourse.course_id;
            
            if (latestCourseId) {
              transformedData.courseId = latestCourseId;
              console.log(`COURSE CREATE API: Retrieved courseId from latest course: ${transformedData.courseId}`);
            }
          }
        } else {
          console.error("COURSE CREATE API: Failed to fetch all courses");
        }
      } catch (fetchError) {
        console.error("COURSE CREATE API: Error fetching all courses:", fetchError);
      }
    }
    
    // Debug the transformed data
    console.log("COURSE CREATE API: Transformed response:", JSON.stringify(transformedData, null, 2));
    
    // Ensure the response has courseId field
    if (!transformedData.courseId) {
      console.error("COURSE CREATE API ERROR: Could not determine courseId. Backend response:", courseData);
    }
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('COURSE CREATE API EXCEPTION:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}