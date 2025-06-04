"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  AlertTitle,
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
  CircularProgress,
  Tab,
  Tabs,
  Stack,
  Avatar,
  Skeleton,
  Fade,
  Container,
  useMediaQuery,
  useTheme as useMuiTheme,
  LinearProgress,
  FormControlLabel,
  styled,
  alpha,
  Divider,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  InfoOutlined as InfoIcon,
  DonutLarge as DonutIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  CheckCircleOutline as CheckIcon,
  Science as ScienceIcon,
  DataUsage as DataIcon,
  Analytics as AnalyticsIcon,
  ShowChart as ChartIcon,
  Timeline as TimelineIcon,
  Monitor as MonitorIcon,
  Equalizer as EqualizerIcon,
  PieChart as PieChartIcon,
  AccountBalance as WalletIcon,
  CreditCard as CreditCardIcon,
  Toll as TokenIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

// Scientific Subscription Colors
const SUB_COLORS = {
  primary: '#00F5FF',     // Cyan
  secondary: '#FF1493',   // Deep Pink  
  accent: '#00FF00',      // Lime Green
  warning: '#FFD700',     // Gold
  success: '#32CD32',     // Lime Green
  info: '#1E90FF',        // Dodger Blue
  neutral: '#6B7280',     // Gray
  premium: '#8A2BE2',     // Blue Violet
  glass: 'rgba(0, 245, 255, 0.1)',
  gradients: {
    primary: 'linear-gradient(135deg, #00F5FF 0%, #0080FF 100%)',
    secondary: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
    accent: 'linear-gradient(135deg, #00FF00 0%, #32CD32 100%)',
    warning: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    success: 'linear-gradient(135deg, #32CD32 0%, #90EE90 100%)',
    premium: 'linear-gradient(135deg, #8A2BE2 0%, #DA70D6 100%)',
    data: 'linear-gradient(135deg, #1E90FF 0%, #87CEEB 100%)'
  }
};

