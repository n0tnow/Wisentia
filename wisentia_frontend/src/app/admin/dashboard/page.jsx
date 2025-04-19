'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ActivityCard from '@/components/admin/ActivityCard';

// MUI imports
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField
} from '@mui/material';

// MUI icons
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Subscriptions as SubscriptionIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
  VideoLibrary as VideoIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  Settings as SettingsIcon,
  CloudDownload as CloudDownloadIcon
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
  Bar
} from 'recharts';

// Sample data - used if API fails or for development
const createDummyDataFromStructure = () => ({
  summary: {
    totalUsers: 2240,
    newUsers: 142,
    activeCourses: 156,
    activeQuests: 328,
    totalNFTs: 1256,
    activeSubscriptions: 842
  },
  activeUsers: [
    { UserID: 1, Username: 'john_doe', ActivityCount: 156 },
    { UserID: 2, Username: 'emma_smith', ActivityCount: 143 },
    { UserID: 3, Username: 'alex_wilson', ActivityCount: 121 },
    { UserID: 4, Username: 'olivia_brown', ActivityCount: 98 },
    { UserID: 5, Username: 'william_johnson', ActivityCount: 87 }
  ],
  popularCourses: [
    { CourseID: 1, Title: 'Blockchain Fundamentals', EnrolledUsers: 245 },
    { CourseID: 2, Title: 'Web3 Development', EnrolledUsers: 198 },
    { CourseID: 3, Title: 'Smart Contract Security', EnrolledUsers: 176 },
    { CourseID: 4, Title: 'NFT Creation & Trading', EnrolledUsers: 152 },
    { CourseID: 5, Title: 'DeFi Principles', EnrolledUsers: 127 }
  ],
  recentActivities: [
    { LogID: 1, Username: 'john_doe', ActivityType: 'course_completion', Description: 'Completed "Smart Contract Security" course', Timestamp: '2023-06-15T14:32:45Z' },
    { LogID: 2, Username: 'emma_smith', ActivityType: 'course_start', Description: 'Started "NFT Creation & Trading" course', Timestamp: '2023-06-15T13:11:22Z' },
    { LogID: 3, Username: 'alex_wilson', ActivityType: 'nft_earned', Description: 'Earned "Blockchain Pioneer" NFT', Timestamp: '2023-06-15T12:45:53Z' },
    { LogID: 4, Username: 'olivia_brown', ActivityType: 'quest_completion', Description: 'Completed "DeFi Expert" quest', Timestamp: '2023-06-15T10:23:18Z' },
    { LogID: 5, Username: 'william_johnson', ActivityType: 'subscription', Description: 'Subscribed to Pro Plan', Timestamp: '2023-06-15T09:15:37Z' }
  ],
  dailyNewUsers: {
    '2023-05-17': 25,
    '2023-05-18': 28,
    '2023-05-19': 32,
    '2023-05-20': 35,
    '2023-05-21': 30,
    '2023-05-22': 40,
    '2023-05-23': 45,
    '2023-05-24': 52,
    '2023-05-25': 48,
    '2023-05-26': 55,
    '2023-05-27': 60,
    '2023-05-28': 58,
    '2023-05-29': 62,
    '2023-05-30': 70,
    '2023-05-31': 75,
    '2023-06-01': 68,
    '2023-06-02': 72,
    '2023-06-03': 80,
    '2023-06-04': 85,
    '2023-06-05': 90,
    '2023-06-06': 88,
    '2023-06-07': 95,
    '2023-06-08': 100,
    '2023-06-09': 98,
    '2023-06-10': 105,
    '2023-06-11': 110,
    '2023-06-12': 115,
    '2023-06-13': 120,
    '2023-06-14': 125,
    '2023-06-15': 142
  },
  userTypeDistribution: [
    { name: 'New Users', value: 24 },
    { name: 'Active Users', value: 59 },
    { name: 'Passive Users', value: 17 }
  ],
  dailyActivities: [
    { day: 'Mon', courses: 40, quests: 25 },
    { day: 'Tue', courses: 30, quests: 20 },
    { day: 'Wed', courses: 45, quests: 30 },
    { day: 'Thu', courses: 65, quests: 42 },
    { day: 'Fri', courses: 55, quests: 35 },
    { day: 'Sat', courses: 35, quests: 28 },
    { day: 'Sun', courses: 30, quests: 15 }
  ],
  courseCompletionRates: [
    { category: 'Blockchain', rate: 78 },
    { category: 'Smart Contracts', rate: 65 },
    { category: 'NFTs', rate: 90 },
    { category: 'DeFi', rate: 55 },
    { category: 'Web3', rate: 70 }
  ],
  systemHealth: {
    cpuUsage: 24,
    memoryUsage: 42,
    storageUsage: 37,
    lastBackup: '2023-06-14T22:00:00Z',
    apiResponseTime: 45 // ms
  },
  nftMintingStats: [
    { month: 'Jan', count: 65 },
    { month: 'Feb', count: 78 },
    { month: 'Mar', count: 102 },
    { month: 'Apr', count: 125 },
    { month: 'May', count: 146 },
    { month: 'Jun', count: 132 }
  ]
});

