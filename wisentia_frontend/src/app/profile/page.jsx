'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme as useCustomTheme } from '@/contexts/ThemeContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Divider,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  InputAdornment,
  OutlinedInput,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  CameraAlt as CameraIcon,
  School as SchoolIcon,
  PlayCircleFilled as PlayCircleIcon,
  EmojiEvents as EmojiEventsIcon,
  Wallet as WalletIcon,
  SaveAlt as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Animasyonlu bileşenler için
const MotionBox = styled(motion.div)``;
const MotionCard = styled(motion(Card))``;

// Özel bileşenler
const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  border: `3px solid ${theme.palette.background.paper}`,
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  border: `2px solid ${theme.palette.primary.main}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: overview, 1: courses, 2: quests, 3: nfts, 4: settings
  
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    profileImage: ''
  });
  
  const [stats, setStats] = useState({
    completedCourses: 0,
    completedVideos: 0,
    completedQuests: 0,
    earnedNFTs: 0,
    totalPoints: 0
  });
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  
  // Şifre için state'ler
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // File input ref
  const fileInputRef = useRef(null);
  
  // Load profile data
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
      fetchUserStats();
    } else {
      router.push('/login?redirect=/profile');
    }
  }, [isAuthenticated, router]);
  
  // Tab değişimini yönet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/profile/');
      setProfileData(response.data);
      setProfileForm({
        username: response.data.username,
        email: response.data.email,
        profileImage: response.data.profileImage || ''
      });
      setLoading(false);
    } catch (err) {
      setError('Error loading profile data.');
      setLoading(false);
      console.error('Profile data fetch error:', err);
    }
  };
  
  const fetchUserStats = async () => {
    try {
      // Gerçek API'niz hazır olduğunda buraya ekleyin
      // Şimdilik örnek veri kullanıyoruz
      setTimeout(() => {
        setStats({
          completedCourses: 3,
          completedVideos: 24,
          completedQuests: 7,
          earnedNFTs: 5,
          totalPoints: 1250
        });
      }, 1000);
      
      // Gerçek API çağrısı:
      // const response = await axios.get('/api/analytics/user-stats/');
      // setStats(response.data);
    } catch (err) {
      console.error('User stats fetch error:', err);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put('/api/auth/profile/update/', profileForm);
      setProfileData(response.data);
      setEditMode(false);
      updateUser({
        ...user,
        username: response.data.username,
        email: response.data.email,
        profileImage: response.data.profileImage
      });
    } catch (err) {
      setError('Error updating profile.');
      console.error('Profile update error:', err);
    }
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size is too large. Maximum size is 5MB.');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Invalid file type. Only JPEG, PNG, and GIF files are allowed.');
      return;
    }
    
    setUploadingImage(true);
    setImageError(null);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post('/api/files/profile-image/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfileForm(prev => ({
        ...prev,
        profileImage: response.data.url
      }));
      
      setUploadingImage(false);
    } catch (err) {
      setImageError('Error uploading image.');
      setUploadingImage(false);
      console.error('Image upload error:', err);
    }
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    try {
      const formData = new FormData(e.target);
      const currentPassword = formData.get('currentPassword');
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');
      
      if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match.');
        return;
      }
      
      await axios.put('/api/auth/profile/change-password/', {
        currentPassword,
        newPassword
      });
      
      setPasswordSuccess(true);
      e.target.reset();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setPasswordError(err.response.data.error);
      } else {
        setPasswordError('Error changing password.');
      }
      console.error('Password change error:', err);
    }
  };
  
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };
  
  const handlePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 64px)' 
        }}
      >
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }
  
  if (error || !profileData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Profile data not found'}
        </Alert>
        <Button 
          component={Link} 
          href="/" 
          variant="contained" 
          color="primary"
        >
          Return to Home
        </Button>
      </Container>
    );
  }
  
  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', 
      pt: 2, 
      pb: 6,
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)}, ${theme.palette.background.default})`
        : `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.05)}, ${theme.palette.background.default})`,
    }}>
      <Container maxWidth="lg">
        {/* Profile Header Card */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            position: 'relative',
            overflow: 'visible',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0,0,0,0.2)'
              : '0 8px 24px rgba(0,0,0,0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderTopLeftRadius: theme.shape.borderRadius * 3,
              borderTopRightRadius: theme.shape.borderRadius * 3,
              zIndex: 0,
            }
          }}
        >
          <Grid container spacing={3} position="relative" zIndex={1}>
            <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
              <Box sx={{ position: 'relative', mr: 3 }}>
                <ProfileAvatar 
                  src={profileData.profileImage || '/images/default-avatar.png'} 
                  alt={profileData.username}
                >
                  {!profileData.profileImage && profileData.username?.charAt(0)?.toUpperCase()}
                </ProfileAvatar>
                {editMode && (
                  <UploadButton 
                    size="small"
                    onClick={handleFileInputClick}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CameraIcon fontSize="small" />
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      accept="image/jpeg, image/png, image/gif"
                      onChange={handleImageUpload}
                    />
                  </UploadButton>
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {profileData.username}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {profileData.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={`${stats.totalPoints} Points`}
                    color="primary"
                    size="small"
                    sx={{ 
                      mr: 1, 
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      fontWeight: 'bold'
                    }}
                  />
                  <Chip
                    label={`Level ${Math.floor(stats.totalPoints / 100)}`}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
              <Button
                variant="contained"
                color={editMode ? "secondary" : "primary"}
                startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                onClick={() => setEditMode(!editMode)}
                sx={{ 
                  borderRadius: 2,
                  mt: 2,
                  boxShadow: editMode ? '' : '0 4px 14px rgba(0,0,0,0.15)',
                }}
              >
                {editMode ? 'Cancel Editing' : 'Edit Profile'}
              </Button>
            </Grid>
          </Grid>
        </MotionCard>
        
        {/* Joined Date and Stats Summary */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Paper
            sx={{ 
              p: 2, 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Joined {new Date(profileData.joinDate).toLocaleDateString()} • Last Login: {
                profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleDateString() : 'Not available'
              }
            </Typography>
            <Chip 
              label={profileData.role || 'Student'} 
              size="small" 
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            />
          </Paper>
        </MotionBox>
        
        {/* Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                px: 3,
                fontWeight: 600,
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            <Tab 
              label="Overview" 
              icon={<SchoolIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="My Courses" 
              icon={<PlayCircleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="My Quests" 
              icon={<EmojiEventsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="My NFTs" 
              icon={<WalletIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Settings" 
              icon={<EditIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            minHeight: 400
          }}
        >
          {/* Overview Tab */}
          {activeTab === 0 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Overview
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <SchoolIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {stats.completedCourses}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Completed Courses
                    </Typography>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <PlayCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success">
                      {stats.completedVideos}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Watched Videos
                    </Typography>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <EmojiEventsIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="warning">
                      {stats.completedQuests}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Completed Quests
                    </Typography>
                  </StatsCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard>
                    <WalletIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="secondary">
                      {stats.earnedNFTs}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Earned NFTs
                    </Typography>
                  </StatsCard>
                </Grid>
              </Grid>
              
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Account Information
              </Typography>
              
              <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Username
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {profileData.username}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {profileData.email}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Join Date
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(profileData.joinDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Last Login
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'Not available'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Wallet Address
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" sx={{ 
                          wordBreak: 'break-all',
                          color: profileData.walletAddress ? 'text.primary' : 'text.disabled'
                        }}>
                          {profileData.walletAddress || 'Not connected'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {!profileData.walletAddress && (
                <Card 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <WalletIcon sx={{ color: theme.palette.warning.main, mr: 2, mt: 0.5 }} />
                      <Box>
                        <Typography variant="h6" gutterBottom color="warning.main" fontWeight="bold">
                          Connect Your Wallet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Connect your wallet to mint your NFTs and access web3 features. 
                          This will allow you to manage your earned rewards and participate in the full ecosystem.
                        </Typography>
                        <Button 
                          component={Link}
                          href="/wallet"
                          variant="contained" 
                          color="warning"
                          sx={{ borderRadius: 2 }}
                        >
                          Connect Wallet
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </MotionBox>
          )}
          
          {/* My Courses Tab */}
          {activeTab === 1 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                My Courses
              </Typography>
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                In Progress
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    Your in-progress courses will be listed here.
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                Completed
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    Your completed courses will be listed here.
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  component={Link}
                  href="/courses"
                  variant="outlined" 
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Explore All Courses
                </Button>
              </Box>
            </MotionBox>
          )}
          
          {/* My Quests Tab */}
          {activeTab === 2 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                My Quests
              </Typography>
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                Active Quests
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    Your active quests will be listed here.
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                Completed Quests
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    Your completed quests will be listed here.
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  component={Link}
                  href="/quests"
                  variant="outlined" 
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Explore All Quests
                </Button>
              </Box>
            </MotionBox>
          )}
          
          {/* My NFTs Tab */}
          {activeTab === 3 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                My NFTs
              </Typography>
              
              {!profileData.walletAddress ? (
                <Card 
                  sx={{ 
                    mt: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <WalletIcon sx={{ color: theme.palette.warning.main, mr: 2, mt: 0.5 }} />
                      <Box>
                        <Typography variant="h6" gutterBottom color="warning.main" fontWeight="bold">
                          Connect Your Wallet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          You need to connect your wallet first to view and manage your NFTs.
                          This will allow you to access your digital assets and rewards.
                        </Typography>
                        <Button 
                          component={Link}
                          href="/wallet"
                          variant="contained" 
                          color="warning"
                          sx={{ borderRadius: 2 }}
                        >
                          Connect Wallet
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>
                    Your NFTs
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography color="text.secondary">
                        Your NFTs will be listed here.
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button 
                      component={Link}
                      href="/nfts"
                      variant="outlined" 
                      color="primary"
                      sx={{ borderRadius: 2 }}
                    >
                      Explore All NFTs
                    </Button>
                  </Box>
                </>
              )}
            </MotionBox>
          )}
          
          {/* Settings Tab */}
          {activeTab === 4 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Settings
              </Typography>
              
              {/* Profile Edit Form */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Profile Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {editMode ? (
                  <form onSubmit={handleProfileUpdate}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Username"
                          name="username"
                          value={profileForm.username}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Email Address"
                          name="email"
                          value={profileForm.email}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          variant="outlined"
                          type="email"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Profile Picture
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={profileForm.profileImage || '/images/default-avatar.png'} 
                            alt="Profile picture"
                            sx={{ width: 60, height: 60, mr: 2 }}
                          >
                            {!profileForm.profileImage && profileForm.username?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Button 
                            variant="outlined"
                            component="label"
                            startIcon={<CameraIcon />}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? 'Uploading...' : 'Select Image'}
                            <input
                              type="file"
                              hidden
                              accept="image/jpeg, image/png, image/gif"
                              onChange={handleImageUpload}
                            />
                          </Button>
                        </Box>
                        {imageError && (
                          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {imageError}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          type="button"
                          variant="outlined"
                          color="secondary"
                          onClick={() => setEditMode(false)}
                          sx={{ mr: 2, borderRadius: 2 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          Save Changes
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Click the "Edit Profile" button to update your profile information.
                  </Typography>
                )}
              </Box>
              
              {/* Password Change Form */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Change Password
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {passwordSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Password has been successfully changed.
                  </Alert>
                )}
                
                {passwordError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {passwordError}
                  </Alert>
                )}
                
                <form onSubmit={handlePasswordChange}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="current-password">Current Password</InputLabel>
                        <OutlinedInput
                          id="current-password"
                          name="currentPassword"
                          type={showPassword.current ? 'text' : 'password'}
                          required
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handlePasswordVisibility('current')}
                                edge="end"
                              >
                                {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          }
                          label="Current Password"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="new-password">New Password</InputLabel>
                        <OutlinedInput
                          id="new-password"
                          name="newPassword"
                          type={showPassword.new ? 'text' : 'password'}
                          required
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handlePasswordVisibility('new')}
                                edge="end"
                              >
                                {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          }
                          label="New Password"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
                        <OutlinedInput
                          id="confirm-password"
                          name="confirmPassword"
                          type={showPassword.confirm ? 'text' : 'password'}
                          required
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handlePasswordVisibility('confirm')}
                                edge="end"
                              >
                                {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          }
                          label="Confirm New Password"
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2 }}
                      >
                        Change Password
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Box>
              
              {/* Theme Settings */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Theme Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Theme Mode:
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={toggleTheme}
                    startIcon={isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    {isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                  </Button>
                </Box>
              </Box>
            </MotionBox>
          )}
        </Paper>
      </Container>
    </Box>
  );
}