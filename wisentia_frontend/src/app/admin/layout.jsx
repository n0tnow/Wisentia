'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CssBaseline, ThemeProvider, Box, CircularProgress } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

// Auth wrapper component to handle auth context safely
function AuthWrapper({ children, onAuthReady }) {
  const [authReady, setAuthReady] = useState(false);
  
  try {
    const { user, isAuthenticated, isLoading: isAuthLoading, authChecked } = useAuth();
    
    useEffect(() => {
      if (authChecked && !isAuthLoading && !authReady) {
        setAuthReady(true);
        onAuthReady({ user, isAuthenticated });
      }
    }, [authChecked, isAuthLoading, user, isAuthenticated, authReady]);
    
    if (!authReady) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          width="100vw"
        >
          <CircularProgress size={60} />
        </Box>
      );
    }
    
    return children;
  } catch (error) {
    console.error('Auth context error in admin layout:', error);
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width="100vw"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
}

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [authData, setAuthData] = useState({ user: null, isAuthenticated: false });
  const router = useRouter();
  
  // Dark mode teması oluştur
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#111827' : '#f5f7fa',
        paper: darkMode ? '#1f2937' : '#ffffff',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
  });

  // Dark mode geçişi
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminThemeMode', newMode ? 'dark' : 'light');
    }
  };

  // Auth ready handler
  const handleAuthReady = useCallback(({ user, isAuthenticated }) => {
    setAuthData({ user, isAuthenticated, isAuthLoading: false });
  }, []);

  // Client-side işlemleri useEffect içinde yap
  useEffect(() => {
    setMounted(true);
    
    // Tema tercihini local storage'dan yükle
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('adminThemeMode');
        if (savedTheme) {
          setDarkMode(savedTheme === 'dark');
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Sistem tercihini kontrol et
          setDarkMode(true);
        }
      } catch (e) {
        console.log('LocalStorage erişim hatası:', e);
      }
    }
  }, []);

  // Yetkilendirme kontrolü
  useEffect(() => {
    if (mounted && authData.user !== null) {
      try {
        // Kullanıcının admin rolüne sahip olup olmadığını kontrol et
        const userObj = authData.user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {});
        if (!authData.isAuthenticated || userObj.role !== 'admin') {
          console.log('Admin yetkilendirme başarısız, yönlendiriliyor...');
          router.push('/login?redirect=/admin/dashboard');
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.log('Yetkilendirme kontrolü hatası:', e);
        router.push('/login');
      }
    }
  }, [authData.user, authData.isAuthenticated, router, mounted]);

  // Hydration: İlk render için basitleştirilmiş çıktı
  if (!mounted) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthWrapper onAuthReady={handleAuthReady}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            width="100vw"
          >
            <CircularProgress size={60} />
          </Box>
        </AuthWrapper>
      </ThemeProvider>
    );
  }

  // Yükleniyor durumu
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthWrapper onAuthReady={handleAuthReady}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            width="100vw"
          >
            <CircularProgress size={60} />
          </Box>
        </AuthWrapper>
      </ThemeProvider>
    );
  }

  // Ana layout
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthWrapper onAuthReady={handleAuthReady}>
        <AdminSidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
          <div className="admin-content-wrapper">
            {children}
          </div>
        </AdminSidebar>
        
        {/* Global stiller */}
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            background-color: ${darkMode ? '#111827' : '#f5f7fa'};
          }
          
          .loader-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            background-color: ${darkMode ? '#111827' : '#f5f7fa'};
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
          }
          
          .loader {
            border: 4px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            border-radius: 50%;
            border-top: 4px solid #3f51b5;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Admin içerik alanı düzenlemesi */
          .admin-content-wrapper {
            height: 100%;
            width: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
          }

          /* Kaydırma çubuğu stili */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: ${darkMode ? '#374151' : '#f1f1f1'};
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: ${darkMode ? '#6b7280' : '#c1c1c1'};
            border-radius: 4px;
            transition: background 0.3s ease;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: ${darkMode ? '#9ca3af' : '#a8a8a8'};
          }

          /* Firefox için */
          * {
            scrollbar-width: thin;
            scrollbar-color: ${darkMode ? '#6b7280 #374151' : '#c1c1c1 #f1f1f1'};
          }
        `}</style>
      </AuthWrapper>
    </ThemeProvider>
  );
}