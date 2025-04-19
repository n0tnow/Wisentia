// src/components/layout/AdminSidebar.jsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

// MUI imports
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Collapse,
  useTheme,
  useMediaQuery,
  Button,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  Switch,
  Paper,
  alpha,
  Fade,
  Zoom
} from '@mui/material';

// MUI icons
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Subscriptions as SubscriptionIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  MonitorHeart as SystemHealthIcon,
  SmartToy as AIIcon,
  Logout as LogoutIcon,
  ContentPaste as ContentIcon,
  Token as TokenIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  BarChart as AnalyticsIcon,
  ViewCarousel as NFTIcon,
  Forum as ForumIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

// Auth context
import { useAuth } from '@/contexts/AuthContext';

// Drawer width
const drawerWidth = 280;
const closedDrawerWidth = 68;

export default function AdminSidebar({ children }) {
  const [open, setOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsOpen = Boolean(notificationAnchorEl);

  // Set drawer open state based on screen size
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Check saved theme preference
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Check if current route is active
  const isActive = (path) => {
    if (path === '/admin' && pathname === '/admin/dashboard') return true;
    
    // Check if the path is a parent path of the current pathname
    if (path !== '/admin/dashboard' && pathname?.startsWith(path)) return true;
    
    return false;
  };

  // Handle sidebar toggle
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Handle mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle content submenu toggle
  const handleContentClick = () => {
    setContentOpen(!contentOpen);
  };

  // Handle AI submenu toggle
  const handleAIClick = () => {
    setAIOpen(!aiOpen);
  };

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    localStorage.setItem('themePreference', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Profile menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Notifications menu
  const handleNotificationsOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Notifications data
  const notifications = [
    { 
      id: 1, 
      title: 'New User Registration', 
      content: '5 new users joined the platform', 
      time: '5 minutes ago',
      unread: true
    },
    { 
      id: 2, 
      title: 'System Alert', 
      content: 'AI service has been restarted', 
      time: '1 hour ago',
      unread: true
    },
    { 
      id: 3, 
      title: 'Course Completion Rates', 
      content: 'Blockchain courses saw 32% increase in completion rate', 
      time: '3 hours ago',
      unread: false
    },
    { 
      id: 4, 
      title: 'NFT Minting Process', 
      content: '12 new NFTs were successfully created', 
      time: '1 day ago',
      unread: false
    }
  ];

  // Color mapping for different sections
  const sectionColors = {
    dashboard: {
      main: theme.palette.mode === 'dark' ? '#3f51b5' : '#3f51b5',
      gradient: theme.palette.mode === 'dark' 
        ? 'linear-gradient(45deg, #3f51b5 0%, #5c6bc0 100%)' 
        : 'linear-gradient(45deg, #3f51b5 0%, #5c6bc0 100%)'
    },
    users: {
      main: theme.palette.mode === 'dark' ? '#2196f3' : '#2196f3',
      gradient: theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, #2196f3 0%, #64b5f6 100%)'
        : 'linear-gradient(45deg, #2196f3 0%, #64b5f6 100%)'
    },
    content: {
      main: theme.palette.mode === 'dark' ? '#009688' : '#009688',
      gradient: theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, #009688 0%, #4db6ac 100%)'
        : 'linear-gradient(45deg, #009688 0%, #4db6ac 100%)'
    },
    ai: {
      main: theme.palette.mode === 'dark' ? '#9c27b0' : '#9c27b0',
      gradient: theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, #9c27b0 0%, #ba68c8 100%)'
        : 'linear-gradient(45deg, #9c27b0 0%, #ba68c8 100%)'
    },
    subscriptions: {
      main: theme.palette.mode === 'dark' ? '#f44336' : '#f44336',
      gradient: theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, #f44336 0%, #ef5350 100%)'
        : 'linear-gradient(45deg, #f44336 0%, #ef5350 100%)'
    },
    analytics: {
      main: theme.palette.mode === 'dark' ? '#ff9800' : '#ff9800',
      gradient: theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, #ff9800 0%, #ffb74d 100%)'
        : 'linear-gradient(45deg, #ff9800 0%, #ffb74d 100%)'
    },
    system: {
      main: theme.palette.mode === 'dark' ? '#607d8b' : '#607d8b',
      gradient: theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, #607d8b 0%, #90a4ae 100%)'
        : 'linear-gradient(45deg, #607d8b 0%, #90a4ae 100%)'
    }
  };

  // Render Profile Menu
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { 
          minWidth: 200,
          borderRadius: 2,
          mt: 1,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(45deg, #3f51b5 0%, #5c6bc0 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36,
            bgcolor: 'white',
            color: '#3f51b5',
            fontSize: '1rem',
            mr: 1.5
          }}
        >
          {user?.username?.charAt(0).toUpperCase() || 'A'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            {user?.username || 'Admin'}
          </Typography>
          <Typography variant="caption">
            Administrator
          </Typography>
        </Box>
      </Box>
      <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <AccountCircleIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </MenuItem>
      <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </MenuItem>
      <MenuItem onClick={toggleTheme} sx={{ py: 1.5 }}>
        <ListItemIcon>
          {darkMode ? <LightModeIcon fontSize="small" color="warning" /> : <DarkModeIcon fontSize="small" color="info" />}
        </ListItemIcon>
        <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
      </MenuItem>
    </Menu>
  );
  
  // Render Notifications Menu
  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isNotificationsOpen}
      onClose={handleNotificationsClose}
      PaperProps={{
        elevation: 3,
        sx: { 
          width: 320,
          maxWidth: '100%',
          borderRadius: 2,
          mt: 1,
          maxHeight: 400,
          overflow: 'hidden',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ 
        px: 2, 
        py: 1.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(45deg, #3f51b5 0%, #5c6bc0 100%)',
        color: 'white'
      }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge badgeContent={2} color="error" sx={{ mr: 1 }}>
            <NotificationsIcon />
          </Badge>
          Notifications
        </Typography>
        <Button 
          size="small" 
          sx={{ 
            color: 'white', 
            textTransform: 'none',
            fontSize: '0.75rem',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            },
            px: 1,
            borderRadius: 4
          }}
        >
          Mark All as Read
        </Button>
      </Box>
      <Divider />
      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {notifications.map((notification) => (
          <MenuItem 
            key={notification.id} 
            onClick={handleNotificationsClose}
            sx={{ 
              py: 1.5,
              px: 2,
              borderLeft: notification.unread ? '4px solid' : '4px solid transparent',
              borderLeftColor: notification.unread ? 'primary.main' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
              }
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography 
                  variant="body2" 
                  fontWeight={notification.unread ? 'bold' : 'medium'}
                >
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {notification.content}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Box>
      <Divider />
      <Box sx={{ textAlign: 'center', py: 1.5 }}>
        <Button 
          color="primary" 
          size="small"
          variant="contained"
          sx={{ borderRadius: 2, fontSize: '0.8rem' }}
        >
          View All Notifications
        </Button>
      </Box>
    </Menu>
  );

  // Logo component
  const Logo = () => (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '12px',
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        mr: open ? 2 : 0
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: 20, 
          fontWeight: 'bold', 
          background: 'linear-gradient(45deg, #3f51b5 0%, #5c6bc0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        W
      </Typography>
    </Box>
  );

  // Sidebar content
  const drawerContent = (
    <>
      <Box 
        component="div" 
        sx={{
          background: darkMode 
            ? 'linear-gradient(135deg, #1a237e 0%, #283593 100%)' 
            : 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1, 2],
          py: 1.5,
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
          <Logo />
          {open && (
            <Fade in={open}>
              <Typography 
                variant="subtitle1" 
                noWrap 
                component="div" 
                fontWeight="bold"
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 1
                }}
              >
                WISENTIA ADMIN
              </Typography>
            </Fade>
          )}
        </Box>
        <IconButton 
          onClick={toggleDrawer} 
          sx={{ 
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            },
            width: 32,
            height: 32,
            flexShrink: 0,
            ml: 1
          }}
        >
          {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      </Box>
      
      <Box sx={{ 
        overflowY: 'auto', 
        overflowX: 'hidden',
        height: 'calc(100% - 64px)',
        '&::-webkit-scrollbar': {
          width: '5px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
        },
      }}>
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          display: open ? 'block' : 'none',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 1.5,
            borderRadius: 2,
            bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(63,81,181,0.05)',
          }}>
            <Avatar 
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                boxShadow: '0 2px 8px rgba(63,81,181,0.3)'
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {user?.username || 'Admin'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <CircleIcon sx={{ fontSize: 8, mr: 0.5, color: '#4caf50' }} />
                Administrator
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
        
        <List component="nav" sx={{ width: '100%', px: 1 }}>
          {/* Dashboard */}
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={open ? "" : "Dashboard"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/dashboard"
                selected={isActive('/admin/dashboard')}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  backgroundImage: isActive('/admin/dashboard') ? 
                    (darkMode ? 'linear-gradient(45deg, rgba(63, 81, 181, 0.15) 0%, rgba(92, 107, 192, 0.15) 100%)' : 
                    'linear-gradient(45deg, rgba(63, 81, 181, 0.08) 0%, rgba(92, 107, 192, 0.08) 100%)') : 
                    'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(63, 81, 181, 0.08) 0%, rgba(92, 107, 192, 0.08) 100%)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/dashboard') ? sectionColors.dashboard.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                  }}
                >
                  <DashboardIcon />
                </ListItemIcon>
                <Fade in={open}>
                  <ListItemText 
                    primary="Dashboard" 
                    sx={{ opacity: open ? 1 : 0 }} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/dashboard') ? 600 : 400,
                      color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                    }}
                  />
                </Fade>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* User Management */}
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={open ? "" : "User Management"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/users"
                selected={isActive('/admin/users')}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  backgroundImage: isActive('/admin/users') ? 
                    (darkMode ? 'linear-gradient(45deg, rgba(33, 150, 243, 0.15) 0%, rgba(100, 181, 246, 0.15) 100%)' : 
                    'linear-gradient(45deg, rgba(33, 150, 243, 0.08) 0%, rgba(100, 181, 246, 0.08) 100%)') : 
                    'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(33, 150, 243, 0.08) 0%, rgba(100, 181, 246, 0.08) 100%)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/users') ? sectionColors.users.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                  }}
                >
                  <PeopleIcon />
                </ListItemIcon>
                <Fade in={open}>
                  <ListItemText 
                    primary="User Management" 
                    sx={{ opacity: open ? 1 : 0 }} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/users') ? 600 : 400,
                      color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                    }}
                  />
                </Fade>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* Content Management */}
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={open ? "" : "Content Management"} placement="right">
              <ListItemButton
                onClick={handleContentClick}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  backgroundImage: isActive('/admin/content') ? 
                    (darkMode ? 'linear-gradient(45deg, rgba(0, 150, 136, 0.15) 0%, rgba(77, 182, 172, 0.15) 100%)' : 
                    'linear-gradient(45deg, rgba(0, 150, 136, 0.08) 0%, rgba(77, 182, 172, 0.08) 100%)') : 
                    'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(0, 150, 136, 0.08) 0%, rgba(77, 182, 172, 0.08) 100%)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/content') ? sectionColors.content.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                  }}
                >
                  <ContentIcon />
                </ListItemIcon>
                <Fade in={open}>
                  <ListItemText 
                    primary="Content Management" 
                    sx={{ opacity: open ? 1 : 0 }} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/content') ? 600 : 400,
                      color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                    }}
                  />
                </Fade>
                {open && (contentOpen ? <ExpandLess sx={{ color: darkMode ? 'white' : 'inherit' }} /> : <ExpandMore sx={{ color: darkMode ? 'white' : 'inherit' }} />)}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          <Collapse in={open && contentOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/content/courses"
                selected={isActive('/admin/content/courses')}
                sx={{ 
                  pl: 4, 
                  borderRadius: 2, 
                  mx: 1, 
                  my: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(0, 150, 136, 0.05) 0%, rgba(77, 182, 172, 0.05) 100%)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/courses') ? sectionColors.content.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                }}>
                  <SchoolIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Courses" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/courses') ? 600 : 400,
                    color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/content/quests"
                selected={isActive('/admin/content/quests')}
                sx={{ 
                  pl: 4, 
                  borderRadius: 2, 
                  mx: 1, 
                  my: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(0, 150, 136, 0.05) 0%, rgba(77, 182, 172, 0.05) 100%)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/quests') ? sectionColors.content.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                }}>
                  <QuestIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quests" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/quests') ? 600 : 400,
                    color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/content/nfts"
                selected={isActive('/admin/content/nfts')}
                sx={{ 
                  pl: 4, 
                  borderRadius: 2, 
                  mx: 1, 
                  my: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(0, 150, 136, 0.05) 0%, rgba(77, 182, 172, 0.05) 100%)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/nfts') ? sectionColors.content.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                }}>
                  <NFTIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="NFTs" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/nfts') ? 600 : 400,
                    color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/content/community"
                selected={isActive('/admin/content/community')}
                sx={{ 
                  pl: 4, 
                  borderRadius: 2, 
                  mx: 1, 
                  my: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(0, 150, 136, 0.05) 0%, rgba(77, 182, 172, 0.05) 100%)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/community') ? sectionColors.content.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                }}>
                  <ForumIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Community Content" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/community') ? 600 : 400,
                    color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                  }}
                />
              </ListItemButton>
            </List>
          </Collapse>
          
          {/* AI Generation */}
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={open ? "" : "AI Generation"} placement="right">
              <ListItemButton
                onClick={handleAIClick}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  backgroundImage: isActive('/admin/generate') ? 
                    (darkMode ? 'linear-gradient(45deg, rgba(156, 39, 176, 0.15) 0%, rgba(186, 104, 200, 0.15) 100%)' : 
                    'linear-gradient(45deg, rgba(156, 39, 176, 0.08) 0%, rgba(186, 104, 200, 0.08) 100%)') : 
                    'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(156, 39, 176, 0.08) 0%, rgba(186, 104, 200, 0.08) 100%)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/generate') ? sectionColors.ai.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                  }}
                >
                  <AIIcon />
                </ListItemIcon>
                <Fade in={open}>
                  <ListItemText 
                    primary="AI Generation" 
                    sx={{ opacity: open ? 1 : 0 }} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/generate') ? 600 : 400,
                      color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                    }}
                  />
                </Fade>
                {open && (aiOpen ? <ExpandLess sx={{ color: darkMode ? 'white' : 'inherit' }} /> : <ExpandMore sx={{ color: darkMode ? 'white' : 'inherit' }} />)}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          <Collapse in={open && aiOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={Link}
                href="/admin/generate-quest"
                selected={isActive('/admin/generate-quest')}
                sx={{ 
                  pl: 4, 
                  borderRadius: 2, 
                  mx: 1, 
                  my: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(156, 39, 176, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/generate-quest') ? sectionColors.ai.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                }}>
                  <QuestIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generate Quest" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/generate-quest') ? 600 : 400,
                    color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/generate-quiz"
                selected={isActive('/admin/generate-quiz')}
                sx={{ 
                  pl: 4, 
                  borderRadius: 2, 
                  mx: 1, 
                  my: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(156, 39, 176, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/generate-quiz') ? sectionColors.ai.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                }}>
                  <SchoolIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generate Quiz" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/generate-quiz') ? 600 : 400,
                    color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/pending-content"
                selected={isActive('/admin/pending-content')}
                sx={{ 
                  pl: 4, 
                  borderRadius: 2, 
                  mx: 1, 
                  my: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(156, 39, 176, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/pending-content') ? sectionColors.ai.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                }}>
                  <ContentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Pending Content" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/pending-content') ? 600 : 400,
                    color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                  }}
                />
              </ListItemButton>
            </List>
          </Collapse>
          
          {/* Subscriptions */}
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={open ? "" : "Subscriptions"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/subscriptions"
                selected={isActive('/admin/subscriptions')}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  backgroundImage: isActive('/admin/subscriptions') ? 
                    (darkMode ? 'linear-gradient(45deg, rgba(244, 67, 54, 0.15) 0%, rgba(239, 83, 80, 0.15) 100%)' : 
                    'linear-gradient(45deg, rgba(244, 67, 54, 0.08) 0%, rgba(239, 83, 80, 0.08) 100%)') : 
                    'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(244, 67, 54, 0.08) 0%, rgba(239, 83, 80, 0.08) 100%)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/subscriptions') ? sectionColors.subscriptions.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                  }}
                >
                  <SubscriptionIcon />
                </ListItemIcon>
                <Fade in={open}>
                  <ListItemText 
                    primary="Subscriptions" 
                    sx={{ opacity: open ? 1 : 0 }} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/subscriptions') ? 600 : 400,
                      color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                    }}
                  />
                </Fade>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* Analytics */}
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={open ? "" : "Analytics"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/analytics"
                selected={isActive('/admin/analytics')}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  backgroundImage: isActive('/admin/analytics') ? 
                    (darkMode ? 'linear-gradient(45deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 183, 77, 0.15) 100%)' : 
                    'linear-gradient(45deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 183, 77, 0.08) 100%)') : 
                    'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 183, 77, 0.08) 100%)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/analytics') ? sectionColors.analytics.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                  }}
                >
                  <AnalyticsIcon />
                </ListItemIcon>
                <Fade in={open}>
                  <ListItemText 
                    primary="Analytics" 
                    sx={{ opacity: open ? 1 : 0 }} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/analytics') ? 600 : 400,
                      color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                    }}
                  />
                </Fade>
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* System Health */}
          <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <Tooltip title={open ? "" : "System Health"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/system-health"
                selected={isActive('/admin/system-health')}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 2,
                  backgroundImage: isActive('/admin/system-health') ? 
                    (darkMode ? 'linear-gradient(45deg, rgba(96, 125, 139, 0.15) 0%, rgba(144, 164, 174, 0.15) 100%)' : 
                    'linear-gradient(45deg, rgba(96, 125, 139, 0.08) 0%, rgba(144, 164, 174, 0.08) 100%)') : 
                    'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(45deg, rgba(96, 125, 139, 0.08) 0%, rgba(144, 164, 174, 0.08) 100%)'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/system-health') ? sectionColors.system.main : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.67)'),
                  }}
                >
                  <SystemHealthIcon />
                </ListItemIcon>
                <Fade in={open}>
                  <ListItemText 
                    primary="System Health" 
                    sx={{ opacity: open ? 1 : 0 }} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/system-health') ? 600 : 400,
                      color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                    }}
                  />
                </Fade>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
        
        {/* Dark Theme Toggle */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: 2,
          mb: 2
        }}>
          {open ? (
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                borderRadius: 3,
                width: '90%',
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                border: '1px solid',
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {darkMode ? 
                  <LightModeIcon color="warning" sx={{ mr: 1 }} /> : 
                  <DarkModeIcon color="info" sx={{ mr: 1 }} />
                }
                <Typography variant="body2" color={darkMode ? 'white' : 'text.primary'}>
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </Typography>
              </Box>
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                color={darkMode ? "warning" : "primary"}
                size="small"
              />
            </Paper>
          ) : (
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} placement="right">
              <IconButton 
                onClick={toggleTheme}
                sx={{ 
                  bgcolor: darkMode ? 'rgba(255,167,38,0.1)' : 'rgba(33,150,243,0.1)',
                  color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,167,38,0.2)' : 'rgba(33,150,243,0.2)'
                  }
                }}
              >
                {darkMode ? 
                  <LightModeIcon color="warning" /> : 
                  <DarkModeIcon color="info" />
                }
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider sx={{ 
          my: 1, 
          mx: open ? 2 : 1,
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
        }} />
        
        {/* Logout Button */}
        <ListItem disablePadding sx={{ 
          display: 'block', 
          mb: 0.5, 
          px: 1 
        }}>
          <Tooltip title={open ? "" : "Logout"} placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  backgroundImage: 'linear-gradient(45deg, rgba(244, 67, 54, 0.08) 0%, rgba(239, 83, 80, 0.08) 100%)'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'error.main'
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <Fade in={open}>
                <ListItemText 
                  primary="Logout" 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: 'error.main'
                  }} 
                  primaryTypographyProps={{
                    color: darkMode ? '#f44336' : 'error.main',
                  }}
                />
              </Fade>
            </ListItemButton>
          </Tooltip>
        </ListItem>
        
        {/* Version Text */}
        {open && (
          <Fade in={open}>
            <Typography 
              variant="caption" 
              color={darkMode ? "rgba(255,255,255,0.5)" : "text.secondary"}
              sx={{ 
                textAlign: 'center', 
                display: 'block', 
                mb: 2, 
                mt: 1
              }}
            >
              Wisentia Admin v1.0
            </Typography>
          </Fade>
        )}
      </Box>
    </>
  );

  // Toggle button for collapsed state (on the edge of collapsed sidebar)
  const sidebarToggleButton = !open && (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: closedDrawerWidth - 12,
        zIndex: 1199,
        transform: 'translateY(-50%)',
      }}
    >
      <IconButton
        onClick={toggleDrawer}
        sx={{
          width: 24,
          height: 72,
          borderRadius: '0 8px 8px 0',
          backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#f5f7fa',
          border: '1px solid',
          borderLeft: 'none',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : '#e1e5eb',
          },
          color: darkMode ? 'white' : 'rgba(0,0,0,0.5)',
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      overflow: 'hidden',
      bgcolor: darkMode ? '#121212' : '#f5f7fa',
      color: darkMode ? 'white' : 'inherit',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { sm: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${closedDrawerWidth}px)` },
          ml: { sm: open ? `${drawerWidth}px` : `${closedDrawerWidth}px` },
          bgcolor: darkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          color: darkMode ? 'white' : 'text.primary',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          zIndex: (theme) => theme.zIndex.drawer - 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              background: getGradientForPath(pathname),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {getPageTitle(pathname)}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Dark Mode">
              <IconButton 
                onClick={toggleTheme} 
                color="inherit" 
                sx={{ 
                  mr: 1,
                  bgcolor: darkMode ? 'rgba(255,167,38,0.1)' : 'rgba(33,150,243,0.1)',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,167,38,0.2)' : 'rgba(33,150,243,0.2)'
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                {darkMode ? <LightModeIcon color="warning" /> : <DarkModeIcon color="info" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                aria-label="show new notifications"
                color="inherit"
                sx={{ 
                  mx: 0.5,
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  },
                  transition: 'background-color 0.2s'
                }}
                onClick={handleNotificationsOpen}
              >
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Profile">
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ 
                  ml: 0.5,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: '0.9rem',
                    boxShadow: darkMode ? '0 0 0 2px rgba(255,255,255,0.2)' : '0 0 0 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {renderMenu}
      {renderNotificationsMenu}
      
      {/* Side Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : closedDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: open ? drawerWidth : closedDrawerWidth, 
            boxSizing: 'border-box',
            border: 'none',
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            bgcolor: darkMode ? '#1e1e1e' : 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          },
          display: { xs: 'none', sm: 'block' }
        }}
        open={open}
      >
        {drawerContent}
      </Drawer>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: darkMode ? '#1e1e1e' : 'white',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Toggle button for collapsed sidebar */}
      {sidebarToggleButton}
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%',
            sm: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${closedDrawerWidth}px)` 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          pt: 8,
          pb: 2,
          px: { xs: 2, md: 3 },
          height: '100vh',
          overflow: 'auto',
          bgcolor: darkMode ? '#121212' : '#f5f7fa', // Background color
        }}
      >
        {children}
      </Box>
    </Box>
  );
  
  // Helper function to get the gradient for different paths
  function getGradientForPath(path) {
    if (path?.includes('/admin/dashboard')) return sectionColors.dashboard.gradient;
    if (path?.includes('/admin/users')) return sectionColors.users.gradient;
    if (path?.includes('/admin/content')) return sectionColors.content.gradient;
    if (path?.includes('/admin/generate')) return sectionColors.ai.gradient;
    if (path?.includes('/admin/subscriptions')) return sectionColors.subscriptions.gradient;
    if (path?.includes('/admin/analytics')) return sectionColors.analytics.gradient;
    if (path?.includes('/admin/system')) return sectionColors.system.gradient;
    return 'linear-gradient(45deg, #3f51b5 0%, #5c6bc0 100%)'; // Default gradient
  }
  
  // Helper function to get page title
  function getPageTitle(path) {
    if (path === '/admin/dashboard') return 'Dashboard';
    if (path === '/admin/users') return 'User Management';
    if (path?.includes('/admin/content/courses')) return 'Course Management';
    if (path?.includes('/admin/content/quests')) return 'Quest Management';
    if (path?.includes('/admin/content/nfts')) return 'NFT Management';
    if (path?.includes('/admin/content/community')) return 'Community Content';
    if (path?.includes('/admin/generate-quest')) return 'AI Quest Generation';
    if (path?.includes('/admin/generate-quiz')) return 'AI Quiz Generation';
    if (path?.includes('/admin/pending-content')) return 'Pending Content';
    if (path?.includes('/admin/subscriptions')) return 'Subscription Management';
    if (path?.includes('/admin/analytics')) return 'Analytics';
    if (path?.includes('/admin/system-health')) return 'System Health';
    return 'Admin Dashboard';
  }
}