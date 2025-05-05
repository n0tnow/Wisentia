'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
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
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ForumIcon from '@mui/icons-material/Forum';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import ChatMessage from './ChatMessage';
import { useAuth } from '@/contexts/AuthContext';

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
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const chatContentRef = useRef(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Load messages when dialog opens or session changes
  useEffect(() => {
    if (open && hasSubscription && isAuthenticated && activeTab === 0) {
      fetchMessages(currentSessionId);
    }
  }, [open, currentSessionId, hasSubscription, isAuthenticated, activeTab]);
  
  // Load sessions when dialog opens and history tab is selected
  useEffect(() => {
    if (open && hasSubscription && isAuthenticated && activeTab === 1) {
      fetchSessions();
    }
  }, [open, hasSubscription, isAuthenticated, activeTab]);
  
  // Fetch messages for current session
  const fetchMessages = async (sessionId) => {
    if (!isAuthenticated || !hasSubscription) return;
    
    try {
      setIsLoading(true);
      
      const endpoint = sessionId 
        ? `/api/chat/sessions/${sessionId}/` 
        : '/api/chat/sessions/';
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
        if (data.sessionId) {
          setCurrentSessionId(data.sessionId);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // If error occurs, show welcome message
      setMessages([
        {
          messageId: 'welcome',
          senderType: 'ai',
          content: "👋 Welcome to Wisentia AI! I'm here to help with your learning journey. Feel free to ask me any questions about courses, quests, or educational content.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch chat sessions
  const fetchSessions = async () => {
    if (!isAuthenticated || !hasSubscription) return;
    
    try {
      setLoadingSessions(true);
      
      const response = await fetch('/api/chat/sessions/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };
  
  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !isAuthenticated || !hasSubscription) return;
    
    // Add user message to UI immediately
    const userMessage = {
      messageId: `temp-${Date.now()}`,
      senderType: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat/message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: currentSessionId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
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
          setMessages(prev => [...prev, aiMessage]);
        }, 500);
        
        // Update session ID if new
        if (data.sessionId && !currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev, 
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
  const endCurrentSession = async () => {
    if (!currentSessionId) return;
    
    try {
      const response = await fetch(`/api/chat/sessions/${currentSessionId}/end/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to end session');
      }
      
      // Start a new session
      setCurrentSessionId(null);
      setMessages([
        {
          messageId: 'welcome-new',
          senderType: 'ai',
          content: "👋 Starting a new conversation. How can I help you today?",
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Refresh sessions list if in history tab
      if (activeTab === 1) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
    
    setMenuAnchorEl(null);
  };
  
  // Menu handlers
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Subscription upgrade handler
  const handleUpgradeClick = () => {
    onClose();
    router.push('/nfts?filter=subscription');
  };
  
  // Render subscription prompt for non-subscribers
  const renderSubscriptionPrompt = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
        }}
      >
        <SmartToyIcon sx={{ fontSize: 40, color: 'white' }} />
      </Box>
      
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Meet Wisentia AI Assistant
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 3 }}>
        Get personalized learning support, course recommendations, and instant answers to your questions with our AI assistant.
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SchoolIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              Course Recommendations
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Get personalized course suggestions based on your interests and progress.
          </Typography>
        </Paper>
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EventNoteIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              Quest Guidance
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Get help with completing quests and earning NFT rewards.
          </Typography>
        </Paper>
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <HelpOutlineIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">
              24/7 Learning Support
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            Ask questions and get instant explanations anytime.
          </Typography>
        </Paper>
      </Box>
      
      <Button
        variant="contained"
        size="large"
        onClick={handleUpgradeClick}
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`
          }
        }}
      >
        Upgrade to Premium
      </Button>
      
      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 3 }}>
        Premium features require an active subscription
      </Typography>
    </Box>
  );
  
  // Render login prompt for non-authenticated users
  const renderLoginPrompt = () => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
        }}
      >
        <SmartToyIcon sx={{ fontSize: 40, color: 'white' }} />
      </Box>
      
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Wisentia AI Assistant
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4 }}>
        Please log in to access the AI chat assistant and get personalized learning support.
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        onClick={() => {
          onClose();
          router.push('/login');
        }}
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`
          },
          mr: 2
        }}
      >
        Log In
      </Button>
      
      <Button
        variant="outlined"
        size="large"
        onClick={() => {
          onClose();
          router.push('/register');
        }}
        sx={{
          py: 1.5,
          px: 4,
          borderRadius: 2
        }}
      >
        Sign Up
      </Button>
    </Box>
  );
  
  // Render chat content
  const renderChatContent = () => (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DialogTitle sx={{ 
          px: 2, 
          py: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                minHeight: '40px',
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                },
                '& .MuiTab-root': {
                  minHeight: '40px',
                  minWidth: 'auto',
                  px: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
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
                <Tooltip title="Chat options">
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={onClose} 
                size="small"
                sx={{ ml: 1 }}
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
            sx: { minWidth: 180 }
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
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.background.paper, 0.6)
          }}
        >
          {activeTab === 0 ? (
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
                  <CircularProgress size={40} />
                </Box>
              ) : messages.length === 0 ? (
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
                  <SmartToyIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>
                    How can I help you today?
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph sx={{ maxWidth: 300 }}>
                    Ask me about courses, quests, or any learning questions you have.
                  </Typography>
                </Box>
              ) : (
                messages.map((msg, index) => (
                  <ChatMessage key={msg.messageId || index} message={msg} />
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
                  <CircularProgress size={40} />
                </Box>
              ) : sessions.length === 0 ? (
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
                  <HistoryIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>
                    No chat history yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph sx={{ maxWidth: 300 }}>
                    Your conversations will appear here once you start chatting.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%', p: 0 }}>
                  {sessions.map((session) => (
                    <Paper
                      key={session.SessionID}
                      elevation={0}
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.primary.dark, 0.1)
                            : alpha(theme.palette.primary.light, 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      }}
                      onClick={() => selectSession(session.SessionID)}
                    >
                      <ListItem alignItems="flex-start" sx={{ p: 2 }}>
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar 
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main
                            }}
                          >
                            <ForumIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2">
                                Conversation {format(new Date(session.StartTime), 'MMM d, yyyy')}
                              </Typography>
                              {session.IsActive && (
                                <Chip 
                                  label="Active" 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ 
                                  display: 'inline',
                                  mt: 0.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {session.LastMessage || 'No messages yet'}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mt: 0.5 
                              }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {session.MessageCount || 0} messages
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {format(new Date(session.StartTime), 'h:mm a')}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        
        {activeTab === 0 && (
          <Box sx={{ 
            p: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.8),
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
                            ? theme.palette.primary.main
                            : 'inherit',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: message.trim() && !isTyping ? 'scale(1.1)' : 'none',
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
                      ? alpha(theme.palette.background.paper, 0.6)
                      : alpha(theme.palette.background.paper, 0.6),
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                    },
                  }
                }}
              />
            </Box>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 1,
                opacity: 0.6
              }}
            >
              Powered by Wisentia AI • Responses are AI-generated
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
  
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          backgroundImage: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(20, 30, 60, 0.95))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 252, 255, 0.97))',
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          height: { xs: '100%', sm: '80vh' },
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(6, 182, 212, 0.2)' 
            : 'rgba(6, 182, 212, 0.1)'}`,
          // Subtle gradient border
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #06b6d4, #0ea5e9, #14b8a6)',
            zIndex: 1
          }
        },
      }}
    >
      {/* Show different content based on authentication and subscription status */}
      {!isAuthenticated ? (
        renderLoginPrompt()
      ) : !hasSubscription ? (
        renderSubscriptionPrompt()
      ) : (
        renderChatContent()
      )}
    </Dialog>
  );
};

export default ChatDialog;