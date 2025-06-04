// src/components/admin/AdminSidebar.jsx
'use client';

import { useState, useEffect, forwardRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// MUI imports
import {
  Box,
  Drawer,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Avatar,
  Switch,
  useMediaQuery,
  styled,
  alpha,
  Chip,
  Badge
} from '@mui/material';

// MUI icons
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Subscriptions as SubscriptionIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  MonitorHeart as SystemHealthIcon,
  SmartToy as AIIcon,
  ContentPaste as ContentIcon,
  ViewCarousel as NFTIcon,
  Forum as ForumIcon,
  BarChart as AnalyticsIcon,
  Circle as CircleIcon,
  Science as ScienceIcon,
  Hexagon as HexagonIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

// Scientific Admin Theme Colors
const ADMIN_COLORS = {
  primary: '#00F5FF',     // Cyan
  secondary: '#FF1493',   // Deep Pink  
  accent: '#00FF00',      // Lime Green
  warning: '#FFD700',     // Gold
  success: '#32CD32',     // Lime Green
  info: '#1E90FF',        // Dodger Blue
  neutral: '#6B7280',     // Gray
  premium: '#8A2BE2',     // Blue Violet
  dark: '#0F172A',        // Dark slate
  surface: '#1E293B',     // Slate
  glass: 'rgba(0, 245, 255, 0.1)',
  gradients: {
    primary: 'linear-gradient(135deg, #00F5FF 0%, #0080FF 100%)',
    secondary: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
    accent: 'linear-gradient(135deg, #00FF00 0%, #32CD32 100%)',
    warning: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    premium: 'linear-gradient(135deg, #8A2BE2 0%, #DA70D6 100%)',
    dark: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    cosmic: 'linear-gradient(135deg, #1E293B 0%, #374151 50%, #1E293B 100%)',
    neon: 'linear-gradient(90deg, #00F5FF 0%, #FF1493 50%, #00FF00 100%)'
  }
};

// Drawer width
const drawerWidth = 280;
const closedDrawerWidth = 72;

// LinkBehavior component for Next.js navigation
const LinkBehavior = forwardRef((props, ref) => {
  const { href, ...other } = props;
  return <Link href={href} ref={ref} {...other} />;
});

const AdminSidebar = ({ children, darkMode, toggleDarkMode }) => {
  const [open, setOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  
  // Safe auth hook usage with error handling
  let user = null;
  let logoutFunction = null;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    logoutFunction = authContext.logout;
  } catch (authError) {
    console.warn('Auth context not available in AdminSidebar, using fallback');
    // Fallback: localStorage'dan kullanıcı bilgilerini kontrol et
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          user = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error('Error checking stored auth in AdminSidebar:', e);
      }
    }
    
    // Fallback logout function
    logoutFunction = () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        // Cookie'leri temizle
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        window.location.href = '/login';
      }
    };
  }
  
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // Set drawer open state based on screen size
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  // Check if current route is active
  const isActive = (path) => {
    if (path === '/admin' && pathname === '/admin/dashboard') return true;
    if (path !== '/admin/dashboard' && pathname?.startsWith(path)) return true;
    return false;
  };

  // Toggle drawer
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Toggle mobile drawer
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Content submenu toggle
  const handleContentClick = () => {
    setContentOpen(!contentOpen);
  };

  // AI submenu toggle
  const handleAIClick = () => {
    setAIOpen(!aiOpen);
  };

  // Logout
  const handleLogout = async () => {
    try {
      if (logoutFunction) {
        await logoutFunction();
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  // Navigation menu items
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: DashboardIcon,
      color: ADMIN_COLORS.primary
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: PeopleIcon,
      color: ADMIN_COLORS.info
    },
    {
      title: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: SubscriptionIcon,
      color: ADMIN_COLORS.secondary
    },
    {
      title: 'Analytics',
      path: '/admin/analytics',
      icon: AnalyticsIcon,
      color: ADMIN_COLORS.warning
    },
    {
      title: 'System Health',
      path: '/admin/system-health',
      icon: SystemHealthIcon,
      color: ADMIN_COLORS.neutral
    }
  ];

  // AI submenu items
  const aiMenuItems = [
    {
      title: 'Generate Quest',
      path: '/admin/generate-quest',
      icon: QuestIcon
    },
    {
      title: 'Generate Quiz',
      path: '/admin/generate-quiz',
      icon: SchoolIcon
    },
    {
      title: 'Pending Content',
      path: '/admin/pending-content',
      icon: ContentIcon
    }
  ];

  // Content submenu items
  const contentMenuItems = [
    {
      title: 'Courses',
      path: '/admin/content/courses',
      icon: SchoolIcon
    },
    {
      title: 'Quests',
      path: '/admin/content/quests',
      icon: QuestIcon
    },
    {
      title: 'NFTs',
      path: '/admin/content/nfts',
      icon: NFTIcon
    },
    {
      title: 'Community',
      path: '/admin/content/community',
      icon: ForumIcon
    }
  ];

  // Drawer content
  const drawerContent = (
    <>
      {/* Scientific Header */}
      <Box 
        sx={{
          height: 80,
          display: 'flex',
          alignItems: 'center',
          padding: open ? '0 24px' : '0 12px',
          justifyContent: open ? 'space-between' : 'center',
          borderBottom: `1px solid ${alpha(ADMIN_COLORS.primary, 0.2)}`,
          background: darkMode 
            ? ADMIN_COLORS.gradients.cosmic
            : `linear-gradient(135deg, ${alpha(ADMIN_COLORS.primary, 0.1)} 0%, ${alpha(ADMIN_COLORS.info, 0.1)} 100%)`,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: ADMIN_COLORS.gradients.neon,
            opacity: 0.6
          }
        }}
      >
        {open ? (
          <>
            <Box display="flex" alignItems="center" gap={2}>
              {/* WISENTIA Logo - W with Blue Gradients */}
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0080FF 0%, #1E90FF 50%, #00F5FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0, 128, 255, 0.3)',
                  border: `2px solid ${alpha('#00F5FF', 0.5)}`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #00F5FF, #0080FF, #1E90FF)',
                    opacity: 0.3,
                    animation: 'logoGlow 3s ease-in-out infinite alternate',
                    zIndex: -1
                  },
                  '@keyframes logoGlow': {
                    '0%': { transform: 'scale(1)', opacity: 0.3 },
                    '100%': { transform: 'scale(1.05)', opacity: 0.6 }
                  }
                }}
              >
            <Typography 
              sx={{ 
                    fontWeight: 900,
                    fontSize: '1.8rem',
                color: 'white',
                    fontFamily: 'Arial, sans-serif',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    transform: 'scaleX(1.2)'
                  }}
                >
                  W
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  background: 'linear-gradient(135deg, #0080FF 0%, #00F5FF 50%, #1E90FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '2px',
                  fontFamily: 'Arial, sans-serif',
                  textShadow: darkMode 
                    ? `0 0 10px ${alpha(ADMIN_COLORS.primary, 0.5)}`
                    : 'none',
                  position: 'relative'
              }}
            >
              WISENTIA
            </Typography>
            </Box>
            <IconButton
              onClick={handleDrawerToggle}
              size="small"
              sx={{ 
                color: ADMIN_COLORS.primary,
                background: alpha(ADMIN_COLORS.primary, 0.1),
                border: `1px solid ${alpha(ADMIN_COLORS.primary, 0.2)}`,
                '&:hover': {
                  background: alpha(ADMIN_COLORS.primary, 0.2),
                  transform: 'scale(1.05)',
                  boxShadow: `0 0 20px ${alpha(ADMIN_COLORS.primary, 0.4)}`
                },
                transition: 'all 0.3s ease'
              }}
            >
              <MenuIcon />
            </IconButton>
          </>
        ) : (
          <Tooltip title="WISENTIA" placement="right">
            <Box
            onClick={handleDrawerToggle}
            sx={{ 
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0080FF 0%, #1E90FF 50%, #00F5FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0, 128, 255, 0.3)',
                border: `2px solid ${alpha('#00F5FF', 0.5)}`,
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 6px 30px ${alpha('#0080FF', 0.5)}`
                }
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.8rem',
              color: 'white',
                  fontFamily: 'Arial, sans-serif',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  transform: 'scaleX(1.2)'
                }}
              >
                W
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
      
      {/* User Profile Section */}
      {open && (
        <Box 
          sx={{
            padding: '20px',
            borderBottom: `1px solid ${alpha(ADMIN_COLORS.primary, 0.1)}`,
          background: darkMode 
              ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.dark, 0.8)} 0%, ${alpha(ADMIN_COLORS.surface, 0.6)} 100%)`
              : `linear-gradient(135deg, ${alpha(ADMIN_COLORS.primary, 0.03)} 0%, ${alpha(ADMIN_COLORS.info, 0.03)} 100%)`
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px',
              borderRadius: '16px',
              background: darkMode
                ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.surface, 0.8)} 0%, ${alpha(ADMIN_COLORS.dark, 0.6)} 100%)`
                : `linear-gradient(135deg, ${alpha('#FFFFFF', 0.9)} 0%, ${alpha(ADMIN_COLORS.primary, 0.05)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(ADMIN_COLORS.primary, 0.2)}`,
              boxShadow: `0 8px 32px ${alpha(ADMIN_COLORS.primary, 0.1)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 40px ${alpha(ADMIN_COLORS.primary, 0.2)}`
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 48,
                height: 48,
                background: ADMIN_COLORS.gradients.primary,
                fontWeight: 'bold',
                fontSize: '1.2rem',
                border: `2px solid ${ADMIN_COLORS.primary}`,
                boxShadow: `0 0 20px ${alpha(ADMIN_COLORS.primary, 0.4)}`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: '50%',
                  background: ADMIN_COLORS.gradients.neon,
                  opacity: 0.3,
                  animation: 'glow 3s ease-in-out infinite alternate',
                  zIndex: -1
                },
                '@keyframes glow': {
                  '0%': { transform: 'scale(1)', opacity: 0.3 },
                  '100%': { transform: 'scale(1.1)', opacity: 0.6 }
                }
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 700, 
                  fontFamily: 'monospace',
                  color: darkMode ? '#F1F5F9' : '#1E293B',
                  letterSpacing: '0.5px'
                }}
              >
                {user?.username || 'Administrator'}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <CircleIcon sx={{ fontSize: 8, color: ADMIN_COLORS.accent }} />
              <Typography 
                variant="caption" 
                sx={{ 
                    color: ADMIN_COLORS.accent,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  ADMIN ACCESS
              </Typography>
                <Chip 
                  label="ONLINE" 
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    background: ADMIN_COLORS.gradients.accent,
                    color: 'white',
                    ml: 1
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Navigation Section */}
      <Box 
        sx={{ 
          padding: '16px 12px',
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(ADMIN_COLORS.primary, 0.3),
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: alpha(ADMIN_COLORS.primary, 0.5)
          }
        }}
      >
        <List component="nav" disablePadding>
          {/* Main Menu Items */}
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <Tooltip title={open ? "" : item.title} placement="right">
              <ListItemButton
                component={Link}
                  href={item.path}
                sx={{
                    minHeight: 52,
                    margin: '4px 0',
                    borderRadius: '12px',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isActive(item.path) 
                      ? `linear-gradient(135deg, ${alpha(item.color, 0.15)} 0%, ${alpha(item.color, 0.1)} 100%)`
                    : 'transparent',
                    border: isActive(item.path) 
                      ? `1px solid ${alpha(item.color, 0.3)}`
                      : `1px solid transparent`,
                    px: open ? 2 : 1.5,
                  '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.05)} 100%)`,
                      transform: 'translateX(4px)',
                      border: `1px solid ${alpha(item.color, 0.2)}`,
                      boxShadow: `0 4px 20px ${alpha(item.color, 0.2)}`
                    },
                    '&::before': isActive(item.path) ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '60%',
                      background: `linear-gradient(180deg, ${item.color} 0%, ${alpha(item.color, 0.5)} 100%)`,
                      borderRadius: '0 2px 2px 0',
                      boxShadow: `0 0 10px ${alpha(item.color, 0.5)}`
                    } : {}
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                      marginRight: '16px',
                    justifyContent: 'center',
                      color: isActive(item.path) ? item.color : (darkMode ? '#94A3B8' : '#64748B'),
                      transition: 'all 0.3s ease',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.4rem',
                        filter: isActive(item.path) ? `drop-shadow(0 0 8px ${alpha(item.color, 0.6)})` : 'none'
                      }
                    }}
                  >
                    <item.icon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                      primary={item.title}
                    primaryTypographyProps={{ 
                        fontWeight: isActive(item.path) ? 700 : 500,
                        fontSize: '0.9rem',
                        color: isActive(item.path) ? item.color : (darkMode ? '#F1F5F9' : '#334155'),
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          ))}
          
          {/* Content Management with Submenu */}
          <ListItem disablePadding>
            <Tooltip title={open ? "" : "Content Management"} placement="right">
              <ListItemButton
                onClick={handleContentClick}
                sx={{
                  minHeight: 52,
                  margin: '4px 0',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: isActive('/admin/content') 
                    ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.primary, 0.15)} 0%, ${alpha(ADMIN_COLORS.primary, 0.1)} 100%)`
                    : 'transparent',
                  border: isActive('/admin/content') 
                    ? `1px solid ${alpha(ADMIN_COLORS.primary, 0.3)}`
                    : `1px solid transparent`,
                  px: open ? 2 : 1.5,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.primary, 0.1)} 0%, ${alpha(ADMIN_COLORS.primary, 0.05)} 100%)`,
                    transform: 'translateX(4px)',
                    border: `1px solid ${alpha(ADMIN_COLORS.primary, 0.2)}`,
                    boxShadow: `0 4px 20px ${alpha(ADMIN_COLORS.primary, 0.2)}`
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    marginRight: '16px',
                    justifyContent: 'center',
                    color: isActive('/admin/content') ? ADMIN_COLORS.primary : (darkMode ? '#94A3B8' : '#64748B'),
                    transition: 'all 0.3s ease',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.4rem',
                      filter: isActive('/admin/content') ? `drop-shadow(0 0 8px ${alpha(ADMIN_COLORS.primary, 0.6)})` : 'none'
                    }
                  }}
                >
                  <ContentIcon />
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText 
                      primary="Content Management" 
                      primaryTypographyProps={{ 
                        fontWeight: isActive('/admin/content') ? 700 : 500,
                        fontSize: '0.9rem',
                        color: isActive('/admin/content') ? ADMIN_COLORS.primary : (darkMode ? '#F1F5F9' : '#334155'),
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    {contentOpen ? 
                      <ExpandLess sx={{ color: ADMIN_COLORS.primary }} /> : 
                      <ExpandMore sx={{ color: ADMIN_COLORS.primary }} />
                    }
                  </>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          <Collapse in={open && contentOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {contentMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                    href={item.path}
                sx={{ 
                      pl: 5, 
                      py: 1, 
                      mx: 1, 
                      borderRadius: '8px',
                  minHeight: 40,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: isActive(item.path) 
                        ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.primary, 0.15)} 0%, ${alpha(ADMIN_COLORS.primary, 0.1)} 100%)`
                    : 'transparent',
                      border: isActive(item.path) 
                        ? `1px solid ${alpha(ADMIN_COLORS.primary, 0.3)}`
                        : `1px solid transparent`,
                  '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.primary, 0.1)} 0%, ${alpha(ADMIN_COLORS.primary, 0.05)} 100%)`,
                        transform: 'translateX(4px)',
                        border: `1px solid ${alpha(ADMIN_COLORS.primary, 0.2)}`,
                        boxShadow: `0 4px 20px ${alpha(ADMIN_COLORS.primary, 0.2)}`
                      }
                    }}
                  >
                    <ListItemIcon 
                sx={{ 
                        minWidth: 30, 
                        color: isActive(item.path) ? ADMIN_COLORS.primary : (darkMode ? '#94A3B8' : '#64748B'),
                        '& .MuiSvgIcon-root': {
                          filter: isActive(item.path) ? `drop-shadow(0 0 8px ${alpha(ADMIN_COLORS.primary, 0.6)})` : 'none'
                        }
                      }}
                    >
                      <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                      primary={item.title}
                  primaryTypographyProps={{ 
                        fontSize: '0.8rem',
                        fontWeight: isActive(item.path) ? 700 : 500,
                        color: isActive(item.path) ? ADMIN_COLORS.primary : (darkMode ? '#F1F5F9' : '#334155'),
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                  }}
                />
              </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {/* AI Generation with Submenu */}
          <ListItem disablePadding>
            <Tooltip title={open ? "" : "AI Generation"} placement="right">
              <ListItemButton
                onClick={handleAIClick}
                sx={{
                  minHeight: 52,
                  margin: '4px 0',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: isActive('/admin/generate')
                    ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.premium, 0.15)} 0%, ${alpha(ADMIN_COLORS.premium, 0.1)} 100%)`
                    : 'transparent',
                  border: isActive('/admin/generate') 
                    ? `1px solid ${alpha(ADMIN_COLORS.premium, 0.3)}`
                    : `1px solid transparent`,
                  px: open ? 2 : 1.5,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.premium, 0.1)} 0%, ${alpha(ADMIN_COLORS.premium, 0.05)} 100%)`,
                    transform: 'translateX(4px)',
                    border: `1px solid ${alpha(ADMIN_COLORS.premium, 0.2)}`,
                    boxShadow: `0 4px 20px ${alpha(ADMIN_COLORS.premium, 0.2)}`
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    marginRight: '16px',
                    justifyContent: 'center',
                    color: isActive('/admin/generate') ? ADMIN_COLORS.premium : (darkMode ? '#94A3B8' : '#64748B'),
                    transition: 'all 0.3s ease',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.4rem',
                      filter: isActive('/admin/generate') ? `drop-shadow(0 0 8px ${alpha(ADMIN_COLORS.premium, 0.6)})` : 'none'
                    }
                  }}
                >
                  <Badge badgeContent={<AutoAwesomeIcon sx={{ fontSize: 12 }} />} color="secondary">
                  <AIIcon />
                  </Badge>
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText 
                      primary="AI Generation" 
                      primaryTypographyProps={{ 
                        fontWeight: isActive('/admin/generate') ? 700 : 500,
                        fontSize: '0.9rem',
                        color: isActive('/admin/generate') ? ADMIN_COLORS.premium : (darkMode ? '#F1F5F9' : '#334155'),
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    {aiOpen ? 
                      <ExpandLess sx={{ color: ADMIN_COLORS.premium }} /> : 
                      <ExpandMore sx={{ color: ADMIN_COLORS.premium }} />
                    }
                  </>
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          
          <Collapse in={open && aiOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {aiMenuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                    href={item.path}
                sx={{ 
                      pl: 5, 
                      py: 1, 
                      mx: 1, 
                      borderRadius: '8px',
                  minHeight: 40,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: isActive(item.path) 
                        ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.premium, 0.15)} 0%, ${alpha(ADMIN_COLORS.premium, 0.1)} 100%)`
                    : 'transparent',
                      border: isActive(item.path) 
                        ? `1px solid ${alpha(ADMIN_COLORS.premium, 0.3)}`
                        : `1px solid transparent`,
                  '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.premium, 0.1)} 0%, ${alpha(ADMIN_COLORS.premium, 0.05)} 100%)`,
                        transform: 'translateX(4px)',
                        border: `1px solid ${alpha(ADMIN_COLORS.premium, 0.2)}`,
                        boxShadow: `0 4px 20px ${alpha(ADMIN_COLORS.premium, 0.2)}`
                      }
                    }}
                  >
                    <ListItemIcon 
                sx={{ 
                        minWidth: 30, 
                        color: isActive(item.path) ? ADMIN_COLORS.premium : (darkMode ? '#94A3B8' : '#64748B'),
                        '& .MuiSvgIcon-root': {
                          filter: isActive(item.path) ? `drop-shadow(0 0 8px ${alpha(ADMIN_COLORS.premium, 0.6)})` : 'none'
                        }
                      }}
                    >
                      <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                      primary={item.title}
                  primaryTypographyProps={{ 
                        fontSize: '0.8rem',
                        fontWeight: isActive(item.path) ? 700 : 500,
                        color: isActive(item.path) ? ADMIN_COLORS.premium : (darkMode ? '#F1F5F9' : '#334155'),
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                  }}
                />
              </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>
      
      {/* Footer Section */}
      <Box 
                sx={{
          padding: '20px',
          borderTop: `1px solid ${alpha(ADMIN_COLORS.primary, 0.1)}`,
          background: darkMode 
            ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.dark, 0.9)} 0%, ${alpha(ADMIN_COLORS.surface, 0.7)} 100%)`
            : `linear-gradient(135deg, ${alpha(ADMIN_COLORS.primary, 0.03)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`
        }}
      >
        {open && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: '12px',
              background: darkMode
                ? `linear-gradient(135deg, ${alpha(ADMIN_COLORS.surface, 0.6)} 0%, ${alpha(ADMIN_COLORS.dark, 0.4)} 100%)`
                : `linear-gradient(135deg, ${alpha('#FFFFFF', 0.8)} 0%, ${alpha(ADMIN_COLORS.primary, 0.05)} 100%)`,
              border: `1px solid ${alpha(ADMIN_COLORS.primary, 0.1)}`,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              {darkMode ? 
                <LightModeIcon sx={{ color: ADMIN_COLORS.warning }} /> : 
                <DarkModeIcon sx={{ color: ADMIN_COLORS.info }} />
              }
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  fontFamily: 'monospace',
                  color: darkMode ? '#F1F5F9' : '#334155'
                }}
              >
                {darkMode ? 'LIGHT MODE' : 'DARK MODE'}
              </Typography>
            </Box>
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              sx={{
                '& .MuiSwitch-thumb': {
                  background: darkMode ? ADMIN_COLORS.gradients.warning : ADMIN_COLORS.gradients.info
                },
                '& .MuiSwitch-track': {
                  background: alpha(darkMode ? ADMIN_COLORS.warning : ADMIN_COLORS.info, 0.3)
                }
              }}
            />
          </Box>
        )}
        
        <Tooltip title={open ? "Sign Out" : "Logout"} placement={open ? "top" : "right"}>
          <ListItemButton
            onClick={handleLogout}
            sx={{ 
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.secondary, 0.1)} 0%, ${alpha('#EF4444', 0.1)} 100%)`,
              border: `1px solid ${alpha(ADMIN_COLORS.secondary, 0.2)}`,
              color: ADMIN_COLORS.secondary,
              transition: 'all 0.3s ease',
              justifyContent: open ? 'flex-start' : 'center',
              px: open ? 2 : 1.5,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(ADMIN_COLORS.secondary, 0.2)} 0%, ${alpha('#EF4444', 0.2)} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(ADMIN_COLORS.secondary, 0.3)}`
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 0, 
              mr: open ? 2 : 'auto', 
              color: ADMIN_COLORS.secondary,
              justifyContent: 'center',
            }}>
              <LogoutIcon />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="LOGOUT" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  color: ADMIN_COLORS.secondary,
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px'
                }} 
              />
            )}
          </ListItemButton>
        </Tooltip>
        
        {open && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography 
            variant="caption" 
            sx={{ 
                color: alpha(darkMode ? '#F1F5F9' : '#64748B', 0.7),
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                letterSpacing: '1px'
              }}
            >
              WISENTIA ADMIN v2.0
          </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1}>
              <SpeedIcon sx={{ fontSize: 12, color: ADMIN_COLORS.accent }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: ADMIN_COLORS.accent,
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  fontWeight: 600
                }}
              >
                QUANTUM INTERFACE
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: open ? drawerWidth : closedDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : closedDrawerWidth,
            overflowX: 'hidden',
            border: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: darkMode 
              ? 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
              : 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode
              ? '0 0 50px rgba(0, 245, 255, 0.1), inset 1px 0 1px rgba(0, 245, 255, 0.2)'
              : '0 0 30px rgba(0, 0, 0, 0.1), inset 1px 0 1px rgba(0, 245, 255, 0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: darkMode
                ? 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2300F5FF" fill-opacity="0.02"%3E%3Cpath d="M20 20L0 0h40v40z"/%3E%3C/g%3E%3C/svg%3E")'
                : 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2300F5FF" fill-opacity="0.05"%3E%3Cpath d="M20 20L0 0h40v40z"/%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3,
              zIndex: 0
            }
          }
        }}
        open={open}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: darkMode 
              ? 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
              : 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)',
            backdropFilter: 'blur(20px)'
          }
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
          overflow: 'auto',
          background: darkMode 
            ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminSidebar;