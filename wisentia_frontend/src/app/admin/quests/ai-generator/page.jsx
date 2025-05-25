"use client";

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Box, Container, Typography, Paper, Grid, Card, CardContent, 
  Divider, Button, Stack, Link
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AIAutoQuestGenerator from '@/components/admin/AIAutoQuestGenerator';
import { useRouter } from 'next/navigation';

export default function AIQuestGenerator() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/admin/quests');
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2
            }}
          >
            Back to Quests
          </Button>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
          <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Quest Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Automatically create complete quests with database-driven conditions and rewards
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Database-Aware Quest Generation
              </Typography>
              <Typography variant="body1" paragraph>
                Our advanced AI system will analyze your database content and automatically generate quests with real, meaningful conditions tied to your actual courses, quizzes, and videos.
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <PlaylistAddCheckIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                    Ready-to-Use Conditions
                  </Typography>
                  <Typography variant="body2">
                    The AI selects actual courses, quizzes, and videos from your database to create meaningful learning paths.
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                    Educational Expertise
                  </Typography>
                  <Typography variant="body2">
                    Quests are designed with educational principles in mind, creating logical progression and challenges.
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <RocketLaunchIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                    Instant Creation
                  </Typography>
                  <Typography variant="body2">
                    Generate and deploy quests instantly with just a few clicks. No manual configuration needed.
                  </Typography>
                </Box>
              </Stack>
              
              <Box sx={{ mt: 4 }}>
                <AIAutoQuestGenerator />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  How It Works
                </Typography>
                <Typography variant="body2" paragraph>
                  Our AI quest generator follows these steps:
                </Typography>
                
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" component="div">
                    <ol>
                      <li><strong>Database Analysis</strong> - Examines your existing courses, quizzes, videos, and NFT rewards</li>
                      <li><strong>Content Selection</strong> - Picks appropriate content items based on your specified difficulty</li>
                      <li><strong>Quest Design</strong> - Creates a coherent quest with logical conditions</li>
                      <li><strong>Database Integration</strong> - Automatically adds the quest to your database with proper references</li>
                    </ol>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tips for Best Results
                </Typography>
                
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" component="div">
                    <ul>
                      <li>Ensure you have several active courses, quizzes, and videos in your database</li>
                      <li>Create NFTs to be used as rewards for your quests</li>
                      <li>Start with "Intermediate" difficulty for most balanced quests</li>
                      <li>Review generated quests before publishing to ensure they match your learning objectives</li>
                      <li>Use different difficulty settings to create progression paths for your users</li>
                    </ul>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
} 