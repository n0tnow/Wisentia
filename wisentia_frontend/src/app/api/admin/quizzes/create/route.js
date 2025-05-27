import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Get authentication token
    let token = '';
    try {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      
      if (!token) {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('access_token');
        token = tokenCookie?.value || '';
      }
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Token access error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }

    // Get request data
    const quizData = await request.json();
    
    console.log('Received quiz data from frontend:', JSON.stringify(quizData, null, 2));
    
    // Validate required fields
    if (!quizData.title || !quizData.description || !quizData.questions || quizData.questions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, and at least one question' },
        { status: 400 }
      );
    }

    // Transform the data to match backend expectations
    const backendData = {
      title: quizData.title,
      description: quizData.description,
      course_id: quizData.courseId || null,
      video_id: quizData.videoId || null,
      difficulty: quizData.difficulty || 'intermediate',
      passing_score: quizData.passingScore || 70,
      language: quizData.language || 'en',
      questions: quizData.questions.map((question, index) => {
        console.log(`Processing question ${index + 1}:`, question);
        return {
          question_text: question.questionText,
          question_type: question.questionType,
          options: question.questionType === 'multiple_choice' 
            ? question.options.map(option => ({
                option_text: option.text,
                is_correct: option.isCorrect
              }))
            : question.questionType === 'true_false'
            ? [
                { option_text: 'True', is_correct: question.correctAnswer === true },
                { option_text: 'False', is_correct: question.correctAnswer === false }
              ]
            : [],
          explanation: question.explanation || '',
          correct_answer: question.questionType === 'true_false' ? question.correctAnswer : null
        };
      }),
      is_manual: true,
      status: 'pending' // Manual quizzes go to pending for review
    };

    console.log('Creating manual quiz:', backendData.title);

    // Send to backend
    const backendUrl = 'http://localhost:8000/api/admin/quizzes/create/';
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(backendData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', response.status, errorData);
      
      try {
        const errorJson = JSON.parse(errorData);
        return NextResponse.json(
          { error: errorJson.error || errorJson.message || 'Failed to create quiz' },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Backend error: ${response.status}` },
          { status: response.status }
        );
      }
    }

    const result = await response.json();
    console.log('Manual quiz created successfully:', result.id || result.quiz_id);

    return NextResponse.json({
      success: true,
      message: 'Quiz created successfully',
      quiz: result,
      id: result.id || result.quiz_id
    });

  } catch (error) {
    console.error('Manual quiz creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 