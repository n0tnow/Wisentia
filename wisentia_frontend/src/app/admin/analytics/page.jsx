"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Snackbar,
  Alert,
  AlertTitle,
  styled,
  Grid,
  Avatar,
  Container,
  useMediaQuery,
  useTheme as useMuiTheme,
  Fade,
  IconButton,
  LinearProgress,
  alpha,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
  TaskAlt as TaskIcon,
  Toll as NFTIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon,
  DataUsage as DataUsageIcon,
  Equalizer as EqualizerIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Monitor as MonitorIcon,
  QueryStats as StatsIcon,
  AccessTime as TimeIcon,
  LooksOne as NumberOneIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Scientific Data Colors
const DATA_COLORS = {
  primary: '#00F5FF',     // Bright Cyan
  secondary: '#FF1493',   // Deep Pink  
  accent: '#00FF00',      // Lime Green
  warning: '#FFD700',     // Gold
  success: '#32CD32',     // Lime Green
  info: '#1E90FF',        // Dodger Blue
  neutral: '#6B7280',     // Gray
  glass: 'rgba(0, 245, 255, 0.1)',
  gradients: {
    primary: 'linear-gradient(135deg, #00F5FF 0%, #0080FF 100%)',
    secondary: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
    accent: 'linear-gradient(135deg, #00FF00 0%, #32CD32 100%)',
    warning: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    success: 'linear-gradient(135deg, #32CD32 0%, #90EE90 100%)',
    info: 'linear-gradient(135deg, #1E90FF 0%, #87CEEB 100%)',
    data: 'linear-gradient(135deg, #8A2BE2 0%, #DA70D6 100%)'
  }
};

// OPTIMIZATION: Chart colors
const CHART_COLORS = [
  DATA_COLORS.primary,
  DATA_COLORS.secondary,
  DATA_COLORS.accent,
  DATA_COLORS.warning,
  DATA_COLORS.success,
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#84CC16'
];

// OPTIMIZATION: Cache ve loading optimization
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache
let cachedData = null;
let cacheTimestamp = null;

const isCacheValid = () => {
  return cachedData && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION);
};

// Scientific Style Components
const DataCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(DATA_COLORS.primary, 0.2)}`,
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
      '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(DATA_COLORS.primary, 0.4)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: variant === 'primary' ? DATA_COLORS.gradients.primary : 
                variant === 'secondary' ? DATA_COLORS.gradients.secondary :
                variant === 'accent' ? DATA_COLORS.gradients.accent :
                DATA_COLORS.gradients.data,
  }
}));

const ScientificTab = styled(Tab)(({ theme }) => ({
  color: alpha(theme.palette.text.primary, 0.7),
  fontSize: '0.875rem',
  fontWeight: 600,
  minHeight: 56,
  textTransform: 'none',
  borderRadius: 0,
  margin: 0,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  minWidth: 120,
  '&.Mui-selected': {
    color: DATA_COLORS.primary,
    fontWeight: 700,
    background: alpha(DATA_COLORS.primary, 0.08),
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      background: DATA_COLORS.gradients.primary,
    }
  },
  '&:hover': {
    color: DATA_COLORS.primary,
    background: alpha(DATA_COLORS.primary, 0.04),
  },
}));

const DataMetric = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: 8,
  background: alpha(DATA_COLORS.primary, 0.04),
  border: `1px solid ${alpha(DATA_COLORS.primary, 0.1)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: alpha(DATA_COLORS.primary, 0.08),
    transform: 'scale(1.02)',
  }
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.25rem',
  fontFamily: 'monospace',
  color: DATA_COLORS.primary,
  lineHeight: 1,
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  }
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
    background: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.6)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(DATA_COLORS.primary, 0.1)}`,
  borderRadius: 8,
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    border: `1px solid ${alpha(DATA_COLORS.primary, 0.2)}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  }
}));

