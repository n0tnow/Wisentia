'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  useMediaQuery,
  useTheme,
  Container,
  Badge,
  Tooltip,
  alpha,
  Divider,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton
} from '@mui/material';
import { useTheme as useCustomTheme } from '@/contexts/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TokenIcon from '@mui/icons-material/Token';
import ForumIcon from '@mui/icons-material/Forum';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header({ isLandingPage = false }) {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [navAnchor, setNavAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAuthenticated } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we're scrolling up or down
      if (currentScrollY > lastScrollY.current) {
        setVisible(false); // Scrolling down
      } else {
        setVisible(true); // Scrolling up
      }
      
      // Just to track if we've scrolled at all (for visual changes if needed)
      setScrolled(currentScrollY > 20);
      
      // Update the scroll position
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNavMenu = (event) => {
    setNavAnchor(event.currentTarget);
  };

  const handleNavClose = () => {
    setNavAnchor(null);
  };
  
  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const navItems = [
    { text: 'Courses', icon: <SchoolIcon />, path: '/courses' },
    { text: 'Quests', icon: <AssignmentIcon />, path: '/quests' },
    { text: 'NFTs', icon: <TokenIcon />, path: '/nfts' },
    { text: 'Community', icon: <ForumIcon />, path: '/community' },
  ];

  // Star sparkle animation component
  const StarSparkles = () => {
    // Generate random stars that will twinkle
    const stars = [...Array(20)].map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 1 + Math.random() * 3,
      intensity: 0.3 + Math.random() * 0.7
    }));

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {stars.map((star) => (
        <Box
          key={star.id}
          sx={{
            position: 'absolute',
            width: star.size,
            height: star.size,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: star.top,
            left: star.left,
            opacity: 0,
            boxShadow: '0 0 5px 1px rgba(255,255,255,0.5)',
            animation: `buttonStar ${star.duration}s ${star.delay}s infinite`,
            '@keyframes buttonStar': {
              '0%': { 
                opacity: 0,
                transform: 'translateY(0) scale(0)'
              },
              '50%': { 
                opacity: 0.8,
                transform: 'translateY(-5px) scale(1.2)'
              },
              '100%': { 
                opacity: 0,
                transform: 'translateY(-10px) scale(0)'
              }
            }
          }}
        />
      ))}
    </Box>
  );
};

  // Button hover stars effect
  const ButtonStars = () => {
    // Generate random stars that will appear when hovering over sign up button
    const stars = [...Array(10)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 0.5,
      duration: 0.5 + Math.random() * 1
    }));

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          '.MuiButton-root:hover &': {
            opacity: 1
          }
        }}
      >
        {stars.map((star) => (
          <Box
            key={star.id}
            sx={{
              position: 'absolute',
              width: star.size,
              height: star.size,
              backgroundColor: 'white',
              borderRadius: '50%',
              top: star.top,
              left: star.left,
              opacity: 0,
              boxShadow: '0 0 5px 1px rgba(255,255,255,0.5)',
              animation: `buttonStar ${star.duration}s ${star.delay}s infinite`,
              '@keyframes buttonStar': {
                '0%': { 
                  opacity: 0,
                  transform: 'translateY(0) scale(0)'
                },
                '50%': { 
                  opacity: 0.8,
                  transform: 'translateY(-5px) scale(1.2)'
                },
                '100%': { 
                  opacity: 0,
                  transform: 'translateY(-10px) scale(0)'
                }
              }
            }}
          />
        ))}
      </Box>
    );
  };

  // Drawer content for mobile menu
  const mobileDrawer = (
    <Drawer
      variant="temporary"
      open={mobileDrawerOpen}
      onClose={handleMobileDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 280,
          background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          boxSizing: 'border-box' 
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          variant="h5"
          component={Link}
          href="/"
          onClick={handleMobileDrawerToggle}
          sx={{
            fontWeight: 800,
            color: 'white',
            textDecoration: 'none',
            textShadow: '0 0 10px rgba(255,255,255,0.3)',
          }}
        >
          WISENTIA
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      {isAuthenticated && (
        <Box sx={{ p: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Avatar 
              sx={{ 
                mr: 2, 
                border: '2px solid white'
              }} 
              alt={user?.Username || 'User'} 
              src={user?.profileImage}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.FirstName || user?.username}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Level {user?.Level || 1}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      <List sx={{ px: 1 }}>
        {navItems.map((item, index) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              onClick={handleMobileDrawerToggle}
              sx={{ 
                my: 0.5, 
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(5px)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
      
      <List>
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/profile"
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/wallet"
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <AccountBalanceWalletIcon />
                </ListItemIcon>
                <ListItemText primary="Wallet" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/dashboard"
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  handleLogout();
                  handleMobileDrawerToggle();
                }}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/login"
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/register"
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'all 0.3s ease-in-out',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          backdropFilter: 'blur(10px)',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          borderBottom: scrolled 
            ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}` 
            : 'none',
          boxShadow: scrolled 
            ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}` 
            : 'none',
          '& .MuiToolbar-root': {
            // This ensures text is readable in both dark and light modes
            color: isDarkMode ? '#fff' : '#fff', 
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -15,
            left: 0,
            width: '100%',
            height: 15,
            background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ position: 'relative' }}>
            <StarSparkles />
            
            {/* Logo - clean, pure text with self-contained animation */}
            <Box
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: 3
              }}
            >
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography 
                  variant="h5" 
                  component="div" 
                  sx={{ 
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    position: 'relative',
                    color: '#FFFFFF', // Solid white for best visibility in both themes
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                      backgroundSize: '200% 100%', 
                      opacity: 0,
                      transform: 'translateX(-100%)',
                      transition: 'all 0.6s ease',
                      pointerEvents: 'none',
                    },
                    '&:hover::after': {
                      opacity: 1,
                      transform: 'translateX(100%)',
                    },
                  }}
                >
                  WISENTIA
                </Typography>
              </Link>
            </Box>
            
            {/* Mobile menu icon */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            {/* Desktop Navigation - centered */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' }, 
                justifyContent: 'center'
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  sx={{
                    mx: 1.5, // Increased spacing for better centering
                    py: 0.75,
                    px: 2,
                    color: '#fff',
                    fontSize: '0.95rem',
                    position: 'relative',
                    overflow: 'hidden',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '0',
                      height: '2px',
                      bottom: '0',
                      left: '0',
                      backgroundColor: '#fff',
                      transition: 'width 0.3s ease-in-out',
                    },
                    '&:hover::after': {
                      width: '100%',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        mr: 0.5, 
                        display: 'flex', 
                        color: '#fff'
                      }}
                    >
                      {item.icon}
                    </Box>
                    {item.text}
                  </Box>
                </Button>
              ))}
            </Box>
            
            {/* Actions (Theme Switch & Auth) */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Theme Toggle Button - New and Cleaner */}
              <IconButton
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                sx={{
                  width: 36,
                  height: 36,
                  p: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  }
                }}
              >
                {isDarkMode ? (
                  <LightModeIcon sx={{ color: '#FFFFFF' }} />
                ) : (
                  <DarkModeIcon sx={{ color: '#FFFFFF' }} />
                )}
              </IconButton>
              
              {/* Notifications - only visible when authenticated */}
              {isAuthenticated && !isMobile && (
                <Box sx={{ ml: 1 }}>
                  <Tooltip title="Notifications">
                    <IconButton 
                      color="inherit" 
                      onClick={handleNotificationClick}
                      sx={{ 
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.25)',
                        }
                      }}
                    >
                      <Badge badgeContent={3} color="error">
                        <NotificationsIcon sx={{ color: '#fff' }} />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              {/* User Account or Auth Buttons */}
              <Box sx={{ ml: 1 }}>
                {isAuthenticated ? (
                  <>
                    <IconButton
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      sx={{ 
                        ml: 1,
                        border: '2px solid rgba(255,255,255,0.3)',
                        padding: '4px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(255,255,255,0.8)',
                        }
                      }}
                    >
                      <Avatar 
                        alt={user?.username} 
                        src={user?.profileImage} 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      />
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        elevation: 3,
                        sx: {
                          mt: 1.5,
                          overflow: 'visible',
                          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                          minWidth: 220,
                          borderRadius: 2,
                          '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          alt={user?.username} 
                          src={user?.profileImage} 
                          sx={{ 
                            width: 40, 
                            height: 40,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }}
                        />
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">{user?.username || 'User'}</Typography>
                          <Typography variant="body2" color="text.secondary">Level 12 • 1240 XP</Typography>
                        </Box>
                      </Box>
                      <Divider />
                      <MenuItem onClick={() => { router.push('/profile'); handleClose(); }}>
                        <ListItemIcon>
                          <AccountCircleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                      </MenuItem>
                      <MenuItem onClick={() => { router.push('/wallet'); handleClose(); }}>
                        <ListItemIcon>
                          <AccountBalanceWalletIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Wallet" />
                      </MenuItem>
                      <MenuItem onClick={() => { router.push('/dashboard'); handleClose(); }}>
                        <ListItemIcon>
                          <DashboardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                      </MenuItem>
                      <MenuItem onClick={() => { router.push('/settings'); handleClose(); }}>
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                      </MenuItem>
                      {user?.role === 'admin' && (
                        <MenuItem onClick={() => { router.push('/admin'); handleClose(); }}>
                          <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Admin Panel" />
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Box sx={{ display: 'flex' }}>
                    <Button 
                      color="inherit" 
                      onClick={() => router.push('/login')} 
                      sx={{ 
                        ml: 1,
                        color: '#fff',
                        fontWeight: 500,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          width: '0',
                          height: '2px',
                          bottom: '0',
                          left: '0',
                          backgroundColor: '#fff',
                          transition: 'width 0.3s ease-in-out',
                        },
                        '&:hover::after': {
                          width: '100%',
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={() => router.push('/register')}
                      sx={{ 
                        ml: 1,
                        borderRadius: '10px',
                        px: 2,
                        py: 0.8,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 500,
                        border: '1px solid rgba(255,255,255,0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <ButtonStars />
                      Sign Up
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Drawer */}
      {mobileDrawer}
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            width: 320,
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold">Notifications</Typography>
        </Box>
        <Divider />
        <MenuItem sx={{ py: 2 }}>
          <Box>
            <Typography variant="subtitle2">You earned a new NFT!</Typography>
            <Typography variant="body2" color="text.secondary">Blockchain Basics course completed.</Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 2 }}>
          <Box>
            <Typography variant="subtitle2">New quest available</Typography>
            <Typography variant="body2" color="text.secondary">Smart Contract Challenge opened.</Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 2 }}>
          <Box>
            <Typography variant="subtitle2">Community response</Typography>
            <Typography variant="body2" color="text.secondary">Someone replied to your question.</Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Button size="small" sx={{ width: '100%' }}>View All</Button>
        </Box>
      </Menu>
    </>
  );
}