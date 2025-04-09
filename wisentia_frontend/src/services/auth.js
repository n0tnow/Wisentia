// @/services/auth.js

// API baz URL (environment değişkeninden okunabilir)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API istekleri için yardımcı fonksiyonlar
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Sunucudan dönen hata
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
    
    return {
      success: false,
      error: error.response.data?.error || 'Server error occurred',
      statusCode: error.response.status
    };
  } else {
    // Diğer hatalar
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      statusCode: 0
    };
  }
};

// HTTP istekleri
const http = {
  get: async (url, options = {}) => {
    try {
      console.log(`Making GET request to ${url}`);
      
      // Token varsa ekle
      const headers = { 
        'Content-Type': 'application/json',
        ...options.headers 
      };
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers,
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
          response: { status: response.status, data }
        };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('GET request error:', error);
      return {
        success: false, 
        error: error.message || 'Request failed'
      };
    }
  },
  
  post: async (url, data = {}, options = {}) => {
    try {
      console.log(`Making POST request to ${url}`);
      console.log('Request payload:', data);
      
      // Token varsa ekle
      const headers = { 
        'Content-Type': 'application/json',
        ...options.headers 
      };
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        ...options
      });
      
      const responseData = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Complete API response:', responseData);
      
      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || responseData.detail || `HTTP error! status: ${response.status}`,
          response: { status: response.status, data: responseData }
        };
      }
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('POST request error:', error);
      return {
        success: false, 
        error: error.message || 'Request failed'
      };
    }
  },
  
  // Diğer metodlar (put, delete) gerekirse eklenebilir
};

// Auth servisi
export const authService = {
  // Giriş yapma
  login: async (credentials) => {
    try {
      console.log('Login payload:', credentials);
      const result = await http.post('/auth/login/', credentials);
      
      // API yanıtının tamamını incele
      console.log('Complete login API response:', result);
      
      if (result.success) {
        const { data } = result;
        
        // Debug - API yanıtını daha detaylı incele
        console.log('API Response - user:', data.user);
        console.log('API Response - tokens structure:', data.tokens);
        
        // Backend yapınızı kontrol edin - token yapısı aşağıdaki gibi olmalı
        // Eğer farklıysa, yapıyı buradan düzenleyebilirsiniz
        
        let tokens = null;
        
        // Check if tokens object exists directly
        if (data.tokens && typeof data.tokens === 'object') {
          tokens = data.tokens;
        }
        // Django'nun token yanıtı farklı bir formatta olabilir (token/tokens alanı)
        else if (data.token) {
          // Token tek bir string olarak döndüyse
          tokens = { access: data.token };
        }
        // Başka bir yapı kullanılıyorsa burada kontrol edilebilir
        
        return {
          success: true,
          user: data.user,
          tokens: tokens
        };
      }
      
      return {
        success: false,
        error: result.error || 'Login failed'
      };
    } catch (error) {
      console.error('Login service error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred during login'
      };
    }
  },

  // Kayıt olma
  register: async (userData) => {
    try {
      const result = await http.post('/auth/register/', userData);
      
      if (result.success) {
        const { data } = result;
        
        return {
          success: true,
          user: data.user,
          tokens: data.tokens
        };
      }
      
      return {
        success: false,
        error: result.error || 'Registration failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'An error occurred during registration'
      };
    }
  },

  // Çıkış yapma
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Kullanıcı profil bilgilerini getir
  getProfile: async () => {
    try {
      const result = await http.get('/auth/profile/');
      
      if (result.success) {
        return {
          success: true,
          profile: result.data
        };
      }
      
      return {
        success: false,
        error: result.error || 'Failed to fetch profile'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'An error occurred while fetching profile'
      };
    }
  },

  // Token yenileme
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return {
          success: false,
          error: 'No refresh token found'
        };
      }
      
      const result = await http.post('/auth/refresh-token/', {
        refresh_token: refreshToken
      });
      
      if (result.success) {
        const { data } = result;
        
        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }
        
        return {
          success: true,
          tokens: data
        };
      }
      
      return {
        success: false,
        error: result.error || 'Failed to refresh token'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'An error occurred during token refresh'
      };
    }
  }
};