/*
'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import walletService from '@/services/walletService';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Context oluşturma
const WalletContext = createContext({
  walletAddress: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  saveWalletAddress: async () => {},
  shortenAddress: () => {},
  error: null,
});

// Wallet Provider bileşeni
export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Sayfa yüklendiğinde wallet bağlantısını kontrol et
  useEffect(() => {
    const checkWalletConnection = () => {
      const connectedWallet = walletService.getConnectedWallet();
      if (connectedWallet) {
        setWalletAddress(connectedWallet.address);
        setChainId(connectedWallet.chainId);
      }
    };

    // MetaMask yüklü mü kontrol et
    if (walletService.isMetaMaskInstalled()) {
      checkWalletConnection();
      
      // Dinleyicileri başlat
      walletService.initializeListeners(
        // Hesap değiştiğinde
        (newAddress) => {
          console.log('Hesap değişti:', newAddress);
          setWalletAddress(newAddress);
        },
        // Zincir değiştiğinde
        (newChainId) => {
          console.log('Ağ değişti:', newChainId);
          setChainId(newChainId);
        },
        // Bağlantı kesildiğinde
        () => {
          console.log('Cüzdan bağlantısı kesildi');
          setWalletAddress(null);
          setChainId(null);
        }
      );
    }
  }, []);

  // Cüzdan bağlama fonksiyonu
  const connectWallet = async () => {
    if (!walletService.isMetaMaskInstalled()) {
      setError('MetaMask yüklü değil. Lütfen MetaMask eklentisini yükleyin.');
      return null;
    }

    try {
      setIsConnecting(true);
      setError(null);
      
      const result = await walletService.connectWallet();
      setWalletAddress(result.address);
      setChainId(result.chainId);
      
      // Kullanıcı giriş yapmışsa ve cüzdan adresi kayıtlı değilse, adresi kaydet
      if (isAuthenticated && user && !user.wallet_address) {
        await saveWalletAddress(result.address);
      }
      
      return result;
    } catch (error) {
      console.error('Cüzdan bağlantı hatası:', error);
      setError(error.message || 'Cüzdan bağlantısı başarısız oldu. Lütfen tekrar deneyin.');
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  // Cüzdan bağlantısını kesme fonksiyonu
  const disconnectWallet = () => {
    walletService.disconnectWallet();
    setWalletAddress(null);
    setChainId(null);
  };

  // Cüzdan adresini kullanıcı profiline kaydetme
  const saveWalletAddress = async (address) => {
    if (!isAuthenticated || !address) return;
    
    try {
      // İlk olarak cüzdan adresi formatını doğrula
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error('Geçersiz cüzdan adresi formatı');
      }
      
      // Kullanıcı profilini cüzdan adresi ile güncelle
      const response = await api.post('/users/wallet', { wallet_address: address });
      console.log('Cüzdan adresi kaydedildi:', response);
      return response;
    } catch (error) {
      console.error('Cüzdan adresi kaydetme hatası:', error);
      setError(error.message || 'Cüzdan adresi kaydedilemedi');
      throw error;
    }
  };

  // Adresi kısaltma yardımcı fonksiyonu
  const shortenAddress = (address) => {
    return walletService.shortenAddress(address || walletAddress);
  };

  // Context değeri
  const value = {
    walletAddress,
    chainId,
    isConnecting,
    isConnected: !!walletAddress,
    connectWallet,
    disconnectWallet,
    saveWalletAddress,
    shortenAddress,
    error,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// Wallet context'i kullanmak için hook
export function useWallet() {
  return useContext(WalletContext);
}

export default WalletContext;

// Ağ türleri
export const NETWORKS = {
  ETHEREUM_MAINNET: {
    chainId: '0x1', // Onluk tabanda 1
    name: 'Ethereum Ana Ağı',
    currency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  ETHEREUM_GOERLI: {
    chainId: '0x5', // Onluk tabanda 5
    name: 'Goerli Test Ağı',
    currency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io']
  },
  ETHEREUM_SEPOLIA: {
    chainId: '0xaa36a7', // Onluk tabanda 11155111
    name: 'Sepolia Test Ağı',
    currency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  POLYGON_MAINNET: {
    chainId: '0x89', // Onluk tabanda 137
    name: 'Polygon Ana Ağı',
    currency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  POLYGON_MUMBAI: {
    chainId: '0x13881', // Onluk tabanda 80001
    name: 'Polygon Mumbai',
    currency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com']
  }
};*/