"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// MUI components
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  useTheme,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  alpha,
  Container,
  Stack,
  LinearProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Menu,
  Card,
  CardContent,
  Fade,
  Grow,
  Badge,
  Divider,
  Switch,
  Collapse,
  Snackbar,
  useMediaQuery,
  Slider
} from '@mui/material';

// MUI icons
import {
  EmojiEvents as QuestIcon,
  Category as CategoryIcon,
  Timer as TimerIcon,
  ArrowBack as BackIcon,
  Campaign as RewardIcon,
  AutoAwesome as SparkleIcon,
  PointOfSale as PointIcon,
  Add as AddIcon,
  Queue as QueueIcon,
  PlayArrow as PlayArrowIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Delete as DeleteIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Psychology as AIIcon,
  ExpandMore as ExpandMoreIcon,
  StarRate as StarIcon,
  Code as CodeIcon,
  Gamepad as GamepadIcon,
  BubbleChart as BubbleIcon,
  Speed as SpeedIcon,
  Public as PublicIcon,
  LocalOffer as OfferIcon,
  Construction as ConstructionIcon,
  CloudQueue as CloudQueueIcon,
  TrendingUp as TrendingIcon,
  Lock as LockIcon
} from '@mui/icons-material';

// LocalStorage keys for persistence
const STORAGE_KEYS = {
  QUEUE: 'wisentia_quest_queue',
  FILTERS: 'wisentia_quest_filters',
  SORT: 'wisentia_quest_sort',
  EXPANDED: 'wisentia_quest_expanded'
};

