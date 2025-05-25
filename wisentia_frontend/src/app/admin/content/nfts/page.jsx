// src/app/admin/content/nfts/page.jsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

// MUI components
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  Stack,
  Grid,
  Divider,
  Skeleton,
  Container,
  Collapse,
  CardContent,
  styled
} from '@mui/material';

// MUI icons
import {
  ViewCarousel as NFTIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Subscriptions as SubscriptionIcon,
  AccountBalanceWallet as WalletIcon,
  CurrencyExchange as TradeIcon,
  ShieldMoon as RarityIcon,
  ExpandMore as ExpandMoreIcon,
  Image as ImageIcon
} from '@mui/icons-material';

// Custom styled components
const StyledAvatar = styled(Avatar)(({ theme, rarity }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  boxShadow: rarity ? `0 4px 12px ${alpha(rarity, 0.3)}` : 'none',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: rarity ? `0 6px 16px ${alpha(rarity, 0.4)}` : 'none',
  }
}));

// Expandable Mobile Card
const ExpandableCard = ({ nft, onView, onEdit, onToggleActive, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Get color based on rarity
  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return theme.palette.info.main;
      case 'uncommon': return theme.palette.success.main;
      case 'rare': return theme.palette.secondary.main;
      case 'epic': return theme.palette.warning.main;
      case 'legendary': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // Get NFT type icon
  const getNFTTypeIcon = (typeName) => {
    switch (typeName?.toLowerCase()) {
      case 'subscription': return <SubscriptionIcon fontSize="small" />;
      case 'reward': return <RarityIcon fontSize="small" />;
      case 'tradable': return <TradeIcon fontSize="small" />;
      default: return <NFTIcon fontSize="small" />;
    }
  };

  const rarityColor = getRarityColor(nft.Rarity);

  return (
    <Card 
      elevation={2} 
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        borderLeft: '4px solid',
        borderLeftColor: nft.IsActive ? theme.palette.success.main : theme.palette.error.main,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
    >
      {/* Card Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onClick={handleExpandClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <StyledAvatar 
            src={nft.ImageURL} 
            variant="rounded"
            alt={nft.Title}
            rarity={rarityColor}
            sx={{ 
              mr: 2,
              bgcolor: nft.ImageURL ? undefined : alpha(theme.palette.secondary.main, 0.8),
            }}
          >
            {!nft.ImageURL && (nft.NFTType ? getNFTTypeIcon(nft.NFTType) : <ImageIcon />)}
          </StyledAvatar>
          <Box sx={{ minWidth: 0 }}> {/* This prevents text overflow */}
            <Typography 
              variant="subtitle1" 
              fontWeight="medium"
              sx={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '180px',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {nft.Title}
              {nft.IsLimited && (
                <Chip 
                  label="Limited" 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {nft.NFTType || 'Standard'} NFT
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleExpandClick();
          }}
          aria-expanded={expanded}
          aria-label="show more"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Status Chip - Always visible */}
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Chip 
          label={nft.IsActive ? 'Active' : 'Inactive'} 
          color={nft.IsActive ? 'success' : 'error'}
          size="small"
          variant={nft.IsActive ? 'filled' : 'outlined'}
        />
      </Box>
      
      {/* Expandable Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Rarity</Typography>
              <Box>
                <Chip 
                  label={nft.Rarity || 'Common'} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(rarityColor, 0.1),
                    color: rarityColor,
                    borderColor: rarityColor,
                    fontWeight: 'medium'
                  }}
                  variant="outlined"
                />
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Value</Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WalletIcon fontSize="small" color="primary" /> 
                {nft.TradeValue || 0} EDU
              </Typography>
            </Grid>
            
            {nft.SubscriptionDays > 0 && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Subscription</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubscriptionIcon fontSize="small" color="primary" /> 
                  {nft.SubscriptionDays} days
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={nft.SubscriptionDays > 0 ? 6 : 12}>
              <Typography variant="caption" color="text.secondary">Owners</Typography>
              <Box>
                <Chip 
                  label={nft.OwnersCount || 0} 
                  variant="outlined" 
                  size="small"
                  color="primary"
                />
              </Box>
            </Grid>

            {nft.Description && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {nft.Description.length > 100 
                    ? `${nft.Description.substring(0, 100)}...` 
                    : nft.Description}
                </Typography>
              </Grid>
            )}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              size="small" 
              variant="outlined"
              color="secondary"
              startIcon={<ViewIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onView(nft.NFTID);
              }}
            >
              View
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Edit NFT">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(nft.NFTID);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={nft.IsActive ? "Deactivate" : "Activate"}>
                <IconButton 
                  size="small"
                  color={nft.IsActive ? "error" : "success"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(nft.NFTID, nft.IsActive);
                  }}
                >
                  {nft.IsActive ? <DeactivateIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default function NFTsManagementPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [nfts, setNFTs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  const { user } = useAuth();
  const router = useRouter();

  // Add NFT type mapping functions
  const mapTypeStringToId = (typeString) => {
    if (!typeString) return 1; // Default to standard type
    
    switch (typeString.toLowerCase()) {
      case 'subscription': return 1;
      case 'achievement': return 2;
      case 'quest_reward': case 'reward': return 3;
      case 'course_completion': return 4;
      case 'tradable': return 5;
      default: return 1; // Default to standard type
    }
  };

  const mapTypeIdToString = (typeId) => {
    if (!typeId) return 'standard';
    
    switch (Number(typeId)) {
      case 1: return 'subscription';
      case 2: return 'achievement';
      case 3: return 'quest_reward';
      case 4: return 'course_completion';
      case 5: return 'tradable';
      default: return 'standard';
    }
  };

  // Update page size based on screen size
  useEffect(() => {
    setPageSize(isMobile ? 10 : 20);
  }, [isMobile]);

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
  
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: page + 1,
          pageSize,
          search: searchTerm,
          type: typeFilter,
          rarity: rarityFilter,
          status: statusFilter
        });
  
        // API route'u güncellendi - NFTs API'sine istek yapılıyor
        const response = await fetch(`/api/admin/nfts?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }
  
        const data = await response.json();
        
        if (data && data.nfts) {
          // Map backend fields to frontend expected format
          const mappedNFTs = data.nfts.map(nft => ({
            NFTID: nft.NFTID || nft.nftId,
            Title: nft.Title || nft.title,
            Description: nft.Description || nft.description,
            ImageURI: nft.ImageURI || nft.imageUri,
            TradeValue: nft.TradeValue || nft.tradeValue || nft.price || 0,
            SubscriptionDays: nft.SubscriptionDays || nft.subscriptionDays || 0,
            NFTTypeID: nft.NFTTypeID || nft.nftTypeId || mapTypeStringToId(nft.NFTType || nft.type),
            NFTType: nft.NFTType || nft.type || mapTypeIdToString(nft.NFTTypeID || nft.nftTypeId),
            Rarity: nft.Rarity || nft.rarity || 'Common',
            Collection: nft.Collection || nft.collection || 'General',
            BlockchainMetadata: nft.BlockchainMetadata || nft.blockchainMetadata || null,
            CreationDate: nft.CreationDate || nft.creationDate || new Date().toISOString(),
            // Ensure we correctly map the IsActive field with appropriate fallbacks
            IsActive: nft.IsActive === undefined
              ? (nft.isActive === undefined ? true : nft.isActive)
              : nft.IsActive === 1 || nft.IsActive === true,
            OwnersCount: nft.OwnedCount || nft.ownedCount || 0
          }));
          
          console.log('Mapped NFTs data:', mappedNFTs);
          setNFTs(mappedNFTs);
          setTotalCount(data.totalCount || mappedNFTs.length);
        } else {
          console.error('Unexpected API response format:', data);
          setError('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Failed to fetch NFTs:', err);
        setError('Failed to fetch NFTs: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (user && user.role === 'admin') {
      fetchNFTs();
    }
  }, [user, router, page, pageSize, searchTerm, typeFilter, rarityFilter, statusFilter]);
  
  const handleCreateNFT = () => {
    router.push('/admin/content/nfts/create');
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      // Show a loading message or indicator
      setLoading(true);
      
      console.log(`Toggling NFT ${id} active status from ${isActive} to ${!isActive}`);
      
      const response = await fetch(`/api/admin/nfts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update NFT');
      }

      // Update NFT in list - ensure we're toggling the correct property
      setNFTs(nfts.map(nft => 
        nft.NFTID === id 
          ? { ...nft, IsActive: !isActive } 
          : nft
      ));
      
      setLoading(false);
      
      // Show success message
      toast.success('NFT status updated successfully');
    } catch (err) {
      console.error('Failed to update NFT status:', err);
      setError('Failed to update NFT: ' + err.message);
      setLoading(false);
      
      // Show error message
      toast.error(err.message || 'Failed to update NFT');
    }
  };

  const handleViewNFT = (id) => {
    router.push(`/admin/content/nfts/view/${id}`);
  };

  const handleEditNFT = (id) => {
    router.push(`/admin/content/nfts/edit/${id}`);
  };

  const handleDeleteNFT = async (id) => {
    if (!confirm('Are you sure you want to delete this NFT?')) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/nfts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete NFT');
      }

      // Remove NFT from list
      setNFTs(nfts.filter(nft => nft.NFTID !== id));
      // Update total count
      setTotalCount(prev => Math.max(0, prev - 1));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to delete NFT');
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setRarityFilter('');
    setStatusFilter('');
    setPage(0);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Get NFT type icon
  const getNFTTypeIcon = (typeName) => {
    switch (typeName?.toLowerCase()) {
      case 'subscription':
        return <SubscriptionIcon fontSize="small" />;
      case 'reward':
        return <RarityIcon fontSize="small" />;
      case 'tradable':
        return <TradeIcon fontSize="small" />;
      default:
        return <NFTIcon fontSize="small" />;
    }
  };

  // Get color based on rarity
  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'common':
        return theme.palette.info.main;
      case 'uncommon':
        return theme.palette.success.main;
      case 'rare':
        return theme.palette.secondary.main;
      case 'epic':
        return theme.palette.warning.main;
      case 'legendary':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Memoize the filters section to prevent unnecessary re-renders
  const FiltersSection = useMemo(() => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: { xs: 1.5, md: 2 }, 
        mb: 3, 
        borderRadius: 2,
        transition: 'all 0.3s ease',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            placeholder="Search NFTs..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="type-filter-label">NFT Type</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="NFT Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="subscription">Subscription</MenuItem>
              <MenuItem value="reward">Reward</MenuItem>
              <MenuItem value="tradable">Tradable</MenuItem>
              <MenuItem value="special">Special</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="rarity-filter-label">Rarity</InputLabel>
            <Select
              labelId="rarity-filter-label"
              id="rarity-filter"
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              label="Rarity"
            >
              <MenuItem value="">All Rarities</MenuItem>
              <MenuItem value="common">Common</MenuItem>
              <MenuItem value="uncommon">Uncommon</MenuItem>
              <MenuItem value="rare">Rare</MenuItem>
              <MenuItem value="epic">Epic</MenuItem>
              <MenuItem value="legendary">Legendary</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} sm={12} md={2}>
          <Button 
            variant="outlined" 
            color="secondary"
            startIcon={<FilterIcon />}
            onClick={handleClearFilters}
            size="medium"
            fullWidth
            sx={{ height: '100%', maxHeight: 40 }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
  ), [searchTerm, typeFilter, rarityFilter, statusFilter, theme.palette]);

  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {isMobile ? (
        // Mobile loading skeleton
        Array.from(new Array(3)).map((_, index) => (
          <Paper
            key={index}
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              borderLeft: '4px solid',
              borderLeftColor: alpha(theme.palette.grey[500], 0.5),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="rounded" width={56} height={56} sx={{ mr: 2 }} />
              <Box sx={{ width: '70%' }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="50%" height={20} />
              </Box>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="rounded" width="70%" height={24} />
                </Grid>
                <Grid item xs={6}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="rounded" width="70%" height={24} />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        ))
      ) : (
        // Desktop loading skeleton
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                <TableRow>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="rounded" width={48} height={48} sx={{ mr: 2 }} />
                        <Box>
                          <Skeleton variant="text" width={120} height={24} />
                          <Skeleton variant="text" width={80} height={16} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={40} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={120} height={32} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );

  return (
    <MainLayout>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
          {/* Page Header */}
          <Box sx={{ 
            mb: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}>
            <Fade in={true} timeout={800}>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1"
                  fontWeight="700"
                  sx={{ 
                    fontSize: { xs: '1.7rem', sm: '2rem', md: '2.125rem' },
                    mb: 1,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.light} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  NFT Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage tokens, rewards, and subscription NFTs
                </Typography>
              </Box>
            </Fade>
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              {isMobile && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<FilterIcon />}
                  onClick={toggleFilters}
                  sx={{ 
                    flex: 1,
                    borderRadius: 2,
                  }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              )}
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNFT}
                  sx={{ 
                    px: { xs: 2, md: 3 },
                    py: { xs: 1, md: 1.2 },
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.light} 90%)`,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    width: { xs: '100%', sm: 'auto' },
                    flex: isMobile ? 1 : 'auto'
                  }}
                >
                  Create NFT
                </Button>
              </Zoom>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              variant="filled"
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => {
                    setError(null);
                    setPage(0);
                    setLoading(true);
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Retry
                </Button>
              }
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Filters Section - Collapsible on mobile */}
          <Collapse in={showFilters} timeout={300}>
            {FiltersSection}
          </Collapse>

          {/* NFTs Table or Mobile Cards */}
          {loading ? (
            renderSkeleton()
          ) : (
            <>
              {!isMobile ? (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <TableContainer 
                    sx={{ 
                      width: '100%', 
                      overflowX: 'auto',
                      '&::-webkit-scrollbar': {
                        height: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.secondary.main, 0.3),
                        }
                      }
                    }}
                  >
                    <Table size={isLargeScreen ? 'medium' : 'small'}>
                      <TableHead sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>NFT</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Rarity</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Value</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Subscription</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Owners</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nfts.length > 0 ? (
                          nfts.map((nft) => (
                            <TableRow 
                              key={nft.NFTID}
                              hover
                              sx={{ 
                                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) },
                                transition: 'background-color 0.2s ease',
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <StyledAvatar 
                                    src={nft.ImageURL} 
                                    variant="rounded"
                                    alt={nft.Title}
                                    rarity={getRarityColor(nft.Rarity)}
                                    sx={{ 
                                      mr: 2,
                                      bgcolor: nft.ImageURL ? undefined : alpha(theme.palette.secondary.main, 0.8),
                                    }}
                                  >
                                    {!nft.ImageURL && (nft.NFTType ? getNFTTypeIcon(nft.NFTType) : <ImageIcon />)}
                                  </StyledAvatar>
                                  <Box>
                                    <Typography 
                                      variant="body1" 
                                      fontWeight="medium"
                                      sx={{ 
                                        '&:hover': { color: theme.palette.secondary.main }, 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}
                                      onClick={() => handleViewNFT(nft.NFTID)}
                                    >
                                      {nft.Title}
                                      {nft.IsLimited && (
                                        <Chip 
                                          label="Limited" 
                                          size="small" 
                                          color="warning" 
                                          variant="outlined"
                                          sx={{ height: 20, fontSize: '0.65rem' }}
                                        />
                                      )}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                      {nft.Description?.substring(0, 60) || 'No description'}
                                      {nft.Description?.length > 60 ? '...' : ''}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  icon={getNFTTypeIcon(nft.NFTType)}
                                  label={nft.NFTType || 'Standard'} 
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={nft.Rarity || 'Common'} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha(getRarityColor(nft.Rarity), 0.1),
                                    color: getRarityColor(nft.Rarity),
                                    borderColor: getRarityColor(nft.Rarity),
                                    fontWeight: 'medium'
                                  }}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <WalletIcon fontSize="small" color="primary" /> 
                                  <Typography variant="body2">{nft.TradeValue || 0} EDU</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {nft.SubscriptionDays > 0 ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <SubscriptionIcon fontSize="small" color="primary" />
                                    <Typography variant="body2">{nft.SubscriptionDays} days</Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">-</Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={nft.IsActive ? 'Active' : 'Inactive'} 
                                  color={nft.IsActive ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={nft.OwnersCount || 0} 
                                  variant="outlined" 
                                  size="small"
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex' }}>
                                  <Tooltip title="View Details">
                                    <IconButton 
                                      size="small" 
                                      color="secondary"
                                      onClick={() => handleViewNFT(nft.NFTID)}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit NFT">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleEditNFT(nft.NFTID)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={nft.IsActive ? "Deactivate" : "Activate"}>
                                    <IconButton 
                                      size="small"
                                      color={nft.IsActive ? "error" : "success"}
                                      onClick={() => handleToggleActive(nft.NFTID, nft.IsActive)}
                                    >
                                      {nft.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                              <Typography variant="h6" color="text.secondary">
                                No NFTs found
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                                {searchTerm || typeFilter || rarityFilter || statusFilter 
                                  ? 'Try clearing filters or creating a new NFT'
                                  : 'Start by creating a new NFT'}
                              </Typography>
                              <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateNFT}
                              >
                                Create NFT
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Pagination */}
                  {nfts.length > 0 && (
                    <TablePagination
                      component="div"
                      count={totalCount}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={pageSize}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 20, 50]}
                      labelRowsPerPage={isTablet ? "Rows:" : "Rows per page:"}
                      sx={{
                        '.MuiTablePagination-selectLabel': {
                          display: { xs: 'none', md: 'block' }
                        },
                        '.MuiTablePagination-displayedRows': {
                          display: { xs: 'none', sm: 'block' }
                        }
                      }}
                    />
                  )}
                </Paper>
              ) : (
                /* Mobile view */
                <Box>
                  {nfts.length > 0 ? (
                    <>
                      {nfts.map((nft) => (
                        <ExpandableCard 
                          key={nft.NFTID} 
                          nft={nft} 
                          onView={handleViewNFT}
                          onEdit={handleEditNFT}
                          onToggleActive={handleToggleActive}
                          onDelete={handleDeleteNFT}
                        />
                      ))}
                      
                      {/* Pagination for mobile */}
                      <TablePagination
                        component="div"
                        count={totalCount}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20]}
                        labelRowsPerPage="Rows:"
                        sx={{ 
                          mt: 2,
                          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            display: { xs: 'none', sm: 'block' }
                          }
                        }}
                      />
                    </>
                  ) : (
                    <Paper
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <NFTIcon sx={{ fontSize: 60, color: alpha(theme.palette.secondary.main, 0.3), mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No NFTs found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                        {searchTerm || typeFilter || rarityFilter || statusFilter 
                          ? 'Try clearing filters or creating a new NFT'
                          : 'Start by creating a new NFT'}
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateNFT}
                        fullWidth
                      >
                        Create NFT
                      </Button>
                    </Paper>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}