// Scientific Style Components
const SubCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(SUB_COLORS.primary, 0.2)}`,
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(SUB_COLORS.primary, 0.4)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: variant === 'primary' ? SUB_COLORS.gradients.primary : 
                variant === 'secondary' ? SUB_COLORS.gradients.secondary :
                variant === 'premium' ? SUB_COLORS.gradients.premium :
                SUB_COLORS.gradients.data,
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
    color: SUB_COLORS.primary,
    fontWeight: 700,
    background: alpha(SUB_COLORS.primary, 0.08),
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      background: SUB_COLORS.gradients.primary,
    }
  },
          '&:hover': {
    color: SUB_COLORS.primary,
    background: alpha(SUB_COLORS.primary, 0.04),
  },
}));

const DataMetric = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: 12,
  background: alpha(SUB_COLORS.primary, 0.04),
  border: `1px solid ${alpha(SUB_COLORS.primary, 0.1)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: alpha(SUB_COLORS.primary, 0.08),
    transform: 'scale(1.02)',
  }
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  fontFamily: 'monospace',
  color: SUB_COLORS.primary,
  lineHeight: 1,
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  }
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const SubAvatar = styled(Avatar)(({ color, size = 48 }) => ({
  width: size,
  height: size,
  background: color || SUB_COLORS.gradients.primary,
  boxShadow: `0 4px 12px ${alpha(SUB_COLORS.primary, 0.3)}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 6px 16px ${alpha(SUB_COLORS.primary, 0.4)}`,
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${SUB_COLORS.primary} 0%, ${SUB_COLORS.secondary} 100%)`,
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
    id={`subscription-tabpanel-${index}`}
    aria-labelledby={`subscription-tab-${index}`}
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

// Scientific Skeleton
const SubscriptionSkeleton = () => (
  <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
    <Box sx={{ p: 4 }}>
      <Skeleton variant="text" width={400} height={60} sx={{ bgcolor: 'rgba(0, 245, 255, 0.1)' }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mt: 4 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={140} sx={{ bgcolor: 'rgba(0, 245, 255, 0.1)', borderRadius: 2 }} />
        ))}
      </Box>
    </Box>
    </Box>
  );

export default function SubscriptionManagementPage() {
  // States
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    PlanName: '',
    Description: '',
    DurationDays: '',
    Price: '',
    Features: '',
    IsActive: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Safe auth hook usage with error handling
  let user = null;
  let isAuthenticated = false;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
  } catch (authError) {
    console.warn('Auth context not available, checking localStorage for admin access');
    // Fallback: localStorage'dan kullanıcı bilgilerini kontrol et
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
        if (storedUser && accessToken) {
          user = JSON.parse(storedUser);
          isAuthenticated = true;
        }
      } catch (e) {
        console.error('Error checking stored auth:', e);
      }
    }
  }

  const router = useRouter();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Auth check useEffect
  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      console.log('Admin access denied, redirecting to login');
      router.push('/login?redirect=/admin/subscriptions');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Memoized calculations for performance
  const metrics = useMemo(() => {
    if (!subscriptionData) return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      monthlyRevenue: 0,
      conversionRate: 0
    };
    
    return {
      totalSubscribers: subscriptionData.totalSubscribers || 0,
      activeSubscribers: subscriptionData.activeSubscribers || 0,
      monthlyRevenue: subscriptionData.monthlyRevenue || 0,
      conversionRate: subscriptionData.conversionRate || 0
    };
  }, [subscriptionData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscriptionData().finally(() => setRefreshing(false));
  };

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Set subscription data
      if (data) {
        setSubscriptionData(data);
      } else {
        console.warn("API didn't return subscriptionData, using empty object");
        setSubscriptionData({});
      }
      
      setError(null);
    } catch (err) {
      console.error('Subscription data fetch error:', err);
      setError(err.message);
      
      // Set fallback empty data
      setSubscriptionData({
        plans: [],
        recentSubscriptions: [],
              totalSubscribers: 0,
              activeSubscribers: 0,
              monthlyRevenue: 0,
              conversionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchSubscriptionData();
  }, []);

  const handleCreatePlan = () => {
    // Reset form data
    setFormData({
      PlanName: '',
      Description: '',
      DurationDays: '',
      Price: '',
      Features: '',
      IsActive: true
    });
    setEditingPlan('new');
    setDialogOpen(true);
  };

  const handleEditPlan = (plan) => {
    setFormData({
      PlanName: plan.PlanName || '',
      Description: plan.Description || '',
      DurationDays: plan.DurationDays || '',
      Price: plan.Price || '',
      Features: plan.Features || '',
      IsActive: plan.IsActive === undefined ? true : Boolean(plan.IsActive),
    });
    setEditingPlan(plan.PlanID);
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Convert to correct types
      const dataToSend = {
        PlanName: formData.PlanName.trim(),
        Description: formData.Description.trim(),
        DurationDays: parseInt(formData.DurationDays),
        Price: parseFloat(formData.Price),
        Features: formData.Features.trim(),
        IsActive: formData.IsActive
      };

      const isNewPlan = editingPlan === 'new';
      
      // Select the correct API endpoint
      const url = isNewPlan 
        ? '/api/admin/subscriptions/plans/create' 
        : `/api/admin/subscriptions/plans/${editingPlan}/update`;

      console.log(`Sending ${isNewPlan ? 'POST' : 'PUT'} request to ${url} with data:`, dataToSend);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(url, {
        method: isNewPlan ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData);

      if (response.ok) {
        if (isNewPlan) {
          // Add the new plan to the list
          const newPlan = {
            PlanID: responseData.plan?.PlanID || Date.now(),
            PlanName: dataToSend.PlanName,
            Description: dataToSend.Description,
            DurationDays: dataToSend.DurationDays,
            Price: dataToSend.Price,
            Features: dataToSend.Features,
            IsActive: dataToSend.IsActive
          };
          
          setSubscriptionData({...subscriptionData, plans: [...(subscriptionData.plans || []), newPlan]});
        } else {
          // Update the existing plan in the list
          setSubscriptionData({
            ...subscriptionData,
            plans: subscriptionData.plans.map(plan => 
              plan.PlanID === editingPlan ? 
            { 
              ...plan, 
                  PlanName: dataToSend.PlanName,
                  Description: dataToSend.Description,
                  DurationDays: dataToSend.DurationDays,
                  Price: dataToSend.Price,
                  Features: dataToSend.Features,
                  IsActive: dataToSend.IsActive
            } : plan
            )
          });
        }
      } else {
        throw new Error(responseData.message || `Failed to ${isNewPlan ? 'create' : 'update'} plan`);
      }

      setDialogOpen(false);
      setEditingPlan(null);
      
      // Show success message
      showSnackbar(
        `Plan ${isNewPlan ? 'created' : 'updated'} successfully`, 
        'success'
      );

      // Refresh data after successful operation
      await fetchSubscriptionData();
      
    } catch (err) {
      console.error('Form submission error:', err);
      showSnackbar(err.message, 'error');
      
      // Even in error case, close dialog to avoid confusion
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (planId, isActive) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`/api/admin/subscriptions/plans/${planId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ IsActive: !isActive }),
      });

      if (response.ok) {
      // Always update the UI regardless of whether it's a simulated response or not
        setSubscriptionData({
          ...subscriptionData,
          plans: subscriptionData.plans.map(plan => 
        plan.PlanID === planId ? { ...plan, IsActive: !isActive } : plan
          )
        });
      
      const actionText = !isActive ? 'activated' : 'deactivated';
        showSnackbar(`Plan ${actionText} successfully`, 'success');
      } else {
        throw new Error('Failed to toggle plan status');
      }
    } catch (err) {
      console.error('Toggle plan error:', err);
      
      // In case of error, still update UI for better user experience
      setSubscriptionData({
        ...subscriptionData,
        plans: subscriptionData.plans.map(plan => 
        plan.PlanID === planId ? { ...plan, IsActive: !isActive } : plan
        )
      });
      
      showSnackbar(`Plan ${!isActive ? 'activated' : 'deactivated'} (UI only, backend error)`, 'warning');
    }
  };

  // Show loading skeleton
  if (loading && !subscriptionData) {
    return <SubscriptionSkeleton />;
  }

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
            fontFamily: 'monospace'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Scientific Header */}
        <HeaderContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <SubAvatar size={72} sx={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                <PaymentIcon sx={{ fontSize: 36 }} />
              </SubAvatar>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" component="h1" fontWeight={800} sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  SUBSCRIPTION LAB
            </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1, fontFamily: 'monospace' }}>
                  Advanced Subscription Management System
            </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip 
                    label="🔄 REAL-TIME DATA" 
                    icon={<SpeedIcon sx={{ color: '#10b981 !important' }} />}
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.25)', 
                      color: '#10b981',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                      backdropFilter: 'blur(10px)',
                      '& .MuiChip-icon': {
                        color: '#10b981'
                      },
                      '&:hover': {
                        bgcolor: 'rgba(16, 185, 129, 0.35)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <Chip 
                    label={`📊 PLANS: ${subscriptionData?.plans?.length || 0}`} 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      color: 'white',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.25)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <Chip 
                    label={`👥 USERS: ${metrics.totalSubscribers || 0}`} 
                    sx={{ 
                      bgcolor: `rgba(0, 245, 255, 0.15)`, 
                      color: SUB_COLORS.primary,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      border: `1px solid ${alpha(SUB_COLORS.primary, 0.25)}`,
                      boxShadow: `0 2px 8px ${alpha(SUB_COLORS.primary, 0.1)}`,
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: `rgba(0, 245, 255, 0.25)`,
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Stack>
          </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={refreshing}
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePlan}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1.2,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  background: SUB_COLORS.gradients.accent,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(SUB_COLORS.accent, 0.4)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
                CREATE PLAN
            </Button>
          </Box>
        </Box>
        </HeaderContainer>

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
              mb: 3, 
              borderRadius: 2,
                background: 'rgba(255, 20, 147, 0.1)',
                border: '1px solid #FF1493',
                color: '#FFFFFF',
                '& .MuiAlert-icon': { color: '#FF1493' }
            }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
              <AlertTitle>Subscription Data Error</AlertTitle>
            {error}
          </Alert>
        </Fade>
      )}

        {/* Scientific Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          // Loading skeletons
          [...Array(4)].map((_, index) => (
            <Grid item xs={12} md={6} lg={3} key={`stat-skeleton-${index}`}>
                <Skeleton variant="rounded" height={140} animation="wave" sx={{ bgcolor: 'rgba(0, 245, 255, 0.1)' }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} md={6} lg={3}>
                <DataMetric>
                  <SubAvatar sx={{ width: 48, height: 48, mx: 'auto', mb: 2 }}>
                    <PeopleIcon />
                  </SubAvatar>
                  <MetricValue>
                    {metrics.totalSubscribers.toLocaleString()}
                  </MetricValue>
                  <MetricLabel>Total Subscribers</MetricLabel>
                </DataMetric>
            </Grid>
              
            <Grid item xs={12} md={6} lg={3}>
                <DataMetric>
                  <SubAvatar sx={{ 
                    width: 48, 
                    height: 48, 
                    mx: 'auto', 
                    mb: 2,
                    background: SUB_COLORS.gradients.success
                  }}>
                    <MoneyIcon />
                  </SubAvatar>
                  <MetricValue sx={{ color: SUB_COLORS.success }}>
                    ${metrics.monthlyRevenue.toLocaleString()}
                  </MetricValue>
                  <MetricLabel>Monthly Revenue</MetricLabel>
                </DataMetric>
            </Grid>
              
            <Grid item xs={12} md={6} lg={3}>
                <DataMetric>
                  <SubAvatar sx={{ 
                    width: 48, 
                    height: 48, 
                    mx: 'auto', 
                    mb: 2,
                    background: SUB_COLORS.gradients.info
                  }}>
                    <ChartIcon />
                  </SubAvatar>
                  <MetricValue sx={{ color: SUB_COLORS.info }}>
                    {metrics.conversionRate.toFixed(1)}%
                  </MetricValue>
                  <MetricLabel>Conversion Rate</MetricLabel>
                </DataMetric>
            </Grid>
              
            <Grid item xs={12} md={6} lg={3}>
                <DataMetric>
                  <SubAvatar sx={{ 
                    width: 48, 
                    height: 48, 
                    mx: 'auto', 
                    mb: 2,
                    background: SUB_COLORS.gradients.warning
                  }}>
                    <DonutIcon />
                  </SubAvatar>
                  <MetricValue sx={{ color: SUB_COLORS.warning }}>
                    {metrics.activeSubscribers.toLocaleString()}
                  </MetricValue>
                  <MetricLabel>Active Users</MetricLabel>
                </DataMetric>
            </Grid>
          </>
        )}
      </Grid>

        {/* Scientific Tabs */}
        <SubCard sx={{ mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile={isMobile}
              sx={{ 
              '& .MuiTabs-indicator': {
                display: 'none'
              },
              borderBottom: `1px solid ${alpha(SUB_COLORS.primary, 0.1)}`
            }}
          >
            <ScientificTab 
              icon={<PaymentIcon />} 
              label="SUBSCRIPTION PLANS" 
              iconPosition="start"
            />
            <ScientificTab 
              icon={<CalendarIcon />} 
              label="RECENT SUBSCRIPTIONS" 
              iconPosition="start"
            />
            </Tabs>
        </SubCard>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <SubCard variant="primary">
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <PaymentIcon sx={{ color: SUB_COLORS.primary }} />
                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    SUBSCRIPTION PLANS CONTROL
                    </Typography>
                  </Box>
                  <Tooltip title="Manage your subscription plans here">
                    <IconButton>
                    <InfoIcon />
                    </IconButton>
                  </Tooltip>
              </Box>
              
              <TableContainer>
                  {loading ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        {['Plan Name', 'Duration', 'Price', 'Features', 'Active Subs', 'Status', 'Actions'].map((header, index) => (
                          <TableCell key={`header-${index}`} sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            <Skeleton animation="wave" height={24} width="80%" />
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...Array(3)].map((_, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                          {[...Array(7)].map((_, colIndex) => (
                            <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                              <Skeleton 
                                animation="wave" 
                                height={colIndex === 0 ? 48 : 24} 
                                width={colIndex === 0 ? "90%" : (colIndex === 6 ? "30%" : "60%")} 
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  subscriptionData.plans?.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <SubAvatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          background: alpha(SUB_COLORS.primary, 0.1),
                        }}
                      >
                        <PaymentIcon fontSize="large" />
                      </SubAvatar>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, fontFamily: 'monospace' }}>
                        No subscription plans
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto', fontFamily: 'monospace' }}>
                        Create your first subscription plan to start managing user subscriptions.
                      </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreatePlan}
                            sx={{ 
                          background: SUB_COLORS.gradients.primary,
                          fontFamily: 'monospace'
                            }}
                          >
                            Create First Plan
                          </Button>
                    </Box>
                    ) : (
                    <Table>
                        <TableHead>
                          <TableRow>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.primary }}>PLAN NAME</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.primary }}>DURATION</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.primary }}>PRICE</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.primary }}>FEATURES</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.primary }}>ACTIVE SUBS</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.primary }}>STATUS</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.primary }}>ACTIONS</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {subscriptionData.plans.map((plan, index) => (
                            <TableRow 
                              key={plan.PlanID}
                              sx={{ 
                                transition: 'all 0.2s',
                                '&:hover': { 
                                backgroundColor: alpha(SUB_COLORS.primary, 0.05),
                                transform: 'scale(1.01)'
                              }
                            }}
                          >
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <SubAvatar size={32} sx={{ background: SUB_COLORS.gradients.primary }}>
                                  <SecurityIcon sx={{ fontSize: 16 }} />
                                </SubAvatar>
                                  {plan.PlanName}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              <Chip 
                                label={`${plan.DurationDays} days`}
                                size="small"
                                sx={{ fontFamily: 'monospace', bgcolor: alpha(SUB_COLORS.info, 0.1) }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: SUB_COLORS.success }}>
                              ${plan.Price}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', maxWidth: 200 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                  fontFamily: 'monospace'
                                  }}
                                >
                                {plan.Features || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                              <Badge 
                                badgeContent={subscriptionData.planStats?.[plan.PlanID]?.activeCount || 0}
                                    color="primary"
                                    sx={{ 
                                  '& .MuiBadge-badge': { 
                                    fontFamily: 'monospace',
                                    background: SUB_COLORS.gradients.primary
                                  } 
                                }}
                              >
                                <PeopleIcon />
                              </Badge>
                              </TableCell>
                              <TableCell>
                                <Chip
                                label={plan.IsActive ? 'ACTIVE' : 'INACTIVE'}
                                color={plan.IsActive ? 'success' : 'default'}
                                  size="small"
                                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Edit Plan">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditPlan(plan)}
                                    sx={{ color: SUB_COLORS.info }}
                                  >
                                    <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                <Tooltip title={plan.IsActive ? 'Deactivate' : 'Activate'}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleToggleActive(plan.PlanID, plan.IsActive)}
                                    sx={{ color: plan.IsActive ? SUB_COLORS.warning : SUB_COLORS.success }}
                                  >
                                    {plan.IsActive ? <BlockIcon /> : <CheckCircleIcon />}
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
          </SubCard>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <SubCard variant="secondary">
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <CalendarIcon sx={{ color: SUB_COLORS.secondary }} />
                <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                  RECENT SUBSCRIPTION ACTIVITY
                    </Typography>
                  </Box>
              
              <TableContainer>
                {loading ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        {['User', 'Plan', 'Start Date', 'Status', 'Payment'].map((header, index) => (
                          <TableCell key={`header-${index}`} sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            <Skeleton animation="wave" height={24} width="80%" />
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...Array(4)].map((_, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                          {[...Array(5)].map((_, colIndex) => (
                            <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                              <Skeleton animation="wave" height={24} width="60%" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  subscriptionData.recentSubscriptions?.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <SubAvatar
                sx={{ 
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          background: alpha(SUB_COLORS.secondary, 0.1),
                        }}
                      >
                        <CalendarIcon fontSize="large" />
                      </SubAvatar>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, fontFamily: 'monospace' }}>
                        No recent subscriptions
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        Users' subscription activities will appear here once they purchase subscription plans.
                      </Typography>
                    </Box>
                  ) : (
                    <Table>
                        <TableHead>
                          <TableRow>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.secondary }}>USER</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.secondary }}>PLAN</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.secondary }}>START DATE</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.secondary }}>STATUS</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.secondary }}>PAYMENT</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                        {subscriptionData.recentSubscriptions.map((subscription, index) => (
                              <TableRow 
                            key={subscription.SubscriptionID}
                                sx={{ 
                                  transition: 'all 0.2s',
                                  '&:hover': { 
                                backgroundColor: alpha(SUB_COLORS.secondary, 0.05),
                                transform: 'scale(1.01)'
                              }
                            }}
                          >
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <SubAvatar size={32} sx={{ background: SUB_COLORS.gradients.secondary }}>
                                  <PeopleIcon sx={{ fontSize: 16 }} />
                                </SubAvatar>
                                      {subscription.Username}
                                  </Box>
                                </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                    {subscription.PlanName}
                                </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              {new Date(subscription.StartDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                label={subscription.IsActive ? 'ACTIVE' : 'EXPIRED'}
                                color={subscription.IsActive ? 'success' : 'error'}
                                    size="small"
                                sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                                  />
                                </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>
                              <Stack direction="row" alignItems="center" gap={1}>
                                {subscription.PaymentMethod === 'wallet' ? <WalletIcon /> : <CreditCardIcon />}
                                {subscription.PaymentMethod}
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
          </SubCard>
        </TabPanel>

        {/* Scientific Plan Form Dialog */}
      <Dialog 
          open={dialogOpen} 
          onClose={() => !loading && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? 'rgba(15, 23, 42, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(SUB_COLORS.primary, 0.2)}`
            }
          }}
      >
        <DialogTitle sx={{ 
          px: 3, 
          py: 2.5, 
            borderBottom: `1px solid ${alpha(SUB_COLORS.primary, 0.1)}`,
            background: alpha(SUB_COLORS.primary, 0.05)
          }}>
            <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', fontFamily: 'monospace' }}>
              <PaymentIcon sx={{ mr: 1.5, color: SUB_COLORS.primary }} />
              {editingPlan === 'new' ? 'CREATE NEW SUBSCRIPTION PLAN' : 'EDIT SUBSCRIPTION PLAN'}
          </Typography>
        </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Plan Name"
                    name="PlanName"
                    value={formData.PlanName}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                    error={formData.PlanName === ''}
                    helperText={formData.PlanName === '' ? 'Plan name is required' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontFamily: 'monospace'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Duration (days)"
                    name="DurationDays"
                type="number"
                    value={formData.DurationDays}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: 1 }}
                    error={!formData.DurationDays || formData.DurationDays < 1}
                    helperText={!formData.DurationDays || formData.DurationDays < 1 ? 'Duration must be at least 1 day' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontFamily: 'monospace'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Price ($)"
                    name="Price"
                type="number"
                    value={formData.Price}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ step: 0.01, min: 0 }}
                    error={formData.Price < 0}
                    helperText={formData.Price < 0 ? 'Price cannot be negative' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontFamily: 'monospace'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                    label="Features (comma separated)"
                    name="Features"
                    value={formData.Features}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                    placeholder="e.g., Premium courses, Advanced analytics"
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontFamily: 'monospace'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                    name="Description"
                    value={formData.Description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontFamily: 'monospace'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                        checked={formData.IsActive}
                    onChange={handleInputChange}
                        name="IsActive"
                    color="primary"
                  />
                }
                label={
                      <Typography fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                        {formData.IsActive ? 'ACTIVE' : 'INACTIVE'}
                  </Typography>
                }
                    sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
            </Box>
        </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(SUB_COLORS.primary, 0.1)}` }}>
          <Button 
              onClick={() => setDialogOpen(false)} 
            color="inherit"
              disabled={loading}
            sx={{ 
              borderRadius: 2,
                px: 3,
                fontFamily: 'monospace'
            }}
          >
              CANCEL
          </Button>
          <Button 
              type="submit"
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
              disabled={loading || !formData.PlanName || !formData.DurationDays || formData.DurationDays < 1 || formData.Price < 0}
            sx={{ 
              borderRadius: 2,
              px: 3,
                background: SUB_COLORS.gradients.primary,
                fontFamily: 'monospace',
                fontWeight: 700
              }}
            >
              {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  PROCESSING...
              </>
            ) : (
                editingPlan === 'new' ? 'CREATE PLAN' : 'UPDATE PLAN'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </>
  );
}