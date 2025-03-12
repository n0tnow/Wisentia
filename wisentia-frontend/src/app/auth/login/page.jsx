'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField,
  Button,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NFTIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Import social icons
// Note: Create this component or use the SVG directly
// import { GoogleIcon, GithubIcon } from '@/components/ui/SocialIcons';

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // This ensures that any client-side-only code runs after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData);
      router.push('/dashboard');
    } catch (error) {
      setApiError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`,
      position: 'relative'
    }}>
      {/* Left Side - Decorative Elements */}
      <Box sx={{ 
        flex: { xs: 0, md: 1 }, 
        display: { xs: 'none', md: 'flex' },
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.dark})`,
        color: 'white',
        p: 4
      }}>
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 500 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
            sx={{ mb: 4 }}
          >
            Wisentia Learning Platform
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            Empower Your Learning Journey
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Discover courses, complete quests, and earn NFTs with our gamified education platform.
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 3, 
            mt: 6,
            px: 4
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                mx: 'auto',
                mb: 2
              }}>
                <SchoolIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom>
                Interactive Courses
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Learn at your own pace with our interactive content
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                mx: 'auto',
                mb: 2
              }}>
                <QuestIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom>
                Knowledge Quests
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Challenge yourself with quests that test your knowledge
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                mx: 'auto',
                mb: 2
              }}>
                <NFTIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom>
                NFT Rewards
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Earn unique NFTs as proof of your achievements
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Right Side - Login Form */}
      <Box sx={{ 
        flex: { xs: 1, md: 0.7 }, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 }
      }}>
        <Container maxWidth="sm">
          <Paper 
            elevation={9}
            sx={{ 
              py: 4, 
              px: { xs: 3, md: 6 },
              borderRadius: 4,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Border Top Color Gradient */}
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }} />
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography component="h1" variant="h4" fontWeight="bold">
                Sign In
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Welcome back! Please enter your details
              </Typography>
            </Box>
            
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2
              }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                
                <MuiLink 
                  href="#" 
                  variant="body2" 
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  Forgot password?
                </MuiLink>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ 
                  mt: 2, 
                  mb: 3, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              {/* Social Login Buttons */}
              {isClient && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: alpha(theme.palette.common.white, 0.8)
                    }}
                  >
                    {/* Using text instead of images for now to prevent hydration issues */}
                    Google
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: alpha(theme.palette.common.white, 0.8)
                    }}
                  >
                    {/* Using text instead of images for now to prevent hydration issues */}
                    GitHub
                  </Button>
                </Box>
              )}
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <MuiLink 
                    component={Link} 
                    href="/auth/register" 
                    variant="body2"
                    underline="hover"
                    sx={{ fontWeight: 'bold' }}
                  >
                    Sign Up
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}