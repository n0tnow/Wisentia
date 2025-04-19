// src/app/admin/users/[userId]/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { alpha } from '@mui/material/styles';

// MUI imports
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Avatar,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  useTheme,
  LinearProgress,
} from '@mui/material';

// MUI icons
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Videocam as VideocamIcon,
  Quiz as QuizIcon,
  EmojiEvents as EmojiEventsIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Block as BlockIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

export default function UserDetailsPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    userRole: '',
    isActive: true,
  });
  
  const { user } = useAuth();
  const router = useRouter();
  const { userId } = useParams();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    // Admin check
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUserData(data);
        setFormData({
          username: data.user.Username,
          email: data.user.Email,
          userRole: data.user.UserRole,
          isActive: data.user.IsActive,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin' && userId) {
      fetchUserDetails();
    }
  }, [user, router, userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/users/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updateResult = await response.json();
      
      // Update local state
      setUserData({
        ...userData,
        user: {
          ...userData.user,
          Username: formData.username,
          Email: formData.email,
          UserRole: formData.userRole,
          IsActive: formData.isActive,
        }
      });
      
      setEditMode(false);
      alert('User updated successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Loading state
  if (loading) return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      color: 'text.primary', 
      pt: 4 
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3], bgcolor: 'background.paper' }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width="30%" height={40} />
            <Skeleton variant="text" width="20%" height={24} sx={{ mb: 2 }} />
            <Divider />
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Skeleton variant="text" width="25%" height={32} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mt: 2 }} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );

  // Error state
  if (error) return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      color: 'text.primary', 
      pt: 4 
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="h6" component="div" gutterBottom>
            Error Fetching User Data
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            sx={{ mt: 2 }}
            onClick={() => router.push('/admin/users')}
            startIcon={<ArrowBackIcon />}
          >
            Return to Users List
          </Button>
        </Alert>
      </Container>
    </Box>
  );

  // User not found
  if (!userData) return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      color: 'text.primary', 
      pt: 4 
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="h6" component="div" gutterBottom>
            User Not Found
          </Typography>
          <Typography variant="body1">The requested user data is not available or may have been deleted.</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            sx={{ mt: 2 }}
            onClick={() => router.push('/admin/users')}
            startIcon={<ArrowBackIcon />}
          >
            Return to Users List
          </Button>
        </Alert>
      </Container>
    </Box>
  );

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const renderTimelineIcon = (activityType) => {
    const iconMap = {
      'course_completed': <SchoolIcon />,
      'video_watched': <VideocamIcon />,
      'quiz_passed': <QuizIcon />,
      'quest_completed': <EmojiEventsIcon />,
      'login': <PersonIcon />,
      'nft_earned': <WalletIcon />
    };
    
    return iconMap[activityType] || <AccessTimeIcon />;
  };

  const getTimelineColor = (activityType) => {
    const colorMap = {
      'course_completed': 'success',
      'video_watched': 'info',
      'quiz_passed': 'secondary',
      'quest_completed': 'warning',
      'login': 'default',
      'nft_earned': 'error'
    };
    
    return colorMap[activityType] || 'primary';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      color: 'text.primary', 
      pt: 4 
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with back button and edit/cancel button */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #f6f7f9 0%, #e9edf2 100%)',
            color: isDarkMode ? 'white' : 'inherit'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                color={isDarkMode ? "secondary" : "primary"} 
                onClick={() => router.push('/admin/users')}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h5" component="h1" fontWeight="bold">
                  User Details
                </Typography>
                <Typography variant="subtitle1" color={isDarkMode ? "grey.400" : "text.secondary"}>
                  View and manage user information
                </Typography>
              </Box>
            </Box>
            
            <Box>
              {!editMode ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditMode(true)}
                  startIcon={<EditIcon />}
                  sx={{ 
                    boxShadow: theme.shadows[4],
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  Edit User
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setEditMode(false)}
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={userData.user.TotalPoints > 1000 ? 100 : (userData.user.TotalPoints / 10)} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: alpha(isDarkMode ? theme.palette.primary.dark : theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
              }
            }} 
          />
          <Typography variant="caption" color={isDarkMode ? "grey.400" : "text.secondary"} sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
            Total Points: {userData.user.TotalPoints} 
            {userData.user.TotalPoints > 500 && ' • Advanced User'}
            {userData.user.TotalPoints > 1000 && ' • Expert User'}
          </Typography>
        </Paper>

        {/* User Information and Assets Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 0, 
                borderRadius: 2,
                overflow: 'hidden',
                mb: { xs: 3, md: 0 },
                bgcolor: 'background.paper',
              }}
            >
              {/* Edit Form or User Display */}
              {editMode ? (
                <Box 
                  component="form" 
                  onSubmit={handleSubmit}
                  sx={{ p: 3 }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Edit User Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email Address"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="role-select-label">User Role</InputLabel>
                        <Select
                          labelId="role-select-label"
                          name="userRole"
                          value={formData.userRole}
                          onChange={handleInputChange}
                          label="User Role"
                        >
                          <MenuItem value="regular">Regular User</MenuItem>
                          <MenuItem value="admin">Administrator</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            name="isActive"
                            color="success"
                          />
                        }
                        label={formData.isActive ? "Active Account" : "Inactive Account"}
                        sx={{ 
                          height: '100%', 
                          display: 'flex',
                          alignItems: 'center',
                          '& .MuiFormControlLabel-label': {
                            color: formData.isActive ? 'success.main' : 'error.main',
                            fontWeight: 'medium'
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={() => setEditMode(false)}
                      sx={{ mr: 2, borderRadius: 2 }}
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ 
                        borderRadius: 2,
                        boxShadow: theme.shadows[3]
                      }}
                      startIcon={<SaveIcon />}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box 
                    sx={{ 
                      height: 120, 
                      backgroundColor: userData.user.UserRole === 'admin' 
                        ? (isDarkMode ? alpha(theme.palette.primary.dark, 0.7) : theme.palette.primary.dark) 
                        : (isDarkMode ? alpha(theme.palette.secondary.dark, 0.7) : theme.palette.secondary.dark),
                      position: 'relative'
                    }}
                  />
                  
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Box sx={{ display: 'flex', mt: -6, mb: 3 }}>
                      <Avatar 
                        src={userData.user.ProfileImage} 
                        alt={userData.user.Username}
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          border: `4px solid ${isDarkMode ? '#1e1e1e' : 'white'}`,
                          boxShadow: theme.shadows[3],
                          backgroundColor: userData.user.UserRole === 'admin' 
                            ? (isDarkMode ? theme.palette.primary.dark : theme.palette.primary.main) 
                            : (isDarkMode ? theme.palette.secondary.dark : theme.palette.secondary.main),
                          fontSize: 48
                        }}
                      >
                        {userData.user.Username ? userData.user.Username[0].toUpperCase() : 'U'}
                      </Avatar>
                      <Box sx={{ ml: 3, mt: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h5" fontWeight="bold" sx={{ mr: 2 }}>
                            {userData.user.Username}
                          </Typography>
                          <Chip 
                            icon={userData.user.UserRole === 'admin' ? <AdminIcon /> : <PersonIcon />}
                            label={userData.user.UserRole === 'admin' ? 'Administrator' : 'Regular User'}
                            color={userData.user.UserRole === 'admin' ? 'primary' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'medium' }}
                          />
                          <Chip 
                            icon={userData.user.IsActive ? <CheckCircleIcon /> : <BlockIcon />}
                            label={userData.user.IsActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(userData.user.IsActive)}
                            size="small"
                            sx={{ ml: 1, fontWeight: 'medium' }}
                          />
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                          {userData.user.Email}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            borderRadius: 2, 
                            height: '100%',
                            bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : theme.palette.background.paper,
                          }}
                        >
                          <CardHeader 
                            title="User Information" 
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                            sx={{
                              bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.light, 0.1),
                            }}
                          />
                          <Divider />
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Join Date</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {new Date(userData.user.JoinDate).toLocaleDateString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Last Login</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {userData.user.LastLogin ? new Date(userData.user.LastLogin).toLocaleString() : 'Never'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Total Points</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {userData.user.TotalPoints}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Wallet</Typography>
                                <Box>
                                  {userData.user.WalletAddress ? 
                                    <Chip 
                                      size="small" 
                                      color="success" 
                                      label="Connected" 
                                      icon={<WalletIcon fontSize="small" />} 
                                    /> : 
                                    <Chip 
                                      size="small" 
                                      variant="outlined" 
                                      label="Not Connected" 
                                    />
                                  }
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* User Statistics */}
                      <Grid item xs={12}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            borderRadius: 2, 
                            height: '100%',
                            bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : theme.palette.background.paper,
                          }}
                        >
                          <CardHeader 
                            title="Learning Statistics" 
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                            sx={{
                              bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.primary.light, 0.1),
                            }}
                          />
                          <Divider />
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={3}>
                                <Tooltip title="Completed Courses" arrow>
                                  <Card 
                                    sx={{ 
                                      p: 1.5, 
                                      textAlign: 'center',
                                      backgroundColor: isDarkMode 
                                        ? alpha(theme.palette.primary.dark, 0.8) 
                                        : theme.palette.primary.light,
                                      color: isDarkMode 
                                        ? theme.palette.primary.contrastText 
                                        : theme.palette.primary.contrastText,
                                      borderRadius: 2,
                                      boxShadow: theme.shadows[2]
                                    }}
                                  >
                                    <SchoolIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h5" fontWeight="bold">
                                      {userData.stats.completedCourses}
                                    </Typography>
                                    <Typography variant="caption">Courses</Typography>
                                  </Card>
                                </Tooltip>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Tooltip title="Watched Videos" arrow>
                                  <Card 
                                    sx={{ 
                                      p: 1.5, 
                                      textAlign: 'center',
                                      backgroundColor: isDarkMode 
                                        ? alpha(theme.palette.info.dark, 0.8) 
                                        : theme.palette.info.light,
                                      color: theme.palette.info.contrastText,
                                      borderRadius: 2,
                                      boxShadow: theme.shadows[2]
                                    }}
                                  >
                                    <VideocamIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h5" fontWeight="bold">
                                      {userData.stats.watchedVideos}
                                    </Typography>
                                    <Typography variant="caption">Videos</Typography>
                                  </Card>
                                </Tooltip>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Tooltip title="Passed Quizzes" arrow>
                                  <Card 
                                    sx={{ 
                                      p: 1.5, 
                                      textAlign: 'center',
                                      backgroundColor: isDarkMode 
                                        ? alpha(theme.palette.secondary.dark, 0.8) 
                                        : theme.palette.secondary.light,
                                      color: theme.palette.secondary.contrastText,
                                      borderRadius: 2,
                                      boxShadow: theme.shadows[2]
                                    }}
                                  >
                                    <QuizIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h5" fontWeight="bold">
                                      {userData.stats.passedQuizzes}
                                    </Typography>
                                    <Typography variant="caption">Quizzes</Typography>
                                  </Card>
                                </Tooltip>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Tooltip title="Completed Quests" arrow>
                                  <Card 
                                    sx={{ 
                                      p: 1.5, 
                                      textAlign: 'center',
                                      backgroundColor: isDarkMode 
                                        ? alpha(theme.palette.warning.dark, 0.8) 
                                        : theme.palette.warning.light,
                                      color: theme.palette.warning.contrastText,
                                      borderRadius: 2,
                                      boxShadow: theme.shadows[2]
                                    }}
                                  >
                                    <EmojiEventsIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="h5" fontWeight="bold">
                                      {userData.stats.completedQuests}
                                    </Typography>
                                    <Typography variant="caption">Quests</Typography>
                                  </Card>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* NFT & Subscriptions */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ 
                px: 3, 
                py: 2, 
                bgcolor: isDarkMode 
                  ? alpha(theme.palette.background.default, 0.4) 
                  : alpha(theme.palette.primary.light, 0.1),
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" fontWeight="bold">
                  Assets & Subscriptions
                </Typography>
              </Box>
              
              <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : theme.palette.background.paper, 
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Owned NFTs
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: isDarkMode ? alpha(theme.palette.error.dark, 0.8) : theme.palette.error.main, 
                          color: theme.palette.error.contrastText,
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        <WalletIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {userData.stats.ownedNFTs}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Collectibles
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : theme.palette.background.paper, 
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Active Subscriptions
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: userData.stats.activeSubscriptions > 0 
                            ? (isDarkMode ? alpha(theme.palette.success.dark, 0.8) : theme.palette.success.main) 
                            : (isDarkMode ? 'rgba(255, 255, 255, 0.12)' : theme.palette.grey[300]), 
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        <CheckCircleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {userData.stats.activeSubscriptions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userData.stats.activeSubscriptions === 1 ? 'Subscription' : 'Subscriptions'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                {!editMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setEditMode(true)}
                    startIcon={<EditIcon />}
                    sx={{ 
                      mt: 'auto',
                      borderRadius: 2,
                      boxShadow: theme.shadows[3],
                      py: 1.5,
                      mt: 3
                    }}
                  >
                    Edit User
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Paper 
          elevation={3} 
          sx={{ 
            mt: 3, 
            p: 0, 
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ 
            px: 3, 
            py: 2, 
            bgcolor: isDarkMode 
              ? alpha(theme.palette.background.default, 0.4) 
              : alpha(theme.palette.primary.light, 0.1),
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Activity
            </Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            {userData.recentActivities.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No recent activity recorded for this user.
              </Alert>
            ) : (
              <Box>
                {userData.recentActivities.map((activity, index) => (
                  <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getTimelineColor(activity.ActivityType) + (isDarkMode ? '.dark' : '.main'), 
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      {renderTimelineIcon(activity.ActivityType)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : theme.palette.background.paper,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {activity.ActivityType.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.Timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {activity.Description}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}