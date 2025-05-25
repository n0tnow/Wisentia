import { NextResponse } from 'next/server';

// API baz URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function POST(request, { params }) {
  // Properly await params.questId
  const questId = params?.questId;
  
  if (!questId) {
    return NextResponse.json(
      { error: 'Quest ID is required', success: false },
      { status: 400 }
    );
  }
  
  try {
    // Auth token al - cookie veya headers'dan
    let authHeader = {};
    const authorization = request.headers.get('authorization');
    
    if (authorization) {
      authHeader = { 'Authorization': authorization };
    }
    
    // Eğer token yoksa yetkilendirme hatası döndür
    if (!authorization) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmalısınız', success: false },
        { status: 401 }
      );
    }
    
    // Backend API'sine istek gönder
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/claim-reward/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    });
    
    if (!response.ok) {
      let errorData = { error: `Ödül talep edilemedi: ${response.status}` };
      try {
        errorData = await response.json();
      } catch (e) {
        console.error("Error parsing response:", e);
      }
      return NextResponse.json(
        { 
          error: errorData.error || errorData.detail || `Ödül talep edilemedi: ${response.status}`,
          success: false 
        },
        { status: response.status }
      );
    }
    
    // Parse response data or provide fallback
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing success response:", e);
      data = { success: true, message: "Reward claimed successfully" };
    }
    
    // Ensure we have a proper success response
    return NextResponse.json({
      ...data,
      success: true,
      rewards: data.rewards || { points: 100 } // Fallback if rewards not provided
    });
    
  } catch (error) {
    console.error('Ödül talep edilirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', success: false },
      { status: 500 }
    );
  }
} 