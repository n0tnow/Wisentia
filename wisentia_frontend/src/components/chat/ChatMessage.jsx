'use client';

import { Box, Typography, Avatar, Paper, Skeleton, useTheme, alpha, Fade, Zoom } from '@mui/material';
import { format } from 'date-fns';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReactMarkdown from 'react-markdown';
import { keyframes } from '@emotion/react';

// Animation keyframes
const blink = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const typing = keyframes`
  0% { width: 0; }
  20% { width: 4px; }
  40% { width: 8px; }
  60% { width: 12px; }
  80% { width: 16px; }
  100% { width: 20px; }
`;

const wave = keyframes`
  0% { transform: rotate(0deg); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(0deg); }
  60% { transform: rotate(15deg); }
  80% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

// Custom renderer components for Markdown
const MarkdownComponents = {
  // Block elements
  p: ({children}) => <div style={{margin: '0.5rem 0'}}>{children}</div>,
  h1: ({children}) => <div style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem'}}>{children}</div>,
  h2: ({children}) => <div style={{fontSize: '1.25rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem'}}>{children}</div>,
  h3: ({children}) => <div style={{fontSize: '1.1rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem'}}>{children}</div>,
  h4: ({children}) => <div style={{fontSize: '1rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem'}}>{children}</div>,
  h5: ({children}) => <div style={{fontSize: '1rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem'}}>{children}</div>,
  h6: ({children}) => <div style={{fontSize: '1rem', fontWeight: 'bold', margin: '0.75rem 0 0.5rem'}}>{children}</div>,
  ul: ({children}) => <div style={{paddingLeft: '1.5rem', margin: '0.5rem 0'}}>{children}</div>,
  ol: ({children}) => <div style={{paddingLeft: '1.5rem', margin: '0.5rem 0'}}>{children}</div>,
  li: ({children}) => <div style={{marginBottom: '0.25rem'}}>{children}</div>,
  blockquote: ({children}) => <div style={{borderLeft: '4px solid #ccc', paddingLeft: '1rem', margin: '0.5rem 0'}}>{children}</div>,
  // Inline elements
  code: ({children}) => <span style={{backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace'}}>{children}</span>
};

const ChatMessage = ({ 
  message, 
  isLoading = false, 
  isTyping = false 
}) => {
  const theme = useTheme();
  const isFromAI = message?.senderType === 'ai';
  
  // Get accent color based on theme
  const getAccentColor = (opacity = 1) => {
    return theme.palette.mode === 'dark'
      ? `rgba(56, 189, 248, ${opacity})`
      : `rgba(6, 182, 212, ${opacity})`;
  };
  
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
  
  // Check if message starts with emoji to apply special animation
  const startsWithEmoji = message?.content?.match(/^(\p{Emoji})/u);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isFromAI ? 'row' : 'row-reverse',
        mb: 2.5,
        maxWidth: '100%',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isFromAI 
            ? getAccentColor(1)
            : theme.palette.mode === 'dark' ? 'secondary.dark' : 'secondary.light',
          width: 40,
          height: 40,
          mr: isFromAI ? 1.5 : 0,
          ml: isFromAI ? 0 : 1.5,
          boxShadow: isFromAI
            ? `0 0 10px ${getAccentColor(0.3)}`
            : theme.palette.mode === 'dark'
              ? '0 0 10px rgba(255, 255, 255, 0.2)'
              : '0 0 10px rgba(0, 0, 0, 0.1)',
          border: isFromAI 
            ? `2px solid ${getAccentColor(0.8)}` 
            : `2px solid ${alpha(theme.palette.secondary.main, 0.8)}`,
          transition: 'all 0.3s ease',
          animation: isFromAI && startsWithEmoji 
            ? `${float} 3s ease-in-out infinite`
            : 'none',
          position: 'relative',
        }}
      >
        {isFromAI ? (
          <>
            <SmartToyIcon fontSize="small" />
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: 'success.main',
                border: `2px solid ${theme.palette.background.paper}`,
                animation: `${blink} 2s infinite ease-in-out`,
                display: isFromAI ? 'block' : 'none',
              }}
            />
          </>
        ) : (
          <PersonIcon fontSize="small" />
        )}
      </Avatar>
      
      <Box sx={{ maxWidth: '75%' }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: isFromAI ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
              bgcolor: isFromAI 
                ? theme.palette.mode === 'dark'
                  ? alpha(getAccentColor(1), 0.15)
                  : alpha(getAccentColor(1), 0.08)
                : theme.palette.mode === 'dark'
                  ? alpha(theme.palette.secondary.dark, 0.15)
                  : alpha(theme.palette.secondary.light, 0.08),
              position: 'relative',
              borderLeft: isFromAI 
                ? `3px solid ${alpha(getAccentColor(1), 0.5)}` 
                : 'none',
              borderRight: !isFromAI 
                ? `3px solid ${alpha(theme.palette.secondary.main, 0.5)}` 
                : 'none',
              backdropFilter: 'blur(10px)',
              boxShadow: isFromAI
                ? `0 4px 15px ${alpha(getAccentColor(1), 0.1)}`
                : `0 4px 15px ${alpha(theme.palette.secondary.main, 0.1)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)' 
                  : 'linear-gradient(145deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)',
                borderRadius: isFromAI ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
                opacity: 0.7,
                zIndex: -1,
              },
              // Special animation for messages starting with emoji
              animation: isFromAI && startsWithEmoji 
                ? `${float} 3s ease-in-out infinite` 
                : 'none',
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: isFromAI
                  ? `0 6px 20px ${alpha(getAccentColor(1), 0.15)}`
                  : `0 6px 20px ${alpha(theme.palette.secondary.main, 0.15)}`,
                transform: 'translateY(-2px)',
              }
            }}
          >
            {/* Display special hand animation for messages starting with 👋 */}
            {isFromAI && message?.content?.startsWith('👋') && (
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  animation: `${wave} 2.5s infinite`,
                  transformOrigin: '70% 70%',
                  marginRight: '0.2em',
                }}
              >
                👋
              </Box>
            )}
            
            {isFromAI ? (
              <Box sx={{ fontSize: '0.95rem' }}>
                <div className="markdown-content">
                  <ReactMarkdown components={MarkdownComponents}>
                    {/* Remove the emoji if we're animating it separately */}
                    {message?.content?.startsWith('👋') 
                      ? message.content.substring(2) 
                      : message?.content || ''}
                  </ReactMarkdown>
                </div>
              </Box>
            ) : (
              <div style={{whiteSpace: 'pre-wrap', fontSize: '0.95rem'}}>
                {message?.content || ''}
              </div>
            )}
          </Paper>
        </Zoom>
        
        {formattedTime && (
          <Typography 
            variant="caption" 
            color="textSecondary"
            component="div"
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
  
  const getAccentColor = (opacity = 1) => {
    return theme.palette.mode === 'dark'
      ? `rgba(56, 189, 248, ${opacity})`
      : `rgba(6, 182, 212, ${opacity})`;
  };
  
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: getAccentColor(1),
          width: 40,
          height: 40,
          mr: 1.5,
          boxShadow: `0 0 10px ${getAccentColor(0.3)}`,
          border: `2px solid ${alpha(getAccentColor(1), 0.8)}`,
        }}
      >
        <SmartToyIcon fontSize="small" />
      </Avatar>
      <Box sx={{ maxWidth: '80%' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '0px 16px 16px 16px',
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(getAccentColor(1), 0.15)
              : alpha(getAccentColor(1), 0.08),
            borderLeft: `3px solid ${alpha(getAccentColor(1), 0.5)}`,
            width: 300,
            boxShadow: `0 4px 15px ${alpha(getAccentColor(1), 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Skeleton animation="wave" height={18} width="90%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={18} width="100%" sx={{ mb: 1 }} />
            <Skeleton animation="wave" height={18} width="75%" />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// Typing indicator component
const TypingIndicator = () => {
  const theme = useTheme();
  
  const getAccentColor = (opacity = 1) => {
    return theme.palette.mode === 'dark'
      ? `rgba(56, 189, 248, ${opacity})`
      : `rgba(6, 182, 212, ${opacity})`;
  };
  
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: getAccentColor(1),
          width: 40,
          height: 40,
          mr: 1.5,
          boxShadow: `0 0 10px ${getAccentColor(0.3)}`,
          border: `2px solid ${alpha(getAccentColor(1), 0.8)}`,
          animation: `${float} 3s infinite ease-in-out`,
        }}
      >
        <SmartToyIcon fontSize="small" />
        <AutoAwesomeIcon 
          sx={{
            position: 'absolute',
            top: -5,
            right: -5,
            fontSize: 16,
            color: 'white',
            background: getAccentColor(1),
            borderRadius: '50%',
            padding: '2px',
            animation: `${blink} 1.5s infinite`,
            boxShadow: `0 0 10px ${getAccentColor(0.5)}`,
          }}
        />
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: '0px 16px 16px 16px',
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(getAccentColor(1), 0.15)
            : alpha(getAccentColor(1), 0.08),
          borderLeft: `3px solid ${alpha(getAccentColor(1), 0.5)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 15px ${alpha(getAccentColor(1), 0.1)}`,
          animation: `${float} 3s infinite ease-in-out`,
          animationDelay: '0.2s',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            px: 2,
            py: 0.5,
          }}
        >
          <Typography 
            variant="body2" 
            color="textSecondary"
            sx={{ mr: 1, fontStyle: 'italic' }}
          >
            Thinking
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              '& > div': {
                width: 8,
                height: 8,
                margin: '0 2px',
                borderRadius: '50%',
                backgroundColor: getAccentColor(0.7),
                animation: `${blink} 1.5s infinite ease-in-out`,
              },
              '& > div:nth-of-type(1)': {
                animationDelay: '0s',
              },
              '& > div:nth-of-type(2)': {
                animationDelay: '0.3s',
              },
              '& > div:nth-of-type(3)': {
                animationDelay: '0.6s',
              },
            }}
          >
            <div></div>
            <div></div>
            <div></div>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatMessage;