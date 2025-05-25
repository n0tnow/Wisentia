// app/api/admin/quests/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Token bilgisini al
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
    
    console.log('API Proxy: Quests - Token bilgisi:', token ? `${token.substring(0, 15)}...` : 'Yok');
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // URL'den query parametrelerini al
    const { searchParams } = new URL(request.url);
    
    // Frontend'den gelen parametreleri al
    const page = searchParams.get('page') || 1;
    const pageSize = searchParams.get('pageSize') || 20;
    const search = searchParams.get('search') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const status = searchParams.get('status') || '';
    const aiGenerated = searchParams.get('aiGenerated') || '';
    
    console.log('Quests arama parametreleri:', { page, pageSize, search, difficulty, status, aiGenerated });
    
    // Content API'nin beklediği parametre formatını oluştur
    const queryParams = new URLSearchParams({
      page,
      pageSize,
      type: 'quests'  // content endpoint'i için önemli parametre
    });
    
    if (search) queryParams.append('search', search);
    if (difficulty) queryParams.append('difficulty', difficulty);
    if (status) queryParams.append('active', status);
    if (aiGenerated) queryParams.append('aiGenerated', aiGenerated);
    
    // Backend API URL - use NEXT_PUBLIC_API_URL or default to localhost
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let backendUrl = `${apiBaseUrl}/api/admin/content/?${queryParams.toString()}`;
    console.log('Admin Content API isteği yapılıyor:', backendUrl);
    
    // Set a timeout to avoid hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Backend'e API isteği
    let response;
    try {
      response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      // Try AI endpoint if admin/content fails
      if (!response.ok) {
        console.log('Admin Content API başarısız oldu, AI API deneniyor...');
        
        backendUrl = `${apiBaseUrl}/api/ai/admin/pending-content/?${queryParams.toString()}`;
        console.log('AI Admin API isteği yapılıyor:', backendUrl);
        
        const aiController = new AbortController();
        const aiTimeoutId = setTimeout(() => aiController.abort(), 5000);
        
        response = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          cache: 'no-store',
          signal: aiController.signal
        }).finally(() => clearTimeout(aiTimeoutId));
      }
    } catch (fetchError) {
      console.error('Fetch hatası:', fetchError);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Bağlantı zaman aşımına uğradı', message: 'Backend yanıt vermedi' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
    
    console.log('Backend yanıt durumu:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Backend yanıt hatası:', responseText);
      
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html')) {
        console.error('HTML yanıtı alındı');
        return NextResponse.json(
          { error: 'Backend kimlik doğrulama hatası. Lütfen tekrar giriş yapın.' },
          { status: response.status }
        );
      }
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al 
    const data = await response.json();
    console.log('Backend API yanıtı alındı. Veri yapısı:', Object.keys(data));
    
    // Transform response to match what the frontend expects
    let formattedResponse;
    
    // If the response has 'items' property (admin/content API format)
    if (data.items) {
      formattedResponse = {
        quests: data.items,
        totalCount: data.totalCount || data.items.length,
        page: data.page || 1,
        pageSize: data.pageSize || 20
      };
      console.log('Admin Content API format detected and transformed');
    }
    // If the response has 'quests' property
    else if (data.quests) {
      formattedResponse = data;
      console.log('Quests API format detected');
    }
    // If the response is an array of quests
    else if (Array.isArray(data)) {
      formattedResponse = {
        quests: data,
        totalCount: data.length
      };
      console.log('Array format detected and transformed');
    }
    // If we have 'results' property (common in paginated APIs)
    else if (data.results) {
      formattedResponse = {
        quests: data.results,
        totalCount: data.count || data.results.length
      };
      console.log('Results format detected and transformed');
    }
    // Fallback for unknown format
    else {
      formattedResponse = {
        quests: data,
        totalCount: Object.keys(data).length
      };
      console.log('Unknown format, best guess transformation applied');
    }
    
    console.log(`Formatlanmış yanıt: ${formattedResponse.quests.length} görev, toplam: ${formattedResponse.totalCount}`);
    
    // Frontend'e iletilecek yanıtı oluştur
    return NextResponse.json(formattedResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Quests API Proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Token bilgisini al
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // İstek verisini al
    const requestData = await request.json();
    
    // Use the AI endpoint for quest creation
    const backendUrl = 'http://localhost:8000/api/ai/admin/generate-quest/';
    
    console.log('AI Quest oluşturma isteği yapılıyor:', backendUrl);
    console.log('İstek verisi:', JSON.stringify(requestData, null, 2));
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Quest oluşturma yanıt durumu:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Quest oluşturma hatası:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al
    const data = await response.json();
    console.log('Quest oluşturma başarılı.');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quest oluşturma proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  // Token bilgisini al
  let token = '';
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      const tokenCookie = request.cookies.get('access_token');
      token = tokenCookie?.value || '';
    }
  } catch (error) {
    console.error('Token erişim hatası:', error);
  }
  
  try {
    // URL'den ID parametresini al
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const questId = pathSegments[pathSegments.length - 1];
    
    // İstek verisini al
    const requestData = await request.json();
    
    // Backend API URL
    let backendUrl;
    if (questId && !isNaN(questId)) {
      // Belirli bir quest'i güncelleme
      backendUrl = `http://localhost:8000/api/quests/${questId}/`;
    } else if (requestData.contentId) {
      // Content ID varsa, approve endpoint'ini kullan
      backendUrl = `http://localhost:8000/api/ai/admin/approve-quest/${requestData.contentId}/`;
    } else {
      return NextResponse.json(
        { error: 'Quest ID veya Content ID gerekli' },
        { status: 400 }
      );
    }
    
    console.log('Quest güncelleme isteği yapılıyor:', backendUrl);
    console.log('İstek verisi:', JSON.stringify(requestData, null, 2));
    
    // Backend'e API isteği
    const response = await fetch(backendUrl, {
      method: backendUrl.includes('approve-quest') ? 'POST' : 'PUT', // Backend için gerekli metod
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Quest güncelleme yanıt durumu:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Quest güncelleme hatası:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: 'API hatası', message: responseText.substring(0, 500) },
          { status: response.status }
        );
      }
    }
    
    // JSON yanıtı al
    const data = await response.json();
    console.log('Quest güncelleme başarılı.');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quest güncelleme proxy hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: error.message },
      { status: 500 }
    );
  }
}