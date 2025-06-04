// src/app/subscriptions/page.jsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  Stack,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  styled,
  alpha,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as WalletIcon,
  Toll as TokenIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as AutoRenewIcon,
  History as HistoryIcon,
  Diamond as DiamondIcon,
  Science as ScienceIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Scientific Subscription Colors
const SUB_COLORS = {
  primary: '#00F5FF',     // Cyan
  secondary: '#FF1493',   // Deep Pink  
  accent: '#00FF00',      // Lime Green
  warning: '#FFD700',     // Gold
  success: '#32CD32',     // Lime Green
  info: '#1E90FF',        // Dodger Blue
  premium: '#8A2BE2',     // Blue Violet
  gradients: {
    primary: 'linear-gradient(135deg, #00F5FF 0%, #0080FF 100%)',
    secondary: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
    accent: 'linear-gradient(135deg, #00FF00 0%, #32CD32 100%)',
    premium: 'linear-gradient(135deg, #8A2BE2 0%, #DA70D6 100%)',
    gold: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
  }
};

// Scientific Style Components
const SubCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(SUB_COLORS.primary, 0.2)}`,
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${alpha(SUB_COLORS.primary, 0.4)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: variant === 'premium' ? SUB_COLORS.gradients.premium : 
                variant === 'primary' ? SUB_COLORS.gradients.primary :
                variant === 'gold' ? SUB_COLORS.gradients.gold :
                SUB_COLORS.gradients.accent,
  }
}));

const PlanCard = styled(Card)(({ theme, featured = false }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: featured 
    ? `2px solid ${SUB_COLORS.primary}` 
    : `1px solid ${alpha(SUB_COLORS.primary, 0.2)}`,
  borderRadius: 20,
  boxShadow: featured 
    ? `0 8px 32px ${alpha(SUB_COLORS.primary, 0.3)}` 
    : '0 4px 12px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  transform: featured ? 'scale(1.05)' : 'scale(1)',
  '&:hover': {
    transform: featured ? 'scale(1.08)' : 'scale(1.02)',
    boxShadow: `0 12px 40px ${alpha(SUB_COLORS.primary, 0.2)}`,
  },
  '&::before': featured ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: SUB_COLORS.gradients.primary,
  } : {}
}));

const SubAvatar = styled(Avatar)(({ color, size = 48 }) => ({
  width: size,
  height: size,
  background: color || SUB_COLORS.gradients.primary,
  boxShadow: `0 4px 12px ${alpha(SUB_COLORS.primary, 0.3)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 6px 16px ${alpha(SUB_COLORS.primary, 0.4)}`,
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${SUB_COLORS.primary} 0%, ${SUB_COLORS.secondary} 100%)`,
  borderRadius: 20,
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

const SubscriptionSkeleton = () => (
  <Box sx={{ minHeight: '100vh' }}>
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ bgcolor: 'rgba(0, 245, 255, 0.1)', borderRadius: 3, mb: 4 }} />
      <Grid container spacing={3}>
        {[...Array(3)].map((_, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Skeleton variant="rectangular" height={400} sx={{ bgcolor: 'rgba(0, 245, 255, 0.1)', borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all subscription plans
      const plansResponse = await fetch('/api/subscriptions/plans');
      if (!plansResponse.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const plansData = await plansResponse.json();
      setPlans(plansData);
      
      // Fetch user subscription info if user is logged in
      if (user) {
        const userSubResponse = await fetch('/api/subscriptions/user');
        if (userSubResponse.ok) {
          const userSubData = await userSubResponse.json();
          setUserSubscription(userSubData);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions().finally(() => setRefreshing(false));
  };

  const handleSubscribe = async (planId) => {
    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          paymentMethod: 'wallet',
          autoRenew: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe to plan');
      }
      
      const result = await response.json();
      alert('Subscription successful!');
      
      // Refresh user subscription info
      if (user) {
        const userSubResponse = await fetch('/api/subscriptions/user');
        if (userSubResponse.ok) {
          const userSubData = await userSubResponse.json();
          setUserSubscription(userSubData);
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      alert('Subscription cancelled successfully');
      
      // Refresh user subscription info
      if (user) {
        const userSubResponse = await fetch('/api/subscriptions/user');
        if (userSubResponse.ok) {
          const userSubData = await userSubResponse.json();
          setUserSubscription(userSubData);
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleToggleAutoRenew = async (subscriptionId, autoRenew) => {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/auto-renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoRenew: !autoRenew
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle auto-renew');
      }
      
      alert(`Auto-renew ${!autoRenew ? 'enabled' : 'disabled'} successfully`);
      
      // Refresh user subscription info
      if (user) {
        const userSubResponse = await fetch('/api/subscriptions/user');
        if (userSubResponse.ok) {
          const userSubData = await userSubResponse.json();
          setUserSubscription(userSubData);
        }
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <SubscriptionSkeleton />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ 
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
            <AlertTitle>Subscription Error</AlertTitle>
            {error}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Scientific Header */}
        <HeaderContainer>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <SubAvatar size={72} sx={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                <DiamondIcon sx={{ fontSize: 36 }} />
              </SubAvatar>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" component="h1" fontWeight={800} sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  PREMIUM ACCESS
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1, fontFamily: 'monospace' }}>
                  Unlock Advanced Learning Features
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip 
                    label="SUBSCRIPTION PLANS" 
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.2)', 
                      color: '#10b981',
                      fontFamily: 'monospace',
                      fontWeight: 700
                    }}
                  />
                  <Chip 
                    label={`${plans.length} AVAILABLE`} 
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
            </Box>
          </Box>
        </HeaderContainer>

        {/* Current Subscription */}
        {userSubscription && userSubscription.activeSubscriptions && userSubscription.activeSubscriptions.length > 0 && (
          <Fade in={true} timeout={500}>
            <SubCard variant="premium" sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <SubAvatar sx={{ background: SUB_COLORS.gradients.premium }}>
                    <SecurityIcon />
                  </SubAvatar>
                  <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    YOUR ACTIVE SUBSCRIPTION
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  {userSubscription.activeSubscriptions.map((sub) => (
                    <Grid item xs={12} md={6} key={sub.SubscriptionID}>
                      <SubCard>
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                              {sub.PlanName}
                            </Typography>
                            <Chip 
                              label="ACTIVE" 
                              color="success"
                              size="small"
                              sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                            />
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <ScheduleIcon sx={{ color: SUB_COLORS.info, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              Valid until: {new Date(sub.EndDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Stack direction="row" spacing={2}>
                            <Button 
                              onClick={() => handleCancelSubscription(sub.SubscriptionID)}
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              sx={{ 
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                borderRadius: 2
                              }}
                            >
                              CANCEL
                            </Button>
                            <Button 
                              onClick={() => handleToggleAutoRenew(sub.SubscriptionID, sub.AutoRenew)}
                              variant="outlined"
                              color={sub.AutoRenew ? 'warning' : 'success'}
                              size="small"
                              startIcon={<AutoRenewIcon />}
                              sx={{ 
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                borderRadius: 2
                              }}
                            >
                              {sub.AutoRenew ? 'DISABLE AUTO-RENEW' : 'ENABLE AUTO-RENEW'}
                            </Button>
                          </Stack>
                        </CardContent>
                      </SubCard>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </SubCard>
          </Fade>
        )}

        {/* Available Plans */}
        <SubCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <SubAvatar sx={{ background: SUB_COLORS.gradients.primary }}>
                <PaymentIcon />
              </SubAvatar>
              <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                AVAILABLE SUBSCRIPTION PLANS
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {plans.map((plan, index) => (
                <Grid item xs={12} md={4} key={plan.PlanID}>
                  <Fade in={true} timeout={500 + index * 100}>
                    <PlanCard featured={index === 1}>
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        {index === 1 && (
                          <Chip 
                            label="MOST POPULAR" 
                            color="primary"
                            sx={{ 
                              position: 'absolute',
                              top: -12,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              background: SUB_COLORS.gradients.primary
                            }}
                          />
                        )}
                        
                        <SubAvatar 
                          size={64} 
                          sx={{ 
                            mx: 'auto', 
                            mb: 3,
                            background: index === 0 ? SUB_COLORS.gradients.accent :
                                       index === 1 ? SUB_COLORS.gradients.primary :
                                       SUB_COLORS.gradients.premium
                          }}
                        >
                          {index === 0 ? <SpeedIcon sx={{ fontSize: 32 }} /> :
                           index === 1 ? <StarIcon sx={{ fontSize: 32 }} /> :
                           <DiamondIcon sx={{ fontSize: 32 }} />}
                        </SubAvatar>

                        <Typography variant="h4" fontWeight={800} sx={{ 
                          mb: 1, 
                          fontFamily: 'monospace',
                          color: index === 0 ? SUB_COLORS.accent :
                                 index === 1 ? SUB_COLORS.primary :
                                 SUB_COLORS.premium
                        }}>
                          {plan.PlanName}
                        </Typography>

                        <Typography variant="h3" fontWeight={900} sx={{ 
                          mb: 1,
                          fontFamily: 'monospace',
                          color: index === 0 ? SUB_COLORS.accent :
                                 index === 1 ? SUB_COLORS.primary :
                                 SUB_COLORS.premium
                        }}>
                          ${plan.Price}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ 
                          mb: 3,
                          fontFamily: 'monospace'
                        }}>
                          for {plan.DurationDays} days
                        </Typography>

                        <Box sx={{ mb: 4, textAlign: 'left' }}>
                          {plan.Features ? plan.Features.split(',').map((feature, i) => (
                            <Box key={i} display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                              <CheckCircleIcon sx={{ 
                                color: index === 0 ? SUB_COLORS.accent :
                                       index === 1 ? SUB_COLORS.primary :
                                       SUB_COLORS.premium,
                                fontSize: 20 
                              }} />
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {feature.trim()}
                              </Typography>
                            </Box>
                          )) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {plan.Description || 'Premium features included'}
                            </Typography>
                          )}
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={() => handleSubscribe(plan.PlanID)}
                          sx={{
                            py: 1.5,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            borderRadius: 3,
                            background: index === 0 ? SUB_COLORS.gradients.accent :
                                       index === 1 ? SUB_COLORS.gradients.primary :
                                       SUB_COLORS.gradients.premium,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(SUB_COLORS.primary, 0.4)}`
                            }
                          }}
                        >
                          SUBSCRIBE NOW
                        </Button>
                      </CardContent>
                    </PlanCard>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </SubCard>

        {/* Subscription History */}
        {userSubscription && userSubscription.history && userSubscription.history.length > 0 && (
          <Fade in={true} timeout={800}>
            <SubCard variant="gold">
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <SubAvatar sx={{ background: SUB_COLORS.gradients.gold }}>
                    <HistoryIcon />
                  </SubAvatar>
                  <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    SUBSCRIPTION HISTORY
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.warning }}>PLAN</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.warning }}>START DATE</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.warning }}>END DATE</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: SUB_COLORS.warning }}>PAYMENT</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userSubscription.history.map((sub) => (
                        <TableRow 
                          key={sub.SubscriptionID}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: alpha(SUB_COLORS.warning, 0.05) 
                            }
                          }}
                        >
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <SubAvatar size={24} sx={{ background: SUB_COLORS.gradients.gold }}>
                                <PaymentIcon sx={{ fontSize: 12 }} />
                              </SubAvatar>
                              {sub.PlanName}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            {new Date(sub.StartDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            {new Date(sub.EndDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            <Stack direction="row" alignItems="center" gap={1}>
                              {sub.PaymentMethod === 'wallet' ? <WalletIcon /> : <CreditCardIcon />}
                              {sub.PaymentMethod}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </SubCard>
          </Fade>
        )}
      </Container>
    </MainLayout>
  );
}