export default function GenerateQuestPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Form states
  const [difficulty, setDifficulty] = useState('intermediate');
  const [category, setCategory] = useState('Blockchain');
  const [pointsRequired, setPointsRequired] = useState(100);
  const [pointsReward, setPointsReward] = useState(50);
  const [questType, setQuestType] = useState('educational');
  const [completionTime, setCompletionTime] = useState('medium');
  const [rewardType, setRewardType] = useState('points');
  const [language, setLanguage] = useState('en');
  const [priorityLevel, setPriorityLevel] = useState('normal');
  const [targetAudience, setTargetAudience] = useState('all');
  const [skillLevel, setSkillLevel] = useState(5);
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);
  
  // Queue states - Initialize from localStorage
  const [questQueue, setQuestQueue] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [processingQueue, setProcessingQueue] = useState(false);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [filterMenu, setFilterMenu] = useState(null);
  const [sortMenu, setSortMenu] = useState(null);
  
  // Initialize filter options from localStorage
  const [filterOptions, setFilterOptions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.FILTERS);
      return saved ? JSON.parse(saved) : {
        showCompleted: true,
        showFailed: true,
        showWaiting: true,
        showProcessing: true
      };
    }
    return {
      showCompleted: true,
      showFailed: true,
      showWaiting: true,
      showProcessing: true
    };
  });
  
  // Initialize sort from localStorage
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.SORT) || 'date';
    }
    return 'date';
  });
  
  // Initialize expanded state from localStorage
  const [expandedParams, setExpandedParams] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPANDED);
      return saved === 'true';
    }
    return false;
  });
  
  // Request states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(questQueue));
    }
  }, [questQueue]);
  
  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filterOptions));
    }
  }, [filterOptions]);
  
  // Save sort to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SORT, sortBy);
    }
  }, [sortBy]);
  
  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXPANDED, expandedParams.toString());
    }
  }, [expandedParams]);
  
  // Data options
  const categories = [
    { value: 'Blockchain', icon: <PublicIcon />, color: '#2196f3' },
    { value: 'Web3', icon: <BubbleIcon />, color: '#673ab7' },
    { value: 'DeFi', icon: <TrendingIcon />, color: '#4caf50' },
    { value: 'NFTs', icon: <OfferIcon />, color: '#ff9800' },
    { value: 'Cryptocurrencies', icon: <LockIcon />, color: '#f44336' },
    { value: 'Smart Contracts', icon: <CodeIcon />, color: '#00bcd4' },
    { value: 'Artificial Intelligence', icon: <AIIcon />, color: '#9c27b0' },
    { value: 'Machine Learning', icon: <ConstructionIcon />, color: '#3f51b5' },
    { value: 'Data Science', icon: <CloudQueueIcon />, color: '#607d8b' },
    { value: 'Programming', icon: <CodeIcon />, color: '#795548' },
    { value: 'Cybersecurity', icon: <LockIcon />, color: '#e91e63' },
    { value: 'Game Development', icon: <GamepadIcon />, color: '#ff5722' }
  ];
  
  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'success', icon: <StarIcon />, description: 'For newcomers' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning', icon: <StarIcon />, description: 'Some experience required' },
    { value: 'advanced', label: 'Advanced', color: 'error', icon: <StarIcon />, description: 'Expert level' }
  ];
  
  const questTypes = [
    { value: 'educational', label: 'Educational', icon: <StarIcon />, color: '#4caf50' },
    { value: 'challenge', label: 'Challenge', icon: <SpeedIcon />, color: '#f44336' },
    { value: 'achievement', label: 'Achievement', icon: <QuestIcon />, color: '#ff9800' },
    { value: 'community', label: 'Community', icon: <CategoryIcon />, color: '#2196f3' },
    { value: 'practice', label: 'Practice', icon: <ConstructionIcon />, color: '#9c27b0' },
    { value: 'research', label: 'Research', icon: <AIIcon />, color: '#00bcd4' }
  ];
  
  const completionTimes = [
    { value: 'quick', label: 'Quick (<15 min)', icon: '⚡' },
    { value: 'short', label: 'Short (15-30 min)', icon: '⏱️' },
    { value: 'medium', label: 'Medium (30-60 min)', icon: '⏰' },
    { value: 'long', label: 'Long (1-2 hours)', icon: '⌛' },
    { value: 'extensive', label: 'Extensive (2+ hours)', icon: '📅' }
  ];
  
  const rewardTypes = [
    { value: 'points', label: 'Points Only', icon: '💎' },
    { value: 'badge', label: 'Badge & Points', icon: '🏅' },
    { value: 'nft', label: 'NFT & Points', icon: '🖼️' },
    { value: 'certificate', label: 'Certificate', icon: '📜' },
    { value: 'subscription', label: 'Subscription Days', icon: '📆' }
  ];
  
  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];
  
  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'default' },
    { value: 'normal', label: 'Normal', color: 'primary' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'critical', label: 'Critical', color: 'error' }
  ];
  
  const audiences = [
    { value: 'all', label: 'All Users' },
    { value: 'beginners', label: 'Beginners' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'experts', label: 'Experts' },
    { value: 'developers', label: 'Developers' },
    { value: 'traders', label: 'Traders' },
    { value: 'researchers', label: 'Researchers' }
  ];

  // Check admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const addToQueue = () => {
    const newQuestParams = {
      id: Date.now(),
      difficulty,
      category,
      pointsRequired,
      pointsReward,
      questType,
      completionTime,
      rewardType,
      language,
      priorityLevel,
      targetAudience,
      skillLevel,
      isRepeatable,
      hasDeadline,
      maxAttempts,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      result: null
    };
    
    setQuestQueue(prev => [...prev, newQuestParams]);
    showSnackbar('Quest added to queue successfully!');
  };

  const processQueue = async () => {
    const waitingQuests = questQueue.filter(q => q.status === 'waiting');
    if (waitingQuests.length === 0) {
      showSnackbar('No waiting quests in queue', 'warning');
      return;
    }
    
    setProcessingQueue(true);
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < questQueue.length; i++) {
      const questParams = questQueue[i];
      
      if (questParams.status !== 'waiting') continue;
      
      setCurrentQueueIndex(i);
      
      // Update status to processing
      setQuestQueue(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'processing' } : item
      ));
      
      try {
        console.log(`Processing quest ${i + 1}/${waitingQuests.length}`);
        
        const response = await fetch('/api/admin/generate-quest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            difficulty: questParams.difficulty,
            category: questParams.category,
            pointsRequired: questParams.pointsRequired,
            pointsReward: questParams.pointsReward,
            questType: questParams.questType,
            completionTime: questParams.completionTime,
            rewardType: questParams.rewardType,
            language: questParams.language,
            priorityLevel: questParams.priorityLevel,
            targetAudience: questParams.targetAudience
          }),
        });
        
        // Önce response'un content-type'ını kontrol et
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Invalid response format. Expected JSON but got: ${text.substring(0, 100)}...`);
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.message || `HTTP Error: ${response.status}`);
        }
        
        // Backend'den gelen uyarıları kontrol et
        if (data.warning) {
          console.warn(`Quest generation warning: ${data.warning}`);
        }
        
        // Başarılı sonucu kaydet
        setQuestQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'completed', 
            completedAt: new Date().toISOString(),
            result: data,
            contentId: data.contentId || data.ContentID || data.id,
            warning: data.warning
          } : item
        ));
        
        successCount++;
        
      } catch (error) {
        console.error(`Error processing quest ${i}:`, error);
        
        // Daha detaylı hata mesajı
        let errorMessage = error.message;
        if (error.message.includes('JSON')) {
          errorMessage = 'AI generated invalid JSON format. Please try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        setQuestQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'failed', 
            error: errorMessage,
            rawError: error.message 
          } : item
        ));
        
        failCount++;
      }
      
      // Rate limiting için kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setProcessingQueue(false);
    setCurrentQueueIndex(-1);
    
    // Sonuç özeti göster
    if (failCount === 0) {
      showSnackbar(`All ${successCount} quests processed successfully!`, 'success');
    } else if (successCount === 0) {
      showSnackbar(`All ${failCount} quests failed to process.`, 'error');
    } else {
      showSnackbar(`${successCount} quests succeeded, ${failCount} failed.`, 'warning');
    }
  };

  const getFilteredQueue = () => {
    let filtered = questQueue.filter(item => {
      if (!filterOptions.showCompleted && item.status === 'completed') return false;
      if (!filterOptions.showFailed && item.status === 'failed') return false;
      if (!filterOptions.showWaiting && item.status === 'waiting') return false;
      if (!filterOptions.showProcessing && item.status === 'processing') return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'status':
          const statusOrder = { waiting: 0, processing: 1, completed: 2, failed: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'difficulty':
          const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'priority':
          const priorityOrder = { low: 0, normal: 1, high: 2, critical: 3 };
          return priorityOrder[b.priorityLevel] - priorityOrder[a.priorityLevel];
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Handle saving quest
  const handleSaveQuest = async () => {
    console.log("Save quest initiated with:", {
      generatedQuest,
      contentId,
      conditions: generatedQuest?.conditions
    });
    
    if (!generatedQuest) {
      setError("No quest data available to save");
      return;
    }
    
    // Conditions kontrolü
    if (!generatedQuest.conditions || !Array.isArray(generatedQuest.conditions)) {
      setError("Quest conditions are invalid. Please regenerate the quest.");
      return;
    }
    
    if (generatedQuest.conditions.length === 0) {
      console.warn("No conditions found, but proceeding with save");
    }
    
    setLoading(true);
    setSaving(true);
    setError(null);
    
    try {
      if (contentId) {
        // ContentId varsa, onay sürecini kullan
        const requestBody = {
          contentId,
          rewardPoints: pointsReward,
          requiredPoints: pointsRequired,
          difficultyLevel: difficulty,
          conditionType: 'total_points',
          generateWithAI: true
        };
        
        console.log("Approving quest with contentId:", requestBody);
        
        const response = await fetch('/api/admin/quests', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || data.message || 'Failed to approve quest');
        }
        
        setActiveStep(2);
      } else {
        // ContentId yoksa, doğrudan quest oluştur
        const conditionsData = generatedQuest.conditions.map(condition => ({
          conditionType: condition.type || 'total_points',
          targetId: null,
          targetValue: condition.score_required || condition.target_value || condition.targetValue || 1,
          description: condition.topic || condition.description || 'Complete task'
        }));
        
        const requestBody = {
          title: generatedQuest.title,
          description: generatedQuest.description,
          rewardPoints: pointsReward,
          requiredPoints: pointsRequired,
          difficultyLevel: difficulty,
          conditions: conditionsData,
          questType: questType,
          completionTime: completionTime,
          rewardType: rewardType,
          isActive: true,
          generateWithAI: false
        };
        
        console.log("Creating quest directly without contentId:", requestBody);
        
        const response = await fetch('/api/admin/quests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          const responseText = await response.text();
          console.error("Raw response:", responseText);
          
          if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            throw new Error('Authentication error. Please login again.');
          }
          throw new Error('Invalid response from server. Please try again.');
        }
        
        console.log("API create response:", data);
        
        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to create quest');
        }
        
        setActiveStep(2);
      }
    } catch (err) {
      console.error("Save quest error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => router.push('/admin/content/quests')}
              sx={{ 
                mr: 1.5,
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': { 
                  bgcolor: 'action.hover',
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <BackIcon />
            </IconButton>
            <Box>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                fontWeight="800"
                sx={{ 
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #e91e63 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                AI Quest Generator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage AI-powered quests
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Parameters section */}
        <Stack spacing={3}>
          {/* Core parameters */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Core Parameters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {React.cloneElement(cat.icon, { sx: { color: cat.color } })}
                          {cat.value}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    label="Difficulty"
                  >
                    {difficulties.map((d) => (
                      <MenuItem key={d.value} value={d.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            label={d.label}
                            color={d.color}
                            icon={d.icon}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <FormControl fullWidth>
                  <InputLabel>Quest Type</InputLabel>
                  <Select
                    value={questType}
                    onChange={(e) => setQuestType(e.target.value)}
                    label="Quest Type"
                  >
                    {questTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {React.cloneElement(type.icon, { sx: { color: type.color } })}
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <FormControl fullWidth>
                  <InputLabel>Completion Time</InputLabel>
                  <Select
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                    label="Completion Time"
                  >
                    {completionTimes.map((time) => (
                      <MenuItem key={time.value} value={time.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box>{time.icon}</Box>
                          {time.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <FormControl fullWidth>
                  <InputLabel>Reward Type</InputLabel>
                  <Select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value)}
                    label="Reward Type"
                  >
                    {rewardTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box>{type.icon}</Box>
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  label="Required Points"
                  type="number"
                  value={pointsRequired}
                  onChange={(e) => setPointsRequired(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <TimerIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  fullWidth
                  label="Reward Points"
                  type="number"
                  value={pointsReward}
                  onChange={(e) => setPointsReward(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <RewardIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={addToQueue}
                  startIcon={<AddIcon />}
                  sx={{ 
                    height: 56,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #7b1fa2 0%, #e91e63 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6a1b9a 0%, #d81b60 100%)',
                    }
                  }}
                >
                  Add to Queue
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Advanced parameters */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: { xs: 2, md: 3 },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'action.hover',
                cursor: 'pointer'
              }}
              onClick={() => setExpandedParams(!expandedParams)}
            >
              <Typography variant="h6" fontWeight={600}>
                Advanced Parameters
              </Typography>
              <IconButton size="small">
                <ExpandMoreIcon
                  sx={{
                    transform: expandedParams ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                />
              </IconButton>
            </Box>
            
            <Collapse in={expandedParams}>
              <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        label="Language"
                      >
                        {languages.map(lang => (
                          <MenuItem key={lang.value} value={lang.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {lang.flag} {lang.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <FormControl fullWidth>
                      <InputLabel>Priority Level</InputLabel>
                      <Select
                        value={priorityLevel}
                        onChange={(e) => setPriorityLevel(e.target.value)}
                        label="Priority Level"
                      >
                        {priorityLevels.map(level => (
                          <MenuItem key={level.value} value={level.value}>
                            <Chip size="small" label={level.label} color={level.color} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <FormControl fullWidth>
                      <InputLabel>Target Audience</InputLabel>
                      <Select
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        label="Target Audience"
                      >
                        {audiences.map(audience => (
                          <MenuItem key={audience.value} value={audience.value}>
                            {audience.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      fullWidth
                      label="Max Attempts"
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ px: 1 }}>
                      <Typography gutterBottom>Skill Level: {skillLevel}/10</Typography>
                      <Slider
                        value={skillLevel}
                        onChange={(e, newValue) => setSkillLevel(newValue)}
                        min={1}
                        max={10}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isRepeatable}
                          onChange={(e) => setIsRepeatable(e.target.checked)}
                        />
                      }
                      label="Repeatable Quest"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={hasDeadline}
                          onChange={(e) => setHasDeadline(e.target.checked)}
                        />
                      }
                      label="Has Deadline"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Paper>

          {/* Queue section - Full width */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 3,
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <QueueIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1.5 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Quest Queue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {questQueue.length} total items ({questQueue.filter(q => q.status === 'waiting').length} waiting)
                  </Typography>
                </Box>
              </Box>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <IconButton 
                  onClick={(e) => setFilterMenu(e.currentTarget)}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
                  }}
                >
                  <FilterIcon />
                </IconButton>
                <IconButton 
                  onClick={(e) => setSortMenu(e.currentTarget)}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
                  }}
                >
                  <SortIcon />
                </IconButton>
                <Button
                  variant="outlined"
                  onClick={() => setQuestQueue(prev => prev.filter(q => q.status !== 'completed'))}
                  disabled={questQueue.filter(q => q.status === 'completed').length === 0}
                  sx={{ borderRadius: 2 }}
                >
                  Clear Completed
                </Button>
                <Button
                  variant="contained"
                  onClick={processQueue}
                  disabled={processingQueue || questQueue.filter(q => q.status === 'waiting').length === 0}
                  startIcon={processingQueue ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                  }}
                >
                  {processingQueue ? 'Processing...' : 'Process Queue'}
                </Button>
              </Stack>
            </Box>
            
            {/* Queue stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                  <Typography variant="h4" fontWeight={600} color="info.main">
                    {questQueue.filter(q => q.status === 'waiting').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Waiting</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                }}>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {questQueue.filter(q => q.status === 'processing').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Processing</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {questQueue.filter(q => q.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                }}>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {questQueue.filter(q => q.status === 'failed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Failed</Typography>
                </Card>
              </Grid>
            </Grid>
            
            {/* Queue list */}
            {getFilteredQueue().length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <QueueIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No quests in queue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add quests using the parameters above
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {getFilteredQueue().map((quest, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={quest.id}>
                    <Grow in={true} timeout={300 + index * 100}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: '1px solid',
                          borderColor: quest.status === 'processing' ? 'primary.main' : 'divider',
                          boxShadow: quest.status === 'processing' ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}` : 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <CardContent sx={{ flex: 1, pb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {quest.status === 'waiting' && <HourglassEmptyIcon fontSize="small" color="action" />}
                              {quest.status === 'processing' && <CircularProgress size={20} />}
                              {quest.status === 'completed' && <CheckCircleIcon fontSize="small" color="success" />}
                              {quest.status === 'failed' && <CancelIcon fontSize="small" color="error" />}
                              <Typography variant="subtitle2" fontWeight={600}>
                                {quest.category}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => setQuestQueue(prev => prev.filter(q => q.id !== quest.id))}
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
                                color={difficulties.find(d => d.value === quest.difficulty)?.color}
                              />
                              <Chip
                                size="small"
                                label={`${quest.pointsReward} pts`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={quest.priorityLevel}
                                color={priorityLevels.find(p => p.value === quest.priorityLevel)?.color}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                label={questTypes.find(t => t.value === quest.questType)?.label}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={completionTimes.find(t => t.value === quest.completionTime)?.label}
                                variant="outlined"
                              />
                            </Box>
                          </Stack>
                          
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Created: {new Date(quest.createdAt).toLocaleDateString()}
                          </Typography>
                          
                          {quest.status === 'completed' && (
                            <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                              Completed: {new Date(quest.completedAt).toLocaleDateString()}
                            </Typography>
                          )}
                          
                          {quest.status === 'failed' && (
                            <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                              Error: {quest.error}
                            </Typography>
                          )}
                        </CardContent>
                        
                        {quest.status === 'completed' && (
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              fullWidth
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => router.push('/admin/pending-content')}
                              sx={{ borderRadius: 1 }}
                            >
                              View in Pending
                            </Button>
                          </Box>
                        )}
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {processingQueue && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={(currentQueueIndex + 1) / questQueue.filter(q => q.status === 'waiting').length * 100}
                  sx={{ borderRadius: 1, height: 8 }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Processing {currentQueueIndex + 1} of {questQueue.filter(q => q.status === 'waiting').length}
                </Typography>
              </Box>
            )}
          </Paper>
        </Stack>

        {/* Menus */}
        <Menu
          anchorEl={filterMenu}
          open={Boolean(filterMenu)}
          onClose={() => setFilterMenu(null)}
        >
          <Box sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Filter by Status</Typography>
            <FormGroup>
              {Object.entries(filterOptions).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={value}
                      onChange={(e) => setFilterOptions({ ...filterOptions, [key]: e.target.checked })}
                      size="small"
                    />
                  }
                  label={key.replace('show', '')}
                />
              ))}
            </FormGroup>
          </Box>
        </Menu>
        
        <Menu
          anchorEl={sortMenu}
          open={Boolean(sortMenu)}
          onClose={() => setSortMenu(null)}
        >
          <MenuItem 
            selected={sortBy === 'date'}
            onClick={() => { setSortBy('date'); setSortMenu(null); }}
          >
            Sort by Date
          </MenuItem>
          <MenuItem 
            selected={sortBy === 'status'}
            onClick={() => { setSortBy('status'); setSortMenu(null); }}
          >
            Sort by Status
          </MenuItem>
          <MenuItem 
            selected={sortBy === 'difficulty'}
            onClick={() => { setSortBy('difficulty'); setSortMenu(null); }}
          >
            Sort by Difficulty
          </MenuItem>
          <MenuItem 
            selected={sortBy === 'priority'}
            onClick={() => { setSortBy('priority'); setSortMenu(null); }}
          >
            Sort by Priority
          </MenuItem>
        </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </MainLayout>
  );
}