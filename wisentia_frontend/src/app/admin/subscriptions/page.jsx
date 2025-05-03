"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  CircularProgress,
  Tab,
  Tabs,
  Stack,
  Avatar,
  LinearProgress,
  Skeleton,
  Fade,
  Zoom
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Animated stat card component
const StatCard = ({ icon, title, value, trend, trendValue, color, delay = 0 }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Format trend dynamically
  let formattedTrend = trend;
  if (trendValue !== undefined) {
    formattedTrend = trendValue >= 0 ? `+${trendValue.toFixed(1)}%` : `${trendValue.toFixed(1)}%`;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.palette.mode === 'dark' 
              ? `0 8px 32px ${alpha(color, 0.3)}` 
              : `0 8px 32px ${alpha(color, 0.2)}`
          }
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          width: 150, 
          height: 150, 
          borderRadius: '50%', 
          background: alpha(color, isDarkMode ? 0.15 : 0.08), 
          top: -30, 
          right: -30,
          zIndex: 0
        }} />
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha(color, isDarkMode ? 0.2 : 0.1), 
                color: color,
                width: 48,
                height: 48,
                boxShadow: `0 4px 8px ${alpha(color, 0.3)}`
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="h6" fontWeight="medium" sx={{ ml: 2 }}>
              {title}
            </Typography>
          </Box>
          <Typography 
            variant="h4" 
            component="div" 
            fontWeight="bold" 
            sx={{ 
              mb: 0.5,
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>
          {formattedTrend && (
            <Typography 
              variant="body2" 
              color={!formattedTrend.startsWith('-') ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {!formattedTrend.startsWith('-') ? 
                <CheckCircleOutlineIcon sx={{ fontSize: 16, mr: 0.5 }}/> : 
                <ErrorOutlineIcon sx={{ fontSize: 16, mr: 0.5 }}/>
              }
              {formattedTrend} from previous month
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Table loading skeleton
const TableSkeleton = ({ rowCount = 3, colCount = 7 }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          {[...Array(colCount)].map((_, index) => (
            <TableCell key={`header-${index}`}>
              <Skeleton animation="wave" height={24} width="80%" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {[...Array(rowCount)].map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {[...Array(colCount)].map((_, colIndex) => (
              <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                <Skeleton 
                  animation="wave" 
                  height={colIndex === 0 ? 48 : 24} 
                  width={colIndex === 0 ? "90%" : (colIndex === colCount - 1 ? "30%" : "60%")} 
                />
                {colIndex === 0 && (
                  <Skeleton animation="wave" height={16} width="60%" sx={{ mt: 1 }} />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Empty state component
const EmptyState = ({ icon, title, message, action }) => {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: alpha('#6A82FB', 0.1),
            color: '#6A82FB',
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          {message}
        </Typography>
        {action}
      </motion.div>
    </Box>
  );
};

export default function SubscriptionManagementPage() {
  const [plans, setPlans] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    conversionRate: 0,
    trends: {
      totalSubscribers: 0,
      activeSubscribers: 0,
      monthlyRevenue: 0,
      conversionRate: 0
    },
    planStats: {}
  });
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    durationDays: 30,
    price: 0,
    nftId: '',
    features: '',
    isActive: true,
  });
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Function to handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  // Helper function to show snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscriptionData().finally(() => {
      setRefreshing(false);
    });
  };

  // Function to fetch subscription data from API
  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching subscription data...");
      
      // Make API request to fetch subscription data
      const response = await fetch('/api/admin/subscriptions');
      
      // Process response data
      const data = await response.json();
      console.log("API response:", data);
      
      // Check for error in response
      if (data.error) {
        console.warn("API returned error:", data.error);
        showSnackbar(`Warning: ${data.error}. Using available data.`, 'warning');
      }
      
      // Set plans data
      if (Array.isArray(data.plans)) {
        setPlans(data.plans);
      } else {
        console.warn("API didn't return plans array, using empty array");
        setPlans([]);
      }
      
      // Set subscription stats
      if (data.stats) {
        setSubscriptionStats({
          totalSubscribers: data.stats.totalSubscribers || 0,
          activeSubscribers: data.stats.activeSubscribers || 0,
          monthlyRevenue: data.stats.monthlyRevenue || 0,
          yearlyRevenue: data.stats.yearlyRevenue || 0,
          conversionRate: data.stats.conversionRate || 0,
          trends: data.stats.trends || {
            totalSubscribers: 0,
            activeSubscribers: 0,
            monthlyRevenue: 0,
            conversionRate: 0
          },
          planStats: data.stats.planStats || {}
        });
      }
      
      // Set recent subscriptions
      if (Array.isArray(data.recentSubscriptions)) {
        setRecentSubscriptions(data.recentSubscriptions);
      } else {
        console.warn("API didn't return recentSubscriptions array, using empty array");
        setRecentSubscriptions([]);
      }
      
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError(err.message || 'Failed to load subscription data');
      showSnackbar(`Error: ${err.message || 'Failed to load subscription data'}`, 'error');
      
      // If error occurs, make another attempt with fallback API
      try {
        console.log("Trying fallback API...");
        const fallbackResponse = await fetch('/api/admin/subscriptions?fallback=true');
        const fallbackData = await fallbackResponse.json();
        
        if (Array.isArray(fallbackData.plans)) {
          setPlans(fallbackData.plans);
          setSubscriptionStats(fallbackData.stats || {
            totalSubscribers: 0,
            activeSubscribers: 0,
            monthlyRevenue: 0,
            yearlyRevenue: 0,
            conversionRate: 0,
            trends: {
              totalSubscribers: 0,
              activeSubscribers: 0,
              monthlyRevenue: 0,
              conversionRate: 0
            },
            planStats: {}
          });
          setRecentSubscriptions(fallbackData.recentSubscriptions || []);
          
          showSnackbar('Using fallback data due to API error', 'info');
        }
      } catch (fallbackErr) {
        console.error('Fallback API also failed:', fallbackErr);
        // Keep error state
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Admin check
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchSubscriptionData();
    }
  }, [user, router]);

  const handleCreatePlan = () => {
    // Reset form data
    setFormData({
      planName: '',
      description: '',
      durationDays: 30,
      price: 0,
      nftId: '',
      features: '',
      isActive: true,
    });
    setEditingPlanId('new');
    setOpenDialog(true);
  };

  const handleEditPlan = (plan) => {
    setFormData({
      planName: plan.PlanName || '',
      description: plan.Description || '',
      durationDays: plan.DurationDays || 30,
      price: plan.Price || 0,
      nftId: plan.NFTID || '',
      features: plan.Features || '',
      isActive: plan.IsActive === undefined ? true : Boolean(plan.IsActive),
    });
    setEditingPlanId(plan.PlanID);
    setOpenDialog(true);
  };

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
      setFormSubmitting(true);
      
      // Convert to correct types
      const dataToSend = {
        planName: formData.planName.trim(),
        description: formData.description.trim(),
        durationDays: parseInt(formData.durationDays),
        price: parseFloat(formData.price),
        nftId: formData.nftId ? parseInt(formData.nftId) : null,
        features: formData.features.trim(),
        isActive: formData.isActive
      };

      const isNewPlan = editingPlanId === 'new';
      
      // Select the correct API endpoint
      const url = isNewPlan 
        ? '/api/admin/subscriptions/plans/create' 
        : `/api/admin/subscriptions/plans/${editingPlanId}/update`;

      console.log(`Sending ${isNewPlan ? 'POST' : 'PUT'} request to ${url} with data:`, dataToSend);

      const response = await fetch(url, {
        method: isNewPlan ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend),
      });

      // Process response data
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error || `Failed to save plan`);
      }
      
      console.log('API Response:', responseData);

      // Handle simulated response
      if (responseData.message && responseData.message.includes('simülasyon')) {
        console.log('Received simulated success response');
        
        // In simulation mode, update UI directly with the provided data
        if (isNewPlan) {
          // Add the new plan to the list
          const newPlan = {
            PlanID: responseData.plan?.PlanID || Date.now(),
            PlanName: dataToSend.planName,
            Description: dataToSend.description,
            DurationDays: dataToSend.durationDays,
            Price: dataToSend.price,
            NFTID: dataToSend.nftId,
            Features: dataToSend.features,
            IsActive: dataToSend.isActive
          };
          
          setPlans([...plans, newPlan]);
        } else {
          // Update the existing plan in the list
          setPlans(plans.map(plan => 
            plan.PlanID === editingPlanId ? 
            { 
              ...plan, 
              PlanName: dataToSend.planName,
              Description: dataToSend.description,
              DurationDays: dataToSend.durationDays,
              Price: dataToSend.price,
              NFTID: dataToSend.nftId,
              Features: dataToSend.features,
              IsActive: dataToSend.isActive
            } : plan
          ));
        }
      } else {
        // If not simulation, refresh all data from API
        await fetchSubscriptionData();
      }

      setOpenDialog(false);
      setEditingPlanId(null);
      
      // Show success message
      showSnackbar(
        isNewPlan ? 'Subscription plan created successfully' : 'Subscription plan updated successfully', 
        'success'
      );
    } catch (err) {
      console.error('Form submission error:', err);
      showSnackbar(`Error: ${err.message}`, 'error');
      
      // Even in error case, close dialog to avoid confusion
      setOpenDialog(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (planId, isActive) => {
    try {
      const url = `/api/admin/subscriptions/plans/${planId}/update`;
      
      console.log(`Sending PUT request to ${url} to toggle active status to ${!isActive}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      // Process response data
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      console.log('Toggle active response:', responseData);

      // Always update the UI regardless of whether it's a simulated response or not
      setPlans(plans.map(plan => 
        plan.PlanID === planId ? { ...plan, IsActive: !isActive } : plan
      ));
      
      const actionText = !isActive ? 'activated' : 'deactivated';
      const messageText = responseData.message?.includes('simülasyon') 
        ? `Plan ${actionText} successfully (simulated)` 
        : `Plan ${actionText} successfully`;
        
      showSnackbar(messageText, 'success');
    } catch (err) {
      console.error('Toggle active error:', err);
      showSnackbar(`Error: ${err.message}`, 'error');
      
      // In case of error, still update UI for better user experience
      setPlans(plans.map(plan => 
        plan.PlanID === planId ? { ...plan, IsActive: !isActive } : plan
      ));
      
      showSnackbar(`Plan ${!isActive ? 'activated' : 'deactivated'} (UI only, backend error)`, 'warning');
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 }, 
      maxWidth: '100%',
      backgroundColor: isDarkMode ? 'background.default' : 'background.paper'
    }}>
      {/* Header with title and create button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 4,
          gap: 2
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 0.5,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Subscription Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage subscription plans and view subscription statistics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title={refreshing ? "Refreshing..." : "Refresh data"}>
              <span>
                <IconButton 
                  color="primary" 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                >
                  <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreatePlan}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Create New Plan
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)'
            }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          // Loading skeletons
          [...Array(4)].map((_, index) => (
            <Grid item xs={12} md={6} lg={3} key={`stat-skeleton-${index}`}>
              <Skeleton variant="rounded" height={140} animation="wave" />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard 
                icon={<PeopleIcon />}
                title="Total Subscribers"
                value={subscriptionStats.totalSubscribers.toLocaleString()}
                trendValue={subscriptionStats.trends?.totalSubscribers || 0}
                color={theme.palette.primary.main}
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard 
                icon={<AttachMoneyIcon />}
                title="Monthly Revenue"
                value={`$${subscriptionStats.monthlyRevenue.toLocaleString()}`}
                trendValue={subscriptionStats.trends?.monthlyRevenue || 0}
                color={theme.palette.success.main}
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard 
                icon={<TrendingUpIcon />}
                title="Conversion Rate"
                value={`${subscriptionStats.conversionRate.toFixed(1)}%`}
                trendValue={subscriptionStats.trends?.conversionRate || 0}
                color={theme.palette.info.main}
                delay={0.3}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard 
                icon={<DonutLargeIcon />}
                title="Active Subscribers"
                value={subscriptionStats.activeSubscribers.toLocaleString()}
                trendValue={subscriptionStats.trends?.activeSubscribers || 0}
                color={theme.palette.warning.main}
                delay={0.4}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="subscription management tabs"
              textColor="primary"
              indicatorColor="primary"
              sx={{ 
                '& .MuiTab-root': { 
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 2
                } 
              }}
            >
              <Tab label="Subscription Plans" icon={<PaymentIcon />} iconPosition="start" />
              <Tab label="Recent Subscriptions" icon={<CalendarTodayIcon />} iconPosition="start" />
            </Tabs>
          </Box>
        </Box>
      </motion.div>

      {/* Subscription Plans Tab */}
      <Fade in={tabValue === 0}>
        <div style={{ display: tabValue === 0 ? 'block' : 'none' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: isDarkMode 
                ? '0 4px 20px rgba(0,0,0,0.2)' 
                : '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PaymentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h5" component="span" fontWeight={600}>
                      Subscription Plans
                    </Typography>
                  </Box>
                }
                action={
                  <Tooltip title="Manage your subscription plans here">
                    <IconButton>
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                }
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDarkMode 
                    ? alpha(theme.palette.primary.dark, 0.1) 
                    : alpha(theme.palette.primary.light, 0.1),
                  px: 3,
                  py: 2
                }}
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  {loading ? (
                    <TableSkeleton rowCount={4} colCount={7} />
                  ) : (
                    plans.length === 0 ? (
                      <EmptyState 
                        icon={<PaymentIcon fontSize="large" />}
                        title="No subscription plans found"
                        message="Create your first subscription plan to start offering premium content to your users."
                        action={
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreatePlan}
                            sx={{ 
                              mt: 2,
                              borderRadius: 8,
                              px: 3,
                              py: 1.2,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }}
                          >
                            Create First Plan
                          </Button>
                        }
                      />
                    ) : (
                      <Table sx={{ '& .MuiTableCell-root': { px: 3, py: 2 } }} stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Plan Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>NFT</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Active Subscribers</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {plans.map((plan, index) => (
                            <TableRow 
                              key={plan.PlanID}
                              sx={{ 
                                transition: 'all 0.2s',
                                position: 'relative',
                                '&:hover': { 
                                  backgroundColor: isDarkMode 
                                    ? alpha(theme.palette.primary.dark, 0.05) 
                                    : alpha(theme.palette.primary.light, 0.05),
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.1)}`
                                },
                                '&:after': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: 3,
                                  backgroundColor: plan.IsActive 
                                    ? theme.palette.success.main 
                                    : theme.palette.error.main,
                                  opacity: 0.7,
                                  transition: 'opacity 0.2s',
                                },
                                '&:hover:after': {
                                  opacity: 1
                                }
                              }}
                            >
                              <TableCell>
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight="medium"
                                  sx={{ 
                                    color: plan.IsActive 
                                      ? 'text.primary' 
                                      : 'text.disabled'
                                  }}
                                >
                                  {plan.PlanName}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color={plan.IsActive ? "text.secondary" : "text.disabled"} 
                                  sx={{ 
                                    maxWidth: 300, 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {plan.Description || 'No description'}
                                </Typography>
                              </TableCell>
                              <TableCell>{plan.DurationDays} days</TableCell>
                              <TableCell>
                                <Typography 
                                  fontWeight="medium"
                                  sx={{ 
                                    color: plan.IsActive 
                                      ? 'text.primary' 
                                      : 'text.disabled'
                                  }}
                                >
                                  ${parseFloat(plan.Price).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {plan.NFTTitle ? (
                                  <Chip 
                                    label={plan.NFTTitle} 
                                    size="small" 
                                    variant="outlined"
                                    color="primary"
                                    sx={{ 
                                      borderRadius: 1.5,
                                      opacity: plan.IsActive ? 1 : 0.6
                                    }}
                                  />
                                ) : (
                                  <Typography 
                                    variant="body2" 
                                    color={plan.IsActive ? "text.secondary" : "text.disabled"}
                                  >
                                    None
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={plan.IsActive ? 'Active' : 'Inactive'}
                                  color={plan.IsActive ? 'success' : 'error'}
                                  size="small"
                                  sx={{ 
                                    fontWeight: 500,
                                    borderRadius: '12px',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography 
                                  fontWeight="medium"
                                  sx={{ 
                                    color: plan.IsActive 
                                      ? 'text.primary' 
                                      : 'text.disabled'
                                  }}
                                >
                                  {subscriptionStats.planStats && subscriptionStats.planStats[plan.PlanID]
                                    ? subscriptionStats.planStats[plan.PlanID].activeCount || 0
                                    : 0}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Edit Plan">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleEditPlan(plan)}
                                      sx={{ 
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        transition: 'transform 0.2s, background-color 0.2s',
                                        '&:hover': {
                                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                          transform: 'scale(1.1)'
                                        }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={plan.IsActive ? 'Deactivate Plan' : 'Activate Plan'}>
                                    <IconButton
                                      size="small"
                                      color={plan.IsActive ? 'error' : 'success'}
                                      onClick={() => handleToggleActive(plan.PlanID, plan.IsActive)}
                                      sx={{ 
                                        backgroundColor: alpha(
                                          plan.IsActive ? theme.palette.error.main : theme.palette.success.main, 
                                          0.1
                                        ),
                                        transition: 'transform 0.2s, background-color 0.2s',
                                        '&:hover': {
                                          backgroundColor: alpha(
                                            plan.IsActive ? theme.palette.error.main : theme.palette.success.main, 
                                            0.2
                                          ),
                                          transform: 'scale(1.1)'
                                        }
                                      }}
                                    >
                                      {plan.IsActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )
                  )}
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Fade>
      
      {/* Recent Subscriptions Tab */}
      <Fade in={tabValue === 1}>
        <div style={{ display: tabValue === 1 ? 'block' : 'none' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: isDarkMode 
                ? '0 4px 20px rgba(0,0,0,0.2)' 
                : '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h5" component="span" fontWeight={600}>
                      Recent Subscriptions
                    </Typography>
                  </Box>
                }
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: isDarkMode 
                    ? alpha(theme.palette.primary.dark, 0.1) 
                    : alpha(theme.palette.primary.light, 0.1),
                  px: 3,
                  py: 2
                }}
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  {loading ? (
                    <TableSkeleton rowCount={4} colCount={5} />
                  ) : (
                    recentSubscriptions.length === 0 ? (
                      <EmptyState 
                        icon={<CalendarTodayIcon fontSize="large" />}
                        title="No recent subscriptions"
                        message="Users' subscription activities will appear here once they purchase subscription plans."
                        action={null}
                      />
                    ) : (
                      <Table sx={{ '& .MuiTableCell-root': { px: 3, py: 2 } }} stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentSubscriptions.map((subscription, index) => (
                            <Zoom 
                              in={true} 
                              style={{ transitionDelay: `${index * 50}ms` }}
                              key={subscription.SubscriptionID}
                            >
                              <TableRow 
                                sx={{ 
                                  transition: 'all 0.2s',
                                  position: 'relative',
                                  '&:hover': { 
                                    backgroundColor: isDarkMode 
                                      ? alpha(theme.palette.primary.dark, 0.05) 
                                      : alpha(theme.palette.primary.light, 0.05),
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.1)}`
                                  },
                                  '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 3,
                                    backgroundColor: subscription.IsActive 
                                      ? theme.palette.success.main 
                                      : theme.palette.grey[500],
                                    opacity: 0.7,
                                    transition: 'opacity 0.2s',
                                  },
                                  '&:hover:after': {
                                    opacity: 1
                                  }
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 36, 
                                        height: 36, 
                                        mr: 1.5,
                                        fontSize: '0.9rem',
                                        boxShadow: `0 3px 6px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        background: subscription.IsActive
                                          ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                          : `linear-gradient(135deg, ${theme.palette.grey[600]}, ${theme.palette.grey[400]})`
                                      }}
                                    >
                                      {subscription.Username && subscription.Username.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography 
                                      variant="subtitle2"
                                      sx={{ 
                                        color: subscription.IsActive 
                                          ? 'text.primary' 
                                          : 'text.disabled'
                                      }}
                                    >
                                      {subscription.Username}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography 
                                    variant="body2"
                                    fontWeight="medium"
                                    sx={{ 
                                      color: subscription.IsActive 
                                        ? 'text.primary' 
                                        : 'text.disabled'
                                    }}
                                  >
                                    {subscription.PlanName}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      color: subscription.IsActive 
                                        ? 'text.primary' 
                                        : 'text.disabled'
                                    }}
                                  >
                                    {new Date(subscription.StartDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      color: subscription.IsActive 
                                        ? 'text.primary' 
                                        : 'text.disabled'
                                    }}
                                  >
                                    {new Date(subscription.EndDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={subscription.IsActive ? 'Active' : 'Expired'}
                                    color={subscription.IsActive ? 'success' : 'default'}
                                    size="small"
                                    sx={{ 
                                      fontWeight: 500,
                                      borderRadius: '12px',
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            </Zoom>
                          ))}
                        </TableBody>
                      </Table>
                    )
                  )}
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Fade>

      {/* Plan Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !formSubmitting && setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }
        }}
        TransitionComponent={Zoom}
      >
        <DialogTitle sx={{ 
          px: 3, 
          py: 2.5, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: isDarkMode 
            ? alpha(theme.palette.primary.dark, 0.1) 
            : alpha(theme.palette.primary.light, 0.1)
        }}>
          <Typography 
            variant="h5" 
            component="div" 
            fontWeight="bold" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <PaymentIcon sx={{ mr: 1.5 }} />
            {editingPlanId === 'new' ? 'Create New Subscription Plan' : 'Edit Subscription Plan'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Plan Name"
                name="planName"
                value={formData.planName}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                error={formData.planName === ''}
                helperText={formData.planName === '' ? 'Plan name is required' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Duration (days)"
                name="durationDays"
                type="number"
                value={formData.durationDays}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: 1 }}
                error={!formData.durationDays || formData.durationDays < 1}
                helperText={!formData.durationDays || formData.durationDays < 1 ? 'Duration must be at least 1 day' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ step: 0.01, min: 0 }}
                error={formData.price < 0}
                helperText={formData.price < 0 ? 'Price cannot be negative' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="NFT ID"
                name="nftId"
                value={formData.nftId}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                helperText="Leave empty if no NFT is associated"
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Features (comma separated)"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Feature 1, Feature 2, Feature 3"
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label={
                  <Typography fontWeight="medium">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="inherit"
            disabled={formSubmitting}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={formSubmitting || !formData.planName || !formData.durationDays || formData.durationDays < 1 || formData.price < 0}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
              }
            }}
          >
            {formSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Zoom}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          variant="filled"
          elevation={6}
          icon={snackbar.severity === 'success' ? <CheckCircleOutlineIcon /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}