'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  
  // Login, register ve admin sayfalarında header ve footer'ı gizle
  useEffect(() => {
    const excludePaths = ['/login', '/register', '/auth/login', '/auth/register'];
    const isAdminPage = pathname?.startsWith('/admin');
    
    setShowHeaderFooter(!excludePaths.includes(pathname) && !isAdminPage);
  }, [pathname]);
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* Header'ı koşullu olarak render et */}
      {showHeaderFooter && <Header />}
      
      {/* Ana içerik */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          // Header varsa sayfanın üst kısmına padding ekleyin (AppBar yüksekliği)
          pt: showHeaderFooter ? { xs: '56px', sm: '64px' } : 0,
        }}
      >
        {children}
      </Box>
      
      {/* Footer'ı koşullu olarak render et */}
      {showHeaderFooter && <Footer />}
    </Box>
  );
}