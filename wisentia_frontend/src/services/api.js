const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Token işlemleri
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// API isteği gönderme fonksiyonu
async function fetchAPI(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API isteği başarısız oldu');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth servisleri
export const authService = {
  login: async (credentials) => {
    const data = await fetchAPI('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.tokens) {
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },
  
  register: async (userData) => {
    const data = await fetchAPI('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.tokens) {
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('Refresh token not found');
    
    const data = await fetchAPI('/auth/refresh-token/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (data.access) {
      localStorage.setItem('access_token', data.access);
    }
    
    return data;
  },
  
  getProfile: async () => {
    return await fetchAPI('/auth/profile/');
  },
};

// Diğer servisler burada tanımlanacak
// ...

export default fetchAPI;