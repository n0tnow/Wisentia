// API işlemleri için yardımcı fonksiyonlar
export const safeParseJson = async (response) => {
    try {
      const text = await response.text();
      
      // HTML yanıtı kontrolü
      if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
        console.error('HTML yanıtı alındı:', text.substring(0, 150));
        return { 
          success: false,
          error: 'HTML yanıtı alındı, JSON beklendi', 
          htmlResponse: true, 
          text: text.substring(0, 150) 
        };
      }
      
      try {
        const data = JSON.parse(text);
        return { data, success: true };
      } catch (e) {
        console.error('JSON parse hatası:', e, 'Yanıt:', text.substring(0, 150));
        return { 
          success: false,
          error: 'JSON parse hatası', 
          text: text.substring(0, 150) 
        };
      }
    } catch (e) {
      console.error('Yanıt okuma hatası:', e);
      return { 
        success: false,
        error: 'Yanıt okunamadı' 
      };
    }
  };
  
  // API istekleri için wrapper fonksiyon
  export const fetchWithAuth = async (url, options = {}) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      };
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const result = await safeParseJson(response);
        
        if (result.success) {
          return {
            success: true,
            data: result.data
          };
        } else {
          return {
            success: false,
            error: result.error || 'Veri işleme hatası',
            statusCode: response.status
          };
        }
      } else {
        // Başarısız yanıt için detay çıkarma
        const errorResult = await safeParseJson(response);
        return {
          success: false,
          error: errorResult.success ? errorResult.data?.error || 'API hatası' : 'API yanıt hatası',
          statusCode: response.status,
          details: errorResult.success ? errorResult.data : errorResult.error
        };
      }
    } catch (error) {
      console.error('API isteği hatası:', error);
      return {
        success: false,
        error: error.message || 'Bağlantı hatası',
        statusCode: 0
      };
    }
  };
  
  // Dashboard verilerini çekme
  export const fetchDashboardData = async (apiBaseUrl, customEndpoint = 'admin/dashboard') => {
    // API URL oluştur
    const fullApiUrl = `${apiBaseUrl}/${customEndpoint}`.replace(/\/+/g, '/').replace(':/', '://');
    
    // Next.js API Route kontrolü
    const requestUrl = apiBaseUrl === '/api' ? `/api/admin/dashboard` : fullApiUrl;
    
    console.log(`API isteği yapılıyor: ${requestUrl}`);
    
    return await fetchWithAuth(requestUrl, { method: 'GET' });
  };
  
  // Token yenileme işlemi
  export const refreshAuthToken = async (refreshFn) => {
    try {
      console.log('Token yenileniyor...');
      const result = await refreshFn();
      
      if (result && result.success) {
        console.log('Token yenileme başarılı');
        return {
          success: true,
          token: localStorage.getItem('access_token')
        };
      } else {
        console.error('Token yenileme başarısız:', result?.error);
        return {
          success: false,
          error: result?.error || 'Token yenileme başarısız'
        };
      }
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      return {
        success: false,
        error: error.message || 'Token yenileme sırasında hata oluştu'
      };
    }
  };
  
  // Örnek veri oluşturma
  export const createDummyData = () => {
    return {
      summary: {
        totalUsers: 850,
        newUsers: 76,
        activeCourses: 42,
        activeQuests: 65,
        totalNFTs: 320,
        activeSubscriptions: 420
      },
      activeUsers: [
        { UserID: 1, Username: 'john_doe', ActivityCount: 87 },
        { UserID: 2, Username: 'emma_smith', ActivityCount: 76 },
        { UserID: 3, Username: 'alex_wilson', ActivityCount: 65 },
        { UserID: 4, Username: 'olivia_brown', ActivityCount: 54 },
        { UserID: 5, Username: 'william_johnson', ActivityCount: 42 }
      ],
      popularCourses: [
        { CourseID: 1, Title: 'Blockchain Temelleri', EnrolledUsers: 120 },
        { CourseID: 2, Title: 'Web3 Geliştirme', EnrolledUsers: 98 },
        { CourseID: 3, Title: 'Akıllı Kontrat Güvenliği', EnrolledUsers: 87 },
        { CourseID: 4, Title: 'NFT Oluşturma ve Ticareti', EnrolledUsers: 76 },
        { CourseID: 5, Title: 'DeFi Prensipleri', EnrolledUsers: 65 }
      ],
      recentActivities: [
        { LogID: 1, Username: 'john_doe', ActivityType: 'course_completion', Description: '"Akıllı Kontrat Güvenliği" kursunu tamamladı', Timestamp: new Date().toISOString() },
        { LogID: 2, Username: 'emma_smith', ActivityType: 'course_start', Description: '"NFT Oluşturma ve Ticareti" kursuna başladı', Timestamp: new Date(Date.now() - 3600000).toISOString() },
        { LogID: 3, Username: 'alex_wilson', ActivityType: 'nft_earned', Description: '"Blockchain Öncüsü" NFT\'sini kazandı', Timestamp: new Date(Date.now() - 7200000).toISOString() },
        { LogID: 4, Username: 'olivia_brown', ActivityType: 'quest_completion', Description: '"DeFi Uzmanı" görevini tamamladı', Timestamp: new Date(Date.now() - 10800000).toISOString() },
        { LogID: 5, Username: 'william_johnson', ActivityType: 'subscription', Description: 'Pro Plana abone oldu', Timestamp: new Date(Date.now() - 14400000).toISOString() }
      ],
      dailyNewUsers: generateDailyData(30),
      userTypeDistribution: [
        { name: 'Yeni Kullanıcılar', value: 24 },
        { name: 'Aktif Kullanıcılar', value: 59 },
        { name: 'Pasif Kullanıcılar', value: 17 }
      ],
      dailyActivities: [
        { day: 'Pzt', courses: 40, quests: 25 },
        { day: 'Sal', courses: 30, quests: 20 },
        { day: 'Çar', courses: 45, quests: 30 },
        { day: 'Per', courses: 65, quests: 42 },
        { day: 'Cum', courses: 55, quests: 35 },
        { day: 'Cmt', courses: 35, quests: 28 },
        { day: 'Paz', courses: 30, quests: 15 }
      ]
    };
  };
  
  // Günlük veri üretimi için yardımcı fonksiyon 
  function generateDailyData(days) {
    const result = {};
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];
      result[dateStr] = Math.floor(Math.random() * 50) + 20; // 20-70 arası rastgele sayı
    }
    
    return result;
  }