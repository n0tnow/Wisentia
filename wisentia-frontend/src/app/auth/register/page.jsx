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
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();
  const { register } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    education_level: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // This ensures that any client-side-only code runs after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const educationLevels = [
    { value: 1, label: 'Primary' },
    { value: 2, label: 'Secondary' },
    { value: 3, label: 'High School' },
    { value: 4, label: 'University' },
    { value: 5, label: 'Professional' },
  ];

  const steps = ['Account Information', 'Personal Details', 'Confirmation'];

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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      // Validate account information
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 1) {
      // Validate personal details
      if (!formData.education_level) {
        newErrors.education_level = 'Education level is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Final validation for all steps
    if (!validateStep(0) || !validateStep(1)) {
      return;
    }
    
    setApiError('');
    setSuccess('');
    setIsSubmitting(true);
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...dataToSubmit } = formData;
    
    try {
      await register(dataToSubmit);
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.');
      setActiveStep(0); // Go back to first step on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Step content rendering
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
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
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="given-name"
                  value={formData.first_name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="family-name"
                  value={formData.last_name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            
            <FormControl 
              fullWidth 
              margin="normal" 
              required 
              error={!!errors.education_level}
              sx={{ mb: 2 }}
            >
              <InputLabel id="education-level-label">Education Level</InputLabel>
              <Select
                labelId="education-level-label"
                id="education_level"
                name="education_level"
                value={formData.education_level}
                label="Education Level"
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SchoolIcon color="action" />
                  </InputAdornment>
                }
              >
                {educationLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.education_level && (
                <FormHelperText error>{errors.education_level}</FormHelperText>
              )}
            </FormControl>
            
            <Box sx={{ 
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.dark
            }}>
              <Typography variant="body2">
                <strong>Note:</strong> Your education level helps us personalize your learning experience.
                We'll customize courses and quests based on your education background.
              </Typography>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              mx: 'auto',
              mb: 3
            }}>
              <CheckIcon sx={{ fontSize: 40 }} />
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Almost There!
            </Typography>
            
            <Typography variant="body1" paragraph>
              Please review your information before submitting
            </Typography>
            
            <Box sx={{ 
              textAlign: 'left',
              bgcolor: alpha(theme.palette.background.default, 0.6),
              p: 2,
              borderRadius: 2
            }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Username</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.username}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">First Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.first_name || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{formData.last_name || '—'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Education Level</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {educationLevels.find(level => level.value === formData.education_level)?.label || '—'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                By clicking "Create Account", you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
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
            Join Wisentia Today
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            Start Your Learning Journey
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Create an account to access our courses, quests, and earn valuable NFTs as you progress.
          </Typography>
          
          <Box sx={{ 
            mt: 6,
            p: 3,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(5px)'
          }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Why Join Wisentia?
            </Typography>
            
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  minWidth: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <CheckIcon />
                </Box>
                <Typography variant="body1">Access to premium learning content</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  minWidth: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <CheckIcon />
                </Box>
                <Typography variant="body1">Track your progress across courses</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  minWidth: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <CheckIcon />
                </Box>
                <Typography variant="body1">Earn NFTs for completed achievements</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  minWidth: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <CheckIcon />
                </Box>
                <Typography variant="body1">Join our community of learners</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Right Side - Registration Form */}
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
                Create Account
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Join Wisentia to start your learning journey
              </Typography>
            </Box>
            
            {apiError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {apiError}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}
            
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box component="form" onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
              {getStepContent(activeStep)}
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'stretch',
                mt: 4
              }}>
                {activeStep !== 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ChevronLeftIcon />}
                    sx={{ 
                      py: 1.5,
                      mb: 2,
                      borderRadius: 2
                    }}
                  >
                    Back
                  </Button>
                )}
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ChevronRightIcon />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
            
            {activeStep === 0 && isClient && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                {/* Social Registration Buttons */}
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
                    {/* Using text instead of images to prevent hydration issues */}
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
                    {/* Using text instead of images to prevent hydration issues */}
                    GitHub
                  </Button>
                </Box>
              </>
            )}
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <MuiLink 
                  component={Link} 
                  href="/auth/login" 
                  variant="body2"
                  underline="hover"
                  sx={{ fontWeight: 'bold' }}
                >
                  Sign In
                </MuiLink>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}