"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert, 
  Button, 
  Stack,
  Chip,
  Paper,
  IconButton,
  useMediaQuery,
  Backdrop,
  Snackbar,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Container,
  useTheme as useMuiTheme,
  styled,
  alpha
} from '@mui/material';
import { 
  Memory as MemoryIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as QuestIcon,
  Image as NFTIcon,
  Forum as ForumIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Computer as ServerIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon,
  MonitorHeart as HealthIcon,
  Psychology as AIIcon,
  Subscriptions as SubscriptionIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  DataObject as DatabaseIcon,
  TrendingUp as ActivityIcon,
  Dashboard as DashboardIcon,
  Insights as InsightsIcon,
  Analytics as AnalyticsIcon,
  AutoGraph as AutoGraphIcon,
  Bolt as BoltIcon
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
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Modern color palette
const COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    teal: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
  }
};

// Styled Components with Glassmorphism (Performance Optimized)
const GlassCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: variant === 'primary' 
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
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
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: variant === 'primary' ? COLORS.gradient.primary : 'transparent',
  }
}));

const AnimatedCounter = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  background: COLORS.gradient.primary,
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

const StatusIndicator = styled(Box)(({ status, theme }) => {
  const colors = {
    healthy: COLORS.success,
    warning: COLORS.warning,
    critical: COLORS.error,
    unknown: theme.palette.grey[500]
  };
  
  return {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: colors[status] || colors.unknown,
    transition: 'all 0.3s ease',
  };
});

const ModernAvatar = styled(Avatar)(({ color }) => ({
  width: 64,
  height: 64,
  background: color || COLORS.gradient.primary,
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: theme.spacing(4),
  padding: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
}));

const MetricCard = styled(GlassCard)(({ theme, color }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: color || COLORS.gradient.primary,
    borderRadius: '12px 12px 0 0',
  }
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
  }
}));

const HoverListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: 'translateX(8px)',
  }
}));

const InteractiveChip = styled(Chip)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

const StatsBox = styled(Box)(({ theme, color }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  backgroundColor: alpha(color, 0.1),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(color, 0.2)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(color, 0.15),
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
  }
}));

