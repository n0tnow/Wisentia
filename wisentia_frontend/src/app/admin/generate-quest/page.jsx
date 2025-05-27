"use client";

import { useState, useEffect } from 'react';
import { 
  Button, Stack, Box, Typography, Container, Paper, Divider,
  Card, CardContent, CardActions, Grid, FormControl, InputLabel,
  Select, MenuItem, TextField, Chip, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Alert, CircularProgress,
  LinearProgress, useTheme, alpha, Badge, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QueueIcon from '@mui/icons-material/Queue';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

// Quest queue storage key
const QUEST_QUEUE_STORAGE_KEY = 'wisentia_quest_queue';

// Stat Card component
const StatCard = ({ value, label, color, gradient }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      borderRadius: 2,
      background: gradient,
      color: '#fff',
      boxShadow: 1,
      m: 0.5,
      height: 64,
      fontWeight: 700,
      textShadow: '0 1px 4px rgba(0,0,0,0.25)',
    }}
  >
    <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1 }}>{value}</Typography>
    <Typography variant="body2" sx={{ opacity: 0.95 }}>{label}</Typography>
  </Box>
);

// Quest Card component
const QuestCard = ({ quest, onDelete, onRetry }) => {
  const theme = useTheme();
  
  const getStatusIcon = () => {
    switch (quest.status) {
      case 'waiting': return <HourglassEmptyIcon fontSize="small" color="action" />;
      case 'processing': return <CircularProgress size={20} />;
      case 'completed': return <CheckCircleIcon fontSize="small" color="success" />;
      case 'failed': return <CancelIcon fontSize="small" color="error" />;
      default: return <HourglassEmptyIcon fontSize="small" color="action" />;
    }
  };

  const getStatusColor = () => {
    switch (quest.status) {
      case 'processing': return 'primary.main';
      case 'completed': return 'success.main';
      case 'failed': return 'error.main';
      default: return 'divider';
    }
  };

  return (
    <Card
      sx={{
        height: 250,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid',
        borderColor: getStatusColor(),
        boxShadow: quest.status === 'processing' ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}` : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {getStatusIcon()}
            <Typography variant="subtitle2" fontWeight={600} sx={{ 
              wordWrap: 'break-word',
              overflow: 'hidden',
              maxHeight: '2.4em',
              lineHeight: '1.2em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              Quest #{quest.id}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onDelete(quest.id)}
            sx={{ ml: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={quest.difficulty}
              color={
                quest.difficulty === 'easy' ? 'success' :
                quest.difficulty === 'intermediate' ? 'warning' :
                quest.difficulty === 'hard' ? 'error' : 'default'
              }
            />
            <Chip
              size="small"
              label={quest.category}
              variant="outlined"
            />
            {quest.questComplexity && (
              <Chip
                size="small"
                label={quest.questComplexity}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            Reward: {quest.rewardPoints} points
            {quest.requiredPoints > 0 && ` • Required: ${quest.requiredPoints} points`}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            {quest.enableDatabaseAnalysis && (
              <Chip
                size="small"
                label="DB Analysis"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
            {quest.includeNFTRewards && (
              <Chip
                size="small"
                label="NFT Rewards"
                color="secondary"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
            {quest.autoCreate && (
              <Chip
                size="small"
                label="Auto-Create"
                color="success"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(quest.createdAt).toLocaleString()}
          </Typography>
        </Stack>
      </CardContent>
      
      {quest.status === 'failed' && (
        <CardActions sx={{ pt: 0 }}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => onRetry(quest.id)}
            color="primary"
          >
            Retry
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default function QuestGeneratorPage() {
  const [questQueue, setQuestQueue] = useState([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  
  // Quest settings
  const [settings, setSettings] = useState({
    difficulty: 'intermediate',
    category: 'Learning',
    requiredPoints: 0,
    rewardPoints: 50,
    autoCreate: true,
    enableDatabaseAnalysis: true,
    includeNFTRewards: true,
    questComplexity: 'medium' // simple, medium, complex
  });

  const router = useRouter();
  const theme = useTheme();

  // Difficulty options
  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'success' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning' },
    { value: 'hard', label: 'Hard', color: 'error' }
  ];

  // Category options
  const categories = [
    { value: 'Learning', label: 'Learning & Education' },
    { value: 'Programming', label: 'Programming & Development' },
    { value: 'Science', label: 'Science & Research' },
    { value: 'Math', label: 'Mathematics' },
    { value: 'Language', label: 'Language Learning' },
    { value: 'Creative', label: 'Creative Arts' },
    { value: 'Business', label: 'Business & Finance' },
    { value: 'General', label: 'General Knowledge' }
  ];

  // Quest complexity options
  const complexityOptions = [
    { value: 'simple', label: 'Simple (1-2 conditions)', description: 'Basic quests with minimal requirements' },
    { value: 'medium', label: 'Medium (3-4 conditions)', description: 'Balanced quests with multiple objectives' },
    { value: 'complex', label: 'Complex (5+ conditions)', description: 'Advanced quests with multiple interconnected goals' }
  ];

  useEffect(() => {
    // Load queue from localStorage on mount
    const stored = localStorage.getItem(QUEST_QUEUE_STORAGE_KEY);
    if (stored) {
      try {
        setQuestQueue(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading quest queue:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save queue to localStorage whenever it changes
    localStorage.setItem(QUEST_QUEUE_STORAGE_KEY, JSON.stringify(questQueue));
  }, [questQueue]);

  const handleGoBack = () => {
    router.push('/admin/content/quests');
  };

  const addToQueue = () => {
    const newQuest = {
      id: Date.now(),
      difficulty: settings.difficulty,
      category: settings.category,
      requiredPoints: settings.requiredPoints,
      rewardPoints: settings.rewardPoints,
      autoCreate: settings.autoCreate,
      enableDatabaseAnalysis: settings.enableDatabaseAnalysis,
      includeNFTRewards: settings.includeNFTRewards,
      questComplexity: settings.questComplexity,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    setQuestQueue(prev => [...prev, newQuest]);
  };

  const processQueue = async () => {
    const waitingQuests = questQueue.filter(q => q.status === 'waiting');
    if (waitingQuests.length === 0) return;

    setProcessingQueue(true);
    setCurrentQueueIndex(0);

    for (let i = 0; i < waitingQuests.length; i++) {
      const quest = waitingQuests[i];
      setCurrentQueueIndex(i);

      // Update status to processing
      setQuestQueue(prev => prev.map(q => 
        q.id === quest.id ? { ...q, status: 'processing' } : q
      ));

      try {
        // Make API call to generate quest
        const response = await fetch('/api/admin/quests/auto-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            difficulty: quest.difficulty,
            category: quest.category,
            pointsRequired: quest.requiredPoints,
            pointsReward: quest.rewardPoints,
            autoCreate: quest.autoCreate,
            enableDatabaseAnalysis: quest.enableDatabaseAnalysis,
            includeNFTRewards: quest.includeNFTRewards,
            questComplexity: quest.questComplexity
          })
        });

        if (response.ok) {
          const result = await response.json();
          setQuestQueue(prev => prev.map(q => 
            q.id === quest.id ? { 
              ...q, 
              status: 'completed',
              resultId: result.contentId || result.questId 
            } : q
          ));
        } else {
          throw new Error('Failed to generate quest');
        }
      } catch (error) {
        console.error('Error processing quest:', error);
        setQuestQueue(prev => prev.map(q => 
          q.id === quest.id ? { ...q, status: 'failed', error: error.message } : q
        ));
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setProcessingQueue(false);
  };

  const getFilteredQueue = () => {
    let filtered = questQueue;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'difficulty':
          return a.difficulty.localeCompare(b.difficulty);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const handleDeleteQuest = (id) => {
    setQuestQueue(prev => prev.filter(q => q.id !== id));
  };

  const handleRetryQuest = (id) => {
    setQuestQueue(prev => prev.map(q => 
      q.id === id ? { ...q, status: 'waiting', error: undefined } : q
    ));
  };

  const handleClearAll = () => {
    setQuestQueue([]);
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
            Back to Quest Management
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <EmojiEventsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Quest Generation
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Create and manage AI-generated quests for your platform.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mb: 4, mt: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              href="/admin/content/quests/create"
              sx={{ fontWeight: 'bold' }}
            >
              Create Quest Manually
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ListAltIcon />}
              component={Link}
              href="/admin/content/quests"
              sx={{ fontWeight: 'bold' }}
            >
              View All Quests
            </Button>
          </Stack>
        </Box>
        
        {/* Quest Generator Form */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            <AutoAwesomeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            AI Quest Generator
          </Typography>
          
          <Typography variant="body2" paragraph color="text.secondary">
            Configure quest parameters and add to generation queue.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={settings.difficulty}
                  onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value }))}
                  label="Difficulty Level"
                >
                  {difficulties.map(d => (
                    <MenuItem key={d.value} value={d.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          size="small"
                          label={d.label}
                          color={d.color}
                          sx={{ mr: 1, minWidth: 90 }} 
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={settings.category}
                  onChange={(e) => setSettings(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Required Points"
                type="number"
                variant="outlined"
                size="small"
                value={settings.requiredPoints}
                onChange={(e) => setSettings(prev => ({ ...prev, requiredPoints: parseInt(e.target.value) || 0 }))}
                InputProps={{
                  inputProps: { min: 0, max: 1000 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Reward Points"
                type="number"
                variant="outlined"
                size="small"
                value={settings.rewardPoints}
                onChange={(e) => setSettings(prev => ({ ...prev, rewardPoints: parseInt(e.target.value) || 50 }))}
                InputProps={{
                  inputProps: { min: 1, max: 1000 }
                }}
              />
            </Grid>

            {/* Advanced Options */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  <PsychologyIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} />
                  AI Advanced Options
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Quest Complexity</InputLabel>
                <Select
                  value={settings.questComplexity}
                  onChange={(e) => setSettings(prev => ({ ...prev, questComplexity: e.target.value }))}
                  label="Quest Complexity"
                >
                  {complexityOptions.map(c => (
                    <MenuItem key={c.value} value={c.value}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{c.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.description}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="enableDatabaseAnalysis"
                      checked={settings.enableDatabaseAnalysis}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableDatabaseAnalysis: e.target.checked }))}
                    />
                    <Typography variant="body2">
                      <strong>Database Analysis</strong>
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    AI analyzes courses, videos, and quizzes to create realistic quest conditions
                  </Typography>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="checkbox"
                      id="includeNFTRewards"
                      checked={settings.includeNFTRewards}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeNFTRewards: e.target.checked }))}
                    />
                    <Typography variant="body2">
                      <strong>NFT Rewards</strong>
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    AI suggests appropriate NFT rewards based on quest difficulty and theme
                  </Typography>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>AI Database Integration:</strong> When enabled, the AI will analyze your platform's courses, videos, quizzes, and NFT collection to create intelligent quest conditions using real content IDs and logical progression paths.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={addToQueue}
              sx={{ px: 3 }}
            >
              Add to Queue
            </Button>
          </Box>
        </Paper>

        {/* Quest Queue */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 0, md: 0 },
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}
        >
          {/* Queue header with controls */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            borderBottom: `1px solid ${theme.palette.divider}`,
            p: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.primary.main, 0.15) 
              : alpha(theme.palette.primary.main, 0.05)
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QueueIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Quest Queue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {questQueue.length} total quests ({questQueue.filter(q => q.status === 'waiting').length} waiting)
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: { xs: 2, sm: 0 } }}>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<PlayArrowIcon />}
                onClick={processQueue}
                disabled={processingQueue || questQueue.filter(q => q.status === 'waiting').length === 0}
                color="success"
                sx={{ 
                  borderColor: 'success.main',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.08),
                    borderColor: 'success.dark'
                  }
                }}
              >
                Process Queue
              </Button>
              
              {questQueue.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleClearAll}
                  startIcon={<DeleteIcon fontSize="small" />}
                >
                  Clear All
                </Button>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto', minWidth: 100 } }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Filter"
                    fullWidth
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="waiting">Waiting</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto', minWidth: 100 } }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    fullWidth
                  >
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="difficulty">Difficulty</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
          
          {/* Queue stats */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '1fr 1fr 1fr',
              md: '1fr 1fr 1fr 1fr 1fr',
            },
            gap: 1,
            mb: 0,
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <StatCard value={questQueue.filter(q => q.status === 'waiting').length} label="Waiting" color="#1976d2" gradient="linear-gradient(90deg, #1976d2 0%, #21cbf3 100%)" />
            <StatCard value={questQueue.filter(q => q.status === 'processing').length} label="Processing" color="#ff9800" gradient="linear-gradient(90deg, #ff9800 0%, #ffe082 100%)" />
            <StatCard value={questQueue.filter(q => q.status === 'completed').length} label="Completed" color="#43a047" gradient="linear-gradient(90deg, #43a047 0%, #38f9d7 100%)" />
            <StatCard value={questQueue.filter(q => q.status === 'failed').length} label="Failed" color="#e53935" gradient="linear-gradient(90deg, #e53935 0%, #ffb199 100%)" />
            <StatCard value={questQueue.length} label="Total" color="#607d8b" gradient="linear-gradient(90deg, #607d8b 0%, #bdbdbd 100%)" />
          </Box>
          
          {/* Queue list */}
          {getFilteredQueue().length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              px: 2
            }}>
              <QueueIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No quests in queue
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                Add quests using the configuration above to start generating AI-powered quest content
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Add Quest
              </Button>
            </Box>
          ) : (
            <Box sx={{
              p: 2,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr'
              },
              gap: 2,
            }}>
              {getFilteredQueue().map((quest) => (
                <QuestCard 
                  key={quest.id}
                  quest={quest} 
                  onDelete={handleDeleteQuest}
                  onRetry={handleRetryQuest}
                />
              ))}
            </Box>
          )}
          
          {/* Processing progress indicator */}
          {processingQueue && (
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2" fontWeight={500}>
                  Processing Queue: {currentQueueIndex + 1} of {questQueue.filter(q => q.status === 'waiting').length}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(currentQueueIndex + 1) / questQueue.filter(q => q.status === 'waiting').length * 100}
                sx={{ borderRadius: 1, height: 6 }}
              />
            </Box>
          )}
        </Paper>
      </Container>
    </MainLayout>
  );
} 