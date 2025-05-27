import { NextResponse } from 'next/server';

export async function GET() {
  // API_URL kontrolü - undefined ise varsayılan değer kullan
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  try {
    const response = await fetch(`${API_URL}/courses/categories/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend response not ok:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching course categories:', error);
    
    // Fallback categories if backend is not available
    const fallbackCategories = [
      { Category: 'Programming', CourseCount: 0 },
      { Category: 'Web Development', CourseCount: 0 },
      { Category: 'Data Science', CourseCount: 0 },
      { Category: 'Mobile Development', CourseCount: 0 },
      { Category: 'DevOps', CourseCount: 0 },
      { Category: 'Design', CourseCount: 0 },
      { Category: 'Business', CourseCount: 0 },
      { Category: 'General Learning', CourseCount: 0 }
    ];
    
    return NextResponse.json({ 
      categories: fallbackCategories,
      fallback: true 
    });
  }
} 