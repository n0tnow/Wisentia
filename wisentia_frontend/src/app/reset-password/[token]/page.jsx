'use client';

import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, useTheme, Paper, InputAdornment, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NextLink from 'next/link';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';

// Animasyon tanımlamaları
const twinkle = {
  '@keyframes twinkle': {
    '0%': { opacity: 0.3, transform: 'scale(0.8)' },
    '50%': { opacity: 1, transform: 'scale(1.1)' },
    '100%': { opacity: 0.3, transform: 'scale(0.8)' },
  }
};

// Yıldız efekti için dinamik bileşen
const StarEffect = dynamic(() => Promise.resolve(() => {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 1 + Math.random() * 3
  }));

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
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

export default function ResetPasswordPage({ params }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inputFocus, setInputFocus] = useState({ password: false, confirmPassword: false });
  
  const theme = useTheme();
  const router = useRouter();
  const { token } = params;
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please enter all required fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        ...twinkle
      }}
    >
      {/* Arkaplan */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0b0b15 0%, #1E1037 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Yıldız efekti */}
        <StarEffect />
        
        {/* Geri butonu */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
          <Button
            component={NextLink}
            href="/login"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'white',
              opacity: 0.7,
              fontSize: '0.85rem',
              '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            Back to Login
          </Button>
        </Box>
        
        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            maxWidth: 380,
            width: '85%',
            position: 'relative',
            zIndex: 10,
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: 'transparent',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 4 }}>
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                sx={{
                  textAlign: 'center',
                  mb: 1,
                  color: 'white',
                }}
              >
                Reset Password
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  mb: 3,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {success 
                  ? 'Your password has been successfully reset' 
                  : 'Create a new password for your account'}
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
              
              {/* Success message */}
              {success && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    my: 2,
                  }}
                >
                  <CheckCircleOutlineIcon 
                    sx={{ 
                      color: '#4caf50', 
                      fontSize: '3rem',
                      mb: 2
                    }} 
                  />
                  <Alert
                    severity="success"
                    sx={{
                      mb: 2,
                      width: '100%',
                      borderRadius: 2,
                      fontSize: '0.8rem',
                      py: 0.5,
                      bgcolor: 'rgba(76,175,80,0.1)',
                      color: '#a5d6a7',
                      border: '1px solid rgba(76,175,80,0.2)',
                    }}
                  >
                    Password reset successful. Redirecting to login...
                  </Alert>
                </Box>
              )}
              
              {!success && (
                <>
                  {/* New Password field */}
                  <Box sx={{ mb: 2 }}>
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
                      New Password *
                    </Typography>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
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
                  
                  {/* Confirm Password field */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      component="label"
                      htmlFor="confirmPassword"
                      sx={{
                        display: 'flex',
                        mb: 0.5,
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                      }}
                    >
                      Confirm Password *
                    </Typography>
                    <TextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      size="small"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setInputFocus({ ...inputFocus, confirmPassword: true })}
                      onBlur={() => setInputFocus({ ...inputFocus, confirmPassword: false })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon 
                              sx={{ 
                                color: inputFocus.confirmPassword ? '#8E54E9' : 'rgba(255,255,255,0.5)',
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                              {showConfirmPassword ? 
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
                          ...(inputFocus.confirmPassword && {
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
                            opacity: inputFocus.confirmPassword ? 0 : 1,
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
                  
                  {/* Submit button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
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
                    {isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </>
              )}
              
              {/* Return to login */}
              <Box
                sx={{
                  textAlign: 'center',
                  mt: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem',
                  }}
                >
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    style={{
                      color: '#a3f7ff',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.textDecoration = 'underline';
                      e.target.style.color = '#c3fdff';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.textDecoration = 'none';
                      e.target.style.color = '#a3f7ff';
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}