'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedLayout({ children, requireAuth = true }) {
  const { isAuthenticated, isLoading, authChecked } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!requireAuth) {
      setIsAuthorized(true);
      return;
    }
    // Auth kontrolü için kapsamlı log
    console.log('ProtectedLayout auth check:', {
      isLoading,
      authChecked,
      pathname,
      isAuth: isAuthenticated(),
      requireAuth
    });
    
    // Kimlik doğrulama yüklenene kadar bekle
    if (isLoading || !authChecked) {
      return;
    }
    
    // Koruma kapalıysa veya kullanıcı giriş yapmışsa erişime izin ver
    if (!requireAuth || isAuthenticated()) {
      console.log('Access granted to', pathname);
      setIsAuthorized(true);
      return;
    }
    
    // Yetkisiz ve yönlendirme başlamamışsa yönlendir
    if (requireAuth && !isAuthenticated() && !redirecting) {
      console.log('Unauthorized access, redirecting to login from', pathname);
      setRedirecting(true);
      
      // Mevcut sayfayı redirect parametresi olarak ekle
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, authChecked, pathname, router, requireAuth, redirecting]);

  // Yükleme durumunda yükleme göstergesi göster
  if (isLoading || !authChecked) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Eğer koruma yoksa veya kimlik doğrulanmışsa içeriği göster
  if (!requireAuth || isAuthorized) {
    return children;
  }

  // Yönlendirme devam ediyorsa boş içerik göster
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}
    >
      <CircularProgress />
    </Box>
  );
}