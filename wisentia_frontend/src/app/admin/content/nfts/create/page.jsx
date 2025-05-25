// src/app/admin/nft/create/page.jsx
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
} from '@mui/material';
import Grid from '@mui/material/Grid';

// MUI Icons
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  ViewCarousel as NFTIcon,
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  Subscriptions as SubscriptionIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
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

export default function CreateNFTPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  // Default initial form state
  const defaultFormData = {
    title: '',
    description: '',
    imageUrl: 'https://via.placeholder.com/300/0a192f/64ffda?text=NFT', // Default image path
    nftTypeId: '',
    nftType: '',
    tradeValue: 0,
    subscriptionDays: '',  // Changed from null to empty string to prevent React warnings
    rarity: 'common',
    isActive: true,
    isLimited: false,
    attributes: []
  };
  
  // Form state
  const [formData, setFormData] = useState(defaultFormData);
  
  // UI states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);
  
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
    console.log('Image upload success, received URL:', url);
    
    // Check if URL is valid
    if (!url) {
      console.error('Received empty image URL from uploader');
      setApiError('Failed to get uploaded image URL');
      return;
    }
    
    if (typeof url === 'object' && url.url) {
      // Handle case where we get a response object with url property
      url = url.url;
    }
    
    setFormData(prevData => {
      console.log('Updating form data with image URL:', url);
      return {
        ...prevData,
        imageUrl: url
      };
    });
    
    // Clear any existing image errors
    if (errors.imageUrl) {
      setErrors({
        ...errors,
        imageUrl: undefined
      });
    }
  };
  
  // Modified validate form to check for imageUrl
  const validateFormWithImage = (data) => {
    const baseErrors = validateForm(data);
    
    // Check if we have an image URL and it's not the default placeholder
    if (!data.imageUrl || data.imageUrl === 'https://via.placeholder.com/300/0a192f/64ffda?text=NFT') {
      baseErrors.imageUrl = 'Please upload an image for the NFT';
    }
    
    return baseErrors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form including image
    const formErrors = validateFormWithImage(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      
      // Show more specific error message for image
      if (formErrors.imageUrl) {
        setApiError(formErrors.imageUrl);
      }
      
      return;
    }
    
    setLoading(true);
    setApiError(null);
    
    try {
      // Map frontend NFT types to backend NFT type IDs
      const getNFTTypeId = (type) => {
        switch(type) {
          case 'subscription': return 2; // 'subscription' in NFTTypes table
          case 'reward': return 3; // 'quest_reward' in NFTTypes table
          case 'tradable': return 1; // Assuming 'achievement' is tradable
          case 'special': return 4; // 'course_completion' in NFTTypes table
          default: return 1;
        }
      };
      
      // Make sure we don't send the placeholder as imageUri
      const imageUri = formData.imageUrl === 'https://via.placeholder.com/300/0a192f/64ffda?text=NFT' ? '' : formData.imageUrl;
      
      // Prepare data for API - convert to format expected by backend
      const apiData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        nftTypeId: getNFTTypeId(formData.nftType),
        tradeValue: parseInt(formData.tradeValue) || 0,
        subscriptionDays: formData.nftType === 'subscription' ? parseInt(formData.subscriptionDays) || 0 : 0,
        imageUri: imageUri,  // Use 'imageUri' as the field name expected by our API
        isActive: formData.isActive,
        rarity: formData.rarity,
        isLimited: formData.isLimited
      };
      
      console.log('Sending NFT data to API:', apiData);
      
      if (!imageUri) {
        setApiError('Image is required. Please upload an image for the NFT.');
        setLoading(false);
        return;
      }
      
      // Send creation request to the API
      const response = await fetch('/api/admin/nfts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      // Try to parse the response as JSON, but handle cases where it might not be valid JSON
      let jsonResponse;
      try {
        jsonResponse = await response.json();
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        setApiError('Invalid response format from server');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        let errorMessage = 'Failed to create NFT';
        
        if (jsonResponse && jsonResponse.error) {
          errorMessage = jsonResponse.error;
        } else if (jsonResponse && jsonResponse.message) {
          errorMessage = jsonResponse.message;
        } else if (typeof jsonResponse === 'string') {
          errorMessage = jsonResponse;
        }
        
        console.error('Error creating NFT:', jsonResponse);
        setApiError(errorMessage);
        setLoading(false);
        return;
      }
      
      console.log('NFT created successfully:', jsonResponse);
      
      // Show success message and redirect back to NFT list
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/content/nfts');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      setApiError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    router.push('/admin/content/nfts');
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
            NFT created successfully! Redirecting...
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
            <Typography color="text.primary">Create NFT</Typography>
          </Breadcrumbs>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
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
              Create New NFT
            </Typography>
            
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
        
        {/* Main Content */}
        <Grid container spacing={4}>
          <Grid item lg={8} md={8} sm={12} xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              {apiError && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 4 }}
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
                
                <Grid container spacing={3}>
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
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      flexWrap: 'wrap', 
                      gap: 3, 
                      mt: 2 
                    }}>
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
                  
                  {/* Image Upload Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      NFT Image
                    </Typography>
                    <Box sx={{ 
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 3,
                      backgroundColor: alpha(theme.palette.background.paper, 0.6)
                    }}>
                      <NFTImageUploader onUploadSuccess={handleImageUpload} />
                    </Box>
                  </Grid>
                  
                  {/* Form Actions */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
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
                        size="large"
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                        size="large"
                        sx={{ px: 4 }}
                      >
                        {loading ? 'Creating...' : 'Create NFT'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
          
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                position: 'sticky',
                top: 90,
              }}
            >
              <Typography variant="h6" mb={3} fontWeight={600}>
                NFT Preview
              </Typography>
              
              <Card 
                sx={{ 
                  width: '100%',
                  boxShadow: `0 6px 16px ${alpha(getRarityColor(formData.rarity), 0.4)}`,
                  borderRadius: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 8px 24px ${alpha(getRarityColor(formData.rarity), 0.5)}`,
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="260"
                  image={formData.imageUrl || 'https://via.placeholder.com/300/0a192f/64ffda?text=NFT'}
                  alt={formData.title}
                  sx={{
                    objectFit: 'contain',
                    bgcolor: formData.imageUrl ? 'background.paper' : alpha(theme.palette.secondary.main, 0.1),
                    padding: formData.imageUrl ? 0 : 2
                  }}
                />
                
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div" fontWeight={600} noWrap sx={{ maxWidth: '70%' }}>
                      {formData.title || 'NFT Title'}
                    </Typography>
                    
                    <Chip 
                      label={formData.rarity || 'Common'} 
                      size="small"
                      sx={{ 
                        bgcolor: alpha(getRarityColor(formData.rarity), 0.1),
                        color: getRarityColor(formData.rarity),
                        borderColor: getRarityColor(formData.rarity),
                        fontWeight: 'medium'
                      }}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: '3em'
                  }}>
                    {formData.description || 'NFT description will appear here.'}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip 
                      icon={<WalletIcon fontSize="small" />}
                      label={`${formData.tradeValue || 0} EDU`} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    
                    <Chip 
                      label={formData.nftType || 'Type'} 
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    
                    {formData.isLimited && (
                      <Chip 
                        label="Limited" 
                        size="small" 
                        color="warning" 
                      />
                    )}
                  </Stack>
                  
                  {formData.nftType === 'subscription' && Number(formData.subscriptionDays) > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <SubscriptionIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {formData.subscriptionDays} days subscription
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip 
                      label={formData.isActive ? 'Active' : 'Inactive'} 
                      color={formData.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
              
              <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.background.default, 0.7), borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" sx={{ mr: 1, color: theme.palette.warning.main }} />
                  Preview Notes
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  This is how your NFT will appear to users. Make sure the image and details accurately represent what users will receive.
                </Typography>
                
                {!formData.imageUrl && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Please upload an image for a complete preview.
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