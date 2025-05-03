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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Backdrop,
  Snackbar,
  Alert,
  styled,
  Grid,
  Avatar,
  CssBaseline,
  useMediaQuery,
  Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Refresh as RefreshIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
  TaskAlt as TaskIcon,
  CurrencyBitcoin as NFTIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  QueryStats as StatsIcon,
  WatchLater as WatchLaterIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreIcon,
  Warning as WarningIcon,
  Equalizer as EqualizerIcon
} from '@mui/icons-material';
import MainLayout from '@/components/layout/MainLayout';
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
  Cell
} from 'recharts';

// Renk paleti
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a05195', '#d45087', '#f95d6a', '#ff7c43'];

// StatCard bileşeni
const StatCard = styled(({ gradientType, ...rest }) => <Card {...rest} />)(
  ({ theme, gradientType = 'blue' }) => {
    const gradients = {
      blue: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' 
        : 'linear-gradient(135deg, rgba(33, 147, 176, 0.7) 0%, rgba(109, 213, 237, 0.7) 100%)',
      purple: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%)',
      orange: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)' 
        : 'linear-gradient(135deg, rgba(244, 107, 69, 0.7) 0%, rgba(238, 168, 73, 0.7) 100%)',
      green: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' 
        : 'linear-gradient(135deg, rgba(17, 153, 142, 0.7) 0%, rgba(56, 239, 125, 0.7) 100%)'
    };

    return {
      background: gradients[gradientType],
      borderRadius: 16,
      overflow: 'visible',
      height: '100%',
      width: '100%',
      transition: 'transform 0.3s, box-shadow 0.3s',
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 8px rgba(0, 0, 0, 0.4)' 
        : '0 3px 6px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 6px 12px rgba(0, 0, 0, 0.5)' 
          : '0 5px 10px rgba(0, 0, 0, 0.15)'
      }
    };
  }
);

// SectionCard bileşeni
const SectionCard = styled(({ gradientType, ...rest }) => <Card {...rest} />)(
  ({ theme, gradientType = 'none' }) => {
    const gradients = {
      none: theme.palette.mode === 'dark' ? '#1E2132' : '#f5f5f5',
      blue: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(33, 147, 176, 0.3) 0%, rgba(109, 213, 237, 0.3) 100%)' 
        : 'linear-gradient(135deg, rgba(33, 147, 176, 0.1) 0%, rgba(109, 213, 237, 0.1) 100%)',
      purple: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)' 
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      orange: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(244, 107, 69, 0.3) 0%, rgba(238, 168, 73, 0.3) 100%)' 
        : 'linear-gradient(135deg, rgba(244, 107, 69, 0.1) 0%, rgba(238, 168, 73, 0.1) 100%)',
      green: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, rgba(17, 153, 142, 0.3) 0%, rgba(56, 239, 125, 0.3) 100%)' 
        : 'linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%)'
    };

    return {
      background: typeof gradients[gradientType] === 'string' ? gradients[gradientType] : gradients.none,
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      margin: 0,
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
        : '0 3px 6px rgba(0, 0, 0, 0.08)',
      '&:hover': {
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 6px 12px rgba(0, 0, 0, 0.4)' 
          : '0 4px 10px rgba(0, 0, 0, 0.12)'
      }
    };
  }
);

// CardHeader bileşeni
const CardHeader = styled(Box)(({ theme, color = 'primary.main' }) => ({
  padding: theme.spacing(1.5, 2),
  backgroundColor: theme.palette[color] ? theme.palette[color].main : color,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  minHeight: 48,
  width: '100%'
}));

// Tab stil bileşeni
const StyledTab = styled(Tab)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  fontSize: '0.875rem',
  fontWeight: 500,
  minHeight: 48,
  textTransform: 'none',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 700,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      backgroundColor: theme.palette.primary.main,
      borderRadius: '3px 3px 0 0'
    }
  },
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
  }
}));

// Tooltip stil bileşeni
const StyledTooltip = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(40, 44, 52, 0.85)' 
    : 'rgba(255, 255, 255, 0.85)',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(1.5),
  boxShadow: theme.shadows[3],
  '& .label': {
    color: theme.palette.text.secondary,
    marginBottom: 4,
    fontSize: 12
  },
  '& .value': {
    color: theme.palette.text.primary,
    fontWeight: 700,
    fontSize: 14
  }
}));

