'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NFTIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Money as MoneyIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  DateRange as DateRangeIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  ComposedChart, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer
} from 'recharts';

// Mock user growth data
const userGrowthData = [
  { month: 'Jan', newUsers: 120, activeUsers: 540 },
  { month: 'Feb', newUsers: 140, activeUsers: 580 },
  { month: 'Mar', newUsers: 190, activeUsers: 650 },
  { month: 'Apr', newUsers: 210, activeUsers: 720 },
  { month: 'May', newUsers: 250, activeUsers: 810 },
  { month: 'Jun', newUsers: 280, activeUsers: 890 },
  { month: 'Jul', newUsers: 320, activeUsers: 980 },
  { month: 'Aug', newUsers: 340, activeUsers: 1050 },
  { month: 'Sep', newUsers: 370, activeUsers: 1180 },
  { month: 'Oct', newUsers: 410, activeUsers: 1320 },
  { month: 'Nov', newUsers: 450, activeUsers: 1450 },
  { month: 'Dec', newUsers: 480, activeUsers: 1580 }
];

// Mock revenue data
const revenueData = [
  { month: 'Jan', revenue: 2500, courses: 1800, nfts: 700 },
  { month: 'Feb', revenue: 2700, courses: 2000, nfts: 700 },
  { month: 'Mar', revenue: 3200, courses: 2400, nfts: 800 },
  { month: 'Apr', revenue: 3800, courses: 2800, nfts: 1000 },
  { month: 'May', revenue: 4200, courses: 3000, nfts: 1200 },
  { month: 'Jun', revenue: 4800, courses: 3500, nfts: 1300 },
  { month: 'Jul', revenue: 5200, courses: 3800, nfts: 1400 },
  { month: 'Aug', revenue: 5600, courses: 4100, nfts: 1500 },
  { month: 'Sep', revenue: 6200, courses: 4500, nfts: 1700 },
  { month: 'Oct', revenue: 6800, courses: 5000, nfts: 1800 },
  { month: 'Nov', revenue: 7400, courses: 5500, nfts: 1900 },
  { month: 'Dec', revenue: 8200, courses: 6000, nfts: 2200 }
];

// Mock enrollment data by course category
const enrollmentByCategory = [
  { name: 'Programming', value: 1250 },
  { name: 'Mathematics', value: 850 },
  { name: 'Science', value: 620 },
  { name: 'Language', value: 980 },
  { name: 'Business', value: 540 }
];

// Mock completion rates by course category
const completionRates = [
  { name: 'Programming', rate: 68 },
  { name: 'Mathematics', rate: 52 },
  { name: 'Science', rate: 45 },
  { name: 'Language', rate: 75 },
  { name: 'Business', rate: 62 }
];

// Mock user demographics by education level
const userDemographics = [
  { name: 'Primary', value: 15 },
  { name: 'Secondary', value: 25 },
  { name: 'High School', value: 30 },
  { name: 'University', value: 20 },
  { name: 'Professional', value: 10 }
];

// Mock top-performing courses
const topCourses = [
  { id: 1, title: 'Python Fundamentals', category: 'Programming', enrollments: 1250, completionRate: 78, rating: 4.8 },
  { id: 2, title: 'English for Beginners', category: 'Language', enrollments: 980, completionRate: 82, rating: 4.9 },
  { id: 3, title: 'Web Development', category: 'Programming', enrollments: 850, completionRate: 71, rating: 4.7 },
  { id: 4, title: 'General Physics', category: 'Science', enrollments: 620, completionRate: 65, rating: 4.6 },
  { id: 5, title: 'Business Strategy', category: 'Business', enrollments: 540, completionRate: 68, rating: 4.5 }
];

// Mock top users
const topUsers = [
  { id: 1, name: 'Emily Johnson', points: 1250, coursesCompleted: 8, questsCompleted: 15, nftsEarned: 6 },
  { id: 2, name: 'Michael Brown', points: 980, coursesCompleted: 6, questsCompleted: 12, nftsEarned: 4 },
  { id: 3, name: 'Jessica Smith', points: 850, coursesCompleted: 5, questsCompleted: 10, nftsEarned: 3 },
  { id: 4, name: 'Robert Miller', points: 720, coursesCompleted: 4, questsCompleted: 8, nftsEarned: 2 },
  { id: 5, name: 'Sarah Wilson', points: 680, coursesCompleted: 4, questsCompleted: 7, nftsEarned: 2 }
];

