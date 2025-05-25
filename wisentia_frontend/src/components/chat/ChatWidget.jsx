'use client';

import { useState, useEffect } from 'react';
import { 
  Fab, 
  Badge, 
  Tooltip, 
  Box, 
  useTheme,
  alpha,
  keyframes,
  CircularProgress,
  Button,
  Typography 
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import LockIcon from '@mui/icons-material/Lock';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatDialog from './ChatDialog';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Keyframes for animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
  }
  
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(6, 182, 212, 0);
  }
  
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
`;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // Initialize with false to avoid hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // Only update authentication status on client-side after component mounts
  useEffect(() => {
    // Check if user data exists in localStorage
    const token = localStorage.getItem('access_token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        setIsAuthenticated(true);
        
        // Skip subscription check if on admin routes
        const pathname = window.location.pathname;
        const isAdminRoute = pathname.startsWith('/admin');
        
        if (isAdminRoute) {
          // If admin route, set hasSubscription to true by default (admins always have access)
          setHasSubscription(true);
          setCheckingSubscription(false);
        } else {
          // Only check subscription status for non-admin routes
          checkSubscriptionStatus(token);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  // Check subscription status
  const checkSubscriptionStatus = async (token) => {
    if (!token) return;
    
    // Skip subscription check if on admin routes
    const pathname = window.location.pathname;
    if (pathname.startsWith('/admin')) {
      setHasSubscription(true);
      return;
    }

    try {
      setCheckingSubscription(true);
      
      // Make request to subscription API
      const response = await fetch('/api/subscriptions/check-access/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        setHasSubscription(false);
        return;
      }
      
      const data = await response.json();
      setHasSubscription(data.hasAccess);
      
      // Fetch unread message count if subscribed
      if (data.hasAccess) {
        // Disable unread count fetching since the endpoint doesn't exist yet
        // We'll just use a static value of 0 for now
        setUnreadCount(0);
        
        /* Comment out the API call that's causing 404 errors
        try {
          const msgResponse = await fetch('/api/normal-user/chat/unread-count', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (msgResponse.ok) {
            const msgData = await msgResponse.json();
            setUnreadCount(msgData.count || 0);
          }
        } catch (msgError) {
          console.error('Error fetching unread count:', msgError);
          setUnreadCount(0);
        }
        */
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleOpen = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setOpen(true);
    setUnreadCount(0); // Clear unread count when opening
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Tooltip 
          title={isAuthenticated ? "Chat with Wisentia AI" : "Sign in to use Wisentia AI"}
          placement="left"
        >
          <Box sx={{ position: 'relative' }}>
            {/* Ripple effect for premium feature - only shown client-side when authenticated */}
            {isAuthenticated && (
              <>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.4)',
                  animation: `${ripple} 1.5s infinite`,
                  zIndex: -1,
                }} />
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'rgba(20, 184, 166, 0.3)',
                  animation: `${ripple} 1.5s infinite 0.5s`,
                  zIndex: -1,
                }} />
              </>
            )}
            
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              invisible={unreadCount === 0}
              sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }}
            >
              <Fab
                color="primary"
                aria-label={isAuthenticated ? "Chat with Wisentia AI" : "Sign in to use Wisentia AI"}
                onClick={handleOpen}
                sx={{
                  background: isAuthenticated 
                    ? `linear-gradient(135deg, #06b6d4, #0ea5e9, #14b8a6)`
                    : `linear-gradient(135deg, #94a3b8, #64748b)`,
                  animation: isAuthenticated ? `${pulse} 2s infinite` : 'none',
                  border: 'none',
                  backdropFilter: 'blur(4px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? isAuthenticated 
                      ? '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 10px rgba(6, 182, 212, 0.2) inset'
                      : '0 4px 15px rgba(0, 0, 0, 0.3)'
                    : isAuthenticated
                      ? '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 10px rgba(255, 255, 255, 0.2) inset'
                      : '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: isAuthenticated ? 'translateY(-3px) rotate(5deg)' : 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? isAuthenticated
                        ? '0 6px 25px rgba(6, 182, 212, 0.6), 0 0 15px rgba(6, 182, 212, 0.3) inset'
                        : '0 6px 20px rgba(0, 0, 0, 0.4)'
                      : isAuthenticated
                        ? '0 6px 25px rgba(6, 182, 212, 0.6), 0 0 15px rgba(255, 255, 255, 0.3) inset'
                        : '0 6px 20px rgba(0, 0, 0, 0.3)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isAuthenticated ? (
                    <SmartToyIcon sx={{ 
                      fontSize: 22,
                      color: '#fff',
                      filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))',
                      animation: 'breathe 3s infinite ease-in-out',
                      '@keyframes breathe': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                      }
                    }} />
                  ) : (
                    <LockIcon sx={{
                      fontSize: 22,
                      color: '#fff',
                    }} />
                  )}
                  
                  {/* Animated particles - only rendered client-side when authenticated */}
                  {isAuthenticated && (
                    <>
                      <Box sx={{
                        position: 'absolute',
                        width: '8px',
                        height: '8px',
                        background: '#fff',
                        borderRadius: '50%',
                        opacity: 0.6,
                        animation: 'orbit 3s infinite linear',
                        left: '50%',
                        top: '50%',
                        boxShadow: '0 0 4px #fff',
                        '@keyframes orbit': {
                          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(14px)' },
                          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) translateX(14px)' },
                        }
                      }} />
                      <Box sx={{
                        position: 'absolute',
                        width: '5px',
                        height: '5px',
                        background: '#fff',
                        borderRadius: '50%',
                        opacity: 0.4,
                        animation: 'orbit 4s infinite linear',
                        animationDelay: '0.5s',
                        left: '50%',
                        top: '50%',
                        boxShadow: '0 0 4px #fff',
                        '@keyframes orbit': {
                          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) translateX(16px)' },
                          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) translateX(16px)' },
                        }
                      }} />
                    </>
                  )}
                </Box>
              </Fab>
            </Badge>
          </Box>
        </Tooltip>
      </Box>

      {/* Chat Dialog */}
      <ChatDialog 
        open={open} 
        onClose={handleClose} 
        hasSubscription={hasSubscription}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
};

export default ChatWidget;