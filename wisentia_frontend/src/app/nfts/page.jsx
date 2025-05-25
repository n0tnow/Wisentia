'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container, Typography, Box, Chip, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Paper, Divider, IconButton, useTheme, alpha, useMediaQuery,
  Collapse, InputAdornment, Menu, MenuItem, Snackbar, Avatar, CardMedia, CardContent,
  Grid, Skeleton, Checkbox, Tooltip
} from '@mui/material';
import {
  Token as TokenIcon, ShoppingCart as ShoppingCartIcon, AccountBalanceWallet as AccountBalanceWalletIcon,
  Close as CloseIcon, Info as InfoIcon, Verified as VerifiedIcon, ContentCopy as ContentCopyIcon,
  Star as StarIcon, LocalFireDepartment as LocalFireDepartmentIcon, EmojiEvents as EmojiEventsIcon,
  Login as LoginIcon, FilterList as FilterListIcon, Sort as SortIcon, 
  ArrowForward as ArrowForwardIcon, ArrowBack as ArrowBackIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon, SwapHoriz as SwapHorizIcon, Check as CheckIcon,
  AutoAwesome as AutoAwesomeIcon, CheckCircle as CheckCircleIcon,
  Diamond as DiamondIcon, School as SchoolIcon, Whatshot as WhatshotIcon, Collections as CollectionsIcon,
  NavigateBefore as NavigateBeforeIcon, NavigateNext as NavigateNextIcon,
  FilterAltOff as FilterAltOffIcon, AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import detectEthereumProvider from '@metamask/detect-provider';
import dynamic from 'next/dynamic';

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
const NFT_CATEGORIES = [
  {
    id: 'all',
    label: 'All NFTs',
    icon: <DiamondIcon />,
    color: 'primary',
    condition: nft => true
  },
  {
    id: 'subscription',
    label: 'Subscriptions',
    icon: <StarIcon />,
    type: 'subscription',
    color: 'secondary'
  },
  {
    id: 'achievement',
    label: 'Achievements',
    icon: <EmojiEventsIcon />,
    type: 'achievement',
    color: 'success'
  },
  {
    id: 'course_completion',
    label: 'Course Completions',
    icon: <SchoolIcon />,
    type: 'course_completion',
    color: 'warning'
  },
  {
    id: 'quest_reward',
    label: 'Quest Rewards',
    icon: <AutoAwesomeIcon />,
    type: 'quest_reward',
    color: 'info'
  },
  {
    id: 'legendary',
    label: 'Legendary',
    icon: <WhatshotIcon />,
    color: 'warning',
    condition: nft => nft.rarity?.toLowerCase() === 'legendary'
  },
  {
    id: 'owned',
    label: 'My Collection',
    icon: <CollectionsIcon />,
    color: 'success',
    condition: nft => !nft.isPublic
  }
];

// Create a new NFTCardGrid component that uses virtualized rendering
const NFTCardGrid = ({ nfts, isTradeMode, searchQuery, selectedCategoryFilter, selectedRarityFilter, selectedTypeFilter }) => {
  const gridRef = useRef(null);
  const [displayCount, setDisplayCount] = useState(20); // Start with more items for initial view
  const [isLoading, setIsLoading] = useState(false);
  
  // Memoize filtered NFTs to prevent unnecessary recalculations
  const filteredNfts = useMemo(() => {
    return nfts.filter(nft => {
      // Search query filter
      if (searchQuery && !nft.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter && selectedCategoryFilter !== 'all') {
        if (nft.collection?.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
          return false;
        }
      }

      // Rarity filter
      if (selectedRarityFilter && selectedRarityFilter !== 'all') {
        if (nft.rarity?.toLowerCase() !== selectedRarityFilter.toLowerCase()) {
          return false;
        }
      }

      // Type filter
      if (selectedTypeFilter && selectedTypeFilter !== 'all') {
        if (nft.type?.toLowerCase() !== selectedTypeFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [nfts, searchQuery, selectedCategoryFilter, selectedRarityFilter, selectedTypeFilter]);

  // Optimized scroll handler with debounce
  const handleScroll = useCallback(() => {
    if (isLoading || displayCount >= filteredNfts.length) return;
    
    const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
    if (bottom) {
      setIsLoading(true);
      // Use setTimeout to prevent UI blocking
      setTimeout(() => {
        setDisplayCount(prevCount => {
          const newCount = Math.min(prevCount + 12, filteredNfts.length);
          setIsLoading(false);
          return newCount;
        });
      }, 100);
    }
  }, [displayCount, filteredNfts.length, isLoading]);

  // Setup optimized scroll listener
  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 200);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(20); // Show more initially for better UX
    window.scrollTo({ top: 0 });
  }, [searchQuery, selectedCategoryFilter, selectedRarityFilter, selectedTypeFilter]);

  // Calculate items to display based on current count
  const displayedNfts = useMemo(() => {
    return filteredNfts.slice(0, displayCount);
  }, [filteredNfts, displayCount]);

  return (
    <Box ref={gridRef}>
      <Grid container spacing={2}>
        {displayedNfts.map((nft) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={nft.userNftId || nft.nftId}>
            <NFTCard nft={nft} isTradeMode={isTradeMode} />
          </Grid>
        ))}
      </Grid>
      
      {/* Loading indicator */}
      {displayCount < filteredNfts.length && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {/* Empty state */}
      {filteredNfts.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No NFTs found for this filter combination
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<FilterAltOffIcon />}
            onClick={() => {
              // Reset filters
              setSearchQuery('');
              setSelectedCategoryFilter('all');
              setSelectedRarityFilter('all');
              setSelectedTypeFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Simple throttle function to improve scroll performance
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default function NFTsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // Utility functions for type conversion
  const mapTypeIdToString = (typeId) => {
    const typeMap = {
      1: 'achievement',
      2: 'subscription',
      3: 'quest_reward',
      4: 'course_completion'
    };
    return typeMap[typeId] || 'standard';
  };
  
  const mapTypeStringToId = (typeString) => {
    const typeMap = {
      'achievement': 1,
      'subscription': 2, 
      'quest_reward': 3,
      'course_completion': 4
    };
    return typeMap[typeString] || 1;
  };
  
    // Note: formatRarity function is defined later
  
  // State definitions
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState('');
  const [nfts, setNfts] = useState([]);
  const [publicNfts, setPublicNfts] = useState([]);
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
  
  // Helper function to process image URIs
  const processImageUri = (imageUri) => {
    if (!imageUri) {
      return 'https://via.placeholder.com/300/0a192f/64ffda?text=NFT';
    }
    
    // For absolute URLs, leave as is
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://') || imageUri.startsWith('ipfs://')) {
      return imageUri;
    }
    
    // For relative media paths from backend
    if (imageUri.startsWith('/media')) {
      return `http://localhost:8000${imageUri}`;
    }
    
    // For any other path format
    if (!imageUri.includes('://')) {
      // Local file path or relative path
      return `/media/uploads/nft_images/${imageUri}`;
    }
    
    return imageUri;
  };
  
  // Helper function to process NFT data consistently
  const processNftData = (nft, isPublic = false) => {
    // Handle image URI
    const imageUri = processImageUri(nft.ImageURI || nft.imageUri || nft.ImageURL || nft.imageUrl);
    
    // Handle NFT type - convert from typeId if needed
    let nftType = nft.NFTType || nft.nftType || nft.type || 'standard';
    if (typeof nft.NFTTypeID === 'number' || typeof nft.nftTypeId === 'number') {
      nftType = mapTypeIdToString(nft.NFTTypeID || nft.nftTypeId);
    }
    
    // Process BlockchainMetadata if available
    let parsedMetadata = {};
    if (nft.BlockchainMetadata || nft.blockchainMetadata) {
      try {
        parsedMetadata = JSON.parse(nft.BlockchainMetadata || nft.blockchainMetadata || '{}');
      } catch (e) {
        // Silently handle metadata parsing errors
      }
    }
    
    // Rarity handling - CRITICAL PRIORITY ORDER:
    // 1. Direct database Rarity field
    // 2. rarity property from API
    // 3. rarity from parsed metadata
    // 4. Type-based default (subscription → Legendary etc.)
    let rarity;
    
    // First check official database field
    if (nft.Rarity) {
      rarity = nft.Rarity;
    }
    // Then check if API provided a processed rarity
    else if (nft.rarity) {
      rarity = nft.rarity;
    }
    // Then check metadata
    else if (parsedMetadata.rarity) {
      rarity = parsedMetadata.rarity;
    }
    // Last resort - type-based default
    else {
      switch (nftType) {
        case 'subscription':
          rarity = 'Legendary';
          break;
        case 'achievement':
          rarity = 'Epic';
          break;
        case 'course_completion':
          rarity = 'Rare';
          break;
        default:
          rarity = 'Common';
      }
    }
    
    // Ensure consistent capitalization
    if (typeof rarity === 'string') {
      rarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
    }
    
    // Handle collection name
    const collection = nft.Collection || nft.collection || nft.Title || nft.title || '';
    
    // Create base NFT object
    const processedNft = {
      nftId: nft.NFTID || nft.nftId,
      title: nft.Title || nft.title,
      description: nft.Description || nft.description,
      imageUri: imageUri,
      type: nftType,
      rarity: rarity,
      collection: collection,
      price: nft.Price || nft.price || nft.TradeValue || nft.tradeValue || 0,
      isActive: nft.IsActive === 1 || nft.IsActive === true,
      metadata: parsedMetadata
    };
    
    // Add public or user-owned specific fields
    if (isPublic) {
      processedNft.isPublic = true;
      processedNft.planId = nft.PlanId || nft.planId;
    } else {
      processedNft.userNftId = nft.UserNFTID || nft.userNftId;
      processedNft.acquisitionDate = nft.AcquisitionDate || nft.acquisitionDate;
      processedNft.expiryDate = nft.ExpiryDate || nft.expiryDate;
      processedNft.isMinted = nft.IsMinted === 1 || nft.IsMinted === true || nft.isMinted === true;
      processedNft.transactionHash = nft.TransactionHash || nft.transactionHash;
    }
    
    return processedNft;
  };

  // Standalone loadData function that can be called from anywhere
  const loadData = async () => {
    try {
      setPageLoading(true);
      setError(null); // Clear previous errors
      
      // Fetch all available NFTs
      const publicNftsResponse = await fetch('/api/nfts/available');
      
      if (!publicNftsResponse.ok) {
        const errorData = await publicNftsResponse.json();
        throw new Error(errorData.message || `Failed to fetch available NFTs: ${publicNftsResponse.status}`);
      }
      
      const publicNftsData = await publicNftsResponse.json();
      
      // Check if we received an error response
      if (publicNftsData.error) {
        throw new Error(publicNftsData.message || 'Failed to load NFT data');
      }
      
      // Validate that we received an array of NFTs
      if (!Array.isArray(publicNftsData)) {
        throw new Error('Invalid data format received from server');
      }
      
      // Process NFT data with our helper function
      const formattedPublicNfts = publicNftsData.map(nft => processNftData(nft, true));
      
      // Check if we have the expected NFT rarity values
      console.log('NFT rarity check:');
      formattedPublicNfts.forEach(nft => {
        console.log(`NFT ID: ${nft.nftId}, Title: ${nft.title}, Rarity: ${nft.rarity}`);
        
        // Verify if we have plan3 NFT with the correct rarity
        if (nft.title.toLowerCase() === 'plan3' && nft.rarity.toLowerCase() !== 'legendary') {
          console.warn(`⚠️ Plan3 NFT (ID: ${nft.nftId}) has incorrect rarity: ${nft.rarity}, should be Legendary`);
        }
      });
      
      setPublicNfts(formattedPublicNfts);
      
      if (isAuthenticated()) {
        // Fetch user's owned NFTs
        const userNftsResponse = await fetch('/api/nfts/user');
        
        if (userNftsResponse.ok) {
          const userNftsData = await userNftsResponse.json();
          
          // Process user NFT data with our helper function
          const formattedUserNfts = userNftsData.map(nft => processNftData(nft, false));
          setNfts(formattedUserNfts);
        } else {
          // Don't throw error for user NFTs - just show a warning
          setError('Note: Your owned NFTs could not be loaded. Public NFTs are still available.');
        }
        
        // Set wallet address if available
        if (user?.walletAddress) {
          setWalletAddress(user.walletAddress);
        }
      }
    } catch (err) {
      console.error('Error loading NFT data:', err);
      setError('An error occurred while loading NFT data. Please refresh the page or try again later.');
    } finally {
      setPageLoading(false);
    }
  };
  
  // Add a retry button functionality
  const handleRetry = () => {
    setError(null);
    loadData();
  };
  
  // Use effect to load data on component mount
  useEffect(() => {
    loadData();
  }, [isAuthenticated, user]);
  
  // Mark NFTs that are already owned by the user
  useEffect(() => {
    if (nfts.length > 0 && publicNfts.length > 0) {
      // Create a set of owned NFT IDs for faster lookup
      const ownedNftIds = new Set(nfts.map(nft => nft.nftId));
      
      // Mark owned NFTs in the public list without logging to console
      const updatedPublicNfts = publicNfts.map(nft => ({
        ...nft,
        isOwned: ownedNftIds.has(nft.nftId)
      }));
      
      // Only update state if there's an actual change
      const shouldUpdate = publicNfts.some((nft, i) => 
        nft.isOwned !== updatedPublicNfts[i].isOwned
      );
      
      if (shouldUpdate) {
        setPublicNfts(updatedPublicNfts);
      }
    }
  }, [nfts]); // Only depend on nfts, not publicNfts which would cause infinite loops
  
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
      if (category.id === 'all') return true;
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
  
  // Get color based on rarity
  const getRarityColor = (rarity) => {
    if (!rarity) return theme.palette.info.main; // Default to common color
    
    const rarityLower = rarity.toLowerCase();
    
    switch (rarityLower) {
      case 'common': return theme.palette.info.main;
      case 'uncommon': return theme.palette.success.main;
      case 'rare': return theme.palette.secondary.main;
      case 'epic': return theme.palette.warning.main;
      case 'legendary': return theme.palette.error.main;
      default: return theme.palette.info.main; // Default to common color
    }
  };
  
  
  // Standardize rarity display format
  const formatRarity = (rarity) => {
    if (!rarity) return 'Common';
    
    // If it's already a string, standardize it
    const rarityLower = rarity.toLowerCase();
    
    switch (rarityLower) {
      case 'common': return 'Common';
      case 'uncommon': return 'Uncommon';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      // Handle potentially different spellings
      case 'legend': return 'Legendary';
      case 'leg': return 'Legendary';
      // Add proper capitalization to any other string
      default: return rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
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
      
      const response = await fetch('/api/nfts/mint', {
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
  
  const handleBuySubscription = async (nft, event) => {
    if (event) event.stopPropagation();
    if (!isAuthenticated()) {
      setLoginDialogOpen(true);
      return;
    }
    
    // Check if user already owns this NFT
    if (nft.isOwned) {
      showSnackbar('You already own this NFT', 'info');
      return;
    }
    
    // Prevent multiple concurrent requests
    if (mintLoading) {
      showSnackbar('Please wait, a transaction is already in progress', 'warning');
      return;
    }
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        showSnackbar('Please install MetaMask extension to buy NFTs!', 'error');
        return;
      }
      
      setMintLoading(true);
      
      // Request MetaMask connection if not already connected
      if (!walletAddress) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          if (!accounts || accounts.length === 0) {
            showSnackbar('Please connect your MetaMask wallet', 'error');
            setMintLoading(false);
            return;
          }
          
          const connectedAddress = accounts[0];
          console.log('Connected to wallet:', connectedAddress);
          
          // Update state with wallet address
          setWalletAddress(connectedAddress);
          
          // Update profile with wallet address (but continue even if it fails)
          await updateUserWalletAddress(connectedAddress);
        } catch (walletError) {
          console.error('Wallet connection error:', walletError);
          showSnackbar('Failed to connect wallet. Please try again.', 'error');
          setMintLoading(false);
          return;
        }
      }
      
      // Get current wallet address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const connectedAddress = accounts[0];
      
      if (!connectedAddress) {
        showSnackbar('No wallet connected. Please connect MetaMask.', 'error');
        setMintLoading(false);
        return;
      }
      
      console.log('Using wallet address for purchase:', connectedAddress);
      
      // Initiate purchase transaction flow
      showSnackbar('Preparing transaction...', 'info');
      
      // Implement improved retry logic for API rate limiting
      let retryCount = 0;
      const maxRetries = 3;
      let response;
      
      // Use exponential backoff for retries
      const getRetryDelay = (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 10000);
      
      while (retryCount <= maxRetries) {
        try {
          // First stage: Get transaction data from backend
          response = await fetch('/api/nfts/buy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({
              nftId: nft.nftId || nft.id,
              walletAddress: connectedAddress
            })
          });
          
          // If successful or not a rate limit error, break the retry loop
          if (response.ok || response.status !== 429) {
            break;
          }
          
          // If we hit rate limit, wait and retry
          retryCount++;
          if (retryCount <= maxRetries) {
            const waitTime = getRetryDelay(retryCount);
            showSnackbar(`Service busy, retrying in ${Math.round(waitTime/1000)} seconds...`, 'warning');
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            showSnackbar('Maximum retry attempts reached. Please try again later.', 'error');
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          // If there's a network error, break and handle it below
          break;
        }
      }
      
      // Handle API errors
      if (!response || !response.ok) {
        let errorMessage = 'Failed to prepare purchase transaction';
        let errorCode = null;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorCode = errorData.code || null;
        } catch (parseError) {
          // If we can't parse the error, use a default message
        }
        
        // Special handling for specific errors
        if (errorCode === 'ALREADY_OWNS_NFT') {
          showSnackbar('You already own this NFT', 'info');
          
          // Mark this NFT as owned to update the UI
          setPublicNfts(prevNfts => 
            prevNfts.map(item => 
              item.nftId === nft.nftId ? { ...item, isOwned: true } : item
            )
          );
          
          setMintLoading(false);
          return;
        }
        
        // Special handling for rate limit errors
        if (response && response.status === 429) {
          errorMessage = 'Service is currently busy. Please try again in a few moments.';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Transaction preparation response:', data);
      
      if (!data.transactionData) {
        throw new Error('No transaction data received from server');
      }
      
      // Second stage: Send transaction to MetaMask
      showSnackbar('Please confirm the transaction in MetaMask', 'info');
      
      // Create a transaction parameter object with NFT-specific fields 
      const transactionParameters = {
        to: data.transactionData.to,
        from: connectedAddress,
        // Include type to indicate it's an EIP-1559 transaction
        type: '0x2',
      };
      
      // Add value only if it's a non-zero amount
      if (data.transactionData.value && data.transactionData.value !== '0x0' && data.transactionData.value !== '0x') {
        transactionParameters.value = data.transactionData.value;
      }
      
      // Only add specific gas if provided (let MetaMask estimate otherwise)
      if (data.transactionData.gas && data.transactionData.gas !== '0x0') {
        transactionParameters.gas = data.transactionData.gas;
      }
      
      // Include data field for NFT transfers - this is required for them to show in MetaMask's NFT tab
      // For subscription NFTs, we need the data field to contain the ERC-721 transfer data
      if (data.transactionData.data && 
          data.transactionData.data !== '0x' && 
          data.transactionData.data !== '0x0') {
        transactionParameters.data = data.transactionData.data;
      }
      
      // Always include the type for EIP-1559 transactions if provided by the backend
      if (data.transactionData.type) {
        transactionParameters.type = data.transactionData.type;
      }
      
      console.log('Sending transaction with parameters:', transactionParameters);
      
      // Send transaction to MetaMask
      try {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
        
        if (txHash) {
          console.log('Transaction confirmed with hash:', txHash);
          
          // Third stage: Confirm transaction to backend
          await fetch('/api/nfts/buy/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nftId: nft.nftId || nft.id,
              walletAddress: connectedAddress,
              transactionHash: txHash
            })
          }).catch(error => {
            // Log but don't interrupt the flow if confirmation fails
            console.warn('Confirmation API call failed, but transaction was processed:', error);
          });
          
          showSnackbar('Subscription purchased successfully!', 'success');
          
          // First update the UI directly for immediate feedback
          setPublicNfts(prevNfts => 
            prevNfts.map(item => 
              item.nftId === nft.nftId ? { ...item, isOwned: true } : item
            )
          );
          
          // Then reload all data to ensure everything is in sync
          await loadData();
        }
      } catch (txError) {
        console.error('Transaction error:', txError);
        
        if (txError.code === 4001) {
          // User rejected transaction
          showSnackbar('Transaction was rejected. Subscription not purchased.', 'error');
          
          // Notify backend that transaction was rejected (don't await to avoid blocking UI)
          fetch('/api/nfts/buy/cancel', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nftId: nft.nftId || nft.id,
              walletAddress: connectedAddress
            })
          }).catch(error => {
            // Log but don't disrupt the flow if cancellation fails
            console.warn('Cancellation API call failed:', error);
          });
        } else {
          showSnackbar('Transaction failed: ' + (txError.message || 'Unknown error'), 'error');
        }
      }
    } catch (error) {
      console.error('Subscription purchase error:', error);
      showSnackbar(error.message || 'Failed to purchase subscription. Please try again.', 'error');
    } finally {
      setMintLoading(false);
    }
  };
  
  const updateUserWalletAddress = async (address) => {
    try {
      // Error nedeniyle profil güncelleme API çağrısını kaldırıyoruz
      // Direkt olarak state'i güncelliyoruz
      setWalletAddress(address);
      console.log('Wallet address updated in state:', address);
      
      // Başarılı olduğunu belirtiyoruz
      return true;
    } catch (error) {
      console.error('Wallet address update error:', error);
      return false;
    }
};
  
  const handleConnectWallet = async () => {
    if (!isAuthenticated()) {
      setLoginDialogOpen(true);
      return;
    }
    
    setWalletConnecting(true);
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        showSnackbar('Please install MetaMask extension to connect your wallet!', 'error');
        setWalletConnecting(false);
        return;
      }
      
      // Try to connect to MetaMask with better error handling
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
          const connectedAddress = accounts[0];
          console.log('Connected to MetaMask wallet:', connectedAddress);
          
          // Update profile with wallet address
          const updated = await updateUserWalletAddress(connectedAddress);
          
          if (updated) {
            showSnackbar('Wallet connected successfully!', 'success');
            setWalletAddress(connectedAddress);
          } else {
            // Store in state even if API update fails
            setWalletAddress(connectedAddress);
            showSnackbar('Wallet connected, but profile not updated. Connection will be lost after session ends.', 'warning');
          }
            
          // Reload NFT data
          await loadData();
        } else {
          throw new Error('No accounts available');
        }
      } catch (metamaskError) {
        console.error('MetaMask error:', metamaskError);
        
        if (metamaskError.code === 4001) {
          // User rejected the request
          showSnackbar('Connection request rejected', 'error');
        } else {
          showSnackbar('Failed to connect to MetaMask', 'error');
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      showSnackbar('Failed to connect wallet', 'error');
    } finally {
      setWalletConnecting(false);
    }
  };
  
  const handleChangeWallet = async () => {
    try {
      if (!window.ethereum) {
        showSnackbar('Please install MetaMask extension!', 'error');
        return;
      }
      
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && accounts.length > 0) {
        const connectedAddress = accounts[0];
        
        if (connectedAddress !== walletAddress) {
          // Update user profile with new wallet address
          const updated = await updateUserWalletAddress(connectedAddress);
          
          if (updated) {
            showSnackbar('Wallet changed successfully!', 'success');
            await loadData(); // Reload data
          } else {
            showSnackbar('Wallet changed for this session only', 'warning');
          }
        } else {
          showSnackbar('Same wallet selected', 'info');
        }
      }
    } catch (error) {
      console.error('Change wallet error:', error);
      showSnackbar('Failed to change wallet', 'error');
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
  const NFTCard = ({ nft, isTradeMode = false, disableHoverEffects = false }) => {
    const isSelected = isTradeMode && selectedForTrade.includes(nft.userNftId || nft.nftId);
    const [gradientBg] = useState(getRandomGammaDopplerGradient());
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    
    // Get displayed rarity - ensure consistent formatting
    const displayedRarity = formatRarity(nft.rarity);
    const rarityColor = getRarityColor(nft.rarity);
    
    // Log the NFT rarity data to verify it's correct
    useEffect(() => {
      if (nft.title?.toLowerCase() === 'plan3') {
        console.log(`Rendering NFT Card - ${nft.title}:`, { 
          id: nft.nftId,
          rarity: nft.rarity,
          displayedRarity,
          rarityColor
        });
      }
    }, [nft]);
    
    // Pre-check image URL to prevent broken images
    useEffect(() => {
      if (!nft.imageUri) return;
      
      // Reset state when NFT changes
      setImgLoaded(false);
      setImgError(false);
      
      // Skip check for external URLs (assumed valid)
      if (nft.imageUri.startsWith('https://via.placeholder.com')) {
        setImgLoaded(true);
        return;
      }
      
      // Create a new image object to test loading
      const img = new Image();
      
      img.onload = () => {
        setImgLoaded(true);
        setImgError(false);
      };
      
      img.onerror = () => {
        setImgError(true);
        setImgLoaded(false);
      };
      
      img.src = nft.imageUri;
      
      return () => {
        // Clean up by removing event listeners
        img.onload = null;
        img.onerror = null;
      };
    }, [nft.imageUri]);
    
    // Determine the correct action button based on NFT type
    const getActionButton = () => {
      if (isTradeMode) {
        return (
          <Checkbox 
            checked={isSelected}
            sx={{ 
              color: theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
            }}
            inputProps={{ 'aria-label': 'select for trade' }}
          />
        );
      }
      
      if (!nft.isPublic) {
        // For user's owned NFTs
        return (
          <Button 
            variant="text" 
            size="small" 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            View Details
          </Button>
        );
      }
      
      // For public NFTs based on type
      if (nft.isOwned) {
        return (
          <Button 
            variant="outlined" 
            size="small" 
            color="success"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none'
            }}
          >
            Owned
          </Button>
        );
      }
      
      switch (nft.type) {
        case 'subscription':
          return (
            <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleBuySubscription(nft, e);
              }}
              startIcon={<ShoppingCartIcon />}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none'
              }}
            >
              Subscribe
            </Button>
          );
        
        case 'achievement':
          return (
            <Button 
              variant="outlined" 
              color="success"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClaimFreeNFT(nft, e);
              }}
              startIcon={<EmojiEventsIcon />}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none'
              }}
            >
              Claim
            </Button>
          );
        
        case 'course_completion':
          if (nft.price > 0) {
            return (
              <Button 
                variant="contained" 
                color="secondary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuySubscription(nft, e);
                }}
                startIcon={<ShoppingCartIcon />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none'
                }}
              >
                Purchase
              </Button>
            );
          }
          return (
            <Button 
              variant="outlined" 
              color="info"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleNftClick(nft);
              }}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none'
              }}
            >
              Details
            </Button>
          );
          
        default:
          return (
            <Button 
              variant="text" 
              size="small" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              View Details
            </Button>
          );
      }
    };
    
    return (
      <Paper 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: 3, 
          overflow: 'hidden',
          transition: disableHoverEffects ? 'none' : 'transform 0.2s ease-in-out', 
          boxShadow: isSelected ? theme.shadows[8] : theme.shadows[3],
          transform: isSelected ? 'translateY(-5px)' : 'none',
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
          position: 'relative', 
          cursor: 'pointer',
          '&:hover': disableHoverEffects ? {} : { 
            boxShadow: theme.shadows[8], 
            transform: 'translateY(-5px)' 
          }
        }}
        onClick={() => {
          if (isTradeMode) {
            toggleNftSelection(nft);
          } else {
            handleNftClick(nft);
          }
        }}
      >
        {/* NFT Image container with fixed aspect ratio */}
        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
          {/* Skeleton loader while image is loading */}
          {!imgLoaded && !imgError && (
            <Skeleton 
              variant="rectangular" 
              animation="wave"
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha('#121212', 0.7) 
                  : alpha('#f5f5f5', 0.7)
              }} 
            />
          )}
          
          {/* Show image only if successfully loaded, or show fallback */}
          {(nft.imageUri && !imgError) ? (
            <img 
              src={nft.imageUri}
              alt={nft.title}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imgLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                willChange: 'opacity' // Optimize for transitions
              }} 
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setImgLoaded(false);
              }}
            />
          ) : (
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: gradientBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {nft.title ? nft.title.charAt(0) : 'W'}
            </Box>
          )}
          
          {/* Badges and overlays */}
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
          
          {/* Rarity badge - positioned in top right corner */}
          <Box sx={{ 
            position: 'absolute', top: 10, right: 10, zIndex: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)', 
            borderRadius: 5,
            px: 1.5, py: 0.5, fontSize: '0.8rem', fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
            color: rarityColor,
            border: `1.5px solid ${rarityColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            {displayedRarity.toLowerCase() === 'legendary' && <StarIcon fontSize="small" sx={{ color: rarityColor }} />}
            {displayedRarity.toLowerCase() === 'epic' && <DiamondIcon fontSize="small" sx={{ color: rarityColor }} />}
            {displayedRarity}
          </Box>
        </Box>
        
        {/* Card content section */}
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="h3" gutterBottom noWrap title={nft.title}>
            {nft.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              {getNftTypeIcon(nft.type)}
              <Box component="span" sx={{ ml: 0.5 }}>{getNftTypeLabel(nft.type)}</Box>
            </Box>
            {nft.isMinted && (
              <Tooltip title="Blockchain Verified">
                <VerifiedIcon fontSize="small" color="success" sx={{ ml: 1 }} />
              </Tooltip>
            )}
          </Box>
          
          {isTradeMode && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Trade Value: <Box component="span" fontWeight="bold">{nft.price || 0}</Box>
            </Typography>
          )}
          
          {/* Price display for public NFTs */}
          {nft.isPublic && nft.price > 0 && !isTradeMode && nft.type !== 'achievement' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Price: <Box component="span" fontWeight="bold">${nft.price}</Box>
            </Typography>
          )}
          
          <Box sx={{ mt: 'auto', pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {getActionButton()}
            
            {nft.expiryDate && (
              <Typography variant="caption" color="text.secondary">
                {isExpiringSoon(nft.expiryDate) ? (
                  <Box component="span" sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    Expires soon
                  </Box>
                ) : (
                  formatDate(nft.expiryDate)
                )}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };
  
  // Only show a single optimized loading indicator
  if (pageLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: theme.palette.primary.main,
            animationDuration: '0.8s' // Faster animation
          }} 
        />
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Loading NFTs...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{minHeight: '100vh'}}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {error ? (
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={handleRetry}
                >
                  RETRY
                </Button>
              }
            >
              {error}
            </Alert>
          ) : (
            <>
              <Box sx={{ position: 'sticky', top: 0, zIndex: 10, pt: 1, pb: 2, 
                bgcolor: theme.palette.background.default,
                borderBottom: scrolled ? `1px solid ${theme.palette.divider}` : 'none',
                boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: { xs: 1, md: 0 } }}>
                      NFT Marketplace
                    </Typography>
                  </Box>
                  
                  <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        placeholder="Search NFTs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ flexGrow: 1 }}
                      />
                      
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SwapHorizIcon />}
                        onClick={handleTradeDialogOpen}
                        disabled={!isAuthenticated() || nfts.length === 0}
                        sx={{ minWidth: 120 }}
                      >
                        Trade
                      </Button>
                      
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={walletConnecting ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceWalletIcon />}
                        onClick={walletConnecting ? null : walletAddress ? handleChangeWallet : handleConnectWallet}
                        disabled={walletConnecting}
                        sx={{ minWidth: 120 }}
                      >
                        {walletAddress 
                          ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` 
                          : 'Connect Wallet'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Filtreleme ve sıralama araçları */}
              <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                    <Typography variant="subtitle1">
                      Showing: {getAllNfts().length} NFTs
                    </Typography>
                  </Box>
                  
                  <Box sx={{ width: { xs: '100%', sm: '50%', md: '66.67%' }, display: 'flex', justifyContent: 'flex-end' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      {/* Sort button */}
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<KeyboardArrowDownIcon />}
                        onClick={handleSortMenuOpen}
                        sx={{ minWidth: 120 }}
                      >
                        {sortOption === 'newest' ? 'Newest' : 
                         sortOption === 'oldest' ? 'Oldest' : 
                         sortOption === 'price-low' ? 'Price: Low to High' : 
                         'Price: High to Low'}
                      </Button>
                      
                      {/* Filter button (future implementation) */}
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<FilterListIcon />}
                      >
                        Filter
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
              
              {/* Kategoriler */}
              <Box sx={{ mb: 6 }}>
                {NFT_CATEGORIES.map(category => {
                  const nftsInCategory = getNftsByCategory(category.id, getAllNfts());
                  const isExpanded = expandedCategories[category.id] !== false; // Default to expanded
                  const hasNfts = nftsInCategory.length > 0;
                  
                  if (!hasNfts) return null;
                  
                  return (
                    <div key={category.id} ref={el => categoryRefs.current[category.id] = el}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mb: 2, 
                          mt: 4,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          pb: 1
                        }}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: `${category.color}.main`, 
                              color: 'white',
                              mr: 2,
                              boxShadow: 2
                            }}
                          >
                            {category.icon}
                          </Avatar>
                          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                            {category.label}
                          </Typography>
                          <Chip 
                            label={nftsInCategory.length} 
                            size="small" 
                            sx={{ ml: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                          />
                        </Box>
                        
                        <IconButton onClick={(e) => { e.stopPropagation(); toggleCategory(category.id); }}>
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </Box>
                      
                      {isExpanded && (
                        <Box sx={{ position: 'relative' }}>
                          {scrollStates[category.id]?.canScrollLeft && (
                            <IconButton 
                              sx={{ 
                                position: 'absolute', 
                                left: -20, 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                zIndex: 1,
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                boxShadow: theme.shadows[2],
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                                }
                              }}
                              onClick={() => handleCategoryScroll(category.id, 'left')}
                            >
                              <NavigateBeforeIcon />
                            </IconButton>
                          )}
                          
                          {scrollStates[category.id]?.canScrollRight && (
                            <IconButton 
                              sx={{ 
                                position: 'absolute', 
                                right: -20, 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                zIndex: 1,
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                boxShadow: theme.shadows[2],
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                                }
                              }}
                              onClick={() => handleCategoryScroll(category.id, 'right')}
                            >
                              <NavigateNextIcon />
                            </IconButton>
                          )}
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              overflowX: 'auto', 
                              gap: 2, 
                              pb: 2,
                              scrollbarWidth: 'thin',
                              scrollBehavior: 'smooth',
                              scrollSnapType: 'x mandatory',
                              WebkitOverflowScrolling: 'touch', /* Smooth scroll on iOS */
                              msOverflowStyle: '-ms-autohiding-scrollbar', /* Hide scrollbar in Edge until hover */
                              '&::-webkit-scrollbar': {
                                height: 6,
                              },
                              '&::-webkit-scrollbar-track': {
                                bgcolor: alpha(theme.palette.divider, 0.1),
                                borderRadius: 3,
                              },
                              '&::-webkit-scrollbar-thumb': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                borderRadius: 3,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.3),
                                }
                              },
                              '& > div': {
                                scrollSnapAlign: 'start',
                                transition: 'none', /* Prevent transitions during scroll */
                              },
                              '&:hover .MuiPaper-root': {
                                transform: 'none', /* Disable lift effect during scroll */
                              }
                            }}
                            ref={el => scrollContainerRefs.current[category.id] = el}
                            onScroll={(e) => {
                              // Disable hover effects during scroll
                              if (!e.currentTarget.dataset.isScrolling) {
                                e.currentTarget.dataset.isScrolling = true;
                                setTimeout(() => {
                                  if (e.currentTarget) {
                                    e.currentTarget.dataset.isScrolling = false;
                                  }
                                }, 150);
                              }
                            }}
                          >
                            {nftsInCategory.map(nft => (
                              <div key={nft.nftId || nft.userNftId} style={{ minWidth: 240, width: 240 }}>
                                <NFTCard nft={nft} disableHoverEffects={true} />
                              </div>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </div>
                  );
                })}
              </Box>
              
              {/* No NFTs Message */}
              {getAllNfts().length === 0 && (
                <Paper 
                  sx={{ 
                    p: 4, 
                    borderRadius: 2, 
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.6), mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>
                    No NFTs Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {isAuthenticated() ? 
                      "You don't have any NFTs yet and there are no NFTs available to purchase." : 
                      "Please log in to view your NFTs or connect your wallet."}
                  </Typography>
                  
                  {!isAuthenticated() && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleLoginRedirect}
                      sx={{ mr: 2 }}
                    >
                      Log In
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleConnectWallet}
                    disabled={walletConnecting}
                  >
                    {walletConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                </Paper>
              )}
            </>
          )}
        </Container>
      </Box>
      
      {/* NFT Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleDetailClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: alpha('#0a192f', 0.9),
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
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <Box sx={{ width: { xs: '100%', sm: '41.66%' } }}>
                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                      border: `2px solid ${alpha('#64ffda', 0.3)}`,
                      aspectRatio: '1/1',
                    }}
                  >
                    {/* Add image display with proper fallback */}
                    {selectedDetailNft.imageUri ? (
                      <Box
                        component="img"
                        src={selectedDetailNft.imageUri}
                        alt={selectedDetailNft.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/300/0a192f/64ffda?text=${encodeURIComponent(selectedDetailNft.title?.charAt(0) || 'W')}`;
                        }}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#e6f1ff',
                        opacity: 0.8
                      }}>
                        {/* NFT Type Icon */}
                        {selectedDetailNft.type === 'achievement' && <EmojiEventsIcon sx={{ fontSize: 50 }} />}
                        {selectedDetailNft.type === 'course_completion' && <LocalFireDepartmentIcon sx={{ fontSize: 50 }} />}
                        {selectedDetailNft.type === 'subscription' && <StarIcon sx={{ fontSize: 50 }} />}
                      </Box>
                    )}
                    
                    {/* Type Chip */}
                    <Chip
                      label={getNftTypeLabel(selectedDetailNft.type)}
                      color={getNftTypeColor(selectedDetailNft.type)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    />
                    
                    {/* Rarity Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 5,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)', 
                      color: getRarityColor(selectedDetailNft.rarity),
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      zIndex: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      border: `1px solid ${getRarityColor(selectedDetailNft.rarity)}`,
                    }}>
                      {formatRarity(selectedDetailNft.rarity)}
                    </Box>
                    
                    {/* Minted Badge */}
                    {selectedDetailNft.isMinted && (
                      <Box sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: theme.palette.success.main,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 5,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}>
                        <VerifiedIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                        Minted
                      </Box>
                    )}
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
                      {selectedDetailNft.collection || selectedDetailNft.title || 'General Collection'}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5, borderColor: alpha('#64ffda', 0.1) }} />
                    
                    <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 1 }}>
                      Acquisition Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e6f1ff' }}>
                      {selectedDetailNft.acquisitionDate ? new Date(selectedDetailNft.acquisitionDate).toLocaleDateString() : 'Not acquired'}
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ width: { xs: '100%', sm: '58.34%' } }}>
                  <Box>
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
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
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
                                {selectedDetailNft.transactionHash || '0x0000000000000000000000000000000000000000'}
                              </Box>
                              <IconButton 
                                size="small" 
                                onClick={() => copyToClipboard(selectedDetailNft.transactionHash || '0x0000000000000000000000000000000000000000')}
                                sx={{ color: '#ccd6f6', '&:hover': { color: '#64ffda' } }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                              <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 0.5 }}>
                                Network
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#e6f1ff' }}>
                                Ethereum
                              </Typography>
                            </Box>
                            
                            <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                              <Typography variant="subtitle2" sx={{ color: '#ccd6f6', mb: 0.5 }}>
                                Minted On
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#e6f1ff' }}>
                                {selectedDetailNft.mintDate ? new Date(selectedDetailNft.mintDate).toLocaleDateString() : new Date().toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
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
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
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
                        </Box>
                        
                        <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
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
                              {formatRarity(selectedDetailNft.rarity)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ width: { xs: '45%', sm: '30%' } }}>
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
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              </Box>
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
      
      {/* Login Dialog */}
      <Dialog 
        open={loginDialogOpen} 
        onClose={handleLoginClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: alpha('#0a192f', 0.9),
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
      
      {/* Mint Dialog */}
      <Dialog 
        open={mintDialogOpen} 
        onClose={handleMintClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: alpha('#0a192f', 0.9),
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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Box sx={{ width: { xs: '100%', sm: '41.66%' } }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    borderRadius: 2,
                    background: getRandomGammaDopplerGradient(),
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                    border: `2px solid ${alpha('#64ffda', 0.3)}`,
                  }}
                >
                  {selectedNft.imageUri ? (
                    <img 
                      src={selectedNft.imageUri}
                      alt={selectedNft.title}
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://via.placeholder.com/300/0a192f/64ffda?text=${encodeURIComponent(selectedNft.title?.charAt(0) || 'W')}`;
                      }}
                    />
                  ) : (
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
                  )}
                  
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
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '58.34%' } }}>
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
                    label={formatRarity(selectedNft.rarity)}
                    sx={{ bgcolor: getRarityColor(selectedNft.rarity), color: 'white' }}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ color: '#ccd6f6' }} gutterBottom>
                    Minting this NFT will permanently record it on the blockchain, making it a verifiable digital asset that you own.
                  </Typography>
                </Box>
              </Box>
            </Box>
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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

// Add the getNftTypeIcon function below existing helper functions
// Get icon for NFT type
const getNftTypeIcon = (type) => {
  if (!type) return <CollectionsIcon fontSize="small" />;
  
  switch(type.toLowerCase()) {
    case 'subscription':
      return <DiamondIcon fontSize="small" color="primary" />;
    case 'achievement':
      return <EmojiEventsIcon fontSize="small" sx={{ color: '#FFD700' }} />;
    case 'course_completion':
      return <SchoolIcon fontSize="small" color="info" />;
    case 'ranking':
      return <StarIcon fontSize="small" sx={{ color: '#FFA726' }} />;
    case 'limited_edition':
      return <WhatshotIcon fontSize="small" color="error" />;
    default:
      return <CollectionsIcon fontSize="small" />;
  }
};

// Add the isExpiringSoon function below the other helper functions
const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  
  return daysLeft <= 7 && daysLeft > 0;
};

// Add a date formatter
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};