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

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'; // NextLink yerine Link kullanılmalı

// Quantum Education Theme Colors
const QUANTUM_COLORS = {
  primary: '#6366F1',     // Indigo - Bilgi ve teknoloji
  secondary: '#8B5CF6',   // Purple - Yaratıcılık ve öğrenme
  accent: '#06B6D4',      // Cyan - Taze ve modern
  success: '#10B981',     // Emerald - Başarı ve ilerleme
  warning: '#F59E0B',     // Amber - Dikkat ve önem
  error: '#EF4444',       // Red - Uyarı
  neon: '#00D4FF',        // Neon Blue - Enerji
  plasma: '#FF006E',      // Magenta - Dinamizm
  education: '#7C3AED',   // Deep Purple - Eğitim
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
    education: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 25%, #8B5CF6 50%, #06B6D4 75%, #10B981 100%)',
    hero: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 25%, #6366F1 50%, #8B5CF6 75%, #06B6D4 100%)',
    neon: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF006E 100%)',
    learning: 'linear-gradient(45deg, #10B981 0%, #06B6D4 25%, #6366F1 50%, #8B5CF6 75%, #7C3AED 100%)'
  },
  shadows: {
    neon: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)',
    education: '0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(99, 102, 241, 0.3)',
    glow: '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(139, 92, 246, 0.3)'
  }
};

