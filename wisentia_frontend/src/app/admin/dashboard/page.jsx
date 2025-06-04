'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { styled } from '@mui/material/styles';

// MUI imports
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  LinearProgress,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar,
  IconButton,
  Fade,
  Grow,
  Tooltip,
  Stack,
  Chip,
  Button,
  Divider,
  Paper,
  Container,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  alpha,
  useMediaQuery
} from '@mui/material';

// MUI icons
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Subscriptions as SubscriptionIcon,
  VideoLibrary as VideoIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  Biotech as BiotechIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Insights as InsightsIcon,
  Memory as MemoryIcon,
  Hub as HubIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  MenuBook as MenuBookIcon,
  PlayCircle as PlayCircleIcon,
  Token as TokenIcon,
  LocalActivity as ActivityIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Today as TodayIcon,
  Event as EventIcon,
  AutoGraph as AutoGraphIcon,
  MonitorHeart as HealthIcon
} from '@mui/icons-material';

// Recharts for data visualization
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

// Modern Green-Orange Theme (Different from system-health)
const COLORS = {
  primary: '#059669',        // Emerald Green
  secondary: '#F97316',      // Orange
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  info: '#06B6D4',           // Cyan
  accent: '#8B5CF6',         // Purple
  gradients: {
    primary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    secondary: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    info: 'linear-gradient(135deg, #06B6D4 0%, #38BDF8 100%)',
    accent: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    hero: 'linear-gradient(135deg, #059669 0%, #F97316 100%)'
  }
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.info,
  COLORS.accent,
  '#EC4899', // Pink
  '#06B6D4'  // Cyan
];

// Styled Components with Glassmorphism (inspired by system-health)
const GlassCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: variant === 'primary' 
    ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)'
    : 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: variant === 'primary' ? COLORS.gradients.primary :
                variant === 'secondary' ? COLORS.gradients.secondary :
                variant === 'success' ? COLORS.gradients.success :
                variant === 'warning' ? COLORS.gradients.warning :
                variant === 'info' ? COLORS.gradients.info :
                variant === 'accent' ? COLORS.gradients.accent :
                'transparent',
  }
}));

const DashboardContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
    : 'linear-gradient(135deg, #ECFDF5 0%, #FEF3E2 100%)', // Green to Orange gradient background
}));

const AnimatedCounter = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  background: COLORS.gradients.primary,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  transition: 'all 0.3s ease',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  }
}));

const ModernAvatar = styled(Avatar)(({ color, theme }) => ({
  width: 64,
  height: 64,
  background: color || COLORS.gradients.primary,
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: COLORS.gradients.hero,
  borderRadius: theme.spacing(4),
  padding: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(5, 150, 105, 0.3)',
}));

const MetricCard = styled(GlassCard)(({ theme, color }) => {
  // Create gradient based on the solid color passed
  const getGradientFromColor = (solidColor) => {
    switch (solidColor) {
      case COLORS.primary: return COLORS.gradients.primary;
      case COLORS.secondary: return COLORS.gradients.secondary;
      case COLORS.success: return COLORS.gradients.success;
      case COLORS.warning: return COLORS.gradients.warning;
      case COLORS.info: return COLORS.gradients.info;
      case COLORS.accent: return COLORS.gradients.accent;
      default: return COLORS.gradients.primary;
    }
  };

  return {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: '-20px',
      width: '80px',
      height: '80px',
      background: `linear-gradient(135deg, ${alpha(color || COLORS.primary, 0.1)}, ${alpha(color || COLORS.primary, 0.05)})`,
      borderRadius: '50%',
      transform: 'translateY(-50%)',
      transition: 'all 0.3s ease',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: getGradientFromColor(color),
    }
  };
});

