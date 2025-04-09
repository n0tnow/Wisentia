'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TokenIcon from '@mui/icons-material/Token';

// Bu sayfa herhangi bir kimlik doğrulama/yetkilendirme mekanizması olmadan çalışacak 
// ve sorunun giderilmesi için statik içerik gösterecek

export default function StaticQuestPage() {
  const { questId } = useParams();
  const theme = useTheme();
  
  // Basit durum yönetimi
  const [showContent, setShowContent] = useState(false);
  
  // Sayfa yüklendiğinde içeriği kısa bir gecikme ile göster (animasyon etkisi için)
  useEffect(() => {
    console.log("Static Quest Page loaded for ID:", questId);
    
    // içeriği 800ms gecikme ile göster
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [questId]);
  
  // Basit içerik, sabit mock veri kullanıyoruz
  const quest = {
    id: questId || 1,
    title: "Static Quest Example",
    description: "This is a completely static quest page that doesn't rely on authentication or external data loading. It's meant to help debug the routing issues.",
    difficulty: "easy",
    rewardPoints: 500,
    progress: {
      completionPercentage: 60,
      isCompleted: false
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 8, pb: 8 }}>
      {/* Üst Başlık */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          component={Link}
          href="/quests"
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Quest Details (Static Version)
        </Typography>
      </Box>
      
      {/* Ana İçerik Kartı */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          transition: 'opacity 0.5s ease-in',
          opacity: showContent ? 1 : 0
        }}
      >
        <Grid container spacing={4}>
          {/* Sol Sütun - Ana İçerik */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {quest.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip 
                label={quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)} 
                color="primary"
                size="small"
              />
              
              <Chip 
                icon={<TokenIcon />}
                label={`${quest.rewardPoints} Points`}
                size="small"
                color="secondary"
              />
            </Box>
            
            <Typography variant="body1" paragraph>
              {quest.description}
            </Typography>
            
            {/* İlerleme Çubuğu */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Completion
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {quest.progress.completionPercentage}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={quest.progress.completionPercentage}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                }}
              />
            </Box>
            
            {/* Görev Koşulları */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quest Conditions
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {['Condition 1', 'Condition 2', 'Condition 3'].map((condition, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    borderRadius: 2,
                    mb: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  {index === 0 ? (
                    <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  ) : (
                    <CheckCircleIcon color="disabled" sx={{ mr: 2 }} />
                  )}
                  <Typography variant="body1">
                    {condition}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          
          {/* Sağ Sütun - Ödül Bilgisi */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                mb: 4
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quest Reward
              </Typography>
              
              <Box sx={{ 
                width: '100%', 
                height: 200, 
                borderRadius: 2, 
                mb: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100,
                    bgcolor: alpha(theme.palette.secondary.main, 0.2)
                  }}
                >
                  <TokenIcon sx={{ fontSize: 50, color: theme.palette.secondary.main }} />
                </Avatar>
              </Box>
              
              <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                Achievement Badge
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                This NFT is a unique digital asset that proves you have successfully completed this quest.
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={!quest.progress.isCompleted}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                {quest.progress.isCompleted ? 'Claim Reward' : 'Complete All Conditions'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}