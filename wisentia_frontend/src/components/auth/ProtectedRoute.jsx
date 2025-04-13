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
    if (isLoading || !authChecked || redirecting) return;
  
    if (!requireAuth || isAuthenticated()) {
      setIsAuthorized(true);
      return;
    }
  
    if (!isAuthenticated()) {
      return null; // middleware zaten yönlendirecek
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