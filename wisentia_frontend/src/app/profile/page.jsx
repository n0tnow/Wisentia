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
  CardActionArea,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  alpha,
  useTheme,
  Stack
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
  Close as CloseIcon,
  MoreHoriz as MoreHorizIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Animated components
const MotionBox = styled(motion.div)``;
const MotionCard = styled(motion(Card))``;

// Custom components
const StatsCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.palette.mode === 'dark' 
    ? `0 8px 24px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 12px 28px ${alpha(theme.palette.common.black, 0.4)}`
      : `0 12px 28px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  boxShadow: theme.palette.mode === 'dark'
    ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
    : `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
  border: `5px solid ${theme.palette.background.paper}`,
  '&.MuiAvatar-colorDefault': {
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #3f51b5, #9c27b0)'
      : 'linear-gradient(135deg, #4158D0, #C850C0)',
    fontSize: '3.5rem',
    fontWeight: 'bold'
  },
}));

const CameraBadge = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 5,
  right: 5,
  backgroundColor: theme.palette.background.paper,
  border: `2px solid ${theme.palette.primary.main}`,
  padding: 8,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

// Tab styles
const StyledTab = styled(Button)(({ theme, active }) => ({
  minHeight: 48,
  minWidth: 150,
  fontWeight: 600,
  borderRadius: 100,
  margin: '0 8px',
  padding: '10px 24px',
  transition: 'all 0.3s ease',
  backgroundColor: active ? 
    theme.palette.mode === 'dark' ? 
      'linear-gradient(to right, #3f51b5, #9c27b0)' : 
      'linear-gradient(to right, #4158D0, #8E49E8)' 
    : 'transparent',
  color: active ? '#fff' : theme.palette.text.primary,
  boxShadow: active ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
  '&:hover': {
    backgroundColor: !active ? alpha(theme.palette.primary.main, 0.1) : 
      theme.palette.mode === 'dark' ? 
        'linear-gradient(to right, #3f51b5, #9c27b0)' : 
        'linear-gradient(to right, #4158D0, #8E49E8)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
  },
}));

// Card content custom component
const StatIcon = styled(Box)(({ theme, color = 'primary' }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' ?
    color === 'primary' 
      ? 'linear-gradient(135deg, #3f51b5, #5E6BE7)' 
      : color === 'success' 
        ? 'linear-gradient(135deg, #0B8A5C, #25A67E)' 
        : color === 'warning'
          ? 'linear-gradient(135deg, #FF9800, #ED6C02)'
          : 'linear-gradient(135deg, #9c27b0, #d81b60)'
    :
    color === 'primary' 
      ? 'linear-gradient(135deg, #4158D0, #7D75CC)' 
      : color === 'success' 
        ? 'linear-gradient(135deg, #0BA360, #3CBA92)' 
        : color === 'warning'
          ? 'linear-gradient(135deg, #FF9A44, #FC6076)'
          : 'linear-gradient(135deg, #C850C0, #FFCC70)',
  marginBottom: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark'
    ? `0 6px 20px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 6px 20px ${alpha(theme.palette[color].main, 0.25)}`,
  '& svg': {
    fontSize: 35,
    color: '#fff',
  }
}));

