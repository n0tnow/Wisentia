// src/components/layout/AdminLayout.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// MUI imports
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  CssBaseline,
  Collapse,
  Button,
  Tooltip,
  Switch,
  Fade,
  ThemeProvider,
  createTheme
} from '@mui/material';

// MUI Icons
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Subscriptions as SubscriptionIcon,
  MonitorHeart as SystemHealthIcon,
  SmartToy as AIIcon,
  ContentPaste as ContentIcon,
  Token as TokenIcon,
  ViewCarousel as NFTIcon,
  Forum as ForumIcon,
  BarChart as AnalyticsIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

// Drawer width
const drawerWidth = 240;
const closedDrawerWidth = 60;

// Create admin theme with better contrast
const createAdminTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4e54c8',
        light: '#7875e2',
        dark: '#3d308e',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ff1e56',
        light: '#ff517b',
        dark: '#c60039',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f7f7f7',
        paper: mode === 'dark' ? '#1e1e2f' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#333333',
        secondary: mode === 'dark' ? '#a0a0a0' : '#666666',
      },
      // Açık tema için özel renk ayarları
      ...(mode === 'light' && {
        action: {
          active: '#4e54c8',
          hover: 'rgba(78, 84, 200, 0.08)',
          selected: 'rgba(78, 84, 200, 0.16)',
        },
      }),
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            backgroundImage: mode === 'dark' 
              ? 'linear-gradient(90deg, #2c2c54 0%, #1e1e2f 100%)'
              : 'linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#1e1e2f' : '#ffffff',
            borderRight: 'none',
            boxShadow: mode === 'dark' ? 'none' : '2px 0 10px rgba(0,0,0,0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
          containedPrimary: {
            boxShadow: '0 4px 10px rgba(78, 84, 200, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(78, 84, 200, 0.4)',
            },
          },
          containedSecondary: {
            boxShadow: '0 4px 10px rgba(255, 30, 86, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(255, 30, 86, 0.4)',
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 0',
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(78, 84, 200, 0.2)' : 'rgba(78, 84, 200, 0.1)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(78, 84, 200, 0.3)' : 'rgba(78, 84, 200, 0.15)',
              },
            },
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: mode === 'dark' ? '#a0a0a0' : '#666666',
            minWidth: 40,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: mode === 'dark' ? '#2c2c54' : '#f0f2ff',
            color: mode === 'dark' ? '#ffffff' : '#333333',
            fontWeight: 600,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(78, 84, 200, 0.04)',
            },
          },
        },
      },
    },
  });
};

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [contentOpen, setContentOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
  
  const theme = createAdminTheme(darkMode ? 'dark' : 'light');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsOpen = Boolean(notificationAnchorEl);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading, logout, isAuthenticated } = useAuth();

  // Set drawer open state based on screen size
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  // Check if user is admin and redirect if not
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Wait for auth check to complete
        if (authLoading) return;
        
        // If not authenticated, redirect to login
        if (!isAuthenticated()) {
          console.log('User not authenticated, redirecting to login');
          router.push('/login?redirect=/admin/dashboard');
          return;
        }
        
        // Get user data
        const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
        
        // If user is not admin, redirect to home
        if (userData.role !== 'admin') {
          console.log('User is not admin, redirecting to home');
          router.push('/');
          return;
        }
        
        // User is authenticated and is admin
        setAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Check saved theme preference
    const savedTheme = localStorage.getItem('adminThemePreference');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, [authLoading, user, router, isAuthenticated]);

  // Toggle drawer
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  // Toggle mobile drawer
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  // Content submenu toggle
  const handleContentClick = () => {
    setContentOpen(!contentOpen);
  };

  // AI submenu toggle
  const handleAIClick = () => {
    setAIOpen(!aiOpen);
  };
  
  // Theme toggle
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('adminThemePreference', newMode ? 'dark' : 'light');
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Check if current route is active
  const isActive = (path) => {
    if (path === '/admin' && pathname === '/admin/dashboard') return true;
    if (path !== '/admin/dashboard' && pathname?.startsWith(path)) return true;
    return false;
  };

  // Drawer content
  const drawerContent = (
    <>
      {/* Drawer Header - Logo Area */}
      <Box 
        component="div" 
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          justifyContent: 'space-between',
          background: darkMode ? 'linear-gradient(90deg, #292962 0%, #1e1e2f 100%)' : 'linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component={Link}
            href="/admin/dashboard"
            sx={{ 
              fontWeight: 800, 
              color: 'white',
              textDecoration: 'none',
              letterSpacing: 1,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              display: open ? 'block' : 'none'
            }}
          >
            WISENTIA
          </Typography>
          
          {!open && (
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: 'transparent',
                border: '2px solid white',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              W
            </Avatar>
          )}
        </Box>
        
        <IconButton
          onClick={handleDrawerToggle}
          size="small"
          sx={{ 
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            },
            width: 28,
            height: 28
          }}
        >
          {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      </Box>
      
      {/* User Profile Section */}
      {open && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1.5, 
              borderRadius: 2,
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(78, 84, 200, 0.05)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <Avatar 
              sx={{ 
                width: 42, 
                height: 42, 
                bgcolor: darkMode ? '#ff1e56' : '#4e54c8', 
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600, 
                  lineHeight: 1.2,
                  color: darkMode ? 'white' : 'text.primary'
                }}
              >
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
      )}
      
      {/* Navigation Menu */}
      <Box sx={{ 
        overflowY: 'auto', 
        overflowX: 'hidden',
        flex: 1,
        py: 2,
        px: 1.5,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
          borderRadius: '10px',
        },
      }}>
        <List component="nav" disablePadding>
          {/* Dashboard */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : "Dashboard"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/dashboard"
                selected={isActive('/admin/dashboard')}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/dashboard') ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  <DashboardIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="Dashboard" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/dashboard') ? 600 : 400,
                      color: isActive('/admin/dashboard') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* User Management */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : "User Management"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/users"
                selected={isActive('/admin/users')}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/users') ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  <PeopleIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="User Management" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/users') ? 600 : 400,
                      color: isActive('/admin/users') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* Content Management */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : "Content Management"} placement="right">
              <ListItemButton
                onClick={handleContentClick}
                selected={isActive('/admin/content')}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/content') ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  <ContentIcon />
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText 
                      primary="Content Management" 
                      primaryTypographyProps={{ 
                        fontWeight: isActive('/admin/content') ? 600 : 400,
                        color: isActive('/admin/content') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                      }}
                    />
                    {contentOpen ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
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
                  py: 0.8,
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/courses') ? theme.palette.primary.main : 'inherit'
                }}>
                  <SchoolIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Courses" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/courses') ? 600 : 400,
                    color: isActive('/admin/content/courses') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/content/quests"
                selected={isActive('/admin/content/quests')}
                sx={{ 
                  pl: 4, 
                  py: 0.8,
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/quests') ? theme.palette.primary.main : 'inherit'
                }}>
                  <QuestIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quests" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/quests') ? 600 : 400,
                    color: isActive('/admin/content/quests') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/content/nfts"
                selected={isActive('/admin/content/nfts')}
                sx={{ 
                  pl: 4, 
                  py: 0.8,
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/nfts') ? theme.palette.primary.main : 'inherit'
                }}>
                  <NFTIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="NFTs" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/nfts') ? 600 : 400,
                    color: isActive('/admin/content/nfts') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/content/community"
                selected={isActive('/admin/content/community')}
                sx={{ 
                  pl: 4, 
                  py: 0.8,
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/community') ? theme.palette.primary.main : 'inherit'
                }}>
                  <ForumIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Community Content" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/community') ? 600 : 400,
                    color: isActive('/admin/content/community') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                  }}
                />
              </ListItemButton>
            </List>
          </Collapse>
          
          {/* AI Generation */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : "AI Generation"} placement="right">
              <ListItemButton
                onClick={handleAIClick}
                selected={isActive('/admin/generate')}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/generate') ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  <AIIcon />
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText 
                      primary="AI Generation" 
                      primaryTypographyProps={{ 
                        fontWeight: isActive('/admin/generate') ? 600 : 400,
                        color: isActive('/admin/generate') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                      }}
                    />
                    {aiOpen ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
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
                  py: 0.8,
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/generate-quest') ? theme.palette.primary.main : 'inherit'
                }}>
                  <QuestIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generate Quest" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/generate-quest') ? 600 : 400,
                    color: isActive('/admin/generate-quest') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/generate-quiz"
                selected={isActive('/admin/generate-quiz')}
                sx={{ 
                  pl: 4, 
                  py: 0.8,
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/generate-quiz') ? theme.palette.primary.main : 'inherit'
                }}>
                  <SchoolIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generate Quiz" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/generate-quiz') ? 600 : 400,
                    color: isActive('/admin/generate-quiz') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                  }}
                />
              </ListItemButton>
              
              <ListItemButton
                component={Link}
                href="/admin/pending-content"
                selected={isActive('/admin/pending-content')}
                sx={{ 
                  pl: 4, 
                  py: 0.8,
                  minHeight: 40,
                  borderRadius: 1.5,
                  mx: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/pending-content') ? theme.palette.primary.main : 'inherit'
                }}>
                  <ContentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Pending Content" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/pending-content') ? 600 : 400,
                    color: isActive('/admin/pending-content') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                  }}
                />
              </ListItemButton>
            </List>
          </Collapse>
          
          {/* Subscriptions */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : "Subscriptions"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/subscriptions"
                selected={isActive('/admin/subscriptions')}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/subscriptions') ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  <SubscriptionIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="Subscriptions" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/subscriptions') ? 600 : 400,
                      color: isActive('/admin/subscriptions') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* Analytics */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : "Analytics"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/analytics"
                selected={isActive('/admin/analytics')}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/analytics') ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  <AnalyticsIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="Analytics" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/analytics') ? 600 : 400,
                      color: isActive('/admin/analytics') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          {/* System Health */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <Tooltip title={open ? "" : "System Health"} placement="right">
              <ListItemButton
                component={Link}
                href="/admin/system-health"
                selected={isActive('/admin/system-health')}
                sx={{
                  minHeight: 46,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/system-health') ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  <SystemHealthIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="System Health" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/system-health') ? 600 : 400,
                      color: isActive('/admin/system-health') ? theme.palette.primary.main : (darkMode ? 'white' : 'text.primary')
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
      
      {/* Theme Toggle & Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}>
        {open && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {darkMode ? 
                <LightModeIcon sx={{ color: theme.palette.warning.main, mr: 1.5 }} /> : 
                <DarkModeIcon sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
              }
              <Typography variant="body2" fontWeight={500} color={darkMode ? 'white' : 'text.primary'}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </Typography>
            </Box>
            <Switch
              checked={darkMode}
              onChange={toggleTheme}
              color={darkMode ? "warning" : "primary"}
              size="small"
            />
          </Box>
        )}
        
        <Tooltip title={open ? "Logout" : "Logout"} placement={open ? "top" : "right"}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              justifyContent: open ? 'flex-start' : 'center',
              minHeight: 42,
              ...(open ? {} : { p: 1, minWidth: 0 })
            }}
          >
            {open && 'Logout'}
          </Button>
        </Tooltip>
        
        {open && (
          <Typography 
            variant="caption" 
            align="center"
            color={darkMode ? 'rgba(255,255,255,0.5)' : 'text.secondary'}
            sx={{ 
              display: 'block', 
              mt: 2,
              textAlign: 'center'
            }}
          >
            Wisentia Admin v1.0
          </Typography>
        )}
      </Box>
    </>
  );

  // Show loading screen while checking auth
  if (loading || authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: darkMode ? '#1e1e2f' : '#f7f7f7',
            flexDirection: 'column'
          }}
        >
          <CircularProgress size={50} thickness={4} color="primary" />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 500, color: darkMode ? 'white' : 'text.primary' }}>
            Loading admin panel...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait, verifying credentials
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Show unauthorized message if not admin
  if (!authorized && !loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: darkMode ? '#1e1e2f' : '#f7f7f7',
            p: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" color="error" gutterBottom fontWeight="bold">
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph color={darkMode ? 'white' : 'text.primary'}>
            You don't have permission to access the admin panel.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained"
              onClick={() => router.push('/')}
              sx={{ 
                borderRadius: 8,
                background: theme.palette.primary.main,
                boxShadow: '0 4px 20px rgba(78, 84, 200, 0.25)',
                '&:hover': {
                  background: theme.palette.primary.dark,
                  boxShadow: '0 6px 25px rgba(78, 84, 200, 0.35)',
                }
              }}
            >
              Return to Home
            </Button>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Profile menu
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { 
          minWidth: 200,
          borderRadius: 2,
          mt: 1
        }
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Avatar 
          sx={{ 
            width: 36, 
            height: 36,
            bgcolor: 'white',
            color: '#4e54c8',
            fontWeight: 'bold',
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
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <AccountCircleIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="My Profile" />
      </MenuItem>
      <MenuItem onClick={handleMenuClose}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
      </MenuItem>
    </Menu>
  );

  // Notifications menu
  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      open={isNotificationsOpen}
      onClose={handleNotificationsClose}
      PaperProps={{
        elevation: 3,
        sx: { 
          width: 320,
          maxWidth: '100%',
          borderRadius: 2,
          mt: 1
        }
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)',
        color: 'white'
      }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Notifications
        </Typography>
        <Badge badgeContent={2} color="error">
          <NotificationsIcon />
        </Badge>
      </Box>
      <MenuItem onClick={handleNotificationsClose}>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            New User Registration
          </Typography>
          <Typography variant="caption" color="text.secondary">
            5 new users joined today
          </Typography>
        </Box>
      </MenuItem>
      <MenuItem onClick={handleNotificationsClose}>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            System Update
          </Typography>
          <Typography variant="caption" color="text.secondary">
            The system has been updated successfully
          </Typography>
        </Box>
      </MenuItem>
      <Divider />
      <Box sx={{ p: 1.5, textAlign: 'center' }}>
        <Button 
          variant="text" 
          color="primary" 
          size="small"
        >
          View All Notifications
        </Button>
      </Box>
    </Menu>
  );

  // Main layout
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Side Drawer */}
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : closedDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : closedDrawerWidth,
              transition: 'width 0.2s ease-in-out',
              whiteSpace: 'nowrap',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              boxShadow: darkMode ? 'none' : '0 0 15px rgba(0,0,0,0.1)',
              border: 'none',
              display: 'flex',
              flexDirection: 'column'
            },
            display: { xs: 'none', md: 'block' }
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerToggle}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
              display: 'flex',
              flexDirection: 'column'
            },
            display: { xs: 'block', md: 'none' }
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: darkMode ? '#1a1a2e' : '#f7f7f7'
          }}
        >
          {/* Top AppBar */}
          <AppBar 
            position="sticky" 
            color="primary"
            elevation={0}
            sx={{
              width: '100%',
              transition: 'box-shadow 0.2s',
              boxShadow: '0 1px 8px rgba(0,0,0,0.1)',
              zIndex: 1100
            }}
          >
            <Toolbar sx={{ minHeight: '64px !important' }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              {/* Page title in header with 3D effect */}
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    ml: { xs: 0, md: 1 },
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: 0.5,
                    display: 'inline-block',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      bottom: -4,
                      left: 0,
                      backgroundColor: 'rgba(255,255,255,0.4)',
                      borderRadius: '2px'
                    }
                  }}
                >
                  {getPageTitle(pathname)}
                </Typography>
              </Box>

              {/* Theme toggle in header */}
              <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton
                  color="inherit"
                  onClick={toggleTheme}
                  size="large"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    mr: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              {/* Notification button */}
              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationsOpen}
                  size="large"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    mr: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <Badge badgeContent={2} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              {/* Profile menu button */}
              <Tooltip title="Account">
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  size="large"
                  sx={{ 
                    ml: 0,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          
          {renderMenu}
          {renderNotificationsMenu}
          
          {/* Scrollable Content Area */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              p: { xs: 2, sm: 3 }, 
              overflow: 'auto', 
              height: 'calc(100vh - 64px)'
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
  
  // Helper function to get page title
  function getPageTitle(path) {
    if (path === '/admin/dashboard') return 'Dashboard';
    if (path?.includes('/admin/users')) return 'User Management';
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