import api from './api';

const authService = {
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} - Response with user data and token
   */
    login: async (credentials) => {
        try {
            console.log("🔹 Login İsteği Yapılıyor:", credentials);
            const response = await api.post('/users/login/', credentials);
            console.log("🔹 API Yanıtı:", response);

            if (response.token && response.token.access) {
                localStorage.setItem('token', response.token.access);  // Doğru token'ı kaydediyoruz
                localStorage.setItem('user', JSON.stringify(response.user));
                console.log("✅ Doğru Token Kaydedildi:", response.token.access);
            } else {
                console.error("❌ API Yanıtında Token Yok!", response);
            }

            return response;
        } catch (error) {
            console.error("❌ Login Hatası:", error);
            throw error;
        }
    },


  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Response with user data
   */
  register: async (userData) => {
    try {
      const response = await api.post('/users/register/', userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current authenticated user from local storage
   * @returns {Object|null} - User data or null if not authenticated
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;