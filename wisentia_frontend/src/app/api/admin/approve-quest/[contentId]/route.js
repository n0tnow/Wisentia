// app/api/admin/approve-quest/[contentId]/route.js
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    // Await params for Next.js 14 compatibility
    const resolvedParams = await params;
    const contentId = resolvedParams.contentId;
    console.log(`Approve quest request: contentId=${contentId}`);
    
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
      
      console.log('API Proxy: Token bilgisi:', token ? `${token.substring(0, 15)}...` : 'Yok');
    } catch (error) {
      console.error('Token erişim hatası:', error);
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Kimlik doğrulama gerekli', message: 'Token bulunamadı' },
        { status: 401 }
      );
    }
    
    try {
      // İstek verilerini al
      const requestData = await request.json();
      console.log('Approve Quest Request data:', requestData);
      
      // Backend API URL
      const backendUrl = `http://localhost:8000/api/ai/admin/approve-quest/${contentId}/`;
      console.log('Backend API isteği yapılıyor:', backendUrl);
      
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
      
      console.log('Backend yanıt durumu:', response.status);
      
      // Önce response text'i alalım
      const responseText = await response.text();
      console.log('Raw response (first 200 chars):', responseText.substring(0, 200));
      
      // HTML yanıtı kontrolü - ÖNCELİKLİ KONTROL
      if (responseText.trim().startsWith('<!DOCTYPE html>') || 
          responseText.trim().startsWith('<!DOCTYPE HTML>') ||
          responseText.trim().startsWith('<html') ||
          responseText.includes('<title>Login</title>') ||
          responseText.includes('Django administration')) {
        console.error('HTML yanıtı alındı - Kimlik doğrulama hatası veya yanlış endpoint');
        
        return NextResponse.json({
          error: 'Kimlik doğrulama hatası',
          message: 'Backend kimlik doğrulama hatası. Lütfen tekrar giriş yapın.',
          type: 'html_response',
          htmlPreview: responseText.substring(0, 200) + '...'
        }, { status: 401 });
      }
      
      // Boş yanıt kontrolü
      if (!responseText || responseText.trim() === '') {
        console.log('Empty response received, treating as success');
        return NextResponse.json({
          success: true,
          message: 'Quest approved successfully',
          questId: contentId
        });
      }
      
      // JSON parse attempt
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw response that failed to parse:', responseText.substring(0, 500));
        
        // Parse hatası durumunda daha detaylı kontrol
        return NextResponse.json({
          error: 'JSON parse hatası',
          message: 'Sunucudan gelen yanıt JSON formatında değil',
          type: 'json_parse_error',
          rawResponse: responseText.substring(0, 500)
        }, { status: 500 });
      }
      
      // Başarısız response durumu
      if (!response.ok) {
        console.error('Backend API error:', data);
        return NextResponse.json({
          error: data.error || 'API hatası',
          message: data.message || data.detail || 'Bilinmeyen hata oluştu',
          details: data
        }, { status: response.status });
      }
      
      // Başarılı yanıt
      console.log('Quest approved successfully');
      return NextResponse.json({
        success: true,
        message: data.message || 'Quest approved successfully',
        questId: data.questId || contentId,
        ...data
      });
      
    } catch (error) {
      console.error('API request error:', error);
      return NextResponse.json({
        error: 'Sunucu hatası',
        message: error.message,
        type: 'server_error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Fatal error in approve-quest route:', error);
    return NextResponse.json({
      error: 'Kritik hata',
      message: error.message,
      type: 'fatal_error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}