"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import NFTImageUploader from '@/components/admin/NFTImageUploader';

// MUI components
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Divider,
  InputAdornment,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  alpha,
  Container,
  Breadcrumbs,
  Stack,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Skeleton
} from '@mui/material';

// MUI Icons
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  ViewCarousel as NFTIcon,
  AccountBalanceWallet as WalletIcon,
  Subscriptions as SubscriptionIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Token as TokenIcon
} from '@mui/icons-material';

// Form Validators
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.title.trim()) errors.title = 'Title is required';
  if (!formData.description.trim()) errors.description = 'Description is required';
  if (!formData.nftType) errors.nftType = 'NFT Type is required';
  if (!formData.rarity) errors.rarity = 'Rarity is required';
  
  if (formData.tradeValue === '' || isNaN(Number(formData.tradeValue)) || Number(formData.tradeValue) < 0) {
    errors.tradeValue = 'Trade value must be a positive number';
  }
  
  if (formData.nftType === 'subscription') {
    if (!formData.subscriptionDays || isNaN(Number(formData.subscriptionDays)) || Number(formData.subscriptionDays) <= 0) {
      errors.subscriptionDays = 'Subscription days must be a positive number';
    }
  }
  
  return errors;
};

export default function EditNFTPage({ params }) {
  const nftId = params.id;
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    nftType: 'reward',
    rarity: 'common',
    tradeValue: '100',
    subscriptionDays: '0',
    isLimited: false,
    isActive: true,
    imageUrl: ''
  });
  
  // UI states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);
  
  // Fetch NFT data
  useEffect(() => {
    const fetchNFTData = async () => {
      if (!nftId) return;
      try {
        setFetchLoading(true);
        setFetchError(null);
        const response = await fetch(`/api/nfts/${nftId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch NFT data');
        }
        
        const data = await response.json();
        
        // Use mock data if needed while backend is in development
        // const data = {
        //   NFTID: id,
        //   Title: "Premium Membership NFT",
        //   Description: "Grants 30 days of premium access to all courses",
        //   NFTType: "subscription",
        //   Rarity: "rare", 
        //   TradeValue: 500,
        //   SubscriptionDays: 30,
        //   IsActive: true,
        //   ImageURL: "/images/nfts/premium-membership.png",
        //   IsLimited: false
        // };
        
        // Format data for form
        setFormData({
          title: data.Title || '',
          description: data.Description || '',
          nftType: data.NFTType?.toLowerCase() || 'reward',
          rarity: data.Rarity?.toLowerCase() || 'common',
          tradeValue: String(data.TradeValue || 0),
          subscriptionDays: String(data.SubscriptionDays || 0),
          isLimited: Boolean(data.IsLimited),
          isActive: Boolean(data.IsActive),
          imageUrl: data.ImageURL || ''
        });
      } catch (error) {
        console.error('Error fetching NFT:', error);
        setFetchError(error.message);
      } finally {
        setFetchLoading(false);
      }
    };
    
    if (user && user.role === 'admin') {
      fetchNFTData();
    }
  }, [nftId, user]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  // Handle switch changes
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Handle image upload success
  const handleImageUpload = (url) => {
    setFormData({
      ...formData,
      imageUrl: url
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    setApiError(null);
    
    try {
      // Map frontend NFT types to backend NFT type IDs
      const getNFTTypeId = (type) => {
        switch(type) {
          case 'subscription': return 2;
          case 'reward': return 3;
          case 'tradable': return 1;
          case 'special': return 4;
          default: return 1;
        }
      };
      
      // Prepare data for backend - correct casing and field names
      const apiData = {
        NFTID: parseInt(nftId), // Make sure we send the NFT ID
        Title: formData.title,
        Description: formData.description,
        NFTTypeID: getNFTTypeId(formData.nftType),
        TradeValue: Number(formData.tradeValue),
        SubscriptionDays: formData.nftType === 'subscription' ? Number(formData.subscriptionDays) : 0,
        ImageURI: formData.imageUrl,
        IsActive: formData.isActive,
        Rarity: formData.rarity,
        IsLimited: formData.isLimited
      };
      
      console.log('Updating NFT data:', apiData);
      
      // Send update request
      const response = await fetch(`/api/admin/nfts/${nftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating NFT:', errorData);
        setApiError(errorData.message || errorData.error || 'Failed to update NFT');
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      console.log('NFT updated successfully:', result);
      
      // Show success message before redirecting
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/nft');
      }, 1500);
    } catch (error) {
      console.error('Error updating NFT:', error);
      setApiError(error.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    router.push('/admin/content/nfts');
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this NFT?')) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      const response = await fetch(`/api/nfts/${nftId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete NFT');
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/admin/content/nfts');
      }, 1000);
      
    } catch (error) {
      console.error('Error deleting NFT:', error);
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get color based on rarity for preview
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
  
  // Loading skeleton
  if (fetchLoading) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
          <Box mb={4}>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={200} height={30} sx={{ mt: 1 }} />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rounded" height={120} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rounded" height={100} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                <Skeleton variant="text" width={120} height={32} sx={{ mb: 3 }} />
                <Skeleton variant="rounded" height={300} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mt: 2 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </MainLayout>
    );
  }
  
  // Error state
  if (fetchError) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8
            }}
          >
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ mb: 3, width: '100%', maxWidth: 500 }}
            >
              {fetchError}
            </Alert>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => router.push('/admin/content/nfts')}
              startIcon={<ArrowBackIcon />}
            >
              Back to NFTs
            </Button>
          </Box>
        </Container>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        {/* Success message */}
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            NFT updated successfully! Redirecting...
          </Alert>
        </Snackbar>
        
        {/* Page Header */}
        <Box mb={4}>
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Typography 
              color="inherit" 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { color: theme.palette.secondary.main },
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => router.push('/admin/dashboard')}
            >
              Dashboard
            </Typography>
            <Typography 
              color="inherit" 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { color: theme.palette.secondary.main },
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => router.push('/admin/content/nfts')}
            >
              NFT Management
            </Typography>
            <Typography color="text.primary">Edit NFT</Typography>
          </Breadcrumbs>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EditIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="700"
                sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.light} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Edit NFT
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                startIcon={<DeleteIcon />}
                sx={{ borderRadius: 2 }}
                disabled={loading}
              >
                Delete NFT
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 2 }}
              >
                Back to NFTs
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {apiError && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  variant="filled"
                  action={
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={() => setApiError(null)}
                    >
                      Dismiss
                    </Button>
                  }
                >
                  {apiError}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <Typography variant="h6" mb={3} fontWeight={600}>NFT Details</Typography>
                
                <Grid container spacing={2}>
                  {/* NFT Title */}
                  <Grid item xs={12}>
                    <TextField
                      name="title"
                      label="NFT Title"
                      value={formData.title}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      required
                      error={!!errors.title}
                      helperText={errors.title}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NFTIcon color="secondary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  {/* NFT Description */}
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Description"
                      value={formData.description}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      required
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description}
                    />
                  </Grid>
                  
                  {/* NFT Type & Rarity */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.nftType}>
                      <InputLabel id="nft-type-label">NFT Type</InputLabel>
                      <Select
                        labelId="nft-type-label"
                        name="nftType"
                        value={formData.nftType}
                        onChange={handleInputChange}
                        label="NFT Type"
                      >
                        <MenuItem value="subscription">Subscription</MenuItem>
                        <MenuItem value="reward">Reward</MenuItem>
                        <MenuItem value="tradable">Tradable</MenuItem>
                        <MenuItem value="special">Special</MenuItem>
                      </Select>
                      {errors.nftType && (
                        <Typography variant="caption" color="error">
                          {errors.nftType}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.rarity}>
                      <InputLabel id="rarity-label">Rarity Level</InputLabel>
                      <Select
                        labelId="rarity-label"
                        name="rarity"
                        value={formData.rarity}
                        onChange={handleInputChange}
                        label="Rarity Level"
                      >
                        <MenuItem value="common">Common</MenuItem>
                        <MenuItem value="uncommon">Uncommon</MenuItem>
                        <MenuItem value="rare">Rare</MenuItem>
                        <MenuItem value="epic">Epic</MenuItem>
                        <MenuItem value="legendary">Legendary</MenuItem>
                      </Select>
                      {errors.rarity && (
                        <Typography variant="caption" color="error">
                          {errors.rarity}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {/* Trade Value & Subscription Days */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="tradeValue"
                      label="Trade Value (EDU)"
                      value={formData.tradeValue}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      type="number"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WalletIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      error={!!errors.tradeValue}
                      helperText={errors.tradeValue}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="subscriptionDays"
                      label="Subscription Days"
                      value={formData.subscriptionDays}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubscriptionIcon color={formData.nftType === 'subscription' ? 'primary' : 'disabled'} />
                          </InputAdornment>
                        ),
                      }}
                      disabled={formData.nftType !== 'subscription'}
                      error={!!errors.subscriptionDays}
                      helperText={errors.subscriptionDays || (formData.nftType !== 'subscription' ? 'Only for subscription NFTs' : '')}
                    />
                  </Grid>
                  
                  {/* Switches */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isLimited}
                            onChange={handleSwitchChange}
                            name="isLimited"
                            color="warning"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" mr={1}>Limited Edition</Typography>
                            <Tooltip title="Marks this NFT as a limited edition, which can increase its perceived value">
                              <HelpIcon fontSize="small" color="disabled" />
                            </Tooltip>
                          </Box>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleSwitchChange}
                            name="isActive"
                            color="success"
                          />
                        }
                        label="Active"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  {/* Image Upload Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      NFT Image
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {formData.imageUrl && (
                        <Box 
                          sx={{ 
                            mb: 2, 
                            p: 1, 
                            border: '1px solid', 
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          <Typography variant="caption" display="block" mb={1}>
                            Current Image:
                          </Typography>
                          <Box 
                            component="img" 
                            src={formData.imageUrl} 
                            alt={formData.title}
                            sx={{ 
                              maxWidth: '100%', 
                              maxHeight: '150px',
                              objectFit: 'contain',
                              borderRadius: 1
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                    <NFTImageUploader onUploadSuccess={handleImageUpload} />
                  </Grid>
                  
                  {/* Form Actions */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mt: 3,
                      flexWrap: 'wrap',
                      gap: 2
                    }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        disabled={loading}
                        startIcon={<ArrowBackIcon />}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          {/* Preview Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                position: 'sticky',
                top: 90,
              }}
            >
              <Typography 
                variant="h6" 
                mb={3} 
                fontWeight={700}
                sx={{
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <NFTIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                NFT Preview
              </Typography>
              
              <Card 
                sx={{ 
                  maxWidth: '100%',
                  background: theme => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: theme => `2px solid ${getRarityColor(formData.rarity)}`,
                  borderRadius: 3,
                  boxShadow: theme => `0 12px 40px ${alpha(getRarityColor(formData.rarity), 0.3)}, 0 0 0 1px ${alpha(getRarityColor(formData.rarity), 0.1)}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: theme => `linear-gradient(90deg, ${getRarityColor(formData.rarity)}, ${alpha(getRarityColor(formData.rarity), 0.6)})`,
                    zIndex: 1
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: theme => `0 20px 60px ${alpha(getRarityColor(formData.rarity), 0.4)}, 0 0 0 1px ${alpha(getRarityColor(formData.rarity), 0.2)}`,
                  }
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="280"
                    image={formData.imageUrl || `https://via.placeholder.com/400x400/${theme.palette.mode === 'dark' ? '1a1a1a' : 'f5f5f5'}/${theme.palette.primary.main.replace('#', '')}?text=${encodeURIComponent(formData.title || 'NFT')}`}
                    alt={formData.title}
                    sx={{
                      objectFit: 'cover',
                      background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                      transition: 'transform 0.4s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  
                  {/* Rarity Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: theme => `linear-gradient(135deg, ${getRarityColor(formData.rarity)}, ${alpha(getRarityColor(formData.rarity), 0.8)})`,
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: theme => `0 4px 12px ${alpha(getRarityColor(formData.rarity), 0.4)}`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {formData.rarity || 'Common'}
                  </Box>
                  
                  {/* Limited Edition Badge */}
                  {formData.isLimited && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: theme => `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: theme => `0 4px 12px ${alpha(theme.palette.warning.main, 0.4)}`,
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      Limited
                    </Box>
                  )}
                </Box>
                
                <CardContent sx={{ p: 3 }}>
                  {/* Title and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      fontWeight={700}
                      sx={{ 
                        maxWidth: '70%',
                        background: theme => `linear-gradient(45deg, ${theme.palette.text.primary}, ${alpha(theme.palette.primary.main, 0.8)})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1.2
                      }}
                    >
                      {formData.title || 'NFT Title'}
                    </Typography>
                    
                    <Chip 
                      label={formData.isActive ? 'Active' : 'Inactive'} 
                      color={formData.isActive ? 'success' : 'error'}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                  
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.5,
                      fontStyle: !formData.description ? 'italic' : 'normal'
                    }}
                  >
                    {formData.description || 'NFT description will appear here...'}
                  </Typography>
                  
                  {/* Price and Type */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WalletIcon 
                        sx={{ 
                          color: theme.palette.primary.main, 
                          mr: 1,
                          fontSize: '1.2rem'
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        fontWeight={700}
                        sx={{
                          background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {formData.tradeValue || 0} EDU
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={formData.nftType || 'Type'} 
                      size="small"
                      sx={{
                        background: theme => `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                        color: 'white',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>
                  
                  {/* Subscription Info */}
                  {formData.nftType === 'subscription' && Number(formData.subscriptionDays) > 0 && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      borderRadius: 2,
                      background: theme => `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: theme => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      mb: 2
                    }}>
                      <SubscriptionIcon 
                        sx={{ 
                          color: theme.palette.info.main, 
                          mr: 1,
                          fontSize: '1.1rem'
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color="info.main"
                      >
                        {formData.subscriptionDays} days premium access
                      </Typography>
                    </Box>
                  )}
                  
                  {/* NFT Features */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    pt: 1
                  }}>
                    <Chip 
                      icon={<TokenIcon fontSize="small" />}
                      label="Digital Asset" 
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          background: theme => alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    />
                    
                    {formData.nftType === 'tradable' && (
                      <Chip 
                        label="Tradable" 
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: theme => alpha(theme.palette.success.main, 0.3),
                          color: theme.palette.success.main,
                          '&:hover': {
                            background: theme => alpha(theme.palette.success.main, 0.1)
                          }
                        }}
                      />
                    )}
                    
                    {formData.nftType === 'special' && (
                      <Chip 
                        label="Special Edition" 
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: theme => alpha(theme.palette.warning.main, 0.3),
                          color: theme.palette.warning.main,
                          '&:hover': {
                            background: theme => alpha(theme.palette.warning.main, 0.1)
                          }
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
              
              {/* Preview Notes */}
              <Box sx={{ 
                mt: 3, 
                p: 3, 
                borderRadius: 2,
                background: theme => `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                border: theme => `1px solid ${alpha(theme.palette.info.main, 0.1)}`
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 600,
                    color: theme.palette.info.main,
                    mb: 1
                  }}
                >
                  <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                  Preview Notes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  This preview shows how your NFT will appear to users in the marketplace. Ensure all details are accurate before saving.
                </Typography>
                
                {!formData.imageUrl && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        color: theme.palette.warning.main
                      }
                    }}
                  >
                    Upload an image to see the complete NFT preview
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
}