const DataAvatar = styled(Avatar)(({ color, size = 48 }) => ({
  width: size,
  height: size,
  background: color || DATA_COLORS.gradients.primary,
  boxShadow: `0 4px 12px ${alpha(DATA_COLORS.primary, 0.3)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 6px 16px ${alpha(DATA_COLORS.primary, 0.4)}`,
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${DATA_COLORS.primary} 0%, ${DATA_COLORS.secondary} 100%)`,
  borderRadius: 16,
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
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.1,
  }
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`analytics-tabpanel-${index}`}
    aria-labelledby={`analytics-tab-${index}`}
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

// OPTIMIZATION: Fast loading skeleton
const AnalyticsSkeleton = () => (
  <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
    <Box sx={{ p: 4 }}>
      <Skeleton variant="text" width={300} height={60} sx={{ bgcolor: 'rgba(0, 245, 255, 0.1)' }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mt: 4 }}>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ bgcolor: 'rgba(0, 245, 255, 0.1)', borderRadius: 2 }} />
        ))}
      </Box>
    </Box>
  </Box>
);

export default function AnalyticsPage() {
  // OPTIMIZATION: Separated state management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { user } = useAuth();
  const router = useRouter();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // OPTIMIZATION: Memoized data calculations - MOVED UP
  const metrics = useMemo(() => {
    if (!data) return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisWeek: 0,
      totalCourses: 0,
      totalVideos: 0,
      totalQuests: 0,
      totalQuizzes: 0,
      totalNFTs: 0,
      activeSubscriptions: 0,
      todayActivities: 0,
      deviceTypes: []
    };
    
    return {
      totalUsers: data.userStats?.totalUsers || 0,
      activeUsers: data.userStats?.activeUsers || 0,
      newUsersThisWeek: data.userStats?.newUsersThisWeek || 0,
      totalCourses: data.content?.courses || 0,
      totalVideos: data.content?.videos || 0, // Fix: Artık doğru video sayısı
      totalQuests: data.content?.quests || 0,
      totalQuizzes: data.content?.quizzes || 0,
      totalNFTs: data.content?.nfts || 0,
      activeSubscriptions: data.subscriptions?.active || 0,
      todayActivities: data.activitySummary?.todayTotal || 0,
      deviceTypes: data.userStats?.deviceTypes || []
    };
  }, [data]);

  // Data processors - MOVED UP to maintain hook order
  const processUserGrowthData = useMemo(() => {
    if (!data?.userStats?.userGrowth || Object.keys(data.userStats.userGrowth).length === 0) {
      return []; // Boş array döndür, mock data değil
    }
    
    return Object.entries(data.userStats.userGrowth).map(([date, users]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users,
      cumulative: users,
      growth: users
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const processActivityData = useMemo(() => {
    if (!data?.activitySummary?.activitiesByType || data.activitySummary.activitiesByType.length === 0) {
      return []; // Boş array döndür, mock data değil
    }
    
    return data.activitySummary.activitiesByType.map((activity, index) => ({
      name: activity.ActivityType.replace('_', ' ').toUpperCase(),
      value: activity.Count,
      color: CHART_COLORS[index % CHART_COLORS.length],
      percentage: 0
    }));
  }, [data]);

  const processDailyActivityData = useMemo(() => {
    if (!data?.activitySummary?.dailyActivities || Object.keys(data.activitySummary.dailyActivities).length === 0) {
      return []; // Boş array döndür, mock data değil
    }
    
    return Object.entries(data.activitySummary.dailyActivities).map(([date, activityData]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      activities: typeof activityData === 'object' ? activityData.activities : activityData,
      users: typeof activityData === 'object' ? activityData.uniqueUsers : 0,
      efficiency: typeof activityData === 'object' && activityData.uniqueUsers > 0 
        ? Math.round(activityData.activities / activityData.uniqueUsers * 100) / 100 
        : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  // Process real course completion data for charts (gerçek data)
  const processCourseCompletionData = useMemo(() => {
    if (!data?.learningProgress?.categoryStats || Object.keys(data.learningProgress.categoryStats).length === 0) {
      return []; // Boş array döndür, mock data değil
    }
    
    return Object.entries(data.learningProgress.categoryStats).map(([category, count], index) => ({
      category: category,
      completions: count,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [data]);

  // OPTIMIZATION: Fast initial load with cache check
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // Check cache first
        if (isCacheValid()) {
          console.log('📊 Using cached analytics data');
          setData(cachedData);
          setLastUpdated(cacheTimestamp);
      setLoading(false);
          return;
        }

        console.log('📊 Fetching fresh analytics data...');
        setLoading(true);
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const startTime = Date.now();
        
        const response = await fetch('/api/admin/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const loadTime = Date.now() - startTime;
        console.log(`📊 Analytics API response time: ${loadTime}ms`);
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const analyticsData = await response.json();
        
        // DEBUG: Analytics data'sını kontrol et
        console.log('📊 Analytics Data Received:', analyticsData);
        console.log('📊 User Growth Data:', analyticsData?.userStats?.userGrowth);
        console.log('📊 Activity Data:', analyticsData?.activitySummary?.activitiesByType);
        
        // Cache the data
        cachedData = analyticsData;
        cacheTimestamp = Date.now();
        
        setData(analyticsData);
        setLastUpdated(cacheTimestamp);
        setError(null);

        console.log('📊 Analytics data loaded successfully');
    } catch (err) {
        console.error('Analytics API Error:', err);
        setError(err.message);
    } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  // OPTIMIZATION: Manual refresh function
  const refreshData = async () => {
    // Clear cache and reload
    cachedData = null;
    cacheTimestamp = null;
    setLoading(true);
    
    // Trigger useEffect
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // OPTIMIZATION: Show skeleton while loading
  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
        <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          display: 'flex', 
          alignItems: 'center', 
        justifyContent: 'center',
        p: 4
        }}>
        <Alert 
          severity="error" 
            sx={{ 
            background: 'rgba(255, 20, 147, 0.1)',
            border: '1px solid #FF1493',
            color: '#FFFFFF',
            '& .MuiAlert-icon': { color: '#FF1493' }
          }}
        >
          <AlertTitle>Analytics Data Error</AlertTitle>
          {error}
          <Button 
            onClick={refreshData} 
          sx={{ 
              mt: 2, 
              color: DATA_COLORS.primary,
              borderColor: DATA_COLORS.primary 
            }} 
            variant="outlined"
          >
            Retry
          </Button>
        </Alert>
          </Box>
    );
  }

  if (!data) {
    return <AnalyticsSkeleton />;
  }

  return (
    <>
        <Snackbar
        open={false}
          autoHideDuration={6000}
        onClose={() => {}}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
          onClose={() => {}} 
          severity="success"
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: 2,
            fontFamily: 'monospace'
          }}
        >
          Analytics data synchronized successfully
          </Alert>
        </Snackbar>
        
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Scientific Header */}
        <HeaderContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <DataAvatar size={72} color="rgba(255, 255, 255, 0.2)">
                <ScienceIcon sx={{ fontSize: 36 }} />
              </DataAvatar>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" component="h1" fontWeight={800} sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  DATA LABORATORY
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1, fontFamily: 'monospace' }}>
                  Real-time Analytics & Intelligence System
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip 
                    label="LIVE DATA" 
          sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.2)', 
                      color: '#10b981',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}
                  />
                  <Chip 
                    label={`SYNCED: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}`} 
              sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.1)', 
                      color: 'white',
                      fontFamily: 'monospace'
                    }}
                  />
                </Stack>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={refreshData} 
                disabled={loading}
                  sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
              </Box>
            </Box>
        </HeaderContainer>
        
        {/* Scientific Tabs */}
        <DataCard sx={{ mb: 4 }}>
            <Tabs 
            value={selectedTab} 
              onChange={handleTabChange} 
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile={isMobile}
              sx={{ 
                '& .MuiTabs-indicator': {
                display: 'none'
              },
              borderBottom: `1px solid ${alpha(DATA_COLORS.primary, 0.1)}`
            }}
          >
            <ScientificTab 
              icon={<DataUsageIcon />} 
              label="USER METRICS" 
                iconPosition="start"
            />
            <ScientificTab 
              icon={<AssessmentIcon />} 
              label="CONTENT ANALYSIS" 
                iconPosition="start"
            />
            <ScientificTab 
              icon={<ShowChartIcon />} 
              label="ACTIVITY TRACKING" 
                iconPosition="start"
            />
            <ScientificTab 
              icon={<AnalyticsIcon />} 
              label="PERFORMANCE DATA" 
                iconPosition="start"
              />
            </Tabs>
        </DataCard>

        {/* Tab Content */}
        <TabPanel value={selectedTab} index={0}>
          {/* User Metrics Lab */}
          <Grid container spacing={3}>
            {/* Key Performance Indicators */}
            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2 }}>
                  <PeopleIcon />
                </DataAvatar>
                <MetricValue>
                  {metrics.totalUsers.toLocaleString()}
                </MetricValue>
                <MetricLabel>Total Users</MetricLabel>
                <Chip 
                  label={`+${metrics.newUsersThisWeek || 0} this week`} 
                  size="small" 
                  sx={{ mt: 1, fontSize: '0.6rem', fontFamily: 'monospace' }}
                />
              </DataMetric>
                  </Grid>
                  
            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mx: 'auto', 
                            mb: 2,
                  background: DATA_COLORS.gradients.accent
                }}>
                  <TrendingUpIcon />
                </DataAvatar>
                <MetricValue sx={{ color: DATA_COLORS.accent }}>
                  {metrics.activeUsers.toLocaleString()}
                </MetricValue>
                <MetricLabel>Active Users (7d)</MetricLabel>
                <Chip 
                  label="TRACKING" 
                  size="small" 
                  color="success"
                  sx={{ mt: 1, fontSize: '0.6rem', fontFamily: 'monospace' }}
                />
              </DataMetric>
                  </Grid>
                  
            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mx: 'auto', 
                            mb: 2,
                  background: DATA_COLORS.gradients.secondary
                }}>
                  <TimeIcon />
                </DataAvatar>
                <MetricValue sx={{ color: DATA_COLORS.secondary }}>
                  {(data?.userStats?.avgSessionTime || 0).toFixed(1)}m
                </MetricValue>
                <MetricLabel>Avg Session Time</MetricLabel>
                <Chip 
                  label="OPTIMAL" 
                  size="small" 
                  sx={{ mt: 1, fontSize: '0.6rem', fontFamily: 'monospace', bgcolor: alpha(DATA_COLORS.secondary, 0.1) }}
                />
              </DataMetric>
                  </Grid>
                  
            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mx: 'auto', 
                            mb: 2,
                  background: DATA_COLORS.gradients.data
                }}>
                  <StatsIcon />
                </DataAvatar>
                <MetricValue sx={{ color: DATA_COLORS.info }}>
                  {metrics.todayActivities}
                </MetricValue>
                <MetricLabel>Active Today</MetricLabel>
                <Chip 
                  label="REAL-TIME" 
                  size="small" 
                  sx={{ mt: 1, fontSize: '0.6rem', fontFamily: 'monospace', bgcolor: alpha(DATA_COLORS.info, 0.1) }}
                />
              </DataMetric>
                </Grid>
                
            {/* User Growth Chart */}
            <Grid item xs={12} lg={8}>
              <ChartContainer>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <ShowChartIcon sx={{ color: DATA_COLORS.primary }} />
                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    USER GROWTH TRAJECTORY
                        </Typography>
                  <Chip label="30-DAY ANALYSIS" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                </Box>
                {processUserGrowthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={processUserGrowthData}>
                      <defs>
                        <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={DATA_COLORS.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={DATA_COLORS.primary} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(DATA_COLORS.neutral, 0.3)} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                      <YAxis axisLine={false} tickLine={false} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 23, 42, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px',
                          fontFamily: 'monospace'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke={DATA_COLORS.primary}
                        strokeWidth={3}
                        fill="url(#userGrowth)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                            <Box
                              sx={{
                      height: 350, 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                      color: 'text.secondary',
                      fontFamily: 'monospace'
                    }}
                  >
                    No user growth data available for the last 30 days
                          </Box>
                        )}
              </ChartContainer>
                  </Grid>

            {/* Course Completion by Category */}
            <Grid item xs={12} lg={4}>
              <ChartContainer>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <PieChartIcon sx={{ color: DATA_COLORS.secondary }} />
                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    COURSE COMPLETIONS
                        </Typography>
                                        </Box>
                {processCourseCompletionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                              <PieChart>
                                <Pie
                        data={processCourseCompletionData}
                                  cx="50%"
                                  cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                                  fill="#8884d8"
                        dataKey="completions"
                        label={({ category, completions }) => `${category}: ${completions}`}
                        labelStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                      >
                        {processCourseCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 23, 42, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px',
                          fontFamily: 'monospace'
                        }} 
                                />
                              </PieChart>
                            </ResponsiveContainer>
                ) : (
                  <Box 
                    sx={{ 
                      height: 350, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontFamily: 'monospace'
                    }}
                  >
                    No course completion data available
                          </Box>
                        )}
              </ChartContainer>
                  </Grid>
                </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {/* Content Analysis Lab */}
          <Grid container spacing={3}>
            {/* Content Metrics Grid */}
            <Grid item xs={12} sm={6} lg={2}>
              <DataCard variant="primary">
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, color: DATA_COLORS.primary, mb: 2 }} />
                  <MetricValue sx={{ fontSize: '1.8rem' }}>
                    {metrics.totalCourses}
                  </MetricValue>
                  <MetricLabel>Courses</MetricLabel>
                </CardContent>
              </DataCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={2}>
              <DataCard variant="secondary">
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <VideoIcon sx={{ fontSize: 40, color: DATA_COLORS.secondary, mb: 2 }} />
                  <MetricValue sx={{ fontSize: '1.8rem', color: DATA_COLORS.secondary }}>
                    {metrics.totalVideos}
                  </MetricValue>
                  <MetricLabel>Videos</MetricLabel>
                </CardContent>
              </DataCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={2}>
              <DataCard variant="accent">
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <TaskIcon sx={{ fontSize: 40, color: DATA_COLORS.accent, mb: 2 }} />
                  <MetricValue sx={{ fontSize: '1.8rem', color: DATA_COLORS.accent }}>
                    {metrics.totalQuests}
                  </MetricValue>
                  <MetricLabel>Quests</MetricLabel>
                </CardContent>
              </DataCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={2}>
              <DataCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <StatsIcon sx={{ fontSize: 40, color: DATA_COLORS.warning, mb: 2 }} />
                  <MetricValue sx={{ fontSize: '1.8rem', color: DATA_COLORS.warning }}>
                    {metrics.totalQuizzes}
                  </MetricValue>
                  <MetricLabel>Quizzes</MetricLabel>
                </CardContent>
              </DataCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={2}>
              <DataCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <NFTIcon sx={{ fontSize: 40, color: DATA_COLORS.info, mb: 2 }} />
                  <MetricValue sx={{ fontSize: '1.8rem', color: DATA_COLORS.info }}>
                    {metrics.totalNFTs}
                  </MetricValue>
                  <MetricLabel>NFTs</MetricLabel>
                </CardContent>
              </DataCard>
            </Grid>

            <Grid item xs={12} sm={6} lg={2}>
              <DataCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: DATA_COLORS.neutral, mb: 2 }} />
                  <MetricValue sx={{ fontSize: '1.8rem', color: DATA_COLORS.neutral }}>
                    {metrics.activeSubscriptions}
                  </MetricValue>
                  <MetricLabel>Subscriptions</MetricLabel>
                </CardContent>
              </DataCard>
            </Grid>

            {/* Popular Content Data Table */}
            <Grid item xs={12}>
              <DataCard>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <AssessmentIcon sx={{ color: DATA_COLORS.primary }} />
                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                      POPULAR CONTENT ANALYSIS
                        </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                              <TableHead>
                                <TableRow>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>RANK</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>CONTENT TITLE</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>ENROLLMENTS</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>STATUS</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                        {(data?.learningProgress?.popularCourses || []).length > 0 ? (
                          (data?.learningProgress?.popularCourses || []).map((course, index) => (
                            <TableRow key={course.courseId} hover>
                              <TableCell>
                                <Badge 
                                  badgeContent={index + 1} 
                                  color="primary" 
                                  sx={{ '& .MuiBadge-badge': { fontFamily: 'monospace' } }}
                                >
                                  <NumberOneIcon style={{ visibility: 'hidden', width: 20 }} />
                                </Badge>
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                {course.title}
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>
                                      <Chip
                                  label={`${course.enrollments} users`}
                                  color="primary"
                                  size="small"
                                  sx={{ fontFamily: 'monospace' }}
                                      />
                                    </TableCell>
                              <TableCell>
                                <Chip 
                                  label="ACTIVE"
                                            color="success"
                                  size="small"
                                  sx={{ fontFamily: 'monospace' }}
                                          />
                                    </TableCell>
                                  </TableRow>
                          ))
                        ) : (
                                <TableRow>
                            <TableCell 
                              colSpan={4} 
                              sx={{ 
                                textAlign: 'center', 
                                py: 4,
                                color: 'text.secondary',
                                fontFamily: 'monospace'
                              }}
                            >
                              No popular course data available
                                    </TableCell>
                                  </TableRow>
                        )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                </CardContent>
              </DataCard>
                  </Grid>
                </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {/* Activity Tracking Lab */}
                <Grid container spacing={3}>
            {/* Activity Metrics */}
            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mx: 'auto', 
                            mb: 2,
                  background: DATA_COLORS.gradients.primary
                }}>
                  <EqualizerIcon />
                </DataAvatar>
                <MetricValue>
                  {metrics.todayActivities}
                </MetricValue>
                <MetricLabel>Today's Activities</MetricLabel>
              </DataMetric>
                  </Grid>
                  
            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mx: 'auto', 
                            mb: 2,
                  background: DATA_COLORS.gradients.accent
                }}>
                  <PeopleIcon />
                </DataAvatar>
                <MetricValue sx={{ color: DATA_COLORS.accent }}>
                  {data?.activitySummary?.todayUniqueUsers || 0}
                </MetricValue>
                <MetricLabel>Active Users Today</MetricLabel>
              </DataMetric>
                  </Grid>
                  
            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mx: 'auto', 
                            mb: 2,
                  background: DATA_COLORS.gradients.secondary
                }}>
                  <TimelineIcon />
                </DataAvatar>
                <MetricValue sx={{ color: DATA_COLORS.secondary }}>
                  {data?.activitySummary?.totalLast7Days || 0}
                </MetricValue>
                <MetricLabel>7-Day Total</MetricLabel>
              </DataMetric>
                  </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <DataMetric>
                <DataAvatar sx={{ 
                  width: 48, 
                  height: 48, 
                  mx: 'auto', 
                  mb: 2,
                  background: DATA_COLORS.gradients.data
                }}>
                  <TrendingUpIcon />
                </DataAvatar>
                <MetricValue sx={{ color: DATA_COLORS.info }}>
                  {data?.activitySummary?.uniqueUsersLast7Days || 0}
                </MetricValue>
                <MetricLabel>Weekly Active Users</MetricLabel>
              </DataMetric>
                </Grid>
                
            {/* Daily Activity Tracking */}
            <Grid item xs={12} lg={8}>
              <ChartContainer>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <ShowChartIcon sx={{ color: DATA_COLORS.primary }} />
                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    DAILY ACTIVITY PATTERN
                    </Typography>
                  <Chip label="14-DAY TRACKING" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                </Box>
                {processDailyActivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={processDailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(DATA_COLORS.neutral, 0.3)} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                      <YAxis axisLine={false} tickLine={false} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                            <RechartsTooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 23, 42, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px',
                          fontFamily: 'monospace'
                        }} 
                                />
                                <Bar 
                        dataKey="activities" 
                        fill={DATA_COLORS.primary}
                        radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                ) : (
              <Box 
                sx={{ 
                      height: 350, 
                  display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontFamily: 'monospace'
                    }}
                  >
                    No daily activity data available for the last 14 days
                          </Box>
                        )}
              </ChartContainer>
                  </Grid>
                  
            {/* Activity Types Breakdown */}
            <Grid item xs={12} lg={4}>
              <ChartContainer>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <PieChartIcon sx={{ color: DATA_COLORS.secondary }} />
                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    ACTIVITY TYPES
                        </Typography>
                </Box>
                {processActivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={processActivityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelStyle={{ fontFamily: 'monospace', fontSize: '9px' }}
                      >
                        {processActivityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 23, 42, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px',
                          fontFamily: 'monospace'
                        }} 
                      />
                    </PieChart>
                            </ResponsiveContainer>
                ) : (
                  <Box 
                    sx={{ 
                      height: 350, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary',
                      fontFamily: 'monospace'
                    }}
                  >
                    No activity type data available
                          </Box>
                        )}
              </ChartContainer>
                  </Grid>
                </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          {/* Performance Data Lab */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DataCard variant="primary">
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <MonitorIcon sx={{ fontSize: 64, color: DATA_COLORS.primary, mb: 2 }} />
                  <Typography variant="h4" fontWeight={700} mb={2} sx={{ fontFamily: 'monospace' }}>
                    SYSTEM PERFORMANCE METRICS
                    </Typography>
                  <Typography color="text.secondary" mb={3} sx={{ fontFamily: 'monospace' }}>
                    Real-time system analysis and performance indicators
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                    <Chip 
                      label={`VIDEO PROCESSING TIME: ${(data?.timeSpent?.totalVideoTime || 0).toFixed(1)} MIN`} 
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                    <Chip 
                      label={`LAST SYNC: ${data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}`} 
                      color="secondary"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </Stack>
                </CardContent>
              </DataCard>
            </Grid>
          </Grid>
        </TabPanel>
          </Container>
    </>
  );
}