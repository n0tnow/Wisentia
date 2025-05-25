'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// API baz URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Token doğrulaması - güvenli hale getirildi
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    // Token formatını kontrol et
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Base64 decode ve payload kontrolü
    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(base64);
      const payload = JSON.parse(payloadJson);
      
      if (!payload.exp) return false;
      
      // Süre kontrolü
      const expiryTime = payload.exp * 1000; // saniyeden milisaniyeye çevir
      const now = Date.now();

      console.log("Token süre kontrolü:", new Date(expiryTime).toLocaleString(), "Şu an:", new Date(now).toLocaleString());
      return expiryTime > now;
    } catch (decodeError) {
      console.error("Token decode hatası:", decodeError);
      return false;
    }
  } catch (e) {
    console.error("Token kontrol hatası:", e);
    return false;
  }
};

// Tüm cookie'leri temizle
const clearAllCookies = () => {
  // Tüm cookie'leri bul ve temizle
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  
  // Kritik cookie'leri özellikle temizle
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// HTTP istekleri
const http = {
  get: async (url, options = {}) => {
    try {
      console.log(`GET isteği: ${url}`);
      
      // Header'lar
      const headers = { 
        'Content-Type': 'application/json',
        ...options.headers 
      };
      
      // Token varsa ekle
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers,
        credentials: 'include',
        ...options
      });
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parse hatası:', jsonError);
        data = {};
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `HTTP hata! Durum: ${response.status}`,
          response: { status: response.status, data }
        };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('GET isteği hatası:', error);
      return {
        success: false, 
        error: error.message || 'İstek başarısız'
      };
    }
  },
  
  post: async (url, data = {}, options = {}) => {
    try {
      console.log(`POST isteği: ${url}`);
      
      // Header'lar
      const headers = { 
        'Content-Type': 'application/json',
        ...options.headers 
      };
      
      // Token varsa ekle, ancak login/register için ekleme
      if (typeof window !== 'undefined' && !url.includes('/auth/login/') && !url.includes('/auth/register/')) {
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
        ...options
      });
      
      console.log('Yanıt durumu:', response.status);
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('API yanıtı:', responseData);
      } catch (jsonError) {
        console.error('JSON parse hatası:', jsonError);
        responseData = {};
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || responseData.detail || `HTTP hata! Durum: ${response.status}`,
          response: { status: response.status, data: responseData }
        };
      }
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('POST isteği hatası:', error);
      return {
        success: false, 
        error: error.message || 'İstek başarısız'
      };
    }
  },
};

