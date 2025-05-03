// app/api/admin/analytics/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // URL parametrelerini al
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  const days = searchParams.get('days') || '30';
  
  // Token bilgisini al
  let token = '';
  try {
    // Önce Authorization header'ından token'ı almaya çalış
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Cookie'den token kontrolü
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  // Endpoint'e göre işlem yap
  switch (endpoint) {
    case 'user-stats':
      return await callBackendApi('/api/analytics/user-stats/', token);
    case 'learning-progress':
      return await callBackendApi('/api/analytics/learning-progress/', token);
    case 'time-spent':
      return await callBackendApi('/api/analytics/time-spent/', token);
    case 'user-activity-summary':
      return await callBackendApi(`/api/analytics/user-activity-summary/?days=${days}`, token);
    case 'all':
      // Tüm verileri paralel olarak getir
      try {
        // Promise.allSettled kullanarak tüm API çağrılarını yap
        // Bu şekilde bir API hata verse bile diğerleri çalışmaya devam eder
        const [userStatsPromise, learningProgressPromise, timeSpentPromise, activitySummaryPromise] = await Promise.allSettled([
          fetch(`http://localhost:8000/api/analytics/user-stats/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:8000/api/analytics/learning-progress/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:8000/api/analytics/time-spent/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`http://localhost:8000/api/analytics/user-activity-summary/?days=${days}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        // Her bir isteğin sonucunu kontrol et
        const result = {
          userStats: userStatsPromise.status === 'fulfilled' && userStatsPromise.value.ok ? 
            await userStatsPromise.value.json() : { error: 'Failed to fetch user stats' },
            
          learningProgress: learningProgressPromise.status === 'fulfilled' && learningProgressPromise.value.ok ? 
            await learningProgressPromise.value.json() : { error: 'Failed to fetch learning progress' },
            
          timeSpent: timeSpentPromise.status === 'fulfilled' && timeSpentPromise.value.ok ? 
            await timeSpentPromise.value.json() : { error: 'Failed to fetch time spent data' },
            
          activitySummary: activitySummaryPromise.status === 'fulfilled' && activitySummaryPromise.value.ok ? 
            await activitySummaryPromise.value.json() : { error: 'Failed to fetch activity summary' }
        };
        
        return NextResponse.json(result);
      } catch (error) {
        console.error('Tüm veri çekme hatası:', error);
        return NextResponse.json({
          error: 'Failed to fetch analytics data',
          message: error.message
        }, { status: 500 });
      }
    default:
      return NextResponse.json({ error: 'Geçersiz endpoint' }, { status: 400 });
  }
}

// Backend API çağrı yardımcısı
async function callBackendApi(endpoint, token) {
  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`API hatası (${endpoint}): ${response.status}`);
      // Hata durumunda hata mesajını doğrudan frontend'e ilet
      return NextResponse.json({ 
        error: `API Error: ${response.status}`,
        endpoint: endpoint
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`API çağrısı hatası (${endpoint}):`, error);
    return NextResponse.json({ 
      error: 'API Connection Error',
      message: error.message,
      endpoint: endpoint
    }, { status: 500 });
  }
}