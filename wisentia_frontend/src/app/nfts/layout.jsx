'use client';

import { Box } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedLayout from '@/components/auth/ProtectedRoute';

export default function NFTLayout({ children }) {
  // Koruma gerektirmeyen bir layout kullanın
  // requireAuth=false, giriş yapmadan da NFT sayfasına erişime izin verir
  return (
    <ProtectedLayout requireAuth={false}>
      
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      
    </ProtectedLayout>
  );
}