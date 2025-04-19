'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { keyframes } from '@emotion/react';

// Animasyon tanımlamaları
const twinkleAnimation = keyframes`
  0% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.3; transform: scale(0.8); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Client-side only bileşen olarak tanımla
function StarEffect() {
  // Statik yıldızlar (hydration hatasını önlemek için)
  const seedStars = [
    { id: 1, top: '10%', left: '20%', size: '2px', duration: '3s', delay: '0s' },
    { id: 2, top: '25%', left: '15%', size: '1.5px', duration: '4s', delay: '0.5s' },
    { id: 3, top: '40%', left: '40%', size: '2.5px', duration: '3.5s', delay: '0.2s' },
    { id: 4, top: '70%', left: '80%', size: '1px', duration: '4.5s', delay: '0.7s' },
    { id: 5, top: '85%', left: '15%', size: '3px', duration: '2.5s', delay: '0.3s' },
    { id: 6, top: '20%', left: '60%', size: '2px', duration: '3.2s', delay: '0.1s' },
    { id: 7, top: '35%', left: '75%', size: '1.7px', duration: '3.8s', delay: '0.8s' },
    { id: 8, top: '55%', left: '35%', size: '2.2px', duration: '4.2s', delay: '0.4s' },
    { id: 9, top: '75%', left: '50%', size: '1.5px', duration: '3.3s', delay: '0.6s' },
    { id: 10, top: '90%', left: '85%', size: '1.2px', duration: '2.8s', delay: '0.9s' },
    { id: 11, top: '15%', left: '40%', size: '2.1px', duration: '3.6s', delay: '0.5s' },
    { id: 12, top: '60%', left: '30%', size: '1.8px', duration: '3.1s', delay: '0.2s' },
    { id: 13, top: '45%', left: '90%', size: '2.3px', duration: '4.3s', delay: '0.7s' },
    { id: 14, top: '5%', left: '70%', size: '1.9px', duration: '3.9s', delay: '0.3s' },
    { id: 15, top: '80%', left: '25%', size: '2.4px', duration: '4.1s', delay: '0.8s' },
    { id: 16, top: '30%', left: '10%', size: '1.6px', duration: '3.4s', delay: '0.1s' },
    { id: 17, top: '50%', left: '60%', size: '2.2px', duration: '2.9s', delay: '0.6s' },
    { id: 18, top: '65%', left: '85%', size: '1.7px', duration: '3.7s', delay: '0.4s' },
    { id: 19, top: '95%', left: '45%', size: '1.3px', duration: '4.4s', delay: '0.9s' },
    { id: 20, top: '25%', left: '95%', size: '2px', duration: '3s', delay: '0.2s' }
  ];

  return (
    <Box sx={{ position: 'absolute', height: '100%', width: '100%', overflow: 'hidden', zIndex: 0 }}>
      {seedStars.map((star) => (
        <Box
          key={star.id}
          sx={{
            position: 'absolute',
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            backgroundColor: 'white',
            top: star.top,
            left: star.left,
            animation: `${twinkleAnimation} ${star.duration} infinite ease-in-out`,
            animationDelay: star.delay,
            opacity: 0.7,
            zIndex: 0,
          }}
        />
      ))}
    </Box>
  );
}

export default function RegisterPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Hesap Bilgileri
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    
    // Şartlar ve Koşullar
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [redirectCompleted, setRedirectCompleted] = useState(false);
  
  const theme = useTheme();
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  // Cookie ve localStorage temizleme - ÖNEMLİ!
  useEffect(() => {
    // Tüm cookie'leri temizle
    const clearCookies = () => {
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.trim().split('=')[0] + '=;' + 'expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      });
      
      // Kritik olanları tekrar temizle
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    };
    
    // LocalStorage'ı temizle
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Cookie'leri temizle
    clearCookies();
    
    console.log("Register sayfası: Cookie ve localStorage temizlendi");
    
    // DOM'a script ekle (yedek temizleme metodu)
    const script = document.createElement('script');
    script.innerHTML = `
      // Tüm cookie'leri temizle
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.trim().split('=')[0] + '=;' + 'expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      });
      
      // LocalStorage'ı temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      console.log("Script: Cookie ve localStorage temizlendi");
    `;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Kullanıcı giriş yapmışsa dashboard'a yönlendir - sadece bir kez çalışır
  useEffect(() => {
    if (!redirectCompleted) {
      // Temiz başlangıç için localStorage kontrol etmeden önce temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }, [redirectCompleted]);

  // Form doğrulama
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      // Hesap Bilgileri Validasyonu
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    else if (step === 1) {
      // Şartlar ve Koşullar Validasyonu
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must accept the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Yazarken hatayı temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // MetaMask bağlantısı
  const handleConnectMetaMask = async () => {
    setIsConnectingWallet(true);
    
    try {
      // MetaMask kontrol et
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }
      
      // Cüzdan bağlantısı
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.');
      }
      
      // Wallet adresini forma ekle
      setFormData(prev => ({
        ...prev,
        walletAddress: accounts[0]
      }));
      
    } catch (err) {
      console.error('MetaMask connection error:', err);
      setErrors(prev => ({
        ...prev,
        walletAddress: err.message || 'Failed to connect with MetaMask'
      }));
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // API'ye gönderilecek verileri hazırla
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        walletAddress: formData.walletAddress || ''
      };
      
      console.log('Kayıt verileri hazırlandı:', userData);
      
      // Önceki oturum verilerini temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Cookie'leri temizle
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.trim().split('=')[0] + '=;' + 'expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      });
      
      // Register işlemini gerçekleştir
      const result = await register(userData);
      
      console.log('Kayıt sonucu:', result);
      
      if (result.success) {
        console.log('Kayıt başarılı!');
        setRedirectCompleted(true);
        router.push('/dashboard');
      } else {
        console.error('Kayıt başarısız:', result.error);
        
        // Manual override kontrolü
        if (result.manualOverride) {
          console.log('Manuel geçersiz kılma başarılı');
          setRedirectCompleted(true);
          router.push('/dashboard');
          return;
        }
        
        setSubmitError(result.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        setActiveStep(0); // Hata durumunda ilk adıma dön
      }
    } catch (error) {
      console.error('Register hatası:', error);
      setSubmitError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      setActiveStep(0); // Hata durumunda ilk adıma dön
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adım içerikleri
  const steps = [
    {
      label: 'Account Information',
      content: (
        <Box>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'normal', textAlign: 'center' }}>
            Create your login credentials
          </Typography>
          
          <Box sx={{ maxWidth: 360, mx: 'auto' }}>
            <TextField
              fullWidth
              id="username"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  height: 50,
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.username ? '#f44336' : 'rgba(255,255,255,0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.username ? '#f44336' : 'rgba(255,255,255,0.3)',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.username ? '#f44336' : '#8E54E9',
                },
              }}
            />
            {errors.username && (
              <Typography variant="caption" sx={{ color: '#f44336', mt: 0.5, pl: 2, display: 'block', mb: 0.5 }}>
                {errors.username}
              </Typography>
            )}
            
            <TextField
              fullWidth
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  height: 50,
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.email ? '#f44336' : 'rgba(255,255,255,0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.email ? '#f44336' : 'rgba(255,255,255,0.3)',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.email ? '#f44336' : '#8E54E9',
                },
              }}
            />
            {errors.email && (
              <Typography variant="caption" sx={{ color: '#f44336', mt: 0.5, pl: 2, display: 'block', mb: 0.5 }}>
                {errors.email}
              </Typography>
            )}
            
            <TextField
              fullWidth
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  height: 50,
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.password ? '#f44336' : 'rgba(255,255,255,0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.password ? '#f44336' : 'rgba(255,255,255,0.3)',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.password ? '#f44336' : '#8E54E9',
                },
              }}
            />
            {errors.password && (
              <Typography variant="caption" sx={{ color: '#f44336', mt: 0.5, pl: 2, display: 'block', mb: 0.5 }}>
                {errors.password}
              </Typography>
            )}
            
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  height: 50,
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  fontSize: '0.9rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.confirmPassword ? '#f44336' : 'rgba(255,255,255,0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.confirmPassword ? '#f44336' : 'rgba(255,255,255,0.3)',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.confirmPassword ? '#f44336' : '#8E54E9',
                },
              }}
            />
            {errors.confirmPassword && (
              <Typography variant="caption" sx={{ color: '#f44336', mt: 0.5, pl: 2, display: 'block', mb: 0.5 }}>
                {errors.confirmPassword}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      label: 'Confirmation',
      content: (
        <Box>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'normal', textAlign: 'center' }}>
            Connect wallet and finalize your registration
          </Typography>
          
          <Box sx={{ maxWidth: 360, mx: 'auto' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={handleConnectMetaMask}
              disabled={isConnectingWallet}
              sx={{
                py: 1.2,
                borderRadius: 1,
                fontSize: '0.9rem',
                border: '1px solid #F6851B',
                color: '#F6851B',
                bgcolor: 'rgba(255,255,255,0.05)',
                height: 48,
                mb: 2,
                '&:hover': {
                  backgroundColor: 'rgba(246, 133, 27, 0.1)',
                  borderColor: '#F6851B',
                },
              }}
            >
              {isConnectingWallet ? (
                <CircularProgress size={22} color="inherit" />
              ) : formData.walletAddress ? (
                `Connected: ${formData.walletAddress.substring(0, 6)}...${formData.walletAddress.substring(formData.walletAddress.length - 4)}`
              ) : (
                'Connect with MetaMask'
              )}
            </Button>
            {errors.walletAddress && (
              <Typography variant="caption" sx={{ color: '#f44336', mt: 0.5, pl: 2, display: 'block' }}>
                {errors.walletAddress}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, pl: 2, display: 'block', textAlign: 'center', mb: 1.5 }}>
              You can add this later
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    '&.Mui-checked': {
                      color: '#8E54E9',
                    },
                  }}
                  />
            }
            label={
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                I agree to the <Link href="#" sx={{ color: '#8E54E9' }}>terms of service</Link> and <Link href="#" sx={{ color: '#8E54E9' }}>privacy policy</Link>
              </Typography>
            }
            sx={{ mb: 0.5 }}
          />
          {errors.agreeTerms && (
            <Typography variant="caption" sx={{ color: '#f44336', pl: 4, display: 'block', mb: 1.5 }}>
              {errors.agreeTerms}
            </Typography>
          )}
        </Box>
      </Box>
    ),
  },
];

  // Yönlendirme tamamlandıysa, içeriği render etmeyi atla
  if (redirectCompleted) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>;
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
        flexDirection: { xs: 'column', md: 'row' },
        zIndex: 10000,
      }}
    >
      {/* Sol Panel - Platform Bilgileri */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: '35%', md: '100%' },
          backgroundImage: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Arka plan dekoratif elementleri */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414l5.586-5.586zm16.414 0L89 80.414 94.586 86H83.414l5.586-5.586zm16.414 0L105 80.414 110.586 86H99.414l5.586-5.586zm-8.414 82.827l-47.12-47.121L115.414 87l.707-.707 19.291-19.29.414-.414L152.707 50l-13.414 13.414-.5-.5L98.92 22.043 22.043 98.92l41.414 41.414L81.414 152l15.414-15.414z' fill='%23ffffff' fill-opacity='0.8' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
        
        {/* Yıldız efekti */}
        <StarEffect />
        
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: '90%',
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
              background: 'linear-gradient(45deg, #ffffff 10%, #d0c6ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 5px 25px rgba(255,255,255,0.15)',
              animationName: `${shimmerAnimation}`,
              animationDuration: '3s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              backgroundSize: '200% auto',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
            }}
          >
            Join Wisentia Today
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 2, 
              color: 'rgba(255, 255, 255, 0.9)',
              animationName: `${shimmerAnimation}`,
              animationDuration: '4s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              backgroundSize: '200% auto',
              background: 'linear-gradient(to right, #ffffff, #f0c6ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' }
            }}
          >
            Start Your Learning Journey
          </Typography>
          
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'white', fontSize: { xs: '1rem', md: '1.1rem' } }}>
                Why Join Wisentia?
              </Typography>
              
              <Box sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                p: 2,
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  animationName: `${floatAnimation}`,
                  animationDuration: '6s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }}>
                  <CheckCircleIcon sx={{ color: '#a3f7ff', mr: 1.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Access to premium learning content</Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  animationName: `${floatAnimation}`,
                  animationDuration: '6s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: '0.5s',
                }}>
                  <CheckCircleIcon sx={{ color: '#a3f7ff', mr: 1.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Track your progress across courses</Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  animationName: `${floatAnimation}`,
                  animationDuration: '6s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: '1s',
                }}>
                  <CheckCircleIcon sx={{ color: '#a3f7ff', mr: 1.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Earn NFTs for completed achievements</Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  animationName: `${floatAnimation}`,
                  animationDuration: '6s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: '1.5s',
                }}>
                  <CheckCircleIcon sx={{ color: '#a3f7ff', mr: 1.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Join our community of learners</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Sağ Panel - Kayıt Formu */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: '65%', md: '100%' },
          background: 'linear-gradient(135deg, #0b0b15 0%, #1E1037 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          p: 2,
        }}
      >
        {/* Yıldız efekti arka planı */}
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
            Back
          </Button>
        </Box>
        
        {/* Kayıt Formu */}
        <Box
          sx={{
            maxWidth: 420,
            width: '100%',
            position: 'relative',
            zIndex: 2,
            bgcolor: 'rgba(10, 10, 25, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 2.5,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Form Header */}
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Avatar
              sx={{
                mx: 'auto',
                mb: 1.5,
                bgcolor: '#8E54E9',
                width: 48,
                height: 48,
              }}
            >
              <PersonIcon fontSize="medium" />
            </Avatar>
            <Typography
              variant="h5"
              component="h1"
              fontWeight="bold"
              sx={{
                color: 'white',
                mb: 0.5,
                fontSize: '1.3rem'
              }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              Fill in the details below to get started
            </Typography>
          </Box>
          
          {/* Hata mesajı */}
          {submitError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 1,
                bgcolor: 'rgba(244,67,54,0.1)',
                color: '#ff8a80',
                border: '1px solid rgba(244,67,54,0.2)',
                py: 0.5,
                fontSize: '0.8rem'
              }}
            >
              {submitError}
            </Alert>
          )}
          
          {/* Adım göstergesi */}
          <Box sx={{ width: '100%', mb: 2.5, maxWidth: 380, mx: 'auto' }}>
            <Stepper activeStep={activeStep} alternativeLabel={false} 
              connector={
                <div style={{ 
                  width: '100%', 
                  height: '1px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  top: 12
                }}></div>
              }
            >
              {[
                { label: 'Account\nInformation' },
                { label: 'Confirmation' }
              ].map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => {
                      // Tamamlanan adımlar için check ikon, aktif adım için numara, pasif adımlar için numara
                      return completed ? (
                        <Avatar 
                          sx={{ 
                            width: 22, 
                            height: 22, 
                            bgcolor: '#8E54E9',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                        </Avatar>
                      ) : (
                        <Avatar 
                          sx={{ 
                            width: 22, 
                            height: 22, 
                            bgcolor: active ? '#8E54E9' : 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      );
                    }}
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: 'white',  // Tüm adım yazılarını beyaz yap
                        mt: 0.5,
                        fontSize: '0.7rem',
                        whiteSpace: 'pre-line',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      },
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          {/* Adım içeriği */}
          <Box component="form" noValidate sx={{ mb: 2.5 }}>
            {steps[activeStep].content}
          </Box>
          
          {/* Adım butonları */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mx: 'auto',
            maxWidth: 380
          }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{
                color: 'white',
                fontSize: '0.85rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
                '&.Mui-disabled': {
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#8E54E9',
                    color: 'white',
                    px: 3,
                    py: 0.8,
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    '&:hover': {
                      bgcolor: '#7b46d3',
                    },
                  }}
                >
                  {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#8E54E9',
                    color: 'white',
                    px: 2.5,
                    py: 0.8,
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    '&:hover': {
                      bgcolor: '#7b46d3',
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Zaten hesabınız var mı? */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              Already have an account?{' '}
              <Link
                component={NextLink}
                href="/login"
                sx={{
                  color: '#8E54E9',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}