const InteractiveChip = styled(Chip)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const ChartContainer = styled(GlassCard)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [refreshing, setRefreshing] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [userAuth, setUserAuth] = useState({ user: null, isAuthenticated: false });
  
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setSnackbar({
          open: true,
          message: 'Dashboard data loaded successfully',
          severity: 'success'
        });
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (err) {
      console.error('Dashboard API error:', err);
      setError(`Failed to load data: ${err.message}`);
      setSnackbar({
        open: true,
        message: `API Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Safe auth hook usage with error handling
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const { user, isAuthenticated } = useAuth();
        if (mounted) {
          setUserAuth({ user, isAuthenticated });
          setAuthReady(true);
        }
      } catch (authError) {
        console.warn('Auth context not available, checking localStorage');
        if (typeof window !== 'undefined' && mounted) {
          try {
            const storedUser = localStorage.getItem('user');
            const accessToken = localStorage.getItem('access_token');
            if (storedUser && accessToken) {
              const user = JSON.parse(storedUser);
              setUserAuth({ user, isAuthenticated: true });
              setAuthReady(true);
            } else {
              router.push('/login?redirect=/admin/dashboard');
            }
          } catch (e) {
            console.error('Error checking stored auth:', e);
            router.push('/login?redirect=/admin/dashboard');
          }
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (authReady && !userAuth.isAuthenticated) {
      router.push('/login?redirect=/admin/dashboard');
    } else if (authReady && userAuth.isAuthenticated && userAuth.user?.role !== 'admin') {
      router.push('/login?redirect=/admin/dashboard');
    } else if (authReady && userAuth.isAuthenticated && userAuth.user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [authReady, userAuth.isAuthenticated, userAuth.user?.role, router, fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get system metrics similar to system-health
  const getSystemMetrics = () => {
    if (!dashboardData) return [];
    
    return [
      {
        label: 'Total Users',
        value: dashboardData?.summary?.totalUsers || 0,
        icon: PeopleIcon,
        color: COLORS.primary,
        trend: 'up',
        change: '+12%',
        changeLabel: 'vs last month'
      },
      {
        label: 'New Users',
        value: dashboardData?.summary?.newUsers || 0,
        icon: PersonIcon,
        color: COLORS.success,
        trend: 'up',
        change: '+8%',
        changeLabel: 'this month'
      },
      {
        label: 'Active Courses',
        value: dashboardData?.summary?.activeCourses || 0,
        icon: SchoolIcon,
        color: COLORS.info,
        trend: 'stable',
        change: '+2%',
        changeLabel: 'this week'
      },
      {
        label: 'Active Quests',
        value: dashboardData?.summary?.activeQuests || 0,
        icon: QuestIcon,
        color: COLORS.accent,
        trend: 'up',
        change: '+15%',
        changeLabel: 'vs last week'
      },
      {
        label: 'Total NFTs',
        value: dashboardData?.summary?.totalNFTs || 0,
        icon: TokenIcon,
        color: COLORS.warning,
        trend: 'up',
        change: '+25%',
        changeLabel: 'new minted'
      },
      {
        label: 'Subscriptions',
        value: dashboardData?.summary?.activeSubscriptions || 0,
        icon: SubscriptionIcon,
        color: COLORS.secondary,
        trend: 'up',
        change: '+18%',
        changeLabel: 'this month'
      }
    ];
  };

  if (loading) {
    return (
      <DashboardContainer maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: COLORS.primary, mb: 3 }} />
          <Typography variant="h6" sx={{ color: COLORS.primary }}>
            Loading Dashboard...
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <DashboardContainer maxWidth="xl">
        {/* Modern Header inspired by system-health */}
        <HeaderContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <ModernAvatar>
                <DashboardIcon sx={{ fontSize: 32 }} />
              </ModernAvatar>
              <Box>
                <Typography variant="h3" component="h1" fontWeight={800} sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                  Admin Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                  WISENTIA Platform Management Center
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                  Welcome back, {userAuth.user?.username || 'Administrator'} • System Status: Operational
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <InteractiveChip
                icon={<SecurityIcon />}
                label="System Healthy"
                variant="filled"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem'
                }}
              />
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'rotate(180deg)'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </HeaderContainer>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics Cards */}
        {dashboardData && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {getSystemMetrics().map((metric, index) => (
                <Grid item xs={12} sm={6} lg={2} key={index}>
                  <MetricCard color={metric.color}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <ModernAvatar 
                          sx={{
                            width: 56, 
                            height: 56,
                            background: metric.color === COLORS.primary ? COLORS.gradients.primary :
                                       metric.color === COLORS.secondary ? COLORS.gradients.secondary :
                                       metric.color === COLORS.success ? COLORS.gradients.success :
                                       metric.color === COLORS.warning ? COLORS.gradients.warning :
                                       metric.color === COLORS.info ? COLORS.gradients.info :
                                       metric.color === COLORS.accent ? COLORS.gradients.accent :
                                       COLORS.gradients.primary
                          }}
                        >
                          <metric.icon sx={{ fontSize: 28 }} />
                        </ModernAvatar>
                        <InteractiveChip
                          label={metric.trend === 'up' ? '+' + metric.change : metric.change}
                          size="small"
                          color={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      
                      <AnimatedCounter>
                        {metric.value.toLocaleString()}
                      </AnimatedCounter>
                      
                      <Typography color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                        {metric.label}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        {metric.change} {metric.changeLabel}
                      </Typography>
                    </CardContent>
                  </MetricCard>
                </Grid>
              ))}
            </Grid>

            {/* Charts and Analytics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Active Users List */}
              <Grid item xs={12} md={6}>
                <ChartContainer>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <AutoGraphIcon sx={{ color: COLORS.primary }} />
                    <Typography variant="h6" fontWeight={700}>
                      Most Active Users
                    </Typography>
                    <InteractiveChip label="Top performers" size="small" variant="outlined" />
                  </Box>
                  
                  <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                    {(dashboardData?.activeUsers || []).map((user, index) => (
                      <ListItem key={user?.UserID || index} sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <ModernAvatar 
                            sx={{ 
                              width: 48, 
                              height: 48,
                              background: `linear-gradient(135deg, ${CHART_COLORS[index % CHART_COLORS.length]}, ${alpha(CHART_COLORS[index % CHART_COLORS.length], 0.7)})`,
                              color: 'white',
                              fontWeight: 600
                            }}
                          >
                            {(user?.Username || 'U').charAt(0).toUpperCase()}
                          </ModernAvatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user?.Username || 'Unknown User'}
                          secondary={`${user?.ActivityCount || 0} activities`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <InteractiveChip 
                          label={`#${index + 1}`} 
                          size="small" 
                          color={index < 3 ? 'primary' : 'default'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </ChartContainer>
              </Grid>

              {/* Popular Courses */}
              <Grid item xs={12} md={6}>
                <ChartContainer>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <InsightsIcon sx={{ color: COLORS.secondary }} />
                    <Typography variant="h6" fontWeight={700}>
                      Popular Courses
                    </Typography>
                    <InteractiveChip label="Trending" size="small" variant="outlined" />
                  </Box>
                  
                  <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                    {(dashboardData?.popularCourses || []).map((course, index) => (
                      <ListItem key={course?.CourseID || index} sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <ModernAvatar 
                            sx={{ 
                              width: 48, 
                              height: 48,
                              background: COLORS.gradients.info,
                              color: 'white'
                            }}
                          >
                            <SchoolIcon />
                          </ModernAvatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={course?.Title || 'Unknown Course'}
                          secondary={`${course?.EnrolledUsers || 0} enrollments`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <Badge 
                          badgeContent={course?.EnrolledUsers || 0} 
                          color="primary" 
                          max={999}
                        />
                      </ListItem>
                    ))}
                  </List>
                </ChartContainer>
              </Grid>
            </Grid>

            {/* Recent Activities Section */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartContainer>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <ActivityIcon sx={{ color: COLORS.accent }} />
                      <Typography variant="h6" fontWeight={700}>
                        Recent Activities
                      </Typography>
                    </Box>
                    <InteractiveChip
                      icon={<NotificationsIcon />}
                      label="Live Feed"
                      size="small"
                      sx={{ 
                        background: alpha(COLORS.success, 0.1),
                        color: COLORS.success,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {(dashboardData?.recentActivities || []).map((activity, index) => {
                      const activityColor = CHART_COLORS[index % CHART_COLORS.length];
                      const activityKey = activity?.LogID || `activity-${index}`;
                      
                      return (
                        <Box
                          key={activityKey}
                          sx={{
                            p: 2.5,
                            mb: 1.5,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(activityColor, 0.05)}, ${alpha(activityColor, 0.02)})`,
                            border: `1px solid ${alpha(activityColor, 0.1)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${alpha(activityColor, 0.08)}, ${alpha(activityColor, 0.04)})`,
                              transform: 'translateX(4px)',
                              boxShadow: `0 4px 20px ${alpha(activityColor, 0.15)}`,
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <ModernAvatar sx={{ 
                              background: `linear-gradient(135deg, ${alpha(activityColor, 0.2)}, ${alpha(activityColor, 0.1)})`,
                              color: activityColor,
                              width: 48,
                              height: 48
                            }}>
                              <ActivityIcon sx={{ fontSize: '1.2rem' }} />
                            </ModernAvatar>
                            <Box flex={1}>
                              <Typography variant="body1" fontWeight={600}>
                                {activity?.Username || 'Unknown User'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {activity?.ActivityType || 'Activity'}: {activity?.Description || 'No description'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              background: alpha(activityColor, 0.1),
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 500
                            }}>
                              {activity?.Timestamp ? new Date(activity.Timestamp).toLocaleString('en-US') : 'Unknown time'}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </ChartContainer>
              </Grid>
            </Grid>
          </>
        )}
      </DashboardContainer>
    </>
  );
}