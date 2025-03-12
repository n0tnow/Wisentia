// services/walletService.js
import api from './api';

const walletService = {
  /**
   * MetaMask cüzdanına bağlanır
   * @returns {Promise<Object>} - Bağlantı bilgilerini içeren nesne
   */
  async connectWallet() {
    // MetaMask'ın tarayıcıda yüklü olup olmadığını kontrol et
    if (!window.ethereum) {
      throw new Error('MetaMask bulunamadı. Lütfen MetaMask eklentisini yükleyin.');
    }

    try {
      // Kullanıcıdan cüzdan bağlantısı için izin iste
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // İlk adresi al
      const address = accounts[0];
      
      // Ağ bilgilerini al
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      console.log('Cüzdan bağlantısı başarılı:', { address, chainId });
      
      // Bağlantı bilgilerini localStorage'a kaydet
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('walletChainId', chainId);
      
      // Bağlantı bilgilerini döndür
      return { address, chainId };
    } catch (error) {
      console.error('Cüzdan bağlantı hatası:', error);
      throw error;
    }
  },
  
  /**
   * Bağlı cüzdanın bilgilerini döndürür
   * @returns {Object|null} - Bağlı cüzdan bilgileri veya null
   */
  getConnectedWallet() {
    const address = localStorage.getItem('walletAddress');
    const chainId = localStorage.getItem('walletChainId');
    
    if (!address) return null;
    
    return { address, chainId };
  },
  
  /**
   * Cüzdan bağlantısını keser
   */
  disconnectWallet() {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletChainId');
  },
  
  /**
   * Cüzdan adresini kullanıcı profiline kaydeder
   * @param {string} address - Cüzdan adresi
   * @returns {Promise<Object>} - API yanıtı
   */
  async saveWalletAddress(address) {
    try {
      return await api.post('/users/wallet', { wallet_address: address });
    } catch (error) {
      console.error('Cüzdan adresi kaydetme hatası:', error);
      throw error;
    }
  },
  
  /**
   * MetaMask olaylarını dinleme işlevlerini başlatır
   * @param {Function} onAccountsChanged - Hesap değişikliğinde çağrılacak fonksiyon
   * @param {Function} onChainChanged - Ağ değişikliğinde çağrılacak fonksiyon
   * @param {Function} onDisconnect - Bağlantı kesildiğinde çağrılacak fonksiyon
   */
  /*initializeListeners(onAccountsChanged, onChainChanged, onDisconnect) {
    if (!window.ethereum) return;
    
    // Hesap değişikliğini dinle
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('Hesap değişikliği:', accounts);
      
      if (accounts.length === 0) {
        // Tüm hesaplar çıkış yaptığında
        this.disconnectWallet();
        if (onDisconnect) onDisconnect();
      } else {
        // Yeni hesap bilgilerini kaydet
        const address = accounts[0];
        localStorage.setItem('walletAddress', address);
        
        if (onAccountsChanged) onAccountsChanged(address);
      }
    });
    
    // Ağ değişikliğini dinle
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Ağ değişikliği:', chainId);
      localStorage.setItem('walletChainId', chainId);
      
      if (onChainChanged) onChainChanged(chainId);
      
      // Ağ değişikliğinde sayfayı yenile (MetaMask'ın önerdiği yaklaşım)
      window.location.reload();
    });
    
    // Bağlantı kesme olayını dinle
    window.ethereum.on('disconnect', (error) => {
      console.log('MetaMask bağlantısı kesildi:', error);
      this.disconnectWallet();
      
      if (onDisconnect) onDisconnect();
    });
  },
  
  /**
   * MetaMask'ın mevcut olup olmadığını kontrol eder
   * @returns {boolean} - MetaMask mevcutsa true
   */
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  },
  
  /**
   * Cüzdanın bağlı olup olmadığını kontrol eder
   * @returns {boolean} - Cüzdan bağlıysa true
   */
  isWalletConnected() {
    return Boolean(this.getConnectedWallet()?.address);
  },
  
  /**
   * Cüzdan adresini kısaltarak gösterir
   * @param {string} address - Cüzdan adresi
   * @returns {string} - Kısaltılmış adres (ör. 0x1234...5678)
   */
  shortenAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
};

export default walletService;
