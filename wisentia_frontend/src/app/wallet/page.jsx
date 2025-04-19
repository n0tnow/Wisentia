'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  useTheme,
  Fade,
  Zoom,
  Slide,
  Grow
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TokenIcon from '@mui/icons-material/Token';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { styled } from '@mui/system';
import dynamic from 'next/dynamic';

// SORUNUN ÇÖZÜMÜ: Web3Handler'ı sadece manuel ihtiyaç olduğunda yükleyeceğiz
// Bunu dinamik bir fonksiyon yerine direkt bileşene çevirdik, kontrol için prop ekledik
const Web3Handler = ({ onConnect, onDisconnect, enabled }) => {
  // Eğer enabled değilse hiçbir şey yapma
  if (!enabled || typeof window === 'undefined') return null;
  
  // MetaMask hesap değişikliklerini dinle
  useEffect(() => {
    // MetaMask events
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length > 0) {
          if (onConnect) onConnect(newAccounts[0]);
        } else {
          if (onDisconnect) onDisconnect();
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [onConnect, onDisconnect]);

  return null;
};

// Özel stillendirilmiş bileşenler
const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4527a0 0%, #3f51b5 50%, #2196f3 100%)',
  color: theme.palette.common.white,
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 8px 16px rgba(69, 39, 160, 0.2)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(69, 39, 160, 0.3)',
  },
}));

const GlowingCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
  animation: 'pulse 4s infinite ease-in-out',
  '@keyframes pulse': {
    '0%': { opacity: 0.3, transform: 'scale(0.95)' },
    '50%': { opacity: 0.7, transform: 'scale(1.05)' },
    '100%': { opacity: 0.3, transform: 'scale(0.95)' },
  }
}));

const BackgroundParticle = styled(Box)(({ theme, delay = 0 }) => ({
  position: 'absolute',
  borderRadius: '50%',
  width: '10px',
  height: '10px',
  background: 'rgba(255, 255, 255, 0.2)',
  animation: `float 8s infinite ease-in-out ${delay}s`,
  '@keyframes float': {
    '0%': { transform: 'translateY(0px) translateX(0px)' },
    '33%': { transform: 'translateY(-20px) translateX(10px)' },
    '66%': { transform: 'translateY(10px) translateX(-10px)' },
    '100%': { transform: 'translateY(0px) translateX(0px)' },
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minHeight: 64,
  '&.Mui-selected': {
    color: '#4527a0',
    fontWeight: 700,
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  borderRadius: 12,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
    transition: 'all 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
}));

// Status indicator component
const StatusIndicator = styled('span')(({ theme, active = true }) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: active ? '#4caf50' : '#f44336',
  marginRight: 8,
  boxShadow: active ? '0 0 6px #4caf50' : '0 0 6px #f44336',
}));

