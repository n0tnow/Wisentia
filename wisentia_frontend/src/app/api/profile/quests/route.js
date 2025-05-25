import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  try {
    // Get token from headers
    const headersList = headers();
    const token = headersList.get('authorization')?.split(' ')[1] || '';
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Fetch user quest data from learning progress endpoint
    // We're reusing the same endpoint as courses since it contains quest data too
    const response = await fetch(`${API_URL}/analytics/learning-progress/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Learning progress API error: ${response.status}`);
    }
    
    const progressData = await response.json();
    
    // Extract quest-related data
    const questData = {
      ongoingQuests: progressData.ongoingQuests || [],
      completedQuests: progressData.completedQuests || []
    };
    
    // If backend doesn't provide completed quests in learning progress,
    // we'll need to fetch all quests and filter them client-side
    if (!progressData.completedQuests) {
      try {
        // Get all quests available to the user
        const questsResponse = await fetch(`${API_URL}/quests/auth/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (questsResponse.ok) {
          const allQuestsData = await questsResponse.json();
          // Filter completed quests based on progress info
          // This depends on how quest completion is tracked in your system
          questData.completedQuests = allQuestsData.filter(quest => 
            quest.isCompleted || quest.progress === 100
          );
        }
      } catch (questError) {
        console.warn('Could not fetch quests list:', questError);
        // Non-critical, so we continue
        questData.completedQuests = [];
      }
    }
    
    return NextResponse.json(questData);
  } catch (error) {
    console.error('Error fetching user quests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user quest data' },
      { status: 500 }
    );
  }
} 