// Mock daily active users data for the past month
const dailyActiveUsers = [
  { day: '1', users: 420 },
  { day: '2', users: 450 },
  { day: '3', users: 480 },
  { day: '4', users: 460 },
  { day: '5', users: 510 },
  { day: '6', users: 530 },
  { day: '7', users: 590 },
  { day: '8', users: 620 },
  { day: '9', users: 600 },
  { day: '10', users: 580 },
  { day: '11', users: 610 },
  { day: '12', users: 640 },
  { day: '13', users: 670 },
  { day: '14', users: 700 },
  { day: '15', users: 720 },
  { day: '16', users: 750 },
  { day: '17', users: 780 },
  { day: '18', users: 760 },
  { day: '19', users: 740 },
  { day: '20', users: 770 },
  { day: '21', users: 800 },
  { day: '22', users: 830 },
  { day: '23', users: 850 },
  { day: '24', users: 880 },
  { day: '25', users: 910 },
  { day: '26', users: 940 },
  { day: '27', users: 970 },
  { day: '28', users: 990 },
  { day: '29', users: 1020 },
  { day: '30', users: 1050 }
];

// Mock NFT distribution data
const nftDistribution = [
  { name: 'Common', value: 1200 },
  { name: 'Rare', value: 450 },
  { name: 'Epic', value: 180 },
  { name: 'Legendary', value: 50 }
];

