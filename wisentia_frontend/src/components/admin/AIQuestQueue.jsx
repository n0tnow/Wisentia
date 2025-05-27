"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Button, CircularProgress, Card, CardContent, Typography,
  Alert, Divider, Chip, Stack, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Snackbar, LinearProgress
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QueueIcon from '@mui/icons-material/Queue';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '@/contexts/AuthContext';

export default function AIQuestQueue() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queueData, setQueueData] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(2000); // 2 saniye - quiz sistemi gibi
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);
  
  // LocalStorage key for quest queue - like quiz system
  const QUEST_QUEUE_STORAGE_KEY = 'wisentia_quest_queue';
  
  // LocalStorage functions - like quiz system
  const saveQueueToStorage = (queue) => {
    try {
      localStorage.setItem(QUEST_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving quest queue to localStorage:', error);
    }
  };

  const loadQueueFromStorage = () => {
    try {
      const stored = localStorage.getItem(QUEST_QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading quest queue from localStorage:', error);
      return [];
    }
  };

  const checkProcessingItemsStatus = async (currentQueue) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let updatedQueue = [...currentQueue];
    let hasUpdates = false;

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      
      if (item.status === 'processing' && item.contentId) {
        try {
          const response = await fetch(`/api/admin/quests/status/${item.contentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const statusData = await response.json();
            
            // Update item status based on backend response
            if (statusData.status !== item.status) {
              updatedQueue[i] = {
                ...item,
                status: statusData.status,
                progress: statusData.progress || item.progress,
                content: statusData.content || item.content,
                apiCost: statusData.apiCost || item.apiCost,
                createdQuestId: statusData.createdQuestId || item.createdQuestId
              };
              hasUpdates = true;
            }
          }
        } catch (error) {
          console.error(`Error checking status for item ${item.contentId}:`, error);
        }
      }
    }

    if (hasUpdates) {
      saveQueueToStorage(updatedQueue);
      setQueueData(updatedQueue);
    }
  };
  
  // Quest formu için state
  const [questFormData, setQuestFormData] = useState({
    difficulty: 'intermediate',
    category: 'Programming',
    pointsRequired: 50,
    pointsReward: 100,
    autoCreate: false
  });

  useEffect(() => {
    if (!user) return;
    
    // Load queue from localStorage first - like quiz system
    const storedQueue = loadQueueFromStorage();
    setQueueData(storedQueue);
    setLoading(false);
    
    // Otomatik yenileme - sadece processing olan itemlar için
    let intervalId = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        const currentQueue = loadQueueFromStorage();
        const hasProcessingItems = currentQueue.some(item => 
          item.status === 'processing' || item.status === 'queued'
        );
        
        if (hasProcessingItems) {
          // Check status of processing items from backend
          checkProcessingItemsStatus(currentQueue);
        }
      }, refreshInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, autoRefresh, refreshInterval]);



  const handleAddToQueue = async () => {
    try {
      setError(null);
      setProcessing(true);
      
      // Create quest item for localStorage - like quiz system
      const questItem = {
        id: Date.now(), // Unique ID
        ...questFormData,
        status: 'waiting',
        creationDate: new Date().toISOString(),
        progress: { status: 'waiting', percentage: 0, current_step: 'Waiting to be processed...' }
      };
      
      // Add to localStorage queue
      const currentQueue = loadQueueFromStorage();
      const updatedQueue = [questItem, ...currentQueue];
      saveQueueToStorage(updatedQueue);
      setQueueData(updatedQueue);
      
      setSuccess('Quest successfully added to queue');
      setOpenDialog(false);
      
      // Form datayı sıfırla
      setQuestFormData({
        difficulty: 'intermediate',
        category: 'Programming',
        pointsRequired: 50,
        pointsReward: 100,
        autoCreate: false
      });
      
    } catch (err) {
      console.error('Error adding to queue:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessNext = async () => {
    if (processing) return;

    const currentQueue = loadQueueFromStorage();
    const waitingQuests = currentQueue.filter(q => q.status === 'waiting');
    
    if (waitingQuests.length === 0) {
      setError('No waiting quests in queue');
      return;
    }
    
    setProcessing(true);
    
    // Find first waiting quest
    const questIndex = currentQueue.findIndex(q => q.status === 'waiting');
    if (questIndex === -1) {
      setProcessing(false);
      return;
    }
    
    const questToProcess = currentQueue[questIndex];
    setCurrentProcessingIndex(questIndex);
    
    try {
      // Update status to processing
      let updatedQueue = [...currentQueue];
      updatedQueue[questIndex] = {
        ...questToProcess,
        status: 'processing',
        progress: { 
          status: 'processing', 
          percentage: 5, 
          current_step: 'Starting quest generation...' 
        }
      };
      saveQueueToStorage(updatedQueue);
      setQueueData(updatedQueue);
      
      // Call backend API to start generation
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/quests/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          difficulty: questToProcess.difficulty,
          category: questToProcess.category,
          pointsRequired: questToProcess.pointsRequired,
          pointsReward: questToProcess.pointsReward,
          autoCreate: questToProcess.autoCreate,
          enableDatabaseAnalysis: true,
          includeNFTRewards: true,
          questComplexity: 'medium'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start quest generation');
      }
      
      const data = await response.json();
      
      // Update with contentId from backend
      updatedQueue[questIndex] = {
        ...updatedQueue[questIndex],
        contentId: data.contentId,
        progress: { 
          status: 'processing', 
          percentage: 10, 
          current_step: 'Quest generation started in backend...' 
        }
      };
      saveQueueToStorage(updatedQueue);
      setQueueData(updatedQueue);
      
      setSuccess('Processing started for the next quest in queue');
      
      // Start progress monitoring
      monitorQuestProgress(questIndex, data.contentId);
      
    } catch (err) {
      console.error('Error processing queue:', err);
      setError(err.message);
      
      // Reset quest status to waiting on error
      let updatedQueue = [...currentQueue];
      updatedQueue[questIndex] = {
        ...questToProcess,
        status: 'waiting',
        progress: { 
          status: 'waiting', 
          percentage: 0, 
          current_step: 'Waiting to be processed...' 
        }
      };
      saveQueueToStorage(updatedQueue);
      setQueueData(updatedQueue);
    } finally {
      setProcessing(false);
      setCurrentProcessingIndex(-1);
    }
  };

  const monitorQuestProgress = async (questIndex, contentId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let progressCounter = 10;
    const progressInterval = setInterval(async () => {
      try {
        // Check backend status
        const response = await fetch(`/api/admin/quests/status/${contentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const statusData = await response.json();
          const currentQueue = loadQueueFromStorage();
          
          if (questIndex < currentQueue.length) {
            let updatedQueue = [...currentQueue];
            
            // Update progress based on backend status
            if (statusData.status === 'completed' || statusData.status === 'approved') {
              updatedQueue[questIndex] = {
                ...updatedQueue[questIndex],
                status: statusData.status,
                progress: { 
                  status: 'completed', 
                  percentage: 100, 
                  current_step: 'Quest generation completed!' 
                },
                content: statusData.content,
                apiCost: statusData.apiCost,
                createdQuestId: statusData.createdQuestId
              };
              clearInterval(progressInterval);
            } else if (statusData.status === 'failed') {
              updatedQueue[questIndex] = {
                ...updatedQueue[questIndex],
                status: 'failed',
                progress: { 
                  status: 'failed', 
                  percentage: 0, 
                  current_step: 'Quest generation failed' 
                }
              };
              clearInterval(progressInterval);
            } else {
              // Still processing - update progress
              progressCounter = Math.min(progressCounter + 2, 95);
              updatedQueue[questIndex] = {
                ...updatedQueue[questIndex],
                progress: { 
                  status: 'processing', 
                  percentage: progressCounter, 
                  current_step: statusData.progress?.current_step || 'AI generating quest...' 
                }
              };
            }
            
            saveQueueToStorage(updatedQueue);
            setQueueData(updatedQueue);
          }
        }
      } catch (error) {
        console.error('Error monitoring quest progress:', error);
      }
    }, 3000); // Check every 3 seconds

    // Stop monitoring after 10 minutes
    setTimeout(() => {
      clearInterval(progressInterval);
    }, 600000);
  };

  const handleSettingChange = (e) => {
    if (e.target.name === 'autoRefresh') {
      setAutoRefresh(e.target.checked);
    } else if (e.target.name === 'refreshInterval') {
      setRefreshInterval(parseInt(e.target.value));
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
      case 'approved':
        return <Chip 
          icon={<CheckCircleIcon />} 
          label="Approved" 
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

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading quest queue...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Hata ve başarı mesajları */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
      
      {/* Ana başlık ve aksiyon butonları */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <QueueIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quest Queue
        </Typography>
        
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<QueueIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ mr: 2 }}
          >
            Add to Queue
          </Button>
          
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<PlayArrowIcon />}
            onClick={handleProcessNext}
            disabled={processing || queueData.length === 0}
          >
            Process Next
          </Button>
        </Box>
      </Box>
      
      {/* Otomatik yenileme ayarları */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={autoRefresh}
                onChange={handleSettingChange}
                name="autoRefresh"
              />
            }
            label="Auto-refresh"
          />
          
          <FormControl variant="outlined" size="small" sx={{ ml: 2, minWidth: 180 }}>
            <InputLabel>Refresh Interval</InputLabel>
            <Select
              value={refreshInterval}
              onChange={handleSettingChange}
              label="Refresh Interval"
              name="refreshInterval"
              disabled={!autoRefresh}
            >
              <MenuItem value={2000}>2 seconds</MenuItem>
              <MenuItem value={5000}>5 seconds</MenuItem>
              <MenuItem value={10000}>10 seconds</MenuItem>
              <MenuItem value={30000}>30 seconds</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={() => {
            const storedQueue = loadQueueFromStorage();
            setQueueData(storedQueue);
          }}
          disabled={processing}
        >
          Refresh Now
        </Button>
      </Paper>
      
      {/* Queue tablosu */}
      {queueData.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Quest ID</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Points Required</TableCell>
                <TableCell>Points Reward</TableCell>
                <TableCell>API Cost</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queueData.map((item) => (
                <TableRow key={item.contentId || item.id}>
                  <TableCell>
                    <Box>
                      {getStatusChip(item.status)}
                      {item.status === 'processing' && item.progress && (
                        <Box sx={{ mt: 1, width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={item.progress.percentage || 0} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {item.progress.current_step || 'Processing...'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {item.createdQuestId || item.content?.createdQuestId ? (
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        #{item.createdQuestId || item.content.createdQuestId}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {(item.status === 'completed' || item.status === 'approved') ? 'No ID' : 'Pending'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>{item.difficulty || 'N/A'}</TableCell>
                  <TableCell>{item.pointsRequired || 0}</TableCell>
                  <TableCell>{item.pointsReward || 0}</TableCell>
                  <TableCell>
                    {item.apiCost && item.apiCost.total_cost ? (
                      <Box>
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          ${item.apiCost.total_cost.toFixed(4)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.apiCost.input_tokens || 0} in / {item.apiCost.output_tokens || 0} out
                        </Typography>
                      </Box>
                    ) : item.status === 'completed' || item.status === 'approved' ? (
                      <Typography variant="body2" color="text.secondary">
                        No cost data
                      </Typography>
                    ) : item.status === 'duplicate_found' ? (
                      <Typography variant="body2" color="text.secondary">
                        No cost (duplicate)
                      </Typography>
                    ) : item.status === 'failed' ? (
                      <Typography variant="body2" color="error.main">
                        Failed
                      </Typography>
                    ) : item.status === 'processing' ? (
                      <Typography variant="body2" color="info.main">
                        Processing...
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(item.creationDate)}</TableCell>
                  <TableCell>
                    {(item.status === 'completed' || item.status === 'approved') && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => router.push(`/admin/quests/status/${item.contentId}`)}
                      >
                        View
                      </Button>
                    )}
                    {item.status === 'processing' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => router.push(`/admin/quests/status/${item.contentId}`)}
                      >
                        Check Status
                      </Button>
                    )}
                    {item.status === 'duplicate_found' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="warning"
                        onClick={() => router.push(`/admin/quests/status/${item.contentId}`)}
                      >
                        View Duplicate
                      </Button>
                    )}
                    {item.status === 'failed' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="error"
                        onClick={() => router.push(`/admin/quests/status/${item.contentId}`)}
                      >
                        View Error
                      </Button>
                    )}
                    {item.status === 'pending' && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="warning"
                        onClick={() => router.push(`/admin/quests/status/${item.contentId}`)}
                      >
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No quests in queue
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Add a quest to the queue to get started
          </Typography>
        </Paper>
      )}
      
      {/* Add to Queue dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Quest to Queue</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Configure the parameters for the new quest to be generated.
          </DialogContentText>
          
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={questFormData.difficulty}
                onChange={(e) => setQuestFormData({...questFormData, difficulty: e.target.value})}
                label="Difficulty"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={questFormData.category}
                onChange={(e) => setQuestFormData({...questFormData, category: e.target.value})}
                label="Category"
              >
                <MenuItem value="Programming">Programming</MenuItem>
                <MenuItem value="General Learning">General Learning</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Language">Language</MenuItem>
                <MenuItem value="Technology">Technology</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Health">Health</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Points Required"
              type="number"
              value={questFormData.pointsRequired}
              onChange={(e) => setQuestFormData({...questFormData, pointsRequired: parseInt(e.target.value)})}
              inputProps={{ min: 0 }}
            />
            
            <TextField
              label="Points Reward"
              type="number"
              value={questFormData.pointsReward}
              onChange={(e) => setQuestFormData({...questFormData, pointsReward: parseInt(e.target.value)})}
              inputProps={{ min: 0 }}
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={questFormData.autoCreate}
                  onChange={(e) => setQuestFormData({...questFormData, autoCreate: e.target.checked})}
                />
              }
              label="Auto-create quest upon successful generation"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddToQueue} 
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : 'Add to Queue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 