// Auth servisi
const authService = {
  // Giriş yapma
  login: async (credentials) => {
    try {
      console.log('Login isteği:', credentials.email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      
      console.log('Login yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Login yanıt verisi:', data);
      } catch (jsonError) {
        console.error('Login yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      if (!response.ok) {
        console.error('Login başarısız:', data);
        return {
          success: false,
          error: data.error || data.detail || `Login başarısız: ${response.status}`
        };
      }
      
      // Başarılı giriş
      console.log('Login başarılı, kullanıcı:', data.user);
      
      // LocalStorage'da bilgileri güncelle
      if (data.tokens && data.tokens.access) {
        localStorage.setItem('access_token', data.tokens.access);
        
        if (data.tokens.refresh) {
          localStorage.setItem('refresh_token', data.tokens.refresh);
        }
      } else if (data.token) {
        localStorage.setItem('access_token', data.token);
      }
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token,
        tokens: data.tokens
      };
    } catch (error) {
      console.error('Login servis hatası:', error);
      return {
        success: false,
        error: error.message || 'Login sırasında hata oluştu'
      };
    }
  },

  // Kayıt olma
  register: async (userData) => {
    try {
      console.log('Register isteği:', userData.email);
      
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      console.log('Register yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('Register yanıt verisi:', data);
      } catch (jsonError) {
        console.error('Register yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      if (!response.ok) {
        console.error('Register başarısız:', data);
        return {
          success: false,
          error: data.error || data.detail || `Register başarısız: ${response.status}`
        };
      }
      
      // Başarılı kayıt
      console.log('Register başarılı, kullanıcı:', data.user);
      
      // LocalStorage'da bilgileri güncelle
      if (data.tokens && data.tokens.access) {
        localStorage.setItem('access_token', data.tokens.access);
        
        if (data.tokens.refresh) {
          localStorage.setItem('refresh_token', data.tokens.refresh);
        }
      } else if (data.token) {
        localStorage.setItem('access_token', data.token);
      }
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return {
        success: true,
        user: data.user,
        token: data.token,
        tokens: data.tokens
      };
    } catch (error) {
      console.error('Register servis hatası:', error);
      return {
        success: false,
        error: error.message || 'Kayıt sırasında hata oluştu'
      };
    }
  },

  // Çıkış yapma - güçlendirildi
  logout: async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Sunucudan çıkış yap
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          credentials: 'include',
        });
      } catch (apiError) {
        console.warn('Logout API hatası:', apiError);
      }
      
      // LocalStorage temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Tüm cookie'leri temizle
      clearAllCookies();
      
      console.log('Logout başarılı: Tüm token ve user bilgileri temizlendi');
      
      // Sayfayı tamamen yeniden yükle
      window.location.href = '/login';
      
      return { success: true };
    } catch (error) {
      console.error('Logout hatası:', error);
      
      // Hata olsa bile bilgileri temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      clearAllCookies();
      
      window.location.href = '/login';
      return { success: false, error: 'Çıkış sırasında hata oluştu' };
    }
  },

  // Token yenileme
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return {
          success: false,
          error: 'Refresh token bulunamadı'
        };
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Token yenileme başarısız',
          status: response.status
        };
      }
      
      const data = await response.json();
      
      // LocalStorage güncelle
      if (data.access) {
        localStorage.setItem('access_token', data.access);
      }
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      
      return {
        success: true,
        tokens: data
      };
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      return {
        success: false,
        error: error.message || 'Token yenileme sırasında hata oluştu'
      };
    }
  },

  // Şifre sıfırlama talebi
  requestPasswordReset: async (email) => {
    try {
      console.log('Şifre sıfırlama talebi:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/request-password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      
      console.log('Şifre sıfırlama talebi yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Şifre sıfırlama yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      // Güvenlik nedeniyle başarılı yanıt dön (e-posta var mı yok mu belli olmaması için)
      if (response.ok || response.status === 200) {
        return {
          success: true,
          message: data.message || 'If your account exists, you will receive a password reset email'
        };
      }
      
      return {
        success: false,
        error: data.error || data.detail || `Şifre sıfırlama talebi başarısız: ${response.status}`
      };
    } catch (error) {
      console.error('Şifre sıfırlama talebi hatası:', error);
      return {
        success: false,
        error: error.message || 'Şifre sıfırlama talebi sırasında hata oluştu'
      };
    }
  },

  // Şifre sıfırlama işlemi
  resetPassword: async (token, newPassword) => {
    try {
      console.log('Şifre sıfırlama işlemi başlatıldı');
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword }),
        credentials: 'include'
      });
      
      console.log('Şifre sıfırlama işlemi yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Şifre sıfırlama işlemi yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `Şifre sıfırlama başarısız: ${response.status}`
        };
      }
      
      return {
        success: true,
        message: data.message || 'Your password has been reset successfully'
      };
    } catch (error) {
      console.error('Şifre sıfırlama işlemi hatası:', error);
      return {
        success: false,
        error: error.message || 'Şifre sıfırlama sırasında hata oluştu'
      };
    }
  },

  // E-posta doğrulama kodu ile doğrulama
  verifyEmailWithCode: async (email, code) => {
    try {
      console.log('E-posta doğrulama kodu doğrulanıyor:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-email-with-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code }),
        credentials: 'include'
      });
      
      console.log('Doğrulama yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Doğrulama yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `Doğrulama başarısız: ${response.status}`
        };
      }
      
      return {
        success: true,
        message: data.message || 'E-posta başarıyla doğrulandı'
      };
    } catch (error) {
      console.error('E-posta doğrulama işlemi hatası:', error);
      return {
        success: false,
        error: error.message || 'E-posta doğrulama sırasında hata oluştu'
      };
    }
  },

  // Kod ile şifre sıfırlama
  resetPasswordWithCode: async (email, code, newPassword) => {
    try {
      console.log('Şifre sıfırlama işlemi başlatıldı (kod ile)');
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password-with-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code, new_password: newPassword }),
        credentials: 'include'
      });
      
      console.log('Şifre sıfırlama işlemi yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Şifre sıfırlama işlemi yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `Şifre sıfırlama başarısız: ${response.status}`
        };
      }
      
      return {
        success: true,
        message: data.message || 'Şifreniz başarıyla sıfırlandı'
      };
    } catch (error) {
      console.error('Şifre sıfırlama işlemi hatası:', error);
      return {
        success: false,
        error: error.message || 'Şifre sıfırlama sırasında hata oluştu'
      };
    }
  },

  // Yeni doğrulama kodu gönderme
  resendVerificationCode: async (email) => {
    try {
      console.log('Yeni doğrulama kodu isteniyor:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      
      console.log('Doğrulama kodu yeniden gönderme yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Doğrulama kodu yeniden gönderme yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      // Güvenlik nedeniyle başarılı yanıt dön
      if (response.ok || response.status === 200) {
        return {
          success: true,
          message: data.message || 'Doğrulama kodu gönderildi'
        };
      }
      
      return {
        success: false,
        error: data.error || data.detail || `Doğrulama kodu gönderme başarısız: ${response.status}`
      };
    } catch (error) {
      console.error('Doğrulama kodu gönderme hatası:', error);
      return {
        success: false,
        error: error.message || 'Doğrulama kodu gönderme sırasında hata oluştu'
      };
    }
  },

  // E-posta doğrulama işlemi
  verifyEmail: async (token) => {
    try {
      console.log('E-posta doğrulama işlemi başlatıldı');
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token }),
        credentials: 'include'
      });
      
      console.log('E-posta doğrulama işlemi yanıt durumu:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('E-posta doğrulama işlemi yanıt parse hatası:', jsonError);
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt'
        };
      }
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `E-posta doğrulama başarısız: ${response.status}`
        };
      }
      
      return {
        success: true,
        message: data.message || 'Your email has been verified successfully'
      };
    } catch (error) {
      console.error('E-posta doğrulama işlemi hatası:', error);
      return {
        success: false,
        error: error.message || 'E-posta doğrulama sırasında hata oluştu'
      };
    }
  },

  // Kimlik doğrulama durumunu kontrol et - düzeltildi
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      // Token ve kullanıcı bilgisi gerekli
      if (!token || !userStr) {
        console.log('Auth kontrolü: Token veya kullanıcı bilgisi eksik');
        return false;
      }
      
      // Token format ve süre kontrolü
      const isValid = isTokenValid(token);
      console.log('Auth kontrolü: Token var:', !!token, 'Kullanıcı var:', !!userStr, 'Geçerli:', isValid);
      
      return isValid;
    } catch (error) {
      console.error('Auth kontrolü hatası:', error);
      return false;
    }
  }
};

