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
    
    // Önce doğrudan quests API'ye bir istek deneyelim
    let backendUrl = `http://localhost:8000/api/quests/?page=${page}&pageSize=${pageSize}`;
    
    if (search) backendUrl += `&search=${encodeURIComponent(search)}`;
    if (difficulty) backendUrl += `&difficulty=${encodeURIComponent(difficulty)}`;
    if (status) backendUrl += `&status=${encodeURIComponent(status)}`;
    if (aiGenerated) backendUrl += `&aiGenerated=${encodeURIComponent(aiGenerated)}`;
    
    console.log('Quests API isteği yapılıyor:', backendUrl);
    
    // Backend'e API isteği
    let response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      cache: 'no-store'
    });
    
    // Eğer doğrudan quests API çalışmazsa, admin/content API'yi deneyelim
    if (response.status === 404) {
      console.log('Quests API bulunamadı, admin/content API deneniyor...');
      
      // Content API'nin beklediği parametre formatını oluştur
      const queryParams = new URLSearchParams({
        page,
        pageSize,
        type: 'quests'  // content endpoint'i için önemli parametre
      });
      
      if (search) queryParams.append('search', search);
      if (difficulty) queryParams.append('difficulty', difficulty);
      if (status) queryParams.append('status', status);
      if (aiGenerated) queryParams.append('aiGenerated', aiGenerated);
      
      backendUrl = `http://localhost:8000/api/admin/content/?${queryParams.toString()}`;
      console.log('Admin Content API isteği yapılıyor:', backendUrl);
      
      response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-store'
      });
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
    
    // Dönen veriyi analiz et ve frontend'in beklediği formata dönüştür
    let formattedResponse;
    
    // Olası veri yapıları için kontrol
    if (Array.isArray(data)) {
      // Eğer doğrudan dizi dönüyorsa
      formattedResponse = {
        quests: data,
        totalCount: data.length
      };
      console.log('Array veri yapısı tespit edildi ve dönüştürüldü');
    } else if (data.items) {
      // admin/content API formatı
      formattedResponse = {
        quests: data.items,
        totalCount: data.totalCount || data.items.length,
        page: data.page || 1,
        pageSize: data.pageSize || 20
      };
      console.log('Content API veri yapısı tespit edildi ve dönüştürüldü');
    } else if (data.quests) {
      // Zaten doğru format
      formattedResponse = data;
      console.log('Quests API veri yapısı tespit edildi');
    } else {
      // Bilinmeyen format, olduğu gibi dön
      formattedResponse = {
        quests: data.results || data,
        totalCount: data.count || data.total || (data.results ? data.results.length : Object.keys(data).length)
      };
      console.log('Bilinmeyen veri yapısı, en iyi tahminle dönüştürüldü');
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
    
    // AI ile quest oluşturma işlemi için API yolu
    const backendUrl = 'http://localhost:8000/api/ai/admin/generate-quest/';
    console.log('Quest oluşturma isteği yapılıyor:', backendUrl);
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