'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

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
    if (mounted && !isLoading) {
      try {
        // Kullanıcının admin rolüne sahip olup olmadığını kontrol et
        const userObj = user || JSON.parse(localStorage.getItem('user') || '{}');
        if (!isAuthenticated() || userObj.role !== 'admin') {
          router.push('/login?redirect=/admin/dashboard');
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.log('Yetkilendirme kontrolü hatası:', e);
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router, mounted]);

  // Hydration: İlk render için basitleştirilmiş çıktı
  if (!mounted) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </ThemeProvider>
    );
  }

  // Yükleniyor durumu
  if (loading || isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </ThemeProvider>
    );
  }

  // Ana layout
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
          background: ${darkMode ? '#1a202c' : '#f1f1f1'};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4a5568' : '#888'};
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#718096' : '#555'};
        }

        /* Diğer tarayıcılar için kaydırma çubuğu stili */
        * {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? '#4a5568 #1a202c' : '#888 #f1f1f1'};
        }
      `}</style>
    </ThemeProvider>
  );
}