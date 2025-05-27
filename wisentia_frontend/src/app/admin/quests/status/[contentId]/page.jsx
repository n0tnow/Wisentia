"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Box, Button, CircularProgress, Card, CardContent, Typography,
  Alert, Divider, Chip, Stack, Paper, LinearProgress, Container,
  Grid, IconButton, Skeleton, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';

export default function QuestStatusPage() {
  const router = useRouter();
  const params = useParams();
  const { contentId } = params;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questData, setQuestData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [approving, setApproving] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    fetchQuestStatus();
    
    // Set up auto-refresh for processing and queued status
    const interval = setInterval(() => {
      if (questData?.status === 'processing' || questData?.status === 'queued') {
        fetchQuestStatus();
      }
    }, 2000); // 2 seconds for faster updates
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user, contentId]);

  // Separate effect to handle status changes
  useEffect(() => {
    if (questData?.status && questData.status !== 'processing' && questData.status !== 'queued') {
      // Clear interval when status is no longer processing or queued
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [questData?.status, refreshInterval]);
  
  const fetchQuestStatus = async () => {
    try {
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/admin/quests/status/${contentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quest status');
      }
      
      const data = await response.json();
      setQuestData(data);
    } catch (err) {
      console.error('Error fetching quest status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveQuest = async () => {
    try {
      setError(null);
      setApproving(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`/api/admin/quests/approve/${contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve quest');
      }
      
      const data = await response.json();
      
      // If quest was successfully created, redirect to quest page
      if (data.questId) {
        router.push(`/admin/quests/${data.questId}`);
      } else {
        // Otherwise refresh the data
        fetchQuestStatus();
      }
    } catch (err) {
      console.error('Error approving quest:', err);
      setError(err.message);
    } finally {
      setApproving(false);
    }
  };
  
  const getStatusChip = (status) => {
    switch (status?.toLowerCase()) {
      case 'queued':
        return <Chip 
          icon={<ScheduleIcon />} 
          label="Queued" 
          color="default" 
          size="small" 
        />;
      case 'pending':
        return <Chip 
          icon={<ScheduleIcon />} 
          label="Pending" 
          color="warning" 
          size="small" 
        />;
      case 'processing':
        return <Chip 
          icon={<AutoAwesomeIcon />} 
          label="AI Processing" 
          color="info" 
          size="small" 
        />;
      case 'completed':
        return <Chip 
          icon={<CheckCircleIcon />} 
          label="Completed" 
          color="success" 
          size="small" 
        />;
      case 'failed':
        return <Chip 
          icon={<ErrorOutlineIcon />} 
          label="Failed" 
          color="error" 
          size="small" 
        />;
      case 'duplicate_found':
        return <Chip 
          icon={<ErrorOutlineIcon />} 
          label="Duplicate Found" 
          color="warning" 
          size="small" 
        />;
      default:
        return <Chip 
          label={status || 'Unknown'} 
          size="small" 
        />;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => router.push('/admin/quests')}
            >
              Back to Quests
            </Button>
            
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={fetchQuestStatus}
              disabled={loading}
            >
              Refresh Status
            </Button>
          </Box>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Loading state */}
          {loading ? (
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={30} />
            </Box>
          ) : !questData ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Quest data not found
            </Alert>
          ) : (
            <>
              {/* Status Card */}
              <Card sx={{ mb: 3, position: 'relative', overflow: 'hidden' }}>
                {questData.status === 'processing' && (
                  <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                )}
                
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h5" component="h1" gutterBottom>
                        Quest Generation #{contentId}
                        {questData.content?.createdQuestId && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Created Quest ID: {questData.content.createdQuestId}
                          </Typography>
                        )}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        {getStatusChip(questData.status)}
                        
                        <Typography variant="body2" color="text.secondary">
                          Created: {formatDate(questData.creationDate)}
                        </Typography>
                      </Stack>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Generation Parameters:</Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">Difficulty:</Typography>
                              <Typography variant="body1">{questData.generationParams?.difficulty || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">Category:</Typography>
                              <Typography variant="body1">{questData.generationParams?.category || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">Points Required:</Typography>
                              <Typography variant="body1">{questData.generationParams?.pointsRequired || '0'}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="body2" color="text.secondary">Points Reward:</Typography>
                              <Typography variant="body1">{questData.generationParams?.pointsReward || '0'}</Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>

                      {/* API Cost Information */}
                      {questData.content?.apiCost && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" gutterBottom>API Cost Information:</Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Total Cost:</Typography>
                                <Typography variant="body1" color="primary" fontWeight="bold">
                                  ${questData.content.apiCost.total_cost?.toFixed(4) || '0.0000'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Input Tokens:</Typography>
                                <Typography variant="body1">{questData.content.apiCost.input_tokens || 0}</Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Output Tokens:</Typography>
                                <Typography variant="body1">{questData.content.apiCost.output_tokens || 0}</Typography>
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <Typography variant="body2" color="text.secondary">Currency:</Typography>
                                <Typography variant="body1">{questData.content.apiCost.currency || 'USD'}</Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          textAlign: 'center'
                        }}
                      >
                        {questData.status === 'processing' ? (
                          <>
                            <CircularProgress size={60} sx={{ mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Processing Quest</Typography>
                            <Typography color="text.secondary">
                              The AI is generating a quest based on your parameters. This may take a minute.
                            </Typography>
                          </>
                        ) : questData.status === 'completed' ? (
                          <>
                            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Quest Generated Successfully</Typography>
                            <Button 
                              variant="contained" 
                              color="success" 
                              onClick={handleApproveQuest}
                              disabled={approving}
                              startIcon={approving ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                              sx={{ mt: 2 }}
                            >
                              {approving ? 'Approving...' : 'Approve & Create Quest'}
                            </Button>
                          </>
                        ) : questData.status === 'failed' ? (
                          <>
                            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Generation Failed</Typography>
                            <Typography color="text.secondary">
                              The quest generation process encountered an error.
                            </Typography>
                          </>
                        ) : questData.status === 'duplicate_found' ? (
                          <>
                            <ErrorOutlineIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Duplicate Quest Found</Typography>
                            <Typography color="text.secondary">
                              A quest with similar title and description already exists in the database.
                            </Typography>
                            {questData.content?.duplicateQuestId && (
                              <Button 
                                variant="outlined" 
                                color="primary" 
                                onClick={() => router.push(`/admin/content/quests/${questData.content.duplicateQuestId}`)}
                                sx={{ mt: 2 }}
                              >
                                View Existing Quest
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <ScheduleIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Pending</Typography>
                            <Typography color="text.secondary">
                              The quest is waiting to be processed.
                            </Typography>
                          </>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              {/* Quest Content Section */}
              {(questData.status === 'completed' || questData.status === 'duplicate_found') && questData.content && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Generated Quest</Typography>
                    
                    {questData.content.title && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Title:</Typography>
                        <Typography variant="h5">{questData.content.title}</Typography>
                      </Box>
                    )}
                    
                    {questData.content.description && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Description:</Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="body1">{questData.content.description}</Typography>
                        </Paper>
                      </Box>
                    )}
                    
                    {questData.content.conditions && questData.content.conditions.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Conditions:</Typography>
                        {questData.content.conditions.map((condition, index) => (
                          <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>{condition.type}</Typography>
                            <Typography variant="body2">{condition.description}</Typography>
                            <Chip 
                              label={`Target ID: ${condition.targetId || 'None'}`} 
                              size="small" 
                              color="secondary" 
                              sx={{ mt: 1, mr: 1 }} 
                            />
                            <Chip 
                              label={`Target Value: ${condition.targetValue || '0'}`} 
                              size="small" 
                              color="primary" 
                              sx={{ mt: 1 }} 
                            />
                          </Paper>
                        ))}
                      </Box>
                    )}
                    
                    {/* NFT Recommendation Section */}
                    {questData.content.nftRecommendation && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          NFT Recommendation
                        </Typography>
                        
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 3, 
                            borderColor: 'primary.main',
                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05), transparent)'
                          }}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                              <Typography variant="h5" gutterBottom>
                                {questData.content.nftRecommendation.title}
                              </Typography>
                              
                              <Typography variant="body1" paragraph>
                                {questData.content.nftRecommendation.description}
                              </Typography>
                              
                              <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Rarity:</Typography>
                                  <Chip 
                                    label={questData.content.nftRecommendation.rarity || 'Common'} 
                                    color={
                                      (questData.content.nftRecommendation.rarity === 'Legendary' && 'error') ||
                                      (questData.content.nftRecommendation.rarity === 'Epic' && 'warning') ||
                                      (questData.content.nftRecommendation.rarity === 'Rare' && 'info') ||
                                      (questData.content.nftRecommendation.rarity === 'Uncommon' && 'success') ||
                                      'default'
                                    }
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Type ID:</Typography>
                                  <Typography variant="body1">
                                    {questData.content.nftRecommendation.nftTypeId || 'Unknown'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="body2" color="text.secondary">Trade Value:</Typography>
                                  <Typography variant="body1">
                                    {questData.content.nftRecommendation.tradeValue || '0'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 2, 
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center'
                                }}
                              >
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Visual Description:
                                </Typography>
                                <Typography variant="body2">
                                  {questData.content.nftRecommendation.visualDescription || 'No visual description provided'}
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    )}
                    
                    {/* NFT Creation Status */}
                    {questData.nft && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" color="success.main" gutterBottom>
                          NFT Created Successfully
                        </Typography>
                        
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 3, 
                            borderColor: 'success.main',
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), transparent)'
                          }}
                        >
                          <Typography variant="h5" gutterBottom>
                            {questData.nft.title}
                          </Typography>
                          
                          <Typography variant="body1" paragraph>
                            {questData.nft.description}
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">NFT ID:</Typography>
                              <Typography variant="body1" fontWeight="bold">
                                {questData.nft.id}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">Rarity:</Typography>
                              <Chip 
                                label={questData.nft.rarity || 'Common'} 
                                color={
                                  (questData.nft.rarity === 'Legendary' && 'error') ||
                                  (questData.nft.rarity === 'Epic' && 'warning') ||
                                  (questData.nft.rarity === 'Rare' && 'info') ||
                                  (questData.nft.rarity === 'Uncommon' && 'success') ||
                                  'default'
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">Type:</Typography>
                              <Typography variant="body1">
                                {questData.nft.typeName || 'Unknown'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">Trade Value:</Typography>
                              <Typography variant="body1">
                                {questData.nft.tradeValue || '0'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    )}
                    
                    {questData.content.estimated_completion_time && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Estimated Completion Time:</Typography>
                        <Typography variant="body1">{questData.content.estimated_completion_time} minutes</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Error Content */}
              {questData.status === 'failed' && questData.error && (
                <Card sx={{ mb: 3, borderColor: 'error.main' }}>
                  <CardContent>
                    <Typography variant="h6" color="error" gutterBottom>Error Details</Typography>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {questData.error}
                    </Alert>
                    
                    {questData.errorDetails && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Technical Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Paper variant="outlined" sx={{ p: 2, background: '#f5f5f5' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                              {questData.errorDetails}
                            </Typography>
                          </Paper>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Raw API Response (Debug) */}
              <Accordion sx={{ mb: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Raw API Response (Debug)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper variant="outlined" sx={{ p: 2, background: '#f5f5f5' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {JSON.stringify(questData, null, 2)}
                    </Typography>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </Box>
      </Container>
    </AdminLayout>
  );
} 