// Analytics dashboard component
export default function AnalyticsDashboard() {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('year');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Chart colors
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle refresh data
  const handleRefreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Filter data based on selected time range
  const filterDataByTimeRange = (data) => {
    switch (timeRange) {
      case 'month':
        return data.slice(-1);
      case 'quarter':
        return data.slice(-3);
      case 'half':
        return data.slice(-6);
      case 'year':
      default:
        return data;
    }
  };
  
  // Get filtered data
  const filteredUserGrowthData = filterDataByTimeRange(userGrowthData);
  const filteredRevenueData = filterDataByTimeRange(revenueData);
  
  // Calculate total stats
  const totalUsers = userGrowthData[userGrowthData.length - 1].activeUsers;
  const totalNewUsers = userGrowthData[userGrowthData.length - 1].newUsers;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const averageCompletionRate = completionRates.reduce((sum, item) => sum + item.rate, 0) / completionRates.length;
  
  // Calculate percentage changes
  const userGrowthPercentage = ((userGrowthData[userGrowthData.length - 1].activeUsers - userGrowthData[userGrowthData.length - 2].activeUsers) / userGrowthData[userGrowthData.length - 2].activeUsers * 100).toFixed(1);
  const revenueGrowthPercentage = ((revenueData[revenueData.length - 1].revenue - revenueData[revenueData.length - 2].revenue) / revenueData[revenueData.length - 2].revenue * 100).toFixed(1);
  
  return (
    <Box>
      {/* Page header and controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="month">Past Month</MenuItem>
              <MenuItem value="quarter">Past Quarter</MenuItem>
              <MenuItem value="half">Past 6 Months</MenuItem>
              <MenuItem value="year">Past Year</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
          >
            Refresh Data
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Main stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.primary.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Total Users
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <PersonIcon sx={{ color: theme.palette.primary.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {totalUsers.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +{userGrowthPercentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  vs. previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* New Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.secondary.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  New Users
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                  <PersonIcon sx={{ color: theme.palette.secondary.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {totalNewUsers.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +12.5%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  vs. previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.success.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Total Revenue
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <MoneyIcon sx={{ color: theme.palette.success.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                ${totalRevenue.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +{revenueGrowthPercentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  vs. previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Average Completion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.warning.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  Course Completion
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <CheckCircleIcon sx={{ color: theme.palette.warning.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {averageCompletionRate.toFixed(1)}%
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +3.2%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  vs. previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Analytics tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<BarChartIcon />}
            iconPosition="start"
            label="Overview" 
          />
          <Tab 
            icon={<PersonIcon />}
            iconPosition="start"
            label="Users" 
          />
          <Tab 
            icon={<SchoolIcon />}
            iconPosition="start"
            label="Courses & Quests" 
          />
          <Tab 
            icon={<NFTIcon />}
            iconPosition="start"
            label="NFTs" 
          />
          <Tab 
            icon={<MoneyIcon />}
            iconPosition="start"
            label="Revenue" 
          />
        </Tabs>
        
        {/* Overview tab */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={3}>
              {/* User Growth Chart */}
              <Grid item xs={12} lg={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="User Growth" 
                    action={
                      <IconButton aria-label="settings">
                        <LineChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 360 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={filteredUserGrowthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="activeUsers" 
                            name="Active Users"
                            stroke={theme.palette.primary.main} 
                            strokeWidth={2} 
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="newUsers" 
                            name="New Users"
                            stroke={theme.palette.secondary.main} 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Revenue Chart */}
              <Grid item xs={12} lg={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="Revenue Trends" 
                    action={
                      <IconButton aria-label="settings">
                        <BarChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 360 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={filteredRevenueData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Bar 
                            yAxisId="left"
                            dataKey="courses" 
                            name="Course Revenue"
                            fill={theme.palette.primary.main} 
                            barSize={20} 
                          />
                          <Bar 
                            yAxisId="left"
                            dataKey="nfts" 
                            name="NFT Revenue"
                            fill={theme.palette.secondary.main} 
                            barSize={20} 
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="revenue" 
                            name="Total Revenue"
                            stroke={theme.palette.success.main} 
                            strokeWidth={2} 
                            dot={{ r: 5 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Course Categories Distribution */}
              <Grid item xs={12} md={6} lg={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <CardHeader 
                    title="Enrollments by Category" 
                    action={
                      <IconButton aria-label="settings">
                        <PieChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={enrollmentByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {enrollmentByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Completion Rates */}
              <Grid item xs={12} md={6} lg={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <CardHeader 
                    title="Course Completion Rates" 
                    action={
                      <IconButton aria-label="settings">
                        <BarChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={completionRates}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" width={100} />
                          <RechartsTooltip />
                          <Bar dataKey="rate" name="Completion Rate" fill={theme.palette.primary.main}>
                            {completionRates.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.rate > 70 ? theme.palette.success.main : 
                                      entry.rate > 50 ? theme.palette.primary.main : 
                                      theme.palette.warning.main} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* User Demographics */}
              <Grid item xs={12} md={6} lg={4}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <CardHeader 
                    title="User Demographics" 
                    action={
                      <IconButton aria-label="settings">
                        <PieChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userDemographics}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {userDemographics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Top Courses Table */}
              <Grid item xs={12} lg={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader title="Top-Performing Courses" />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Enrollments</TableCell>
                          <TableCell align="right">Completion</TableCell>
                          <TableCell align="right">Rating</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.category}</TableCell>
                            <TableCell align="right">{course.enrollments}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {course.completionRate}%
                                </Typography>
                                <Box sx={{ width: 50, position: 'relative' }}>
                                  <Box
                                    sx={{
                                      width: '100%',
                                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                      borderRadius: 5,
                                      height: 5,
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      width: `${course.completionRate}%`,
                                      backgroundColor: course.completionRate > 70 
                                        ? theme.palette.success.main 
                                        : course.completionRate > 50 
                                          ? theme.palette.primary.main 
                                          : theme.palette.warning.main,
                                      borderRadius: 5,
                                      height: 5,
                                      position: 'absolute',
                                      top: 0,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {course.rating}
                                </Typography>
                                <StarIcon fontSize="small" color="warning" />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
              
              {/* Top Users Table */}
              <Grid item xs={12} lg={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader title="Top Users" />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Points</TableCell>
                          <TableCell align="right">Courses</TableCell>
                          <TableCell align="right">Quests</TableCell>
                          <TableCell align="right">NFTs</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                                  {user.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">
                                  {user.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">{user.points}</TableCell>
                            <TableCell align="right">{user.coursesCompleted}</TableCell>
                            <TableCell align="right">{user.questsCompleted}</TableCell>
                            <TableCell align="right">{user.nftsEarned}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Users tab */}
        {tabValue === 1 && (
          <Box>
            <Grid container spacing={3}>
              {/* Daily Active Users */}
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="Daily Active Users (Last 30 Days)" 
                    action={
                      <IconButton aria-label="settings">
                        <LineChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 400 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dailyActiveUsers}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area 
                            type="monotone" 
                            dataKey="users" 
                            name="Active Users"
                            stroke={theme.palette.primary.main} 
                            fill={alpha(theme.palette.primary.main, 0.2)} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* User Demographics */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="User Demographics by Education Level" 
                    action={
                      <IconButton aria-label="settings">
                        <PieChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userDemographics}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {userDemographics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* User Registration Trend */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="New User Registrations" 
                    action={
                      <IconButton aria-label="settings">
                        <BarChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredUserGrowthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar 
                            dataKey="newUsers" 
                            name="New Users"
                            fill={theme.palette.secondary.main} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Top Users Table */}
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader title="Top Users by Activity" />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Points</TableCell>
                          <TableCell align="right">Courses Completed</TableCell>
                          <TableCell align="right">Quests Completed</TableCell>
                          <TableCell align="right">NFTs Earned</TableCell>
                          <TableCell align="right">Last Active</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                                  {user.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">
                                  {user.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">{user.points}</TableCell>
                            <TableCell align="right">{user.coursesCompleted}</TableCell>
                            <TableCell align="right">{user.questsCompleted}</TableCell>
                            <TableCell align="right">{user.nftsEarned}</TableCell>
                            <TableCell align="right">Today</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Courses & Quests tab */}
        {tabValue === 2 && (
          <Box>
            <Grid container spacing={3}>
              {/* Course Category Distribution */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="Enrollments by Category" 
                    action={
                      <IconButton aria-label="settings">
                        <PieChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={enrollmentByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {enrollmentByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Course Completion Rates */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="Course Completion Rates" 
                    action={
                      <IconButton aria-label="settings">
                        <BarChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={completionRates}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 25, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" width={100} />
                          <RechartsTooltip />
                          <Bar dataKey="rate" name="Completion Rate" fill={theme.palette.primary.main}>
                            {completionRates.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.rate > 70 ? theme.palette.success.main : 
                                      entry.rate > 50 ? theme.palette.primary.main : 
                                      theme.palette.warning.main} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Top Courses Table */}
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader title="Top-Performing Courses" />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Enrollments</TableCell>
                          <TableCell align="right">Completion Rate</TableCell>
                          <TableCell align="right">Rating</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.category}</TableCell>
                            <TableCell align="right">{course.enrollments}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {course.completionRate}%
                                </Typography>
                                <Box sx={{ width: 50, position: 'relative' }}>
                                  <Box
                                    sx={{
                                      width: '100%',
                                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                      borderRadius: 5,
                                      height: 5,
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      width: `${course.completionRate}%`,
                                      backgroundColor: course.completionRate > 70 
                                        ? theme.palette.success.main 
                                        : course.completionRate > 50 
                                          ? theme.palette.primary.main 
                                          : theme.palette.warning.main,
                                      borderRadius: 5,
                                      height: 5,
                                      position: 'absolute',
                                      top: 0,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {course.rating}
                                </Typography>
                                <StarIcon fontSize="small" color="warning" />
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              ${(course.enrollments * 20).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* NFTs tab */}
        {tabValue === 3 && (
          <Box>
            <Grid container spacing={3}>
              {/* NFT Distribution */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="NFT Distribution by Rarity" 
                    action={
                      <IconButton aria-label="settings">
                        <PieChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={nftDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {nftDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.name === 'Common' ? theme.palette.primary.light :
                                  entry.name === 'Rare' ? theme.palette.primary.main :
                                  entry.name === 'Epic' ? theme.palette.secondary.main :
                                  theme.palette.secondary.dark
                                } 
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* NFT Issuance Trend */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="NFT Issuance Trend" 
                    action={
                      <IconButton aria-label="settings">
                        <LineChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={filteredUserGrowthData} // Reusing user growth data for this example
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line 
                            type="monotone" 
                            dataKey="newUsers" 
                            name="NFTs Issued"
                            stroke={theme.palette.secondary.main} 
                            strokeWidth={2} 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* NFT List */}
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader title="Most Popular NFTs" />
                  <Divider />
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{ 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }}
                        >
                          <NFTIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Python Master" 
                        secondary="Programming achievement - 650 issued"
                      />
                      <Chip 
                        label="Rare" 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main
                        }} 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        >
                          <NFTIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Web Developer" 
                        secondary="Programming achievement - 820 issued"
                      />
                      <Chip 
                        label="Common" 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.light, 0.1),
                          color: theme.palette.primary.main
                        }} 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{ 
                            bgcolor: alpha(theme.palette.secondary.dark, 0.1),
                            color: theme.palette.secondary.dark
                          }}
                        >
                          <NFTIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Math Wizard" 
                        secondary="Mathematics achievement - 120 issued"
                      />
                      <Chip 
                        label="Legendary" 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(theme.palette.secondary.dark, 0.1),
                          color: theme.palette.secondary.dark
                        }} 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{ 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main
                          }}
                        >
                          <NFTIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Language Master" 
                        secondary="Language achievement - 320 issued"
                      />
                      <Chip 
                        label="Epic" 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main
                        }} 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        >
                          <NFTIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary="Business Strategist" 
                        secondary="Business achievement - 280 issued"
                      />
                      <Chip 
                        label="Common" 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.light, 0.1),
                          color: theme.palette.primary.main
                        }} 
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Revenue tab */}
        {tabValue === 4 && (
          <Box>
            <Grid container spacing={3}>
              {/* Revenue Trend */}
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="Revenue Trends" 
                    action={
                      <IconButton aria-label="settings">
                        <BarChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 400 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={filteredRevenueData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Bar 
                            yAxisId="left"
                            dataKey="courses" 
                            name="Course Revenue"
                            fill={theme.palette.primary.main} 
                            barSize={20} 
                          />
                          <Bar 
                            yAxisId="left"
                            dataKey="nfts" 
                            name="NFT Revenue"
                            fill={theme.palette.secondary.main} 
                            barSize={20} 
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="revenue" 
                            name="Total Revenue"
                            stroke={theme.palette.success.main} 
                            strokeWidth={2} 
                            dot={{ r: 5 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Revenue by Course Category */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="Revenue by Course Category" 
                    action={
                      <IconButton aria-label="settings">
                        <PieChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={enrollmentByCategory.map(item => ({
                              ...item,
                              value: item.value * 20 // Multiplying by average course price for this example
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                          >
                            {enrollmentByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Revenue Sources */}
              <Grid item xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader 
                    title="Revenue Sources" 
                    action={
                      <IconButton aria-label="settings">
                        <PieChartIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 320 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Premium Courses', value: 42000 },
                              { name: 'Premium NFTs', value: 18000 },
                              { name: 'Subscriptions', value: 28000 },
                              { name: 'Other', value: 4000 }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill={theme.palette.primary.main} />
                            <Cell fill={theme.palette.secondary.main} />
                            <Cell fill={theme.palette.success.main} />
                            <Cell fill={theme.palette.grey[500]} />
                          </Pie>
                          <Legend />
                          <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Revenue Table */}
              <Grid item xs={12}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}
                >
                  <CardHeader title="Revenue by Course" />
                  <Divider />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Enrollments</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Growth</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>{course.title}</TableCell>
                            <TableCell>{course.category}</TableCell>
                            <TableCell align="right">{course.enrollments}</TableCell>
                            <TableCell align="right">$20</TableCell>
                            <TableCell align="right">${(course.enrollments * 20).toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <ArrowUpwardIcon 
                                  sx={{ 
                                    color: theme.palette.success.main, 
                                    fontSize: 16, 
                                    mr: 0.5 
                                  }} 
                                />
                                <Typography variant="body2" color="success.main">
                                  15.3%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}
