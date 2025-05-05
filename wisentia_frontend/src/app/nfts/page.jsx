'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Grid, Box, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Paper, Divider, IconButton, useTheme, alpha, useMediaQuery,
  Collapse, InputAdornment, Menu, MenuItem, Snackbar, Avatar, CardMedia, CardContent
} from '@mui/material';
import {
  Token as TokenIcon, ShoppingCart as ShoppingCartIcon, AccountBalanceWallet as AccountBalanceWalletIcon,
  Close as CloseIcon, Info as InfoIcon, Verified as VerifiedIcon, ContentCopy as ContentCopyIcon,
  Star as StarIcon, LocalFireDepartment as LocalFireDepartmentIcon, EmojiEvents as EmojiEventsIcon,
  Login as LoginIcon, FilterList as FilterListIcon, Sort as SortIcon, 
  ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon, SwapHoriz as SwapHorizIcon, Check as CheckIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Mock veri - kısaltılmış
const PUBLIC_NFT_MOCK_DATA = [
  {
    nftId: 7, title: 'Annual Subscription', 
    description: 'Access to premium features for 365 days with special benefits.',
    imageUri: '/placeholder-nft7.jpg', type: 'subscription', rarity: 'Epic', 
    collection: 'Subscriptions', price: 299.99, isPublic: true
  },
  {
    nftId: 4, title: 'Premium Subscription',
    description: 'Access to premium features for 30 days.',
    imageUri: '/placeholder-nft4.jpg', type: 'subscription', rarity: 'Uncommon',
    collection: 'Subscriptions', price: 29.99, isPublic: true
  },
  {
    nftId: 14, title: 'Free Trial NFT',
    description: 'Get started with this free NFT to explore the platform.',
    imageUri: '/placeholder-nft-free.jpg', type: 'achievement', rarity: 'Common',
    collection: 'Free Collection', isPublic: true
  }
];

const USER_NFT_MOCK_DATA = [
  {
    userNftId: 1, nftId: 1, title: 'Blockchain Pioneer',
    description: 'This exclusive NFT proves your foundational knowledge in blockchain technology.',
    imageUri: '/placeholder-nft1.jpg', type: 'achievement', acquisitionDate: '2023-08-01',
    isMinted: false, rarity: 'Rare', collection: 'Blockchain Series'
  },
  {
    userNftId: 2, nftId: 2, title: 'Course Completion: Web3 Basics',
    description: 'You have successfully completed the Web3 Basics course.',
    imageUri: '/placeholder-nft2.jpg', type: 'course_completion', acquisitionDate: '2023-07-15',
    isMinted: true, transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    rarity: 'Common', collection: 'Course Certificates'
  },
  {
    userNftId: 3, nftId: 3, title: 'Early Adopter',
    description: 'You were among the first to join our platform.',
    imageUri: '/placeholder-nft3.jpg', type: 'achievement', acquisitionDate: '2023-06-10',
    isMinted: false, rarity: 'Epic', collection: 'Platform Achievements'
  },
  {
    userNftId: 5, nftId: 5, title: 'AI Expert',
    description: 'Completed all artificial intelligence learning paths.',
    imageUri: '/placeholder-nft5.jpg', type: 'achievement', acquisitionDate: '2023-07-25',
    isMinted: true, transactionHash: '0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef',
    rarity: 'Legendary', collection: 'Expertise Badges'
  }
];

// NFT kategorileri
// NFT kategorilerini güncelle
const NFT_CATEGORIES = [
  // Abonelik NFT'lerini en başa koy
  { id: 'subscriptions', title: 'Subscription Plans', icon: <StarIcon />, type: 'subscription' },
  { id: 'achievements', title: 'Achievement NFTs', icon: <EmojiEventsIcon />, type: 'achievement' },
  { id: 'courses', title: 'Course Completion NFTs', icon: <LocalFireDepartmentIcon />, type: 'course_completion' },
  { id: 'minted', title: 'Minted NFTs', icon: <VerifiedIcon />, condition: nft => nft.isMinted },
  { id: 'rare', title: 'Rare & Legendary NFTs', icon: <AutoAwesomeIcon />, condition: nft => ['Rare', 'Epic', 'Legendary'].includes(nft.rarity) }
];

export default function NFTsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [pageLoading, setPageLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [publicNfts, setPublicNfts] = useState([]);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({ rarity: [], type: [], collection: [] });
  
  // Dialog states
  const [selectedForTrade, setSelectedForTrade] = useState([]);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [targetSubscriptionNft, setTargetSubscriptionNft] = useState(null);
  const [tradeProcessing, setTradeProcessing] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [mintDialogOpen, setMintDialogOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState('');
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDetailNft, setSelectedDetailNft] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hoveredNftId, setHoveredNftId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Scroll kontrolleri için useRef ve useState
  const categoryRefs = useRef({});
  const scrollContainerRefs = useRef({});
  const [scrollStates, setScrollStates] = useState({});
  const [scrolled, setScrolled] = useState(false);
  
  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Kategori scroll kontrollerini başlat
  useEffect(() => {
    // Her kategori için scroll durumunu kontrol et
    const initialScrollStates = {};
    
    NFT_CATEGORIES.forEach(category => {
      initialScrollStates[category.id] = { canScrollLeft: false, canScrollRight: true };
    });
    
    setScrollStates(initialScrollStates);
    
    // Scroll kontrolü
    const checkScrollPosition = (categoryId) => {
      const container = scrollContainerRefs.current[categoryId];
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const canScrollLeft = scrollLeft > 0;
        const canScrollRight = scrollLeft < scrollWidth - clientWidth - 10;
        
        setScrollStates(prev => ({
          ...prev,
          [categoryId]: { canScrollLeft, canScrollRight }
        }));
      }
    };
    
    // Scroll event listenerları ekle
    Object.keys(scrollContainerRefs.current).forEach(categoryId => {
      const container = scrollContainerRefs.current[categoryId];
      if (container) {
        container.addEventListener('scroll', () => checkScrollPosition(categoryId));
        checkScrollPosition(categoryId);
      }
    });
    
    // Cleanup
    return () => {
      Object.keys(scrollContainerRefs.current).forEach(categoryId => {
        const container = scrollContainerRefs.current[categoryId];
        if (container) {
          container.removeEventListener('scroll', () => checkScrollPosition(categoryId));
        }
      });
    };
  }, [nfts, publicNfts]);
  
  // Kategori scroll fonksiyonu
  const handleCategoryScroll = (categoryId, direction) => {
    const container = scrollContainerRefs.current[categoryId];
    if (container) {
      const scrollAmount = direction === 'left' ? -container.clientWidth / 2 : container.clientWidth / 2;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Veri yükleme
  // Ana NFT sayfasındaki useEffect fonksiyonunu güncelle
useEffect(() => {
  const loadData = async () => {
    try {
      setPageLoading(true);
      
      // Tüm NFT'leri getir
      const publicNftsResponse = await fetch('/api/normal-user/nfts/available');
      if (!publicNftsResponse.ok) {
        throw new Error(`Failed to fetch NFTs: ${publicNftsResponse.status}`);
      }
      const publicNftsData = await publicNftsResponse.json();
      
      // API yanıtını normalize et (field adlarındaki farklılıkları düzelt)
      const formattedPublicNfts = publicNftsData.map(nft => ({
        nftId: nft.nftId,
        title: nft.title,
        description: nft.description,
        imageUri: nft.imageUri,
        type: nft.type,
        rarity: nft.rarity,
        collection: nft.collection,
        price: nft.price || nft.tradeValue,
        isPublic: true,
        planId: nft.planId // Abonelik planı ID'si (varsa)
      }));
      
      setPublicNfts(formattedPublicNfts);
      
      if (isAuthenticated()) {
        // Kullanıcının NFT'lerini getir
        const userNftsResponse = await fetch('/api/normal-user/nfts/user');
        if (userNftsResponse.ok) {
          const userNftsData = await userNftsResponse.json();
          setNfts(userNftsData);
        } else {
          console.error(`Failed to fetch user NFTs: ${userNftsResponse.status}`);
        }
        
        if (user?.walletAddress) setWalletAddress(user.walletAddress);
      }
    } catch (err) {
      console.error("Error loading NFT data:", err);
      setError('An error occurred while loading NFT data. Please refresh the page.');
    } finally {
      setPageLoading(false);
    }
  };
  
  loadData();
}, [isAuthenticated, user]);
  
  // Yardımcı fonksiyonlar
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };
  
  const scrollToCategory = (categoryId) => {
    if (categoryRefs.current[categoryId]) {
      categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const getNftsByCategory = (categoryId, allNfts) => {
    const category = NFT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return [];
    
    return allNfts.filter(nft => {
      if (category.type) return nft.type === category.type;
      if (category.condition) return category.condition(nft);
      return false;
    });
  };
  
  const getAllNfts = () => {
    if (pageLoading) return [];
    if (!isAuthenticated()) return publicNfts;
    return [...nfts, ...publicNfts.filter(pnft => !nfts.some(n => n.nftId === pnft.nftId))];
  };
  
  const getSearchFilteredNFTs = (nftList) => {
    if (!searchQuery) return nftList;
    const query = searchQuery.toLowerCase();
    return nftList.filter(nft => 
      nft.title.toLowerCase().includes(query) || 
      nft.description.toLowerCase().includes(query) ||
      nft.collection?.toLowerCase().includes(query) ||
      nft.rarity?.toLowerCase().includes(query)
    );
  };
  
  const getCustomFilteredNFTs = (nftList) => {
    if (selectedFilters.rarity.length === 0 && selectedFilters.type.length === 0 && selectedFilters.collection.length === 0) {
      return nftList;
    }
    
    return nftList.filter(nft => {
      const passesRarityFilter = selectedFilters.rarity.length === 0 || selectedFilters.rarity.includes(nft.rarity);
      const passesTypeFilter = selectedFilters.type.length === 0 || selectedFilters.type.includes(nft.type);
      const passesCollectionFilter = selectedFilters.collection.length === 0 || 
        (nft.collection && selectedFilters.collection.includes(nft.collection));
      
      return passesRarityFilter && passesTypeFilter && passesCollectionFilter;
    });
  };
  
  const getSortedNFTs = (nftList) => {
    switch (sortOption) {
      case 'newest':
        return [...nftList].sort((a, b) => {
          if (!a.acquisitionDate) return 1;
          if (!b.acquisitionDate) return -1;
          return new Date(b.acquisitionDate) - new Date(a.acquisitionDate);
        });
      case 'oldest':
        return [...nftList].sort((a, b) => {
          if (!a.acquisitionDate) return -1;
          if (!b.acquisitionDate) return 1;
          return new Date(a.acquisitionDate) - new Date(b.acquisitionDate);
        });
      case 'rarity':
        const rarityOrder = { 'Legendary': 1, 'Epic': 2, 'Rare': 3, 'Uncommon': 4, 'Common': 5 };
        return [...nftList].sort((a, b) => (rarityOrder[a.rarity] || 99) - (rarityOrder[b.rarity] || 99));
      case 'alphabetical':
        return [...nftList].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return nftList;
    }
  };
  
  // Stil yardımcıları
  const getNftTypeColor = (type) => {
    switch (type) {
      case 'achievement': return 'primary';
      case 'course_completion': return 'success';
      case 'subscription': return 'secondary';
      default: return 'default';
    }
  };
  
  const getNftTypeLabel = (type) => {
    switch (type) {
      case 'achievement': return 'Achievement';
      case 'course_completion': return 'Course Completion';
      case 'subscription': return 'Subscription';
      default: return type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };
  
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return '#808080';
      case 'Uncommon': return '#1b8e3d';
      case 'Rare': return '#0070dd';
      case 'Epic': return '#a335ee';
      case 'Legendary': return '#ff8000';
      default: return '#808080';
    }
  };
  
  // Event handlers
  const handleMintClick = (nft, event) => {
    if (event) event.stopPropagation();
    if (!isAuthenticated()) {
      setLoginDialogOpen(true);
      return;
    }
    setSelectedNft(nft);
    setMintDialogOpen(true);
    setMintSuccess(false);
    setMintError('');
  };
  
  const handleMintClose = () => setMintDialogOpen(false);
  const handleLoginClose = () => setLoginDialogOpen(false);
  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    setSelectedDetailNft(null);
  };
  
  const handleLoginRedirect = () => {
    router.push(`/login?redirect=${encodeURIComponent(router.pathname)}`);
  };
  
  const handleTradeDialogOpen = () => {
    if (!isAuthenticated()) {
      setLoginDialogOpen(true);
      return;
    }
    if (!walletAddress) {
      showSnackbar('Please connect your wallet first', 'warning');
      return;
    }
    setTradeDialogOpen(true);
    setTradeSuccess(false);
    setTradeError('');
  };
  
  const handleTradeDialogClose = () => {
    setTradeDialogOpen(false);
    setSelectedForTrade([]);
    setTargetSubscriptionNft(null);
  };
  
  const toggleNftSelection = (nft) => {
    const nftId = nft.userNftId || nft.nftId;
    setSelectedForTrade(prev => {
      if (prev.some(id => id === nftId)) return prev.filter(id => id !== nftId);
      return [...prev, nftId];
    });
  };
  
  const selectSubscriptionNft = (nft) => {
    setTargetSubscriptionNft(nft);
  };
  
  const handleTradeConfirm = async () => {
    setTradeProcessing(true);
    setTradeError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTradeSuccess(true);
      showSnackbar('NFTs successfully traded for subscription!', 'success');
      setTimeout(() => {
        handleTradeDialogClose();
      }, 2000);
    } catch (error) {
      console.error('Trade error:', error);
      setTradeError('Failed to complete trade. Please try again.');
    } finally {
      setTradeProcessing(false);
    }
  };
  
  const handleMint = async () => {
    if (!selectedNft) return;
    setMintLoading(true);
    setMintError('');
    try {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }
      
      // Rastgele transaction hash oluştur (gerçek projelerde blockchain işlemi yapılır)
      const transactionHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      const response = await fetch('/api/normal-user/nfts/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userNftId: selectedNft.userNftId,
          transactionHash
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mint NFT');
      }
      
      // Kullanıcının NFT listesini güncelle
      setNfts(prevNfts => 
        prevNfts.map(nft => 
          nft.userNftId === selectedNft.userNftId ? { 
            ...nft, 
            isMinted: true, 
            transactionHash 
          } : nft
        )
      );
      
      setMintSuccess(true);
      showSnackbar('NFT successfully minted to blockchain!', 'success');
      setTimeout(() => {
        setMintDialogOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      setMintError(error.message || 'Failed to mint NFT. Please try again.');
    } finally {
      setMintLoading(false);
    }
  };
  
  const handleConnectWallet = async () => {
    if (!isAuthenticated()) {
      setLoginDialogOpen(true);
      return;
    }
    setWalletConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      setWalletAddress(mockAddress);
      showSnackbar('Wallet connected successfully!', 'success');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      showSnackbar('Failed to connect wallet. Please try again.', 'error');
    } finally {
      setWalletConnecting(false);
    }
  };
  
  const handleNftClick = (nft) => {
    setSelectedDetailNft(nft);
    setDetailDialogOpen(true);
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      },
      () => {
        console.error('Failed to copy to clipboard');
      }
    );
  };
  
  const handleBuySubscription = (nft, event) => {
    if (event) event.stopPropagation();
    if (!isAuthenticated()) {
      setLoginDialogOpen(true);
      return;
    }
    
    // Eğer bu bir abonelik planı ise planId değerini kullan
    if (nft.planId) {
      router.push(`/subscriptions?planId=${nft.planId}`);
    } else {
      router.push('/subscriptions');
    }
  };
  
  const handleClaimFreeNFT = (nft, event) => {
    if (event) event.stopPropagation();
    if (!isAuthenticated()) {
      setLoginDialogOpen(true);
      return;
    }
    showSnackbar('Free NFT claimed successfully!', 'success');
  };
  
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };
  
  const handleSortChange = (option) => {
    setSortOption(option);
    handleSortMenuClose();
  };

  // Gamma Doppler renk paleti
  const gammaDopplerGradients = [
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(135deg, #130f40 0%, #2b4865 50%, #4682a9 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #1e3c72 50%, #2a5298 100%)',
    'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    'linear-gradient(135deg, #0a192f 0%, #144272 50%, #205295 100%)'
  ];
  
  // Rastgele Gamma Doppler gradyan seçme fonksiyonu
  const getRandomGammaDopplerGradient = () => {
    return gammaDopplerGradients[Math.floor(Math.random() * gammaDopplerGradients.length)];
  };
  
  // NFT Kart bileşeni
  const NFTCard = ({ nft, isTradeMode = false }) => {
    const isSelected = isTradeMode && selectedForTrade.includes(nft.userNftId || nft.nftId);
    const [gradientBg] = useState(getRandomGammaDopplerGradient());
    const [isCardHovered, setIsCardHovered] = useState(false);
    
    return (
      <Paper 
        sx={{ 
          height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden',
          transition: 'all 0.3s ease', 
          boxShadow: (isSelected || isCardHovered) ? theme.shadows[8] : theme.shadows[3],
          transform: (isSelected || isCardHovered) ? 'translateY(-8px)' : 'none',
          border: isSelected ? `3px solid ${theme.palette.primary.main}` : 'none',
          position: 'relative', cursor: 'pointer',
          '&:hover': { boxShadow: theme.shadows[8], transform: 'translateY(-8px)' }
        }}
        onMouseEnter={() => {
          setIsCardHovered(true);
        }}
        onMouseLeave={() => {
          setIsCardHovered(false);
        }}
        onClick={() => {
          if (isTradeMode) toggleNftSelection(nft);
          else handleNftClick(nft);
        }}
      >
        {nft.isPublic && nft.type === 'achievement' && (
          <Box sx={{ 
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            bgcolor: '#4caf50', color: '#fff', borderRadius: 5,
            px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            FREE
          </Box>
        )}
        
        <Box sx={{ 
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          bgcolor: getRarityColor(nft.rarity), color: '#fff', borderRadius: 5,
          px: 1.5, py: 0.5, fontSize: '0.75rem', fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {nft.rarity}
        </Box>
        
        <Box sx={{ position: 'relative', overflow: 'hidden', height: 180 }}>
          {/* Tema Uyumlu Gradient Arka Plan */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme.palette.mode === 'dark' 
                ? gradientBg 
                : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'transform 0.5s ease',
              transform: isCardHovered ? 'scale(1.1)' : 'scale(1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '150%',
                height: '150%',
                top: '-25%',
                left: '-25%',
                backgroundImage: theme.palette.mode === 'dark'
                  ? 'radial-gradient(circle, rgba(127, 255, 212, 0.2) 5%, transparent 15%)'
                  : 'radial-gradient(circle, rgba(63, 81, 181, 0.1) 5%, transparent 15%)',
                backgroundSize: '15px 15px',
                animation: 'sparkle 15s linear infinite',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, rgba(0, 255, 255, 0.05), rgba(127, 255, 212, 0.1))'
                  : 'linear-gradient(45deg, rgba(63, 81, 181, 0.05), rgba(33, 150, 243, 0.1))',
                opacity: 0.7,
                mixBlendMode: 'overlay',
              },
              '@keyframes sparkle': {
                '0%': { backgroundPosition: '0 0' },
                '100%': { backgroundPosition: '50px 50px' }
              }
            }}
          >
            {/* Sembolik İkon */}
            <Box sx={{ 
              opacity: 0.7, 
              transform: isCardHovered ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.5s ease',
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : theme.palette.text.secondary,
              textShadow: theme.palette.mode === 'dark' 
                ? '0 0 10px rgba(127, 255, 212, 0.5)' 
                : '0 0 10px rgba(63, 81, 181, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {nft.type === 'achievement' && <EmojiEventsIcon fontSize="large" />}
              {nft.type === 'course_completion' && <LocalFireDepartmentIcon fontSize="large" />}
              {nft.type === 'subscription' && <StarIcon fontSize="large" />}
              {nft.isMinted && <VerifiedIcon fontSize="large" />}
            </Box>
          </Box>
          
          <Chip 
            label={getNftTypeLabel(nft.type)}
            color={getNftTypeColor(nft.type)}
            size="small"
            sx={{ position: 'absolute', bottom: 10, left: 10, fontWeight: 'medium', boxShadow: theme.shadows[3] }}
          />
          
          {nft.isMinted && (
            <Chip 
              icon={<VerifiedIcon sx={{ '& path': { fill: '#fff' } }} />}
              label="Minted"
              color="success"
              size="small"
              sx={{ position: 'absolute', bottom: 10, right: 10, fontWeight: 'medium', boxShadow: theme.shadows[3] }}
            />
          )}
          
          {isTradeMode && (
            <Box sx={{ 
              position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: isSelected ? theme.palette.primary.main : 'rgba(255,255,255,0.7)',
              border: isSelected ? 'none' : `2px solid ${theme.palette.divider}`,
              color: isSelected ? 'white' : theme.palette.text.primary,
              transition: 'all 0.2s ease', zIndex: 5
            }}>
              {isSelected && <CheckIcon fontSize="small" />}
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ 
          flexGrow: 1, p: 2,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : theme.palette.background.paper
        }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold', mb: 1,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              lineHeight: 1.3, minHeight: '2.6em'
            }}
          >
            {nft.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              mb: 2, overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              lineHeight: 1.5, minHeight: '3em'
            }}
          >
            {nft.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {nft.acquisitionDate ? new Date(nft.acquisitionDate).toLocaleDateString() : 'Not acquired'}
            </Typography>
            
            <Typography 
              variant="caption" 
              sx={{ 
                color: nft.collection ? alpha(theme.palette.primary.main, 0.9) : 'text.secondary',
                fontWeight: nft.collection ? 'medium' : 'normal'
              }}
            >
              {nft.collection || 'General Collection'}
            </Typography>
          </Box>
          
          {!isTradeMode && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {nft.isPublic && nft.type === 'achievement' ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<EmojiEventsIcon />}
                    size="small"
                    onClick={(e) => handleClaimFreeNFT(nft, e)}
                    sx={{ 
                      borderRadius: 2, px: 2, boxShadow: theme.shadows[4],
                      background: `linear-gradient(90deg, #4caf50, #2e7d32)`,
                      '&:hover': { background: `linear-gradient(90deg, #2e7d32, #1b5e20)` }
                    }}
                  >
                    Claim Free
                  </Button>
                ) : nft.type === 'subscription' && !nft.acquisitionDate ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ShoppingCartIcon />}
                    size="small"
                    onClick={(e) => handleBuySubscription(nft, e)}
                    sx={{ 
                      borderRadius: 2, px: 2, boxShadow: theme.shadows[4],
                      background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                      '&:hover': { background: `linear-gradient(90deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})` }
                    }}
                  >
                    Buy for ${nft.price}
                  </Button>
                ) : nft.isMinted ? (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<VerifiedIcon />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNftClick(nft);
                    }}
                    sx={{ borderRadius: 2, px: 2 }}
                  >
                    View Details
                  </Button>
                ) : nft.acquisitionDate ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AccountBalanceWalletIcon />}
                    size="small"
                    onClick={(e) => handleMintClick(nft, e)}
                    disabled={!isAuthenticated() || !walletAddress}
                    sx={{ 
                      borderRadius: 2, px: 2, boxShadow: theme.shadows[4],
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      '&:hover': { background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` }
                    }}
                  >
                    Mint to Blockchain
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<InfoIcon />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNftClick(nft);
                    }}
                    sx={{ borderRadius: 2, px: 2 }}
                  >
                    View Details
                  </Button>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Paper>
    );
  };
  
  // Yükleniyor gösterimi
  if (pageLoading) {
    return (
      <Box sx={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0a192f 0%, #144272 50%, #205295 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e8eaf6 100%)',
      }}>
        <Box sx={{ position: 'relative', mb: 3 }}>
          <CircularProgress size={60} sx={{ color: theme.palette.mode === 'dark' ? '#64ffda' : theme.palette.primary.main }} />
          <Box sx={{
            position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
            borderRadius: '50%', border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(100, 255, 218, 0.3)' : alpha(theme.palette.primary.main, 0.3)}`,
            borderTopColor: theme.palette.mode === 'dark' ? '#64ffda' : theme.palette.primary.main, 
            animation: 'spin 1.5s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            }
          }} />
        </Box>
        <Typography variant="h6" color={theme.palette.text.primary}>Loading Your NFT Collection...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Tema uyumlu arka plan */}
      <Box
        sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0a192f 0%, #144272 50%, #205295 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #e8eaf6 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Yanıp sönen yıldız efekti - tema uyumlu */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 15% 20%, rgba(100, 255, 218, 0.10) 0%, transparent 20%), radial-gradient(circle at 85% 70%, rgba(100, 255, 218, 0.10) 0%, transparent 20%)'
              : 'radial-gradient(circle at 15% 20%, rgba(63, 81, 181, 0.08) 0%, transparent 20%), radial-gradient(circle at 85% 70%, rgba(63, 81, 181, 0.08) 0%, transparent 20%)',
            opacity: 0.7,
          }}
        />
        
        {/* Yıldız/parıltı efekti - tema uyumlu */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(100, 255, 218, 0.3) 1px, transparent 2px)'
              : 'radial-gradient(circle, rgba(63, 81, 181, 0.2) 1px, transparent 2px)',
            backgroundSize: '50px 50px',
            animation: 'twinkle 15s linear infinite',
            '@keyframes twinkle': {
              '0%': { opacity: 0.2 },
              '50%': { opacity: 0.4 },
              '100%': { opacity: 0.2 }
            }
          }}
        />
        
        {/* İkinci yıldız katmanı - farklı boyut ve faz - tema uyumlu */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(127, 180, 255, 0.2) 1px, transparent 2px)'
              : 'radial-gradient(circle, rgba(33, 150, 243, 0.15) 1px, transparent 2px)',
            backgroundSize: '70px 70px',
            backgroundPosition: '25px 25px',
            animation: 'twinkle2 12s linear infinite',
            '@keyframes twinkle2': {
              '0%': { opacity: 0.1 },
              '50%': { opacity: 0.3 },
              '100%': { opacity: 0.1 }
            }
          }}
        />
        
        {/* Büyük vurgu alanları - tema uyumlu */}
        <Box
          sx={{
            position: 'absolute',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(100, 255, 218, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(63, 81, 181, 0.05) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animation: 'float 25s ease-in-out infinite',
            '@keyframes float': {
              '0%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(3%, 3%)' },
              '100%': { transform: 'translate(0, 0)' },
            }
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            width: '25%',
            height: '25%',
            borderRadius: '50%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(127, 180, 255, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(33, 150, 243, 0.05) 0%, transparent 70%)',
            bottom: '20%',
            right: '10%',
            animation: 'float2 20s ease-in-out infinite',
            '@keyframes float2': {
              '0%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(-3%, -3%)' },
              '100%': { transform: 'translate(0, 0)' },
            }
          }}
        />
      </Box>
      
      {/* Page Header */}
      <Box 
        sx={{ 
          position: 'sticky', top: 0, left: 0, right: 0, zIndex: 10,
          backdropFilter: 'blur(10px)',
          bgcolor: alpha(theme.palette.background.default, scrolled ? 0.85 : 0.4),
          transition: 'background-color 0.3s ease',
          borderBottom: scrolled ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
          boxShadow: scrolled ? `0 2px 20px ${alpha(theme.palette.common.black, 0.08)}` : 'none',
        }}
      >
        <Container>
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Sol: Başlık */}
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #64ffda, #88ccff)'
                    : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  mb: 0.5
                }}
              >
                NFT Collection
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.875rem',
                  maxWidth: { xs: '100%', sm: 500, md: 600 },
                  display: { xs: scrolled ? 'none' : 'block', sm: 'block' },
                }}
              >
                Discover, collect, and trade unique digital assets that represent your achievements
              </Typography>
            </Box>
            
            {/* Sağ: Arama/Wallet */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="form"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  position: 'relative',
                  mr: 1
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor: alpha('#0a192f', 0.4),
                      border: `1px solid ${alpha('#64ffda', 0.2)}`,
                      color: '#ccd6f6',
                      '& .MuiInputBase-input': {
                        color: '#ccd6f6',
                      },
                      '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                        color: alpha('#64ffda', 0.7),
                      },
                      '&:hover': {
                        bgcolor: alpha('#0a192f', 0.6),
                        border: `1px solid ${alpha('#64ffda', 0.4)}`,
                      }
                    }
                  }}
                  sx={{ width: 220 }}
                />
              </Box>
              
              {/* Filtreleme */}
              <Button
                size="small"
                startIcon={<FilterListIcon />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{
                  ml: 1, borderRadius: 2,
                  bgcolor: selectedFilters.rarity.length > 0 || selectedFilters.type.length > 0 || selectedFilters.collection.length > 0 
                    ? alpha('#64ffda', 0.1) 
                    : alpha('#0a192f', 0.5),
                  border: `1px solid ${alpha('#64ffda', selectedFilters.rarity.length > 0 || selectedFilters.type.length > 0 || selectedFilters.collection.length > 0 ? 0.4 : 0.1)}`,
                  color: selectedFilters.rarity.length > 0 || selectedFilters.type.length > 0 || selectedFilters.collection.length > 0
                    ? '#64ffda'
                    : '#ccd6f6',
                  '&:hover': {
                    bgcolor: selectedFilters.rarity.length > 0 || selectedFilters.type.length > 0 || selectedFilters.collection.length > 0
                      ? alpha('#64ffda', 0.2)
                      : alpha('#0a192f', 0.7),
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                Filters
                {(selectedFilters.rarity.length > 0 || selectedFilters.type.length > 0 || selectedFilters.collection.length > 0) && (
                  <Box 
                    component="span" 
                    sx={{ 
                      ml: 0.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 20, height: 20, borderRadius: '50%',
                      bgcolor: '#64ffda', color: '#0a192f',
                      fontSize: '0.75rem', fontWeight: 'bold'
                    }}
                  >
                    {selectedFilters.rarity.length + selectedFilters.type.length + selectedFilters.collection.length}
                  </Box>
                )}
              </Button>
              
              {/* Sıralama */}
              <Button
                size="small"
                startIcon={<SortIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleSortMenuOpen}
                sx={{
                  ml: 1, borderRadius: 2, 
                  bgcolor: alpha('#0a192f', 0.5),
                  border: `1px solid ${alpha('#64ffda', 0.1)}`,
                  color: '#ccd6f6',
                  '&:hover': { 
                    bgcolor: alpha('#0a192f', 0.7),
                    border: `1px solid ${alpha('#64ffda', 0.3)}`,
                  },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                Sort
              </Button>
              
              {/* Cüzdan Butonu */}
              {isAuthenticated() ? (
                walletAddress ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AccountBalanceWalletIcon />}
                    sx={{
                      borderRadius: 2, 
                      borderColor: alpha('#64ffda', 0.5),
                      color: '#64ffda',
                      '&:hover': {
                        borderColor: '#64ffda',
                        bgcolor: alpha('#64ffda', 0.1),
                      }
                    }}
                  >
                    {walletAddress.substring(0, 4)}...{walletAddress.substring(walletAddress.length - 4)}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AccountBalanceWalletIcon />}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #64ffda, #88ccff)',
                      color: '#0a192f',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #88ccff, #64ffda)',
                      }
                    }}
                    onClick={handleConnectWallet}
                    disabled={walletConnecting}
                  >
                    {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                )
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<LoginIcon />}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #64ffda, #88ccff)',
                    color: '#0a192f',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #88ccff, #64ffda)',
                    }
                  }}
                  onClick={handleLoginRedirect}
                >
                  Log In
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Runner - Açıklama Alanı */}
      <Box
        sx={{
          py: 8,
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(to bottom, rgba(10, 25, 47, 0.9), rgba(20, 66, 114, 0.8))'
            : 'linear-gradient(to bottom, rgba(248, 249, 250, 0.9), rgba(232, 234, 246, 0.8))',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        {/* Arka plan efekti */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '50%',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at bottom right, rgba(100, 255, 218, 0.1), transparent 60%)'
              : 'radial-gradient(circle at bottom right, rgba(63, 81, 181, 0.06), transparent 60%)',
          }}
        />
        
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 2,
                  textShadow: theme.palette.mode === 'dark' 
                    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
                    : '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                Earn, Collect, and Trade Digital Assets
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 3,
                  maxWidth: 600,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                Wisentia's NFT collection represents your learning achievements and provides exclusive benefits. 
                Mint your NFTs to make them uniquely yours on the blockchain, or trade them for premium subscriptions.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<TokenIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                    boxShadow: theme.shadows[4],
                  }}
                  onClick={() => scrollToCategory('achievements')}
                >
                  Explore NFTs
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<SwapHorizIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 3,
                  }}
                  onClick={handleTradeDialogOpen}
                >
                  Trade for Subscription
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  height: 300,
                  perspective: '1000px',
                }}
              >
                {getAllNfts().slice(0, 3).map((nft, index) => {
                  const isItemHovered = hoveredNftId === nft.nftId;
                  return (
                    <Box
                      key={nft.nftId}
                      sx={{
                        position: 'absolute',
                        width: 180,
                        height: 220,
                        borderRadius: 3,
                        boxShadow: isItemHovered ? '0 15px 40px rgba(0, 0, 0, 0.6)' : '0 10px 30px rgba(0, 0, 0, 0.3)',
                        overflow: 'hidden',
                        transformStyle: 'preserve-3d',
                        transition: 'all 0.8s ease',
                        animation: 'none',
                        transform: isItemHovered 
                          ? `translateZ(${30 + index * 10}px) translateX(${5 - index * 5}px) translateY(${-10 + index * 5}px) rotate(${2 - index * 1}deg)` 
                          : 'translateZ(0) translateX(0) translateY(0) rotate(0deg)',
                        zIndex: isItemHovered ? 10 : 4 - index,
                        left: `${index * 25 + 20}%`,
                        top: `${index * 10 + 10}%`,
                        background: theme.palette.mode === 'dark' 
                          ? gammaDopplerGradients[index % gammaDopplerGradients.length]
                          : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                        border: theme.palette.mode === 'dark' 
                          ? `3px solid ${alpha('#64ffda', 0.3)}` 
                          : `3px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                      onMouseEnter={() => setHoveredNftId(nft.nftId)}
                      onMouseLeave={() => setHoveredNftId(null)}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: theme.palette.mode === 'dark'
                            ? 'radial-gradient(circle, rgba(100, 255, 218, 0.3) 5%, transparent 15%)'
                            : 'radial-gradient(circle, rgba(63, 81, 181, 0.15) 5%, transparent 15%)',
                          backgroundSize: '15px 15px',
                          opacity: 0.7,
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(4px)',
                      }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                          {nft.title}
                        </Typography>
                      </Box>
                      <Box sx={{
                        position: 'absolute',
                        top: 5,
                        right: 5,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        backgroundColor: getRarityColor(nft.rarity),
                        color: '#fff',
                      }}>
                        {nft.rarity}
                      </Box>
                      
                      {/* Sembolik İkon */}
                      <Box sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: theme.palette.mode === 'dark' ? '#e6f1ff' : theme.palette.text.primary,
                        opacity: 0.6
                      }}>
                        {nft.type === 'achievement' && <EmojiEventsIcon fontSize="large" />}
                        {nft.type === 'course_completion' && <LocalFireDepartmentIcon fontSize="large" />}
                        {nft.type === 'subscription' && <StarIcon fontSize="large" />}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      <Container sx={{ mb: 8 }}>
        {/* Login bilgilendirme (giriş yapmamış kullanıcılar için) */}
        {!isAuthenticated() && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              borderRadius: 2, 
              boxShadow: theme.shadows[2],
              backgroundColor: alpha('#0a192f', 0.8),
              color: '#ccd6f6',
              border: `1px solid ${alpha('#64ffda', 0.3)}`,
              '& .MuiAlert-icon': {
                color: '#64ffda'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Log in to view your personal NFT collection, mint tokens, or trade for subscriptions.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<LoginIcon />}
                onClick={handleLoginRedirect}
                sx={{ 
                  borderRadius: 2, 
                  px: 2, 
                  py: 1, 
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(90deg, #64ffda, #88ccff)',
                  color: '#0a192f',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #88ccff, #64ffda)',
                  }
                }}
              >
                Log In
              </Button>
            </Box>
          </Alert>
        )}
        
        {/* Cüzdan bağlantı uyarısı */}
        {isAuthenticated() && !walletAddress && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4, 
              borderRadius: 2, 
              boxShadow: theme.shadows[3],
              backgroundColor: alpha('#0a192f', 0.8),
              color: '#ccd6f6',
              border: `1px solid ${alpha('#ffc107', 0.3)}`,
              '& .MuiAlert-icon': {
                color: '#ffc107'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                You haven't connected a wallet yet. Connect a wallet to mint NFTs to the blockchain.
              </Typography>
              <Button 
                variant="outlined" 
                color="warning" 
                size="small"
                onClick={handleConnectWallet}
                startIcon={<AccountBalanceWalletIcon />}
                sx={{ 
                  borderRadius: 2, 
                  whiteSpace: 'nowrap', 
                  px: 2, 
                  py: 1,
                  borderColor: '#ffc107',
                  color: '#ffc107',
                  '&:hover': {
                    borderColor: '#ffc107',
                    backgroundColor: alpha('#ffc107', 0.1),
                  }
                }}
              >
                Connect Wallet
              </Button>
            </Box>
          </Alert>
        )}
        
        {/* Hata mesajı */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2, 
              boxShadow: theme.shadows[3],
              backgroundColor: alpha('#0a192f', 0.8),
              color: '#ccd6f6',
              border: `1px solid ${alpha('#f44336', 0.3)}`,
              '& .MuiAlert-icon': {
                color: '#f44336'
              }
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Arayüz Kontrolleri */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1, 
                color: '#e6f1ff'
              }}
            >
              Your NFT Collection
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccd6f6', opacity: 0.8 }}>
              {searchQuery 
                ? `Search results for "${searchQuery}"`
                : isAuthenticated() 
                  ? `You have ${nfts.length} NFTs in your collection`
                  : 'Explore available NFTs'
              }
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="outlined"
              startIcon={<SwapHorizIcon />}
              size="small"
              onClick={handleTradeDialogOpen}
              sx={{ 
                borderRadius: 2, 
                px: 2, 
                borderColor: '#64ffda',
                color: '#64ffda',
                '&:hover': {
                  borderColor: '#64ffda',
                  backgroundColor: alpha('#64ffda', 0.1),
                }
              }}
            >
              Trade for Subscription
            </Button>
          </Box>
        </Box>
        
        {/* Kategoriler */}
        <Box sx={{ mb: 6 }}>
          {NFT_CATEGORIES.map((category) => {
            const filteredNfts = getNftsByCategory(category.id, getAllNfts());
            
            // Arama ve filtre uygula
            const searchFilteredNfts = getSearchFilteredNFTs(filteredNfts);
            const customFilteredNfts = getCustomFilteredNFTs(searchFilteredNfts);
            const sortedAndFilteredNfts = getSortedNFTs(customFilteredNfts);
            
            // Kategori boşsa gösterme
            if (sortedAndFilteredNfts.length === 0) return null;
            
            // Scroll durumu alma
            const canScrollLeft = scrollStates[category.id]?.canScrollLeft;
            const canScrollRight = scrollStates[category.id]?.canScrollRight;
            
            return (
              <Box 
                key={category.id}
                ref={(el) => categoryRefs.current[category.id] = el}
                sx={{ mb: 6, scrollMarginTop: '80px' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1.5, bgcolor: alpha('#64ffda', 0.1), color: '#64ffda' }}>
                      {category.icon}
                    </Avatar>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#e6f1ff' }}>
                      {category.title}
                    </Typography>
                  </Box>
                  
                  <Button
                    size="small"
                    endIcon={expandedCategories[category.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    onClick={() => toggleCategory(category.id)}
                    sx={{ 
                      borderRadius: 2, 
                      px: 2, 
                      borderColor: alpha('#64ffda', 0.3),
                      color: '#64ffda',
                      '&:hover': {
                        borderColor: '#64ffda',
                        backgroundColor: alpha('#64ffda', 0.1),
                      }
                    }}
                  >
                    {expandedCategories[category.id] ? 'Show Less' : 'View All'}
                  </Button>
                </Box>
                
                {/* Yatay Kaydırmalı NFT Listesi */}
                <Box sx={{ position: 'relative' }}>
                  {/* Scroll okları */}
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
                      bgcolor: alpha('#0a192f', 0.8), boxShadow: '0 2px 10px rgba(0,0,0,0.3)', zIndex: 2,
                      color: '#64ffda',
                      border: `1px solid ${alpha('#64ffda', 0.2)}`,
                      opacity: canScrollLeft ? 1 : 0, transition: 'all 0.3s ease',
                      pointerEvents: canScrollLeft ? 'auto' : 'none',
                      '&:hover': { 
                        bgcolor: alpha('#0a192f', 0.9),
                        border: `1px solid ${alpha('#64ffda', 0.5)}`,
                      }
                    }}
                    onClick={() => handleCategoryScroll(category.id, 'left')}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
                      bgcolor: alpha('#0a192f', 0.8), boxShadow: '0 2px 10px rgba(0,0,0,0.3)', zIndex: 2,
                      color: '#64ffda',
                      border: `1px solid ${alpha('#64ffda', 0.2)}`,
                      opacity: canScrollRight ? 1 : 0, transition: 'all 0.3s ease',
                      pointerEvents: canScrollRight ? 'auto' : 'none',
                      '&:hover': { 
                        bgcolor: alpha('#0a192f', 0.9),
                        border: `1px solid ${alpha('#64ffda', 0.5)}`,
                      }
                    }}
                    onClick={() => handleCategoryScroll(category.id, 'right')}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                  
                  <Box
                    ref={el => scrollContainerRefs.current[category.id] = el}
                    sx={{
                      display: 'flex', 
                      overflowX: 'auto', 
                      gap: 2, 
                      pb: 2, 
                      px: 1,
                      msOverflowStyle: 'none',  /* IE and Edge */
                      scrollbarWidth: 'none',  /* Firefox */
                      '&::-webkit-scrollbar': {
                        display: 'none'  /* Chrome, Safari, Opera */
                      }
                    }}
                  >
                    {sortedAndFilteredNfts.slice(0, 4).map(nft => (
                      <Box key={nft.userNftId || nft.nftId} sx={{ minWidth: 280, maxWidth: 280 }}>
                        <NFTCard nft={nft} />
                      </Box>
                    ))}
                    
                    {/* Daha Fazla Göster Butonu */}
                    {sortedAndFilteredNfts.length > 4 && !expandedCategories[category.id] && (
                      <Box 
                        sx={{ 
                          minWidth: 280, 
                          maxWidth: 280, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: `1px dashed ${alpha('#64ffda', 0.3)}`, 
                          borderRadius: 3, 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: alpha('#0a192f', 0.3),
                          '&:hover': { 
                            backgroundColor: alpha('#0a192f', 0.5),
                            border: `1px dashed ${alpha('#64ffda', 0.5)}`,
                          }
                        }}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <IconButton 
                            sx={{ 
                              mb: 1, 
                              bgcolor: alpha('#64ffda', 0.1),
                              color: '#64ffda',
                              '&:hover': { bgcolor: alpha('#64ffda', 0.2) }
                            }}
                          >
                            <KeyboardArrowDownIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ color: '#ccd6f6' }}>
                            Show {sortedAndFilteredNfts.length - 4} More
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {/* Genişletilmiş Grid Görünümü */}
                <Collapse in={expandedCategories[category.id]}>
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    {sortedAndFilteredNfts.slice(4).map(nft => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={nft.userNftId || nft.nftId}>
                        <NFTCard nft={nft} />
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
              </Box>
            );
          })}
          
          {/* Arama sonuçları boşsa */}
          {searchQuery && getSearchFilteredNFTs(getAllNfts()).length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              borderRadius: 4, 
              background: alpha('#0a192f', 0.5),
              border: `1px dashed ${alpha('#64ffda', 0.2)}`,
            }}>
              <SearchIcon sx={{ fontSize: 60, color: alpha('#64ffda', 0.5), mb: 2 }} />
              <Typography variant="h6" paragraph sx={{ color: '#ccd6f6' }}>
                No NFTs found matching "{searchQuery}"
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setSearchQuery('')}
                sx={{ 
                  borderRadius: 2, 
                  px: 3, 
                  py: 1,
                  borderColor: '#64ffda',
                  color: '#64ffda',
                  '&:hover': {
                    borderColor: '#64ffda',
                    backgroundColor: alpha('#64ffda', 0.1),
                  }
                }}
              >
                Clear Search
              </Button>
            </Box>
          )}
        </Box>
      </Container>
      
      {/* Dialog bileşenleri */}
      {/* NFT Mint Dialog */}
      <Dialog 
        open={mintDialogOpen} 
        onClose={handleMintClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0a192f',
            backgroundImage: 'linear-gradient(rgba(100, 255, 218, 0.05), rgba(10, 25, 47, 0.9))',
            color: '#e6f1ff',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: `1px solid ${alpha('#64ffda', 0.2)}`
          }
        }}
      >
        <DialogTitle sx={{ color: '#e6f1ff' }}>
          Mint NFT to Blockchain
          <IconButton 
            onClick={handleMintClose} 
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: '#ccd6f6',
              '&:hover': { color: '#64ffda' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha('#64ffda', 0.1) }}>
          {selectedNft && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={5}>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    borderRadius: 2,
                    background: gammaDopplerGradients[2],
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                    border: `2px solid ${alpha('#64ffda', 0.3)}`,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: 'radial-gradient(circle, rgba(100, 255, 218, 0.3) 5%, transparent 15%)',
                      backgroundSize: '15px 15px',
                      opacity: 0.7,
                    }}
                  />
                  
                  {/* Sembolik İkon */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#e6f1ff',
                    opacity: 0.8
                  }}>
                    {selectedNft.type === 'achievement' && <EmojiEventsIcon sx={{ fontSize: 50 }} />}
                    {selectedNft.type === 'course_completion' && <LocalFireDepartmentIcon sx={{ fontSize: 50 }} />}
                    {selectedNft.type === 'subscription' && <StarIcon sx={{ fontSize: 50 }} />}
                  </Box>
                  
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1,
                    background: 'linear-gradient(to top, rgba(10, 25, 47, 0.9), transparent)',
                  }}>
                    <Typography variant="body2" sx={{ color: '#e6f1ff', fontWeight: 'bold' }}>
                      {selectedNft.title}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={7}>
                <Typography variant="h6" sx={{ color: '#e6f1ff' }}>{selectedNft.title}</Typography>
                <Typography variant="body2" sx={{ color: '#ccd6f6', mt: 1 }}>
                  {selectedNft.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={getNftTypeLabel(selectedNft.type)}
                    color={getNftTypeColor(selectedNft.type)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip 
                    label={selectedNft.rarity}
                    sx={{ bgcolor: getRarityColor(selectedNft.rarity), color: 'white' }}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ color: '#ccd6f6' }} gutterBottom>
                    Minting this NFT will permanently record it on the EduChain blockchain, making it a verifiable digital asset that you own.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {mintSuccess && (
            <Alert severity="success" sx={{ 
              mt: 3,
              backgroundColor: alpha('#172d32', 0.7),
              color: '#e6f1ff',
              border: `1px solid ${alpha('#64ffda', 0.5)}`,
              '& .MuiAlert-icon': {
                color: '#64ffda'
              }
            }}>
              NFT successfully minted to blockchain!
            </Alert>
          )}
          
          {mintError && (
            <Alert severity="error" sx={{ 
              mt: 3,
              backgroundColor: alpha('#2d1a24', 0.7),
              color: '#e6f1ff',
              border: `1px solid ${alpha('#f44336', 0.5)}`,
              '& .MuiAlert-icon': {
                color: '#f44336'
              }
            }}>
              {mintError}
            </Alert>
          )}
          
          {!walletAddress && (
            <Alert severity="warning" sx={{ 
              mt: 3,
              backgroundColor: alpha('#2a2310', 0.7),
              color: '#e6f1ff',
              border: `1px solid ${alpha('#ffc107', 0.5)}`,
              '& .MuiAlert-icon': {
                color: '#ffc107'
              }
            }}>
              You need to connect your wallet first to mint this NFT.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleMintClose} 
            disabled={mintLoading}
            sx={{ color: '#ccd6f6' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMint}
            disabled={mintLoading || !walletAddress || mintSuccess}
            startIcon={mintLoading ? <CircularProgress size={20} /> : <TokenIcon />}
            sx={{
              borderRadius: 2, px: 3,
              background: 'linear-gradient(90deg, #64ffda, #88ccff)',
              color: '#0a192f',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(90deg, #88ccff, #64ffda)',
              },
              '&.Mui-disabled': {
                background: alpha('#64ffda', 0.2),
                color: alpha('#ccd6f6', 0.5)
              }
            }}
          >
            {mintLoading ? 'Minting...' : 'Mint to Blockchain'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* NFT Trade Dialog */}
      <Dialog 
        open={tradeDialogOpen} 
        onClose={handleTradeDialogClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0a192f',
            backgroundImage: 'linear-gradient(rgba(100, 255, 218, 0.05), rgba(10, 25, 47, 0.9))',
            color: '#e6f1ff',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: `1px solid ${alpha('#64ffda', 0.2)}`
          }
        }}
      >
        <DialogTitle sx={{ color: '#e6f1ff' }}>
          Trade NFTs for Subscription
          <IconButton 
            onClick={handleTradeDialogClose} 
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: '#ccd6f6',
              '&:hover': { color: '#64ffda' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha('#64ffda', 0.1) }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e6f1ff' }}>
              How Trading Works
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccd6f6' }}>
              Trade your eligible NFTs for premium subscription access. Select the NFTs you want to offer, 
              then choose a subscription NFT you want to receive. The total value of your offered NFTs must meet 
              or exceed the value of the subscription NFT.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ color: '#e6f1ff' }}>
                Choose NFTs to Offer
              </Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  height: 320, 
                  overflow: 'auto',
                  bgcolor: alpha('#0a192f', 0.7),
                  borderColor: alpha('#64ffda', 0.2),
                  msOverflowStyle: 'none',  /* IE and Edge */
                  scrollbarWidth: 'none',  /* Firefox */
                  '&::-webkit-scrollbar': {
                    display: 'none'  /* Chrome, Safari, Opera */
                  }
                }}
              >
                {isAuthenticated() && nfts.filter(nft => !nft.isMinted).length > 0 ? (
                  <Grid container spacing={2}>
                    {nfts.filter(nft => !nft.isMinted).map(nft => (
                      <Grid item xs={12} sm={6} key={nft.userNftId}>
                        <NFTCard nft={nft} isTradeMode={true} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Typography variant="body1" sx={{ color: '#ccd6f6', opacity: 0.8 }} align="center">
                      You don't have any eligible NFTs to trade
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ 
                        mt: 2,
                        borderColor: '#64ffda',
                        color: '#64ffda',
                        '&:hover': {
                          borderColor: '#64ffda',
                          backgroundColor: alpha('#64ffda', 0.1),
                        }
                      }} 
                      onClick={() => router.push('/quests')}
                    >
                      Complete Quests to Earn NFTs
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ color: '#e6f1ff' }}>
                Select a Subscription
              </Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  height: 320, 
                  overflow: 'auto',
                  bgcolor: alpha('#0a192f', 0.7),
                  borderColor: alpha('#64ffda', 0.2),
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  }
                }}
              >
                {publicNfts.filter(nft => nft.type === 'subscription').length > 0 ? (
                  <Grid container spacing={2}>
                    {publicNfts.filter(nft => nft.type === 'subscription').map(nft => (
                      <Grid item xs={12} key={nft.nftId}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            border: targetSubscriptionNft?.nftId === nft.nftId 
                              ? `2px solid ${alpha('#64ffda', 0.8)}`
                              : `1px solid ${alpha('#64ffda', 0.2)}`,
                            borderRadius: 2, 
                            cursor: 'pointer', 
                            transition: 'all 0.2s',
                            bgcolor: targetSubscriptionNft?.nftId === nft.nftId 
                              ? alpha('#64ffda', 0.1)
                              : 'transparent',
                            '&:hover': {
                              borderColor: alpha('#64ffda', 0.8),
                              bgcolor: alpha('#64ffda', 0.05)
                            },
                          }}
                          onClick={() => selectSubscriptionNft(nft)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                borderRadius: 2, 
                                mr: 2,
                                background: gammaDopplerGradients[3],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${alpha('#64ffda', 0.3)}`,
                              }}
                            >
                              <StarIcon sx={{ fontSize: 30, color: '#e6f1ff', opacity: 0.8 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#e6f1ff' }}>{nft.title}</Typography>
                              <Typography variant="body2" sx={{ color: '#ccd6f6' }}>{nft.description}</Typography>
                              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Chip 
                                  label={`Value: ${nft.price}` || "Trade Value"}
                                  size="small"
                                  color="secondary"
                                  sx={{ mr: 1 }}
                                />
                                <Chip 
                                  label={nft.rarity}
                                  size="small"
                                  sx={{ bgcolor: getRarityColor(nft.rarity), color: 'white' }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#ccd6f6', opacity: 0.8 }} align="center">
                      No subscription NFTs available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 2, 
            border: `1px solid ${alpha('#64ffda', 0.2)}`,
            bgcolor: alpha('#0a192f', 0.5),
          }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ color: '#e6f1ff' }}>
              Trade Summary
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#ccd6f6', opacity: 0.8 }} gutterBottom>
                  You are offering:
                </Typography>
                {selectedForTrade.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#ccd6f6' }}>No NFTs selected</Typography>
                ) : (
                  <Box>
                    {selectedForTrade.map(nftId => {
                      const nft = nfts.find(n => (n.userNftId || n.nftId) === nftId);
                      return nft ? (
                        <Box key={nftId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: '#e6f1ff' }}>{nft.title}</Typography>
                        </Box>
                      ) : null;
                    })}
                    
                    <Divider sx={{ my: 1, borderColor: alpha('#64ffda', 0.2) }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ color: '#e6f1ff' }}>Total Items:</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ color: '#64ffda' }}>{selectedForTrade.length}</Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: '#ccd6f6', opacity: 0.8 }} gutterBottom>
                  You will receive:
                </Typography>
                {!targetSubscriptionNft ? (
                  <Typography variant="body2" sx={{ color: '#ccd6f6' }}>No subscription selected</Typography>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#e6f1ff' }}>{targetSubscriptionNft.title}</Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1, borderColor: alpha('#64ffda', 0.2) }} />
                    <Box sx={{ 
                      display: 'flex', justifyContent: 'space-between',
                      color: selectedForTrade.length >= 2 ? '#64ffda' : '#f44336',
                      fontWeight: 'medium'
                    }}>
                      <Typography variant="body2" fontWeight="medium">Status:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedForTrade.length >= 2 ? 'Valid Trade ✓' : 'Insufficient NFTs ✗'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
          
          {tradeSuccess && (
            <Alert 
              severity="success" 
              sx={{ 
                mt: 3,
                backgroundColor: alpha('#172d32', 0.7),
                color: '#e6f1ff',
                border: `1px solid ${alpha('#64ffda', 0.5)}`,
                '& .MuiAlert-icon': {
                  color: '#64ffda'
                }
              }}
            >
              Trade completed successfully! You now have access to premium subscription features.
            </Alert>
          )}
          
          {tradeError && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3,
                backgroundColor: alpha('#2d1a24', 0.7),
                color: '#e6f1ff',
                border: `1px solid ${alpha('#f44336', 0.5)}`,
                '& .MuiAlert-icon': {
                  color: '#f44336'
                }
              }}
            >{tradeError}</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleTradeDialogClose} 
            disabled={tradeProcessing}
            sx={{ color: '#ccd6f6' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTradeConfirm}
            disabled={tradeProcessing || !targetSubscriptionNft || selectedForTrade.length < 2 || tradeSuccess}
            startIcon={tradeProcessing ? <CircularProgress size={20} /> : <SwapHorizIcon />}
            sx={{
              borderRadius: 2, px: 3,
              background: 'linear-gradient(90deg, #64ffda, #88ccff)',
              color: '#0a192f',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(90deg, #88ccff, #64ffda)',
              },
              '&.Mui-disabled': {
                background: alpha('#64ffda', 0.2),
                color: alpha('#ccd6f6', 0.5)
              }
            }}
          >
            {tradeProcessing ? 'Processing...' : 'Confirm Trade'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Login Dialog */}
      <Dialog 
        open={loginDialogOpen} 
        onClose={handleLoginClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0a192f',
            backgroundImage: 'linear-gradient(rgba(100, 255, 218, 0.05), rgba(10, 25, 47, 0.9))',
            color: '#e6f1ff',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: `1px solid ${alpha('#64ffda', 0.2)}`
          }
        }}
      >
        <DialogTitle sx={{ color: '#e6f1ff', textAlign: 'center' }}>
          Login Required
          <IconButton 
            onClick={handleLoginClose} 
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: '#ccd6f6',
              '&:hover': { color: '#64ffda' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <LoginIcon sx={{ fontSize: 60, color: '#64ffda', mb: 2 }} />
          </Box>
          <Typography variant="body1" sx={{ color: '#ccd6f6', mb: 2 }}>
            You need to be logged in to access this feature. Would you like to log in now?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button 
            onClick={handleLoginClose}
            sx={{ 
              color: '#ccd6f6',
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleLoginRedirect}
            sx={{
              borderRadius: 2, px: 3,
              background: 'linear-gradient(90deg, #64ffda, #88ccff)',
              color: '#0a192f',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(90deg, #88ccff, #64ffda)',
              }
            }}
          >
            Log In
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* NFT Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleDetailClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0a192f',
            backgroundImage: 'linear-gradient(rgba(100, 255, 218, 0.05), rgba(10, 25, 47, 0.9))',
            color: '#e6f1ff',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: `1px solid ${alpha('#64ffda', 0.2)}`
          }
        }}
      >
        {selectedDetailNft && (
          <>
            <DialogTitle sx={{ color: '#e6f1ff' }}>
              NFT Details
              <IconButton 
                onClick={handleDetailClose} 
                sx={{ 
                  position: 'absolute', 
                  right: 8, 
                  top: 8,
                  color: '#ccd6f6',
                  '&:hover': { color: '#64ffda' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: alpha('#64ffda', 0.1) }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={5}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      borderRadius: 3,
                      background: gammaDopplerGradients[1],
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                      border: `2px solid ${alpha('#64ffda', 0.3)}`,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(circle, rgba(100, 255, 218, 0.3) 5%, transparent 15%)',
                        backgroundSize: '15px 15px',
                        opacity: 0.7,
                      }}
                    />
                    
                    {/* Sembolik İkon */}
                    <Box sx={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#e6f1ff',
                      opacity: 0.8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      {selectedDetailNft.type === 'achievement' && <EmojiEventsIcon sx={{ fontSize: 80 }} />}
                      {selectedDetailNft.type === 'course_completion' && <LocalFireDepartmentIcon sx={{ fontSize: 80 }} />}
                      {selectedDetailNft.type === 'subscription' && <StarIcon sx={{ fontSize: 80 }} />}
                      
                      {selectedDetailNft.isMinted && <VerifiedIcon color="success" sx={{ fontSize: 30 }} />}
                    </Box>
                    
                    <Box sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 5,
                      backgroundColor: getRarityColor(selectedDetailNft.rarity),
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      zIndex: 2
                    }}>
                      {selectedDetailNft.rarity}
                    </Box>
                  </Box>
                  
                  <Paper sx={{ 
                    mt: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha('#0a192f', 0.7),
                    border: `1px solid ${alpha('#64ffda', 0.2)}`
                  }}>
                    <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 1 }}>
                      Collection
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64ffda', fontWeight: 'medium' }}>
                      {selectedDetailNft.collection || 'General Collection'}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5, borderColor: alpha('#64ffda', 0.1) }} />
                    
                    <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 1 }}>
                      Acquisition Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e6f1ff' }}>
                      {selectedDetailNft.acquisitionDate ? new Date(selectedDetailNft.acquisitionDate).toLocaleDateString() : 'Not acquired'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={7}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={getNftTypeLabel(selectedDetailNft.type)}
                        color={getNftTypeColor(selectedDetailNft.type)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {selectedDetailNft.isMinted && (
                        <Chip 
                          icon={<VerifiedIcon />}
                          label="Blockchain Verified"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="h4" sx={{ color: '#e6f1ff', mb: 2, fontWeight: 'bold' }}>
                      {selectedDetailNft.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: '#ccd6f6', mb: 3 }}>
                      {selectedDetailNft.description}
                    </Typography>
                    
                    {selectedDetailNft.isMinted && (
                      <Paper sx={{ 
                        p: 2, 
                        mb: 3, 
                        borderRadius: 2, 
                        bgcolor: alpha('#0a192f', 0.7),
                        border: `1px solid ${alpha('#64ffda', 0.2)}`
                      }}>
                        <Typography variant="h6" sx={{ color: '#e6f1ff', mb: 2 }}>
                          Blockchain Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 0.5 }}>
                              Transaction Hash
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: alpha('#0a192f', 0.5),
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem',
                                  color: '#88ccff',
                                  mr: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  flexGrow: 1
                                }}
                              >
                                {selectedDetailNft.transactionHash}
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={() => copyToClipboard(selectedDetailNft.transactionHash)}
                                sx={{ color: '#ccd6f6', '&:hover': { color: '#64ffda' } }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 0.5 }}>
                              Network
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#e6f1ff' }}>
                              EduChain
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 0.5 }}>
                              Minted On
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#e6f1ff' }}>
                              {new Date().toLocaleDateString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    )}
                    
                    <Paper sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha('#0a192f', 0.7),
                      border: `1px solid ${alpha('#64ffda', 0.2)}`
                    }}>
                      <Typography variant="h6" sx={{ color: '#e6f1ff', mb: 2 }}>
                        Properties
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                          <Box sx={{ 
                            p: 1.5, 
                            textAlign: 'center', 
                            borderRadius: 2,
                            bgcolor: alpha('#64ffda', 0.05),
                            border: `1px solid ${alpha('#64ffda', 0.1)}`
                          }}>
                            <Typography variant="caption" sx={{ color: '#ccd6f6', display: 'block', mb: 0.5 }}>
                              Type
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#e6f1ff', fontWeight: 'medium' }}>
                              {getNftTypeLabel(selectedDetailNft.type)}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                          <Box sx={{ 
                            p: 1.5, 
                            textAlign: 'center', 
                            borderRadius: 2,
                            bgcolor: alpha('#64ffda', 0.05),
                            border: `1px solid ${alpha('#64ffda', 0.1)}`
                          }}>
                            <Typography variant="caption" sx={{ color: '#ccd6f6', display: 'block', mb: 0.5 }}>
                              Rarity
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 'medium',
                              color: getRarityColor(selectedDetailNft.rarity)
                            }}>
                              {selectedDetailNft.rarity}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} sm={4}>
                          <Box sx={{ 
                            p: 1.5, 
                            textAlign: 'center', 
                            borderRadius: 2,
                            bgcolor: alpha('#64ffda', 0.05),
                            border: `1px solid ${alpha('#64ffda', 0.1)}`
                          }}>
                            <Typography variant="caption" sx={{ color: '#ccd6f6', display: 'block', mb: 0.5 }}>
                              Status
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: selectedDetailNft.isMinted ? '#64ffda' : '#ccd6f6',
                              fontWeight: 'medium' 
                            }}>
                              {selectedDetailNft.isMinted ? 'Minted' : 'Not Minted'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
              <Button 
                onClick={handleDetailClose} 
                sx={{ color: '#ccd6f6' }}
              >
                Close
              </Button>
              
              {!selectedDetailNft.isMinted && selectedDetailNft.acquisitionDate && (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleDetailClose();
                    handleMintClick(selectedDetailNft);
                  }}
                  startIcon={<AccountBalanceWalletIcon />}
                  disabled={!walletAddress}
                  sx={{
                    borderRadius: 2, px: 3,
                    background: 'linear-gradient(90deg, #64ffda, #88ccff)',
                    color: '#0a192f',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #88ccff, #64ffda)',
                    },
                    '&.Mui-disabled': {
                      background: alpha('#64ffda', 0.2),
                      color: alpha('#ccd6f6', 0.5)
                    }
                  }}
                >
                  Mint to Blockchain
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={handleSortMenuClose}
        PaperProps={{
          sx: {
            bgcolor: '#0a192f',
            backgroundImage: 'linear-gradient(rgba(100, 255, 218, 0.05), rgba(10, 25, 47, 0.9))',
            color: '#e6f1ff',
            borderRadius: 2,
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
            border: `1px solid ${alpha('#64ffda', 0.2)}`
          }
        }}
      >
        <MenuItem 
          onClick={() => handleSortChange('newest')}
          sx={{ 
            color: sortOption === 'newest' ? '#64ffda' : '#ccd6f6',
            '&:hover': { bgcolor: alpha('#64ffda', 0.1) }
          }}
        >
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            mr: 1, 
            bgcolor: sortOption === 'newest' ? '#64ffda' : 'transparent',
            border: `1px solid ${sortOption === 'newest' ? '#64ffda' : alpha('#ccd6f6', 0.5)}` 
          }} />
          Newest First
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('oldest')}
          sx={{ 
            color: sortOption === 'oldest' ? '#64ffda' : '#ccd6f6',
            '&:hover': { bgcolor: alpha('#64ffda', 0.1) }
          }}
        >
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            mr: 1, 
            bgcolor: sortOption === 'oldest' ? '#64ffda' : 'transparent',
            border: `1px solid ${sortOption === 'oldest' ? '#64ffda' : alpha('#ccd6f6', 0.5)}` 
          }} />
          Oldest First
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('rarity')}
          sx={{ 
            color: sortOption === 'rarity' ? '#64ffda' : '#ccd6f6',
            '&:hover': { bgcolor: alpha('#64ffda', 0.1) }
          }}
        >
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            mr: 1, 
            bgcolor: sortOption === 'rarity' ? '#64ffda' : 'transparent',
            border: `1px solid ${sortOption === 'rarity' ? '#64ffda' : alpha('#ccd6f6', 0.5)}` 
          }} />
          Rarity (High to Low)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortChange('alphabetical')}
          sx={{ 
            color: sortOption === 'alphabetical' ? '#64ffda' : '#ccd6f6',
            '&:hover': { bgcolor: alpha('#64ffda', 0.1) }
          }}
        >
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            mr: 1, 
            bgcolor: sortOption === 'alphabetical' ? '#64ffda' : 'transparent',
            border: `1px solid ${sortOption === 'alphabetical' ? '#64ffda' : alpha('#ccd6f6', 0.5)}` 
          }} />
          Alphabetical (A-Z)
        </MenuItem>
      </Menu>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            bgcolor: snackbarSeverity === 'success' ? '#172d32' : 
                      snackbarSeverity === 'error' ? '#2d1a24' :
                      snackbarSeverity === 'warning' ? '#2a2310' : '#0d2e3b',
            border: `1px solid ${snackbarSeverity === 'success' ? '#64ffda' : 
                      snackbarSeverity === 'error' ? '#f44336' :
                      snackbarSeverity === 'warning' ? '#ffc107' : '#2196f3'}`,
            color: '#e6f1ff',
            '& .MuiAlert-icon': {
              color: snackbarSeverity === 'success' ? '#64ffda' : 
                     snackbarSeverity === 'error' ? '#f44336' :
                     snackbarSeverity === 'warning' ? '#ffc107' : '#2196f3'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}