export default function SystemHealthPage() {
  const [systemData, setSystemData] = useState(null);
  const [cacheData, setCacheData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { user } = useAuth();
  const router = useRouter();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchAllData();
    }
  }, [user, router]);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      
      const [systemResponse, cacheResponse] = await Promise.all([
        fetch(`/api/admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        cache: 'no-store'
        }),
        fetch(`/api/admin/cache-stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          cache: 'no-store'
        }).catch(() => null)
      ]);
      
      if (!systemResponse.ok) {
        const errorText = await systemResponse.text();
        console.error('System health API error:', systemResponse.status, errorText);
        throw new Error(`Failed to fetch system health data: ${systemResponse.status}`);
      }
      
      const systemData = await systemResponse.json();
      console.log('System health data received:', systemData);
      
      let cacheData = null;
      if (cacheResponse && cacheResponse.ok) {
        cacheData = await cacheResponse.json();
        console.log('Cache data received:', cacheData);
      }
      
      setSystemData(systemData);
      setCacheData(cacheData);
      setError(null);
      
      setSnackbarMessage('System health data refreshed successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('System health data fetch error:', err);
      setError(err.message);
      
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const getHealthStatus = () => {
    if (!systemData) return { status: 'unknown', color: 'grey', text: 'Unknown' };
    
    const overallHealth = systemData.overallHealth;
    
    switch (overallHealth) {
      case 'critical':
        return { status: 'critical', color: 'error', text: 'Critical Issues' };
      case 'warning':
        return { status: 'warning', color: 'warning', text: 'Warnings' };
      case 'healthy':
        return { status: 'healthy', color: 'success', text: 'All Systems Operational' };
      default:
        return { status: 'unknown', color: 'grey', text: 'Unknown' };
    }
  };

  const formatUserGrowthData = () => {
    if (!systemData?.userGrowth) return [];
    
    return Object.entries(systemData.userGrowth).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      users: count,
      formatted: `${count} users`
    })).slice(-14);
  };

  const getContentDistribution = () => {
    if (!systemData?.content) return [];
    
    const content = systemData.content;
    return [
      { name: 'Courses', value: content.courses || 0, color: COLORS.primary },
      { name: 'Videos', value: content.videos || 0, color: COLORS.success },
      { name: 'Quests', value: content.quests || 0, color: COLORS.warning },
      { name: 'Quizzes', value: content.quizzes || 0, color: COLORS.info },
      { name: 'NFTs', value: content.nfts || 0, color: COLORS.purple },
      { name: 'Posts', value: content.communityPosts || 0, color: COLORS.teal }
    ].filter(item => item.value > 0);
  };

  const getSystemMetrics = () => {
    if (!systemData) return [];
    
    const users = systemData.users || {};
    const activity = systemData.activity || {};
    const subscriptions = systemData.subscriptions || {};
    
    return [
      {
        label: 'Total Users',
        value: users.total || 0,
        change: users.newToday || 0,
        changeLabel: 'new today',
        icon: PeopleIcon,
        color: COLORS.primary,
        trend: 'up'
      },
      {
        label: 'Active Users',
        value: users.activeLast7Days || 0,
        change: users.activeToday || 0,
        changeLabel: 'active today',
        icon: ActivityIcon,
        color: COLORS.success,
        trend: 'up'
      },
      {
        label: 'Total Activity',
        value: activity.totalLast7Days || 0,
        change: activity.todayTotal || 0,
        changeLabel: 'today',
        icon: AnalyticsIcon,
        color: COLORS.info,
        trend: 'up'
      },
      {
        label: 'Subscriptions',
        value: subscriptions.active || 0,
        change: subscriptions.expiringThisWeek || 0,
        changeLabel: 'expiring',
        icon: SubscriptionIcon,
        color: COLORS.warning,
        trend: subscriptions.expiringThisWeek > 0 ? 'down' : 'stable'
      }
    ];
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: COLORS.primary }} />
          <Typography variant="h6" color="text.secondary">
            Loading system health data...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && !systemData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          sx={{ borderRadius: 3, backdropFilter: 'blur(20px)' }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
  );
  }

  const healthStatus = getHealthStatus();
  const systemMetrics = getSystemMetrics();

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: 'blur(8px)' }}
        open={refreshing}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress color="inherit" size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Refreshing data...
          </Typography>
        </Box>
      </Backdrop>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            backdropFilter: 'blur(20px)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Modern Header */}
        <HeaderContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <ModernAvatar>
                <HealthIcon sx={{ fontSize: 32 }} />
              </ModernAvatar>
              <Box>
                <Typography variant="h3" component="h1" fontWeight={800} sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                  System Health
            </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                  Real-time monitoring & analytics dashboard
                </Typography>
                {systemData?.timestamp && (
                  <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
                    Last updated: {new Date(systemData.timestamp).toLocaleString('tr-TR')}
                  </Typography>
                )}
          </Box>
        </Box>
        
            <Box display="flex" alignItems="center" gap={2}>
              <InteractiveChip
                icon={<StatusIndicator status={healthStatus.status} />}
                label={healthStatus.text}
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

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {systemMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <MetricCard color={metric.color}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <ModernAvatar 
                      color={metric.color}
                      sx={{ width: 56, height: 56 }}
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

        {/* Charts Section */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* User Growth Chart */}
          <Grid item xs={12} lg={8}>
            <ChartContainer>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <AutoGraphIcon sx={{ color: COLORS.primary }} />
                <Typography variant="h6" fontWeight={700}>
                  User Growth Trend
                        </Typography>
                <InteractiveChip label="Last 14 days" size="small" variant="outlined" />
              </Box>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formatUserGrowthData()}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      background: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
                </Grid>
                
          {/* Content Distribution */}
          <Grid item xs={12} lg={4}>
            <ChartContainer>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <InsightsIcon sx={{ color: COLORS.success }} />
                <Typography variant="h6" fontWeight={700}>
                  Content Distribution
                        </Typography>
              </Box>
              
              <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                    data={getContentDistribution()}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                    innerRadius={40}
                                fill="#8884d8"
                                dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                              >
                    {getContentDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                contentStyle={{ 
                      background: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)'
                    }}
                  />
                            </PieChart>
                          </ResponsiveContainer>
            </ChartContainer>
                </Grid>
              </Grid>
              
        {/* Service Status Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* AI Service Status */}
          {systemData?.aiService && (
            <Grid item xs={12} md={4}>
              <GlassCard variant="primary" sx={{ height: '100%', minHeight: 320 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <ModernAvatar color={COLORS.gradient.purple}>
                      <AIIcon />
                    </ModernAvatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        AI Service
                        </Typography>
                      <StatusIndicator status={systemData.aiService.status === 'healthy' ? 'healthy' : 'critical'} />
                    </Box>
                  </Box>
                  
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <InteractiveChip 
                        label={systemData.aiService.status} 
                        color={systemData.aiService.status === 'healthy' ? 'success' : 'error'}
                                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    
                    {systemData.aiService.url && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Service URL</Typography>
                        <Typography variant="body2" sx={{ 
                          fontFamily: 'monospace',
                          bgcolor: 'rgba(0,0,0,0.1)',
                          p: 1,
                                              borderRadius: 1,
                          mt: 0.5,
                          wordBreak: 'break-all'
                        }}>
                          {systemData.aiService.url}
                        </Typography>
                        </Box>
                      )}
                    
                    {systemData.aiService.model && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Model</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                          {systemData.aiService.model}
                        </Typography>
                        </Box>
                      )}
                  </Stack>
                    </CardContent>
              </GlassCard>
                </Grid>
          )}

          {/* Database Performance */}
          {systemData?.performance && (
            <Grid item xs={12} md={systemData?.aiService ? 4 : 6}>
              <GlassCard sx={{ height: '100%', minHeight: 320 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <ModernAvatar color={COLORS.gradient.teal}>
                      <DatabaseIcon />
                    </ModernAvatar>
            <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Database
                      </Typography>
                      <StatusIndicator status="healthy" />
                      </Box>
                  </Box>
                  
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Size</Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                        {systemData.performance.databaseSizeMB?.toFixed(1) || 0} MB
                        </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Queries (Last Hour)</Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                        {systemData.performance.queriesLastHour || 0}
                        </Typography>
                      </Box>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((systemData.performance.databaseSizeMB || 0) / 100 * 10, 100)}
                        sx={{
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: COLORS.gradient.teal
                          }
                        }}
                      />
                      </Box>
                  </Stack>
                    </CardContent>
              </GlassCard>
                </Grid>
          )}

          {/* Cache Performance */}
          {cacheData && (
            <Grid item xs={12} md={systemData?.aiService ? 4 : 6}>
              <GlassCard sx={{ height: '100%', minHeight: 320 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <ModernAvatar color={COLORS.gradient.warning}>
                      <SpeedIcon />
                    </ModernAvatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Cache
                      </Typography>
                      <StatusIndicator status="healthy" />
                      </Box>
                  </Box>
                  
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Memory Usage</Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                        {cacheData.memory?.used || 'N/A'}
                        </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Hit Ratio</Typography>
                      <Typography variant="h5" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                        {cacheData.performance?.hit_ratio || 'N/A'}
                        </Typography>
                      </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Keys</Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {cacheData.keys?.total || 0}
                      </Typography>
                    </Box>
                  </Stack>
                    </CardContent>
              </GlassCard>
                </Grid>
          )}
              </Grid>
              
        {/* System Warnings */}
        {systemData?.warnings && systemData.warnings.length > 0 && (
          <GlassCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <WarningIcon sx={{ color: COLORS.warning }} />
                <Typography variant="h6" fontWeight={700}>
                  System Alerts
                    </Typography>
                <InteractiveChip 
                  label={`${systemData.warnings.length} alert${systemData.warnings.length !== 1 ? 's' : ''}`}
                  size="small"
                  color="warning"
                />
                    </Box>
              
              <List>
                {systemData.warnings.map((warning, index) => (
                  <HoverListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {warning.severity === 'error' ? (
                        <ErrorIcon color="error" />
                      ) : warning.severity === 'warning' ? (
                        <WarningIcon color="warning" />
                      ) : (
                        <InfoIcon color="info" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={warning.message}
                      secondary={`Type: ${warning.type} | Severity: ${warning.severity}`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </HoverListItem>
                ))}
              </List>
                </CardContent>
          </GlassCard>
        )}
              
        {/* Popular Content & Activity Summary */}
              <Grid container spacing={3}>
          {/* Popular Content */}
          {systemData?.popularContent?.courses && systemData.popularContent.courses.length > 0 && (
            <Grid item xs={12} lg={6}>
              <GlassCard>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <StarIcon sx={{ color: COLORS.warning }} />
                    <Typography variant="h6" fontWeight={700}>
                      Popular Courses
                        </Typography>
                        </Box>
                  
                  <List>
                    {systemData.popularContent.courses.slice(0, 5).map((course, index) => (
                      <HoverListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Badge badgeContent={index + 1} color="primary">
                            <SchoolIcon color="primary" />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={course.title}
                          secondary={`${course.enrollments} enrollments`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </HoverListItem>
                    ))}
                  </List>
                    </CardContent>
              </GlassCard>
                </Grid>
          )}
          
          {/* Activity Summary */}
          <Grid item xs={12} lg={6}>
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <TimelineIcon sx={{ color: COLORS.info }} />
                  <Typography variant="h6" fontWeight={700}>
                    Activity Summary
                        </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <StatsBox color={COLORS.primary}>
                      <AnimatedCounter sx={{ fontSize: '2rem' }}>
                        {systemData?.activity?.todayTotal || 0}
                      </AnimatedCounter>
                      <Typography variant="body2" color="text.secondary">
                        Today's Activities
                                </Typography>
                    </StatsBox>
                            </Grid>
                  
                  <Grid item xs={6}>
                    <StatsBox color={COLORS.success}>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {systemData?.activity?.totalLast7Days || 0}
                                </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last 7 Days
                                </Typography>
                    </StatsBox>
                            </Grid>
                  
                  <Grid item xs={6}>
                    <StatsBox color={COLORS.info}>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {systemData?.activity?.todayUniqueUsers || 0}
              </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Today's Users
                        </Typography>
                    </StatsBox>
                </Grid>
                
                  <Grid item xs={6}>
                    <StatsBox color={COLORS.purple}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: COLORS.purple }}>
                        {systemData?.activity?.uniqueUsersLast7Days || 0}
                        </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Weekly Users
                      </Typography>
                    </StatsBox>
                </Grid>
              </Grid>
              
                {systemData?.activity?.lastActivityTime && (
                  <Box mt={3} p={2} sx={{ 
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Activity: {new Date(systemData.activity.lastActivityTime).toLocaleString('tr-TR')}
                    </Typography>
                    </Box>
                  )}
                </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}