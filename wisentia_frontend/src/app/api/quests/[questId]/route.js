import { NextResponse } from 'next/server';

// API baz URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper to normalize quest data with conditions
const normalizeQuestDetail = (quest) => {
  // Guard against undefined quest
  if (!quest) {
    return {
      id: '',
      title: '',
      description: '',
      difficulty: 'intermediate',
      rewardPoints: 0,
      conditions: []
    };
  }
  
  return {
    ...quest,
    // Ensure these key properties exist and are normalized
    id: quest.id || quest.QuestID,
    title: quest.title || quest.Title || '',
    description: quest.description || quest.Description || '',
    difficulty: (quest.difficulty || quest.DifficultyLevel || 'intermediate').toLowerCase(),
    rewardPoints: quest.rewardPoints || quest.RewardPoints || 0,
    // Ensure conditions array always exists and is properly formatted
    conditions: Array.isArray(quest.conditions) 
      ? quest.conditions 
      : Array.isArray(quest.Conditions) 
        ? quest.Conditions 
        : [],
    // Make sure progress object always exists
    progress: quest.progress || {}
  };
};

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

export async function GET(request, { params }) {
  const { questId } = params;
  if (!questId) {
    return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 });
  }

  const token = extractToken(request);
  
  try {
    console.log(`Fetching quest details for ID: ${questId}`);
    
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Quest details API error:', errorText);
      
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quest details API error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { questId } = params;
  if (!questId) {
    return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 });
  }

  const token = extractToken(request);
  
  try {
    const updateData = await request.json();
    console.log(`Updating quest ${questId} with data:`, updateData);
    
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/update/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Quest update API error:', errorText);
      
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quest update API error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { questId } = params;
  if (!questId) {
    return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 });
  }

  const token = extractToken(request);
  
  try {
    console.log(`Deleting quest with ID: ${questId}`);
    
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Quest deletion API error:', errorText);
      
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

    // Some APIs return empty response on successful delete
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { success: true, message: 'Quest deleted successfully' };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quest deletion API error:', error);
    return NextResponse.json(
      { error: 'Server error', message: error.message },
      { status: 500 }
    );
  }
} 