'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  IconButton, 
  Box, 
  TextField, 
  Typography, 
  Paper, 
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  useTheme,
  Slide,
  Tabs,
  Tab,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  InputAdornment,
  Chip,
  Button,
  keyframes,
  Zoom,
  Grow,
  Fade
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ForumIcon from '@mui/icons-material/Forum';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockIcon from '@mui/icons-material/Lock';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import ChatMessage from './ChatMessage';
import { useAuth } from '@/contexts/AuthContext';

// Keyframes for animations
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChatDialog = ({ open, onClose, hasSubscription, isAuthenticated }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const chatContentRef = useRef(null);
  
  // Generate gradient colors based on theme
  const getGradient = () => {
    return theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 30, 70, 0.97))'
      : 'linear-gradient(135deg, rgba(245, 250, 255, 0.95), rgba(230, 248, 255, 0.97))';
  };
  
  // Get accent colors
  const getAccentColor = (opacity = 1) => {
    return theme.palette.mode === 'dark'
      ? `rgba(56, 189, 248, ${opacity})`
      : `rgba(6, 182, 212, ${opacity})`;
  };
  
  // Restore session ID from localStorage on load
  useEffect(() => {
    const savedSessionId = localStorage.getItem('currentChatSessionId');
    if (savedSessionId) {
      console.log('Restoring session ID from localStorage:', savedSessionId);
      setCurrentSessionId(parseInt(savedSessionId));
    }
  }, []);
  
  // Save session ID to localStorage when it changes
  useEffect(() => {
    if (currentSessionId) {
      console.log('Saving session ID to localStorage:', currentSessionId);
      localStorage.setItem('currentChatSessionId', currentSessionId.toString());
    }
  }, [currentSessionId]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Load messages when dialog opens or session changes
  useEffect(() => {
    if (open && activeTab === 0) {
      fetchMessages(currentSessionId);
    }
  }, [open, currentSessionId, activeTab]);
  
  // Load sessions when dialog opens and history tab is selected
  useEffect(() => {
    if (open && activeTab === 1) {
      fetchSessions();
    }
  }, [open, activeTab]);
  
  // Fetch messages for current session
  const fetchMessages = async (sessionId) => {
    try {
      setIsLoading(true);
      
      // Check authentication
      if (!user) {
        setMessages([{
          messageId: 'login-required',
          senderType: 'ai',
          content: "You need to sign in to use Wisentia AI. Please login or create an account to continue.",
          timestamp: new Date().toISOString()
        }]);
        setIsLoading(false);
        return;
      }
      
      if (!sessionId) {
        // If no session ID, show welcome message
        setMessages([
          {
            messageId: 'welcome',
            senderType: 'ai',
            content: "👋 Welcome to Wisentia AI! I'm here to help with your educational questions and guide you through your learning journey. Feel free to ask me about courses, quests, or any educational content.",
            timestamp: new Date().toISOString()
          }
        ]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching messages for session:', sessionId);
      
      let url = `/api/normal-user/chat/sessions/${sessionId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received messages data:', data);
      
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
        if (data.sessionId) {
          setCurrentSessionId(data.sessionId);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // If error occurs but we already have messages, preserve them
      if (messages.length === 0) {
        setMessages([
          {
            messageId: 'welcome',
            senderType: 'ai',
            content: "👋 Welcome to Wisentia AI! I'm here to help with your educational questions and guide you through your learning journey. Feel free to ask me about courses, quests, or any educational content.",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch chat sessions
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      
      // Check authentication
      if (!user) {
        setSessions([]);
        setLoadingSessions(false);
        return;
      }
      
      console.log('Fetching chat sessions');
      const response = await fetch('/api/normal-user/chat/sessions');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received sessions data:', data);
      
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };
  
  // Send message
  const sendMessage = async () => {
    if (!message.trim()) return;
    
    // Check authentication
    if (!user) {
      setMessages([
        ...messages,
        {
          messageId: 'user-not-auth',
          senderType: 'user',
          content: message,
          timestamp: new Date().toISOString()
        },
        {
          messageId: 'auth-required',
          senderType: 'ai',
          content: "You need to sign in to use Wisentia AI. Please login or create an account to continue.",
          timestamp: new Date().toISOString()
        }
      ]);
      setMessage('');
      return;
    }
    
    console.log('Using session ID:', currentSessionId);
    
    // Add user message to UI immediately
    const userMessage = {
      messageId: `temp-${Date.now()}`,
      senderType: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    // Store current messages plus the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage('');
    setIsTyping(true);
    
    try {
      // Get authentication token
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        // Handle missing token
        setTimeout(() => {
          setIsTyping(false);
          setMessages([
            ...updatedMessages, 
            {
              messageId: `error-auth-${Date.now()}`,
              senderType: 'ai',
              content: "Your session has expired. Please login again to continue using Wisentia AI.",
              timestamp: new Date().toISOString()
            }
          ]);
        }, 500);
        return;
      }
      
      // Format sessionId correctly (number instead of string)
      const sessionIdValue = currentSessionId ? parseInt(currentSessionId) : null;
      console.log('Sending message with sessionId:', sessionIdValue);
      
      const response = await fetch('/api/normal-user/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionIdValue
        }),
        credentials: 'include'
      });
      
      // Log response status
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Handle authentication errors
        if (response.status === 401) {
          setTimeout(() => {
            setIsTyping(false);
            setMessages([
              ...updatedMessages, 
              {
                messageId: `error-auth-${Date.now()}`,
                senderType: 'ai',
                content: "Your session has expired. Please login again to continue using Wisentia AI.",
                timestamp: new Date().toISOString()
              }
            ]);
          }, 500);
          return;
        }
        
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // Add AI response to messages
      if (data.message) {
        const aiMessage = {
          messageId: `ai-${Date.now()}`,
          senderType: 'ai',
          content: data.message,
          timestamp: new Date().toISOString()
        };
        
        // Short delay to simulate typing
        setTimeout(() => {
          setIsTyping(false);
          setMessages([...updatedMessages, aiMessage]);
        }, 500);
        
        // Update session ID if new
        if (data.sessionId && (!currentSessionId || currentSessionId !== data.sessionId)) {
          console.log('Setting new session ID from response:', data.sessionId);
          setCurrentSessionId(data.sessionId);
        }
      } else {
        // Handle empty message response
        setTimeout(() => {
          setIsTyping(false);
          setMessages([
            ...updatedMessages, 
            {
              messageId: `error-empty-${Date.now()}`,
              senderType: 'ai',
              content: "I received an empty response. This might be a temporary issue. Please try again.",
              timestamp: new Date().toISOString()
            }
          ]);
        }, 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message but preserve existing messages including user's message
      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          ...updatedMessages, 
          {
            messageId: `error-${Date.now()}`,
            senderType: 'ai',
            content: "I'm sorry, I encountered a problem processing your request. Please try again later.",
            timestamp: new Date().toISOString()
          }
        ]);
      }, 500);
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Select session
  const selectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setActiveTab(0);
  };
  
  // End current session
  // End current session - Düzeltilmiş fonksiyon
  const endCurrentSession = async () => {
    // Her durumda UI durumunu güncelle
    setShowEndChatConfirm(false);
    setMenuAnchorEl(null);
    
    // Geçici olarak eski session ID'yi saklayalım
    const oldSessionId = currentSessionId;
    
    // Hemen UI'ı güncelle - yeni oturum başlattığımızı göster
    setCurrentSessionId(null);
    localStorage.removeItem('currentChatSessionId');
    
    setMessages([
      {
        messageId: 'welcome-new',
        senderType: 'ai',
        content: "👋 Starting a new conversation. How can I help you today?",
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Eğer session ID yoksa daha fazla işlem yapma
    if (!oldSessionId) return;
    
    // Arka planda session'ı sonlandırmaya çalış
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.log('No authentication token found, skipping end session API call');
        return;
      }
      
      console.log(`Background: Trying to end session ${oldSessionId}...`);
      
      // API'ye istek gönder, ancak UI'ı engelleme
      fetch(`/api/normal-user/chat/sessions/${oldSessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      .then(response => {
        if (response.ok) {
          console.log(`Session ${oldSessionId} successfully ended on server`);
        } else {
          console.log(`Server couldn't end session ${oldSessionId} (status: ${response.status}), but new conversation started anyway`);
        }
        
        // Başarı durumunda geçmişi güncelle
        if (activeTab === 1) {
          fetchSessions();
        }
      })
      .catch(error => {
        console.log(`Error in background end session request: ${error.message}`);
      });
    } catch (error) {
      console.log('Error preparing end session request:', error);
    }
  };
  
  // Menu handlers
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle end chat button
  const handleEndChatClick = () => {
    setShowEndChatConfirm(true);
  };
  
  const handleCancelEndChat = () => {
    setShowEndChatConfirm(false);
  };
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    onClose();
    router.push('/login');
  };
  
  // Render login required view
  const renderLoginRequired = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center', 
      height: '100%',
      px: 3,
      py: 6
    }}>
      <LockIcon sx={{ 
        fontSize: 60, 
        mb: 2, 
        color: 'primary.main',
        animation: `${pulse} 2s infinite ease-in-out`,
      }} />
      <Typography variant="h6" component="div" gutterBottom>
        Sign in Required
      </Typography>
      <Typography variant="body2" component="div" color="textSecondary" paragraph sx={{ maxWidth: 300, mb: 3 }}>
        You need to sign in to use Wisentia AI and access the chat features.
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleLoginRedirect}
        sx={{
          borderRadius: '20px',
          px: 3,
          py: 1,
          fontWeight: 'bold',
          transform: 'scale(1)',
          transition: 'all 0.3s',
          background: `linear-gradient(90deg, ${getAccentColor()}, ${theme.palette.primary.main})`,
          boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover': {
            transform: 'translateY(-3px) scale(1.02)',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          }
        }}
      >
        Sign In or Register
      </Button>
    </Box>
  );
  
  // Render chat content
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : '#2563eb', 0.2)}`,
          backgroundImage: getGradient(),
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          height: { xs: '100%', sm: '80vh' },
          border: `1px solid ${alpha(getAccentColor(), theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${getAccentColor()}, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            zIndex: 1
          },
          // Animation pattern for background
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: theme.palette.mode === 'dark' 
              ? 'radial-gradient(circle at 30% 20%, rgba(56, 189, 248, 0.05) 0%, transparent 25%), radial-gradient(circle at 80% 50%, rgba(14, 165, 233, 0.05) 0%, transparent 25%), radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.05) 0%, transparent 25%)'
              : 'radial-gradient(circle at 30% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 25%), radial-gradient(circle at 80% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 25%), radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 25%)',
            opacity: 0.7,
            zIndex: -1
          }
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DialogTitle sx={{ 
          px: 2, 
          py: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.4)
            : alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                minHeight: '40px',
                '& .MuiTabs-indicator': {
                  backgroundColor: getAccentColor(),
                  height: '3px',
                  borderRadius: '3px',
                },
                '& .MuiTab-root': {
                  minHeight: '40px',
                  minWidth: 'auto',
                  px: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    color: getAccentColor(),
                  }
                }
              }}
            >
              <Tab 
                icon={<ForumIcon fontSize="small" />} 
                iconPosition="start"
                label="Chat" 
              />
              <Tab 
                icon={<HistoryIcon fontSize="small" />} 
                iconPosition="start"
                label="History" 
              />
            </Tabs>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {activeTab === 0 && currentSessionId && (
                <Tooltip title="End conversation">
                  <IconButton 
                    size="small" 
                    onClick={handleEndChatClick}
                    sx={{
                      mr: 1,
                      color: theme.palette.error.main,
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                      }
                    }}
                  >
                    <ExitToAppIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={onClose} 
                size="small"
                sx={{ 
                  ml: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'rotate(90deg)',
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { 
              minWidth: 180,
              backdropFilter: 'blur(10px)',
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }
          }}
        >
          <MenuItem onClick={endCurrentSession}>
            End conversation
          </MenuItem>
        </Menu>
        
        <DialogContent 
          ref={chatContentRef}
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            flex: 1,
            overflowY: 'auto',
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.2)
              : alpha(theme.palette.background.paper, 0.3),
            // Custom scrollbar
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(getAccentColor(), 0.3),
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: alpha(getAccentColor(), 0.5),
              },
            },
          }}
        >
          {!user ? (
            // Login required view
            <Fade in={true} timeout={800}>
              {renderLoginRequired()}
            </Fade>
          ) : activeTab === 0 ? (
            // Chat tab
            <Box sx={{ 
              flex: 1, 
              p: 2, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress 
                    size={50} 
                    sx={{ 
                      color: getAccentColor(),
                    }}
                  />
                </Box>
              ) : messages.length === 0 ? (
                <Fade in={true} timeout={800}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center', 
                    height: '100%',
                    px: 3,
                    opacity: 0.8
                  }}>
                    <Box
                      sx={{
                        position: 'relative',
                        mb: 2,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(getAccentColor(), 0.1),
                        boxShadow: `0 0 30px ${alpha(getAccentColor(), 0.2)}`,
                      }}
                    >
                      <AutoAwesomeIcon 
                        sx={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          fontSize: 24,
                          color: getAccentColor(),
                          animation: `${pulse} 2s infinite ease-in-out`,
                        }}
                      />
                      <SmartToyIcon sx={{ 
                        fontSize: 40, 
                        color: getAccentColor(),
                      }} />
                    </Box>
                    <Typography 
                      variant="h5" 
                      component="div" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        background: `linear-gradient(90deg, ${getAccentColor()}, ${theme.palette.primary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      How can I help you today?
                    </Typography>
                    <Typography variant="body2" component="div" color="textSecondary" paragraph sx={{ maxWidth: 300 }}>
                      Ask me about courses, quests, or any learning questions you have.
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                messages.map((msg, index) => (
                  <Fade 
                    key={msg.messageId || index} 
                    in={true} 
                    timeout={300} 
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <Box>
                      <ChatMessage message={msg} />
                    </Box>
                  </Fade>
                ))
              )}
              
              {isTyping && <ChatMessage isTyping />}
              
              <div ref={messagesEndRef} />
            </Box>
          ) : (
            // History tab
            <Box sx={{ p: 2 }}>
              {loadingSessions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress 
                    size={50}
                    sx={{ 
                      color: getAccentColor(),
                    }}
                  />
                </Box>
              ) : sessions.length === 0 ? (
                <Fade in={true} timeout={800}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center', 
                    height: 300,
                    px: 3,
                    opacity: 0.8
                  }}>
                    <Box
                      sx={{
                        position: 'relative',
                        mb: 2,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(getAccentColor(), 0.1),
                        boxShadow: `0 0 30px ${alpha(getAccentColor(), 0.2)}`,
                      }}
                    >
                      <HistoryIcon sx={{ 
                        fontSize: 40, 
                        color: getAccentColor(),
                      }} />
                    </Box>
                    <Typography 
                      variant="h5" 
                      component="div" 
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        background: `linear-gradient(90deg, ${getAccentColor()}, ${theme.palette.primary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      No chat history yet
                    </Typography>
                    <Typography variant="body2" component="div" color="textSecondary" paragraph sx={{ maxWidth: 300 }}>
                      Your conversations will appear here once you start chatting.
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <List sx={{ width: '100%', p: 0 }}>
                  {sessions.map((session, index) => {
                    // Ensure SessionID exists and is valid
                    if (!session.SessionID) return null;
                    
                    // Format timestamps with fallback
                    const startTime = session.StartTime ? new Date(session.StartTime) : new Date();
                    
                    return (
                      <Grow
                        key={session.SessionID}
                        in={true}
                        timeout={300 + (index * 100)}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? alpha(theme.palette.background.paper, 0.4)
                              : alpha(theme.palette.background.paper, 0.7),
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? alpha(theme.palette.primary.dark, 0.2)
                                : alpha(theme.palette.primary.light, 0.2),
                              transform: 'translateY(-3px)',
                              boxShadow: `0 6px 15px ${alpha(getAccentColor(), 0.15)}`
                            }
                          }}
                          onClick={() => selectSession(session.SessionID)}
                        >
                          <ListItem alignItems="flex-start" sx={{ p: 2 }}>
                            <ListItemAvatar sx={{ minWidth: 40 }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  bgcolor: alpha(getAccentColor(), 0.1),
                                  color: getAccentColor(),
                                }}
                              >
                                <ForumIcon fontSize="small" />
                              </Avatar>
                            </ListItemAvatar>
                            
                            {/* Custom content structure */}
                            <Box sx={{ flex: 1, ml: 1 }}>
                              {/* Header section */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography 
                                  component="div" 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  Conversation {format(startTime, 'MMM d, yyyy')}
                                </Typography>
                                {session.IsActive && (
                                  <Chip 
                                    label="Active" 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                    sx={{ 
                                      height: 20, 
                                      fontSize: '0.7rem',
                                      bgcolor: alpha(getAccentColor(), 0.1),
                                      borderColor: alpha(getAccentColor(), 0.3),
                                      color: getAccentColor(),
                                    }}
                                  />
                                )}
                              </Box>
                              
                              {/* Message content */}
                              <Typography
                                variant="body2"
                                component="div"
                                color="text.secondary"
                                sx={{ 
                                  display: 'block',
                                  mb: 0.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  display: '-webkit-box'
                                }}
                              >
                                {session.LastMessage || 'No messages yet'}
                              </Typography>
                              
                              {/* Footer info */}
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mt: 1
                              }}>
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  <ForumIcon sx={{ fontSize: 14 }} />
                                  {session.MessageCount || 0} messages
                                </Typography>
                                <Typography
                                  variant="caption"
                                  component="div"
                                  color="text.secondary"
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  {format(startTime, 'h:mm a')}
                                </Typography>
                              </Box>
                            </Box>
                          </ListItem>
                        </Paper>
                      </Grow>
                    );
                  })}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        
        {/* End chat confirmation */}
        <Fade in={showEndChatConfirm}>
          <Box
            sx={{
              display: showEndChatConfirm ? 'flex' : 'none',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              p: 3,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 20px ${alpha('#000', 0.2)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              zIndex: 10,
              maxWidth: '80%',
            }}
          >
            <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'center' }}>
              End current conversation?
            </Typography>
            <Typography variant="body2" component="div" color="textSecondary" paragraph sx={{ textAlign: 'center', mb: 3 }}>
              This will end your current chat session and start a new one.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleCancelEndChat}
                sx={{
                  borderRadius: '20px',
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={endCurrentSession}
                sx={{
                  borderRadius: '20px',
                  px: 3,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                End Chat
              </Button>
            </Box>
          </Box>
        </Fade>
        
        {activeTab === 0 && user && (
          <Box sx={{ 
            p: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isTyping}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        edge="end" 
                        onClick={sendMessage}
                        disabled={!message.trim() || isTyping}
                        sx={{ 
                          color: message.trim() && !isTyping
                            ? getAccentColor()
                            : 'inherit',
                          transition: 'all 0.3s ease',
                          transform: 'scale(1)',
                          '&:hover': {
                            transform: message.trim() && !isTyping ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                            bgcolor: message.trim() && !isTyping 
                              ? alpha(getAccentColor(), 0.1)
                              : 'transparent',
                          }
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.background.paper, 0.2)
                      : alpha(theme.palette.background.paper, 0.4),
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha(getAccentColor(), 0.2)}`
                    },
                    '&:hover': {
                      boxShadow: `0 0 0 1px ${alpha(getAccentColor(), 0.1)}`
                    },
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.2),
                      transition: 'border-color 0.3s ease',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(getAccentColor(), 0.4),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: getAccentColor(),
                    },
                  }
                }}
              />
            </Box>
            <Typography 
              variant="caption" 
              component="div"
              color="textSecondary"
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1,
                opacity: 0.7,
                fontStyle: 'italic',
                fontSize: '0.7rem',
              }}
            >
              Powered by Wisentia AI • Responses are AI-generated
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default ChatDialog;