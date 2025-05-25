'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Paper, InputAdornment } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyIcon from '@mui/icons-material/Key';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NextLink from 'next/link';
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

export default function VerifyEmailWithCodePage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [inputFocus, setInputFocus] = useState({ email: false, code: false });
  
  const router = useRouter();
  const { verifyEmailWithCode, resendVerificationCode } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!code) {
      setError('Please enter the verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await verifyEmailWithCode(email, code);
      
      if (result.success) {
        setSuccess(true);
        setMessage(result.message || 'Email verified successfully');
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || 'Email verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError('An error occurred during email verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address to resend the verification code');
      return;
    }
    
    setIsResending(true);
    setError('');
    
    try {
      const result = await resendVerificationCode(email);
      
      if (result.success) {
        setMessage(result.message || 'A new verification code has been sent to your email');
      } else {
        setError(result.error || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification code error:', error);
      setError('An error occurred while resending the verification code. Please try again.');
    } finally {
      setIsResending(false);
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
            maxWidth: 400,
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
                Verify Email
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
                  ? 'Your email has been successfully verified' 
                  : 'Enter the verification code sent to your email'}
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
                    {message || 'Email verified successfully. Redirecting to login...'}
                  </Alert>
                </Box>
              )}
              
              {/* Notification message */}
              {message && !success && (
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    py: 0.5,
                    bgcolor: 'rgba(33,150,243,0.1)',
                    color: '#90caf9',
                    border: '1px solid rgba(33,150,243,0.2)',
                  }}
                >
                  {message}
                </Alert>
              )}
              
              {!success && (
                <>
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
                            <MailOutlineIcon 
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
                  
                  {/* Verification Code field */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      component="label"
                      htmlFor="code"
                      sx={{
                        display: 'flex',
                        mb: 0.5,
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                      }}
                    >
                      Verification Code *
                    </Typography>
                    <TextField
                      fullWidth
                      id="code"
                      name="code"
                      placeholder="Enter verification code"
                      size="small"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onFocus={() => setInputFocus({ ...inputFocus, code: true })}
                      onBlur={() => setInputFocus({ ...inputFocus, code: false })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyIcon 
                              sx={{ 
                                color: inputFocus.code ? '#8E54E9' : 'rgba(255,255,255,0.5)',
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
                          ...(inputFocus.code && {
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
                            opacity: inputFocus.code ? 0 : 1,
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
                  
                  {/* Verify button */}
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
                    {isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Verify Email'
                    )}
                  </Button>
                  
                  {/* Resend Code */}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleResendCode}
                    disabled={isResending}
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      mb: 2,
                      color: '#a3f7ff',
                      borderColor: 'rgba(163, 247, 255, 0.3)',
                      '&:hover': {
                        borderColor: '#a3f7ff',
                        backgroundColor: 'rgba(163, 247, 255, 0.05)',
                      },
                    }}
                  >
                    {isResending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Resend Verification Code'
                    )}
                  </Button>
                </>
              )}
              
              {/* Login link */}
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
                  Already verified?{' '}
                  <NextLink
                    href="/login"
                    style={{
                      color: '#a3f7ff',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Sign In
                  </NextLink>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}