const DetailButton = styled(Button)(({ theme }) => ({
  borderRadius: 100,
  textTransform: 'none',
  fontSize: '0.8rem',
  padding: '4px 12px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  boxShadow: 'none',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  }
}));

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser, authChecked } = useAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: overview, 1: courses, 2: quests, 3: nfts
  
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
  
  // Detail pop-up state
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    type: null, // 'courses', 'videos', 'quests', 'nfts'
    title: '',
    data: null
  });
  
  // File input ref
  const fileInputRef = useRef(null);
  
  // Load profile data
  useEffect(() => {
    if (!authChecked) return;
  
    if (isAuthenticated()) {
      fetchProfileData();
      fetchUserStats();
    } else {
      router.push('/login?redirect=/profile');
    }
  }, [authChecked]);
  
  // Tab change handler
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };
  
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Try to call API
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('access_token');
        
        const response = await axios.get(`${API_BASE_URL}/auth/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
        
        console.log("API Response:", response.data);
        setProfileData(response.data);
        setProfileForm({
          username: response.data.username,
          email: response.data.email,
          profileImage: response.data.profileImage || ''
        });
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Use mock data in case of API error
        console.log("Using mock data due to API error");
        const mockProfileData = {
          id: 1,
          username: user?.username || "wisentia_user",
          email: user?.email || "user@wisentia.com",
          walletAddress: "",
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          role: user?.role || "regular",
          profileImage: "",
          themePreference: "light",
          totalPoints: 1250
        };
        
        setProfileData(mockProfileData);
        setProfileForm({
          username: mockProfileData.username,
          email: mockProfileData.email,
          profileImage: mockProfileData.profileImage || ''
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Profile data fetch error:', err);
      setError('Error loading profile data.');
      setLoading(false);
    }
  };
  
  const fetchUserStats = async () => {
    try {
      // Add your real API here when ready
      // For now using sample data
      setTimeout(() => {
        setStats({
          completedCourses: 3,
          completedVideos: 24,
          completedQuests: 7,
          earnedNFTs: 5,
          totalPoints: 1250
        });
      }, 1000);
      
      // Real API call:
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
  
  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };
  
  // Detail popup functions
  const handleOpenDetail = (type, title, data) => {
    setDetailDialog({
      open: true,
      type,
      title,
      data
    });
  };
  
  const handleCloseDetail = () => {
    setDetailDialog({
      ...detailDialog,
      open: false
    });
  };

  const handleNavigateToDetail = (type) => {
    handleCloseDetail();
    // Navigate to the corresponding page
    switch(type) {
      case 'courses':
        router.push('/courses');
        break;
      case 'videos':
        router.push('/courses');
        break;
      case 'quests':
        router.push('/quests');
        break;
      case 'nfts':
        router.push('/nfts');
        break;
      default:
        break;
    }
  };
  
  // Show relevant data section
  const getDetailContent = () => {
    const { type, data } = detailDialog;
    
    switch (type) {
      case 'courses':
        return (
          <Box>
            <Typography variant="body1">
              You have successfully completed 3 courses so far.
            </Typography>
            <List sx={{ mt: 2 }}>
              <ListItem>
                <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Blockchain Fundamentals" secondary="Completed: January 15, 2025" />
              </ListItem>
              <ListItem>
                <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Smart Contract Development" secondary="Completed: February 27, 2025" />
              </ListItem>
              <ListItem>
                <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Web3 Applications" secondary="Completed: March 10, 2025" />
              </ListItem>
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigateToDetail('courses')}
                sx={{ borderRadius: 28 }}
              >
                View All Courses
              </Button>
            </Box>
          </Box>
        );
        
      case 'videos':
        return (
          <Box>
            <Typography variant="body1">
              You have watched a total of 24 educational videos. Recently watched:
            </Typography>
            <List sx={{ mt: 2 }}>
              <ListItem>
                <ListItemIcon><PlayCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="How NFT Marketplaces Work" secondary="Watched: April 12, 2025" />
              </ListItem>
              <ListItem>
                <ListItemIcon><PlayCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Introduction to Decentralized Finance (DeFi)" secondary="Watched: April 10, 2025" />
              </ListItem>
              <ListItem>
                <ListItemIcon><PlayCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary="Ethereum 2.0 In-Depth Review" secondary="Watched: April 5, 2025" />
              </ListItem>
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                color="success" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigateToDetail('videos')}
                sx={{ borderRadius: 28 }}
              >
                Browse Content Library
              </Button>
            </Box>
          </Box>
        );
        
      case 'quests':
        return (
          <Box>
            <Typography variant="body1">
              You have successfully completed 7 quests so far.
            </Typography>
            <List sx={{ mt: 2 }}>
              <ListItem>
                <ListItemIcon><EmojiEventsIcon color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Blockchain Explorer" 
                  secondary="Earned: 250 points, 1 NFT" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><EmojiEventsIcon color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Smart Contract Challenge" 
                  secondary="Earned: 500 points" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><EmojiEventsIcon color="warning" /></ListItemIcon>
                <ListItemText 
                  primary="Web3 Explorer" 
                  secondary="Earned: 300 points, 1 NFT" 
                />
              </ListItem>
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                color="warning" 
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigateToDetail('quests')}
                sx={{ borderRadius: 28 }}
              >
                View All Quests
              </Button>
            </Box>
          </Box>
        );
        
      case 'nfts':
        return (
          <Box>
            <Typography variant="body1">
              You have earned a total of 5 educational NFTs.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} md={4}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 2, 
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      background: `linear-gradient(135deg, #6366F1, #8B5CF6)`
                    }}>
                      <SchoolIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Blockchain Graduate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rare
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      background: `linear-gradient(135deg, #F59E0B, #EF4444)`
                    }}>
                      <WalletIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Web3 Explorer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Common
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                sx={{ 
                  borderRadius: 28,
                  background: 'linear-gradient(to right, #C850C0, #FFCC70)',
                }}
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigateToDetail('nfts')}
              >
                View All NFTs
              </Button>
            </Box>
          </Box>
        );
          
      default:
        return <Typography>No details found.</Typography>;
    }
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
      pt: 4, 
      pb: 6,
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, #121212, #1E1E30)`
        : `linear-gradient(135deg, #F0F2FF, #FFFFFF)`,
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: theme.palette.mode === 'dark'
          ? `radial-gradient(circle at 25% 25%, ${alpha('#303F9F', 0.2)} 0%, transparent 35%), radial-gradient(circle at 75% 75%, ${alpha('#9C27B0', 0.2)} 0%, transparent 35%)`
          : `radial-gradient(circle at 25% 25%, ${alpha('#E3F2FD', 1)} 0%, transparent 35%), radial-gradient(circle at 75% 75%, ${alpha('#F3E5F5', 1)} 0%, transparent 35%)`,
        zIndex: 0,
      },
      '&:after': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18C11 18.5523 10.5523 19 10 19C9.44772 19 9 18.5523 9 18C9 17.4477 9.44772 17 10 17C10.5523 17 11 17.4477 11 18Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M51 18C51 18.5523 50.5523 19 50 19C49.4477 19 49 18.5523 49 18C49 17.4477 49.4477 17 50 17C50.5523 17 51 17.4477 51 18Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M91 18C91 18.5523 90.5523 19 90 19C89.4477 19 89 18.5523 89 18C89 17.4477 89.4477 17 90 17C90.5523 17 91 17.4477 91 18Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M11 50C11 50.5523 10.5523 51 10 51C9.44772 51 9 50.5523 9 50C9 49.4477 9.44772 49 10 49C10.5523 49 11 49.4477 11 50Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M51 50C51 50.5523 50.5523 51 50 51C49.4477 51 49 50.5523 49 50C49 49.4477 49.4477 49 50 49C50.5523 49 51 49.4477 51 50Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M91 50C91 50.5523 90.5523 51 90 51C89.4477 51 89 50.5523 89 50C89 49.4477 89.4477 49 90 49C90.5523 49 91 49.4477 91 50Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M11 82C11 82.5523 10.5523 83 10 83C9.44772 83 9 82.5523 9 82C9 81.4477 9.44772 81 10 81C10.5523 81 11 81.4477 11 82Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M51 82C51 82.5523 50.5523 83 50 83C49.4477 83 49 82.5523 49 82C49 81.4477 49.4477 81 50 81C50.5523 81 51 81.4477 51 82Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3Cpath d='M91 82C91 82.5523 90.5523 83 90 83C89.4477 83 89 82.5523 89 82C89 81.4477 89.4477 81 90 81C90.5523 81 91 81.4477 91 82Z' fill='%23${theme.palette.mode === 'dark' ? 'FFFFFF' : '4158D0'}' fill-opacity='0.05'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        pointerEvents: 'none',
        opacity: 0.8,
        zIndex: 0,
        animation: 'starFloat 120s linear infinite',
      },
      '@keyframes starFloat': {
        '0%': {
          backgroundPosition: '0% 0%',
        },
        '100%': {
          backgroundPosition: '100% 100%',
        },
      },
    }}>
      <Container maxWidth="lg">
        {/* Profile Header Card - Enhanced Design */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ 
            borderRadius: 4,
            position: 'relative',
            overflow: 'visible',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)',
            mb: 4,
          }}
        >
          {/* Top Gradient Banner */}
          <Box 
            sx={{ 
              height: 160, 
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, #303F9F, #9C27B0)`
                : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderTopLeftRadius: theme.shape.borderRadius * 4,
              borderTopRightRadius: theme.shape.borderRadius * 4,
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url(/images/pattern.svg) repeat',
                opacity: 0.1,
              }
            }}
          />
          
          {/* Profile Content */}
          <Box sx={{ px: 4, pb: 4, pt: 0, mt: -8, position: 'relative' }}>
            <Grid container spacing={3}>
              {/* Avatar and Profile Info */}
              <Grid item xs={12} md={12} sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: { xs: 'center', sm: 'flex-start' },
                justifyContent: 'center',
                mb: 2
              }}>
                {/* Avatar with Badge */}
                <Box sx={{ position: 'relative', mr: { xs: 0, sm: 4 }, mb: { xs: 2, sm: 0 } }}>
                  <ProfileAvatar 
                    src={profileData.profileImage || '/images/default-avatar.png'} 
                    alt={profileData.username}
                  >
                    {!profileData.profileImage && profileData.username?.charAt(0)?.toUpperCase()}
                  </ProfileAvatar>
                  
                  <CameraBadge 
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
                  </CameraBadge>
                </Box>
                
                {/* Profile Information */}
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {profileData.username}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profileData.email}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <Chip
                      label={`${stats.totalPoints} Points`}
                      color="primary"
                      size="medium"
                      sx={{ 
                        fontWeight: 'bold',
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(90deg, #3f51b5, #9c27b0)`
                          : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: '#fff',
                        px: 1,
                      }}
                    />
                    <Chip
                      label={`Level ${Math.floor(stats.totalPoints / 100)}`}
                      size="medium"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        fontWeight: 'bold',
                        px: 1,
                      }}
                    />
                    {profileData.role === 'admin' && (
                      <Chip
                        label="Admin"
                        size="medium"
                        color="error"
                        sx={{ 
                          fontWeight: 'bold',
                          px: 1,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </MotionCard>
        
        {/* Wallet Connection Status */}
        {!profileData.walletAddress && (
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ 
              mb: 4, 
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.1)}`,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar sx={{ 
                  mr: 2, 
                  bgcolor: alpha(theme.palette.warning.main, 0.2),
                  color: theme.palette.warning.main
                }}>
                  <WalletIcon />
                </Avatar>
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
                    sx={{ borderRadius: 8, fontWeight: 'bold' }}
                  >
                    Connect Wallet
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </MotionCard>
        )}
        
        {/* Custom Navigation Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4, 
          mt: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <StyledTab 
            onClick={() => handleTabChange(0)}
            sx={{ 
              background: activeTab === 0 
                ? theme.palette.mode === 'dark'
                  ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
                  : 'linear-gradient(to right, #4158D0, #8E49E8)'
                : 'transparent',
              boxShadow: activeTab === 0 ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
              color: activeTab === 0 ? '#fff' : theme.palette.text.primary,
            }}
          >
            OVERVIEW
          </StyledTab>
          <StyledTab 
            onClick={() => handleTabChange(1)}
            sx={{ 
              background: activeTab === 1 
                ? theme.palette.mode === 'dark'
                  ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
                  : 'linear-gradient(to right, #4158D0, #8E49E8)'
                : 'transparent',
              boxShadow: activeTab === 1 ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
              color: activeTab === 1 ? '#fff' : theme.palette.text.primary,
            }}
          >
            MY COURSES
          </StyledTab>
          <StyledTab 
            onClick={() => handleTabChange(2)}
            sx={{ 
              background: activeTab === 2 
                ? theme.palette.mode === 'dark'
                  ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
                  : 'linear-gradient(to right, #4158D0, #8E49E8)'
                : 'transparent',
              boxShadow: activeTab === 2 ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
              color: activeTab === 2 ? '#fff' : theme.palette.text.primary,
            }}
          >
            MY QUESTS
          </StyledTab>
          <StyledTab 
            onClick={() => handleTabChange(3)}
            sx={{ 
              background: activeTab === 3 
                ? theme.palette.mode === 'dark'
                  ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
                  : 'linear-gradient(to right, #4158D0, #8E49E8)'
                : 'transparent',
              boxShadow: activeTab === 3 ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
              color: activeTab === 3 ? '#fff' : theme.palette.text.primary,
            }}
          >
            MY NFTS
          </StyledTab>
        </Box>
        
        {/* Tab Content */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(0,0,0,0.08)',
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
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Overview
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4, mt: 2, width: '100%', mx: 0 }}>
                {/* Completed Courses */}
                <Grid item xs={12} sm={6} lg={3}>
                  <CardActionArea 
                    onClick={() => handleOpenDetail('courses', 'Completed Courses', stats.completedCourses)}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <StatsCard sx={{ width: '100%', height: '100%', boxShadow: 'none' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%', 
                        height: '100%',
                        p: 3
                      }}>
                        <Avatar sx={{ 
                          width: 70, 
                          height: 70, 
                          mb: 2,
                          bgcolor: '#5B69FF',
                          boxShadow: '0 8px 20px rgba(91, 105, 255, 0.25)'
                        }}>
                          <SchoolIcon sx={{ fontSize: 35, color: '#fff' }} />
                        </Avatar>
                        <Typography 
                          variant="h1" 
                          fontWeight="bold"
                          color={theme.palette.mode === 'dark' ? '#8F96FF' : '#5B69FF'}
                          sx={{ mb: 1, fontSize: '3.5rem' }}
                        >
                          {stats.completedCourses}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          Completed Courses
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          color: theme.palette.mode === 'dark' ? '#8F96FF' : '#5B69FF',
                          '& svg': { ml: 0.5, transition: 'transform 0.3s ease' }
                        }}>
                          <Typography variant="button" fontWeight="medium">
                            View Details
                          </Typography>
                          <MoreHorizIcon fontSize="small" sx={{ transition: 'transform 0.3s ease' }} />
                        </Box>
                      </Box>
                    </StatsCard>
                  </CardActionArea>
                </Grid>

                {/* Watched Videos */}
                <Grid item xs={12} sm={6} lg={3}>
                  <CardActionArea 
                    onClick={() => handleOpenDetail('videos', 'Watched Videos', stats.completedVideos)}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <StatsCard sx={{ width: '100%', height: '100%', boxShadow: 'none' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%', 
                        height: '100%',
                        p: 3
                      }}>
                        <Avatar sx={{ 
                          width: 70, 
                          height: 70, 
                          mb: 2,
                          bgcolor: '#0BAF63',
                          boxShadow: '0 8px 20px rgba(11, 175, 99, 0.25)'
                        }}>
                          <PlayCircleIcon sx={{ fontSize: 35, color: '#fff' }} />
                        </Avatar>
                        <Typography 
                          variant="h1" 
                          fontWeight="bold"
                          color={theme.palette.mode === 'dark' ? '#5DD997' : '#0BAF63'}
                          sx={{ mb: 1, fontSize: '3.5rem' }}
                        >
                          {stats.completedVideos}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          Watched Videos
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          color: theme.palette.mode === 'dark' ? '#5DD997' : '#0BAF63',
                          '& svg': { ml: 0.5, transition: 'transform 0.3s ease' }
                        }}>
                          <Typography variant="button" fontWeight="medium">
                            View Details
                          </Typography>
                          <MoreHorizIcon fontSize="small" />
                        </Box>
                      </Box>
                    </StatsCard>
                  </CardActionArea>
                </Grid>

                {/* Completed Quests */}
                <Grid item xs={12} sm={6} lg={3}>
                  <CardActionArea 
                    onClick={() => handleOpenDetail('quests', 'Completed Quests', stats.completedQuests)}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <StatsCard sx={{ width: '100%', height: '100%', boxShadow: 'none' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%', 
                        height: '100%',
                        p: 3
                      }}>
                        <Avatar sx={{ 
                          width: 70, 
                          height: 70, 
                          mb: 2,
                          bgcolor: '#FF9A44',
                          boxShadow: '0 8px 20px rgba(255, 154, 68, 0.25)'
                        }}>
                          <EmojiEventsIcon sx={{ fontSize: 35, color: '#fff' }} />
                        </Avatar>
                        <Typography 
                          variant="h1" 
                          fontWeight="bold"
                          color={theme.palette.mode === 'dark' ? '#FFC380' : '#FF9A44'}
                          sx={{ mb: 1, fontSize: '3.5rem' }}
                        >
                          {stats.completedQuests}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          Completed Quests
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          color: theme.palette.mode === 'dark' ? '#FFC380' : '#FF9A44',
                          '& svg': { ml: 0.5, transition: 'transform 0.3s ease' }
                        }}>
                          <Typography variant="button" fontWeight="medium">
                            View Details
                          </Typography>
                          <MoreHorizIcon fontSize="small" />
                        </Box>
                      </Box>
                    </StatsCard>
                  </CardActionArea>
                </Grid>

                {/* Earned NFTs */}
                <Grid item xs={12} sm={6} lg={3}>
                  <CardActionArea 
                    onClick={() => handleOpenDetail('nfts', 'Earned NFTs', stats.earnedNFTs)}
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'hidden',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <StatsCard sx={{ width: '100%', height: '100%', boxShadow: 'none' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%', 
                        height: '100%',
                        p: 3
                      }}>
                        <Avatar sx={{ 
                          width: 70, 
                          height: 70, 
                          mb: 2,
                          bgcolor: '#C850C0',
                          boxShadow: '0 8px 20px rgba(200, 80, 192, 0.25)'
                        }}>
                          <WalletIcon sx={{ fontSize: 35, color: '#fff' }} />
                        </Avatar>
                        <Typography 
                          variant="h1" 
                          fontWeight="bold"
                          color={theme.palette.mode === 'dark' ? '#E68CE3' : '#C850C0'}
                          sx={{ mb: 1, fontSize: '3.5rem' }}
                        >
                          {stats.earnedNFTs}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          Earned NFTs
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          color: theme.palette.mode === 'dark' ? '#E68CE3' : '#C850C0',
                          '& svg': { ml: 0.5, transition: 'transform 0.3s ease' }
                        }}>
                          <Typography variant="button" fontWeight="medium">
                            View Details
                          </Typography>
                          <MoreHorizIcon fontSize="small" />
                        </Box>
                      </Box>
                    </StatsCard>
                  </CardActionArea>
                </Grid>
              </Grid>
              
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Account Information
              </Typography>
              
              <Card sx={{ 
                mb: 3, 
                borderRadius: 3, 
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0,0,0,0.2)'
                  : '0 4px 20px rgba(0,0,0,0.05)',
              }}>
                <CardContent>
                  <Grid container spacing={3}>
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
                  variant="contained" 
                  color="primary"
                  sx={{ 
                    borderRadius: 8, 
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.2,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
                      : 'linear-gradient(to right, #4158D0, #8E49E8)',
                  }}
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
                  variant="contained" 
                  color="primary"
                  sx={{ 
                    borderRadius: 8, 
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.2,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
                      : 'linear-gradient(to right, #4158D0, #8E49E8)',
                  }}
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
                    borderRadius: 3,
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
                          sx={{ borderRadius: 8, fontWeight: 'bold' }}
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
                      variant="contained" 
                      color="primary"
                      sx={{ 
                        borderRadius: 8, 
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.2,
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
                          : 'linear-gradient(to right, #4158D0, #8E49E8)',
                      }}
                    >
                      Explore All NFTs
                    </Button>
                  </Box>
                </>
              )}
            </MotionBox>
          )}
        </Paper>
      </Container>
      
      {/* Details Dialog */}
      <Dialog 
        open={detailDialog.open} 
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundImage: theme.palette.mode === 'dark'
            ? 'linear-gradient(to right, #3f51b5, #9c27b0)'
            : 'linear-gradient(to right, #4158D0, #C850C0)',
          color: 'white',
          py: 2,
          px: 3
        }}>
          <Box component="div" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            {detailDialog.title}
          </Box>
          <IconButton onClick={handleCloseDetail} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ py: 4, px: 4 }}>
          {getDetailContent()}
        </DialogContent>
      </Dialog>
    </Box>
  );
}