export default function WalletPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  // Client-side state
  const [mounted, setMounted] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // Connect wallet states
  const [walletAddress, setWalletAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  
  // MetaMask state
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [isMetaMaskConnecting, setIsMetaMaskConnecting] = useState(false);
  
  // Web3Handler control - ÖNEMLİ: Sadece manuel olarak aktifleştirilecek
  const [web3HandlerEnabled, setWeb3HandlerEnabled] = useState(false);
  
  // Disconnect dialog
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  
  // Copy notification
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Prevent multiple connection notifications
  const hasShownConnectSuccess = useRef(false);

  // Hydration safe-guard
  useEffect(() => {
    setMounted(true);
    
    // Check for MetaMask
    const checkMetaMask = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setHasMetaMask(true);
      }
    };
    
    checkMetaMask();
  }, []);
  
  // Handle MetaMask connection result
  const handleMetaMaskConnect = async (address) => {
    try {
      // ÖNEMLİ: Halihazırda bağlı durumdaysak işlem yapmayı engelle
      if (walletInfo?.connected) return;
      
      // API ÇAĞRISI KALDIRILIYOR - backend henüz hazır değil
      // Bunun yerine mock data ile ilerliyoruz
      
      // Mock işlemi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ÖNEMLİ: Tekrar eden bildirim problemini önlemek için doğrudan state'e atamamak
      if (!hasShownConnectSuccess.current) {
        setWalletInfo({
          connected: true,
          address: address,
          balance: '0.000',
          network: 'EduChain',
          nftCount: 0
        });
        
        // Bildirim göster ve otomatik kapat (tek seferlik)
        setConnectSuccess(true);
        setTimeout(() => setConnectSuccess(false), 3000);
        
        // Bir kez gösterildiğini işaretle
        hasShownConnectSuccess.current = true;
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      setError('Failed to connect with MetaMask. Please try again.');
    }
  };
  
  const handleMetaMaskDisconnect = () => {
    // SORUN ÇÖZÜMÜ: Burada bir şey yapmıyoruz çünkü zaten bağlantıyı keseceğiz
    console.log("MetaMask disconnect event received");
  };
  
  // Fetch wallet information - ÖNEMLİ: Sadece bir kez çalıştırılacak
  useEffect(() => {
    if (!mounted) return;
    
    const fetchWalletInfo = async () => {
      setLoading(true);
      
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      try {
        // In a real application, fetch from API:
        // const response = await fetch('/api/wallet/info/');
        // const data = await response.json();
        
        // Mock data for now
        const mockConnected = user?.walletAddress || Math.random() > 0.5;
        
        if (mockConnected) {
          const mockWallet = {
            connected: true,
            address: user?.walletAddress || '0x1234567890abcdef1234567890abcdef12345678',
            balance: '0.128',
            network: 'EduChain',
            nftCount: 7
          };
          
          const mockTransactions = [
            {
              id: 1,
              type: 'mint',
              hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              timestamp: '2023-08-15T14:30:00Z',
              details: 'Minted Blockchain Pioneer NFT'
            },
            {
              id: 2,
              type: 'mint',
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              timestamp: '2023-08-10T09:15:00Z',
              details: 'Minted Course Completion: Web3 Basics NFT'
            },
            {
              id: 3,
              type: 'transfer',
              hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
              timestamp: '2023-07-28T16:45:00Z',
              details: 'Received 0.05 EDU from Platform Rewards'
            }
          ];
          
          setTimeout(() => {
            setWalletInfo(mockWallet);
            setTransactions(mockTransactions);
            setWalletAddress(mockWallet.address);
            setLoading(false);
            // İlk yüklemede bildirim göstermiyoruz!
            hasShownConnectSuccess.current = true;
          }, 1000);
        } else {
          setTimeout(() => {
            setWalletInfo({ connected: false });
            setLoading(false);
            hasShownConnectSuccess.current = false;
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch wallet info:', error);
        setError('Failed to load wallet information. Please try again.');
        setLoading(false);
      }
    };
    
    fetchWalletInfo();
    // ÖNEMLİ: Bu effect'i sadece bir kez çalıştırıyoruz
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);
  
  // Connect via manual address input
  const handleConnectWallet = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Validate address
    if (!walletAddress) {
      setAddressError('Wallet address is required');
      return;
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setAddressError('Please enter a valid Ethereum address');
      return;
    }
    
    setConnectLoading(true);
    setAddressError('');
    
    try {
      // API ÇAĞRISI KALDIRILIYOR - backend henüz hazır değil
      // Bunun yerine mock data ile ilerliyoruz
      
      // Simülasyon
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWalletInfo({
        connected: true,
        address: walletAddress,
        balance: '0.000',
        network: 'EduChain',
        nftCount: 0
      });
      
      // ÖNEMLİ: Sadece manuel bağlanmada bildirim gösteriyoruz
      // Tek seferlik gösterim kontrolü
      if (!hasShownConnectSuccess.current) {
        setConnectSuccess(true);
        setTimeout(() => {
          setConnectSuccess(false);
        }, 3000);
        hasShownConnectSuccess.current = true;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setConnectLoading(false);
    }
  };
  
  // Connect via MetaMask
  const connectMetaMask = async () => {
    if (!mounted || typeof window === 'undefined' || !window.ethereum) return;
    
    setIsMetaMaskConnecting(true);
    
    try {
      // ÖNEMLİ: Web3Handler'ı aktif et
      setWeb3HandlerEnabled(true);
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        
        // Metamask bağlantısını işle
        await handleMetaMaskConnect(address);
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      setError('Failed to connect with MetaMask. Please try again.');
    } finally {
      setIsMetaMaskConnecting(false);
    }
  };
  
  const handleDisconnectOpen = () => {
    setDisconnectOpen(true);
  };
  
  const handleDisconnectClose = () => {
    setDisconnectOpen(false);
  };
  
  const handleDisconnectWallet = async () => {
    setDisconnectLoading(true);
    
    try {
      // API ÇAĞRISI KALDIRILIYOR - backend henüz hazır değil
      // Bunun yerine mock data ile ilerliyoruz
      
      // Simülasyon
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ÖNEMLİ: MetaMask bağlantısını tamamen kesmek için web3HandlerEnabled'ı kapatıyoruz
      setWeb3HandlerEnabled(false);
      
      // ÖNEMLİ: Burada connected: false olarak ayarlıyoruz
      setWalletInfo({ connected: false });
      setDisconnectOpen(false);
      
      // ÖNEMLİ: Bağlantı kesildikten sonra tekrar bildirim kontrolünü sıfırlıyoruz
      hasShownConnectSuccess.current = false;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError('Failed to disconnect wallet. Please try again.');
    } finally {
      setDisconnectLoading(false);
    }
  };
  
  const handleAddressChange = (event) => {
    setWalletAddress(event.target.value);
    
    if (addressError) {
      setAddressError('');
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const copyToClipboard = (text) => {
    if (!mounted) return;
    
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      },
      () => {
        setError('Failed to copy to clipboard');
      }
    );
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const shortenTxHash = (hash) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`;
  };
  
  // Handle hydration issues with Next.js
  if (!mounted) {
    return null; // Return nothing during server-side rendering
  }
  
  if (!isAuthenticated()) {
    return (
      <Container maxWidth="lg">
        <Zoom in={true} timeout={800}>
          <Box sx={{ 
            my: 8, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            px: 2
          }}>
            <GradientCard sx={{ maxWidth: 600, width: '100%', mb: 4, p: 5 }}>
              <GlowingCircle sx={{ width: 300, height: 300, top: -100, right: -100 }} />
              <GlowingCircle sx={{ width: 200, height: 200, bottom: -50, left: -50 }} />
              
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <LockIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                  Wallet Authentication Required
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                  Connect your wallet to access exclusive blockchain features, mint NFTs, and track your educational achievements.
                </Typography>
                <AnimatedButton 
                  variant="contained" 
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    px: 4, 
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Log In to Proceed
                </AnimatedButton>
              </Box>
            </GradientCard>
          </Box>
        </Zoom>
      </Container>
    );
  }
  
  if (loading) {
    return (
      <Container sx={{ 
        my: 12, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '50vh'
      }}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={80} 
            thickness={4} 
            sx={{ 
              color: '#4527a0',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              }
            }} 
          />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AccountBalanceWalletIcon 
              sx={{ 
                fontSize: 40,
                color: '#4527a0',
                opacity: 0.7
              }} 
            />
          </Box>
        </Box>
        <Typography variant="h6" sx={{ mt: 4, fontWeight: 500 }}>
          Loading Wallet Information...
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          This may take a moment while we connect to the blockchain
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* MetaMask handler component - ÖNEMLİ: Sadece manuel olarak aktifleştirildiğinde render edilecek */}
      {web3HandlerEnabled && (
        <Web3Handler 
          onConnect={handleMetaMaskConnect}
          onDisconnect={handleMetaMaskDisconnect}
          enabled={web3HandlerEnabled}
        />
      )}
      
      <Fade in={true} timeout={1000}>
        <Box>
          {/* Başlık ve açıklama - ortalanmış */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(90deg, #4527a0 0%, #3f51b5 50%, #2196f3 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Blockchain Wallet
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              Manage your digital assets, view transactions, and mint NFTs with your connected wallet
            </Typography>
          </Box>
          
          {error && (
            <Slide direction="right" in={!!error} mountOnEnter unmountOnExit>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setError('')}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </Slide>
          )}
          
          {/* Başarı mesajını Snackbar olarak göster (tüm ekranı kapatmayan şekilde) */}
          <Snackbar
            open={connectSuccess}
            autoHideDuration={3000}
            onClose={() => setConnectSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              icon={<CheckCircleIcon fontSize="inherit" />} 
              severity="success"
              variant="filled"
              sx={{ 
                borderRadius: 3,
                boxShadow: theme.shadows[8]
              }}
            >
              Wallet connected successfully! You can now mint and manage your NFTs.
            </Alert>
          </Snackbar>
          
          {walletInfo?.connected ? (
            // Connected wallet view
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Zoom in={true} timeout={800}>
                    <GradientCard>
                      <CardContent sx={{ position: 'relative', height: '100%', p: 4, zIndex: 2 }}>
                        <GlowingCircle sx={{ width: 300, height: 300, top: -100, right: -100 }} />
                        {/* Animated background particles */}
                        <BackgroundParticle sx={{ top: '20%', right: '40%' }} delay={0} />
                        <BackgroundParticle sx={{ top: '70%', right: '20%' }} delay={1} />
                        <BackgroundParticle sx={{ top: '40%', right: '70%' }} delay={2} />
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: 4
                        }}>
                          <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>
                            CURRENT BALANCE
                          </Typography>
                          
                          <AnimatedButton 
                            variant="outlined" 
                            color="inherit"
                            size="small"
                            onClick={handleDisconnectOpen}
                            startIcon={<LockIcon />}
                            sx={{ 
                              borderColor: 'rgba(255,255,255,0.5)',
                              '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)'
                              }
                            }}
                          >
                            Disconnect
                          </AnimatedButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 5 }}>
                          <Typography variant="h2" component="div" sx={{ fontWeight: 700, letterSpacing: -1 }}>
                            {walletInfo.balance}
                          </Typography>
                          <Typography variant="h5" component="span" sx={{ ml: 1, opacity: 0.8 }}>
                            EDU
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Paper sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)', 
                              p: 2,
                              borderRadius: 3,
                              backdropFilter: 'blur(5px)'
                            }}>
                              <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>
                                Address
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}>
                                <Typography sx={{ 
                                  fontFamily: 'monospace', 
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '70%'
                                }}>
                                  {shortenAddress(walletInfo.address)}
                                </Typography>
                                <Box>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => copyToClipboard(walletInfo.address)}
                                    sx={{ color: 'white', opacity: 0.8 }}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    onClick={() => window.open(`https://explorer.educhain.example/address/${walletInfo.address}`, '_blank')}
                                    sx={{ color: 'white', opacity: 0.8 }}
                                  >
                                    <OpenInNewIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Paper sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)', 
                              p: 2,
                              borderRadius: 3,
                              backdropFilter: 'blur(5px)',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <TokenIcon sx={{ mr: 2 }} />
                              <Box>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                                  NFT Collection
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {walletInfo.nftCount} Items
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                          <AnimatedButton 
                            variant="contained" 
                            fullWidth
                            startIcon={<TokenIcon />}
                            onClick={() => router.push('/nfts')}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)', 
                              color: 'white',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                              },
                            }}
                          >
                            View NFT Collection
                          </AnimatedButton>
                          <AnimatedButton 
                            variant="outlined" 
                            fullWidth
                            color="inherit"
                            startIcon={<SwapHorizIcon />}
                            disabled
                            sx={{ 
                              borderColor: 'rgba(255,255,255,0.3)',
                              color: 'white',
                              opacity: 0.7,
                              '&.Mui-disabled': {
                                color: 'rgba(255,255,255,0.5)',
                                borderColor: 'rgba(255,255,255,0.2)',
                              }
                            }}
                          >
                            Transfer Assets
                          </AnimatedButton>
                        </Box>
                      </CardContent>
                    </GradientCard>
                  </Zoom>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Grow in={true} timeout={800} style={{ transformOrigin: '0 0 0' }}>
                    <Card sx={{ 
                      borderRadius: 4, 
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: '#4527a0',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <AccountBalanceWalletIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Wallet Details
                        </Typography>
                      </Box>
                      
                      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Network
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* Fix hydration error: Using Box instead of div inside Typography */}
                            <StatusIndicator />
                            <Typography 
                              variant="body1" 
                              component="div" 
                              sx={{ 
                                fontWeight: 600,
                                color: '#4527a0' 
                              }}
                            >
                              {walletInfo.network}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Connected Since
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(new Date().toISOString())}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Status
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: '#4caf50',
                            fontWeight: 500
                          }}>
                            Active & Synced
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                          <Typography variant="body2" color="textSecondary" paragraph>
                            Full Wallet Address:
                          </Typography>
                          <Box sx={{ 
                            fontFamily: 'monospace',
                            wordBreak: 'break-all', 
                            bgcolor: '#1e1e1e', // Dark background for contrast with white text
                            color: '#fff',  // White text for better visibility on dark theme
                            p: 2,
                            borderRadius: 2,
                            fontSize: '0.875rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            {walletInfo.address}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>
              
              <Paper sx={{ 
                mt: 4, 
                borderRadius: 4, 
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)'
              }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  TabIndicatorProps={{
                    style: {
                      background: 'linear-gradient(90deg, #4527a0 0%, #3f51b5 50%, #2196f3 100%)',
                      height: 3
                    }
                  }}
                >
                  <StyledTab 
                    icon={<ReceiptIcon sx={{ mb: 0.5 }} />} 
                    label="Transaction History" 
                    iconPosition="start"
                  />
                  <StyledTab 
                    icon={<TokenIcon sx={{ mb: 0.5 }} />} 
                    label="NFT Activity" 
                    iconPosition="start"
                  />
                </Tabs>
                
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {tabValue === 0 && (
                    <List sx={{ p: 0 }}>
                      {transactions.length > 0 ? (
                        transactions.map((tx, index) => (
                          <ListItem 
                            key={tx.id}
                            divider={index < transactions.length - 1}
                            sx={{
                              py: 2.5,
                              px: 3,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              }
                            }}
                            secondaryAction={
                              <IconButton 
                                size="small"
                                onClick={() => window.open(`https://explorer.educhain.example/tx/${tx.hash}`, '_blank')}
                                sx={{ 
                                  color: '#4527a0', 
                                  '&:hover': { 
                                    backgroundColor: 'rgba(69, 39, 160, 0.08)' 
                                  } 
                                }}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            }
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {tx.type === 'mint' ? 
                                <TokenIcon sx={{ color: '#3f51b5' }} /> : 
                                <SwapHorizIcon sx={{ color: '#2196f3' }} />
                              }
                            </ListItemIcon>
                            
                            {/* Hydration hatası çözümü: <p> içinde <div> kullanmayı önlemek için */}
                            <ListItemText 
                              primary={tx.details}
                              secondary={
                                <Typography component="span" variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                  {formatDate(tx.timestamp)}
                                  <Typography component="span" variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: 'text.secondary' }}>
                                    {shortenTxHash(tx.hash)}
                                  </Typography>
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <HistoryIcon sx={{ fontSize: 40, color: '#9e9e9e', mb: 2, opacity: 0.5 }} />
                          <Typography variant="body1" color="textSecondary">
                            No transactions yet
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Your transactions will appear here once you mint NFTs or receive tokens
                          </Typography>
                        </Box>
                      )}
                    </List>
                  )}
                  
                  {tabValue === 1 && (
                    <List sx={{ p: 0 }}>
                      {transactions.filter(tx => tx.type === 'mint').length > 0 ? (
                        transactions
                          .filter(tx => tx.type === 'mint')
                          .map((tx, index, filteredTx) => (
                            <ListItem 
                              key={tx.id}
                              divider={index < filteredTx.length - 1}
                              sx={{
                                py: 2.5,
                                px: 3,
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                }
                              }}
                              secondaryAction={
                                <IconButton 
                                  size="small"
                                  onClick={() => window.open(`https://explorer.educhain.example/tx/${tx.hash}`, '_blank')}
                                  sx={{ 
                                    color: '#4527a0', 
                                    '&:hover': { 
                                      backgroundColor: 'rgba(69, 39, 160, 0.08)' 
                                    } 
                                  }}
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              }
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                <TokenIcon sx={{ color: '#3f51b5' }} />
                              </ListItemIcon>
                              
                              {/* Hydration hatası çözümü: <p> içinde <div> kullanmayı önlemek için */}
                              <ListItemText 
                                primary={tx.details}
                                secondary={
                                  <Typography component="span" variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                    {formatDate(tx.timestamp)}
                                    <Typography component="span" variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: 'text.secondary' }}>
                                      {shortenTxHash(tx.hash)}
                                    </Typography>
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))
                      ) : (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <TokenIcon sx={{ fontSize: 40, color: '#9e9e9e', mb: 2, opacity: 0.5 }} />
                          <Typography variant="body1" color="textSecondary">
                            No NFT activity yet
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Your NFT transactions will appear here once you mint or trade NFTs
                          </Typography>
                        </Box>
                      )}
                    </List>
                  )}
                </Box>
              </Paper>
            </>
          ) : (
            // Not connected view
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Zoom in={true} timeout={800}>
                  <GradientCard>
                    <CardContent sx={{ position: 'relative', p: 4, zIndex: 2 }}>
                      <GlowingCircle sx={{ width: 300, height: 300, top: -100, right: -100 }} />
                      <BackgroundParticle sx={{ top: '20%', right: '40%' }} delay={0} />
                      <BackgroundParticle sx={{ top: '70%', right: '20%' }} delay={1} />
                      <BackgroundParticle sx={{ top: '40%', right: '70%' }} delay={2} />
                      
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                          Connect Your Wallet
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
                          Link your Ethereum wallet to start minting educational NFTs and access exclusive blockchain features
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 4 }}>
                        {hasMetaMask ? (
                          <AnimatedButton
                            variant="contained"
                            color="inherit"
                            size="large"
                            fullWidth
                            onClick={connectMetaMask}
                            disabled={isMetaMaskConnecting}
                            startIcon={isMetaMaskConnecting ? 
                              <CircularProgress size={20} color="inherit" /> : 
                              <AccountBalanceWalletIcon /> // Metamask ikon yerine genel cüzdan ikonu kullanıyoruz
                            }
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)', 
                              color: 'white',
                              py: 1.8,
                              fontWeight: 600,
                              fontSize: '1rem',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                              },
                              mb: 2
                            }}
                          >
                            {isMetaMaskConnecting ? 'Connecting...' : 'Connect with MetaMask'}
                          </AnimatedButton>
                        ) : (
                          <AnimatedButton
                            variant="contained"
                            color="inherit"
                            size="large"
                            fullWidth
                            onClick={() => window.open('https://metamask.io/download/', '_blank')}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)', 
                              color: 'white',
                              py: 1.8,
                              fontWeight: 600,
                              fontSize: '1rem',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                              },
                              mb: 2
                            }}
                          >
                            Install MetaMask
                          </AnimatedButton>
                        )}
                        
                        <Divider sx={{ 
                          my: 3, 
                          color: 'rgba(255,255,255,0.7)', 
                          '&::before, &::after': {
                            borderColor: 'rgba(255,255,255,0.3)',
                          }
                        }}>
                          <Typography variant="body2" sx={{ px: 1 }}>
                            OR CONNECT MANUALLY
                          </Typography>
                        </Divider>
                        
                        <TextField
                          label="Ethereum Wallet Address"
                          placeholder="0x..."
                          fullWidth
                          value={walletAddress}
                          onChange={handleAddressChange}
                          error={!!addressError}
                          helperText={addressError}
                          sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'rgba(255,255,255,0.1)',
                              borderRadius: 2,
                              color: 'white',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.5)',
                            },
                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'white !important',
                            },
                            '& .Mui-focused': {
                              color: 'white',
                            },
                            '& .MuiFormHelperText-root': {
                              color: 'white',
                            }
                          }}
                        />
                        
                        <AnimatedButton
                          variant="outlined"
                          color="inherit"
                          size="large"
                          fullWidth
                          onClick={handleConnectWallet}
                          disabled={connectLoading}
                          startIcon={connectLoading ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWalletIcon />}
                          sx={{ 
                            borderColor: 'rgba(255,255,255,0.5)',
                            color: 'white',
                            py: 1.5,
                            fontWeight: 500,
                            '&:hover': {
                              borderColor: 'white',
                              bgcolor: 'rgba(255,255,255,0.1)',
                            }
                          }}
                        >
                          {connectLoading ? 'Connecting...' : 'Connect Wallet'}
                        </AnimatedButton>
                      </Box>
                    </CardContent>
                  </GradientCard>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grow in={true} timeout={800} style={{ transformOrigin: '0 0 0' }}>
                  <Card sx={{ 
                    borderRadius: 4, 
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    height: '100%'
                  }}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: '#4527a0',
                      color: 'white'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Web3 Wallet Guide
                      </Typography>
                    </Box>
                    
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        What is a Web3 Wallet?
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        A Web3 wallet is your digital identity in the blockchain world. It allows you to:
                      </Typography>
                      
                      <List dense sx={{ mb: 3 }}>
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Box sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: 'rgba(69, 39, 160, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <AccountBalanceWalletIcon sx={{ fontSize: 14, color: '#4527a0' }} />
                            </Box>
                          </ListItemIcon>
                          <ListItemText primary="Store and manage your digital assets" />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Box sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: 'rgba(69, 39, 160, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <TokenIcon sx={{ fontSize: 14, color: '#4527a0' }} />
                            </Box>
                          </ListItemIcon>
                          <ListItemText primary="Mint and collect educational NFTs" />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Box sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: 'rgba(69, 39, 160, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <SwapHorizIcon sx={{ fontSize: 14, color: '#4527a0' }} />
                            </Box>
                          </ListItemIcon>
                          <ListItemText primary="Transfer tokens and NFTs" />
                        </ListItem>
                      </List>
                      
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Why MetaMask?
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        MetaMask is the most popular and user-friendly Ethereum wallet. It's a browser extension 
                        that makes it easy to interact with blockchain applications.
                      </Typography>
                      
                      <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <AnimatedButton
                          variant="contained"
                          onClick={() => window.open('https://metamask.io/download/', '_blank')}
                          sx={{ 
                            bgcolor: '#4527a0',
                            color: 'white',
                            '&:hover': {
                              bgcolor: '#3f51b5',
                            }
                          }}
                          startIcon={<AccountBalanceWalletIcon />} // Metamask ikonu kaldırıldı
                        >
                          Get MetaMask
                        </AnimatedButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            </Grid>
          )}
          
          {/* Disconnect Wallet Dialog */}
          <Dialog 
            open={disconnectOpen} 
            onClose={handleDisconnectClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                padding: 1
              }
            }}
          >
            <DialogTitle sx={{ 
              pb: 1, 
              pt: 2,
              px: 3,
              fontWeight: 600
            }}>
              Disconnect Wallet
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body1" paragraph>
                Are you sure you want to disconnect your wallet from Wisentia?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can reconnect your wallet at any time. This action will not affect your NFTs or tokens.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={handleDisconnectClose} 
                disabled={disconnectLoading}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDisconnectWallet} 
                color="error" 
                variant="contained"
                disabled={disconnectLoading}
                startIcon={disconnectLoading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {disconnectLoading ? 'Processing...' : 'Disconnect'}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Copy Success Snackbar */}
          <Snackbar
            open={copySuccess}
            autoHideDuration={3000}
            onClose={() => setCopySuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              icon={<CheckCircleIcon fontSize="inherit" />} 
              severity="success"
              variant="filled"
              sx={{ 
                borderRadius: 3,
                boxShadow: theme.shadows[8]
              }}
            >
              Address copied to clipboard
            </Alert>
          </Snackbar>
        </Box>
      </Fade>
    </Container>
  );
}