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
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 saniye
  const [autoRefresh, setAutoRefresh] = useState(true);
  
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
    
    fetchQueueData();
    
    // Otomatik yenileme
    let intervalId = null;
    if (autoRefresh) {
      intervalId = setInterval(fetchQueueData, refreshInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, autoRefresh, refreshInterval]);

  const fetchQueueData = async () => {
    try {
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/admin/quests/queue', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quest queue');
      }
      
      const data = await response.json();
      
      // Tarih formatını düzelt ve sırala
      const formattedData = data.queue?.map(item => ({
        ...item,
        creationDate: new Date(item.creationDate)
      })) || [];
      
      // Tarihe göre sırala - eskiden yeniye
      formattedData.sort((a, b) => a.creationDate - b.creationDate);
      
      setQueueData(formattedData);
    } catch (err) {
      console.error('Error fetching queue data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = async () => {
    try {
      setError(null);
      setProcessing(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch('/api/admin/quests/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add quest to queue');
      }
      
      const data = await response.json();
      
      setSuccess('Quest successfully added to queue');
      setOpenDialog(false);
      fetchQueueData(); // Refresh data
      
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
    try {
      setError(null);
      setProcessing(true);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch('/api/admin/quests/queue/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process quest queue');
      }
      
      const data = await response.json();
      
      setSuccess('Processing started for the next quest in queue');
      fetchQueueData(); // Refresh data
      
      // İşlem başladıysa ve content ID varsa durumu görüntüleme sayfasına yönlendir
      if (data.contentId) {
        router.push(`/admin/quests/status/${data.contentId}`);
      }
      
    } catch (err) {
      console.error('Error processing queue:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
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
          label="Processing" 
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
          onClick={fetchQueueData}
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
                <TableCell>Category</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Points Required</TableCell>
                <TableCell>Points Reward</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queueData.map((item) => (
                <TableRow key={item.contentId || item.id}>
                  <TableCell>{getStatusChip(item.status)}</TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>{item.difficulty || 'N/A'}</TableCell>
                  <TableCell>{item.pointsRequired || 0}</TableCell>
                  <TableCell>{item.pointsReward || 0}</TableCell>
                  <TableCell>{formatDate(item.creationDate)}</TableCell>
                  <TableCell>
                    {item.status === 'completed' && (
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