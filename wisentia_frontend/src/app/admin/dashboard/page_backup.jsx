'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { alpha, styled } from '@mui/material/styles';
import ActivityCard from '@/components/admin/ActivityCard';

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
  Container
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
  TrendingDown as TrendingDownIcon
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Modern Scientific Laboratory Color Scheme
const DASHBOARD_COLORS = {
  primary: '#0A4B78',        // Deep Lab Blue
  secondary: '#1976D2',      // Bright Blue  
  accent: '#00ACC1',         // Cyan
  success: '#00C853',        // Green
  warning: '#FF9800',        // Orange
  error: '#F44336',          // Red
  purple: '#7B1FA2',         // Purple
  teal: '#00695C',           // Teal
  indigo: '#3F51B5',         // Indigo
  gradients: {
    primary: 'linear-gradient(135deg, #0A4B78 0%, #1976D2 50%, #00ACC1 100%)',
    secondary: 'linear-gradient(135deg, #1976D2 0%, #00ACC1 100%)',
    success: 'linear-gradient(135deg, #00C853 0%, #4CAF50 100%)',
    warning: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    error: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
    cosmic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    purple: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
    laboratory: 'linear-gradient(135deg, #0A4B78 0%, #1976D2 30%, #00ACC1 60%, #00C853 100%)'
  }
};

// Chart colors for consistency
const CHART_COLORS = [
  DASHBOARD_COLORS.primary,
  DASHBOARD_COLORS.secondary,
  DASHBOARD_COLORS.accent,
  DASHBOARD_COLORS.success,
  DASHBOARD_COLORS.warning,
  DASHBOARD_COLORS.purple,
  DASHBOARD_COLORS.teal,
  DASHBOARD_COLORS.indigo
];

// Styled Components with Scientific Theme
const DashboardContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, 
    ${alpha('#0A4B78', 0.02)} 0%, 
    ${alpha('#1976D2', 0.03)} 25%, 
    ${alpha('#00ACC1', 0.02)} 50%, 
    ${alpha('#00C853', 0.03)} 75%, 
    ${alpha('#0A4B78', 0.02)} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23${DASHBOARD_COLORS.primary.slice(1)}" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.3,
    pointerEvents: 'none'
  }
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: DASHBOARD_COLORS.gradients.laboratory,
  color: 'white',
  borderRadius: 28,
  marginBottom: theme.spacing(4),
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 20px 60px rgba(10, 75, 120, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '40%',
    height: '100%',
    background: `url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath fill="rgba(255,255,255,0.1)" d="M45.7,-78.4C58.5,-72.1,67.5,-57.7,71.8,-42.4C76.1,-27.1,75.7,-10.9,76.5,5.9C77.3,22.7,79.3,40.1,72.8,53.5C66.3,66.9,51.3,76.3,35.1,82.2C18.9,88.1,1.5,90.5,-16.6,88.9C-34.7,87.3,-53.5,81.7,-68.8,70.9C-84.1,60.1,-95.9,44.1,-99.2,26.8C-102.5,9.5,-97.3,-9.1,-87.6,-25.4C-77.9,-41.7,-63.7,-55.7,-47.8,-60.9C-31.9,-66.1,-14.3,-62.5,2.6,-67.1C19.5,-71.7,32.9,-84.7,45.7,-78.4Z"/%3E%3C/path%3E%3C/svg%3E")`,
    backgroundSize: 'cover',
    opacity: 0.1
  }
}));

