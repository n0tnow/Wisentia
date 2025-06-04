// src/app/admin/users/[userId]/page.jsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { alpha, styled } from '@mui/material/styles';

// MUI imports
import {
  Box, Typography, Container, Grid, Paper, Avatar, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch,
  Chip, Divider, IconButton, Skeleton, Alert, Card, CardContent,
  CardHeader, Tooltip, useTheme, LinearProgress, Stack, Badge,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem,
  ListItemIcon, ListItemText, Tabs, Tab, Fade, Grow, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, CircularProgress
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
  AccessTime as AccessTimeIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Stars as StarsIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// Corporate Theme Colors
const DETAIL_COLORS = {
  primary: '#2563EB',      // Blue
  secondary: '#7C3AED',    // Purple
  accent: '#059669',       // Emerald
  warning: '#D97706',      // Orange
  error: '#DC2626',        // Red
  info: '#0891B2',         // Cyan
  success: '#059669',      // Emerald
  gradients: {
    primary: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    secondary: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
    accent: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
    corporate: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #059669 100%)'
  }
};

// Styled Components
const DetailCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(16px)',
  border: `1px solid ${alpha(DETAIL_COLORS.primary, 0.12)}`,
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 16px 48px rgba(37, 99, 235, 0.12)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: variant === 'primary' ? DETAIL_COLORS.gradients.primary : 
                variant === 'secondary' ? DETAIL_COLORS.gradients.secondary :
                variant === 'accent' ? DETAIL_COLORS.gradients.accent :
                DETAIL_COLORS.gradients.corporate,
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: DETAIL_COLORS.gradients.primary,
  borderRadius: 24,
  padding: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.1,
  }
}));

const UserProfileAvatar = styled(Avatar)(({ size = 120 }) => ({
  width: size,
  height: size,
  background: DETAIL_COLORS.gradients.accent,
  boxShadow: '0 8px 32px rgba(5, 150, 105, 0.3)',
  border: '4px solid rgba(255, 255, 255, 0.2)',
  fontSize: size > 80 ? '2.5rem' : '1.5rem',
  fontWeight: 800,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 12px 40px rgba(5, 150, 105, 0.4)',
  }
}));

const StatsCard = styled(DetailCard)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  background: alpha(DETAIL_COLORS.primary, 0.03),
  '&:hover': {
    background: alpha(DETAIL_COLORS.primary, 0.06),
  }
}));

const ActionButton = styled(Button)(({ theme, variant: customVariant = 'primary' }) => ({
  borderRadius: 16,
  padding: theme.spacing(1.5, 3),
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '0.95rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: DETAIL_COLORS.gradients[customVariant] || DETAIL_COLORS.gradients.primary,
  color: 'white',
  border: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(DETAIL_COLORS[customVariant] || DETAIL_COLORS.primary, 0.3)}`,
    background: DETAIL_COLORS.gradients[customVariant] || DETAIL_COLORS.gradients.primary,
  }
}));

const MetricValue = styled(Typography)(({ theme, color = DETAIL_COLORS.primary }) => ({
  fontWeight: 800,
  fontSize: '2rem',
  fontFamily: 'Inter, sans-serif',
  color: color,
  lineHeight: 1,
  marginBottom: theme.spacing(0.5),
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontFamily: 'Inter, sans-serif'
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`detail-tabpanel-${index}`}
    aria-labelledby={`detail-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Fade in={true} timeout={300}>
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      </Fade>
    )}
  </div>
);

