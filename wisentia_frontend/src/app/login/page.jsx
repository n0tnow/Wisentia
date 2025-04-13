'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TokenIcon from '@mui/icons-material/Token';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

// Animation keyframes
const shimmer = {
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  }
};

const float = {
  '@keyframes float': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0px)' },
  }
};

const pulse = {
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  }
};

const twinkle = {
  '@keyframes twinkle': {
    '0%': { opacity: 0.3, transform: 'scale(0.8)' },
    '50%': { opacity: 1, transform: 'scale(1.1)' },
    '100%': { opacity: 0.3, transform: 'scale(0.8)' },
  }
};

// StarEffect component - client-side rendering
const StarEffect = dynamic(() => Promise.resolve(() => {
  // Star elements
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 1 + Math.random() * 3
  }));

  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      overflow: 'hidden',
      zIndex: 0 
    }}>
      {stars.map(star => (
        <Box
          key={star.id}
          sx={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            backgroundColor: 'white',
            top: star.top,
            left: star.left,
            animation: `twinkle ${star.duration}s ${star.delay}s infinite ease-in-out`,
            opacity: 0.7,
            boxShadow: '0 0 5px 1px rgba(255,255,255,0.3)',
            zIndex: 0
          }}
        />
      ))}
    </Box>
  );
}), { ssr: false });

// Button stars effect
const ButtonStars = () => {
  const stars = Array.from({ length: 10 }, (_, i) => ({
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
      {stars.map(star => (
        <Box
          key={star.id}
          sx={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: star.top,
            left: star.left,
            opacity: 0,
            boxShadow: '0 0 5px 1px rgba(255,255,255,0.5)',
            animation: `twinkle ${star.duration}s ${star.delay}s infinite`,
          }}
        />
      ))}
    </Box>
  );
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [inputFocus, setInputFocus] = useState({ email: false, password: false });
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, authChecked, isLoading: authLoading } = useAuth();
  const redirectPath = searchParams ? searchParams.get('redirect') : null;
  
  // Güvenli yönlendirme - redirect parametresinde bir değer varsa kullan, yoksa dashboard'a git
  const redirectTarget = redirectPath || '/';
  
  // Debug amaçlı - redirect parametresini kontrol et
  useEffect(() => {
    console.log('Login page mounted', { 
      redirectPath, 
      authLoading, 
      authChecked,
      redirectInProgress
    });
  }, 
  []);
  
  // Kullanıcının kimlik durumunu kontrol et ve yönlendir
  // useEffect İÇİNDE
  useEffect(() => {
    console.log('Login page mounted', {
      redirectPath,
      authLoading,
      authChecked,
      redirectInProgress,
    });

    // Eğer auth kontrolü tamamlanmışsa ve kullanıcı giriş yapmışsa yönlendir
    if (!authLoading && authChecked && isAuthenticated() && !redirectInProgress) {
      setRedirectInProgress(true);
      router.replace(redirectPath); // BURADA KAL
    }
  }, [authLoading, authChecked, redirectInProgress, redirectPath]);
  

  // Login function - manual login attempt
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      console.log('Attempting login with email:', email);
      
      const result = await login({ email, password });
      
      if (result.success) {
        // Login başarılı - router.push yerine window.location kullan
        console.log('Login successful. Redirecting to:', redirectTarget);
        
        // Kısa bir gecikme ekle (localStorage yazma işleminin tamamlanması için)
        setTimeout(() => {
          // Router yerine doğrudan window.location kullan
          window.location.href = redirectTarget;
        }, 200);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // MetaMask connection
  const handleConnectMetaMask = async () => {
    setIsWalletConnecting(true);
    setError('');
    
    try {
      // Check for MetaMask
      if (typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }
      
      // Connect wallet
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts.length === 0) {
          throw new Error('No accounts found. Please create an account in MetaMask.');
        }
        
        // Başarılı bağlantı sonrası window.location kullan
        window.location.href = redirectTarget;
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      setError(err.message || 'Failed to connect with MetaMask');
    } finally {
      setIsWalletConnecting(false);
    }
  };
  

  
  // DEBUG DASHBOARD İÇİN
  const handleDirectDashboard = () => {
    window.location.href = '/';
  };
  
  // Debug için yardımcı fonksiyon (sadece dev ortamında)
  const checkAuthStatus = () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    setDebugInfo(`
      Auth status check:
      - Redirect target: ${redirectTarget}
      - Token exists: ${!!token}
      - User exists: ${!!user}
      - isAuthenticated(): ${isAuthenticated()}
      - authChecked: ${authChecked}
      - authLoading: ${authLoading}
      - redirectInProgress: ${redirectInProgress}
    `);
  };

  // Platform features
  const features = [
    { 
      title: 'Interactive Courses', 
      icon: <SchoolIcon sx={{ fontSize: 28 }} />,
      description: 'Learn at your own pace with our interactive content',
      delay: 0
    },
    { 
      title: 'Knowledge Quests', 
      icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />,
      description: 'Challenge yourself with quests that test your knowledge',
      delay: 0.5
    },
    { 
      title: 'NFT Rewards', 
      icon: <TokenIcon sx={{ fontSize: 28 }} />,
      description: 'Earn unique NFTs as proof of your achievements',
      delay: 1
    },
    { 
      title: 'AI-Powered Learning', 
      icon: <SmartToyIcon sx={{ fontSize: 28 }} />,
      description: 'Our AI assistant analyzes your learning patterns and provides personalized recommendations',
      delay: 1.5
    }
  ];

  // Eğer yönlendirme devam ediyorsa veya auth yükleniyorsa yükleme göster
  if (redirectInProgress || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={50} />
        <Typography variant="body1" sx={{ mt: 3 }}>
          {redirectInProgress ? 'Redirecting...' : 'Loading...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        zIndex: 10000,
        ...shimmer,
        ...float,
        ...pulse,
        ...twinkle
      }}
    >
      {/* Left Panel - Platform Information */}
      <Box
        sx={{
          width: { xs: '0%', md: '50%' },
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
          color: 'white',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414l5.586-5.586zm16.414 0L89 80.414 94.586 86H83.414l5.586-5.586zm16.414 0L105 80.414 110.586 86H99.414l5.586-5.586zm-8.414 82.827l-47.12-47.121L115.414 87l.707-.707 19.291-19.29.414-.414L152.707 50l-13.414 13.414-.5-.5L98.92 22.043 22.043 98.92l41.414 41.414L81.414 152l15.414-15.414z' fill='%23ffffff' fill-opacity='0.8' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
        
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '90%',
            px: 3,
            py: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{
              mb: 1.5,
              backgroundImage: 'linear-gradient(45deg, #ffffff 10%, #d0c6ff 100%)',
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s infinite linear',
              letterSpacing: '0.5px',
              textShadow: '0 5px 25px rgba(255,255,255,0.15)',
            }}
          >
            Wisentia Learning Platform
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              mb: 1.5,
              background: 'linear-gradient(to right, #ffffff, #f0c6ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(255,255,255,0.2)',
              animation: 'shimmer 4s infinite linear',
              backgroundSize: '200% auto',
            }}
          >
            Empower Your Learning Journey
          </Typography>
          
          <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
              '& span': {
                color: '#a3f7ff',
                fontWeight: 'bold',
                animation: 'pulse 3s infinite ease-in-out',
                display: 'inline-block',
                textShadow: '0 0 8px rgba(163, 247, 255, 0.6)',
              }
            }}
          >
            Discover courses, complete <span>quests</span>, and earn <span>NFTs</span> with our gamified education platform.
          </Typography>
          
          {/* Feature Cards */}
          <Box sx={{ width: '100%', mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                  animation: 'float 6s infinite ease-in-out',
                  animationDelay: `${feature.delay}s`,
                }}
              >
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2">
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      
      {/* Right Panel - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: '100%',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #0b0b15 0%, #1E1037 100%)' 
            : 'linear-gradient(135deg, #0f0f18 0%, #241644 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Star effect background */}
        <StarEffect />
        
        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            maxWidth: 350,
            width: '85%',
            position: 'relative',
            zIndex: 10,
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            p: 4,
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{
              textAlign: 'center',
              mb: 1,
              background: 'linear-gradient(45deg, #8E54E9, #4776E6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
            }}
          >
            Sign In
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mb: 3,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Welcome back! Please enter your details
          </Typography>
          
          {/* Error message */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                fontSize: '0.8rem',
                py: 0.5,
                bgcolor: 'rgba(244,67,54,0.1)',
                color: '#ff8a80',
                border: '1px solid rgba(244,67,54,0.2)',
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Debug info */}
          {debugInfo && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                borderRadius: 2,
                fontSize: '0.8rem',
                py: 0.5,
                overflowX: 'auto',
                whiteSpace: 'pre-line'
              }}
            >
              {debugInfo}
            </Alert>
          )}
          
          {/* Email field */}
          <Box sx={{ mb: 2 }}>
            <Typography
              component="label"
              htmlFor="email"
              sx={{
                display: 'flex',
                mb: 0.5,
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
              }}
            >
              Email Address *
            </Typography>
            <TextField
              fullWidth
              id="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setInputFocus({ ...inputFocus, email: true })}
              onBlur={() => setInputFocus({ ...inputFocus, email: false })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon 
                      sx={{ 
                        color: inputFocus.email ? '#8E54E9' : 'rgba(255,255,255,0.5)',
                        fontSize: '1.2rem',
                        transition: 'color 0.3s ease',
                      }} 
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease',
                  ...(inputFocus.email && {
                    boxShadow: '0 0 0 2px rgba(142, 84, 233, 0.3)',
                  }),
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9rem',
                  py: 1,
                  transition: 'all 0.3s ease',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'opacity 0.3s ease',
                    opacity: inputFocus.email ? 0 : 1,
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8E54E9',
                },
              }}
            />
          </Box>
          
          {/* Password field */}
          <Box sx={{ mb: 1.5 }}>
            <Typography
              component="label"
              htmlFor="password"
              sx={{
                display: 'flex',
                mb: 0.5,
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
              }}
            >
              Password *
            </Typography>
            <TextField
              fullWidth
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setInputFocus({ ...inputFocus, password: true })}
              onBlur={() => setInputFocus({ ...inputFocus, password: false })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon 
                      sx={{ 
                        color: inputFocus.password ? '#8E54E9' : 'rgba(255,255,255,0.5)',
                        fontSize: '1.2rem',
                        transition: 'color 0.3s ease',
                      }} 
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ 
                        color: 'rgba(255,255,255,0.5)',
                        transition: 'color 0.2s ease',
                        '&:hover': {
                          color: 'rgba(255,255,255,0.8)',
                        }
                      }}
                    >
                      {showPassword ? 
                        <VisibilityOffOutlinedIcon sx={{ fontSize: '1.2rem' }} /> : 
                        <VisibilityOutlinedIcon sx={{ fontSize: '1.2rem' }} />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease',
                  ...(inputFocus.password && {
                    boxShadow: '0 0 0 2px rgba(142, 84, 233, 0.3)',
                  }),
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9rem',
                  py: 1,
                  transition: 'all 0.3s ease',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'opacity 0.3s ease',
                    opacity: inputFocus.password ? 0 : 1,
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8E54E9',
                },
              }}
            />
          </Box>
          
          {/* Remember me and Forgot password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    '&.Mui-checked': {
                      color: '#8E54E9',
                    },
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  }}
                />
              }
              label="Remember me"
              sx={{ 
                '& .MuiTypography-root': { 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                },
                mr: 0 
              }}
            />
            <Link
              component={NextLink}
              href="/forgot-password"
              sx={{
                color: '#a3f7ff',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#c3fdff',
                },
              }}
            >
              Forgot password?
            </Link>
          </Box>
          
          {/* Login button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.9rem',
              mb: 2,
              background: 'linear-gradient(90deg, #4776E6, #8E54E9)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                backgroundImage: 'linear-gradient(90deg, #4776E6, #8E54E9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(71, 118, 230, 0.4)',
              },
              '&:before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
                opacity: 0,
                transition: 'opacity 0.5s ease',
              },
              '&:hover:before': {
                opacity: 1,
              },
            }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
          </Button>
          
          {/* Debug button for development */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outlined"
              fullWidth
              onClick={checkAuthStatus}
              sx={{ 
                mb: 2,
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.2)',
              }}
            >
              Debug Auth Status
            </Button>
          )}
          
          {/* DIVIDER */}
          <Box sx={{ position: 'relative', my: 2 }}>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <Typography
                variant="body2"
                component="span"
                sx={{
                  px: 1,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                }}
              >
                OR
              </Typography>
            </Divider>
          </Box>
          
          {/* MetaMask connection button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
            onClick={handleConnectMetaMask}
            disabled={isWalletConnecting}
            sx={{
              py: 1.2,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.9rem',
              border: '1px solid rgba(246, 133, 27, 0.5)',
              color: '#F6851B',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                backgroundColor: 'transparent',
                borderColor: '#F6851B',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(246, 133, 27, 0.2)',
              },
              '&:before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(246, 133, 27, 0.1) 0%, rgba(246, 133, 27, 0) 70%)',
                opacity: 0,
                transition: 'opacity 0.5s ease',
              },
              '&:hover:before': {
                opacity: 1,
              },
            }}
          >
            {isWalletConnecting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Connect with MetaMask'
            )}
          </Button>
          
          {/* Debug button (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              fullWidth
              variant="text"
              onClick={handleDirectDashboard}
              sx={{
                mt: 1,
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.8)',
                }
              }}
            >
              Go to Dashboard Directly
            </Button>
          )}
          
          {/* Don't have an account? */}
          <Box
            sx={{
              textAlign: 'center',
              mt: 3,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
              }}
            >
              Don't have an account?{' '}
              <Link
                component={NextLink}
                href="/register"
                sx={{
                  color: '#a3f7ff',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#c3fdff',
                  },
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}