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
  CircularProgress 
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import LockIcon from '@mui/icons-material/Lock';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatDialog from './ChatDialog';
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
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated()) {
        setCheckingSubscription(false);
        return;
      }

      try {
        setCheckingSubscription(true);
        
        // Make request to subscription API
        const response = await fetch('/api/normal-user/subscriptions/check-access/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        const data = await response.json();
        setHasSubscription(data.hasAccess);
        
        // Fetch unread message count if subscribed
        if (data.hasAccess) {
          // Example API call for unread message count
          // const msgResponse = await fetch('/api/chat/unread-count', options);
          // const msgData = await msgResponse.json();
          // setUnreadCount(msgData.count);
          
          // For now, just set demo value
          setUnreadCount(3);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated]);

  const handleOpen = () => {
    if (hasSubscription || !isAuthenticated()) {
      setOpen(true);
      setUnreadCount(0); // Clear unread count when opening
    } else {
      // If no subscription, we'll still open the dialog but it will show subscription prompt
      setOpen(true);
    }
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
          title={
            checkingSubscription 
              ? "Checking access..." 
              : hasSubscription 
                ? "Chat with Wisentia AI" 
                : "Premium feature - Subscribe to chat with Wisentia AI"
          }
          placement="left"
        >
          <Box sx={{ position: 'relative' }}>
            {/* Ripple effect for premium feature */}
            {hasSubscription && (
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
                {/* Second ripple effect with delay */}
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
                color={hasSubscription ? "primary" : "default"}
                aria-label="chat"
                onClick={handleOpen}
                sx={{
                  background: hasSubscription 
                    ? `linear-gradient(135deg, #06b6d4, #0ea5e9, #14b8a6)`
                    : 'rgba(255, 255, 255, 0.15)',
                  animation: hasSubscription ? `${pulse} 2s infinite` : 'none',
                  border: hasSubscription 
                    ? 'none' 
                    : `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                  backdropFilter: 'blur(4px)',
                  boxShadow: hasSubscription 
                    ? theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 10px rgba(6, 182, 212, 0.2) inset'
                      : '0 4px 20px rgba(6, 182, 212, 0.4), 0 0 10px rgba(255, 255, 255, 0.2) inset'
                    : theme.shadows[2],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px) rotate(5deg)',
                    boxShadow: hasSubscription 
                      ? theme.palette.mode === 'dark'
                        ? '0 6px 25px rgba(6, 182, 212, 0.6), 0 0 15px rgba(6, 182, 212, 0.3) inset'
                        : '0 6px 25px rgba(6, 182, 212, 0.6), 0 0 15px rgba(255, 255, 255, 0.3) inset'
                      : theme.shadows[4],
                  }
                }}
              >
                {checkingSubscription ? (
                  <CircularProgress size={24} color="inherit" />
                ) : hasSubscription ? (
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    {/* Animated particles around the icon */}
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
                  </Box>
                ) : (
                  <Box sx={{ position: 'relative' }}>
                    <SmartToyIcon sx={{ fontSize: 22 }} />
                    <LockIcon 
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: -12, 
                        fontSize: 14,
                        backgroundColor: 'background.paper',
                        borderRadius: '50%',
                        p: 0.5,
                        boxShadow: 1
                      }} 
                    />
                  </Box>
                )}
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
        isAuthenticated={isAuthenticated()}
      />
    </>
  );
};

export default ChatWidget;