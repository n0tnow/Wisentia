'use client';

import { Box, Typography, Avatar, Paper, Skeleton, useTheme, alpha } from '@mui/material';
import { format } from 'date-fns';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const ChatMessage = ({ 
  message, 
  isLoading = false, 
  isTyping = false 
}) => {
  const theme = useTheme();
  const isFromAI = message?.senderType === 'ai';
  
  // Handle different message types
  if (isLoading) {
    return <LoadingMessage />;
  }
  
  if (isTyping) {
    return <TypingIndicator />;
  }
  
  // Format timestamp if available
  const formattedTime = message?.timestamp 
    ? format(new Date(message.timestamp), 'HH:mm')
    : '';
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isFromAI ? 'row' : 'row-reverse',
        mb: 2,
        maxWidth: '100%',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isFromAI 
            ? 'primary.main' 
            : theme.palette.mode === 'dark' ? 'secondary.dark' : 'secondary.light',
          width: 38,
          height: 38,
          mr: isFromAI ? 1 : 0,
          ml: isFromAI ? 0 : 1,
          boxShadow: 1,
          border: isFromAI 
            ? `2px solid ${alpha(theme.palette.primary.main, 0.8)}` 
            : `2px solid ${alpha(theme.palette.secondary.main, 0.8)}`,
        }}
      >
        {isFromAI ? <SmartToyIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
      </Avatar>
      
      <Box sx={{ maxWidth: '80%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            borderRadius: isFromAI ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
            bgcolor: isFromAI 
              ? theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.dark, 0.2)
                : alpha(theme.palette.primary.light, 0.1)
              : theme.palette.mode === 'dark'
                ? alpha(theme.palette.secondary.dark, 0.2)
                : alpha(theme.palette.secondary.light, 0.1),
            position: 'relative',
            borderLeft: isFromAI 
              ? `3px solid ${alpha(theme.palette.primary.main, 0.5)}` 
              : 'none',
            borderRight: !isFromAI 
              ? `3px solid ${alpha(theme.palette.secondary.main, 0.5)}` 
              : 'none',
            backdropFilter: 'blur(10px)',
            boxShadow: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)' 
                : 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
              borderRadius: isFromAI ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
              opacity: 0.7,
              zIndex: -1,
            }
          }}
        >
          {isFromAI ? (
            <Box sx={{ fontSize: '0.9rem' }}>
              <Typography 
                variant="body2"
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  '& code': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(0,0,0,0.25)' 
                      : 'rgba(0,0,0,0.05)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  }
                }}
              >
                {message?.content || ''}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2">
              {message?.content || ''}
            </Typography>
          )}
        </Paper>
        
        {formattedTime && (
          <Typography 
            variant="caption" 
            color="textSecondary"
            sx={{ 
              display: 'block', 
              textAlign: isFromAI ? 'left' : 'right',
              mt: 0.5,
              opacity: 0.7,
              fontSize: '0.7rem',
            }}
          >
            {formattedTime}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Loading message component
const LoadingMessage = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: 'primary.main',
          width: 38,
          height: 38,
          mr: 1,
          boxShadow: 1,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.8)}`,
        }}
      >
        <SmartToyIcon fontSize="small" />
      </Avatar>
      <Box sx={{ maxWidth: '80%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            borderRadius: '0px 12px 12px 12px',
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.primary.dark, 0.2)
              : alpha(theme.palette.primary.light, 0.1),
            borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
            width: 240
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Skeleton animation="wave" height={15} width="80%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={15} width="90%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={15} width="60%" />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// Typing indicator component
const TypingIndicator = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: 'primary.main',
          width: 38,
          height: 38,
          mr: 1,
          boxShadow: 1,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.8)}`,
        }}
      >
        <SmartToyIcon fontSize="small" />
      </Avatar>
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          borderRadius: '0px 12px 12px 12px',
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.dark, 0.2)
            : alpha(theme.palette.primary.light, 0.1),
          borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '& > div': {
              width: 6,
              height: 6,
              margin: '0 2px',
              borderRadius: '50%',
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.main,
              animation: 'typingAnimation 1.5s infinite ease-in-out',
              '&:nth-of-type(1)': {
                animationDelay: '0s',
              },
              '&:nth-of-type(2)': {
                animationDelay: '0.5s',
              },
              '&:nth-of-type(3)': {
                animationDelay: '1s',
              },
            },
            '@keyframes typingAnimation': {
              '0%, 100%': {
                transform: 'translateY(0)',
              },
              '50%': {
                transform: 'translateY(-5px)',
              },
            },
          }}
        >
          <div></div>
          <div></div>
          <div></div>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatMessage;