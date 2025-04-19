'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

// Cookie'leri temizleme fonksiyonu
const clearAuthCookies = () => {
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  
  // Kritik cookie'leri özellikle temizle
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Login/Register sayfalarında cookie'leri temizle
  useEffect(() => {
    if (isAuthPage) {
      // Cookie'leri ve localStorage'ı temizle
      clearAuthCookies();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      
      console.log('Auth sayfası: Tüm oturum bilgileri temizlendi');
    }
  }, [isAuthPage, pathname]);

  return (
    <html lang="en">
      <head>
        {isAuthPage && (
          <>
            <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {isAdminPage ? (
              // Admin sayfaları için MainLayout kullanma
              children
            ) : (
              // Normal sayfalar için MainLayout kullan
              <MainLayout>
                {children}
              </MainLayout>
            )}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}