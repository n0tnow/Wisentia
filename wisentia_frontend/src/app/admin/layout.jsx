'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  // Başlangıçta hydration için sabit değer kullan
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Dark mode theme
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminThemeMode', newMode ? 'dark' : 'light');
    }
  };

  // Client-side only operations in useEffect
  useEffect(() => {
    setMounted(true);
    
    // Load theme preference from local storage - client-side only!
    try {
      const savedTheme = localStorage.getItem('adminThemeMode');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Check system preference
        setDarkMode(true);
      }
    } catch (e) {
      console.log('Could not access localStorage', e);
    }
  }, []);

  // Check authentication after mounted
  useEffect(() => {
    if (mounted && !isLoading) {
      try {
        // Check if user is authenticated and has admin role
        const userObj = user || JSON.parse(localStorage.getItem('user') || '{}');
        if (!isAuthenticated() || userObj.role !== 'admin') {
          router.push('/login?redirect=/admin/dashboard');
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.log('Auth check error', e);
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router, mounted]);

  // Hydration: Return a simplified first render that will match server output
  if (!mounted) {
    return (
      <ThemeProvider theme={theme}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f7fa'
        }}>
          <div className="loader"></div>
        </div>
      </ThemeProvider>
    );
  }

  // Show loading after hydration
  if (loading || isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: darkMode ? '#111827' : '#f5f7fa'
        }}>
          <div className="loader"></div>
        </div>
      </ThemeProvider>
    );
  }

  // Main layout (using div instead of Box)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden',
        backgroundColor: darkMode ? '#111827' : '#f5f7fa'
      }}>
        <AdminSidebar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
        >
          {children}
        </AdminSidebar>
        
        {/* Add global styles for admin section */}
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            background-color: ${darkMode ? '#111827' : '#f5f7fa'};
            overflow: hidden;
          }
          
          .loader {
            border: 4px solid rgba(${darkMode ? '255, 255, 255, 0.1' : '0, 0, 0, 0.1'});
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

          /* Hide scrollbar for Chrome, Safari and Opera */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          /* Track */
          ::-webkit-scrollbar-track {
            background: ${darkMode ? '#1a202c' : '#f1f1f1'};
          }

          /* Handle */
          ::-webkit-scrollbar-thumb {
            background: ${darkMode ? '#4a5568' : '#888'};
            border-radius: 4px;
          }

          /* Handle on hover */
          ::-webkit-scrollbar-thumb:hover {
            background: ${darkMode ? '#718096' : '#555'};
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}