export default function UserDetailsPage() {
  const [userData, setUserData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    userRole: '',
    isActive: false,
  });
  
  const router = useRouter();
  const { userId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();

  // FIX: Remove mock data - use only real API
  const fetchActivityData = useCallback(async () => {
    // Skip if already loading or no userId
    if (activityLoading || !userId) return;
    
    try {
      setActivityLoading(true);
      
      console.log(`Fetching activity data for user ID: ${userId}`);
      
      const response = await fetch(`/api/admin/users/${userId}/activity?page=1&pageSize=10`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Activity API failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to fetch activity data: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Activity data fetched successfully:', data);
      
      setActivityData(data);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setSnackbar({
        open: true,
        message: `Failed to load activity data: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setActivityLoading(false);
    }
  }, [userId]); // FIX: Only depend on userId to prevent infinite loops

  // FIX: Remove fetchActivityData from useEffect dependencies
  useEffect(() => {
    // Admin check
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      router.push('/login?redirect=/admin/users');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching user details for ID: ${userId}`);
        
        const response = await fetch(`/api/admin/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user details: ${response.status}`);
        }

        const data = await response.json();
        console.log('User details fetched:', data);
        
        setUserData(data);
        setFormData({
          username: data.user?.Username || '',
          email: data.user?.Email || '',
          userRole: data.user?.UserRole || '',
          isActive: data.user?.IsActive || false,
        });
        
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && user.role === 'admin' && userId) {
      fetchUserDetails();
    }
  }, [isAuthenticated, user, router, userId]); // FIX: Removed tabValue and fetchActivityData dependencies

  // FIX: Separate effect for activity data that only runs when needed
  useEffect(() => {
    // Only fetch activity data when:
    // 1. User details are loaded
    // 2. Current tab is activity tab (index 1)
    // 3. Activity data hasn't been fetched yet
    if (userData && tabValue === 1 && !activityData && !activityLoading) {
      fetchActivityData();
    }
  }, [userData, tabValue, activityData, activityLoading, fetchActivityData]);

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
      setSaving(true);
      
      console.log('Submitting form data:', formData);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          userRole: formData.userRole,
          isActive: formData.isActive
        }),
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update user');
      }

      const result = await response.json();
      console.log('Update successful:', result);

      // Update local state with the new values
      setUserData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          Username: formData.username,
          Email: formData.email,
          UserRole: formData.userRole,
          IsActive: formData.isActive,
        }
      }));
      
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Update error:', err);
      setSnackbar({
        open: true,
        message: `Failed to update user: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // FIX: Prevent page reload during tab changes
  const handleTabChange = (event, newValue) => {
    // Prevent any default behavior that might cause page reload
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log(`Tab changed from ${tabValue} to ${newValue}`);
    
    // Only change tab if it's actually different
    if (newValue !== tabValue) {
      setTabValue(newValue);
      
      // Fetch activity data when switching to activity tab (only if not already loaded)
      if (newValue === 1 && !activityData && !activityLoading) {
        console.log('Loading activity data for tab...');
        fetchActivityData();
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // FIX: Load more activities function
  const loadMoreActivities = useCallback(async () => {
    if (loadMoreLoading || !activityData?.pagination?.hasMore) return;
    
    try {
      setLoadMoreLoading(true);
      
      const nextPage = (activityData?.pagination?.page || 1) + 1;
      console.log(`Loading more activities - page ${nextPage}`);
      
      const response = await fetch(`/api/admin/users/${userId}/activity?page=${nextPage}&pageSize=10`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Load more failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to load more activities: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('More activity data fetched successfully:', data);
      
      // Append new activities to existing ones
      setActivityData(prev => ({
        ...data,
        activities: [...(prev?.activities || []), ...(data?.activities || [])],
        pagination: {
          ...data.pagination,
          page: nextPage
        }
      }));
    } catch (err) {
      console.error('Error loading more activities:', err);
      setSnackbar({
        open: true,
        message: `Failed to load more activities: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoadMoreLoading(false);
    }
  }, [userId, activityData?.pagination, loadMoreLoading]);

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        <DetailCard>
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box>
                <Skeleton variant="text" width={300} height={40} />
                <Skeleton variant="text" width={200} height={24} />
          </Box>
            </Box>
            <Grid container spacing={3}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} md={6} lg={4} key={i}>
                  <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            </Grid>
              ))}
            </Grid>
          </Box>
        </DetailCard>
      </Container>
  );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            fontFamily: 'Inter, sans-serif'
          }}
          action={
            <ActionButton size="small" onClick={() => router.push('/admin/users')}>
              Back to Users
            </ActionButton>
          }
        >
          <Typography variant="h6" sx={{ mb: 1 }}>User Details Error</Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  const userInfo = userData?.user || {};
  const stats = userData?.stats || {};

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Header */}
        <HeaderContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <IconButton 
                onClick={() => router.push('/admin/users')}
          sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <UserProfileAvatar>
                <PersonIcon sx={{ fontSize: '3rem' }} />
              </UserProfileAvatar>
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h3" component="h1" fontWeight={800} sx={{ 
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  fontFamily: 'Inter, sans-serif',
                  mb: 1
                }}>
                  {userInfo.Username || 'Unknown User'}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontFamily: 'Inter, sans-serif', mb: 2 }}>
                  {userInfo.Email || 'No email'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label={userInfo.UserRole?.toUpperCase() || 'USER'} 
                    icon={userInfo.UserRole === 'admin' ? <SecurityIcon /> : <PersonIcon />}
                    sx={{
                      bgcolor: userInfo.UserRole === 'admin' 
                        ? 'rgba(251, 191, 36, 0.2)' 
                        : 'rgba(16, 185, 129, 0.2)', 
                      color: userInfo.UserRole === 'admin' ? '#F59E0B' : '#10B981',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      border: `1px solid ${userInfo.UserRole === 'admin' ? '#F59E0B' : '#10B981'}40`
                    }}
                  />
                  <Chip 
                    label={userInfo.IsActive ? 'ACTIVE' : 'INACTIVE'} 
                    icon={userInfo.IsActive ? <CheckCircleIcon /> : <BlockIcon />}
                    sx={{ 
                      bgcolor: userInfo.IsActive 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : 'rgba(239, 68, 68, 0.2)', 
                      color: userInfo.IsActive ? '#10B981' : '#EF4444',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      border: `1px solid ${userInfo.IsActive ? '#10B981' : '#EF4444'}40`
                    }}
                  />
                </Stack>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              {!editMode ? (
                <ActionButton
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  sx={{ background: DETAIL_COLORS.gradients.secondary }}
                >
                  EDIT USER
                </ActionButton>
              ) : (
                <Stack direction="row" spacing={1}>
                  <ActionButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ background: DETAIL_COLORS.gradients.accent }}
                  >
                    {saving ? 'SAVING...' : 'SAVE'}
                  </ActionButton>
                  <ActionButton
                  variant="outlined"
                  startIcon={<CancelIcon />}
                    onClick={() => setEditMode(false)}
                    sx={{ 
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    CANCEL
                  </ActionButton>
                </Stack>
              )}
            </Box>
          </Box>
        </HeaderContainer>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={3}>
            <StatsCard>
              <UserProfileAvatar size={56} sx={{ mx: 'auto', mb: 2 }}>
                <CalendarIcon />
              </UserProfileAvatar>
              <MetricValue color={DETAIL_COLORS.primary}>
                {userInfo.JoinDate ? new Date(userInfo.JoinDate).toLocaleDateString() : 'N/A'}
              </MetricValue>
              <MetricLabel>Join Date</MetricLabel>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatsCard>
              <UserProfileAvatar size={56} sx={{ mx: 'auto', mb: 2, background: DETAIL_COLORS.gradients.secondary }}>
                <AccessTimeIcon />
              </UserProfileAvatar>
              <MetricValue color={DETAIL_COLORS.secondary}>
                {userInfo.LastLogin ? new Date(userInfo.LastLogin).toLocaleDateString() : 'Never'}
              </MetricValue>
              <MetricLabel>Last Login</MetricLabel>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatsCard>
              <UserProfileAvatar size={56} sx={{ mx: 'auto', mb: 2, background: DETAIL_COLORS.gradients.accent }}>
                <StarsIcon />
              </UserProfileAvatar>
              <MetricValue color={DETAIL_COLORS.accent}>
                {userInfo.TotalPoints || 0}
              </MetricValue>
              <MetricLabel>Total Points</MetricLabel>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <StatsCard>
              <UserProfileAvatar size={56} sx={{ mx: 'auto', mb: 2, background: DETAIL_COLORS.gradients.primary }}>
                <VerifiedIcon />
              </UserProfileAvatar>
              <MetricValue color={DETAIL_COLORS.info}>
                {userInfo.IsEmailVerified ? 'VERIFIED' : 'PENDING'}
              </MetricValue>
              <MetricLabel>Email Status</MetricLabel>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <DetailCard>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              '& .MuiTabs-indicator': {
                background: DETAIL_COLORS.gradients.primary,
                height: 3
              },
              borderBottom: `1px solid ${alpha(DETAIL_COLORS.primary, 0.1)}`,
              px: 2,
              '& .MuiTab-root': {
                textDecoration: 'none',
                '&:focus': {
                  outline: 'none'
                }
              }
            }}
          >
            <Tab 
              icon={<PersonIcon />} 
              label="USER PROFILE" 
              iconPosition="start"
              component="div"
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                '&.Mui-selected': { color: DETAIL_COLORS.primary }
              }}
            />
            <Tab 
              icon={<AnalyticsIcon />} 
              label="ACTIVITY" 
              iconPosition="start"
              component="div"
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                '&.Mui-selected': { color: DETAIL_COLORS.primary }
              }}
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="SECURITY" 
              iconPosition="start"
              component="div"
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                '&.Mui-selected': { color: DETAIL_COLORS.primary }
              }}
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: DETAIL_COLORS.primary
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: DETAIL_COLORS.primary
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>User Role</InputLabel>
                        <Select
                          name="userRole"
                          value={formData.userRole}
                          label="User Role"
                          onChange={handleInputChange}
                        >
                          <MenuItem value="regular">Regular User</MenuItem>
                          <MenuItem value="admin">Administrator</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            name="isActive"
                            color="primary"
                          />
                        }
                        label="Active Status"
                        sx={{ 
                          '& .MuiFormControlLabel-label': {
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </form>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <DetailCard>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <PersonIcon sx={{ color: DETAIL_COLORS.primary }} />
                          <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Inter, sans-serif' }}>
                            Basic Information
                          </Typography>
                        </Stack>
                        <List>
                          <ListItem>
                            <ListItemIcon><PersonIcon sx={{ color: DETAIL_COLORS.primary }} /></ListItemIcon>
                            <ListItemText 
                              primary="Username" 
                              secondary={userInfo.Username || 'N/A'}
                              sx={{ '& .MuiListItemText-primary': { fontFamily: 'Inter, sans-serif', fontWeight: 600 } }}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><EmailIcon sx={{ color: DETAIL_COLORS.primary }} /></ListItemIcon>
                            <ListItemText 
                              primary="Email" 
                              secondary={userInfo.Email || 'N/A'}
                              sx={{ '& .MuiListItemText-primary': { fontFamily: 'Inter, sans-serif', fontWeight: 600 } }}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><SecurityIcon sx={{ color: DETAIL_COLORS.primary }} /></ListItemIcon>
                            <ListItemText 
                              primary="Role" 
                              secondary={userInfo.UserRole || 'N/A'}
                              sx={{ '& .MuiListItemText-primary': { fontFamily: 'Inter, sans-serif', fontWeight: 600 } }}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </DetailCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <DetailCard>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <WalletIcon sx={{ color: DETAIL_COLORS.accent }} />
                          <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Inter, sans-serif' }}>
                            Account Details
                          </Typography>
                        </Stack>
                        <List>
                          <ListItem>
                            <ListItemIcon><CalendarIcon sx={{ color: DETAIL_COLORS.accent }} /></ListItemIcon>
                            <ListItemText 
                              primary="Join Date" 
                              secondary={userInfo.JoinDate ? new Date(userInfo.JoinDate).toLocaleDateString() : 'N/A'}
                              sx={{ '& .MuiListItemText-primary': { fontFamily: 'Inter, sans-serif', fontWeight: 600 } }}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><AccessTimeIcon sx={{ color: DETAIL_COLORS.accent }} /></ListItemIcon>
                            <ListItemText 
                              primary="Last Login" 
                              secondary={userInfo.LastLogin ? new Date(userInfo.LastLogin).toLocaleDateString() : 'Never'}
                              sx={{ '& .MuiListItemText-primary': { fontFamily: 'Inter, sans-serif', fontWeight: 600 } }}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><WalletIcon sx={{ color: DETAIL_COLORS.accent }} /></ListItemIcon>
                            <ListItemText 
                              primary="Wallet Address" 
                              secondary={userInfo.WalletAddress || 'Not connected'}
                              sx={{ '& .MuiListItemText-primary': { fontFamily: 'Inter, sans-serif', fontWeight: 600 } }}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </DetailCard>
                  </Grid>
                </Grid>
              )}
                        </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <DetailCard>
                          <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <TimelineIcon sx={{ color: DETAIL_COLORS.secondary }} />
                    <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Inter, sans-serif' }}>
                      Activity Timeline
                                </Typography>
                  </Stack>
                  
                  {/* Activity Stats Row */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <StatsCard>
                        <UserProfileAvatar size={48} sx={{ mx: 'auto', mb: 1, background: DETAIL_COLORS.gradients.primary }}>
                          <SchoolIcon />
                        </UserProfileAvatar>
                        <MetricValue color={DETAIL_COLORS.primary} sx={{ fontSize: '1.5rem' }}>
                          {activityData?.stats?.CourseProgress ?? stats?.completedCourses ?? 0}
                        </MetricValue>
                        <MetricLabel>Courses In Progress</MetricLabel>
                      </StatsCard>
                              </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <StatsCard>
                        <UserProfileAvatar size={48} sx={{ mx: 'auto', mb: 1, background: DETAIL_COLORS.gradients.secondary }}>
                          <QuizIcon />
                        </UserProfileAvatar>
                        <MetricValue color={DETAIL_COLORS.secondary} sx={{ fontSize: '1.5rem' }}>
                          {activityData?.stats?.QuizAttempts ?? stats?.passedQuizzes ?? 0}
                        </MetricValue>
                        <MetricLabel>Quiz Attempts</MetricLabel>
                      </StatsCard>
                              </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <StatsCard>
                        <UserProfileAvatar size={48} sx={{ mx: 'auto', mb: 1, background: DETAIL_COLORS.gradients.accent }}>
                          <EmojiEventsIcon />
                        </UserProfileAvatar>
                        <MetricValue color={DETAIL_COLORS.accent} sx={{ fontSize: '1.5rem' }}>
                          {activityData?.stats?.CompletedQuests ?? stats?.completedQuests ?? 0}
                        </MetricValue>
                        <MetricLabel>Quests Completed</MetricLabel>
                      </StatsCard>
                              </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <StatsCard>
                        <UserProfileAvatar size={48} sx={{ mx: 'auto', mb: 1, background: DETAIL_COLORS.gradients.success }}>
                          <VideocamIcon />
                        </UserProfileAvatar>
                        <MetricValue color={DETAIL_COLORS.success} sx={{ fontSize: '1.5rem' }}>
                          {activityData?.stats?.VideoViews ?? stats?.watchedVideos ?? 0}
                        </MetricValue>
                        <MetricLabel>Videos Watched</MetricLabel>
                      </StatsCard>
                              </Grid>
                      </Grid>

                  {/* Activity Timeline */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, fontFamily: 'Inter, sans-serif', color: DETAIL_COLORS.primary }}>
                      Recent Activity
                                    </Typography>
                    
                    {activityLoading ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <CircularProgress sx={{ color: DETAIL_COLORS.primary, mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Loading activity data...
                                    </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={2}>
                        {(activityData?.activities || []).length === 0 ? (
                          <DetailCard>
                            <CardContent sx={{ py: 6, textAlign: 'center' }}>
                              <UserProfileAvatar 
                                size={60} 
                                    sx={{ 
                                  mx: 'auto', 
                                  mb: 2,
                                  background: alpha(DETAIL_COLORS.primary, 0.1),
                                  color: DETAIL_COLORS.primary
                                }}
                              >
                                <TimelineIcon />
                              </UserProfileAvatar>
                              <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: DETAIL_COLORS.primary }}>
                                No Activity Yet
                                    </Typography>
                              <Typography variant="body2" color="text.secondary">
                                This user hasn't performed any activities yet. Activity will appear here once they start using the platform.
                                    </Typography>
                          </CardContent>
                          </DetailCard>
                        ) : (
                          (activityData?.activities || []).map((activity, index) => {
                            // Determine activity icon and color based on type
                            let icon = <TimelineIcon />;
                            let color = DETAIL_COLORS.info;
                            
                            switch (activity.ActivityType) {
                              case 'course_enrollment':
                                icon = <SchoolIcon />;
                                color = DETAIL_COLORS.primary;
                                break;
                              case 'quiz_completed':
                                icon = <QuizIcon />;
                                color = DETAIL_COLORS.secondary;
                                break;
                              case 'quest_completed':
                                icon = <EmojiEventsIcon />;
                                color = DETAIL_COLORS.accent;
                                break;
                              case 'video_watched':
                                icon = <VideocamIcon />;
                                color = DETAIL_COLORS.success;
                                break;
                              case 'login':
                                icon = <PersonIcon />;
                                color = DETAIL_COLORS.info;
                                break;
                              default:
                                icon = <TimelineIcon />;
                                color = DETAIL_COLORS.info;
                            }
                            
                            // Format timestamp
                            const formatTimestamp = (timestamp) => {
                              try {
                                const date = new Date(timestamp);
                                const now = new Date();
                                const diffMs = now - date;
                                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                const diffDays = Math.floor(diffHours / 24);
                                
                                if (diffDays > 7) {
                                  return date.toLocaleDateString();
                                } else if (diffDays > 0) {
                                  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                                } else if (diffHours > 0) {
                                  return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                                } else {
                                  return 'Just now';
                                }
                              } catch (e) {
                                return 'Unknown time';
                              }
                            };
                            
                            return (
                              <DetailCard key={index} sx={{ background: alpha(color, 0.02) }}>
                                <CardContent sx={{ p: 2 }}>
                                  <Box display="flex" alignItems="flex-start" gap={2}>
                                    <UserProfileAvatar 
                                      size={40} 
              sx={{ 
                                        background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                                        flexShrink: 0
                                      }}
                                    >
                                      {icon}
                                    </UserProfileAvatar>
                                    
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography 
                                        variant="subtitle1" 
                                        fontWeight={600} 
                  sx={{ 
                                          fontFamily: 'Inter, sans-serif',
                                          color: color,
                                          mb: 0.5
                                        }}
                                      >
                                        {activity.Title || activity.ActivityType?.replace('_', ' ').toUpperCase() || 'Activity'}
                    </Typography>
                                      
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                        sx={{ 
                                          fontFamily: 'Inter, sans-serif',
                                          mb: 1 
                                        }}
                                      >
                                        {activity.Description || 'No description available'}
                        </Typography>
                                      
                                      <Typography 
                                        variant="caption" 
                  sx={{ 
                                          color: alpha(color, 0.7),
                                          fontFamily: 'Inter, sans-serif',
                                          fontWeight: 600
                                        }}
                                      >
                                        {formatTimestamp(activity.Timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                              </DetailCard>
                            );
                          })
                        )}
                      </Stack>
                    )}
                    
                    {/* Load More Button */}
                    {activityData?.pagination?.hasMore && (
                      <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <ActionButton 
                          variant="outlined"
                          onClick={loadMoreActivities}
                          disabled={loadMoreLoading}
                          startIcon={loadMoreLoading ? <CircularProgress size={16} /> : null}
                    sx={{ 
                            borderColor: DETAIL_COLORS.primary,
                            color: DETAIL_COLORS.primary,
                            background: 'transparent',
                            '&:hover': {
                              background: alpha(DETAIL_COLORS.primary, 0.1),
                              transform: loadMoreLoading ? 'none' : 'translateY(-1px)'
                            },
                            '&.Mui-disabled': {
                              borderColor: alpha(DETAIL_COLORS.primary, 0.3),
                              color: alpha(DETAIL_COLORS.primary, 0.5)
                            }
                          }}
                        >
                          {loadMoreLoading ? 'Loading...' : 'Load More Activities'}
                        </ActionButton>
                      </Box>
                )}
              </Box>
                </CardContent>
              </DetailCard>
          </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
              <DetailCard>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <SecurityIcon sx={{ color: DETAIL_COLORS.warning }} />
                    <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'Inter, sans-serif' }}>
                      Security Settings
                          </Typography>
                  </Stack>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem>
                          <ListItemIcon><VerifiedIcon sx={{ color: DETAIL_COLORS.success }} /></ListItemIcon>
                          <ListItemText 
                            primary="Email Verification" 
                            secondary={userInfo.IsEmailVerified ? 'Verified' : 'Pending verification'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><SecurityIcon sx={{ color: DETAIL_COLORS.warning }} /></ListItemIcon>
                          <ListItemText 
                            primary="Account Status" 
                            secondary={userInfo.IsActive ? 'Active' : 'Inactive'}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </DetailCard>
                        </Box>
          </TabPanel>
        </DetailCard>
      </Container>
    </>
  );
}