// API_BASE_URL değişkenini backend sunucunuza göre güncelleyin
const API_BASE_URL = 'http://localhost:8000/api';

const api = {
  /**
   * API ile istek yapar
   * @param {string} endpoint - API endpoint'i
   * @param {Object} options - Fetch API seçenekleri
   * @param {boolean} requiresAuth - Yetkilendirme gerektiriyor mu?
   * @returns {Promise<Object>} - API yanıtı
   */
  async request(endpoint, options = {}, requiresAuth = true) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Eğer yetkilendirme gerekiyorsa, token ekleyelim
    if (requiresAuth && typeof window !== 'undefined') {
        let token = localStorage.getItem('token');
        
        // Eğer token boşsa 1 saniye bekleyip tekrar kontrol et
        if (!token) {
            console.warn("⚠️ Token boş, 1 saniye bekleyip tekrar kontrol ediyorum...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            token = localStorage.getItem('token');
        }

        console.log("📢 API'ye Gönderilen Token:", token);
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn(`⚠️ Yetkilendirme gerektiren API isteği yapılıyor, ancak token yok: ${endpoint}`);
        }
    }

    const config = {
        ...options,
        headers,
    };

    try {
        console.log(`🔹 API isteği yapılıyor: ${url}`, config);
        const response = await fetch(url, config);

        if (!response.ok) {
            console.error('❌ API Yanıtı:', response.status, response.statusText);

            if ((response.status === 401 || response.status === 403) && localStorage.getItem('token')) {
                console.warn('❌ Yetkilendirme hatası, token geçersiz olabilir.');
                localStorage.removeItem('token');
            }

            let errorMessage = `API hatası: ${response.status} - ${response.statusText}`;

            try {
                const errorData = await response.json();
                console.error('Hata Verileri:', errorData);

                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (jsonError) {
                console.error('⚠️ Hata yanıtı JSON formatında değil');
            }

            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('❌ API isteği hatası:', error);
        throw error;
    }
},


  /**
   * GET isteği yapar
   * @param {string} endpoint - API endpoint'i
   * @param {boolean} requiresAuth - Yetkilendirme gerektiriyor mu?
   * @returns {Promise<Object>}
   */
  async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'GET' }, requiresAuth);
  },

  /**
   * POST isteği yapar
   * @param {string} endpoint - API endpoint'i
   * @param {Object} body - Gönderilecek veri
   * @param {boolean} requiresAuth - Yetkilendirme gerektiriyor mu?
   * @returns {Promise<Object>}
   */
  async post(endpoint, body, requiresAuth = true) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }, requiresAuth);
  },

  /**
   * PUT isteği yapar
   * @param {string} endpoint - API endpoint'i
   * @param {Object} body - Güncellenecek veri
   * @param {boolean} requiresAuth - Yetkilendirme gerektiriyor mu?
   * @returns {Promise<Object>}
   */
  async put(endpoint, body, requiresAuth = true) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }, requiresAuth);
  },

  /**
   * DELETE isteği yapar
   * @param {string} endpoint - API endpoint'i
   * @param {boolean} requiresAuth - Yetkilendirme gerektiriyor mu?
   * @returns {Promise<Object>}
   */
  async delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'DELETE' }, requiresAuth);
  },
};

export default api;
