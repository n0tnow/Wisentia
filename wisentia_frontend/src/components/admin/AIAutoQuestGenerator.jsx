"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Button, CircularProgress, Card, CardContent, Typography,
  Alert, Divider, Chip, Stack, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  AlertTitle, Tabs, Tab, Badge, Paper, LinearProgress
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ConstructionIcon from '@mui/icons-material/Construction';
import SyncIcon from '@mui/icons-material/Sync';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import DiamondIcon from '@mui/icons-material/Diamond';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LoopIcon from '@mui/icons-material/Loop';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function AIAutoQuestGenerator() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedQuest, setGeneratedQuest] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [nftCreationOpen, setNftCreationOpen] = useState(false);
  
  // New state for polling
  const [generationStatus, setGenerationStatus] = useState('');
  const [contentId, setContentId] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [retryAvailable, setRetryAvailable] = useState(false);
  const [pollingDelay, setPollingDelay] = useState(3000); // Start with 3 seconds
  const MAX_POLLING_ATTEMPTS = 40; // Increase max attempts but with exponential backoff
  const MAX_POLLING_DELAY = 15000; // Maximum 15 seconds between polls
  
  // Configuration options
  const [settings, setSettings] = useState({
    difficulty: 'intermediate',
    category: 'Learning',
    requiredPoints: 0,
    rewardPoints: 50,
    autoCreate: true
  });
  
  // Set up polling when contentId is available
  useEffect(() => {
    if (contentId && loading) {
      console.log('Setting up polling for contentId:', contentId);
      // First check immediately
      checkQuestStatus(contentId);
      
      // Then set up interval with progressive backoff
      const timeoutId = setTimeout(() => {
        setPollingCount(prev => prev + 1);
        checkQuestStatus(contentId);
        
        // Implement exponential backoff to reduce server load
        if (pollingCount > 5) {
          // After 5 polls, start slowing down the polling rate
          const newDelay = Math.min(pollingDelay * 1.5, MAX_POLLING_DELAY);
          setPollingDelay(newDelay);
          console.log(`Increased polling delay to ${newDelay}ms`);
        }
      }, pollingDelay);
      
      setPollingInterval(timeoutId);
      
      // Clean up on unmount
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [contentId, loading, pollingCount, pollingDelay]);
  
  // Add a separate effect to monitor polling count
  useEffect(() => {
    if (pollingCount > MAX_POLLING_ATTEMPTS && pollingInterval) {
      console.log(`Reached maximum polling attempts (${MAX_POLLING_ATTEMPTS}), stopping`);
      clearTimeout(pollingInterval);
      setPollingInterval(null);
      setLoading(false);
      
      // Instead of just showing an error, offer a retry option
      setRetryAvailable(true);
      setError('The quest generation is taking longer than expected. The system has implemented a fallback mechanism, but you can try again if you prefer.');
    }
  }, [pollingCount, pollingInterval]);
  
  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearTimeout(pollingInterval);
    };
  }, [pollingInterval]);
  
  const checkQuestStatus = async (id) => {
    try {
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
      }
      
      const response = await fetch(`/api/admin/quests/auto-generate?contentId=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check quest status');
      }
      
      const data = await response.json();
      
      console.log('Quest status check response:', data);
      
      if (data.content && data.content.status) {
        setGenerationStatus(data.content.status);
        
        // Update progress message based on status
        if (data.content.status === 'queued') {
          setProgressMessage('Quest generation queued, waiting to start...');
        } else if (data.content.status === 'processing') {
          setProgressMessage('AI is analyzing database and generating quest...');
          
          // Check for potential stalled processing
          if (pollingCount > 10 && data.content.message && data.content.message.includes('AI generating quest content')) {
            setProgressMessage('AI is taking longer than expected. This might be due to high load or configuration issues...');
          }
        } else if (data.content.status === 'completed' || data.content.status === 'pending' || data.content.status === 'approved') {
          setLoading(false);
          setSuccess(true);
          setGeneratedQuest(data.content);
          
          // Clear polling interval
          if (pollingInterval) {
            clearTimeout(pollingInterval);
            setPollingInterval(null);
          }
        } else if (data.content.status === 'failed') {
          setLoading(false);
          setError(data.content.error || 'Quest generation failed');
          
          // Clear polling interval
          if (pollingInterval) {
            clearTimeout(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
      
      // Check for error message in the content even if status is not 'failed'
      if (data.content && data.content.error) {
        setLoading(false);
        setError(data.content.error);
        
        // Clear polling interval
        if (pollingInterval) {
          clearTimeout(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (err) {
      console.error('Error checking quest status:', err);
      
      // If we encounter multiple errors, stop polling
      if (pollingCount > 5) {
        setLoading(false);
        setError('Failed to communicate with the server. Please try again later.');
        
        // Clear polling interval
        if (pollingInterval) {
          clearTimeout(pollingInterval);
          setPollingInterval(null);
        }
      }
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
    // Reset states
    setError('');
    setSuccess(false);
    setGeneratedQuest(null);
    setContentId(null);
    setGenerationStatus('');
    setPollingCount(0);
    setPollingDelay(3000); // Reset polling delay
    if (pollingInterval) {
      clearTimeout(pollingInterval);
      setPollingInterval(null);
    }
  };
  
  const handleClose = () => {
    // Stop polling if active
    if (pollingInterval) {
      clearTimeout(pollingInterval);
      setPollingInterval(null);
    }
    
    // If a quest was successfully created, refresh the page or redirect
    if (success && generatedQuest?.created && generatedQuest?.questId) {
      router.push('/admin/quests');
    } else {
      setOpen(false);
    }
  };
  
  const handleSettingChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: name === 'autoCreate' ? checked : value
    });
  };
  
  const handleAutoGenerate = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setGeneratedQuest(null);
    setContentId(null);
    setGenerationStatus('');
    setProgressMessage('Initiating quest generation...');
    
    if (pollingInterval) {
      clearTimeout(pollingInterval);
      setPollingInterval(null);
    }
    
    try {
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
      }
      
      console.log('Sending auto-generate request with settings:', settings);
      
      const response = await fetch('/api/admin/quests/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          difficulty: settings.difficulty,
          category: settings.category,
          requiredPoints: parseInt(settings.requiredPoints),
          rewardPoints: parseInt(settings.rewardPoints),
          autoCreate: settings.autoCreate
        }),
        // We only need a short timeout since we're just queueing the task now
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      // Read response as text first to debug any issues
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('Failed to parse response as JSON:', err);
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Auto-generate response:', data);
      
      if (!response.ok) {
        // Special handling for database errors
        if (data.error && data.error.includes('Database error')) {
          setError(`Database error: ${data.details || 'Failed to create quest entry'}`);
          setLoading(false);
          return;
        }
        
        throw new Error(data.error || data.message || 'Failed to generate quest');
      }
      
      // Handle error response with fallback contentId (temporary solution)
      if (!data.success && data.fallbackContentId) {
        console.warn('Using fallback contentId due to backend error:', data.fallbackContentId);
        setContentId(data.fallbackContentId.toString());
        setGenerationStatus('error');
        setProgressMessage('Error: ' + (data.message || 'Backend issue with contentId'));
        
        // Show error but don't throw - we'll use the fallback ID for tracking purposes
        setError('Backend error: ' + (data.message || 'Failed to generate a valid contentId'));
        
        // Still continue polling with fallback ID
        return;
      }
      
      // Store contentId for status polling
      if (data.contentId) {
        console.log('Received contentId:', data.contentId);
        // Ensure contentId is a string
        setContentId(data.contentId.toString());
        setGenerationStatus(data.status || 'queued');
        
        // Start polling immediately (useEffect will also handle this)
        checkQuestStatus(data.contentId);
      } else {
        console.error('Response missing contentId:', data);
        throw new Error('Invalid response: missing contentId');
      }
    } catch (err) {
      console.error('Failed to auto-generate quest:', err);
      
      // Handle timeout errors specifically
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('Request timed out. The server might be busy. Please try again later.');
      } else {
        setError(err.message || 'Failed to generate quest. Please try again.');
      }
      setLoading(false);
    }
  };
  
  const getConditionTypeLabel = (type) => {
    const typeMap = {
      'course_completion': 'Complete Course',
      'quiz_score': 'Achieve Quiz Score',
      'take_quiz': 'Take Quiz',
      'watch_videos': 'Watch Video',
      'start_discussion': 'Start Discussion',
      'total_points': 'Earn Points'
    };
    return typeMap[type] || type;
  };
  
  const handleRetry = () => {
    setRetryAvailable(false);
    setError('');
    setPollingCount(0);
    setPollingDelay(3000); // Reset to initial polling delay
    handleAutoGenerate();
  };
  
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AutoAwesomeIcon />}
        onClick={handleOpen}
        fullWidth
        sx={{ py: 2, fontWeight: 'bold' }}
      >
        Auto-Generate Complete Quest
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ConstructionIcon color="primary" />
            <Typography variant="h6">AI Complete Quest Generator</Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText paragraph>
            Our advanced AI will analyze your database content and automatically generate a complete quest with real courses, quizzes, and videos from your platform.
          </DialogContentText>
          
          {/* Additional explanation */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>How it works</AlertTitle>
            <Typography variant="body2">
              The AI will scan your database for popular courses, recent quizzes, and most-watched videos, then create a quest with meaningful conditions that reference these real items.
            </Typography>
          </Alert>
          
          {!loading && !generatedQuest && !contentId && (
            <Box sx={{ my: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Generation Settings
              </Typography>
              
              <Stack spacing={3} sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    name="difficulty"
                    value={settings.difficulty}
                    onChange={handleSettingChange}
                    label="Difficulty Level"
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                    <MenuItem value="expert">Expert</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Category"
                  name="category"
                  value={settings.category}
                  onChange={handleSettingChange}
                  fullWidth
                />
                
                <TextField
                  label="Required Points to Start"
                  name="requiredPoints"
                  type="number"
                  value={settings.requiredPoints}
                  onChange={handleSettingChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                />
                
                <TextField
                  label="Reward Points"
                  name="rewardPoints"
                  type="number"
                  value={settings.rewardPoints}
                  onChange={handleSettingChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.autoCreate}
                      onChange={handleSettingChange}
                      name="autoCreate"
                      color="primary"
                    />
                  }
                  label="Automatically create quest in database"
                />
              </Stack>
            </Box>
          )}
          
          {/* Error message */}
          {error && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
              {retryAvailable && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleRetry}
                  startIcon={<RefreshIcon />}
                  sx={{ mt: 1 }}
                >
                  Retry Generation
                </Button>
              )}
            </Box>
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                {generationStatus === 'queued' ? 'Quest Generation Queued' : 
                 generationStatus === 'processing' ? 'Analyzing Database Content' : 
                 'Initiating Quest Generation'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                {progressMessage}
              </Typography>
              
              <LinearProgress 
                sx={{ width: '80%', mb: 2, height: 8, borderRadius: 4 }} 
                color={
                  generationStatus === 'queued' ? 'warning' : 
                  generationStatus === 'processing' ? 'primary' : 
                  'secondary'
                }
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <LoopIcon sx={{ mr: 1, animation: 'spin 2s linear infinite' }} />
                <Typography variant="caption" color="text.secondary">
                  You can continue using the admin panel while AI works in the background
                </Typography>
              </Box>
            </Box>
          )}
          
          {success && generatedQuest && (
            <>
              <Alert severity="success" sx={{ my: 2 }}>
                {settings.autoCreate ? 
                  'Quest successfully generated and created in the database!' : 
                  'Quest successfully generated! Review and approve to create it.'}
              </Alert>
              
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Quest Details" />
                <Tab 
                  label={
                    <Badge 
                      color="secondary" 
                      variant="dot" 
                      invisible={!!generatedQuest.rewardNftId}
                    >
                      NFT Reward
                    </Badge>
                  } 
                />
              </Tabs>
              
              {activeTab === 0 ? (
                <Card variant="outlined" sx={{ mt: 3, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom color="primary">
                      {generatedQuest.title}
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      {generatedQuest.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip 
                        label={generatedQuest.difficultyLevel} 
                        color="primary" 
                        variant="outlined" 
                        size="small" 
                      />
                      <Chip 
                        label={`${generatedQuest.rewardPoints} Points Reward`} 
                        color="success" 
                        variant="outlined" 
                        size="small" 
                      />
                      {generatedQuest.requiredPoints > 0 && (
                        <Chip 
                          label={`${generatedQuest.requiredPoints} Points Required`} 
                          color="warning" 
                          variant="outlined" 
                          size="small" 
                        />
                      )}
                    </Stack>
                    
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Quest Conditions:
                    </Typography>
                    
                    {generatedQuest.conditions.map((condition, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 2, bgcolor: 'background.paper' }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={getConditionTypeLabel(condition.conditionType)}
                              color="primary"
                            />
                            
                            {condition.targetValue > 1 && (
                              <Chip 
                                label={`Value: ${condition.targetValue}`}
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Stack>
                          
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {condition.description || 'Complete this condition'}
                          </Typography>
                          
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                              Target ID:
                            </Typography>
                            <Chip 
                              label={condition.targetId} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {generatedQuest.rewardNftId && (
                      <>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                          NFT Reward:
                        </Typography>
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label={`NFT ID: ${generatedQuest.rewardNftId}`}
                          color="secondary"
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ mt: 3, mb: 2 }}>
                  {generatedQuest.rewardNftId ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <AlertTitle>Existing NFT Selected</AlertTitle>
                      <Typography variant="body2">
                        This quest will use an existing NFT from your database (ID: {generatedQuest.rewardNftId}).
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                        onClick={() => router.push(`/admin/nfts/${generatedQuest.rewardNftId}`)}
                      >
                        View NFT Details
                      </Button>
                    </Alert>
                  ) : generatedQuest.nftRecommendation ? (
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                      <Stack 
                        direction="row" 
                        spacing={2} 
                        alignItems="center" 
                        sx={{ mb: 2 }}
                      >
                        <DiamondIcon color="secondary" fontSize="large" />
                        <Typography variant="h6">
                          Suggested NFT Reward
                        </Typography>
                      </Stack>
                      
                      <Alert severity="warning" sx={{ mb: 3 }}>
                        <AlertTitle>New NFT Recommendation</AlertTitle>
                        <Typography variant="body2">
                          AI suggests creating a new NFT for this quest with the following details:
                        </Typography>
                      </Alert>
                      
                      <Box sx={{ ml: 1, mb: 3 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              NFT Title
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {generatedQuest.nftRecommendation.title}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Description
                            </Typography>
                            <Typography variant="body1">
                              {generatedQuest.nftRecommendation.description}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Rarity
                            </Typography>
                            <Chip 
                              label={generatedQuest.nftRecommendation.rarity} 
                              color="secondary"
                              variant="outlined"
                            />
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Visual Theme
                            </Typography>
                            <Typography variant="body1">
                              {generatedQuest.nftRecommendation.visualTheme}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setNftCreationOpen(true)}
                        fullWidth
                      >
                        Create This NFT
                      </Button>
                    </Paper>
                  ) : (
                    <Alert severity="info">
                      <AlertTitle>No NFT Recommendation</AlertTitle>
                      No specific NFT recommendation is available for this quest.
                    </Alert>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            {success && settings.autoCreate ? 'View All Quests' : 'Cancel'}
          </Button>
          
          {!loading && !success && !contentId && (
            <Button
              onClick={handleAutoGenerate}
              variant="contained"
              color="primary"
              startIcon={<SyncIcon />}
            >
              Analyze & Generate
            </Button>
          )}
          
          {success && !settings.autoCreate && (
            <Button
              variant="contained"
              color="success"
              startIcon={<DoneAllIcon />}
              onClick={() => {
                // Implement manual creation logic here
                setSettings({ ...settings, autoCreate: true });
                handleAutoGenerate();
              }}
            >
              Create This Quest
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* NFT Creation Dialog */}
      <Dialog
        open={nftCreationOpen}
        onClose={() => setNftCreationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <DiamondIcon color="secondary" />
            <Typography variant="h6">Create New NFT</Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              This will create a new NFT based on AI recommendations and assign it to your quest.
            </Typography>
          </Alert>
          
          {generatedQuest?.nftRecommendation && (
            <Stack spacing={3} sx={{ mt: 3 }}>
              <TextField
                label="NFT Title"
                fullWidth
                defaultValue={generatedQuest.nftRecommendation.title}
              />
              
              <TextField
                label="NFT Description"
                fullWidth
                multiline
                rows={4}
                defaultValue={generatedQuest.nftRecommendation.description}
              />
              
              <FormControl fullWidth>
                <InputLabel>Rarity</InputLabel>
                <Select
                  defaultValue={generatedQuest.nftRecommendation.rarity}
                  label="Rarity"
                >
                  <MenuItem value="Common">Common</MenuItem>
                  <MenuItem value="Uncommon">Uncommon</MenuItem>
                  <MenuItem value="Rare">Rare</MenuItem>
                  <MenuItem value="Epic">Epic</MenuItem>
                  <MenuItem value="Legendary">Legendary</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="NFT Image URL"
                fullWidth
                helperText="Enter URL for NFT image or upload one"
              />
              
              <TextField
                label="NFT Visual Theme"
                fullWidth
                defaultValue={generatedQuest.nftRecommendation.visualTheme}
                helperText="Use this as a guide for image generation"
              />
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setNftCreationOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              // Implement NFT creation logic
              alert("NFT creation will be implemented in a future update.");
              setNftCreationOpen(false);
            }}
          >
            Create NFT
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 