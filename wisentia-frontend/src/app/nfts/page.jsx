'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Tab,
  Tabs,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import { 
  Search as SearchIcon, 
  LocalActivity as NFTIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  CollectionsBookmark as CollectionIcon,
  Stars as StarsIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function NFTsPage() {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [nfts, setNFTs] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    rarity: '',
    buyable: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const nftsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // NFT'leri kontrol
        console.log('Fetching NFTs data...');
        let nftsData = [];
        
        try {
          // API'den NFT'leri almayı dene, hata olursa mockup verileri kullan
          nftsData = await api.get('/nfts/', false);
          console.log('NFTs fetched from API:', nftsData);
        } catch (error) {
          console.log('Using fallback NFTs data');
          nftsData = [
            { NFTID: 1, Name: 'Cyber Academy Certificate', Description: 'Earned by completing the Programming course.', Category: 2, Rarity: 1, TokenValue: 100, MinimumPoints: 200, Buyable: false, UnlockConditionType: 1, UnlockConditionID: 1, ImageURL: null },
            { NFTID: 2, Name: 'Math Mastermind', Description: 'Prove your advanced mathematics skills by unlocking this rare badge.', Category: 2, Rarity: 2, TokenValue: 150, MinimumPoints: 300, Buyable: false, UnlockConditionType: 1, UnlockConditionID: 2, ImageURL: null },
            { NFTID: 3, Name: 'Quantum Explorer', Description: 'For those who understand the mysteries of the quantum universe.', Category: 2, Rarity: 3, TokenValue: 200, MinimumPoints: 400, Buyable: false, UnlockConditionType: 1, UnlockConditionID: 3, ImageURL: null },
            { NFTID: 4, Name: 'Code Wizard', Description: 'Elite programming skills badge for those who master coding challenges.', Category: 3, Rarity: 3, TokenValue: 250, MinimumPoints: 500, Buyable: true, UnlockConditionType: null, UnlockConditionID: null, ImageURL: null },
            { NFTID: 5, Name: 'Quest Champion', Description: 'Completed all beginner quests and proven your comprehensive knowledge.', Category: 3, Rarity: 2, TokenValue: 150, MinimumPoints: 300, Buyable: false, UnlockConditionType: 2, UnlockConditionID: 4, ImageURL: null },
            { NFTID: 6, Name: 'Golden Scholar', Description: 'Premium membership badge for dedicated learners.', Category: 4, Rarity: 4, TokenValue: 500, MinimumPoints: 1000, Buyable: true, UnlockConditionType: null, UnlockConditionID: null, ImageURL: null },
            { NFTID: 7, Name: 'Language Master', Description: 'Multilingual badge for those who excel in language courses.', Category: 2, Rarity: 2, TokenValue: 180, MinimumPoints: 350, Buyable: false, UnlockConditionType: 1, UnlockConditionID: 7, ImageURL: null },
            { NFTID: 8, Name: 'Business Tycoon', Description: 'Elite business badge for future entrepreneurs.', Category: 3, Rarity: 3, TokenValue: 280, MinimumPoints: 550, Buyable: true, UnlockConditionType: null, UnlockConditionID: null, ImageURL: null }
          ];
        }
        
        // Kullanıcı NFT'lerini kontrol et
        let userNFTsData = [];
        
        if (isAuthenticated) {
          try {
            userNFTsData = await api.get('/nfts/my-nfts/');
            console.log('User NFTs fetched from API:', userNFTsData);
          } catch (error) {
            console.log('Using fallback user NFTs data');
            userNFTsData = [
              { NFTID: 1, Name: 'Cyber Academy Certificate', AcquiredAt: '2023-11-15' }
            ];
          }
        }
        
        setNFTs(nftsData);
        setUserNFTs(userNFTsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setNFTs([
          { NFTID: 1, Name: 'Example NFT', Description: 'This is a sample NFT.', Category: 1, Rarity: 1, TokenValue: 100 }
        ]);
        setUserNFTs([]);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleOpenDialog = (nft) => {
    setSelectedNFT(nft);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const filteredNFTs = nfts.filter(nft => {
    // Filter by category
    if (filters.category && nft.Category.toString() !== filters.category) {
      return false;
    }
    
    // Filter by rarity
    if (filters.rarity && nft.Rarity.toString() !== filters.rarity) {
      return false;
    }
    
    // Filter by buyable
    if (filters.buyable === 'true' && !nft.Buyable) {
      return false;
    } else if (filters.buyable === 'false' && nft.Buyable) {
      return false;
    }
    
    // Filter by search term
    if (filters.search && !nft.Name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const pageCount = Math.ceil(filteredNFTs.length / nftsPerPage);
  const displayedNFTs = filteredNFTs.slice(
    (page - 1) * nftsPerPage,
    page * nftsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryLabel = (category) => {
    const categories = {
      1: 'Achievement',
      2: 'Course',
      3: 'Quest',
      4: 'Premium'
    };
    return categories[category] || 'Unknown';
  };

  const getRarityLabel = (rarity) => {
    const rarities = {
      1: 'Common',
      2: 'Rare',
      3: 'Epic',
      4: 'Legendary'
    };
    return rarities[rarity] || 'Unknown';
  };

  const getRarityColor = (rarity) => {
    const colors = {
      1: theme.palette.grey[600],
      2: theme.palette.primary.main,
      3: theme.palette.secondary.main,
      4: theme.palette.warning.main
    };
    return colors[rarity] || theme.palette.grey[500];
  };

  const getNFTBackground = (nftId, rarity) => {
    const backgrounds = {
      1: `linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)`,
      2: `linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)`,
      3: `linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)`,
      4: `linear-gradient(135deg, #FCCF31 0%, #F55555 100%)`,
    };
    return backgrounds[rarity] || `linear-gradient(135deg, ${theme.palette.grey[700]}, ${theme.palette.grey[900]})`;
  };

  const isNFTOwned = (nftId) => {
    return userNFTs.some(userNFT => userNFT.NFTID === nftId);
  };

  const canAcquireNFT = (nft) => {
    if (!isAuthenticated) return false;
    if (isNFTOwned(nft.NFTID)) return false;
    
    // Yeterli puan var mı?
    if (user?.Points < nft.MinimumPoints) return false;
    
    return true;
  };

  const SkeletonNFTCard = () => (
    <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={200} animation="wave" />
      <CardContent>
        <Skeleton variant="text" width="70%" height={32} animation="wave" />
        <Skeleton variant="text" width="100%" height={20} animation="wave" />
        <Skeleton variant="text" width="90%" height={20} animation="wave" />
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="30%" height={24} animation="wave" />
          <Skeleton variant="text" width="30%" height={24} animation="wave" />
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={36} animation="wave" sx={{ borderRadius: 2 }} />
      </CardActions>
    </Card>
  );
  
  // SVG Patterns for background
  const SVGPattern = () => (
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%',
      height: '100%',
      zIndex: 0,
      opacity: 0.5,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern1" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="rotate(45)">
            <circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.1)" />
          </pattern>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.05)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pattern1)" />
        <rect width="100%" height="100%" fill="url(#gradient1)" />
      </svg>
    </Box>
  );

  return (
    <Box sx={{ 
      position: 'relative',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`,
      minHeight: '100vh',
      pt: { xs: 2, md: 4 },
      pb: { xs: 4, md: 6 }
    }}>
      {/* Animated Background Elements */}
      <Box sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {/* Floating Elements */}
        {[...Array(15)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`,
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float${i % 3 + 1} ${Math.random() * 20 + 10}s infinite ease-in-out`,
              '@keyframes float1': {
                '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                '50%': { transform: 'translateY(-20px) rotate(10deg)' }
              },
              '@keyframes float2': {
                '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                '50%': { transform: 'translateY(20px) rotate(-10deg)' }
              },
              '@keyframes float3': {
                '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
                '50%': { transform: 'translateX(20px) rotate(10deg)' }
              }
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            mb: { xs: 4, md: 6 },
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: 'white',
            minHeight: { xs: 200, md: 250 },
            backgroundImage: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.dark})`,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          <SVGPattern />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              NFT Collection
            </Typography>
            <Typography 
              variant="h6"
              sx={{ 
                maxWidth: '600px', 
                mb: 3,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: 1.5
              }}
            >
              Earn unique digital badges that showcase your achievements and skills on the platform
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Chip 
                icon={<StarsIcon />} 
                label="Unique Collectibles" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-icon': { color: 'white' }
                }} 
              />
              <Chip 
                icon={<CollectionIcon />} 
                label="Showcase Your Skills" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-icon': { color: 'white' }
                }} 
              />
            </Box>
          </Box>
          
          {/* Decorative NFT Icons */}
          <Box sx={{ 
            position: 'absolute',
            right: { xs: -20, md: 20 },
            bottom: { xs: -30, md: -20 },
            display: { xs: 'none', md: 'block' },
            transform: 'rotate(15deg)',
            opacity: 0.8
          }}>
            <NFTIcon sx={{ fontSize: 120, color: 'rgba(255,255,255,0.2)' }} />
          </Box>
        </Paper>

        {/* Tabs for switching between All NFTs and My NFTs */}
        <Paper sx={{ borderRadius: 4, mb: 4, position: 'relative', overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              '& .MuiTabs-indicator': { 
                height: 3,
                borderRadius: 1.5
              },
              '& .MuiTab-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                py: 2
              }
            }}
          >
            <Tab 
              label="All NFTs" 
              icon={<CollectionIcon />} 
              iconPosition="start" 
            />
            {isAuthenticated && (
              <Tab 
                label="My Collection" 
                icon={<NFTIcon />} 
                iconPosition="start" 
              />
            )}
          </Tabs>
        </Paper>

        {tabValue === 0 ? (
          <>
            {/* Filters */}
            <Paper 
              elevation={3} 
              sx={{ 
                mb: 4, 
                p: { xs: 2, md: 3 }, 
                borderRadius: 4,
                background: 'white',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                      labelId="category-filter-label"
                      name="category"
                      value={filters.category}
                      label="Category"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      <MenuItem value="1">Achievement</MenuItem>
                      <MenuItem value="2">Course</MenuItem>
                      <MenuItem value="3">Quest</MenuItem>
                      <MenuItem value="4">Premium</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="rarity-filter-label">Rarity</InputLabel>
                    <Select
                      labelId="rarity-filter-label"
                      name="rarity"
                      value={filters.rarity}
                      label="Rarity"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All Rarities</MenuItem>
                      <MenuItem value="1">Common</MenuItem>
                      <MenuItem value="2">Rare</MenuItem>
                      <MenuItem value="3">Epic</MenuItem>
                      <MenuItem value="4">Legendary</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="buyable-filter-label">Purchasable</InputLabel>
                    <Select
                      labelId="buyable-filter-label"
                      name="buyable"
                      value={filters.buyable}
                      label="Purchasable"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    name="search"
                    label="Search NFTs"
                    value={filters.search}
                    onChange={handleFilterChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* NFT List */}
            {isLoading ? (
              <Grid container spacing={4}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Grid item key={item} xs={12} sm={6} md={4}>
                    <SkeletonNFTCard />
                  </Grid>
                ))}
              </Grid>
            ) : displayedNFTs.length > 0 ? (
              <>
                <Grid container spacing={4}>
                  {displayedNFTs.map((nft) => {
                    const owned = isNFTOwned(nft.NFTID);
                    const canAcquire = canAcquireNFT(nft);
                    
                    return (
                      <Grid item key={nft.NFTID} xs={12} sm={6} md={4}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 4,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                            },
                            border: owned ? `2px solid ${theme.palette.success.main}` : 'none',
                          }}
                        >
                          <Box
                            sx={{
                              height: 200,
                              position: 'relative',
                              background: getNFTBackground(nft.NFTID, nft.Rarity),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <SVGPattern />
                            
                            <NFTIcon sx={{ 
                              color: 'white', 
                              fontSize: 80,
                              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                              animation: owned ? 'pulse 2s infinite' : 'none',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' }
                              }
                            }} />
                            
                            {/* Rarity Badge */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                zIndex: 2,
                              }}
                            >
                              <Chip 
                                label={getRarityLabel(nft.Rarity)} 
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                                  color: getRarityColor(nft.Rarity),
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                            </Box>
                            
                            {/* Owned Badge */}
                            {owned && (
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 12, 
                                right: 12, 
                                bgcolor: theme.palette.success.main,
                                color: 'white',
                                borderRadius: '50%',
                                p: 0.5,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}>
                                <CheckIcon />
                              </Box>
                            )}
                            
                            {/* Lock Icon for Locked NFTs */}
                            {!owned && !canAcquire && !nft.Buyable && (
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column'
                              }}>
                                <LockIcon sx={{ color: 'white', fontSize: 40, mb: 1 }} />
                                <Typography variant="body2" color="white" sx={{ px: 2, textAlign: 'center' }}>
                                  Complete required tasks to unlock
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Typography 
                              gutterBottom 
                              variant="h5" 
                              component="h2" 
                              fontWeight="bold"
                              sx={{ 
                                color: owned ? theme.palette.success.dark : 'inherit'
                              }}
                            >
                              {nft.Name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              paragraph
                              sx={{ 
                                minHeight: '4em',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {nft.Description}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip 
                                label={getCategoryLabel(nft.Category)} 
                                variant="outlined" 
                                size="small"
                              />
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                {nft.TokenValue} points
                              </Typography>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ p: 2 }}>
                            <Button 
                              size="small" 
                              onClick={() => handleOpenDialog(nft)}
                              sx={{ mr: 1 }}
                            >
                              Details
                            </Button>
                            
                            {!owned && isAuthenticated && (
                              nft.Buyable ? (
                                <Button 
                                  size="small" 
                                  color="primary"
                                  variant="contained"
                                  disabled={!canAcquire}
                                  sx={{ 
                                    ml: 'auto',
                                    borderRadius: 2,
                                    background: canAcquire ? 
                                      `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` : 
                                      undefined
                                  }}
                                >
                                  {canAcquire ? 'Purchase' : 'Not Enough Points'}
                                </Button>
                              ) : (
                                <Button 
                                  size="small" 
                                  color="secondary"
                                  variant="contained"
                                  disabled={!canAcquire}
                                  sx={{ 
                                    ml: 'auto',
                                    borderRadius: 2,
                                    background: canAcquire ? 
                                      `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})` : 
                                      undefined
                                  }}
                                  startIcon={<LockIcon />}
                                >
                                  {canAcquire ? 'Unlock' : 'Locked'}
                                </Button>
                              )
                            )}
                            
                            {owned && (
                              <Chip 
                                label="Owned" 
                                color="success" 
                                size="small"
                                icon={<CheckIcon />}
                                sx={{ ml: 'auto' }}
                              />
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                
                {/* Pagination */}
                {pageCount > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                    <Pagination 
                      count={pageCount} 
                      page={page} 
                      onChange={handlePageChange} 
                      color="primary" 
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: 2,
                          margin: '0 4px'
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Paper 
                elevation={3}
                sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  px: 4,
                  borderRadius: 4,
                  background: 'white',
                }}
              >
                <NFTIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
                <Typography variant="h5" gutterBottom>No NFTs found matching your criteria</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                  Try adjusting your filters or search parameters to find the NFTs you're looking for.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setFilters({ category: '', rarity: '', buyable: '', search: '' })}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Clear Filters
                </Button>
              </Paper>
            )}
          </>
        ) : (
          // My NFTs Tab Content
          <>
            {isAuthenticated ? (
              userNFTs.length > 0 ? (
                <Grid container spacing={4}>
                  {userNFTs.map((userNFT) => {
                    const fullNFT = nfts.find(n => n.NFTID === userNFT.NFTID) || {};
                    return (
                      <Grid item key={userNFT.NFTID} xs={12} sm={6} md={4}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 4,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            border: `2px solid ${theme.palette.success.main}`,
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              height: 200,
                              position: 'relative',
                              background: getNFTBackground(fullNFT.NFTID, fullNFT.Rarity || 1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <SVGPattern />
                            
                            <NFTIcon sx={{ 
                              color: 'white', 
                              fontSize: 80,
                              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' }
                              }
                            }} />
                            
                            {/* Rarity Badge */}
                            {fullNFT.Rarity && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 12,
                                  left: 12,
                                  zIndex: 2,
                                }}
                              >
                                <Chip 
                                  label={getRarityLabel(fullNFT.Rarity)} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(255, 255, 255, 0.85)',
                                    color: getRarityColor(fullNFT.Rarity),
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                              </Box>
                            )}
                            
                            {/* Owned Badge */}
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 12, 
                              right: 12, 
                              bgcolor: theme.palette.success.main,
                              color: 'white',
                              borderRadius: '50%',
                              p: 0.5,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}>
                              <CheckIcon />
                            </Box>
                          </Box>
                          <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Typography 
                              gutterBottom 
                              variant="h5" 
                              component="h2" 
                              fontWeight="bold"
                              sx={{ color: theme.palette.success.dark }}
                            >
                              {fullNFT.Name || userNFT.Name}
                            </Typography>
                            {fullNFT.Description && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                paragraph
                                sx={{ 
                                  minHeight: '3em',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {fullNFT.Description}
                              </Typography>
                            )}
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {fullNFT.Category && (
                                <Chip 
                                  label={getCategoryLabel(fullNFT.Category)} 
                                  variant="outlined" 
                                  size="small"
                                />
                              )}
                              <Typography variant="body2" sx={{ color: theme.palette.success.main }}>
                                Acquired: {new Date(userNFT.AcquiredAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ p: 2 }}>
                            <Button 
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={() => handleOpenDialog(fullNFT)}
                              sx={{ borderRadius: 2 }}
                            >
                              View Details
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Paper 
                  elevation={3}
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    px: 4,
                    borderRadius: 4,
                    background: 'white',
                  }}
                >
                  <NFTIcon sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }} />
                  <Typography variant="h5" gutterBottom>Your NFT collection is empty</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    Complete courses and quests to earn unique NFTs that showcase your achievements!
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link}
                    href="/courses"
                    sx={{ borderRadius: 2, px: 4, mr: 2 }}
                  >
                    Explore Courses
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    component={Link}
                    href="/quests"
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Take Quests
                  </Button>
                </Paper>
              )
            ) : (
              <Paper 
                elevation={3}
                sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  px: 4,
                  borderRadius: 4,
                  background: 'white',
                }}
              >
                <Typography variant="h5" gutterBottom>Please sign in to view your NFT collection</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link}
                  href="/auth/login"
                  sx={{ borderRadius: 2, px: 4, mt: 2 }}
                >
                  Sign In
                </Button>
              </Paper>
            )}
          </>
        )}

        {/* NFT Detail Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: 'hidden'
            }
          }}
        >
          {selectedNFT && (
            <>
              <Box
                sx={{ 
                  height: 200, 
                  position: 'relative',
                  background: getNFTBackground(selectedNFT.NFTID, selectedNFT.Rarity),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SVGPattern />
                <NFTIcon sx={{ color: 'white', fontSize: 80 }} />
                
                {/* Rarity Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 2,
                  }}
                >
                  <Chip 
                    label={getRarityLabel(selectedNFT.Rarity)} 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.85)',
                      color: getRarityColor(selectedNFT.Rarity),
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>
                
                {/* Owned Badge */}
                {isNFTOwned(selectedNFT.NFTID) && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    bgcolor: theme.palette.success.main,
                    color: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <CheckIcon />
                  </Box>
                )}
              </Box>
              
              <DialogTitle sx={{ pb: 1, pt: 3 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {selectedNFT.Name}
                </Typography>
              </DialogTitle>
              
              <DialogContent>
                <DialogContentText paragraph>
                  {selectedNFT.Description}
                </DialogContentText>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Category:</Typography>
                    <Typography variant="body1" fontWeight="medium">{getCategoryLabel(selectedNFT.Category)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Rarity:</Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="medium"
                      sx={{ color: getRarityColor(selectedNFT.Rarity) }}
                    >
                      {getRarityLabel(selectedNFT.Rarity)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Value:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedNFT.TokenValue} points</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Required Points:</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedNFT.MinimumPoints} points</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">How to obtain:</Typography>
                    <Typography variant="body1">
                      {selectedNFT.Buyable 
                        ? 'This NFT can be purchased with points.' 
                        : selectedNFT.UnlockConditionType === 1
                          ? 'Complete the associated course to earn this NFT.'
                          : selectedNFT.UnlockConditionType === 2
                            ? 'Complete the associated quest to earn this NFT.'
                            : 'Earn enough points to unlock this achievement.'}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2 }}>
                  Close
                </Button>
                {!isNFTOwned(selectedNFT.NFTID) && isAuthenticated && canAcquireNFT(selectedNFT) && (
                  <Button 
                    color="primary"
                    variant="contained"
                    sx={{ 
                      borderRadius: 2,
                      background: selectedNFT.Buyable ?
                        `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` :
                        `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
                    }}
                  >
                    {selectedNFT.Buyable ? 'Purchase' : 'Unlock'}
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
}