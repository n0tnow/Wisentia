import { NextResponse } from 'next/server';

// API baz URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to normalize quest data
const normalizeQuestData = (quest) => {
  // Ensure consistent property names and capitalization
  return {
    ...quest,
    // Normalize difficulty
    difficulty: (quest.difficulty || quest.DifficultyLevel || 'intermediate').toLowerCase(),
    // Ensure category exists
    category: quest.category || quest.Category || 'General',
    // Other properties
    title: quest.title || quest.Title,
    description: quest.description || quest.Description,
    id: quest.id || quest.QuestID,
    rewardPoints: quest.rewardPoints || quest.RewardPoints || 0
  };
};

export async function GET(request) {
  // Extract token from request
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
    
    console.log('Quests API: Token available:', !!token);
  } catch (error) {
    console.error('Quests API: Token access error:', error);
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to the backend
    const params = new URLSearchParams();
    
    // Process specific parameters
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');
    const statusFilter = searchParams.get('active');
    const aiGeneratedFilter = searchParams.get('aiGenerated');
    
    // Add parameters to the request
    if (page) params.append('page', page);
    if (pageSize) params.append('page_size', pageSize);
    if (search) params.append('search', search);
    if (difficulty) params.append('difficulty', difficulty);
    
    // Explicit active filter
    if (statusFilter === 'true') {
      params.append('active', 'true');
    } else if (statusFilter === 'false') {
      params.append('active', 'false');
    } else if (includeInactive) {
      // If no specific filter but we want to include inactive
      params.append('include_inactive', 'true');
    }
    
    // AI generated filter
    if (aiGeneratedFilter === 'true') {
      params.append('ai_generated', 'true');
    } else if (aiGeneratedFilter === 'false') {
      params.append('ai_generated', 'false');
    }
    
    // For the admin panel, we need to fetch all quests
    const backendUrl = `${API_BASE_URL}/quests/?${params.toString()}`;
    console.log('Quests API calling backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Quests API backend error:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API error', message: errorText.substring(0, 500) },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log('Quests API response received from backend');
    
    // Return formatted quest data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quests API error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  // Implement PUT method to update quests
  return NextResponse.json({ message: "PUT method not implemented directly. Use the specific quest ID endpoint." }, { status: 501 });
}

export async function POST(request) {
  // Implement POST method to create quests
  return NextResponse.json({ message: "POST method not implemented directly. Use the specific quest ID endpoint." }, { status: 501 });
} 