// React Context oluştur
const AuthContext = createContext(null);

// Auth Provider bileşeni
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // LocalStorage'dan kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setIsLoading(true);
        
        // Giriş kontrolü
        const path = window.location.pathname;
        
        // Login veya register sayfasındaysa token kontrolü yapmadan geç
        if (path === '/login' || path === '/register' || path.includes('/forgot-password') || path.includes('/reset-password') || path.includes('/verify-email')) {
          console.log('Kimlik doğrulama gerektirmeyen sayfa: Auth kontrolü atlandı');
          setIsLoading(false);
          setAuthChecked(true);
          return;
        }
        
        // LocalStorage'dan verileri al
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        
        console.log('Storage yükleniyor. Token var:', !!token, 'Kullanıcı var:', !!userStr);
        
        // Token kontrolü
        if (userStr && token && isTokenValid(token)) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
            console.log('Kullanıcı localStorage\'dan yüklendi');
          } catch (parseError) {
            console.error('Kullanıcı verisi parse hatası:', parseError);
            setUser(null);
          }
        } else {
          console.log('LocalStorage\'da geçerli veri bulunamadı');
          setUser(null);
        }
      } catch (error) {
        console.error('Storage\'dan yükleme hatası:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };
    
    loadUserFromStorage();
  }, []);

  // Giriş fonksiyonu
  const login = async (credentials) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Önce mevcut oturum bilgilerini temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      clearAllCookies();
      
      // Login işlemini gerçekleştir
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        // Kullanıcı state'ini güncelle
        setUser(result.user);
        setAuthChecked(true);
        
        // Cookie olarak da sakla
        document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400`;
        
        if (result.token) {
          document.cookie = `access_token=${result.token}; path=/; max-age=86400`;
        } else if (result.tokens && result.tokens.access) {
          document.cookie = `access_token=${result.tokens.access}; path=/; max-age=86400`;
        }
        
        return result;
      } else {
        setAuthError(result.error);
        return result;
      }
    } catch (error) {
      setAuthError(error.message || 'Login başarısız');
      return { success: false, error: error.message || 'Login başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt fonksiyonu
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      // Önceki oturum bilgilerini temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      clearAllCookies();
      
      // Register işlemini gerçekleştir
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        // State'i güncelle
        setUser(result.user);
        setAuthChecked(true);
        
        // Cookie olarak da sakla
        document.cookie = `user=${JSON.stringify(result.user)}; path=/; max-age=86400`;
        
        if (result.token) {
          document.cookie = `access_token=${result.token}; path=/; max-age=86400`;
        } else if (result.tokens && result.tokens.access) {
          document.cookie = `access_token=${result.tokens.access}; path=/; max-age=86400`;
        }
        
        return result;
      } else {
        setAuthError(result.error);
        return result;
      }
    } catch (error) {
      setAuthError(error.message || 'Kayıt başarısız');
      return { success: false, error: error.message || 'Kayıt başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const logout = async () => {
    try {
      // Token al
      const token = localStorage.getItem('access_token');
      
      // API isteğinde kimlik doğrulama başlığını gönder
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          credentials: 'include',
        });
      } catch (apiError) {
        console.warn('Logout API hatası, devam ediliyor:', apiError);
      }
      
      // State temizle
      setUser(null);
      
      // LocalStorage temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Tüm cookie'leri temizle
      clearAllCookies();
      
      // Sayfayı tamamen yeniden yükle - bu önemli!
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout hatası:', error);
      
      // Hata durumunda bile state ve localStorage'ı temizle
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      clearAllCookies();
      
      // Sayfayı tamamen yeniden yükle
      window.location.href = '/login';
    }
  };

  // Şifre sıfırlama talebi 
  const requestPasswordReset = async (email) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.requestPasswordReset(email);
      return result;
    } catch (error) {
      setAuthError(error.message || 'Şifre sıfırlama talebi başarısız');
      return { success: false, error: error.message || 'Şifre sıfırlama talebi başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // Şifre sıfırlama işlemi
  const resetPassword = async (token, newPassword) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.resetPassword(token, newPassword);
      return result;
    } catch (error) {
      setAuthError(error.message || 'Şifre sıfırlama başarısız');
      return { success: false, error: error.message || 'Şifre sıfırlama başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // E-posta doğrulama işlemi
  const verifyEmail = async (token) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.verifyEmail(token);
      return result;
    } catch (error) {
      setAuthError(error.message || 'E-posta doğrulama başarısız');
      return { success: false, error: error.message || 'E-posta doğrulama başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // E-posta doğrulama kodu ile doğrulama
  const verifyEmailWithCode = async (email, code) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.verifyEmailWithCode(email, code);
      return result;
    } catch (error) {
      setAuthError(error.message || 'E-posta doğrulama başarısız');
      return { success: false, error: error.message || 'E-posta doğrulama başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // Kod ile şifre sıfırlama
  const resetPasswordWithCode = async (email, code, newPassword) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.resetPasswordWithCode(email, code, newPassword);
      return result;
    } catch (error) {
      setAuthError(error.message || 'Şifre sıfırlama başarısız');
      return { success: false, error: error.message || 'Şifre sıfırlama başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni doğrulama kodu gönderme
  const resendVerificationCode = async (email) => {
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await authService.resendVerificationCode(email);
      return result;
    } catch (error) {
      setAuthError(error.message || 'Doğrulama kodu gönderme başarısız');
      return { success: false, error: error.message || 'Doğrulama kodu gönderme başarısız' };
    } finally {
      setIsLoading(false);
    }
  };

  // Kimlik doğrulama kontrolü
  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  // Context provider değeri
  const value = {
    user,
    isLoading,
    authChecked,
    authError,
    login,
    register,
    logout,
    isAuthenticated,
    refreshToken: authService.refreshToken,
    requestPasswordReset,
    resetPassword,
    resetPasswordWithCode,  // Yeni eklenen
    verifyEmail,
    verifyEmailWithCode,   // Yeni eklenen
    resendVerificationCode, // Yeni eklenen
    updateUser: (userData) => setUser(userData)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook ile kullanım
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır');
  }
  return context;
};