const MetricCard = styled(Card)(({ theme, variant = 'default' }) => {
  const getGradient = () => {
    switch (variant) {
      case 'users': return DASHBOARD_COLORS.gradients.primary;
      case 'courses': return DASHBOARD_COLORS.gradients.secondary;
      case 'quests': return DASHBOARD_COLORS.gradients.success;
      case 'nfts': return DASHBOARD_COLORS.gradients.warning;
      case 'subscriptions': return DASHBOARD_COLORS.gradients.purple;
      case 'activities': return DASHBOARD_COLORS.gradients.cosmic;
      default: return DASHBOARD_COLORS.gradients.primary;
    }
  };

  return {
    background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    border: `1px solid ${alpha(DASHBOARD_COLORS.primary, 0.1)}`,
    boxShadow: '0 8px 32px rgba(10, 75, 120, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 20px 60px rgba(10, 75, 120, 0.2)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: getGradient(),
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      right: '-20px',
      width: '100px',
      height: '100px',
      background: getGradient(),
      borderRadius: '50%',
      opacity: 0.05,
      transform: 'translateY(-50%)',
    }
  };
});

const ChartCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: `1px solid ${alpha(DASHBOARD_COLORS.primary, 0.08)}`,
  boxShadow: '0 12px 40px rgba(10, 75, 120, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 60px rgba(10, 75, 120, 0.15)',
  }
}));

const StatValue = styled(Typography)(({ theme, color = DASHBOARD_COLORS.primary }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  fontFamily: '"Inter", "Roboto", sans-serif',
  background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  lineHeight: 1,
  marginBottom: theme.spacing(0.5),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: alpha(theme.palette.text.primary, 0.7),
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontFamily: '"Inter", "Roboto", sans-serif'
}));

const IconContainer = styled(Box)(({ color = DASHBOARD_COLORS.primary }) => ({
  width: 56,
  height: 56,
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.2)})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
  '& svg': {
    fontSize: '1.8rem',
    color: color
  }
}));

const ActivityItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
  border: `1px solid ${alpha(DASHBOARD_COLORS.primary, 0.05)}`,
  marginBottom: theme.spacing(1.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${alpha(DASHBOARD_COLORS.primary, 0.02)}, ${alpha(DASHBOARD_COLORS.primary, 0.05)})`,
    transform: 'translateX(8px)',
    borderColor: alpha(DASHBOARD_COLORS.primary, 0.15)
  }
}));

const RefreshButton = styled(IconButton)(({ theme }) => ({
  background: DASHBOARD_COLORS.gradients.secondary,
  color: 'white',
  width: 48,
  height: 48,
  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: DASHBOARD_COLORS.gradients.secondary,
    transform: 'rotate(180deg) scale(1.1)',
    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
  }
}));

// Sample data with enhanced structure
const createEnhancedDummyData = () => ({
  summary: {
    totalUsers: 2847,
    newUsers: 186,
    activeCourses: 124,
    activeQuests: 298,
    totalNFTs: 1456,
    activeSubscriptions: 934,
    todayActivities: 1247,
    systemHealth: 98.5
  },
  metrics: {
    userGrowth: 12.5,
    courseCompletion: 87.3,
    questSuccess: 76.8,
    nftMinting: 145.2,
    revenueGrowth: 23.7,
    engagement: 89.4
  },
  userDistribution: [
    { name: 'Active Learners', value: 45, color: DASHBOARD_COLORS.success },
    { name: 'New Users', value: 25, color: DASHBOARD_COLORS.secondary },
    { name: 'Premium Members', value: 20, color: DASHBOARD_COLORS.warning },
    { name: 'Inactive', value: 10, color: DASHBOARD_COLORS.error }
  ],
  dailyActivities: [
    { day: 'Mon', users: 245, courses: 89, quests: 156 },
    { day: 'Tue', users: 298, courses: 112, quests: 134 },
    { day: 'Wed', users: 367, courses: 145, quests: 189 },
    { day: 'Thu', users: 423, courses: 167, quests: 201 },
    { day: 'Fri', users: 456, courses: 189, quests: 178 },
    { day: 'Sat', users: 378, courses: 134, quests: 145 },
    { day: 'Sun', users: 289, courses: 98, quests: 123 }
  ],
  recentActivities: [
    {
      id: 1,
      user: 'Dr. Sarah Chen',
      action: 'Completed Advanced Blockchain course',
      time: '2 minutes ago',
      type: 'course_completion',
      icon: SchoolIcon,
      color: DASHBOARD_COLORS.success
    },
    {
      id: 2,
      user: 'Prof. Michael Rodriguez',
      action: 'Earned "DeFi Master" NFT',
      time: '8 minutes ago',
      type: 'nft_earned',
      icon: StarIcon,
      color: DASHBOARD_COLORS.warning
    },
    {
      id: 3,
      user: 'Dr. Emily Watson',
      action: 'Started "Smart Contract Security" quest',
      time: '15 minutes ago',
      type: 'quest_started',
      icon: QuestIcon,
      color: DASHBOARD_COLORS.accent
    },
    {
      id: 4,
      user: 'John Harrison',
      action: 'Subscribed to Premium Plan',
      time: '23 minutes ago',
      type: 'subscription',
      icon: SubscriptionIcon,
      color: DASHBOARD_COLORS.purple
    },
    {
      id: 5,
      user: 'Dr. Lisa Park',
      action: 'Published new course "Web3 Fundamentals"',
      time: '1 hour ago',
      type: 'course_published',
      icon: VideoIcon,
      color: DASHBOARD_COLORS.secondary
    }
  ],
  platformStats: [
    { label: 'CPU Usage', value: 23, unit: '%', status: 'healthy' },
    { label: 'Memory', value: 67, unit: '%', status: 'warning' },
    { label: 'Storage', value: 45, unit: '%', status: 'healthy' },
    { label: 'Network', value: 89, unit: '%', status: 'excellent' }
  ]
});

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(createEnhancedDummyData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [refreshing, setRefreshing] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Transform API data to match our enhanced structure
        const enhancedData = {
          ...createEnhancedDummyData(),
          summary: {
            ...createEnhancedDummyData().summary,
            totalUsers: data.summary?.totalUsers || 0,
            newUsers: data.summary?.newUsers || 0,
            activeCourses: data.summary?.activeCourses || 0,
            activeQuests: data.summary?.activeQuests || 0,
            totalNFTs: data.summary?.totalNFTs || 0,
            activeSubscriptions: data.summary?.activeSubscriptions || 0
          }
        };
        setDashboardData(enhancedData);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard API error:', err);
      setError('Unable to load dashboard data. Using sample data.');
      setSnackbar({
        open: true,
        message: 'Connected to demo mode with sample data',
        severity: 'info'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <DashboardContainer maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: DASHBOARD_COLORS.primary, mb: 3 }} />
          <Typography variant="h6" sx={{ color: DASHBOARD_COLORS.primary, fontFamily: '"Inter", sans-serif' }}>
            Initializing Laboratory Dashboard...
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

      <DashboardContainer maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <HeaderCard>
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
                <Box display="flex" alignItems="center" gap={3}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '2rem'
                    }}
                  >
                    <ScienceIcon sx={{ fontSize: '2.5rem' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" component="h1" fontWeight={800} sx={{ 
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                      fontFamily: '"Inter", sans-serif',
                      mb: 1,
                      textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      WISENTIA Laboratory
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      opacity: 0.9, 
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 400
                    }}>
                      Advanced Learning Analytics & Management Console
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      opacity: 0.7, 
                      mt: 1,
                      fontFamily: '"Inter", sans-serif'
                    }}>
                      Welcome back, {user?.username || 'Administrator'} • System Status: Operational
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    icon={<BiotechIcon />}
                    label={`Health: ${dashboardData.summary.systemHealth}%`}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 600
                    }}
                  />
                  <Tooltip title="Refresh Data">
                    <RefreshButton
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <RefreshIcon />
                    </RefreshButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </HeaderCard>
        </Fade>

        {/* Rest of the component content */}
      </DashboardContainer>
    </>
  );
}