'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Container, Typography, Button, Grid, Paper, LinearProgress, Chip, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import StarIcon from '@mui/icons-material/Star';
import PublicIcon from '@mui/icons-material/Public';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import GlowingStarsBackground from '@/components/GlowingStarsBackground';
import Head from 'next/head';
import { green, orange, red } from '@mui/material/colors';
import Image from 'next/image';
import RewardModal from '@/components/shared/RewardModal';
import Link from 'next/link';
import { alpha, useTheme, IconButton, Avatar } from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';

export default function QuestDetailPage() {
  const { questId } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const theme = useTheme();
  
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedConditions, setCompletedConditions] = useState([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  // İlk yükleme
  useEffect(() => {
    const fetchQuestDetails = async () => {
      try {
        const response = await fetch(`/api/quests/${questId}`);
        
        if (!response.ok) {
          throw new Error(`API hatası: ${response.status}`);
        }
        
        const data = await response.json();
        setQuest(data);
        
        // İlerleme durumunda tamamlanan koşulları ayarla
        if (data.progress?.currentProgress > 0) {
          // Burada basitleştirilmiş bir yaklaşım kullanıyoruz
          // Backend'den hangi koşulların tamamlandığını almalıyız
          const completedCount = data.progress.currentProgress;
          const completedIds = data.conditions.slice(0, completedCount).map(c => c.conditionId);
          setCompletedConditions(completedIds);
        }
        
        // İçeriği göster
        setTimeout(() => {
          setShowContent(true);
        }, 800);
      } catch (error) {
        console.error("Quest detayları yüklenemedi:", error);
        toast.error("Quest detayları yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };
    
    if (questId) {
      fetchQuestDetails();
    }
  }, [questId, toast]);
  
  // Koşulun tamamlanma durumunu değiştir
  const toggleCondition = async (conditionId) => {
    if (!isAuthenticated) {
      toast.warn("Bu işlemi yapmak için giriş yapmalısınız.");
      return;
    }
    
    let newCompletedConditions;
    
    // Koşulu tamamla veya tamamlanmış durumdan çıkar
    if (completedConditions.includes(conditionId)) {
      newCompletedConditions = completedConditions.filter(id => id !== conditionId);
    } else {
      newCompletedConditions = [...completedConditions, conditionId];
    }
    
    setCompletedConditions(newCompletedConditions);
    
    try {
      // İlerlemeyi kaydet
      const response = await fetch(`/api/quests/${questId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedConditionIds: newCompletedConditions
        })
      });
      
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Tüm koşullar tamamlandıysa ödül göster
      if (data.progress?.isCompleted) {
        setShowRewardModal(true);
      }
      
    } catch (error) {
      console.error("İlerleme güncellenemedi:", error);
      toast.error("İlerleme kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  // Ödül talebi
  const claimReward = async () => {
    try {
      const response = await fetch(`/api/quests/${questId}/claim-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }
      
      const data = await response.json();
      
      toast.success("Ödülünüz başarıyla talep edildi!");
      setShowRewardModal(true);
      
    } catch (error) {
      console.error("Ödül talebi başarısız:", error);
      toast.error("Ödül talep edilemedi. Lütfen tekrar deneyin.");
    }
  };

  // Yükleme durumunda veya quest bulunamadığında
  if (loading || !quest) {
    return (
      <Container maxWidth="lg" sx={{ pt: 8, pb: 8, textAlign: 'center' }}>
        <Typography variant="h5">Yükleniyor...</Typography>
      </Container>
    );
  }

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
          Quest Details
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
              {quest.title || "Quest Title"}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip 
                label={(quest.difficulty || "easy").charAt(0).toUpperCase() + (quest.difficulty || "easy").slice(1)} 
                color="primary"
                size="small"
              />
              
              <Chip 
                icon={<TokenIcon />}
                label={`${quest.rewardPoints || 0} Points`}
                size="small"
                color="secondary"
              />
            </Box>
            
            <Typography variant="body1" paragraph>
              {quest.description || "Quest description"}
            </Typography>
            
            {/* İlerleme Çubuğu */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Completion
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {quest.progress?.completionPercentage || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={quest.progress?.completionPercentage || 0}
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
              {(quest.conditions || []).map((condition, index) => (
                <Box 
                  key={condition.conditionId || index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    borderRadius: 2,
                    mb: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                  onClick={() => toggleCondition(condition.conditionId)}
                >
                  {completedConditions.includes(condition.conditionId) ? (
                    <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                  ) : (
                    <RadioButtonUncheckedIcon color="disabled" sx={{ mr: 2 }} />
                  )}
                  <Typography variant="body1">
                    {condition.description}
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
                onClick={claimReward}
                disabled={!quest.progress?.isCompleted}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                {quest.progress?.isCompleted ? 'Claim Reward' : 'Complete All Conditions'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Ödül Modal */}
      <RewardModal
        open={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        rewardPoints={quest.rewardPoints}
        rewardNft={quest.rewardNft}
      />
    </Container>
  );
}