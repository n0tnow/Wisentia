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
  Container,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  alpha,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NFTIcon,
  Dashboard as DashboardIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  WbSunny as LightModeIcon,
  NightsStay as DarkModeIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
// Header.jsx - import kısmına eklenecek
// İmport kısmı - yaklaşık satır 54-55 civarı diğer import'ların yanına
import WalletConnectButton from '@/components/wallet/WalletConnectButton';
import { useWallet } from '@/contexts/WalletContext';
import { AccountBalanceWallet as AccountBalanceWalletIcon } from '@mui/icons-material';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const headerRef = useRef(null);

  // Animated number for points display
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const actualPoints = user?.Points || 0;
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Animate points counter when the value changes
  useEffect(() => {
    if (actualPoints === displayedPoints) return;
    
    const difference = actualPoints - displayedPoints;
    const increment = Math.max(1, Math.floor(difference / 10));
    
    const timer = setTimeout(() => {
      setDisplayedPoints(prev => 
        Math.min(prev + increment, actualPoints)
      );
    }, 50);
    
    return () => clearTimeout(timer);
  }, [actualPoints, displayedPoints]);
  
  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // This would normally update your theme context
  };

  const mainMenuItems = [
    { label: 'Courses', href: '/courses', icon: <SchoolIcon /> },
    { label: 'Quests', href: '/quests', icon: <QuestIcon /> },
    { label: 'NFT Collection', href: '/nfts', icon: <NFTIcon /> },
  ];

  const authenticatedMenuItems = isAuthenticated ? [
    { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
    ...mainMenuItems
  ] : [...mainMenuItems];

  const userMenuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Profile', href: '/profile', icon: <ProfileIcon /> },
    { label: 'Logout', action: handleLogout, icon: <LogoutIcon /> }
  ];

  const authMenuItems = [
    { label: 'Login', href: '/auth/login', icon: <LoginIcon /> },
    { label: 'Register', href: '/auth/register', icon: <RegisterIcon /> }
  ];

  // Animated notification bubble
  const ActiveNotification = ({ count }) => (
    <Box
      component="span"
      sx={{
        position: 'absolute',
        top: -8,
        right: -8,
        height: 20,
        width: 20,
        borderRadius: '50%',
        bgcolor: theme.palette.error.main,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        boxShadow: '0 0 0 2px white',
        animation: 'pulse 1.5s infinite',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)' },
          '70%': { transform: 'scale(1.1)', boxShadow: '0 0 0 6px rgba(255, 0, 0, 0)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' }
        }
      }}
    >
      {count}
    </Box>
  );

  // Animated particles for background
  const Particles = () => (
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
      {[...Array(10)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            backgroundColor: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float-${i % 5} ${3 + Math.random() * 7}s infinite linear`,
            '@keyframes float-0': {
              '0%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(20px, 20px)' },
              '100%': { transform: 'translate(0, 0)' }
            },
            '@keyframes float-1': {
              '0%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(-20px, 10px)' },
              '100%': { transform: 'translate(0, 0)' }
            },
            '@keyframes float-2': {
              '0%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(15px, -15px)' },
              '100%': { transform: 'translate(0, 0)' }
            },
            '@keyframes float-3': {
              '0%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(-15px, -10px)' },
              '100%': { transform: 'translate(0, 0)' }
            },
            '@keyframes float-4': {
              '0%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(10px, 10px)' },
              '100%': { transform: 'translate(0, 0)' }
            }
          }}
        />
      ))}
    </Box>
  );

  // Honey drip animation elements
  const HoneyDrips = () => (
    <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(12)].map((_, index) => {
        // Randomize drip properties
        const left = 5 + (index * 8) + (Math.random() * 4 - 2);
        const width = 3 + Math.random() * 4;
        const height = 40 + Math.random() * 80;
        const delay = Math.random() * 5;
        const duration = 5 + Math.random() * 7;
        
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              left: `${left}%`,
              top: 0,
              width: `${width}px`,
              height: `${height}px`,
              borderRadius: `${width/2}px`,
              background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.primary.light, 0.15)} 20%, ${alpha(theme.palette.primary.main, 0.2)} 60%, ${alpha(theme.palette.secondary.light, 0.25)})`,
              animation: `honeyDrip ${duration}s ${delay}s infinite ease-in-out`,
              transformOrigin: 'top center',
              opacity: 0.7,
              filter: 'blur(1px)',
              '@keyframes honeyDrip': {
                '0%': { 
                  transform: 'scaleY(0.1)', 
                  opacity: 0 
                },
                '10%': { 
                  transform: 'scaleY(0.3)', 
                  opacity: 0.6
                },
                '40%': { 
                  transform: 'scaleY(1.05)', 
                  opacity: 0.8
                },
                '60%': { 
                  transform: 'scaleY(1)',
                  opacity: 0.7
                },
                '100%': { 
                  transform: 'scaleY(0.1)', 
                  opacity: 0 
                }
              }
            }}
          />
        );
      })}
    </Box>
  );

  // Honey drop bubbles
  const HoneyDrops = () => (
    <Box sx={{ position: 'absolute', width: '100%', height: 0, top: '99%', overflow: 'visible', pointerEvents: 'none' }}>
      {[...Array(6)].map((_, index) => {
        const size = 10 + Math.random() * 20;
        const left = 10 + (Math.random() * 80);
        const delay = Math.random() * 10;
        const duration = 8 + Math.random() * 5;
        
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              left: `${left}%`,
              top: 0,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.primary.light, 0.7)}, ${alpha(theme.palette.secondary.main, 0.4)})`,
              animation: `honeyDrop ${duration}s ${delay}s infinite ease-out`,
              filter: 'blur(1px)',
              opacity: 0,
              '@keyframes honeyDrop': {
                '0%': { 
                  transform: 'translateY(-5px) scale(0.3)', 
                  opacity: 0 
                },
                '10%': { 
                  transform: 'translateY(0) scale(1)',  
                  opacity: 0.6 
                },
                '80%': { 
                  transform: 'translateY(80px) scale(0.8)', 
                  opacity: 0.2 
                },
                '100%': { 
                  transform: 'translateY(100px) scale(0.2)', 
                  opacity: 0 
                }
              }
            }}
          />
        );
      })}
    </Box>
  );

  // 3D rotating badge for points
  const PointsBadge = ({ points }) => (
    <Box
      sx={{
        position: 'relative',
        mr: 2,
        display: { xs: 'none', sm: 'block' }
      }}
    >
      <Box
        sx={{
          p: 0.5,
          px: 1.5,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px) scale(1.05)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            bgcolor: 'rgba(255, 255, 255, 0.25)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.2) 50%, transparent 55%)',
            backgroundSize: '200% 200%',
            animation: 'shine 3s infinite linear',
            borderRadius: 2,
            '@keyframes shine': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }
        }}
      >
        <QuestIcon fontSize="small" sx={{ mr: 0.5 }} />
        <Typography variant="body2" fontWeight="bold">
          {points} pts
        </Typography>
      </Box>
    </Box>
  );

  const mobileDrawer = (
    <Drawer
      variant="temporary"
      open={mobileDrawerOpen}
      onClose={handleMobileDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 280,
          background: `linear-gradient(145deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          color: 'white',
          boxSizing: 'border-box' 
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Particles />
        <Typography
          variant="h5"
          component={Link}
          href="/"
          onClick={handleMobileDrawerToggle}
          sx={{
            fontWeight: 800,
            color: 'white',
            textDecoration: 'none',
            textShadow: '0 0 10px rgba(255,255,255,0.5)',
            position: 'relative',
            zIndex: 1
          }}
        >
          WISENTIA
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      {isAuthenticated && (
        <Box sx={{ p: 2, position: 'relative' }}>
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
                border: '2px solid white',
                boxShadow: '0 0 15px rgba(255,255,255,0.3)'
              }} 
              alt={user?.Username || 'User'} 
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.FirstName || user?.Username}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {displayedPoints} Points
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      <List sx={{ px: 1 }}>
        {mainMenuItems.map((item, index) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={handleMobileDrawerToggle}
              sx={{ 
                my: 0.5, 
                borderRadius: 2,
                transition: 'all 0.3s',
                animation: `fadeInRight ${0.3 + index * 0.1}s ease forwards`,
                opacity: 0,
                transform: 'translateX(-20px)',
                '@keyframes fadeInRight': {
                  to: { opacity: 1, transform: 'translateX(0)' }
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(5px)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
      
      <List>
        {isAuthenticated ? (
          userMenuItems.map((item, index) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={item.href ? Link : 'div'}
                href={item.href}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  }
                  handleMobileDrawerToggle();
                }}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  animation: `fadeInLeft ${0.3 + index * 0.1}s ease forwards`,
                  opacity: 0,
                  transform: 'translateX(20px)',
                  '@keyframes fadeInLeft': {
                    to: { opacity: 1, transform: 'translateX(0)' }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateX(-5px)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          authMenuItems.map((item, index) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  my: 0.5, 
                  borderRadius: 2,
                  animation: `fadeInLeft ${0.3 + index * 0.1}s ease forwards`,
                  opacity: 0,
                  transform: 'translateX(20px)',
                  '@keyframes fadeInLeft': {
                    to: { opacity: 1, transform: 'translateX(0)' }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateX(-5px)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        ref={headerRef}
        sx={{ 
          boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease',
          background: 'transparent',
          backgroundImage: isScrolled 
            ? `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
            : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ position: 'relative' }}>
            <Particles />
            
            {/* Honey dripping effects */}
            <HoneyDrips />
            <HoneyDrops />
            
            {/* Logo/Brand - always visible */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 800,
                color: 'white',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s',
                textShadow: '0 0 10px rgba(255,255,255,0.5)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  transform: 'scaleX(0)',
                  height: '2px',
                  bottom: -2,
                  left: 0,
                  backgroundColor: 'white',
                  transformOrigin: 'bottom right',
                  transition: 'transform 0.4s cubic-bezier(0.86, 0, 0.07, 1)'
                },
                '&:hover::after': {
                  transform: 'scaleX(1)',
                  transformOrigin: 'bottom left'
                }
              }}
            >
              WISENTIA
            </Typography>

            {/* Mobile menu icon */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  color: 'white',
                  position: 'relative',
                  zIndex: 1,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -5,
                    left: -5,
                    right: -5,
                    bottom: -5,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    zIndex: -1
                  },
                  '&:hover::before': {
                    opacity: 1
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Mobile logo */}
            <Typography
              variant="h5"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 800,
                color: 'white',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                position: 'relative',
                zIndex: 1,
                textShadow: '0 0 10px rgba(255,255,255,0.5)'
              }}
            >
              WISENTIA
            </Typography>

            {/* Desktop menu */}
            <Box sx={{ 
              flexGrow: 1, 
              display: { xs: 'none', md: 'flex' }, 
              ml: 4,
              position: 'relative',
              zIndex: 1
            }}>
              {mainMenuItems.map((item, index) => (
                <Box 
                  key={item.href}
                  sx={{
                    mx: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    // Animation on page load
                    animation: `fadeInTop ${0.3 + index * 0.1}s ease forwards`,
                    opacity: 0,
                    transform: 'translateY(-20px)',
                    '@keyframes fadeInTop': {
                      to: { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  <Button
                    component={Link}
                    href={item.href}
                    sx={{ 
                      color: 'white', 
                      py: 1,
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 600,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      zIndex: 1,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(120deg, transparent 0%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 100%)',
                        backgroundSize: '250% 100%',
                        transition: 'all 0.6s cubic-bezier(0.65, 0, 0.35, 1)',
                        zIndex: -1
                      },
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      },
                      '&:hover::before': {
                        backgroundPosition: '100% 0'
                      }
                    }}
                    startIcon={item.icon}
                  >
                    {item.label}
                  </Button>
                </Box>
              ))}
            </Box>

            {/* Auth buttons */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              position: 'relative',
              zIndex: 1 
            }}>
              {/* Search Button */}
              <Tooltip title="Search">
                <IconButton 
                  onClick={toggleSearch} 
                  sx={{ 
                    color: 'white',
                    mx: 0.5,
                    transition: 'all 0.3s',
                    transform: searchOpen ? 'rotate(90deg)' : 'rotate(0)',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.1),
                      transform: searchOpen ? 'rotate(90deg) scale(1.1)' : 'scale(1.1)',
                    }, 
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              
              {/* Theme Toggle */}
              <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton 
                  onClick={toggleDarkMode} 
                  sx={{ 
                    color: 'white',
                    mx: 0.5,
                    transition: 'all 0.3s',
                    transform: darkMode ? 'rotate(180deg)' : 'rotate(0)',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.1),
                      transform: darkMode ? 'rotate(180deg) scale(1.1)' : 'scale(1.1)',
                    }, 
                  }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              
              {isAuthenticated && (
                <Tooltip title="Notifications">
                  <IconButton 
                    onClick={handleNotificationsOpen} 
                    sx={{ 
                      color: 'white',
                      mx: 0.5,
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: alpha('#fff', 0.1),
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <NotificationsIcon />
                    <ActiveNotification count={3} />
                  </IconButton>
                </Tooltip>
              )}
              
              {isAuthenticated ? (
                <>
                  {/* Points Display */}
                  <PointsBadge points={displayedPoints} />
                  
                  <Tooltip title="Account settings">
                    <IconButton 
                      onClick={handleProfileMenuOpen} 
                      sx={{ 
                        p: 0,
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Avatar 
                        alt={user?.Username || 'User'} 
                        src={user?.avatarUrl || "/default-avatar.jpg"} // Add a default avatar
                        sx={{ 
                          width: 40, 
                          height: 40,
                          border: '2px solid white',
                          boxShadow: '0 0 15px rgba(255,255,255,0.3)'
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={profileAnchorEl}
                    id="account-menu"
                    open={Boolean(profileAnchorEl)}
                    onClose={handleProfileMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    sx={{
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        minWidth: 220,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        mt: 1.5,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiList-root': {
                          p: 0,
                        }
                      },
                    }}
                  >
                    <Box 
                      sx={{ 
                        px: 3, 
                        py: 2, 
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Avatar 
                        alt={user?.Username || 'User'} 
                        src={user?.avatarUrl || "/default-avatar.jpg"}
                        sx={{ 
                          width: 50, 
                          height: 50,
                          mr: 2,
                          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {user?.FirstName || user?.Username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user?.Email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Your Progress
                      </Typography>
                      <Box 
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          Level 5
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          Level 6
                        </Typography>
                      </Box>
                      <Box 
                        sx={{
                          width: '100%',
                          height: 8,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 4,
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <Box 
                          sx={{
                            width: '65%',
                            height: '100%',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            borderRadius: 4,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                              animation: 'shine 2s infinite',
                              '@keyframes shine': {
                                '0%': { transform: 'translateX(-100%)' },
                                '100%': { transform: 'translateX(100%)' }
                              }
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {displayedPoints} / 1000 Points
                      </Typography>
                    </Box>
                    <Box>
                      {userMenuItems.map((item, index) => (
                        <MenuItem 
                          key={item.label}
                          component={item.href ? Link : 'div'} 
                          href={item.href} 
                          onClick={() => {
                            if (item.action) {
                              item.action();
                            } else {
                              handleProfileMenuClose();
                            }
                          }}
                          sx={{ 
                            py: 1.5,
                            px: 2,
                            minHeight: 'auto',
                            transition: 'all 0.2s',
                            animation: `fadeInRight ${0.2 + index * 0.1}s ease forwards`,
                            opacity: 0,
                            transform: 'translateX(-10px)',
                            '@keyframes fadeInRight': {
                              to: { opacity: 1, transform: 'translateX(0)' }
                            },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              transform: 'translateX(5px)'
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.label} />
                        </MenuItem>
                      ))}
                    </Box>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <Button 
                    component={Link} 
                    href="/auth/login"
                    variant="text"
                    sx={{ 
                      color: 'white',
                      mr: 1,
                      py: 1,
                      position: 'relative',
                      overflow: 'hidden',
                      zIndex: 1,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.4s cubic-bezier(0.65, 0, 0.35, 1)',
                        zIndex: -1
                      },
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&:hover::before': {
                        transform: 'translateX(0)'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    component={Link} 
                    href="/auth/register"
                    variant="contained"
                    sx={{ 
                      bgcolor: alpha('#fff', 0.15),
                      color: 'white',
                      '&:hover': {
                        bgcolor: alpha('#fff', 0.25),
                        transform: 'translateY(-3px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      },
                      borderRadius: 2,
                      py: 1,
                      transition: 'all 0.3s',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
        
        {/* Search Panel */}
        {searchOpen && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0,
              zIndex: 1100,
              transform: searchOpen ? 'translateY(0)' : 'translateY(-20px)',
              opacity: searchOpen ? 1 : 0,
              transition: 'all 0.3s',
              p: 2,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16
            }}
          >
            <Container maxWidth="md">
              <TextField 
                fullWidth
                placeholder="Search courses, quests and more..."
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Press ESC to close search
                </Typography>
              </Box>
            </Container>
          </Box>
        )}
      </AppBar>
      
      {/* Mobile Drawer */}
      {mobileDrawer}
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        id="notifications-menu"
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            width: 320,
            maxHeight: 400,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            mt: 1.5,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          <ListItem sx={{ py: 1.5, px: 2, position: 'relative' }}>
            <Box sx={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              bottom: 0, 
              width: 4, 
              bgcolor: theme.palette.primary.main,
              background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              animation: 'pulse 2s infinite alternate',
              '@keyframes pulse': {
                from: { opacity: 0.7 },
                to: { opacity: 1 }
              }
            }} />
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                <QuestIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={(
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Typography fontWeight="medium">Quest Completed!</Typography>
                  <Typography variant="caption" color="text.secondary">Just now</Typography>
                </Box>
              )}
              secondary="You've earned 100 points for completing 'Programming Basics'"
              primaryTypographyProps={{ fontWeight: 'medium' }}
              secondaryTypographyProps={{ fontSize: '0.8rem' }}
            />
          </ListItem>
          <Divider component="li" />
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                <NFTIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={(
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Typography fontWeight="medium">New NFT Available</Typography>
                  <Typography variant="caption" color="text.secondary">5m ago</Typography>
                </Box>
              )}
              secondary="You've unlocked the 'Code Master' NFT"
              primaryTypographyProps={{ fontWeight: 'medium' }}
              secondaryTypographyProps={{ fontSize: '0.8rem' }}
            />
          </ListItem>
          <Divider component="li" />
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                <SchoolIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText 
              primary={(
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center' 
                }}>
                  <Typography fontWeight="medium">Course Progress Update</Typography>
                  <Typography variant="caption" color="text.secondary">1h ago</Typography>
                </Box>
              )}
              secondary="You're 75% through 'Advanced JavaScript'"
              primaryTypographyProps={{ fontWeight: 'medium' }}
              secondaryTypographyProps={{ fontSize: '0.8rem' }}
            />
          </ListItem>
        </List>
        <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Button 
            size="small" 
            color="primary"
            sx={{ borderRadius: 2, px: 2 }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
}