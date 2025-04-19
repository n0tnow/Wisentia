'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Fade,
  Zoom,
  Grow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { styled } from '@mui/system';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// Custom styled components
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

const GradientCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #4527a0 0%, #3f51b5 50%, #2196f3 100%)',
  color: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 8px 16px rgba(69, 39, 160, 0.2)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(69, 39, 160, 0.3)',
  },
}));

const GlowingCircle = styled(Box)(() => ({
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

const BackgroundParticle = styled(Box)(({ delay = 0 }) => ({
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

const ProfileAvatarWrapper = styled(Box)(() => ({
  position: 'relative',
  width: 150,
  height: 150,
  margin: '0 auto',
  borderRadius: '50%',
  overflow: 'hidden',
  boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  border: '4px solid white',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
    '& .avatar-overlay': {
      opacity: 1,
    }
  }
}));

export default function SettingsPage() {
  const theme = useTheme();
  const { user, isAuthenticated, updateUser, getProfile } = useAuth();
  
  // State variables
  const [mounted, setMounted] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    walletAddress: '',
    profileImage: '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Show/hide password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // App preferences state
  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    language: 'en',
  });
  
  // Delete account confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // For upload profile image dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Hydration safety
  useEffect(() => {
    setMounted(true);
    
    // Load user profile data
    if (isAuthenticated()) {
      loadProfileData();
    }
    
    // Initialize preferences from localStorage if available
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
  }, []);
  
  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // In a real app, fetch the latest profile data from the server
      const profileResult = await getProfile();
      
      if (profileResult && profileResult.success) {
        const userData = profileResult.profile;
        
        setProfileData({
          username: userData.username || '',
          email: userData.email || '',
          walletAddress: userData.walletAddress || '',
          profileImage: userData.profileImage || '',
        });
        
        // Set theme preference
        if (userData.themePreference) {
          setPreferences(prev => ({
            ...prev,
            darkMode: userData.themePreference === 'dark'
          }));
        }
      } else {
        // If API call fails, try to use the user data from context
        if (user) {
          setProfileData({
            username: user.username || '',
            email: user.email || '',
            walletAddress: user.walletAddress || '',
            profileImage: user.profileImage || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setErrorMessage('Failed to load profile data. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        [name]: value
      };
      
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      
      return newPreferences;
    });
  };
  
  const validateProfileForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!profileData.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }
    
    if (!profileData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileData.email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }
    
    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
    
    return isValid;
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
    
    return isValid;
  };
  
  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    
    setLoading(true);
    
    try {
      // Here would be an API call to update the profile
      // For now, we're just simulating a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user context (if needed)
      updateUser({
        ...user,
        username: profileData.username,
        email: profileData.email,
        walletAddress: profileData.walletAddress
      });
      
      setSuccessMessage('Profile updated successfully!');
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setLoading(true);
    
    try {
      // Here would be an API call to change the password
      // For now, we're just simulating a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Password changed successfully!');
      setShowSuccessAlert(true);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      setErrorMessage('Failed to change password. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      // Here would be an API call to delete the account
      // For now, we're just simulating a successful deletion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDeleteDialogOpen(false);
      
      // Would typically log the user out and redirect to home page
      setSuccessMessage('Account deleted successfully. You will be redirected in a few seconds.');
      setShowSuccessAlert(true);
      
      setTimeout(() => {
        // Redirect to home page or login page
        window.location.href = '/'; 
      }, 3000);
      
    } catch (error) {
      console.error('Failed to delete account:', error);
      setErrorMessage('Failed to delete account. Please try again.');
      setShowErrorAlert(true);
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };
  
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedImage(null);
    setImagePreview('');
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUploadImage = async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    
    try {
      // Here would be an API call to upload the image
      // For now, we're just simulating a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProfileData(prev => ({
        ...prev,
        profileImage: imagePreview, // In a real app, this would be the URL returned from the server
      }));
      
      setSuccessMessage('Profile picture updated successfully!');
      setShowSuccessAlert(true);
      setUploadDialogOpen(false);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setErrorMessage('Failed to upload image. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Prevent hydration issues by only rendering client-side
  if (typeof window === 'undefined' || !mounted) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Static placeholder for server rendering */}
          </Box>
        </Container>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Fade in={true} timeout={1000}>
          <Box>
            {/* Page header with title and description */}
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
                Account Settings
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Manage your profile, security, and preferences
              </Typography>
            </Box>
            
            {/* Success and error alerts */}
            <Snackbar
              open={showSuccessAlert}
              autoHideDuration={6000}
              onClose={() => setShowSuccessAlert(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                icon={<CheckCircleIcon fontSize="inherit" />}
                severity="success"
                variant="filled"
                onClose={() => setShowSuccessAlert(false)}
                sx={{ 
                  borderRadius: 3,
                  boxShadow: theme.shadows[8],
                  width: '100%'
                }}
              >
                {successMessage}
              </Alert>
            </Snackbar>
            
            <Snackbar
              open={showErrorAlert}
              autoHideDuration={6000}
              onClose={() => setShowErrorAlert(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                icon={<WarningIcon fontSize="inherit" />}
                severity="error"
                variant="filled"
                onClose={() => setShowErrorAlert(false)}
                sx={{ 
                  borderRadius: 3,
                  boxShadow: theme.shadows[8],
                  width: '100%'
                }}
              >
                {errorMessage}
              </Alert>
            </Snackbar>
            
            {/* Settings tabs and content */}
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                TabIndicatorProps={{
                  style: {
                    background: 'linear-gradient(90deg, #4527a0 0%, #3f51b5 50%, #2196f3 100%)',
                    height: 3
                  }
                }}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <StyledTab 
                  icon={<AccountCircleIcon sx={{ mb: 0.5 }} />} 
                  label="Profile" 
                  iconPosition="start"
                />
                <StyledTab 
                  icon={<LockIcon sx={{ mb: 0.5 }} />} 
                  label="Password & Security" 
                  iconPosition="start"
                />
                <StyledTab 
                  icon={<PaletteIcon sx={{ mb: 0.5 }} />} 
                  label="Appearance" 
                  iconPosition="start"
                />
                <StyledTab 
                  icon={<NotificationsIcon sx={{ mb: 0.5 }} />} 
                  label="Notifications" 
                  iconPosition="start"
                />
                <StyledTab 
                  icon={<LanguageIcon sx={{ mb: 0.5 }} />} 
                  label="Language" 
                  iconPosition="start"
                />
                <StyledTab 
                  icon={<SecurityIcon sx={{ mb: 0.5 }} />} 
                  label="Account" 
                  iconPosition="start"
                />
              </Tabs>
              
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {/* Profile Tab */}
                {tabValue === 0 && (
                  <Fade in={tabValue === 0} timeout={500}>
                    <Box>
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                          <Zoom in={true} timeout={800}>
                            <GradientCard>
                              <CardContent sx={{ position: 'relative', p: 4, zIndex: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <GlowingCircle sx={{ width: 300, height: 300, top: -100, right: -100 }} />
                                <BackgroundParticle sx={{ top: '20%', right: '40%' }} delay={0} />
                                <BackgroundParticle sx={{ top: '70%', right: '20%' }} delay={1} />
                                <BackgroundParticle sx={{ top: '40%', right: '70%' }} delay={2} />
                                
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                  <ProfileAvatarWrapper>
                                    <Avatar 
                                      src={profileData.profileImage || undefined}
                                      alt={profileData.username || "User"}
                                      sx={{ 
                                        width: '100%', 
                                        height: '100%',
                                        fontSize: 72
                                      }}
                                    >
                                      {!profileData.profileImage && (profileData.username ? profileData.username[0].toUpperCase() : "U")}
                                    </Avatar>
                                    <Box 
                                      className="avatar-overlay"
                                      sx={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease'
                                      }}
                                    >
                                      <IconButton 
                                        onClick={handleOpenUploadDialog}
                                        sx={{ 
                                          color: 'white',
                                          backgroundColor: 'rgba(0,0,0,0.2)',
                                          '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.4)',
                                          }
                                        }}
                                      >
                                        <PhotoCameraIcon />
                                      </IconButton>
                                    </Box>
                                  </ProfileAvatarWrapper>
                                  
                                  <Typography variant="h5" sx={{ mt: 3, fontWeight: 600 }}>
                                    {profileData.username || "Your Name"}
                                  </Typography>
                                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                                    {profileData.email || "email@example.com"}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                                  <AnimatedButton
                                    variant="contained"
                                    color="inherit"
                                    size="large"
                                    onClick={handleOpenUploadDialog}
                                    startIcon={<PhotoCameraIcon />}
                                    sx={{ 
                                      bgcolor: 'rgba(255,255,255,0.2)', 
                                      color: 'white',
                                      px: 3,
                                      py: 1.2,
                                      fontWeight: 600,
                                      '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.3)',
                                      },
                                    }}
                                  >
                                    Change Photo
                                  </AnimatedButton>
                                </Box>
                              </CardContent>
                            </GradientCard>
                          </Zoom>
                        </Grid>
                        
                        <Grid item xs={12} md={8}>
                          <Grow in={true} timeout={800} style={{ transformOrigin: '0 0 0' }}>
                            <Card sx={{ 
                              borderRadius: 4, 
                              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                              overflow: 'hidden',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                  Personal Information
                                </Typography>
                                
                                <Grid container spacing={3}>
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Username"
                                      name="username"
                                      value={profileData.username}
                                      onChange={handleProfileChange}
                                      variant="outlined"
                                      error={!!errors.username}
                                      helperText={errors.username}
                                      InputProps={{
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <AccountCircleIcon color="action" />
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  </Grid>
                                  
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Email Address"
                                      name="email"
                                      type="email"
                                      value={profileData.email}
                                      onChange={handleProfileChange}
                                      variant="outlined"
                                      error={!!errors.email}
                                      helperText={errors.email}
                                    />
                                  </Grid>
                                  
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Wallet Address"
                                      name="walletAddress"
                                      value={profileData.walletAddress}
                                      onChange={handleProfileChange}
                                      variant="outlined"
                                      placeholder="Connect your wallet to update this field"
                                      disabled={!profileData.walletAddress}
                                      helperText={!profileData.walletAddress ? "Connect your wallet from the Wallet page first" : ""}
                                    />
                                  </Grid>
                                </Grid>
                                
                                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                  <AnimatedButton
                                    variant="contained"
                                    color="primary"
                                    onClick={handleUpdateProfile}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EditIcon />}
                                    sx={{ 
                                      px: 4,
                                      py: 1.2,
                                      borderRadius: 2,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                  </AnimatedButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grow>
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                )}
                
                {/* Password & Security Tab */}
                {tabValue === 1 && (
                  <Fade in={tabValue === 1} timeout={500}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Change Password
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Current Password"
                            name="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            variant="outlined"
                            error={!!errors.currentPassword}
                            helperText={errors.currentPassword}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    edge="end"
                                  >
                                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            variant="outlined"
                            error={!!errors.newPassword}
                            helperText={errors.newPassword}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    edge="end"
                                  >
                                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            variant="outlined"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                  >
                                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <AnimatedButton
                          variant="contained"
                          color="primary"
                          onClick={handleChangePassword}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                          sx={{ 
                            px: 4,
                            py: 1.2,
                            borderRadius: 2,
                            fontWeight: 600,
                          }}
                        >
                          {loading ? 'Updating...' : 'Change Password'}
                        </AnimatedButton>
                      </Box>
                      
                      <Divider sx={{ my: 4 }} />
                      
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Two-Factor Authentication
                      </Typography>
                      
                      <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Enable Two-Factor Authentication
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Add an extra layer of security to your account
                              </Typography>
                            </Box>
                            <Switch 
                              color="primary"
                              // This would typically connect to your backend
                              disabled={true}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                        Two-factor authentication will be available soon. Stay tuned for updates!
                      </Typography>
                    </Box>
                  </Fade>
                )}
                
                {/* Appearance Tab */}
                {tabValue === 2 && (
                  <Fade in={tabValue === 2} timeout={500}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Theme Settings
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Card 
                            sx={{ 
                              borderRadius: 3,
                              border: preferences.darkMode ? 'none' : '3px solid #3f51b5',
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                              },
                            }}
                            onClick={() => handlePreferenceChange('darkMode', false)}
                          >
                            <CardContent sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ height: 120, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ height: '30%', bgcolor: '#3f51b5', p: 1 }}>
                                  <Box sx={{ width: '50%', height: 10, bgcolor: '#e0e0e0', borderRadius: 1 }} />
                                </Box>
                                <Box sx={{ p: 1, flexGrow: 1 }}>
                                  <Box sx={{ width: '80%', height: 10, bgcolor: '#e0e0e0', borderRadius: 1, mb: 1 }} />
                                  <Box sx={{ width: '60%', height: 10, bgcolor: '#e0e0e0', borderRadius: 1 }} />
                                </Box>
                              </Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Light Mode
                              </Typography>
                              {!preferences.darkMode && (
                                <Zoom in={!preferences.darkMode} timeout={300}>
                                  <Box sx={{ 
                                    display: 'inline-block', 
                                    bgcolor: '#4caf50', 
                                    color: 'white', 
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    mt: 1
                                  }}>
                                    Active
                                  </Box>
                                </Zoom>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                          <Card 
                            sx={{ 
                              borderRadius: 3,
                              border: preferences.darkMode ? '3px solid #3f51b5' : 'none',
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                              },
                            }}
                            onClick={() => handlePreferenceChange('darkMode', true)}
                          >
                            <CardContent sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ height: 120, bgcolor: '#1e1e1e', borderRadius: 2, mb: 2, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ height: '30%', bgcolor: '#3f51b5', p: 1 }}>
                                  <Box sx={{ width: '50%', height: 10, bgcolor: '#666', borderRadius: 1 }} />
                                </Box>
                                <Box sx={{ p: 1, flexGrow: 1 }}>
                                  <Box sx={{ width: '80%', height: 10, bgcolor: '#666', borderRadius: 1, mb: 1 }} />
                                  <Box sx={{ width: '60%', height: 10, bgcolor: '#666', borderRadius: 1 }} />
                                </Box>
                              </Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Dark Mode
                              </Typography>
                              {preferences.darkMode && (
                                <Zoom in={preferences.darkMode} timeout={300}>
                                  <Box sx={{ 
                                    display: 'inline-block', 
                                    bgcolor: '#4caf50', 
                                    color: 'white', 
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    mt: 1
                                  }}>
                                    Active
                                  </Box>
                                </Zoom>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                          <Card 
                            sx={{ 
                              borderRadius: 3,
                              border: 'none',
                              opacity: 0.7,
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                              },
                            }}
                          >
                            <CardContent sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <Box sx={{ 
                                height: 120, 
                                background: 'linear-gradient(120deg, #1e1e1e 0%, #1e1e1e 50%, #f5f5f5 50%, #f5f5f5 100%)', 
                                borderRadius: 2, 
                                mb: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative'
                              }}>
                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '30%', bgcolor: '#3f51b5', p: 1, opacity: 0.8 }}>
                                  <Box sx={{ width: '50%', height: 10, bgcolor: '#e0e0e0', borderRadius: 1 }} />
                                </Box>
                              </Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                System Default
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Coming soon
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                        Your theme preference will be saved for your next visit.
                      </Typography>
                    </Box>
                  </Fade>
                )}
                
                {/* Notifications Tab */}
                {tabValue === 3 && (
                  <Fade in={tabValue === 3} timeout={500}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Notification Preferences
                      </Typography>
                      
                      <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={preferences.emailNotifications}
                                  onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    Email Notifications
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Receive updates on new courses, quizzes, and important announcements
                                  </Typography>
                                </Box>
                              }
                              sx={{ width: '100%', ml: 0, mr: 0 }}
                            />
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={preferences.pushNotifications}
                                  onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    Push Notifications
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Get real-time alerts in your browser when there's activity related to your account
                                  </Typography>
                                </Box>
                              }
                              sx={{ width: '100%', ml: 0, mr: 0 }}
                            />
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box>
                            <FormControlLabel
                              control={
                                <Switch 
                                  checked={preferences.marketingEmails}
                                  onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    Marketing Emails
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Receive updates about new features, special offers, and promotions
                                  </Typography>
                                </Box>
                              }
                              sx={{ width: '100%', ml: 0, mr: 0 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        You can change your notification preferences at any time.
                      </Typography>
                    </Box>
                  </Fade>
                )}
                
                {/* Language Tab */}
                {tabValue === 4 && (
                  <Fade in={tabValue === 4} timeout={500}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Language Settings
                      </Typography>
                      
                      <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Select your preferred language
                          </Typography>
                          
                          <Grid container spacing={2}>
                            {[
                              { code: 'en', name: 'English', flag: '🇺🇸' },
                              { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                              { code: 'fr', name: 'French', flag: '🇫🇷' },
                              { code: 'de', name: 'German', flag: '🇩🇪' },
                              { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
                              { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
                            ].map(lang => (
                              <Grid item xs={12} sm={6} md={4} key={lang.code}>
                                <Card 
                                  sx={{ 
                                    p: 2, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    height: '100%',
                                    bgcolor: preferences.language === lang.code ? 'primary.50' : 'background.paper',
                                    border: preferences.language === lang.code ? '2px solid #3f51b5' : '2px solid transparent',
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: preferences.language === lang.code ? 'primary.100' : 'action.hover',
                                    }
                                  }}
                                  onClick={() => handlePreferenceChange('language', lang.code)}
                                >
                                  <Typography variant="h5" sx={{ mr: 2 }}>
                                    {lang.flag}
                                  </Typography>
                                  <Typography variant="body1">
                                    {lang.name}
                                  </Typography>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                      
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2">
                          Currently, the platform is primarily available in English, with select content in other languages. 
                          We're actively working on translations for all supported languages.
                        </Typography>
                      </Alert>
                    </Box>
                  </Fade>
                )}
                
                {/* Account Tab */}
                {tabValue === 5 && (
                  <Fade in={tabValue === 5} timeout={500}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Account Management
                      </Typography>
                      
                      <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                            Export Your Data
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Download a copy of your personal data including your profile information, courses, and achievements.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            sx={{ borderRadius: 2 }}
                          >
                            Request Data Export
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ mb: 3, bgcolor: '#fafafa', borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight={600} color="error" sx={{ mb: 1 }}>
                            Delete Account
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            This will permanently delete your account and all associated data, including your courses, quizzes, and achievements. This action cannot be undone.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{ borderRadius: 2 }}
                          >
                            Delete Account
                          </Button>
                        </CardContent>
                      </Card>
                    </Box>
                  </Fade>
                )}
              </Box>
            </Paper>
            
            {/* Profile Picture Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
              <DialogTitle>Change Profile Picture</DialogTitle>
              <DialogContent>
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  {imagePreview ? (
                    <Avatar 
                      src={imagePreview}
                      alt="Preview" 
                      sx={{ 
                        width: 200, 
                        height: 200, 
                        margin: '0 auto',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        width: 200, 
                        height: 200, 
                        margin: '0 auto',
                        border: '2px dashed #ccc',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        bgcolor: '#f5f5f5'
                      }}
                    >
                      <PhotoCameraIcon sx={{ fontSize: 40, color: '#aaa', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No image selected
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{ borderRadius: 2, py: 1.2 }}
                  >
                    Select Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    Supports JPG, PNG, and GIF. Max file size: 5MB.
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleCloseUploadDialog} color="inherit">
                  Cancel
                </Button>
                <Button 
                  onClick={handleUploadImage} 
                  color="primary" 
                  variant="contained"
                  disabled={!selectedImage || loading}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Delete Account Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm">
              <DialogTitle sx={{ color: 'error.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  Delete Account
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  Are you sure you want to delete your account? This action cannot be undone and will result in the permanent loss of:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body1">All your profile information</Typography>
                  <Typography component="li" variant="body1">Course progress and completions</Typography>
                  <Typography component="li" variant="body1">Earned NFTs and achievements</Typography>
                  <Typography component="li" variant="body1">Community contributions</Typography>
                </Box>
                <Typography variant="body1" paragraph sx={{ mt: 2, fontWeight: 500 }}>
                  Please type "{profileData.username}" to confirm:
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={`Type "${profileData.username}" here`}
                  // In a real app, you would validate this matches the username
                />
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button 
                  onClick={() => setDeleteDialogOpen(false)} 
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteAccount} 
                  color="error" 
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? 'Processing...' : 'Delete Account'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Fade>
      </Container>
    </MainLayout>
  );
}