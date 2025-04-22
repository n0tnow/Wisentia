'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  // State tanımları
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Dark mode toggle
  const toggleDarkMode = () => {
    if (typeof window !== 'undefined') {
      const newMode = !darkMode;
      setDarkMode(newMode);
      localStorage.setItem('adminThemeMode', newMode ? 'dark' : 'light');
      // CSS değişkenlerini güncelle
      document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    }
  };

  // Client-side kod
  useEffect(() => {
    setMounted(true);
    
    // Tema tercihini yükle
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('adminThemeMode');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        setDarkMode(isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } catch (e) {
        console.error('LocalStorage erişim hatası:', e);
      }
    }
  }, []);

  // Auth kontrolü
  useEffect(() => {
    if (!mounted || isLoading) return;
    
    try {
      if (typeof window !== 'undefined') {
        const userObj = user || JSON.parse(localStorage.getItem('user') || '{}');
        if (!isAuthenticated() || userObj.role !== 'admin') {
          router.push('/login?redirect=/admin/dashboard');
        } else {
          setLoading(false);
        }
      }
    } catch (e) {
      console.error('Auth kontrol hatası:', e);
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, user, router, mounted]);

  // Yükleme ekranı
  if (!mounted || loading || isLoading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <style jsx>{`
          .loader-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            background-color: var(--background-color);
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
          }
          .loader {
            border: 4px solid var(--loader-background);
            border-radius: 50%;
            border-top: 4px solid var(--primary-color);
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Ana layout
  return (
    <>
      <div id="admin-root">
        <AdminSidebar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
        >
          <div className="admin-content">
            {children}
          </div>
        </AdminSidebar>
      </div>

      <style jsx global>{`
        :root {
          --primary-color: #3f51b5;
          --secondary-color: #f50057;
          --background-color: #f5f7fa;
          --paper-color: #ffffff;
          --text-primary: #333333;
          --text-secondary: #666666;
          --loader-background: rgba(0, 0, 0, 0.1);
          --scrollbar-track: #f1f1f1;
          --scrollbar-thumb: #888;
          --scrollbar-thumb-hover: #555;
        }

        [data-theme="dark"] {
          --primary-color: #3f51b5;
          --secondary-color: #f50057;
          --background-color: #111827;
          --paper-color: #1f2937;
          --text-primary: #ffffff;
          --text-secondary: #a0a0a0;
          --loader-background: rgba(255, 255, 255, 0.1);
          --scrollbar-track: #1a202c;
          --scrollbar-thumb: #4a5568;
          --scrollbar-thumb-hover: #718096;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: var(--background-color);
          color: var(--text-primary);
          font-family: 'Poppins', 'Roboto', 'Arial', sans-serif;
        }
        
        /* Next.js tarafından oluşturulan tüm ana konteynerleri sıfırla */
        #__next, 
        #__next > div, 
        main,
        body > div > main,
        [class*="css-"] {
          display: contents !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          width: auto !important;
        }
        
        #admin-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
        }
        
        .admin-content {
          flex: 1;
          overflow: auto;
          height: 100vh;
          background-color: var(--background-color);
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
        }
      `}</style>
    </>
  );
}