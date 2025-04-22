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
  Divider,
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
  Circle as CircleIcon
} from '@mui/icons-material';

// Drawer width
const drawerWidth = 240;
const closedDrawerWidth = 64;

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
  const { user, logout } = useAuth();
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
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Drawer content
  const drawerContent = (
    <>
      {/* Logo Header with gradient */}
      <Box 
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          px: open ? 2 : 1,
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          background: darkMode 
            ? 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)' 
            : 'linear-gradient(135deg, #6A82FB 0%, #FC5C7D 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        {open ? (
          <>
            <Typography 
              variant="h6" 
              component={Link}
              href="/admin/dashboard"
              sx={{ 
                fontWeight: 800, 
                color: 'white',
                textDecoration: 'none',
                letterSpacing: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              WISENTIA
            </Typography>
            <IconButton
              onClick={handleDrawerToggle}
              size="small"
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.12)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                },
                width: 28,
                height: 28
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'white',
              width: 40,
              height: 40,
              mx: 'auto'
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>
      
      {/* User Profile Section */}
      {open && (
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          background: darkMode 
            ? 'linear-gradient(180deg, rgba(142, 45, 226, 0.4) 0%, rgba(74, 0, 224, 0.2) 100%)' 
            : 'linear-gradient(180deg, rgba(106, 130, 251, 0.08) 0%, rgba(252, 92, 125, 0.04) 100%)'
        }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 1.5, 
              borderRadius: 2,
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(106, 130, 251, 0.06)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease'
            }}
          >
            <Avatar 
              sx={{ 
                width: 42, 
                height: 42, 
                background: darkMode 
                  ? 'linear-gradient(135deg, #FC5C7D 0%, #FF2D78 100%)' 
                  : 'linear-gradient(135deg, #6A82FB 0%, #0042DB 100%)', 
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
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
      
      {/* Navigation Menu with gradient background */}
      <Box 
        sx={{ 
          py: 2, 
          px: 1.5,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: darkMode 
            ? 'linear-gradient(180deg, rgba(74, 0, 224, 0.95) 0%, rgba(142, 45, 226, 0.4) 100%)' 
            : 'linear-gradient(180deg, rgba(106, 130, 251, 0.1) 0%, rgba(252, 92, 125, 0.05) 100%)',
          '&::-webkit-scrollbar': {
            width: '5px',
            height: '5px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
          },
        }}
      >
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
                  borderRadius: 2,
                  bgcolor: isActive('/admin/dashboard') 
                    ? (darkMode ? 'rgba(142, 45, 226, 0.3)' : 'rgba(106, 130, 251, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/dashboard') 
                      ? (darkMode ? 'rgba(142, 45, 226, 0.4)' : 'rgba(106, 130, 251, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/dashboard') 
                      ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                      : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                  }}
                >
                  <DashboardIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="Dashboard" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/dashboard') ? 600 : 400,
                      color: isActive('/admin/dashboard') 
                        ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                        : (darkMode ? 'white' : 'text.primary')
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
                  borderRadius: 2,
                  bgcolor: isActive('/admin/users') 
                    ? (darkMode ? 'rgba(142, 45, 226, 0.3)' : 'rgba(106, 130, 251, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/users') 
                      ? (darkMode ? 'rgba(142, 45, 226, 0.4)' : 'rgba(106, 130, 251, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/users') 
                      ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                      : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                  }}
                >
                  <PeopleIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="User Management" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/users') ? 600 : 400,
                      color: isActive('/admin/users') 
                        ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                        : (darkMode ? 'white' : 'text.primary')
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
                  borderRadius: 2,
                  bgcolor: isActive('/admin/content') 
                    ? (darkMode ? 'rgba(142, 45, 226, 0.3)' : 'rgba(106, 130, 251, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/content') 
                      ? (darkMode ? 'rgba(142, 45, 226, 0.4)' : 'rgba(106, 130, 251, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/content') 
                      ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                      : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
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
                        color: isActive('/admin/content') 
                          ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                          : (darkMode ? 'white' : 'text.primary')
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
                  mx: 1.5,
                  bgcolor: isActive('/admin/content/courses') 
                    ? (darkMode ? 'rgba(142, 45, 226, 0.3)' : 'rgba(106, 130, 251, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/content/courses') 
                      ? (darkMode ? 'rgba(142, 45, 226, 0.4)' : 'rgba(106, 130, 251, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/courses') 
                    ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                    : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                }}>
                  <SchoolIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Courses" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/courses') ? 600 : 400,
                    color: isActive('/admin/content/courses') 
                      ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                      : (darkMode ? 'white' : 'text.primary')
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
                  mx: 1.5,
                  bgcolor: isActive('/admin/content/quests') 
                    ? (darkMode ? 'rgba(142, 45, 226, 0.3)' : 'rgba(106, 130, 251, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/content/quests') 
                      ? (darkMode ? 'rgba(142, 45, 226, 0.4)' : 'rgba(106, 130, 251, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/quests') 
                    ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                    : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                }}>
                  <QuestIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quests" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/quests') ? 600 : 400,
                    color: isActive('/admin/content/quests') 
                      ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                      : (darkMode ? 'white' : 'text.primary')
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
                  mx: 1.5,
                  bgcolor: isActive('/admin/content/nfts') 
                    ? (darkMode ? 'rgba(142, 45, 226, 0.3)' : 'rgba(106, 130, 251, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/content/nfts') 
                      ? (darkMode ? 'rgba(142, 45, 226, 0.4)' : 'rgba(106, 130, 251, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/nfts') 
                    ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                    : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                }}>
                  <NFTIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="NFTs" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/nfts') ? 600 : 400,
                    color: isActive('/admin/content/nfts') 
                      ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                      : (darkMode ? 'white' : 'text.primary')
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
                  mx: 1.5,
                  bgcolor: isActive('/admin/content/community') 
                    ? (darkMode ? 'rgba(142, 45, 226, 0.3)' : 'rgba(106, 130, 251, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/content/community') 
                      ? (darkMode ? 'rgba(142, 45, 226, 0.4)' : 'rgba(106, 130, 251, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/content/community') 
                    ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                    : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                }}>
                  <ForumIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Community Content" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/content/community') ? 600 : 400,
                    color: isActive('/admin/content/community') 
                      ? (darkMode ? '#E9B8FF' : '#6A82FB') 
                      : (darkMode ? 'white' : 'text.primary')
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
                  borderRadius: 2,
                  bgcolor: isActive('/admin/generate') 
                    ? (darkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(156, 39, 176, 0.2)') 
                    : 'transparent',
                  background: isActive('/admin/generate')
                    ? (darkMode 
                      ? 'linear-gradient(90deg, rgba(156, 39, 176, 0.3) 0%, rgba(123, 31, 162, 0.3) 100%)'
                      : 'linear-gradient(90deg, rgba(156, 39, 176, 0.2) 0%, rgba(123, 31, 162, 0.2) 100%)')
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/generate') 
                      ? (darkMode ? 'rgba(156, 39, 176, 0.4)' : 'rgba(156, 39, 176, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/generate') 
                      ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                      : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
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
                        color: isActive('/admin/generate') 
                          ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                          : (darkMode ? 'white' : 'text.primary')
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
                  mx: 1.5,
                  bgcolor: isActive('/admin/generate-quest') 
                    ? (darkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(156, 39, 176, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/generate-quest') 
                      ? (darkMode ? 'rgba(156, 39, 176, 0.4)' : 'rgba(156, 39, 176, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/generate-quest') 
                    ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                    : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                }}>
                  <QuestIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generate Quest" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/generate-quest') ? 600 : 400,
                    color: isActive('/admin/generate-quest') 
                      ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                      : (darkMode ? 'white' : 'text.primary')
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
                  mx: 1.5,
                  bgcolor: isActive('/admin/generate-quiz') 
                    ? (darkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(156, 39, 176, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/generate-quiz') 
                      ? (darkMode ? 'rgba(156, 39, 176, 0.4)' : 'rgba(156, 39, 176, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/generate-quiz') 
                    ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                    : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                }}>
                  <SchoolIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Generate Quiz" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/generate-quiz') ? 600 : 400,
                    color: isActive('/admin/generate-quiz') 
                      ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                      : (darkMode ? 'white' : 'text.primary')
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
                  mx: 1.5,
                  bgcolor: isActive('/admin/pending-content') 
                    ? (darkMode ? 'rgba(156, 39, 176, 0.3)' : 'rgba(156, 39, 176, 0.2)') 
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/pending-content') 
                      ? (darkMode ? 'rgba(156, 39, 176, 0.4)' : 'rgba(156, 39, 176, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 36, 
                  color: isActive('/admin/pending-content') 
                    ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                    : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                }}>
                  <ContentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Pending Content" 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem',
                    fontWeight: isActive('/admin/pending-content') ? 600 : 400,
                    color: isActive('/admin/pending-content') 
                      ? (darkMode ? '#E9B0FF' : '#9c27b0') 
                      : (darkMode ? 'white' : 'text.primary')
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
                  borderRadius: 2,
                  bgcolor: isActive('/admin/subscriptions') 
                    ? (darkMode ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)') 
                    : 'transparent',
                  background: isActive('/admin/subscriptions')
                    ? (darkMode 
                      ? 'linear-gradient(90deg, rgba(244, 67, 54, 0.3) 0%, rgba(229, 57, 53, 0.3) 100%)'
                      : 'linear-gradient(90deg, rgba(244, 67, 54, 0.2) 0%, rgba(229, 57, 53, 0.2) 100%)')
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/subscriptions') 
                      ? (darkMode ? 'rgba(244, 67, 54, 0.4)' : 'rgba(244, 67, 54, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/subscriptions') 
                      ? (darkMode ? '#FFA5A0' : '#f44336') 
                      : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                  }}
                >
                  <SubscriptionIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="Subscriptions" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/subscriptions') ? 600 : 400,
                      color: isActive('/admin/subscriptions') 
                        ? (darkMode ? '#FFA5A0' : '#f44336') 
                        : (darkMode ? 'white' : 'text.primary')
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
                  borderRadius: 2,
                  bgcolor: isActive('/admin/analytics') 
                    ? (darkMode ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)') 
                    : 'transparent',
                  background: isActive('/admin/analytics')
                    ? (darkMode 
                      ? 'linear-gradient(90deg, rgba(255, 152, 0, 0.3) 0%, rgba(251, 140, 0, 0.3) 100%)'
                      : 'linear-gradient(90deg, rgba(255, 152, 0, 0.2) 0%, rgba(251, 140, 0, 0.2) 100%)')
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/analytics') 
                      ? (darkMode ? 'rgba(255, 152, 0, 0.4)' : 'rgba(255, 152, 0, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/analytics') 
                      ? (darkMode ? '#FFD180' : '#ff9800') 
                      : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                  }}
                >
                  <AnalyticsIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="Analytics" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/analytics') ? 600 : 400,
                      color: isActive('/admin/analytics') 
                        ? (darkMode ? '#FFD180' : '#ff9800') 
                        : (darkMode ? 'white' : 'text.primary')
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
                  borderRadius: 2,
                  bgcolor: isActive('/admin/system-health') 
                    ? (darkMode ? 'rgba(96, 125, 139, 0.3)' : 'rgba(96, 125, 139, 0.2)') 
                    : 'transparent',
                  background: isActive('/admin/system-health')
                    ? (darkMode 
                      ? 'linear-gradient(90deg, rgba(96, 125, 139, 0.3) 0%, rgba(84, 110, 122, 0.3) 100%)'
                      : 'linear-gradient(90deg, rgba(96, 125, 139, 0.2) 0%, rgba(84, 110, 122, 0.2) 100%)')
                    : 'transparent',
                  '&:hover': {
                    bgcolor: isActive('/admin/system-health') 
                      ? (darkMode ? 'rgba(96, 125, 139, 0.4)' : 'rgba(96, 125, 139, 0.3)') 
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)')
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive('/admin/system-health') 
                      ? (darkMode ? '#CFD8DC' : '#607d8b') 
                      : (darkMode ? 'white' : 'rgba(0, 0, 0, 0.65)'),
                  }}
                >
                  <SystemHealthIcon />
                </ListItemIcon>
                {open && (
                  <ListItemText 
                    primary="System Health" 
                    primaryTypographyProps={{ 
                      fontWeight: isActive('/admin/system-health') ? 600 : 400,
                      color: isActive('/admin/system-health') 
                        ? (darkMode ? '#CFD8DC' : '#607d8b') 
                        : (darkMode ? 'white' : 'text.primary')
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>
      
      {/* Theme Toggle & Logout */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        background: darkMode 
          ? 'linear-gradient(0deg, rgba(142, 45, 226, 0.3) 0%, rgba(74, 0, 224, 0.15) 100%)' 
          : 'linear-gradient(0deg, rgba(106, 130, 251, 0.06) 0%, rgba(252, 92, 125, 0.03) 100%)'
      }}>
        {open && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {darkMode ? 
                <LightModeIcon sx={{ color: '#ffa726', mr: 1.5 }} /> : 
                <DarkModeIcon sx={{ color: '#4e54c8', mr: 1.5 }} />
              }
              <Typography variant="body2" fontWeight={500} color={darkMode ? 'white' : 'text.primary'}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </Typography>
            </Box>
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color={darkMode ? "warning" : "primary"}
              size="small"
            />
          </Box>
        )}
        
        <Tooltip title={open ? "Logout" : "Logout"} placement={open ? "top" : "right"}>
          <ListItemButton
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              justifyContent: open ? 'flex-start' : 'center',
              minHeight: 42,
              color: '#f44336',
              bgcolor: darkMode ? 'rgba(244, 67, 54, 0.08)' : 'rgba(244, 67, 54, 0.04)',
              '&:hover': {
                bgcolor: darkMode ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 0, 
              mr: open ? 2 : 'auto', 
              color: '#f44336',
              justifyContent: 'center',
            }}>
              <LogoutIcon />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  color: '#f44336'
                }} 
              />
            )}
          </ListItemButton>
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

  return (
    <>
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
            transition: 'width 0.25s ease-in-out',
            background: darkMode ? '#121212' : '#ffffff',
            boxShadow: darkMode ? '0 0 10px rgba(0,0,0,0.5)' : '0 0 10px rgba(0,0,0,0.1)',
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
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: darkMode ? '#121212' : '#ffffff',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content - Adjustments to fix gaps */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          position: 'relative',
          // Make content fill exactly the remaining space
          width: { 
            xs: '100%', 
            md: `calc(100% - ${open ? drawerWidth : closedDrawerWidth}px)` 
          },
          marginLeft: { 
            xs: 0, 
            md: `${open ? drawerWidth : closedDrawerWidth}px` 
          },
          transition: 'margin-left 0.25s ease-in-out, width 0.25s ease-in-out',
          minHeight: '100vh',
          bgcolor: darkMode ? '#1a1a2e' : '#f7f7f7',
          padding: 0,
          // Fix for content overflowing
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default AdminSidebar;