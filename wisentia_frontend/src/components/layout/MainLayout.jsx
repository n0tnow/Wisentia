'use client';

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const [showChatWidget, setShowChatWidget] = useState(true);
  
  // Hide header, footer, and chat widget on login, register and admin pages
  useEffect(() => {
    const excludePaths = ['/login', '/register', '/auth/login', '/auth/register'];
    const isAdminPage = pathname?.startsWith('/admin');
    
    setShowHeaderFooter(!excludePaths.includes(pathname) && !isAdminPage);
    setShowChatWidget(!excludePaths.includes(pathname) && !isAdminPage);
  }, [pathname]);
  
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* Header */}
      {showHeaderFooter && <Header />}
      
      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          // Add padding if header is shown
          pt: showHeaderFooter ? { xs: '56px', sm: '64px' } : 0,
        }}
      >
        {children}
      </Box>
      
      {/* Footer */}
      {showHeaderFooter && <Footer />}
      
      {/* Chat Widget */}
      {showChatWidget && <ChatWidget />}
    </Box>
  );
}