// COLORS for charts
const COLORS = ['#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#f44336'];

// Direct backend URL (can be changed at runtime)
const API_URL_OPTIONS = [
  { value: '/api', label: 'Next.js API Route (/api)' },
  { value: 'http://localhost:8000/api', label: 'Direct Backend (localhost:8000/api)' },
  { value: 'http://127.0.0.1:8000/api', label: 'Direct Backend (127.0.0.1:8000/api)' }
];

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(createDummyDataFromStructure());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isUsingDummyData, setIsUsingDummyData] = useState(true);
  const [apiDebugInfo, setApiDebugInfo] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState(API_URL_OPTIONS[0].value);
  const [customEndpoint, setCustomEndpoint] = useState('admin/dashboard');
  const { user, refreshToken } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Show/hide debug info
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
    setShowSettings(false);
  };

  // Show/hide API settings
  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setShowDebugInfo(false);
  };

  // Change API Base URL
  const handleApiUrlChange = (event) => {
    setApiBaseUrl(event.target.value);
    localStorage.setItem('wisentia_api_base_url', event.target.value);
    
    setSnackbar({
      open: true,
      message: `API URL changed: ${event.target.value}`,
      severity: 'info'
    });
  };
  
  // Change custom endpoint
  const handleCustomEndpointChange = (event) => {
    setCustomEndpoint(event.target.value);
    localStorage.setItem('wisentia_custom_endpoint', event.target.value);
  };

  // Manually use mock data
  const useMockData = () => {
    const mockData = createDummyDataFromStructure();
    setDashboardData(mockData);
    setIsUsingDummyData(true);
    setLoading(false);
    setError(null);
    setSnackbar({
      open: true,
      message: 'Sample data loaded',
      severity: 'info'
    });
  };

  // Reload data from API
  const handleRefreshData = () => {
    setLoading(true);
    setError(null);
    fetchDashboardData();
  };


  // Try to fetch data from API and troubleshoot issues
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const debugInfo = {
        attempts: [],
        tokenInfo: {},
        apiBaseUrl: apiBaseUrl,
        customEndpoint: customEndpoint
      };
      
      // Use saved API URL (when page is reloaded)
      const savedApiUrl = localStorage.getItem('wisentia_api_base_url');
      if (savedApiUrl) {
        setApiBaseUrl(savedApiUrl);
        debugInfo.apiBaseUrl = savedApiUrl;
      }
      
      const savedEndpoint = localStorage.getItem('wisentia_custom_endpoint');
      if (savedEndpoint) {
        setCustomEndpoint(savedEndpoint);
        debugInfo.customEndpoint = savedEndpoint;
      }
      
      // Token check
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      
      // Token analysis and debug
      debugTokenAndUser(token, userStr, debugInfo);
      
      if (!token) {
        handleNoToken(debugInfo);
        return;
      }
      
      // Change 1: Use direct backend URL by default
      if (!apiBaseUrl.includes('localhost') && !apiBaseUrl.includes('127.0.0.1')) {
        // If not using local API URL, redirect to direct backend
        const directBackendUrl = 'http://localhost:8000/api';
        console.log(`API URL automatically changed to: ${directBackendUrl}`);
        setApiBaseUrl(directBackendUrl);
        localStorage.setItem('wisentia_api_base_url', directBackendUrl);
        debugInfo.apiBaseUrl = directBackendUrl;
        debugInfo.urlAutoChanged = true;
      }
      
      // Change 2: Make API request explicitly as JSON
      const fullApiUrl = `${debugInfo.apiBaseUrl}/${customEndpoint}`.replace(/\/+/g, '/').replace(':/', '://');
      
      const attemptInfo = {
        fullUrl: fullApiUrl,
        method: 'GET',
        timestamp: new Date().toISOString()
      };
      
      console.log(`API request: GET ${fullApiUrl}`);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      };
      
      attemptInfo.headers = {...headers};
      
      // Change 3: Use custom Next.js API endpoint
      // Note: Next.js API Routes automatically use the endpoint if it exists
      let apiUrl = fullApiUrl;
      if (apiBaseUrl === '/api') {
        apiUrl = `/api/admin/dashboard`; // Custom API endpoint
        attemptInfo.usingCustomApiRoute = true;
      }
      
      // Send API request
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store'
      });
      
      attemptInfo.status = response.status;
      attemptInfo.contentType = response.headers.get('content-type');
      
      console.log(`API response status: ${response.status}`);
      
      if (response.ok) {
        // Parse JSON
        const parseResult = await safeParseJson(response);
        
        attemptInfo.parseResult = {
          success: parseResult.success,
          error: parseResult.error
        };
        
        if (parseResult.success && parseResult.data) {
          console.log('API data successfully retrieved');
          setDashboardData(parseResult.data);
          setIsUsingDummyData(false);
          attemptInfo.success = true;
          
          setSnackbar({
            open: true,
            message: 'Data loaded successfully!',
            severity: 'success'
          });
          
          setApiDebugInfo({...debugInfo, attempts: [attemptInfo]});
          setLoading(false);
          return; // Exit function on success
        } else {
          attemptInfo.success = false;
          console.error('Failed to parse API response:', parseResult.error);
        }
      } else {
        // Examine response in case of error
        const parseResult = await safeParseJson(response);
        attemptInfo.parseResult = {
          success: parseResult.success,
          error: parseResult.error,
          text: parseResult.text
        };
        
        console.error('API error response:', parseResult);
      }
      
      debugInfo.attempts.push(attemptInfo);
      
      // Handle token renewal and error conditions
      await handleErrorAndTokenRenewal(debugInfo, token);
      
    } catch (err) {
      console.error('General error:', err);
      setError(`Unexpected error: ${err.message}`);
      setIsUsingDummyData(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions
  const debugTokenAndUser = (token, userStr, debugInfo) => {
    try {
      // Token analysis
      if (token) {
        const tokenParts = token.split('.');
        debugInfo.tokenInfo = { 
          exists: true,
          format: tokenParts.length === 3 ? 'JWT' : 'Unknown',
          firstChars: token.substring(0, 15) + '...'
        };
        
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            debugInfo.tokenInfo.expiryTime = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Not found';
            debugInfo.tokenInfo.userId = payload.user_id || payload.sub || 'Not found';
            debugInfo.tokenInfo.isExpired = payload.exp ? (payload.exp * 1000 < Date.now()) : 'Unknown';
          } catch (e) {
            debugInfo.tokenInfo.parseError = e.message;
          }
        }
      } else {
        debugInfo.tokenInfo = { exists: false };
      }
      
      // User analysis
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          debugInfo.userInfo = {
            id: userObj.id || 'Not found',
            role: userObj.role || 'Not found'
          };
        } catch (e) {
          debugInfo.userInfo = { parseError: e.message };
        }
      } else {
        debugInfo.userInfo = { exists: false };
      }
    } catch (e) {
      debugInfo.analyzeError = e.message;
    }
  };
  
  const handleNoToken = (debugInfo) => {
    console.error('Valid token not found');
    setSnackbar({
      open: true,
      message: 'Your session is invalid. Please log in again.',
      severity: 'error'
    });
    
    setApiDebugInfo(debugInfo);
    setLoading(false);
    
    setTimeout(() => {
      router.push('/login?redirect=/admin/dashboard');
    }, 2000);
  };
  
  const handleErrorAndTokenRenewal = async (debugInfo, token) => {
    // Try token renewal
    try {
      console.log('Attempting token renewal...');
      debugInfo.tokenRefresh = { attempted: true, timestamp: new Date().toISOString() };
      
      const refreshResult = await refreshToken();
      debugInfo.tokenRefresh.result = refreshResult;
      
      if (refreshResult && refreshResult.success) {
        console.log('Token renewed, request will be repeated');
        debugInfo.tokenRefresh.success = true;
        
        // Retry request
        await retryWithNewToken(debugInfo);
      } else {
        // Token renewal failed
        fallbackToMockData(debugInfo, "Could not renew token");
      }
    } catch (refreshErr) {
      console.error('Token renewal error:', refreshErr);
      debugInfo.tokenRefresh = { 
        attempted: true, 
        error: refreshErr.message,
        timestamp: new Date().toISOString()
      };
      
      fallbackToMockData(debugInfo, "Token renewal error");
    }
    
    setApiDebugInfo(debugInfo);
  };
  
  const retryWithNewToken = async (debugInfo) => {
    try {
      const newToken = localStorage.getItem('access_token');
      const fullApiUrl = `${apiBaseUrl}/${customEndpoint}`.replace(/\/+/g, '/').replace(':/', '://');
      
      debugInfo.tokenRefresh.retryAttempt = {
        url: fullApiUrl,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(fullApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        credentials: 'include',
        cache: 'no-store'
      });
      
      debugInfo.tokenRefresh.retryStatus = response.status;
      
      if (response.ok) {
        const parseResult = await safeParseJson(response);
        debugInfo.tokenRefresh.parseResult = parseResult;
        
        if (parseResult.success && parseResult.data) {
          setDashboardData(parseResult.data);
          setIsUsingDummyData(false);
          debugInfo.tokenRefresh.retrySuccess = true;
          
          setSnackbar({
            open: true,
            message: 'Token renewed and data loaded successfully!',
            severity: 'success'
          });
          
          return true;
        }
      }
      
      // Retry failed
      fallbackToMockData(debugInfo, "Request with renewed token failed");
      return false;
    } catch (retryErr) {
      debugInfo.tokenRefresh.retryError = retryErr.message;
      fallbackToMockData(debugInfo, "Retry error");
      return false;
    }
  };
  
  const fallbackToMockData = (debugInfo, errorMsg) => {
    console.log(`${errorMsg}, using sample data`);
    setIsUsingDummyData(true);
    setError('Could not connect to API. Showing sample data.');
    setSnackbar({
      open: true,
      message: 'Could not connect to API. Displaying temporary data.',
      severity: 'warning'
    });
  };
  
  // Safe JSON parse - protection against HTML responses
  const safeParseJson = async (response) => {
    try {
      const text = await response.text();
      
      // Check if response is HTML
      if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
        console.error('Received HTML response:', text.substring(0, 150));
        return { error: 'Received HTML response, expected JSON', htmlResponse: true, text: text.substring(0, 150) };
      }
      
      try {
        return { data: JSON.parse(text), success: true };
      } catch (e) {
        console.error('JSON parse error:', e, 'Response:', text.substring(0, 150));
        return { error: 'JSON parse error', text: text.substring(0, 150) };
      }
    } catch (e) {
      console.error('Error reading response:', e);
      return { error: 'Could not read response' };
    }
  };

  // Fetch data when page loads
  useEffect(() => {
    // Use saved API URL if available
    const savedApiUrl = localStorage.getItem('wisentia_api_base_url');
    if (savedApiUrl) {
      setApiBaseUrl(savedApiUrl);
    }
    
    const savedEndpoint = localStorage.getItem('wisentia_custom_endpoint');
    if (savedEndpoint) {
      setCustomEndpoint(savedEndpoint);
    }
    
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create user growth chart data from dailyNewUsers
  const generateUserGrowthData = () => {
    if (!dashboardData?.dailyNewUsers) return [];
    
    return Object.entries(dashboardData.dailyNewUsers).map(([date, count]) => ({
      date,
      users: count
    }));
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
      }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px'
          }}
        >
          <LinearProgress sx={{ height: '4px' }} />
        </Box>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
          Loading Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Preparing platform statistics...
        </Typography>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 3, 
        bgcolor: '#FFEBEE', 
        color: 'error.main',
        border: '1px solid #FFCDD2',
        maxWidth: 600,
        mx: 'auto',
        mt: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon fontSize="large" sx={{ mr: 2, color: 'error.main' }} />
          <Typography variant="h5" gutterBottom fontWeight={600}>Dashboard Could Not Be Loaded</Typography>
        </Box>
        <Typography variant="body1" paragraph>{error}</Typography>
        <Typography variant="body2" paragraph color="text.secondary">
          The server is not responding or there may be a connection issue.
          Please check your internet connection and try again.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button 
            variant="contained" 
            color="error" 
            sx={{ borderRadius: 2, px: 3 }} 
            onClick={() => handleRefreshData()}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ borderRadius: 2, px: 3 }} 
            onClick={() => router.push('/login?redirect=/admin/dashboard')}
          >
            Login Again
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Box
      component="div"
      sx={{
        p: { xs: 2, md: 3 },
        m: 0,
        overflowX: 'hidden',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Debug and Settings Buttons */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', gap: 1 }}>
        <IconButton 
          color="primary" 
          onClick={toggleSettings}
          sx={{ 
            bgcolor: 'background.paper', 
            boxShadow: 2,
            '&:hover': { bgcolor: 'primary.lighter' } 
          }}
        >
          <SettingsIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          onClick={toggleDebugInfo}
          sx={{ 
            bgcolor: 'background.paper', 
            boxShadow: 2,
            '&:hover': { bgcolor: 'primary.lighter' } 
          }}
        >
          <BugReportIcon />
        </IconButton>
      </Box>

      {/* API Settings */}
      {showSettings && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2, 
            border: '1px dashed',
            borderColor: 'primary.main',
            bgcolor: 'primary.lighter',
            position: 'relative'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
            API Settings
          </Typography>
          
          <Button 
            size="small" 
            variant="outlined" 
            color="primary"
            onClick={toggleSettings}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            Close
          </Button>
          
          <Box sx={{ mt: 2, maxWidth: 500 }}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
              <InputLabel id="api-url-label">API Base URL</InputLabel>
              <Select
                labelId="api-url-label"
                value={apiBaseUrl}
                onChange={handleApiUrlChange}
                label="API Base URL"
              >
                {API_URL_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="API Endpoint"
              variant="outlined"
              size="small"
              value={customEndpoint}
              onChange={handleCustomEndpointChange}
              helperText="Example: admin/dashboard or admin/dashboard/"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Select a localhost URL to direct API requests directly to the Django backend. 
              This can solve routing issues if the Next.js proxy is not working.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                size="small"
                onClick={handleRefreshData}
                startIcon={<RefreshIcon />}
              >
                Refresh with New Settings
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary"
                size="small"
                onClick={useMockData}
                startIcon={<CloudDownloadIcon />}
              >
                Use Sample Data
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Debug Information */}
      {showDebugInfo && apiDebugInfo && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2, 
            border: '1px dashed',
            borderColor: 'warning.main',
            bgcolor: 'warning.lighter',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 400
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: 'warning.dark', fontWeight: 'bold' }}>
            API Debug Information
          </Typography>
          
          <Button 
            size="small" 
            variant="outlined" 
            color="warning"
            onClick={toggleDebugInfo}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            Close
          </Button>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>API URL:</Typography>
            <pre style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              padding: '8px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              Base URL: {apiDebugInfo.apiBaseUrl || 'Not set'}
              Endpoint: {apiDebugInfo.customEndpoint || 'Not set'}
            </pre>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Token Information:</Typography>
            <pre style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              padding: '8px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(apiDebugInfo.tokenInfo, null, 2)}
            </pre>
          </Box>
          
          {apiDebugInfo.userInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>User Information:</Typography>
              <pre style={{ 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                padding: '8px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(apiDebugInfo.userInfo, null, 2)}
              </pre>
            </Box>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>API Attempt Results:</Typography>
            <pre style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              padding: '8px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              maxHeight: 150
            }}>
              {JSON.stringify(apiDebugInfo.attempts, null, 2)}
            </pre>
          </Box>
          
          {apiDebugInfo.tokenRefresh && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Token Renewal:</Typography>
              <pre style={{ 
                backgroundColor: 'rgba(0,0,0,0.05)', 
                padding: '8px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(apiDebugInfo.tokenRefresh, null, 2)}
              </pre>
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="warning"
              size="small"
              onClick={handleRefreshData}
              startIcon={<RefreshIcon />}
            >
              Retry API
            </Button>
            
            <Button 
              variant="outlined" 
              color="warning"
              size="small"
              onClick={() => {
                localStorage.removeItem('access_token');
                router.push('/login?redirect=/admin/dashboard');
              }}
            >
              Refresh Session
            </Button>
          </Box>
        </Paper>
      )}

      {isUsingDummyData && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': { alignItems: 'center' }
          }}
          action={
            <Button 
              color="warning" 
              size="small" 
              onClick={handleRefreshData}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          }
        >
          <Typography variant="subtitle2">
            Could not connect to API. Currently displaying sample data.
          </Typography>
        </Alert>
      )}

      {/* Summary Cards Row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, width: '100%' }}>
        {/* Total Users */}
        <Card sx={{ 
          borderRadius: 2,
          flex: '1 1 250px',
          minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33% - 24px)' },
          boxShadow: theme.shadows[3],
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
          },
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dashboardData?.summary?.totalUsers?.toLocaleString() || '0'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important', color: 'inherit' }} />}
                    label={`+${dashboardData?.summary?.newUsers || 0}`}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(46, 125, 50, 0.1)', 
                      color: 'success.main',
                      fontSize: '0.75rem',
                      height: 22,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    in the last 30 days
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.main',
                width: 40,
                height: 40,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <PeopleIcon sx={{ fontSize: '1.2rem' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        {/* Active Courses */}
        <Card sx={{ 
          borderRadius: 2,
          flex: '1 1 250px',
          minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33% - 24px)' },
          boxShadow: theme.shadows[3],
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
          },
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active Courses
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dashboardData?.summary?.activeCourses?.toLocaleString() || '0'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important', color: 'inherit' }} />}
                    label="+3.2%"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(46, 125, 50, 0.1)', 
                      color: 'success.main',
                      fontSize: '0.75rem',
                      height: 22,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    compared to last week
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'info.light', 
                color: 'info.dark',
                width: 40,
                height: 40,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <SchoolIcon sx={{ fontSize: '1.2rem' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        {/* Active Quests */}
        <Card sx={{ 
          borderRadius: 2,
          flex: '1 1 250px',
          minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33% - 24px)' },
          boxShadow: theme.shadows[3],
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
          },
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active Quests
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dashboardData?.summary?.activeQuests?.toLocaleString() || '0'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important', color: 'inherit' }} />}
                    label="+6.7%"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(46, 125, 50, 0.1)', 
                      color: 'success.main',
                      fontSize: '0.75rem',
                      height: 22,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    compared to last week
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'warning.light', 
                color: 'warning.dark',
                width: 40,
                height: 40,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <QuestIcon sx={{ fontSize: '1.2rem' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        {/* Total NFTs */}
        <Card sx={{ 
          borderRadius: 2,
          flex: '1 1 250px',
          minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33% - 24px)' },
          boxShadow: theme.shadows[3],
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
          },
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total NFTs
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dashboardData?.summary?.totalNFTs?.toLocaleString() || '0'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important', color: 'inherit' }} />}
                    label="+8.3%"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(46, 125, 50, 0.1)', 
                      color: 'success.main',
                      fontSize: '0.75rem',
                      height: 22,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    compared to last month
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'secondary.light', 
                color: 'secondary.main',
                width: 40,
                height: 40,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <VideoIcon sx={{ fontSize: '1.2rem' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        {/* Active Subscriptions */}
        <Card sx={{ 
          borderRadius: 2,
          flex: '1 1 250px',
          minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33% - 24px)' },
          boxShadow: theme.shadows[3],
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
          },
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active Subscriptions
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {dashboardData?.summary?.activeSubscriptions?.toLocaleString() || '0'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important', color: 'inherit' }} />}
                    label="+10.3%"
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(46, 125, 50, 0.1)', 
                      color: 'success.main',
                      fontSize: '0.75rem',
                      height: 22,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    compared to last week
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ 
                bgcolor: 'success.light', 
                color: 'success.dark',
                width: 40,
                height: 40,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <SubscriptionIcon sx={{ fontSize: '1.2rem' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
        
        {/* Make Announcement */}
        <Card sx={{ 
          borderRadius: 2,
          flex: '1 1 250px',
          minWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33% - 24px)' },
          boxShadow: theme.shadows[3],
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6],
            bgcolor: 'background.paper',
          },
        }}>
          <CardContent sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            textAlign: 'center',
            p: 3
          }}>
            <Avatar sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.main', 
              width: 48, 
              height: 48,
              mb: 2,
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
            }}>
              <NotificationsIcon sx={{ fontSize: '1.5rem' }} />
            </Avatar>
            
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Create Announcement
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Send notification to all users
            </Typography>
            
            <Button 
              variant="contained"
              color="primary"
              sx={{ 
                borderRadius: 2, 
                mt: 'auto', 
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                }
              }}
            >
              Create Announcement
            </Button>
          </CardContent>
        </Card>
      </Box>
      
      {/* Charts Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, width: '100%' }}>
        {/* User Growth Chart - Full Width */}
        <Card sx={{ 
          borderRadius: 3,
          flex: '2 1 600px',
          minWidth: { xs: '100%', lg: 'calc(66% - 24px)' },
          boxShadow: theme.shadows[5],
          overflow: 'hidden'
        }}>
          <CardHeader
            title="User Growth"
            subheader="Last 30 days"
            action={
              <IconButton aria-label="settings" size="small">
                <MoreVertIcon />
              </IconButton>
            }
            sx={{ 
              p: 3,
              '& .MuiCardHeader-title': { 
                fontSize: '1.1rem',
                fontWeight: 600
              },
              '& .MuiCardHeader-subheader': {
                fontSize: '0.85rem'
              }
            }}
          />
          <Divider />
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ height: 450, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={generateUserGrowthData()}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3f51b5" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="rgba(0,0,0,0.5)"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="rgba(0,0,0,0.5)"
                    width={35}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: 8, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      border: 'none'
                    }}
                    formatter={(value) => [`${value} users`, 'New Registrations']}
                    labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3f51b5" 
                    fill="url(#colorUsers)" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        
        {/* User Distribution Pie Chart */}
        <Card sx={{ 
          borderRadius: 3,
          flex: '1 1 300px',
          minWidth: { xs: '100%', lg: 'calc(33% - 24px)' },
          boxShadow: theme.shadows[5],
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <CardHeader
            title="User Distribution"
            subheader="By activity status"
            action={
              <IconButton aria-label="settings" size="small">
                <MoreVertIcon />
              </IconButton>
            }
            sx={{ 
              p: 3,
              '& .MuiCardHeader-title': { 
                fontSize: '1.1rem',
                fontWeight: 600
              },
              '& .MuiCardHeader-subheader': {
                fontSize: '0.85rem'
              }
            }}
          />
          <Divider />
          <CardContent sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 3
          }}>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.userTypeDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(dashboardData?.userTypeDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, name]}
                    contentStyle={{ 
                      borderRadius: 8,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      border: 'none'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Activity Chart & NFT Minting Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, width: '100%' }}>
        {/* Weekly Activities Bar Chart */}
        <Card sx={{ 
          borderRadius: 3,
          flex: '3 1 600px',
          minWidth: { xs: '100%', lg: '60%' },
          boxShadow: theme.shadows[5],
          overflow: 'hidden'
        }}>
          <CardHeader
            title="Weekly Activities"
            subheader="Course and quest engagement"
            action={
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ fontSize: '0.85rem' }}
              >
                View All
              </Button>
            }
            sx={{ 
              p: 3,
              '& .MuiCardHeader-title': { 
                fontSize: '1.1rem',
                fontWeight: 600
              },
              '& .MuiCardHeader-subheader': {
                fontSize: '0.85rem'
              }
            }}
          />
          <Divider />
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ height: 450, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData?.dailyActivities || []}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: 8, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      border: 'none'
                    }}
                    formatter={(value, name) => {
                      const formattedName = name === 'courses' ? 'Course Viewing' : 'Quest Completion';
                      return [value, formattedName];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      return value === 'courses' ? 'Course Viewing' : 'Quest Completion';
                    }}
                  />
                  <Bar dataKey="courses" fill="#3f51b5" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="quests" fill="#ff9800" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        
        {/* NFT Minting Stats Line Chart */}
        <Card sx={{ 
          borderRadius: 3,
          flex: '2 1 400px',
          minWidth: { xs: '100%', lg: '35%' },
          boxShadow: theme.shadows[5],
          overflow: 'hidden'
        }}>
          <CardHeader
            title="NFT Minting Statistics"
            subheader="Last 6 months"
            action={
              <IconButton aria-label="settings" size="small">
                <MoreVertIcon />
              </IconButton>
            }
            sx={{ 
              p: 3,
              '& .MuiCardHeader-title': { 
                fontSize: '1.1rem',
                fontWeight: 600
              },
              '& .MuiCardHeader-subheader': {
                fontSize: '0.85rem'
              }
            }}
          />
          <Divider />
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ height: 450, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dashboardData?.nftMintingStats || []}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: 8, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      border: 'none'
                    }}
                    formatter={(value) => [`${value} NFTs`, 'Minted']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#9c27b0" 
                    strokeWidth={3}
                    dot={{ stroke: '#9c27b0', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 10, stroke: '#9c27b0', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
      
      {/* Data Tables & Activity Log */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, width: '100%' }}>
        {/* Popular Courses Table */}
        <Card sx={{ 
          borderRadius: 3,
          flex: '1 1 500px',
          minWidth: { xs: '100%', lg: '48%' },
          boxShadow: theme.shadows[3],
          overflow: 'hidden'
        }}>
          <CardHeader
            title="Popular Courses"
            subheader="By enrollment count"
            action={
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ fontSize: '0.85rem' }}
                href="/admin/content?type=courses"
              >
                View All
              </Button>
            }
            sx={{ 
              p: 3,
              '& .MuiCardHeader-title': { 
                fontSize: '1.1rem',
                fontWeight: 600
              },
              '& .MuiCardHeader-subheader': {
                fontSize: '0.85rem'
              }
            }}
          />
          <Divider />
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem', py: 1.5, bgcolor: 'background.paper' }}>Course Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem', py: 1.5, bgcolor: 'background.paper' }}>Enrolled</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(dashboardData?.popularCourses || []).map((course) => (
                  <TableRow 
                    key={course.CourseID} 
                    hover
                    sx={{
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell component="th" scope="row" sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: 'primary.lighter', 
                            color: 'primary.main',
                            mr: 1.5
                          }}
                        >
                          <VideoIcon sx={{ fontSize: '1rem' }} />
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {course.Title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          borderRadius: 10,
                          px: 1.5,
                          py: 0.5,
                          display: 'inline-block',
                          fontWeight: 'medium'
                        }}
                      >
                        {course.EnrolledUsers}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        
        {/* Recent Activities List - Using custom component to avoid hydration errors */}
        <Card sx={{ 
          borderRadius: 3,
          flex: '1 1 500px',
          minWidth: { xs: '100%', lg: '48%' },
          boxShadow: theme.shadows[3],
          overflow: 'hidden'
        }}>
          <CardHeader
            title="Recent Activities"
            subheader="Latest user interactions"
            action={
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ fontSize: '0.85rem' }}
              >
                View All
              </Button>
            }
            sx={{ 
              p: 3,
              '& .MuiCardHeader-title': { 
                fontSize: '1.1rem',
                fontWeight: 600
              },
              '& .MuiCardHeader-subheader': {
                fontSize: '0.85rem'
              }
            }}
          />
          <Divider />
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {(dashboardData?.recentActivities || []).map((activity) => (
              <ActivityCard key={activity.LogID} activity={activity} />
            ))}
          </Box>
        </Card>
      </Box>
      
      {/* Completion Rate Card */}
      <Card sx={{ 
        borderRadius: 3,
        mb: 2,
        width: '100%',
        boxShadow: theme.shadows[4],
        overflow: 'hidden'
      }}>
        <CardHeader
          title="Course Completion Rates"
          subheader="By category"
          sx={{ 
            p: 3,
            '& .MuiCardHeader-title': { 
              fontSize: '1.1rem',
              fontWeight: 600
            },
            '& .MuiCardHeader-subheader': {
              fontSize: '0.85rem'
            }
          }}
        />
        <Divider />
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {(dashboardData?.courseCompletionRates || []).map((category) => (
              <Box 
                key={category.category}
                sx={{
                  flex: '1 1 300px',
                  minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' },
                }}
              >
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[3],
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {category.category}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold" 
                      color={category.rate > 75 ? 'success.main' : category.rate > 50 ? 'primary.main' : 'warning.main'}
                    >
                      {category.rate}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={category.rate} 
                    sx={{ 
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'rgba(0,0,0,0.05)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        bgcolor: category.rate > 75 ? 'success.main' : category.rate > 50 ? 'primary.main' : 'warning.main',
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {category.rate > 75 ? 'Excellent performance' : category.rate > 50 ? 'Good performance' : 'Needs improvement'}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%', boxShadow: theme.shadows[3] }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}