export default function Header({ isLandingPage = false }) {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [navAnchor, setNavAnchor] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const userIsAuthenticated = !!user; // user varsa true, yoksa false

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
    // Use useRef for stars data with null initial value to prevent hydration mismatch
    const starsRef = useRef(null);
    const [isClient, setIsClient] = useState(false);
    
    // Client-side only initialization of random values
    useEffect(() => {
      setIsClient(true);
      starsRef.current = [...Array(20)].map((_, i) => ({
        id: i,
        size: Math.random() * 3 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 1 + Math.random() * 3,
        intensity: 0.3 + Math.random() * 0.7
      }));
    }, []);
    
    // Return empty placeholder during server-side rendering
    if (!isClient) {
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
        />
      );
    }
    
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
        {starsRef.current && starsRef.current.map((star) => (
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
    // Use useRef for stars data with null initial value to prevent hydration mismatch
    const starsRef = useRef(null);
    const [isClient, setIsClient] = useState(false);
    
    // Client-side only initialization of random values
    useEffect(() => {
      setIsClient(true);
      starsRef.current = [...Array(10)].map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 0.5,
        duration: 0.5 + Math.random() * 1
      }));
    }, []);
    
    // Return empty placeholder during server-side rendering
    if (!isClient) {
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
        />
      );
    }
  
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
        {starsRef.current && starsRef.current.map((star) => (
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
          background: QUANTUM_COLORS.gradients.education,
          color: 'white',
          boxSizing: 'border-box',
          backdropFilter: 'blur(20px)',
          boxShadow: QUANTUM_COLORS.shadows.education,
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
      
      {userIsAuthenticated && (
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
        {userIsAuthenticated ? (
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
          backdropFilter: 'blur(20px)',
          background: QUANTUM_COLORS.gradients.education,
          borderBottom: scrolled 
            ? `1px solid ${alpha(QUANTUM_COLORS.neon, 0.3)}` 
            : 'none',
          boxShadow: scrolled 
            ? QUANTUM_COLORS.shadows.education
            : QUANTUM_COLORS.shadows.glow,
          '& .MuiToolbar-root': {
            color: '#fff',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)
            `,
            animation: 'quantumPulse 6s ease-in-out infinite alternate',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -15,
            left: 0,
            width: '100%',
            height: 15,
            background: `linear-gradient(to bottom, ${alpha(QUANTUM_COLORS.education, 0.3)}, transparent)`,
            pointerEvents: 'none'
          },
          '@keyframes quantumPulse': {
            '0%': {
              opacity: 0.6,
              transform: 'scale(1)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1.02)',
            },
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ position: 'relative' }}>
            <StarSparkles />
            
            {/* Logo - Bold & Quantum Education Theme - Responsive */}
            <Box
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mr: { xs: 1, sm: 2, md: 3 },
                position: 'relative',
                zIndex: 1
              }}
            >
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography 
                  variant="h5" 
                  component="div" 
                  sx={{ 
                    fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
                    fontWeight: 800,
                    letterSpacing: { xs: 1, md: 1.5 },
                    fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #00D4FF 50%, #FFFFFF 100%)',
                    backgroundSize: '200% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    animation: 'logoShimmer 3s ease-in-out infinite',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #06B6D4 50%, #10B981 75%, #00D4FF 100%)',
                      backgroundSize: '300% 100%',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      transform: 'translateY(-2px) scale(1.02)',
                      animation: 'logoQuantumFlow 1.5s ease-in-out infinite',
                      textShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '0',
                      height: '3px',
                      bottom: -5,
                      left: '50%',
                      background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4, #10B981)',
                      transition: 'all 0.4s ease',
                      transform: 'translateX(-50%)',
                      borderRadius: '2px',
                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)',
                    },
                    '&:hover::after': {
                      width: '100%',
                    },
                    '@keyframes logoShimmer': {
                      '0%': {
                        backgroundPosition: '0% 50%',
                      },
                      '50%': {
                        backgroundPosition: '100% 50%',
                      },
                      '100%': {
                        backgroundPosition: '0% 50%',
                      },
                    },
                    '@keyframes logoQuantumFlow': {
                      '0%': {
                        backgroundPosition: '0% 50%',
                      },
                      '50%': {
                        backgroundPosition: '100% 50%',
                      },
                      '100%': {
                        backgroundPosition: '200% 50%',
                      },
                    },
                  }}
                >
                  WISENTIA
                </Typography>
              </Link>
            </Box>
            
            {/* Mobile menu icon - Better responsive positioning */}
            <Box sx={{ 
              flexGrow: 1, 
              display: { xs: 'flex', md: 'none' }, 
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileDrawerToggle}
                sx={{
                  mr: { xs: 0, sm: 1 },
                  width: { xs: 44, sm: 48 },
                  height: { xs: 44, sm: 48 },
                  borderRadius: '14px',
                  background: `linear-gradient(45deg, ${alpha(QUANTUM_COLORS.primary, 0.2)}, ${alpha(QUANTUM_COLORS.accent, 0.2)})`,
                  border: `1px solid ${alpha(QUANTUM_COLORS.neon, 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(QUANTUM_COLORS.neon, 0.3)}, ${alpha(QUANTUM_COLORS.primary, 0.3)})`,
                    transform: 'scale(1.05)',
                    boxShadow: `0 4px 15px ${alpha(QUANTUM_COLORS.neon, 0.3)}`,
                  }
                }}
              >
                <MenuIcon sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />
              </IconButton>
            </Box>
            
            {/* Desktop Navigation - Enhanced responsive design */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' }, 
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                px: { md: 1, lg: 2 }
              }}
            >
              {navItems.map((item, index) => (
                <Button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  sx={{
                    mx: { md: 1, lg: 1.5 },
                    py: 1,
                    px: { md: 2, lg: 3 },
                    color: '#fff',
                    fontSize: { md: '0.9rem', lg: '0.95rem' },
                    position: 'relative',
                    overflow: 'hidden',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: 'transparent',
                    border: 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'none',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${alpha(QUANTUM_COLORS.primary, 0.8)}, ${alpha(QUANTUM_COLORS.secondary, 0.8)})`,
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: `0 8px 25px ${alpha(QUANTUM_COLORS.neon, 0.4)}`,
                      border: `1px solid ${QUANTUM_COLORS.neon}`,
                      backdropFilter: 'blur(10px)',
                      '& .nav-icon': {
                        transform: 'rotate(10deg) scale(1.2)',
                        color: QUANTUM_COLORS.neon,
                      },
                      '&::before': {
                        opacity: 1,
                        transform: 'translateX(100%)',
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transform: 'translateX(-100%)',
                      transition: 'all 0.6s ease',
                      opacity: 0,
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: '50%',
                      width: '0',
                      height: '3px',
                      background: `linear-gradient(90deg, ${QUANTUM_COLORS.neon}, ${QUANTUM_COLORS.accent})`,
                      transform: 'translateX(-50%)',
                      borderRadius: '2px',
                      transition: 'width 0.4s ease',
                    },
                    '&:hover::after': {
                      width: '80%',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Box 
                      className="nav-icon"
                      sx={{ 
                        mr: { md: 0.5, lg: 1 }, 
                        display: { md: 'flex' },
                        transition: 'all 0.3s ease',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ display: { md: 'none', lg: 'block' } }}>
                      {item.text}
                    </Box>
                  </Box>
                </Button>
              ))}
            </Box>
            
            {/* Actions (Theme Switch & Auth) - Enhanced responsive design */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              position: 'relative', 
              zIndex: 1,
              gap: { xs: 0.5, sm: 1, md: 1.5 }
            }}>
              {/* Theme Toggle Button - Responsive sizing */}
              <IconButton
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                sx={{
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                  p: 0.5,
                  background: `linear-gradient(45deg, ${alpha(QUANTUM_COLORS.accent, 0.8)}, ${alpha(QUANTUM_COLORS.secondary, 0.8)})`,
                  borderRadius: '14px',
                  border: `2px solid ${alpha(QUANTUM_COLORS.neon, 0.3)}`,
                  boxShadow: QUANTUM_COLORS.shadows.glow,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${QUANTUM_COLORS.neon}, ${QUANTUM_COLORS.primary})`,
                    transform: 'translateY(-2px) rotate(10deg) scale(1.1)',
                    boxShadow: QUANTUM_COLORS.shadows.neon,
                    border: `2px solid ${QUANTUM_COLORS.neon}`,
                  }
                }}
              >
                {isDarkMode ? (
                  <LightModeIcon sx={{ 
                    color: '#FFFFFF',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }} />
                ) : (
                  <DarkModeIcon sx={{ 
                    color: '#FFFFFF',
                    fontSize: { xs: '1.2rem', sm: '1.4rem' }, 
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }} />
                )}
              </IconButton>
              
              {/* Notifications - Responsive visibility */}
              {userIsAuthenticated && (
                <Box sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  ml: { sm: 1, md: 2 }
                }}>
                  <Tooltip title="Learning Notifications" arrow>
                    <IconButton 
                      color="inherit" 
                      onClick={handleNotificationClick}
                      sx={{ 
                        width: { sm: 40, md: 44 },
                        height: { sm: 40, md: 44 },
                        borderRadius: '14px',
                        transition: 'all 0.4s ease',
                        background: `linear-gradient(45deg, ${alpha(QUANTUM_COLORS.warning, 0.7)}, ${alpha(QUANTUM_COLORS.error, 0.7)})`,
                        border: `2px solid ${alpha(QUANTUM_COLORS.warning, 0.3)}`,
                        boxShadow: `0 4px 15px ${alpha(QUANTUM_COLORS.warning, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${QUANTUM_COLORS.warning}, ${QUANTUM_COLORS.plasma})`,
                          transform: 'translateY(-2px) scale(1.1)',
                          boxShadow: `0 8px 25px ${alpha(QUANTUM_COLORS.warning, 0.5)}`,
                          border: `2px solid ${QUANTUM_COLORS.warning}`,
                        }
                      }}
                    >
                      <Badge 
                        badgeContent={3} 
                        sx={{
                          '& .MuiBadge-badge': {
                            background: `linear-gradient(45deg, ${QUANTUM_COLORS.plasma}, ${QUANTUM_COLORS.error})`,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: { sm: '0.7rem', md: '0.75rem' },
                            boxShadow: `0 2px 8px ${alpha(QUANTUM_COLORS.plasma, 0.5)}`
                          }
                        }}
                      >
                        <NotificationsIcon sx={{ 
                          color: '#fff',
                          fontSize: { sm: '1.2rem', md: '1.4rem' },
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }} />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              {/* User Account or Auth Buttons - Responsive design */}
              <Box sx={{ ml: { xs: 0.5, sm: 1 } }}>
                {userIsAuthenticated ? (
                  <>
                    <IconButton
                      size="large"
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={handleMenu}
                      sx={{ 
                        ml: { xs: 0.5, sm: 1 },
                        border: '2px solid rgba(255,255,255,0.3)',
                        padding: { xs: '3px', sm: '4px' },
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
                          width: { xs: 28, sm: 32 }, 
                          height: { xs: 28, sm: 32 },
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
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 0.5, sm: 1 },
                    flexDirection: { xs: 'row' },
                    alignItems: 'center'
                  }}>
                    <Button 
                      component={Link}
                      href="/login"
                      sx={{ 
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: '20px',
                        px: { xs: 2, sm: 2.5, md: 3 },
                        py: { xs: 0.8, sm: 1 },
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: `2px solid ${alpha(QUANTUM_COLORS.accent, 0.3)}`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        textTransform: 'none',
                        minWidth: { xs: 'auto', sm: 'auto' },
                        '&:hover': {
                          background: `linear-gradient(45deg, ${alpha(QUANTUM_COLORS.accent, 0.8)}, ${alpha(QUANTUM_COLORS.primary, 0.8)})`,
                          transform: 'translateY(-2px) scale(1.05)',
                          boxShadow: `0 8px 25px ${alpha(QUANTUM_COLORS.accent, 0.4)}`,
                          border: `2px solid ${QUANTUM_COLORS.accent}`,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -2,
                          left: '50%',
                          width: '0',
                          height: '3px',
                          background: `linear-gradient(90deg, ${QUANTUM_COLORS.accent}, ${QUANTUM_COLORS.neon})`,
                          transform: 'translateX(-50%)',
                          borderRadius: '2px',
                          transition: 'width 0.4s ease',
                        },
                        '&:hover::after': {
                          width: '80%',
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      component={Link}
                      href="/register"
                      sx={{ 
                        borderRadius: '20px',
                        px: { xs: 2, sm: 2.5, md: 3 },
                        py: { xs: 0.8, sm: 1 },
                        position: 'relative',
                        overflow: 'hidden',
                        background: `linear-gradient(45deg, ${QUANTUM_COLORS.success}, ${QUANTUM_COLORS.accent})`,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                        border: `2px solid ${alpha(QUANTUM_COLORS.success, 0.5)}`,
                        boxShadow: `0 4px 15px ${alpha(QUANTUM_COLORS.success, 0.3)}`,
                        textTransform: 'none',
                        minWidth: { xs: 'auto', sm: 'auto' },
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${QUANTUM_COLORS.neon}, ${QUANTUM_COLORS.plasma})`,
                          transform: 'translateY(-3px) scale(1.08)',
                          boxShadow: `0 12px 30px ${alpha(QUANTUM_COLORS.neon, 0.5)}`,
                          border: `2px solid ${QUANTUM_COLORS.neon}`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                          transform: 'translateX(-100%)',
                          transition: 'all 0.6s ease',
                          opacity: 0,
                        },
                        '&:hover::before': {
                          opacity: 1,
                          transform: 'translateX(100%)',
                        }
                      }}
                    >
                      <ButtonStars />
                      <Box sx={{ 
                        position: 'relative', 
                        zIndex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 0.3, sm: 0.5 }
                      }}>
                        <SchoolIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                          Register
                        </Box>
                      </Box>
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