// Refresh butonu stil bileşeni
const GradientButton = styled(Button)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' 
    : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  borderRadius: 12,
  textTransform: 'none',
  padding: theme.spacing(1, 3),
  color: 'white',
  fontWeight: 600,
  letterSpacing: 0.5,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 8px rgba(33, 150, 243, 0.3)' 
    : '0 3px 6px rgba(33, 150, 243, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)' 
      : 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 6px 12px rgba(33, 150, 243, 0.4)' 
      : '0 4px 8px rgba(33, 150, 243, 0.3)',
    transform: 'translateY(-2px)'
  }
}));

// Mock data generation functions
const generateMockUserStats = () => ({
  completedCourses: 0,
  completedVideos: 0,
  completedQuests: 0,
  earnedNFTs: 0,
  totalPoints: 0,
  recentActivity: {
    'token_refresh': 1
  }
});

// Ana Analytics bileşeni
export default function AnalyticsPage() {
  const [userStats, setUserStats] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [timeSpent, setTimeSpent] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [activityDays, setActivityDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [usingMockData, setUsingMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Admin kontrolü
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
      setError(null);
      setUsingMockData(false);
      
      // Tüm verileri tek bir API çağrısı ile getir
      const response = await fetch(`/api/admin/analytics?endpoint=all&days=${activityDays}`);
      
      if (!response.ok) {
        throw new Error('Failed to retrieve data');
      }
      
      const data = await response.json();
      
      setUserStats(data.userStats);
      setLearningProgress(data.learningProgress);
      setTimeSpent(data.timeSpent);
      setActivitySummary(data.activitySummary);
      setLastUpdated(new Date());
      
      setSnackbarMessage('Data updated successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      
      // Hata durumunda mock data göster
      setUserStats(generateMockUserStats());
      setLearningProgress({
        ongoingCourses: [],
        completedCourses: [],
        ongoingQuests: [],
        categoryStats: {}
      });
      setTimeSpent({
        dailyTimeSpent: {},
        totalVideoTime: 1248,
        lastSessionTime: 32
      });
      setActivitySummary({
        activitiesByType: [],
        hourlyActivity: {},
        dailyActivities: {},
        period: `Last ${activityDays} days`
      });
      setUsingMockData(true);
      
      setSnackbarMessage(`Error: ${err.message}. Showing demo data.`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchActivitySummary = async () => {
    try {
      setRefreshing(true);
      
      const response = await fetch(`/api/admin/analytics?endpoint=user-activity-summary&days=${activityDays}`);
      
      if (!response.ok) {
        throw new Error('Could not retrieve activity data');
      }
      
      const data = await response.json();
      setActivitySummary(data);
      setLastUpdated(new Date());
      
      setSnackbarMessage(`Activity data updated for the last ${activityDays} days`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setSnackbarMessage(`Error: ${err.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleActivityDaysChange = (event) => {
    setActivityDays(event.target.value);
    fetchActivitySummary();
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  // Günlük zaman verilerini biçimlendir
  const formatDailyTimeData = useMemo(() => {
    if (!timeSpent || !timeSpent.dailyTimeSpent) return [];
    
    return Object.entries(timeSpent.dailyTimeSpent).map(([date, minutes]) => ({
      date,
      minutes
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [timeSpent]);

  // Aktivite tipleri verilerini biçimlendir
  const formatActivityTypesData = useMemo(() => {
    if (!activitySummary || !activitySummary.activitiesByType) return [];
    
    return activitySummary.activitiesByType.map(activity => ({
      name: activity.ActivityType,
      value: activity.Count
    }));
  }, [activitySummary]);

  // Özel tooltip biçimlendirici
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <StyledTooltip>
          <div className="label">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color }} className="value">
              {entry.name}: {entry.value}
            </div>
          ))}
        </StyledTooltip>
      );
    }
    return null;
  };

  // Uyarı ikonu getir
  const getAlertIcon = (severity) => {
    switch(severity) {
      case 'success': return <CheckIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ 
          display: 'flex', 
          width: '100%', 
          height: '100vh', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backdropFilter: 'blur(4px)'
            }}
            open={true}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress color="inherit" size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3, color: 'white', fontWeight: 500 }}>
                Loading data...
              </Typography>
              <Box sx={{ mt: 2, width: '200px', position: 'relative' }}>
                <LinearProgress color="primary" />
              </Box>
            </Box>
          </Backdrop>
        </Box>
      </MainLayout>
    );
  }

  // Ana tasarım
  return (
    <MainLayout>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Backdrop yenileme ekranı */}
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backdropFilter: 'blur(4px)'
          }}
          open={refreshing}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <CircularProgress color="inherit" size={50} />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Refreshing data...
            </Typography>
          </Box>
        </Backdrop>
        
        {/* Bildirim */}
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
            icon={getAlertIcon(snackbarSeverity)}
            sx={{ 
              width: '100%',
              boxShadow: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: 24,
                opacity: 0.9,
                mr: 1
              }
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
        {/* Header */}
        <Box
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(to right, #2a2d3e, #151928)'
              : 'linear-gradient(to right, #f9f9f9, #f2f2f2)',
            borderBottom: 1,
            borderColor: 'divider',
            py: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            width: '100%',
            flexShrink: 0
          }}
        >
          <Container maxWidth="xl">
            <Box 
              sx={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: { xs: 'wrap', md: 'nowrap' }
              }}
            >
              <Box display="flex" alignItems="center">
                <Box sx={{ 
                  color: 'primary.main', 
                  fontSize: { xs: 32, md: 40 }, 
                  mr: 2, 
                  display: 'flex', 
                  alignItems: 'center'
                }}>
                  <EqualizerIcon fontSize="inherit" />
                </Box>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    Analytics Dashboard
                  </Typography>
                  {usingMockData && (
                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                      * Showing demo data
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap={2}>
                <Box display={{ xs: 'none', md: 'flex' }} alignItems="center" mr={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Last updated:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {lastUpdated.toLocaleTimeString()}
                  </Typography>
                </Box>
                
                <GradientButton 
                  startIcon={<RefreshIcon />} 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  size="medium"
                >
                  Refresh Data
                </GradientButton>
                
                <Avatar 
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    bgcolor: 'primary.main',
                    width: 38,
                    height: 38,
                    boxShadow: 2
                  }}
                >
                  {user?.username?.charAt(0) || 'A'}
                </Avatar>
              </Box>
            </Box>
          </Container>
        </Box>
        
        {/* Tabs */}
        <Box sx={{ width: '100%', bgcolor: 'background.paper', flexShrink: 0 }}>
          <Container maxWidth="xl">
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile={isMobile}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                minHeight: 48,
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <StyledTab 
                icon={<PeopleIcon />} 
                label="USER STATISTICS" 
                iconPosition="start"
                sx={{ minHeight: 48, py: 0 }}
              />
              <StyledTab 
                icon={<SchoolIcon />} 
                label="LEARNING PROGRESS" 
                iconPosition="start"
                sx={{ minHeight: 48, py: 0 }}
              />
              <StyledTab 
                icon={<TimeIcon />} 
                label="TIME ANALYSIS" 
                iconPosition="start"
                sx={{ minHeight: 48, py: 0 }}
              />
              <StyledTab 
                icon={<StatsIcon />} 
                label="ACTIVITY ANALYSIS" 
                iconPosition="start"
                sx={{ minHeight: 48, py: 0 }}
              />
            </Tabs>
          </Container>
        </Box>

        {/* Content Container */}
        <Box sx={{ 
          flex: '1 1 auto', 
          width: '100%', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          py: 3
        }}>
          <Container maxWidth="xl">
            {/* USER STATISTICS TAB */}
            {tabValue === 0 && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '100%', 
                  height: '100%'
                }}
              >
                {/* Stats Cards Row */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard gradientType="blue">
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: { xs: 60, md: 70 },
                            height: { xs: 60, md: 70 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <SchoolIcon sx={{ color: 'white', fontSize: { xs: 30, md: 36 } }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {userStats?.completedCourses || 0}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mt: 1 }}>
                          Completed Courses
                        </Typography>
                      </CardContent>
                    </StatCard>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard gradientType="purple">
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: { xs: 60, md: 70 },
                            height: { xs: 60, md: 70 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <VideoIcon sx={{ color: 'white', fontSize: { xs: 30, md: 36 } }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {userStats?.completedVideos || 0}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mt: 1 }}>
                          Completed Videos
                        </Typography>
                      </CardContent>
                    </StatCard>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard gradientType="green">
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: { xs: 60, md: 70 },
                            height: { xs: 60, md: 70 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <TaskIcon sx={{ color: 'white', fontSize: { xs: 30, md: 36 } }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {userStats?.completedQuests || 0}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mt: 1 }}>
                          Completed Quests
                        </Typography>
                      </CardContent>
                    </StatCard>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard gradientType="orange">
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: { xs: 60, md: 70 },
                            height: { xs: 60, md: 70 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <NFTIcon sx={{ color: 'white', fontSize: { xs: 30, md: 36 } }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {userStats?.earnedNFTs || 0}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mt: 1 }}>
                          Earned NFTs
                        </Typography>
                      </CardContent>
                    </StatCard>
                  </Grid>
                </Grid>
                
                {/* Points & Activity Row */}
                <Grid container spacing={3} sx={{ height: { md: 'calc(100% - 240px)', minHeight: 400 } }}>
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="blue" sx={{ height: '100%' }}>
                      <CardHeader color="primary.main">
                        <TrophyIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Points Overview
                        </Typography>
                      </CardHeader>
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 }}>
                          <Box position="relative" display="inline-flex" sx={{ width: { xs: 180, sm: 220, md: 250 }, height: { xs: 180, sm: 220, md: 250 }, mb: 4 }}>
                            <CircularProgress
                              variant="determinate"
                              value={100}
                              size="100%"
                              thickness={6}
                              sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}
                            />
                            <CircularProgress
                              variant="determinate"
                              value={75}
                              size="100%"
                              thickness={6}
                              sx={{
                                color: theme.palette.mode === 'dark' ? '#2196F3' : '#2196F3',
                                position: 'absolute',
                                left: 0,
                                boxShadow: '0 0 8px rgba(33, 150, 243, 0.5)'
                              }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column'
                              }}
                            >
                              <Typography variant="h2" color="primary" sx={{ fontWeight: 'bold', lineHeight: 1, fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } }}>
                                {userStats?.totalPoints || 0}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Total Points
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Grid container spacing={3} sx={{ width: '100%', mt: 'auto' }}>
                            <Grid item xs={6}>
                              <Paper sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(63, 81, 181, 0.08)', 
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.1)',
                                height: '100%',
                                textAlign: 'center'
                              }}>
                                <Typography variant="body2" color="text.secondary">Points from Quests</Typography>
                                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {userStats ? Math.round(userStats.totalPoints * 0.4) : 0}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={6}>
                              <Paper sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(171, 71, 188, 0.08)', 
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(171, 71, 188, 0.1)',
                                height: '100%',
                                textAlign: 'center'
                              }}>
                                <Typography variant="body2" color="text.secondary">Points from Courses</Typography>
                                <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {userStats ? Math.round(userStats.totalPoints * 0.6) : 0}
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </SectionCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="purple" sx={{ height: '100%' }}>
                      <CardHeader color="secondary.main">
                        <TimelineIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Recent Activities
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 0 }}>
                        {userStats && userStats.recentActivity && Object.keys(userStats.recentActivity).length > 0 ? (
                          <TableContainer sx={{ flex: 1, overflow: 'auto', height: '100%' }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Activity Type</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Count</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Object.entries(userStats.recentActivity).map(([type, count], index) => (
                                  <TableRow key={index} hover>
                                    <TableCell sx={{ py: 2, fontSize: 15 }}>{type}</TableCell>
                                    <TableCell align="right" sx={{ py: 2 }}>
                                      <Chip
                                        label={count}
                                        color={
                                          index % 4 === 0 ? "primary" :
                                          index % 4 === 1 ? "secondary" :
                                          index % 4 === 2 ? "success" :
                                          "warning"
                                        }
                                        sx={{ 
                                          fontWeight: 'bold',
                                          px: 1,
                                          height: 28
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" flex={1} p={4}>
                            <Typography color="text.secondary">No recent activity data available</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* LEARNING PROGRESS TAB */}
            {tabValue === 1 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%', 
                height: '100%',
                gap: 3
              }}>
                {/* Top Row */}
                <Grid container spacing={3} sx={{ mb: 0 }}>
                  <Grid item xs={12} md={8}>
                    <SectionCard gradientType="blue">
                      <CardHeader color="primary.main">
                        <SchoolIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Ongoing Courses
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 350 }}>
                        {learningProgress && learningProgress.ongoingCourses && learningProgress.ongoingCourses.length > 0 ? (
                          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Course Title</TableCell>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Category</TableCell>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Difficulty</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Progress</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {learningProgress.ongoingCourses.map((course, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell sx={{ py: 2, fontSize: 15 }}>{course.Title}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                      <Chip 
                                        label={course.Category} 
                                        size="medium" 
                                        color="primary" 
                                        variant="outlined"
                                        sx={{ borderRadius: 8 }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                      <Chip
                                        label={course.Difficulty}
                                        size="medium"
                                        color={
                                          course.Difficulty === 'Beginner' ? 'success' :
                                          course.Difficulty === 'Intermediate' ? 'warning' : 'error'
                                        }
                                        sx={{ borderRadius: 8 }}
                                      />
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 2 }}>
                                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                                        <Typography variant="body1" sx={{ mr: 2, fontWeight: 600 }}>
                                          {course.CompletionPercentage}%
                                        </Typography>
                                        <Box sx={{ position: 'relative', width: 100 }}>
                                          <LinearProgress
                                            variant="determinate"
                                            value={course.CompletionPercentage}
                                            sx={{ 
                                              height: 10, 
                                              borderRadius: 5,
                                              bgcolor: 'rgba(0, 0, 0, 0.08)'
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" flex={1} p={4}>
                            <Typography color="text.secondary">No ongoing courses found</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <SectionCard gradientType="purple" sx={{ height: '100%' }}>
                      <CardHeader color="secondary.main">
                        <CategoryIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Course Categories
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 3, height: 350 }}>
                        {learningProgress && learningProgress.categoryStats && Object.keys(learningProgress.categoryStats).length > 0 ? (
                          <Box sx={{ flex: 1, width: '100%', height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(learningProgress.categoryStats).map(([category, count]) => ({
                                    name: category,
                                    value: count
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={true}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius="75%"
                                  fill="#8884d8"
                                  dataKey="value"
                                  strokeWidth={1}
                                >
                                  {Object.entries(learningProgress.categoryStats).map(([_, count], index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={COLORS[index % COLORS.length]} 
                                      stroke={theme.palette.background.paper}
                                    />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                  formatter={(value, name, props) => [`${value} courses`, name]}
                                  content={<CustomTooltip />}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                            <Typography color="text.secondary">No category data available</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                </Grid>
                
                {/* Bottom Row */}
                <Grid container spacing={3} sx={{ mb: 0 }}>
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="green">
                      <CardHeader color="success.main">
                        <TaskIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Ongoing Quests
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 350 }}>
                        {learningProgress && learningProgress.ongoingQuests && learningProgress.ongoingQuests.length > 0 ? (
                          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Quest Title</TableCell>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Difficulty</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Progress</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {learningProgress.ongoingQuests.map((quest, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell sx={{ py: 2, fontSize: 15 }}>{quest.Title}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                      <Chip
                                        label={quest.DifficultyLevel}
                                        size="medium"
                                        color={
                                          quest.DifficultyLevel === 'Easy' ? 'success' :
                                          quest.DifficultyLevel === 'Medium' ? 'warning' : 'error'
                                        }
                                        sx={{ borderRadius: 8 }}
                                      />
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 2 }}>
                                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                                        <Typography variant="body1" sx={{ mr: 2, fontWeight: 600 }}>
                                          {quest.CurrentProgress}/{quest.RequiredPoints}
                                        </Typography>
                                        <Box sx={{ position: 'relative', width: 100 }}>
                                          <LinearProgress
                                            variant="determinate"
                                            value={(quest.CurrentProgress / quest.RequiredPoints) * 100}
                                            sx={{ 
                                              height: 10, 
                                              borderRadius: 5,
                                              bgcolor: 'rgba(0, 0, 0, 0.08)'
                                            }}
                                            color="success"
                                          />
                                        </Box>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" flex={1} p={4}>
                            <Typography color="text.secondary">No ongoing quests found</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="orange">
                      <CardHeader color="info.main">
                        <TrendingUpIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Completed Courses
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 350 }}>
                        {learningProgress && learningProgress.completedCourses && learningProgress.completedCourses.length > 0 ? (
                          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Course Title</TableCell>
                                  <TableCell sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Category</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 15, py: 2 }}>Completion Date</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {learningProgress.completedCourses.map((course, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell sx={{ py: 2, fontSize: 15 }}>{course.Title}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                      <Chip 
                                        label={course.Category} 
                                        size="medium" 
                                        color="primary" 
                                        variant="outlined"
                                        sx={{ borderRadius: 8 }}
                                      />
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 2, fontSize: 15 }}>
                                      {new Date(course.CompletionDate).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" flex={1} p={4}>
                            <Typography color="text.secondary">No completed courses found</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TIME ANALYSIS TAB */}
            {tabValue === 2 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%', 
                height: '100%',
                gap: 3
              }}>
                {/* Stats Cards Row */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <StatCard gradientType="blue">
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: { xs: 60, md: 70 },
                            height: { xs: 60, md: 70 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <WatchLaterIcon sx={{ color: 'white', fontSize: { xs: 30, md: 36 } }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {timeSpent?.totalVideoTime || 0} min
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mt: 1 }}>
                          Total Video Time
                        </Typography>
                      </CardContent>
                    </StatCard>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <StatCard gradientType="purple">
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: { xs: 60, md: 70 },
                            height: { xs: 60, md: 70 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <TimeIcon sx={{ color: 'white', fontSize: { xs: 30, md: 36 } }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {timeSpent?.lastSessionTime || 0} min
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mt: 1 }}>
                          Last Session Time
                        </Typography>
                      </CardContent>
                    </StatCard>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <StatCard gradientType="green">
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            width: { xs: 60, md: 70 },
                            height: { xs: 60, md: 70 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <CalendarIcon sx={{ color: 'white', fontSize: { xs: 30, md: 36 } }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white', fontSize: { xs: '2rem', md: '2.5rem' } }}>
                          {timeSpent && timeSpent.dailyTimeSpent
                            ? Object.values(timeSpent.dailyTimeSpent).reduce((sum, curr) => sum + curr, 0)
                            : 0
                          } min
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500, mt: 1 }}>
                          Time (Last 30 Days)
                        </Typography>
                      </CardContent>
                    </StatCard>
                  </Grid>
                </Grid>
                
                {/* Daily Time Spent Graph */}
                <SectionCard gradientType="blue">
                  <CardHeader color="primary.main">
                    <TimelineIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Daily Time Spent (Minutes)
                    </Typography>
                  </CardHeader>
                  <Box sx={{ p: 2, flex: 1, display: 'flex', overflow: 'hidden', height: 400 }}>
                    {formatDailyTimeData.length > 0 ? (
                      <Box sx={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={formatDailyTimeData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} strokeOpacity={0.5} />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                              tickLine={{ stroke: theme.palette.divider }}
                              axisLine={{ stroke: theme.palette.divider }}
                              dy={10}
                            />
                            <YAxis 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                              tickLine={{ stroke: theme.palette.divider }}
                              axisLine={{ stroke: theme.palette.divider }}
                              label={{ 
                                value: 'Minutes', 
                                angle: -90, 
                                position: 'insideLeft', 
                                fill: theme.palette.text.secondary,
                                fontSize: 12,
                                dx: -10
                              }}
                            />
                            <RechartsTooltip 
                              content={<CustomTooltip />}
                              formatter={(value) => [`${value} min`, 'Time Spent']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="minutes" 
                              name="Minutes" 
                              stroke={theme.palette.primary.main} 
                              fill={theme.palette.primary.main}
                              activeDot={{ 
                                r: 8, 
                                fill: theme.palette.primary.main, 
                                stroke: theme.palette.background.paper, 
                                strokeWidth: 2 
                              }} 
                              strokeWidth={3}
                              dot={{ 
                                r: 4, 
                                fill: theme.palette.primary.main, 
                                stroke: theme.palette.background.paper, 
                                strokeWidth: 1
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" width="100%" p={4}>
                        <Typography color="text.secondary">No daily time data available</Typography>
                      </Box>
                    )}
                  </Box>
                </SectionCard>
                
                {/* Usage Statistics */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="purple">
                      <CardHeader color="secondary.main">
                        <TrendingUpIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Peak Usage Days
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', height: 350, p: 2 }}>
                        {formatDailyTimeData.length > 0 ? (
                          <Box sx={{ width: '100%', height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={formatDailyTimeData.sort((a, b) => b.minutes - a.minutes).slice(0, 7)}
                                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} strokeOpacity={0.5} />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                  axisLine={{ stroke: theme.palette.divider }}
                                  dy={10}
                                />
                                <YAxis 
                                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                  tickLine={{ stroke: theme.palette.divider }}
                                  axisLine={{ stroke: theme.palette.divider }}
                                  label={{ 
                                    value: 'Minutes', 
                                    angle: -90, 
                                    position: 'insideLeft', 
                                    fill: theme.palette.text.secondary,
                                    fontSize: 12,
                                    dx: -10
                                  }}
                                />
                                <RechartsTooltip 
                                  content={<CustomTooltip />}
                                  formatter={(value) => [`${value} min`, 'Time Spent']}
                                />
                                <Bar 
                                  dataKey="minutes" 
                                  name="Minutes" 
                                  fill={theme.palette.secondary.main}
                                  radius={[6, 6, 0, 0]}
                                  barSize={30}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" width="100%" p={4}>
                            <Typography color="text.secondary">No peak usage data available</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="green">
                      <CardHeader color="success.main">
                        <StatsIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Usage Statistics
                        </Typography>
                      </CardHeader>
                      <Box sx={{ p: 3, flex: 1, display: 'flex', height: 350 }}>
                        {formatDailyTimeData.length > 0 ? (
                          <Grid container spacing={3} sx={{ alignItems: 'center', height: '100%' }}>
                            <Grid item xs={12} sm={6}>
                              <Paper sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(63, 81, 181, 0.08)', 
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.1)',
                                height: '100%',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}>
                                <Typography variant="body1" color="text.secondary">Average Daily Usage</Typography>
                                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {Math.round(formatDailyTimeData.reduce((sum, item) => sum + item.minutes, 0) / formatDailyTimeData.length)} min
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(76, 175, 80, 0.08)', 
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
                                height: '100%',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}>
                                <Typography variant="body1" color="text.secondary">Maximum Daily Usage</Typography>
                                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {Math.max(...formatDailyTimeData.map(item => item.minutes))} min
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(171, 71, 188, 0.08)', 
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(171, 71, 188, 0.1)',
                                height: '100%',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}>
                                <Typography variant="body1" color="text.secondary">Days with Activity</Typography>
                                <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {formatDailyTimeData.filter(item => item.minutes > 0).length} days
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(211, 47, 47, 0.08)', 
                                borderRadius: 4,
                                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
                                height: '100%',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}>
                                <Typography variant="body1" color="text.secondary">Days without Activity</Typography>
                                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {formatDailyTimeData.filter(item => item.minutes === 0).length} days
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" width="100%" p={4}>
                            <Typography color="text.secondary">No usage statistics available</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ACTIVITY ANALYSIS TAB */}
            {tabValue === 3 && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '100%', 
                  height: '100%',
                  gap: 3
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Activity Overview for Last {activityDays} days
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2, fontSize: 15 }}>
                      Select period:
                    </Typography>
                    <FormControl variant="outlined" size="small" sx={{ width: 150 }}>
                      <InputLabel id="time-period-label">Time Period</InputLabel>
                      <Select
                        labelId="time-period-label"
                        id="time-period-select"
                        value={activityDays}
                        onChange={handleActivityDaysChange}
                        label="Time Period"
                      >
                        <MenuItem value={7}>Last 7 Days</MenuItem>
                        <MenuItem value={14}>Last 14 Days</MenuItem>
                        <MenuItem value={30}>Last 30 Days</MenuItem>
                        <MenuItem value={60}>Last 60 Days</MenuItem>
                        <MenuItem value={90}>Last 90 Days</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="blue">
                      <CardHeader color="primary.main">
                        <StatsIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Activity by Type
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', height: 350, p: 2 }}>
                        {formatActivityTypesData.length > 0 ? (
                          <Box sx={{ width: '100%', height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={formatActivityTypesData}
                                layout="vertical"
                                margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} strokeOpacity={0.5} />
                                <XAxis 
                                  type="number"
                                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                  axisLine={{ stroke: theme.palette.divider }}
                                />
                                <YAxis 
                                  dataKey="name"
                                  type="category"
                                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                  tickLine={{ stroke: theme.palette.divider }}
                                  axisLine={{ stroke: theme.palette.divider }}
                                  width={100}
                                />
                                <RechartsTooltip 
                                  content={<CustomTooltip />}
                                  formatter={(value, name, props) => [`${value} activities`, props.payload.name]}
                                />
                                <Bar 
                                  dataKey="value" 
                                  name="Count" 
                                  fill={theme.palette.primary.main}
                                  radius={[0, 6, 6, 0]}
                                  barSize={20}
                                >
                                  {formatActivityTypesData.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={COLORS[index % COLORS.length]} 
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" width="100%" p={4}>
                            <Typography color="text.secondary">No activity type data available</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <SectionCard gradientType="purple">
                      <CardHeader color="secondary.main">
                        <WatchLaterIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Activity by Hour of Day
                        </Typography>
                      </CardHeader>
                      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', height: 350, p: 2 }}>
                        {activitySummary && activitySummary.hourlyActivity && Object.keys(activitySummary.hourlyActivity).length > 0 ? (
                          <Box sx={{ width: '100%', height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={Object.entries(activitySummary.hourlyActivity).map(([hour, count]) => ({
                                  hour: parseInt(hour),
                                  count
                                })).sort((a, b) => a.hour - b.hour)}
                                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} strokeOpacity={0.5} />
                                <XAxis 
                                  dataKey="hour" 
                                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                                  tickLine={{ stroke: theme.palette.divider }}
                                  axisLine={{ stroke: theme.palette.divider }}
                                  label={{ 
                                    value: 'Hour of Day', 
                                    position: 'insideBottom', 
                                    offset: -10, 
                                    fill: theme.palette.text.secondary,
                                    fontSize: 12
                                  }}
                                />
                                <YAxis 
                                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                  tickLine={{ stroke: theme.palette.divider }}
                                  axisLine={{ stroke: theme.palette.divider }}
                                  label={{ 
                                    value: 'Count', 
                                    angle: -90, 
                                    position: 'insideLeft', 
                                    fill: theme.palette.text.secondary,
                                    fontSize: 12,
                                    dx: -10
                                  }}
                                />
                                <RechartsTooltip 
                                  content={<CustomTooltip />}
                                  formatter={(value) => [`${value} activities`, 'Count']}
                                />
                                <Bar 
                                  dataKey="count" 
                                  name="Activities" 
                                  fill={theme.palette.secondary.main}
                                  radius={[6, 6, 0, 0]}
                                  barSize={20}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" width="100%" p={4}>
                            <Typography color="text.secondary">No hourly activity data available</Typography>
                          </Box>
                        )}
                      </Box>
                    </SectionCard>
                  </Grid>
                </Grid>
                
                <SectionCard gradientType="green">
                  <CardHeader color="success.main">
                    <CalendarIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Daily Activity Count
                    </Typography>
                  </CardHeader>
                  <Box sx={{ p: 2, flex: 1, display: 'flex', height: 400 }}>
                    {activitySummary && activitySummary.dailyActivities && Object.keys(activitySummary.dailyActivities).length > 0 ? (
                      <Box sx={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={Object.entries(activitySummary.dailyActivities).map(([date, count]) => ({
                              date,
                              count
                            })).sort((a, b) => new Date(a.date) - new Date(b.date))}
                            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} strokeOpacity={0.5} />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
                              tickLine={{ stroke: theme.palette.divider }}
                              axisLine={{ stroke: theme.palette.divider }}
                              dy={10}
                            />
                            <YAxis 
                              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                              tickLine={{ stroke: theme.palette.divider }}
                              axisLine={{ stroke: theme.palette.divider }}
                              label={{ 
                                value: 'Activity Count', 
                                angle: -90, 
                                position: 'insideLeft', 
                                fill: theme.palette.text.secondary,
                                fontSize: 12,
                                dx: -10
                              }}
                            />
                            <RechartsTooltip 
                              content={<CustomTooltip />}
                              formatter={(value) => [`${value} activities`, 'Count']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              name="Activities" 
                              stroke={theme.palette.success.main} 
                              fill={theme.palette.success.main}
                              activeDot={{ 
                                r: 8, 
                                fill: theme.palette.success.main, 
                                stroke: theme.palette.background.paper, 
                                strokeWidth: 2 
                              }} 
                              strokeWidth={3}
                              dot={{ 
                                r: 4, 
                                fill: theme.palette.success.main, 
                                stroke: theme.palette.background.paper, 
                                strokeWidth: 1
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" width="100%" p={4}>
                        <Typography color="text.secondary">No daily activity data available</Typography>
                      </Box>
                    )}
                  </Box>
                </SectionCard>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </MainLayout>
  );
}

// LinearProgress bileşeni
function LinearProgress({ variant, value, sx, color = 'primary' }) {
  const theme = useTheme();
  const getColor = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'secondary') return theme.palette.secondary.main;
    if (color === 'success') return theme.palette.success.main;
    if (color === 'warning') return theme.palette.warning.main;
    if (color === 'error') return theme.palette.error.main;
    return theme.palette.primary.main;
  };
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            width: `${value}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getColor()} 0%, ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)'} 100%)`,
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 1,
            transition: 'width 0.4s ease-in-out',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)'
          }}
        />
      </Box>
    </Box>
  );
}