"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  CircularProgress,
  Alert, 
  AlertTitle, 
  Button, 
  Stack,
  Chip,
  Paper,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  useMediaQuery,
  Backdrop,
  Snackbar,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
  TaskAlt as TaskIcon,
  CurrencyBitcoin as NFTIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  QueryStats as StatsIcon,
  WatchLater as WatchLaterIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon
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
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Tablara erişmek için props oluşturma
function a11yProps(index) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

// Renk paleti
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

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

  useEffect(() => {
    // Activity days değiştiğinde aktivite özeti verilerini güncelle
    if (user && user.role === 'admin' && !loading) {
      fetchActivitySummary();
    }
  }, [activityDays]);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      
      // Make a direct request to the system-health API route
      const response = await fetch(`/api/admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('System health API error:', response.status, errorText);
        throw new Error(`Failed to fetch system health data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('System health data received:', data);
      
      // Update your existing state variables with the data
      // Map the received data to your component's state variables
      // If you inspect the received data structure in the console,
      // you can adjust this mapping as needed
      
      // Example of mapping to your existing state variables:
      setUserStats({
        completedCourses: data.content?.courses || 0,
        completedVideos: 0,
        completedQuests: data.content?.quests || 0,
        earnedNFTs: data.content?.nfts || 0,
        totalPoints: 0,
        recentActivity: data.activity || {}
      });
      
      // If you have these other state variables:
      // setLearningProgress({...});
      // setTimeSpent({...});
      // setActivitySummary({...});
      
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
  const fetchActivitySummary = async () => {
    try {
      setRefreshing(true);
      
      // Aktivite özeti verilerini getir
      const response = await fetch(`/api/analytics?endpoint=user-activity-summary&days=${activityDays}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity summary');
      }
      
      const data = await response.json();
      setActivitySummary(data);
      
      setSnackbarMessage(`Activity data updated for last ${activityDays} days`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Activity summary fetch error:', err);
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
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  // Daily Time Spent veri formatı
  const formatDailyTimeData = useMemo(() => {
    if (!timeSpent || !timeSpent.dailyTimeSpent) return [];
    
    return Object.entries(timeSpent.dailyTimeSpent).map(([date, minutes]) => ({
      date,
      minutes
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [timeSpent]);

  // Kategori istatistikleri veri formatı
  const formatCategoryData = useMemo(() => {
    if (!learningProgress || !learningProgress.categoryStats) return [];
    
    return Object.entries(learningProgress.categoryStats).map(([category, count]) => ({
      name: category,
      value: count
    }));
  }, [learningProgress]);

  // Aktivite türleri veri formatı
  const formatActivityTypesData = useMemo(() => {
    if (!activitySummary || !activitySummary.activitiesByType) return [];
    
    return activitySummary.activitiesByType.map(activity => ({
      name: activity.ActivityType,
      value: activity.Count
    }));
  }, [activitySummary]);

  // Saatlik aktivite veri formatı
  const formatHourlyActivityData = useMemo(() => {
    if (!activitySummary || !activitySummary.hourlyActivity) return [];
    
    // 24 saatlik veri oluştur
    const hourlyData = Array(24).fill().map((_, hour) => ({
      hour: hour,
      count: 0
    }));
    
    // Mevcut verileri ekle
    if (activitySummary.hourlyActivity) {
      Object.entries(activitySummary.hourlyActivity).forEach(([hour, count]) => {
        const hourIndex = parseInt(hour);
        if (hourIndex >= 0 && hourIndex < 24) {
          hourlyData[hourIndex].count = count;
        }
      });
    }
    
    return hourlyData;
  }, [activitySummary]);

  // Günlük aktivite veri formatı
  const formatDailyActivityData = useMemo(() => {
    if (!activitySummary || !activitySummary.dailyActivities) return [];
    
    return Object.entries(activitySummary.dailyActivities).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [activitySummary]);

  if (loading) return (
    <MainLayout>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            Loading analytics data...
          </Typography>
        </Box>
      </Backdrop>
    </MainLayout>
  );

  if (error && !userStats) return (
    <MainLayout>
      <Box p={4}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              RETRY
            </Button>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    </MainLayout>
  );

  return (
    <MainLayout>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={refreshing}
      >
        <CircularProgress color="inherit" />
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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <BarChartIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Analytics
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh Data
          </Button>
        </Box>
        
        {/* Tab kontrolü */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="analytics tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile={isMobile}
            sx={{ 
              '.MuiTab-root': { 
                minHeight: 64,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                fontWeight: 'medium',
                transition: '0.3s',
                '&.Mui-selected': {
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }
            }}
          >
            <Tab 
              icon={<PeopleIcon />} 
              label="User Statistics" 
              {...a11yProps(0)} 
              iconPosition="start"
            />
            <Tab 
              icon={<SchoolIcon />} 
              label="Learning Progress" 
              {...a11yProps(1)} 
              iconPosition="start"
            />
            <Tab 
              icon={<TimeIcon />} 
              label="Time Analysis" 
              {...a11yProps(2)} 
              iconPosition="start" 
            />
            <Tab 
              icon={<StatsIcon />} 
              label="Activity Analysis" 
              {...a11yProps(3)} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {/* User Statistics Tab */}
        <TabPanel value={tabValue} index={0}>
          {userStats ? (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'visible' }}>
                    <CardContent sx={{ position: 'relative', pt: 4, pb: '16px !important' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box sx={{ ml: 'auto', width: 'calc(100% - 40px)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                          {userStats.completedCourses}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                          Completed Courses
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'visible' }}>
                    <CardContent sx={{ position: 'relative', pt: 4, pb: '16px !important' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'secondary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <VideoIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box sx={{ ml: 'auto', width: 'calc(100% - 40px)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                          {userStats.completedVideos}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                          Completed Videos
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'visible' }}>
                    <CardContent sx={{ position: 'relative', pt: 4, pb: '16px !important' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <TaskIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box sx={{ ml: 'auto', width: 'calc(100% - 40px)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                          {userStats.completedQuests}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                          Completed Quests
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'visible' }}>
                    <CardContent sx={{ position: 'relative', pt: 4, pb: '16px !important' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'warning.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <NFTIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box sx={{ ml: 'auto', width: 'calc(100% - 40px)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                          {userStats.earnedNFTs}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                          Earned NFTs
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <TrophyIcon sx={{ mr: 1 }} /> Points Overview
                        </Typography>
                      }
                      sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" px={3} pt={3} pb={2}>
                        <Box position="relative" display="inline-flex" mb={2}>
                          <CircularProgress 
                            variant="determinate" 
                            value={100} 
                            size={180} 
                            thickness={4} 
                            sx={{ color: theme.palette.grey[200] }} 
                          />
                          <CircularProgress 
                            variant="determinate" 
                            value={75} 
                            size={180} 
                            thickness={4} 
                            sx={{ 
                              color: theme.palette.primary.main,
                              position: 'absolute',
                              left: 0,
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
                            <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                              {userStats.totalPoints}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              Total Points
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box width="100%" mt={2}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box p={2} bgcolor="rgba(25, 118, 210, 0.1)" borderRadius={2}>
                                <Typography variant="body2" color="text.secondary">Points from Quests</Typography>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {Math.round(userStats.totalPoints * 0.4)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box p={2} bgcolor="rgba(156, 39, 176, 0.1)" borderRadius={2}>
                                <Typography variant="body2" color="text.secondary">Points from Courses</Typography>
                                <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {Math.round(userStats.totalPoints * 0.6)}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <TimelineIcon sx={{ mr: 1 }} /> Recent Activities
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.secondary.main, color: 'white', py: 2 }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      {userStats.recentActivity && Object.keys(userStats.recentActivity).length > 0 ? (
                        <Box px={3} py={2}>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell><Typography variant="subtitle2">Activity Type</Typography></TableCell>
                                  <TableCell align="right"><Typography variant="subtitle2">Count</Typography></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Object.entries(userStats.recentActivity).map(([type, count], index) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Typography variant="body2">{type}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Chip 
                                        label={count} 
                                        color={
                                          index % 4 === 0 ? "primary" : 
                                          index % 4 === 1 ? "secondary" : 
                                          index % 4 === 2 ? "success" : 
                                          "warning"
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                          <Typography color="text.secondary">No recent activity data available</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">
              <AlertTitle>No Data</AlertTitle>
              User statistics data is not available. Please try refreshing.
            </Alert>
          )}
        </TabPanel>
        
        {/* Learning Progress Tab */}
        <TabPanel value={tabValue} index={1}>
          {learningProgress ? (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon sx={{ mr: 1 }} /> Ongoing Courses
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 2 }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      {learningProgress.ongoingCourses && learningProgress.ongoingCourses.length > 0 ? (
                        <Box px={2} py={1}>
                          <TableContainer sx={{ maxHeight: 300 }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell><Typography variant="subtitle2">Course Title</Typography></TableCell>
                                  <TableCell><Typography variant="subtitle2">Category</Typography></TableCell>
                                  <TableCell><Typography variant="subtitle2">Difficulty</Typography></TableCell>
                                  <TableCell align="right"><Typography variant="subtitle2">Progress</Typography></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {learningProgress.ongoingCourses.map((course, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <Typography variant="body2">{course.Title}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={course.Category} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={course.Difficulty}
                                        size="small"
                                        color={
                                          course.Difficulty === 'Beginner' ? 'success' :
                                          course.Difficulty === 'Intermediate' ? 'warning' : 'error'
                                        }
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                          {course.CompletionPercentage}%
                                        </Typography>
                                        <Box sx={{ position: 'relative', width: 60, mr: 1 }}>
                                          <LinearProgress
                                            variant="determinate"
                                            value={course.CompletionPercentage}
                                            sx={{ 
                                              height: 8, 
                                              borderRadius: 1,
                                              bgcolor: 'rgba(0, 0, 0, 0.1)'
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
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                          <Typography color="text.secondary">No ongoing courses found</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <CategoryIcon sx={{ mr: 1 }} /> Course Categories
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.secondary.main, color: 'white', py: 2 }}
                    />
                    <CardContent>
                      {formatCategoryData.length > 0 ? (
                        <Box height={300} display="flex" justifyContent="center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={formatCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {formatCategoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value, name, props) => [`${value} courses`, name]}
                                contentStyle={{ 
                                  backgroundColor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 8,
                                  boxShadow: theme.shadows[3]
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4} height={300}>
                          <Typography color="text.secondary">No category data available</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <TaskIcon sx={{ mr: 1 }} /> Ongoing Quests
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.success.main, color: 'white', py: 2 }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      {learningProgress.ongoingQuests && learningProgress.ongoingQuests.length > 0 ? (
                        <Box px={2} py={1}>
                          <TableContainer sx={{ maxHeight: 300 }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell><Typography variant="subtitle2">Quest Title</Typography></TableCell>
                                  <TableCell><Typography variant="subtitle2">Difficulty</Typography></TableCell>
                                  <TableCell align="right"><Typography variant="subtitle2">Progress</Typography></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {learningProgress.ongoingQuests.map((quest, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <Typography variant="body2">{quest.Title}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={quest.DifficultyLevel}
                                        size="small"
                                        color={
                                          quest.DifficultyLevel === 'Easy' ? 'success' :
                                          quest.DifficultyLevel === 'Medium' ? 'warning' : 'error'
                                        }
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                          {quest.CurrentProgress}/{quest.RequiredPoints}
                                        </Typography>
                                        <Box sx={{ position: 'relative', width: 60, mr: 1 }}>
                                          <LinearProgress
                                            variant="determinate"
                                            value={(quest.CurrentProgress / quest.RequiredPoints) * 100}
                                            sx={{ 
                                              height: 8, 
                                              borderRadius: 1,
                                              bgcolor: 'rgba(0, 0, 0, 0.1)'
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
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                          <Typography color="text.secondary">No ongoing quests found</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ mr: 1 }} /> Completed Courses
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.info.main, color: 'white', py: 2 }}
                    />
                    <CardContent sx={{ p: 0 }}>
                      {learningProgress.completedCourses && learningProgress.completedCourses.length > 0 ? (
                        <Box px={2} py={1}>
                          <TableContainer sx={{ maxHeight: 300 }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell><Typography variant="subtitle2">Course Title</Typography></TableCell>
                                  <TableCell><Typography variant="subtitle2">Category</Typography></TableCell>
                                  <TableCell align="right"><Typography variant="subtitle2">Completion Date</Typography></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {learningProgress.completedCourses.map((course, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <Typography variant="body2">{course.Title}</Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={course.Category} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography variant="body2">
                                        {new Date(course.CompletionDate).toLocaleDateString()}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                          <Typography color="text.secondary">No completed courses found</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">
              <AlertTitle>No Data</AlertTitle>
              Learning progress data is not available. Please try refreshing.
            </Alert>
          )}
        </TabPanel>
        
        {/* Time Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          {timeSpent ? (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'visible' }}>
                    <CardContent sx={{ position: 'relative', pt: 4, pb: '16px !important' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <WatchLaterIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box sx={{ ml: 'auto', width: 'calc(100% - 40px)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                          {timeSpent.totalVideoTime} min
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                          Total Video Time
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'visible' }}>
                    <CardContent sx={{ position: 'relative', pt: 4, pb: '16px !important' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'secondary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <TimeIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box sx={{ ml: 'auto', width: 'calc(100% - 40px)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                          {timeSpent.lastSessionTime} min
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                          Last Session Time
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2, overflow: 'visible' }}>
                    <CardContent sx={{ position: 'relative', pt: 4, pb: '16px !important' }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: 20,
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          backgroundColor: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 3
                        }}
                      >
                        <CalendarIcon sx={{ fontSize: 32, color: 'white' }} />
                      </Box>
                      <Box sx={{ ml: 'auto', width: 'calc(100% - 40px)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                          {
                            Object.values(timeSpent.dailyTimeSpent || {}).reduce((sum, curr) => sum + curr, 0)
                          } min
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                          Time (Last 30 Days)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Card elevation={3} sx={{ borderRadius: 2, mb: 4 }}>
                <CardHeader 
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon sx={{ mr: 1 }} /> Daily Time Spent (Minutes)
                    </Typography>
                  }
                  sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 2 }}
                />
                <CardContent>
                  {formatDailyTimeData.length > 0 ? (
                    <Box height={400}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={formatDailyTimeData}
                          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fill: theme.palette.text.secondary }} 
                            tickLine={{ stroke: theme.palette.divider }}
                            axisLine={{ stroke: theme.palette.divider }}
                          />
                          <YAxis 
                            tick={{ fill: theme.palette.text.secondary }}
                            tickLine={{ stroke: theme.palette.divider }}
                            axisLine={{ stroke: theme.palette.divider }}
                            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8,
                              boxShadow: theme.shadows[3]
                            }}
                            formatter={(value) => [`${value} min`, 'Time Spent']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="minutes" 
                            name="Minutes" 
                            stroke={theme.palette.primary.main} 
                            fill={theme.palette.primary.main}
                            activeDot={{ r: 8, fill: theme.palette.primary.main, stroke: theme.palette.background.paper, strokeWidth: 2 }} 
                            strokeWidth={3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" p={4} height={400}>
                      <Typography color="text.secondary">No daily time data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <TrendingUpIcon sx={{ mr: 1 }} /> Peak Usage Days
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.secondary.main, color: 'white', py: 2 }}
                    />
                    <CardContent>
                      {formatDailyTimeData.length > 0 ? (
                        <Box height={300}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={formatDailyTimeData.sort((a, b) => b.minutes - a.minutes).slice(0, 7)}
                              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fill: theme.palette.text.secondary }} 
                                tickLine={{ stroke: theme.palette.divider }}
                                axisLine={{ stroke: theme.palette.divider }}
                              />
                              <YAxis 
                                tick={{ fill: theme.palette.text.secondary }}
                                tickLine={{ stroke: theme.palette.divider }}
                                axisLine={{ stroke: theme.palette.divider }}
                                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
                              />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 8,
                                  boxShadow: theme.shadows[3]
                                }}
                                formatter={(value) => [`${value} min`, 'Time Spent']}
                              />
                              <Bar 
                                dataKey="minutes" 
                                name="Minutes" 
                                fill={theme.palette.secondary.main}
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4} height={300}>
                          <Typography color="text.secondary">No peak usage data available</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <TrendingDownIcon sx={{ mr: 1 }} /> Usage Statistics
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.success.main, color: 'white', py: 2 }}
                    />
                    <CardContent>
                      {formatDailyTimeData.length > 0 ? (
                        <Box px={2} py={3}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Paper 
                                elevation={2} 
                                sx={{ 
                                  p: 2, 
                                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                                  borderRadius: 2
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">Average Daily Usage</Typography>
                                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {
                                    formatDailyTimeData.length > 0
                                      ? Math.round(formatDailyTimeData.reduce((sum, item) => sum + item.minutes, 0) / formatDailyTimeData.length)
                                      : 0
                                  } min
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper 
                                elevation={2} 
                                sx={{ 
                                  p: 2, 
                                  bgcolor: 'rgba(46, 125, 50, 0.1)',
                                  borderRadius: 2
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">Maximum Daily Usage</Typography>
                                <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {
                                    formatDailyTimeData.length > 0
                                      ? Math.max(...formatDailyTimeData.map(item => item.minutes))
                                      : 0
                                  } min
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper 
                                elevation={2} 
                                sx={{ 
                                  p: 2, 
                                  bgcolor: 'rgba(156, 39, 176, 0.1)',
                                  borderRadius: 2
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">Total Days with Activity</Typography>
                                <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {formatDailyTimeData.filter(item => item.minutes > 0).length} days
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper 
                                elevation={2} 
                                sx={{ 
                                  p: 2, 
                                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                                  borderRadius: 2
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">Days without Activity</Typography>
                                <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                  {formatDailyTimeData.filter(item => item.minutes === 0).length} days
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4} height={300}>
                          <Typography color="text.secondary">No usage statistics available</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">
              <AlertTitle>No Data</AlertTitle>
              Time spent data is not available. Please try refreshing.
            </Alert>
          )}
        </TabPanel>
        
        {/* Activity Analysis Tab */}
        <TabPanel value={tabValue} index={3}>
          {activitySummary ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <FormControl sx={{ width: 200 }}>
                  <InputLabel id="activity-days-label">Time Period</InputLabel>
                  <Select
                    labelId="activity-days-label"
                    value={activityDays}
                    label="Time Period"
                    onChange={handleActivityDaysChange}
                  >
                    <MenuItem value={7}>Last 7 Days</MenuItem>
                    <MenuItem value={14}>Last 14 Days</MenuItem>
                    <MenuItem value={30}>Last 30 Days</MenuItem>
                    <MenuItem value={60}>Last 60 Days</MenuItem>
                    <MenuItem value={90}>Last 90 Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Activity Overview for {activitySummary.period}
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <StatsIcon sx={{ mr: 1 }} /> Activity by Type
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.primary.main, color: 'white', py: 2 }}
                    />
                    <CardContent>
                      {formatActivityTypesData.length > 0 ? (
                        <Box height={300}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={formatActivityTypesData}
                              layout="vertical"
                              margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                              <XAxis 
                                type="number"
                                tick={{ fill: theme.palette.text.secondary }} 
                                tickLine={{ stroke: theme.palette.divider }}
                                axisLine={{ stroke: theme.palette.divider }}
                              />
                              <YAxis 
                                dataKey="name"
                                type="category"
                                tick={{ fill: theme.palette.text.secondary }}
                                tickLine={{ stroke: theme.palette.divider }}
                                axisLine={{ stroke: theme.palette.divider }}
                                width={100}
                              />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 8,
                                  boxShadow: theme.shadows[3]
                                }}
                                formatter={(value, name, props) => [`${value} activities`, props.payload.name]}
                              />
                              <Bar 
                                dataKey="value" 
                                name="Count" 
                                fill={theme.palette.primary.main}
                                radius={[0, 4, 4, 0]}
                              >
                                {formatActivityTypesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4} height={300}>
                          <Typography color="text.secondary">No activity type data available</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                    <CardHeader 
                      title={
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <WatchLaterIcon sx={{ mr: 1 }} /> Activity by Hour of Day
                        </Typography>
                      }
                      sx={{ bgcolor: theme.palette.secondary.main, color: 'white', py: 2 }}
                    />
                    <CardContent>
                      {formatHourlyActivityData.length > 0 ? (
                        <Box height={300}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={formatHourlyActivityData}
                              margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                              <XAxis 
                                dataKey="hour" 
                                tick={{ fill: theme.palette.text.secondary }} 
                                tickLine={{ stroke: theme.palette.divider }}
                                axisLine={{ stroke: theme.palette.divider }}
                                label={{ value: 'Hour of Day', position: 'insideBottom', offset: -10, fill: theme.palette.text.secondary }}
                              />
                              <YAxis 
                                tick={{ fill: theme.palette.text.secondary }}
                                tickLine={{ stroke: theme.palette.divider }}
                                axisLine={{ stroke: theme.palette.divider }}
                                label={{ value: 'Activity Count', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
                              />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 8,
                                  boxShadow: theme.shadows[3]
                                }}
                                formatter={(value, name, props) => [
                                  `${value} activities`, 
                                  `${props.payload.hour}:00 - ${props.payload.hour + 1}:00`
                                ]}
                              />
                              <Bar 
                                dataKey="count" 
                                name="Activities" 
                                fill={theme.palette.secondary.main}
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4} height={300}>
                          <Typography color="text.secondary">No hourly activity data available</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardHeader 
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1 }} /> Daily Activity Count
                    </Typography>
                  }
                  sx={{ bgcolor: theme.palette.success.main, color: 'white', py: 2 }}
                />
                <CardContent>
                  {formatDailyActivityData.length > 0 ? (
                    <Box height={400}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={formatDailyActivityData}
                          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fill: theme.palette.text.secondary }} 
                            tickLine={{ stroke: theme.palette.divider }}
                            axisLine={{ stroke: theme.palette.divider }}
                          />
                          <YAxis 
                            tick={{ fill: theme.palette.text.secondary }}
                            tickLine={{ stroke: theme.palette.divider }}
                            axisLine={{ stroke: theme.palette.divider }}
                            label={{ value: 'Activity Count', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8,
                              boxShadow: theme.shadows[3]
                            }}
                            formatter={(value) => [`${value} activities`, 'Count']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            name="Activities" 
                            stroke={theme.palette.success.main} 
                            fill={theme.palette.success.main}
                            activeDot={{ r: 8, fill: theme.palette.success.main, stroke: theme.palette.background.paper, strokeWidth: 2 }} 
                            strokeWidth={3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" p={4} height={400}>
                      <Typography color="text.secondary">No daily activity data available</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Alert severity="info">
              <AlertTitle>No Data</AlertTitle>
              Activity summary data is not available. Please try refreshing.
            </Alert>
          )}
        </TabPanel>
      </Box>
    </MainLayout>
  );
}

// LinearProgress bileşeni için (MUI'de olmadığı için eklendi)
function LinearProgress({ variant, value, sx }) {
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
            backgroundColor: 'primary.main',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 1,
            transition: 'width 0.4s ease-in-out'
          }}
        />
      </Box>
    </Box>
  );
}