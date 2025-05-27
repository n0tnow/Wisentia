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
  ListItemButton,
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
  Slider,
  Tooltip,
  FormControlComponent,
  FormControlLabelComponent,
  CheckboxComponent,
  Radio,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Modal,
  Tabs,
  Tab
} from '@mui/material';

// MUI icons
import {
  Add as AddIcon,
  YouTube as YouTubeIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Psychology as PsychologyIcon,
  FilterList as FilterListIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  ElectricalServices as ElectricalServicesIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoIcon,
  Timer as TimerIcon,
  PlaylistAdd as PlaylistAddIcon,
  Refresh as RefreshIcon,
  SettingsBackupRestore as SettingsBackupRestoreIcon,
  Clear as ClearIcon,
  Engineering as CogIcon,
  PlayArrow as PlayArrowIcon,
  Quiz as QuizIcon,
  Description as ContentIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon,
  Help as QuestionIcon,
  Queue as QueueIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// LocalStorage keys for persistence
const STORAGE_KEYS = {
  QUEUE: 'wisentia_quiz_queue',
  FILTERS: 'wisentia_quiz_filters',
  SORT: 'wisentia_quiz_sort'
};

// API endpoints for courses and videos
const COURSE_API_ENDPOINT = '/api/admin/courses';
const ADMIN_CONTENT_API_ENDPOINT = '/api/admin/content';

// Quiz queue storage key
const QUIZ_QUEUE_STORAGE_KEY = 'wisentia_quiz_queue';

// Stat Card bileşeni
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

// Kart bileşeni
const QuizCard = ({ quiz, onDelete, onRetry, difficulties, languages, router, onPreview }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: 380,
        minHeight: 380,
        maxHeight: 380,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid',
        borderColor: quiz.status === 'processing' ? 'primary.main' : 'divider',
        boxShadow: quiz.status === 'processing' ? `0 0 0 2px ${alpha('#1976d2', 0.1)}` : 1,
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
            {quiz.status === 'waiting' && <HourglassEmptyIcon fontSize="small" color="action" />}
            {quiz.status === 'analyzing' && <PsychologyIcon fontSize="small" color="secondary" />}
            {quiz.status === 'processing' && <CircularProgress size={20} />}
            {quiz.status === 'completed' && <CheckCircleIcon fontSize="small" color="success" />}
            {quiz.status === 'failed' && <CancelIcon fontSize="small" color="error" />}
            <Tooltip title={quiz.source === 'course' ? quiz.courseName : quiz.videoTitle}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ 
                wordWrap: 'break-word',
                overflow: 'hidden',
                maxHeight: '2.4em',
                lineHeight: '1.2em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {quiz.source === 'course' ? quiz.courseName : quiz.videoTitle}
            </Typography>
            </Tooltip>
          </Box>
          <IconButton
            size="small"
            onClick={() => onDelete(quiz.id)}
            sx={{ ml: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={quiz.difficulty}
              color={difficulties.find(d => d.value === quiz.difficulty)?.color}
            />
            <Chip
              size="small"
              label={`${quiz.numQuestions} questions`}
              variant="outlined"
            />
            {quiz.language !== 'en' && (
              <Chip
                size="small"
                label={languages.find(l => l.value === quiz.language)?.label}
                variant="outlined"
              />
            )}
            {quiz.model && (
              <Chip
                size="small"
                label={quiz.model === 'anthropic' ? 'Claude 3' : 'Llama 3'}
                variant="outlined"
                color={quiz.model === 'anthropic' ? 'secondary' : 'default'}
                icon={quiz.model === 'anthropic' ? <ElectricalServicesIcon fontSize="small" /> : <CogIcon fontSize="small" />}
              />
            )}
          </Box>
        </Stack>
        
        {quiz.source === 'course' ? (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ 
              display: 'block', 
              fontWeight: 'bold',
              wordWrap: 'break-word', 
              whiteSpace: 'normal'
            }}>
              Course Quiz: {quiz.courseName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Selected Videos: {quiz.selectedVideos?.length || 0}
            </Typography>
            {quiz.selectedVideos && quiz.selectedVideos.length > 0 && (
              <Box sx={{ mt: 1, maxHeight: 120, overflow: 'auto' }}>
                {quiz.selectedVideos.slice(0, 3).map((video, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 0.5,
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.background.default, 0.6)
                  }}>
                    {video.YouTubeVideoID && (
                      <Box
                        component="img"
                        src={`https://img.youtube.com/vi/${video.YouTubeVideoID}/default.jpg`}
                        alt="Video Thumbnail"
                        sx={{
                          width: 36,
                          height: 27,
                          borderRadius: 0.5,
                          mr: 1,
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    {!video.YouTubeVideoID && (
                      <Box
                        sx={{
                          width: 36,
                          height: 27,
                          borderRadius: 0.5,
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <VideoIcon fontSize="small" sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
                      </Box>
                    )}
                    <Typography variant="caption" component="div" sx={{ 
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {video.Title || `Video ${index + 1}`}
                    </Typography>
                  </Box>
                ))}
                {quiz.selectedVideos.length > 3 && (
                  <Typography variant="caption" sx={{ 
                    fontStyle: 'italic', 
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    mt: 0.5
                  }}>
                    <AddIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    {quiz.selectedVideos.length - 3} more videos
                  </Typography>
                )}
              </Box>
            )}
          </>
        ) : (
          <>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Video ID: {quiz.videoId}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Created: {new Date(quiz.createdAt).toLocaleDateString()}
        </Typography>
          </>
        )}
        
        {quiz.status === 'analyzing' && (
          <Typography variant="caption" color="secondary" sx={{ display: 'block' }}>
            Analyzing video content...
          </Typography>
        )}
        
        {quiz.status === 'processing' && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <CircularProgress size={14} sx={{ mr: 1 }} />
              <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                Processing Quiz Generation
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={quiz.progress?.percentage || 10} 
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
              {quiz.progress?.current_step || 'Processing...'} ({quiz.progress?.percentage || 10}%)
            </Typography>
          </Box>
        )}
        
        {quiz.status === 'completed' && (
          <>
            {/* View Quiz button removed */}
            
            {quiz.model === 'anthropic' && quiz.result?.cost && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                API cost: ${quiz.result.cost.total_cost?.toFixed(4) || '0.00'} ({quiz.result.cost.input_tokens || 0} in / {quiz.result.cost.output_tokens || 0} out)
          </Typography>
            )}
          </>
        )}
        
        {quiz.status === 'failed' && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ 
              display: 'block', 
              maxHeight: 80, 
              overflow: 'auto', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'pre-line',
              fontSize: '0.85em',
              mt: 1
            }}
          >
            Error: {quiz.error}
          </Typography>
        )}
      </CardContent>
      
      {quiz.status === 'completed' && (
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
  );
};

// Quiz Preview Modal Component
const QuizPreviewModal = ({ open, onClose, quiz, quizData }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="quiz-preview-dialog-title"
    >
      <DialogTitle id="quiz-preview-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            <QuizIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quiz Preview
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CancelIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {quizData ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>{quizData.Title}</Typography>
              <Typography variant="body2" color="text.secondary">{quizData.Description}</Typography>
              
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={`Passing Score: ${quizData.PassingScore}%`} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
                {quizData.course && (
                  <Chip 
                    label={`Course: ${quizData.course.CourseTitle || 'Unknown'}`} 
                    color="secondary" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {quizData.video && (
                  <Chip 
                    label={`Video: ${quizData.video.VideoTitle || 'Unknown'}`} 
                    icon={<VideoIcon />}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              <ContentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Questions
            </Typography>
            
            {quizData.questions && quizData.questions.length > 0 ? (
              <List>
                {quizData.questions.map((question, index) => (
                  <Paper 
                    key={question.QuestionID || `question-${index}`} 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {index + 1}. {question.QuestionText}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Type: {question.QuestionType === 'multiple_choice' ? 'Multiple Choice' : 
                             question.QuestionType === 'true_false' ? 'True/False' : 'Short Answer'}
                    </Typography>
                    
                    {question.options && question.options.length > 0 && (
                      <Box sx={{ ml: 2 }}>
                        <List dense disablePadding>
                          {question.options.map((option, optionIndex) => (
                            <ListItem key={option.OptionID || `option-${optionIndex}`} disablePadding>
                              <ListItemButton dense disabled>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Radio disabled checked={false} />
                                </ListItemIcon>
                                <ListItemText primary={option.OptionText} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No questions available for preview.
              </Typography>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {quiz && quiz.contentId && (
          <Button 
            color="primary" 
            variant="contained"
            onClick={() => window.open(`/admin/content/quizzes/edit?contentId=${quiz.contentId}`, '_blank')}
          >
            Edit Quiz
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default function GenerateQuizPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // Tab kontrolü
  const [activeTab, setActiveTab] = useState(0); // 0: AI Generation, 1: Manual Creation
  
  // Video URL ve analiz için state'ler
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  
  // Kurs ve video seçimi için state'ler
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [courseVideos, setCourseVideos] = useState([]);
  const [contentSource, setContentSource] = useState('youtube'); // 'youtube' veya 'course'
  
  // Manuel quiz oluşturma için state'ler
  const [manualQuiz, setManualQuiz] = useState({
    title: '',
    description: '',
    courseId: '',
    videoId: '',
    difficulty: 'intermediate',
    passingScore: 70,
    language: 'en',
    questions: []
  });
  
  // Manuel quiz soruları için state
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    explanation: ''
  });
  
  // Quiz parametreleri
  const [settings, setSettings] = useState({
    numQuestions: 5,
    difficulty: 'intermediate',
    passingScore: 70,
    language: 'en',
    targetAudience: 'general',
    instructionalApproach: 'conceptual',
    model: 'llama', // Default model is Llama
  });
  
  // İşlem state'leri
  const [quizQueue, setQuizQueue] = useState([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [queueStats, setQueueStats] = useState({ 
    total: 0, waiting: 0, processing: 0, completed: 0, failed: 0 
  });
  
  // UI state'leri
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortOption, setSortOption] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  
  // Initialize filter options from localStorage
  const [filterOptions, setFilterOptions] = useState({
        showWaiting: true,
        showProcessing: true,
    showAnalyzing: true,
      showCompleted: true,
    showFailed: true
  });
  
  // Initialize sort from localStorage
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Request states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  // New state for quiz preview
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [quizPreviewData, setQuizPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Load courses when component mounts
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCourses();
    }
  }, [user]);
  
  // Fetch queue from localStorage when component mounts
  useEffect(() => {
    const fetchStoredQueue = () => {
      try {
        const storedQueue = localStorage.getItem(QUIZ_QUEUE_STORAGE_KEY);
        if (storedQueue) {
          const parsedQueue = JSON.parse(storedQueue);
          // Only load waiting and processing items
          setQuizQueue(parsedQueue);
          
          // Check if there are items in processing status
          const processingItems = parsedQueue.filter(item => 
            item.status === 'processing' || item.status === 'analyzing');
          
          // If there are processing items, update them to waiting status
          if (processingItems.length > 0) {
            const updatedQueue = parsedQueue.map(item => 
              (item.status === 'processing' || item.status === 'analyzing') 
                ? { ...item, status: 'waiting' } 
                : item
            );
            setQuizQueue(updatedQueue);
            
            // Auto-resume processing with a slight delay
            setTimeout(() => {
              showSnackbar(`Resuming ${processingItems.length} processing items...`, 'info');
              processQueue();
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error loading stored queue:', error);
      }
    };
    
    fetchStoredQueue();
  }, []);
  
  // Save queue to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_QUEUE_STORAGE_KEY, JSON.stringify(quizQueue));
    } catch (error) {
      console.error('Error saving queue to localStorage:', error);
    }
  }, [quizQueue]);
  
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
  
  // Data options
  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'success', description: 'Basic understanding and recall' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning', description: 'Application and analysis' },
    { value: 'advanced', label: 'Advanced', color: 'error', description: 'Deep comprehension and synthesis' }
  ];
  
  const questionTypeOptions = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: <QuizIcon /> },
    { value: 'true_false', label: 'True/False', icon: <CheckIcon /> },
    { value: 'short_answer', label: 'Short Answer', icon: <QuestionIcon /> }
  ];
  
  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];
  
  const audiences = [
    { value: 'general', label: 'General Audience' },
    { value: 'students', label: 'Students' },
    { value: 'professionals', label: 'Professionals' },
    { value: 'experts', label: 'Subject Experts' },
    { value: 'beginners', label: 'Beginners' }
  ];
  
  const instructionalApproachOptions = [
    { value: 'conceptual', label: 'Conceptual', description: 'Focus on understanding concepts and theories' },
    { value: 'procedural', label: 'Procedural', description: 'Focus on procedures and sequences of steps' },
    { value: 'declarative', label: 'Declarative', description: 'Focus on facts and information' },
    { value: 'problem_solving', label: 'Problem Solving', description: 'Focus on solving problems and case studies' },
    { value: 'critical_thinking', label: 'Critical Thinking', description: 'Focus on analysis and evaluation' },
  ];
  
  // Model options
  const modelOptions = [
    { 
      value: 'llama', 
      label: 'Llama 3 (Free)', 
      description: 'Open-source model running locally - faster but less accurate',
      icon: <CogIcon />
    },
    { 
      value: 'anthropic', 
      label: 'Claude 3 (Paid API)', 
      description: 'Anthropic\'s Claude 3 Sonnet model - higher quality but costs about $0.03-$0.15 per quiz',
      icon: <ElectricalServicesIcon />
    }
  ];

  // Check admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
    
    // Load auth token
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    try {
      let id = '';
      
      if (url.includes('youtube.com/watch?v=')) {
        const urlObj = new URL(url);
        id = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          id = parts[1].split('?')[0].split('&')[0];
        }
      } else if (url.includes('youtube.com/embed/')) {
        const parts = url.split('youtube.com/embed/');
        if (parts.length > 1) {
          id = parts[1].split('?')[0].split('&')[0];
        }
      } else {
        id = url.trim();
      }
      
      return id;
    } catch (error) {
      return url.trim();
    }
  };

  // Handle YouTube URL change
  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);

    if (!url.includes('http')) {
      setVideoUrl(`https://www.youtube.com/watch?v=${extractVideoId(url)}`);
    }

    const extractedId = extractVideoId(url);
    if (extractedId && extractedId !== videoId) {
      setVideoId(extractedId);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Kursları getir
  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log("Fetching courses from:", COURSE_API_ENDPOINT);
      
      const response = await fetch(COURSE_API_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Courses fetched:", data);
      
      if (Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else if (data && typeof data === 'object' && Array.isArray(data)) {
        // If the response is an array directly
        setCourses(data);
      } else {
        console.error("Unexpected course data format:", data);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showSnackbar('Failed to load courses', 'error');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Kurs videolarını getir
  const fetchCourseVideos = async (courseId) => {
    try {
      setLoading(true);
      console.log(`Fetching videos for course ID ${courseId}`);
      
      // Direct endpoint to get course with videos
      const videosEndpoint = `/api/admin/courses/${courseId}`;
      console.log("Using videos endpoint:", videosEndpoint);
      
      const response = await fetch(videosEndpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course videos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Course videos fetched:", data);
      
      // Get videos from course response
      let videos = [];
      if (data && Array.isArray(data.videos)) {
        videos = data.videos;
      } else if (data && data.videos && Array.isArray(data.videos)) {
        videos = data.videos;
      } else if (Array.isArray(data)) {
        videos = data; 
      }
      
      console.log("Extracted videos:", videos);
      setCourseVideos(videos);
      
      if (videos.length === 0) {
        showSnackbar('No videos found for this course', 'warning');
      }
    } catch (error) {
      console.error('Error fetching course videos:', error);
      showSnackbar('Failed to load course videos', 'error');
      setCourseVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Kurs seçildiğinde videolarını getir
  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    const course = courses.find(c => c.CourseID === courseId);
    setSelectedCourse(course);
    setSelectedVideos([]);
    
    if (course) {
      fetchCourseVideos(course.CourseID);
    } else {
      setCourseVideos([]);
    }
  };

  // Birden fazla video seçimini yönet
  const handleVideoSelection = (videoId) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };

  // İçerik kaynağını değiştir
  const handleContentSourceChange = (event) => {
    setContentSource(event.target.value);
  };

  const addToQueue = () => {
    if (contentSource === 'youtube') {
      // Mevcut YouTube URL kontrolü
    if (!videoId || !videoUrl) {
        showSnackbar('Lütfen geçerli bir YouTube video URL\'si girin', 'error');
      return;
    }

      // YouTube video quiz'i oluştur
    const newQuizParams = {
      id: Date.now(),
      videoId,
        videoUrl,
      videoTitle: videoTitle || `Video ${videoId}`,
        numQuestions: parseInt(settings.numQuestions, 10),
        difficulty: settings.difficulty,
        questionTypes: questionTypeOptions.map(t => t.value),
        language: settings.language,
        targetAudience: settings.targetAudience,
        quizDuration: 30,
        passingScore: parseInt(settings.passingScore, 10),
        instructionalApproach: settings.instructionalApproach,
        model: settings.model,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      result: null,
        videoAnalysis: null,
        source: 'youtube'
    };

    setQuizQueue(prev => [...prev, newQuizParams]);
      showSnackbar('Quiz kuyruğa eklendi!');

      // Formu sıfırla
    setVideoUrl('');
    setVideoId('');
    setVideoTitle('');
    } else if (contentSource === 'course') {
      // Kurs ve video seçimi kontrolü
      if (!selectedCourse) {
        showSnackbar('Lütfen bir kurs seçin', 'error');
        return;
      }
      
      if (selectedVideos.length === 0) {
        showSnackbar('Lütfen en az bir video seçin', 'error');
        return;
      }
      
      // Seçilen videoları bul
      const selectedVideoObjects = courseVideos.filter(video => 
        selectedVideos.includes(video.VideoID)
      );
      
      // Kurs video quiz'i oluştur
      const newQuizParams = {
        id: Date.now(),
        courseId: selectedCourse.CourseID,
        courseName: selectedCourse.Title,
        selectedVideos: selectedVideoObjects,
        numQuestions: parseInt(settings.numQuestions, 10),
        difficulty: settings.difficulty,
        questionTypes: questionTypeOptions.map(t => t.value),
        language: settings.language,
        targetAudience: settings.targetAudience,
        quizDuration: 30,
        passingScore: parseInt(settings.passingScore, 10),
        instructionalApproach: settings.instructionalApproach,
        model: settings.model,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        result: null,
        videoAnalysis: null,
        source: 'course'
      };
      
      setQuizQueue(prev => [...prev, newQuizParams]);
      showSnackbar('Kurs quiz\'i kuyruğa eklendi!');
      
      // Formu sıfırla
      setSelectedVideos([]);
    }
  };

  const processQueue = async () => {
    if (processingQueue) return;

    const waitingQuizzes = quizQueue.filter(q => q.status === 'waiting');
    if (waitingQuizzes.length === 0) {
      showSnackbar('No waiting quizzes in queue', 'warning');
      return;
    }
    
    setProcessingQueue(true);
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < quizQueue.length; i++) {
      const quizParams = quizQueue[i];
      
      if (quizParams.status !== 'waiting') continue;
      
      setCurrentQueueIndex(i);
      
      // Step 1: Simulate video analysis (frontend only)
      setQuizQueue(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'analyzing', progress: { status: 'processing', percentage: 0, current_step: 'Analyzing video content...' } } : item
      ));
      
      try {
        console.log(`Analyzing video for quiz ${i + 1}/${waitingQuizzes.length}`);
        
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create simple analysis based on video title
        const analysisData = {
          title: quizParams.videoTitle || `Educational Video ${quizParams.videoId}`,
          analysis: `This video covers important educational content. The main topics include key concepts that will be tested in the quiz. Based on the video content, we'll create ${quizParams.numQuestions} questions at ${quizParams.difficulty} difficulty level.`,
          duration: 10,
          language: quizParams.language
        };
        
        // Update with simulated analysis data
        setQuizQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            videoTitle: analysisData.title,
            videoAnalysis: analysisData.analysis,
            status: 'processing'
          } : item
        ));
        
        // Step 2: Generate quiz using existing API
        console.log(`Generating quiz ${i + 1}/${waitingQuizzes.length}`);

        // Farklı kaynak türleri için farklı kontroller yapalım
        if (quizParams.source === 'youtube' && !quizParams.videoUrl) {
          throw new Error("Video URL is missing for this YouTube quiz item.");
        }
        
        if (quizParams.source === 'course' && (!quizParams.courseId || !quizParams.selectedVideos || quizParams.selectedVideos.length === 0)) {
          throw new Error("Course information or selected videos are missing for this course quiz item.");
        }
        
        console.log('Making API request with params:', {
          source: quizParams.source,
          videoId: quizParams.videoId,
          videoTitle: quizParams.videoTitle || analysisData.title,
          videoUrl: quizParams.videoUrl,
          courseId: quizParams.courseId,
          courseName: quizParams.courseName,
          selectedVideos: quizParams.selectedVideos,
          numQuestions: quizParams.numQuestions,
          difficulty: quizParams.difficulty,
          passingScore: quizParams.passingScore,
          language: quizParams.language,
          targetAudience: quizParams.targetAudience,
          instructionalApproach: quizParams.instructionalApproach,
          model: quizParams.model || 'llama',
          forPendingReview: true
        });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3600000); // 60 minute timeout (increased from 2 minutes)
        
        // Update progress to show we're starting the API request
        setQuizQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            progress: { 
              status: 'processing', 
              percentage: 10, 
              current_step: 'Bağlantı kuruluyor ve API isteği gönderiliyor...' 
            } 
          } : item
        ));
        
        // Progress update interval - show longer timescale expectation
        let progressInterval = null;
        let progressCounter = 5; // Start from lower value to give more room for progression
        let progressStep = 0.2; // Slower progress bar for longer timeout
        
        // Set time estimates based on content type and length
        let timeEstimate = '';
        if (quizParams.source === 'youtube') {
          timeEstimate = 'Bu işlem 5-30 dakika sürebilir, lütfen bekleyin.';
        } else if (quizParams.source === 'course') {
          timeEstimate = 'Kurs quiz oluşturma 5-40 dakika sürebilir, lütfen bekleyin.';
        }
        
        // Start progress animation to provide visual feedback during long request
        progressInterval = setInterval(() => {
          // More gradual progress increments - slower near the end
          if (progressCounter < 15) {
            progressStep = 0.4;
          } else if (progressCounter < 30) {
            progressStep = 0.3;
          } else if (progressCounter < 50) {
            progressStep = 0.2;
          } else if (progressCounter < 70) {
            progressStep = 0.1;
          } else {
            progressStep = 0.05; // Very slow at the end
          }
          
          // More gradual progression with slower increments
          progressCounter = Math.min(progressCounter + progressStep, 95); // Cap at 95% until complete
          
          // Format the percentage to show at most one decimal place
          const displayPercentage = Math.floor(progressCounter);
          
          // Get progress message based on percentage
          let progressMessage = '';
          if (progressCounter < 15) {
            progressMessage = `Transkript alınıyor ve analiz ediliyor... ${timeEstimate}`;
          } else if (progressCounter < 35) {
            progressMessage = `İçerik analizi yapılıyor... ${timeEstimate}`;
          } else if (progressCounter < 60) {
            progressMessage = `Quiz soruları oluşturuluyor... ${timeEstimate}`;
          } else if (progressCounter < 80) {
            progressMessage = `Seçenekler ve cevaplar hazırlanıyor... ${timeEstimate}`;
          } else {
            progressMessage = `Sonuçlar alınıyor... İşlem devam ediyor, lütfen bekleyin.`;
          }
          
          setQuizQueue(prev => prev.map((item, idx) => 
            idx === i ? { 
              ...item, 
              progress: { 
                ...item.progress,
                percentage: displayPercentage, 
                current_step: progressMessage
              } 
            } : item
          ));
        }, 3000);
        
        try {
          const quizResponse = await fetch('/api/admin/generate-quiz', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              source: quizParams.source,
              videoId: quizParams.videoId,
              videoTitle: quizParams.videoTitle || analysisData.title,
              videoUrl: quizParams.videoUrl,
              courseId: quizParams.courseId,
              courseName: quizParams.courseName,
              selectedVideos: quizParams.selectedVideos,
              numQuestions: parseInt(quizParams.numQuestions, 10),
              difficulty: quizParams.difficulty,
              passingScore: parseInt(quizParams.passingScore, 10),
              language: quizParams.language,
              targetAudience: quizParams.targetAudience,
              instructionalApproach: quizParams.instructionalApproach,
              model: quizParams.model || 'llama',
              forPendingReview: true
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          clearInterval(progressInterval);
          
          console.log('API Response status:', quizResponse.status);
          console.log('API Response headers:', Object.fromEntries(quizResponse.headers.entries()));
          
          const contentType = quizResponse.headers.get('content-type');
          console.log('Response content type:', contentType);
          
          let quizData;
          let responseText = '';
          
          try {
            responseText = await quizResponse.text();
            console.log('Raw response text:', responseText.substring(0, 500));
            
            if (responseText) {
              try {
                quizData = JSON.parse(responseText);
              } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
              }
            } else {
              console.error('Empty response received');
              throw new Error('Empty response received from server');
            }
          } catch (textError) {
            console.error('Failed to get response text:', textError);
            throw new Error(`Failed to read response: ${textError.message}`);
          }
          
          if (!quizResponse.ok) {
            console.error('API Error:', quizData);
            let errorMessage = 'Unknown error occurred';
            
            if (quizData && quizData.error) {
              errorMessage = quizData.error;
              if (quizData.details) {
                errorMessage += `: ${quizData.details}`;
              }
            } else if (quizData && quizData.message) {
              errorMessage = quizData.message;
            } else if (responseText) {
              errorMessage = `HTTP Error: ${quizResponse.status} - ${responseText.substring(0, 100)}`;
            } else {
              errorMessage = `HTTP Error: ${quizResponse.status}`;
            }
            
            throw new Error(errorMessage);
          }
          
          // Success - Update UI with more detailed completion animation
          setQuizQueue(prev => prev.map((item, idx) => 
            idx === i ? { 
              ...item, 
              status: 'completed', 
              completedAt: new Date().toISOString(),
              result: quizData,
              contentId: quizData.contentId || quizData.ContentID || quizData.id,
              progress: { status: 'completed', percentage: 100, current_step: 'Quiz başarıyla oluşturuldu!' }
            } : item
          ));
          
          // Show a special success indication
          showSnackbar(`Quiz ${i + 1} başarıyla oluşturuldu!`, 'success');
          
          successCount++;
          
        } catch (error) {
          clearTimeout(timeoutId);
          clearInterval(progressInterval);
          
          if (error.name === 'AbortError') {
            console.error('Request timed out after 60 minutes');
            throw new Error('İşlem çok uzun sürdüğü için sonlandırıldı (60 dakika). Lütfen yönetici ile iletişime geçin.');
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
          clearInterval(progressInterval);
        }
        
      } catch (error) {
        console.error(`Error processing quiz ${i}:`, error);
        
        // Create user-friendly error message
        let userErrorMessage = error.message;
        
        // Make timeout errors more user-friendly
        if (error.message.includes('timed out')) {
          userErrorMessage = 'Quiz oluşturma işlemi zaman aşımına uğradı. Daha az soru veya daha basit bir video deneyin.';
        }
        
        // Handle network errors
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          userErrorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
        }
        
        setQuizQueue(prev => prev.map((item, idx) => 
          idx === i ? { 
            ...item, 
            status: 'failed', 
            error: userErrorMessage,
            progress: { status: 'failed', percentage: 0, current_step: 'İşlem başarısız oldu' }
          } : item
        ));
        
        failCount++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setProcessingQueue(false);
    setCurrentQueueIndex(-1);
    
    // Show results
    if (failCount === 0) {
      showSnackbar(`All ${successCount} quizzes processed successfully!`, 'success');
    } else if (successCount === 0) {
      showSnackbar(`All ${failCount} quizzes failed to process.`, 'error');
    } else {
      showSnackbar(`${successCount} quizzes succeeded, ${failCount} failed.`, 'warning');
    }
  };

  const getFilteredQueue = () => {
    let filtered = quizQueue.filter(item => {
      if (!filterOptions.showCompleted && item.status === 'completed') return false;
      if (!filterOptions.showFailed && item.status === 'failed') return false;
      if (!filterOptions.showWaiting && item.status === 'waiting') return false;
      if (!filterOptions.showProcessing && item.status === 'processing') return false;
      if (!filterOptions.showAnalyzing && item.status === 'analyzing') return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'status':
          const statusOrder = { waiting: 0, analyzing: 1, processing: 2, completed: 3, failed: 4 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'difficulty':
          const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Function to show confirmation dialog
  const showConfirmDialog = (title, message, action) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmDialogOpen(true);
  };
  
  // Function to handle Clear All button
  const handleClearAll = () => {
    showConfirmDialog(
      'Clear Queue', 
      'Are you sure you want to clear all items from the queue? This action cannot be undone.',
      () => {
        setQuizQueue([]);
        showSnackbar('Queue cleared successfully', 'success');
      }
    );
  };

  // Function to fetch quiz details for preview
  const handlePreviewQuiz = async (quiz) => {
    setPreviewQuiz(quiz);
    setQuizPreviewData(null);
    setPreviewLoading(true);
    
    try {
      // Try to fetch the quiz data from the AI-generated content first
      if (quiz.result && quiz.result.quiz) {
        setQuizPreviewData({
          Title: quiz.title || (quiz.source === 'course' ? quiz.courseName : quiz.videoTitle),
          Description: quiz.description || 'AI-generated quiz',
          PassingScore: quiz.passingScore || 70,
          course: quiz.source === 'course' ? { CourseTitle: quiz.courseName } : null,
          video: quiz.source !== 'course' ? { VideoTitle: quiz.videoTitle } : null,
          questions: quiz.result.quiz.questions || []
        });
      } 
      // If no local data, try to fetch from the server
      else if (quiz.contentId) {
        const response = await fetch(`/api/admin/quizzes/${quiz.contentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
        }
        
        const data = await response.json();
        setQuizPreviewData(data);
      } else {
        throw new Error('No quiz data available for preview');
      }
    } catch (error) {
      console.error('Error fetching quiz preview:', error);
      showSnackbar(`Failed to load quiz preview: ${error.message}`, 'error');
    } finally {
      setPreviewLoading(false);
    }
  };
  
  // Function to close preview modal
  const handleClosePreview = () => {
    setPreviewQuiz(null);
    setQuizPreviewData(null);
  };

  // Manuel quiz fonksiyonları
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleManualQuizChange = (field, value) => {
    setManualQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const addQuestionToQuiz = () => {
    console.log('Adding question:', currentQuestion);
    
    if (!currentQuestion.questionText.trim()) {
      showSnackbar('Soru metni gereklidir', 'error');
      return;
    }

    if (currentQuestion.questionType === 'multiple_choice') {
      const hasCorrectAnswer = currentQuestion.options.some(opt => opt.isCorrect && opt.text.trim());
      const hasOptions = currentQuestion.options.filter(opt => opt.text.trim()).length >= 2;
      
      if (!hasCorrectAnswer) {
        showSnackbar('En az bir doğru cevap seçmelisiniz', 'error');
        return;
      }
      
      if (!hasOptions) {
        showSnackbar('En az iki seçenek girmelisiniz', 'error');
        return;
      }
    }

    const newQuestion = {
      ...currentQuestion,
      id: Date.now(),
      options: currentQuestion.questionType === 'multiple_choice' 
        ? currentQuestion.options.filter(opt => opt.text.trim())
        : []
    };

    setManualQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple_choice',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: ''
    });

    showSnackbar('Soru eklendi', 'success');
  };

  const removeQuestionFromQuiz = (questionId) => {
    setManualQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    showSnackbar('Soru silindi', 'success');
  };

  const submitManualQuiz = async () => {
    if (!manualQuiz.title.trim()) {
      showSnackbar('Quiz başlığı gereklidir', 'error');
      return;
    }

    if (!manualQuiz.description.trim()) {
      showSnackbar('Quiz açıklaması gereklidir', 'error');
      return;
    }

    if (manualQuiz.questions.length === 0) {
      showSnackbar('En az bir soru eklemelisiniz', 'error');
      return;
    }

    // Validate questions
    for (let i = 0; i < manualQuiz.questions.length; i++) {
      const question = manualQuiz.questions[i];
      if (!question.questionText || !question.questionText.trim()) {
        showSnackbar(`Soru ${i + 1} için soru metni gereklidir`, 'error');
        return;
      }
      
      if (question.questionType === 'multiple_choice') {
        const validOptions = question.options.filter(opt => opt.text && opt.text.trim());
        if (validOptions.length < 2) {
          showSnackbar(`Soru ${i + 1} için en az 2 seçenek gereklidir`, 'error');
          return;
        }
        
        const hasCorrectAnswer = validOptions.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          showSnackbar(`Soru ${i + 1} için en az bir doğru cevap seçmelisiniz`, 'error');
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Frontend'den API proxy'ye gönderilecek format
      const quizData = {
        title: manualQuiz.title,
        description: manualQuiz.description,
        difficulty: manualQuiz.difficulty,
        passingScore: manualQuiz.passingScore,
        language: manualQuiz.language,
        courseId: manualQuiz.courseId || null,
        videoId: manualQuiz.videoId || null,
        questions: manualQuiz.questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          explanation: q.explanation || '',
          correctAnswer: q.correctAnswer,
          options: q.options ? q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          })) : []
        }))
      };

      console.log('Sending quiz data:', JSON.stringify(quizData, null, 2));
      console.log('Manual quiz questions:', manualQuiz.questions);

      const response = await fetch('/api/admin/quizzes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(quizData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Quiz oluşturulamadı');
      }

      const result = await response.json();
      showSnackbar('Quiz başarıyla oluşturuldu!', 'success');
      
      // Reset form
      setManualQuiz({
        title: '',
        description: '',
        courseId: '',
        videoId: '',
        difficulty: 'intermediate',
        passingScore: 70,
        language: 'en',
        questions: []
      });

      // Redirect to pending content or quiz management
      setTimeout(() => {
        router.push('/admin/pending-content');
      }, 2000);

    } catch (error) {
      console.error('Manuel quiz oluşturma hatası:', error);
      showSnackbar(error.message || 'Quiz oluşturulamadı', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            <QuizIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Quiz Generation Panel
          </Typography>
          
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Create quizzes using AI generation or manual creation methods.
          </Typography>
          
          {/* Tab Navigation */}
          <Paper elevation={0} sx={{ mt: 3, border: '1px solid', borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }
              }}
            >
              <Tab 
                icon={<AutoAwesomeIcon />} 
                label="AI Generation" 
                iconPosition="start"
                sx={{ 
                  '&.Mui-selected': { 
                    color: 'primary.main',
                    fontWeight: 600
                  }
                }}
              />
              <Tab 
                icon={<EditIcon />} 
                label="Manual Creation" 
                iconPosition="start"
                sx={{ 
                  '&.Mui-selected': { 
                    color: 'primary.main',
                    fontWeight: 600
                  }
                }}
              />
            </Tabs>
          </Paper>
        </Box>
        
        {/* Tab Content */}
        {activeTab === 0 && (
          <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ContentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Content Source
            </Typography>
            
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  value="youtube"
                  control={<Radio checked={contentSource === 'youtube'} onChange={handleContentSourceChange} value="youtube" />}
                  label="YouTube Video"
                />
                <FormControlLabel
                  value="course"
                  control={<Radio checked={contentSource === 'course'} onChange={handleContentSourceChange} value="course" />}
                  label="Course Content"
                />
              </Box>
            </FormControl>
          </Box>
          
          {contentSource === 'youtube' ? (
            // YouTube video selection - full width
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ 
          display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600,
                mb: 2
              }}>
                <YouTubeIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'error.main' }} />
                YouTube Video Selection
              </Typography>
              
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter YouTube URL or video ID"
                value={videoUrl}
                onChange={handleYouTubeUrlChange}
                size="small"
                InputProps={{
                  startAdornment: <YouTubeIcon sx={{ mr: 1, color: 'error.main' }} />,
                  endAdornment: videoId && (
            <IconButton 
                      size="small" 
                      onClick={() => {setVideoUrl(''); setVideoId(''); setVideoTitle('');}}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )
                }}
                sx={{ mb: 1 }}
              />
              
              <FormHelperText>
                Examples: https://www.youtube.com/watch?v=abcd1234 or https://youtu.be/abcd1234 or just abcd1234
              </FormHelperText>
              
              {videoId && (
                <Box sx={{ mt: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
                    <Box
              sx={{ 
                        position: 'relative',
                        width: '100%',
                        height: 0,
                        paddingBottom: '56.25%', // 16:9 aspect ratio
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: 1
              }}
            >
                      <Box
                        component="img"
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="Video Thumbnail"
                sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                      >
                        <PlayArrowIcon sx={{ color: 'white' }} />
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ width: { xs: '100%', sm: '70%' } }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Video Title"
                      placeholder="Enter custom title or use video title"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      Video ID: {videoId}
              </Typography>
            </Box>
          </Box>
              )}
            </Box>
          ) : (
            // Course and video selection - full width
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600,
                mb: 2
              }}>
                <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Course and Video Selection
              </Typography>
              
              {/* Full-width course dropdown */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Course</InputLabel>
                <Select
                  value={selectedCourse ? selectedCourse.CourseID : ''}
                  onChange={handleCourseChange}
                  label="Select Course"
                  disabled={loading}
                  startAdornment={<SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />}
                  endAdornment={loading && <CircularProgress size={20} sx={{ mr: 2 }} />}
                >
                  {loading && courses.length === 0 ? (
                    <MenuItem disabled>Loading courses...</MenuItem>
                  ) : courses.length === 0 ? (
                    <MenuItem disabled>No courses available</MenuItem>
                  ) : (
                    courses.map((course) => (
                      <MenuItem key={course.CourseID} value={course.CourseID}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <Typography>{course.Title}</Typography>
                          <Chip 
                            size="small" 
                            label={course.Difficulty || 'Unknown'} 
                            color={
                              course.Difficulty === 'beginner' ? 'success' : 
                              course.Difficulty === 'intermediate' ? 'warning' : 
                              course.Difficulty === 'advanced' ? 'error' : 'default'
                            }
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              
              {selectedCourse && (
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center'
                    }}>
                      <VideoIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                      Video Selection 
                      <Chip 
                        size="small" 
                        label={`${selectedVideos.length} selected`} 
                        color={selectedVideos.length > 0 ? 'primary' : 'default'}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    
                    {selectedVideos.length > 0 && (
          <Button
                        size="small" 
            variant="outlined"
                        onClick={() => setSelectedVideos([])}
                        startIcon={<DeleteIcon fontSize="small" />}
          >
                        Clear Selection
          </Button>
                    )}
        </Box>

          <Paper
                    variant="outlined" 
            sx={{
                      maxHeight: 300, 
                      overflow: 'auto',
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      width: '100%'
            }}
          >
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, alignItems: 'center' }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          Loading videos...
              </Typography>
            </Box>
                    ) : courseVideos.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <VideoIcon sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No videos found for this course.
                        </Typography>
                      </Box>
                    ) : (
                      <List dense disablePadding>
                        {courseVideos.map((video) => (
                          <ListItem
                            key={video.VideoID}
                            disablePadding
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                onChange={() => handleVideoSelection(video.VideoID)}
                                checked={selectedVideos.includes(video.VideoID)}
                              />
                            }
                            sx={{
                              borderLeft: selectedVideos.includes(video.VideoID) ? '3px solid' : '3px solid transparent',
                              borderLeftColor: 'primary.main',
                              bgcolor: selectedVideos.includes(video.VideoID) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ListItemButton 
                              onClick={() => handleVideoSelection(video.VideoID)}
                              dense
                            >
                              <ListItemIcon>
                                {video.YouTubeVideoID && (
                                  <Box
                                    component="img"
                                    src={`https://img.youtube.com/vi/${video.YouTubeVideoID}/default.jpg`}
                                    alt="Video Thumbnail"
                                    sx={{
                                      width: 60,
                                      height: 45,
                                      borderRadius: 0.5,
                                      mr: 1
                                    }}
                                  />
                                )}
                                {!video.YouTubeVideoID && (
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 27,
                                      borderRadius: 0.5,
                                      mr: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                                    }}
                                  >
                                    <VideoIcon fontSize="small" sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
                                  </Box>
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography 
                                    variant="body2" 
                                    component="div"
                                    fontWeight={selectedVideos.includes(video.VideoID) ? 600 : 400}
                                  >
                                    {video.Title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="div"
                                  >
                                    <Chip 
                                      size="small" 
                                      label={`Order: ${video.OrderInCourse}`} 
                    variant="outlined"
                                      sx={{ 
                                        height: 20, 
                                        '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                                        mr: 1
                                      }}
                                    />
                                    {video.Duration && (
                                      <Typography 
                                        variant="caption" 
                                        color="text.secondary" 
                                        component="span"
                                        sx={{ ml: 1 }}
                                      >
                                        {Math.floor(video.Duration / 60)}:{(video.Duration % 60).toString().padStart(2, '0')}
                                      </Typography>
                                    )}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>
          )}
          
          {/* Quiz ayarları */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                backgroundColor: theme.palette.background.default,
                p: 1,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
              Quiz Settings 
              <ExpandMoreIcon 
                sx={{ 
                  ml: 1, 
                  transform: showSettings ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s'
                }} 
              />
            </Typography>
            
            <Collapse in={showSettings}>
              <Paper elevation={0} sx={{ p: 2, mt: 2, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={3}>
                  {/* Basic Settings Section */}
              <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'primary.main',
                      fontWeight: 600,
                      mb: 2
                    }}>
                      <QuizIcon sx={{ mr: 1, fontSize: 18 }} />
                      Basic Quiz Parameters
                  </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Tooltip title="Choose the difficulty level that matches your target audience's knowledge level" arrow placement="top">
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
                                    <Typography variant="caption" color="text.secondary">
                                      {d.description}
                                    </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                        </Tooltip>
              </Grid>
              
                      <Grid item xs={12} sm={6} md={4}>
                        <Tooltip title="Number of questions to generate for this quiz" arrow placement="top">
                <TextField
                  fullWidth
                  label="Number of Questions"
                  type="number"
                            variant="outlined"
                            size="small"
                  value={settings.numQuestions}
                            onChange={(e) => setSettings(prev => ({ ...prev, numQuestions: parseInt(e.target.value) || 5 }))}
                  InputProps={{
                              inputProps: { min: 3, max: 20 },
                              startAdornment: <QuestionIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
                        </Tooltip>
              </Grid>
              
                      <Grid item xs={12} sm={6} md={4}>
                        <Tooltip title="Minimum score (in percentage) required to pass the quiz" arrow placement="top">
                <TextField
                  fullWidth
                            label="Passing Score (%)"
                  type="number"
                            variant="outlined"
                            size="small"
                            value={settings.passingScore}
                            onChange={(e) => setSettings(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  InputProps={{
                              inputProps: { min: 50, max: 100 },
                              startAdornment: <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'success.light' }} />
                  }}
                />
                        </Tooltip>
                      </Grid>
                    </Grid>
              </Grid>
              
                  {/* Advanced Settings Section */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'primary.main',
                      fontWeight: 600,
                      mb: 2
                    }}>
                      <PsychologyIcon sx={{ mr: 1, fontSize: 18 }} />
                      Advanced Parameters
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Tooltip title="Choose the language for the generated quiz questions and answers" arrow placement="top">
                          <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    label="Language"
                              startAdornment={<LanguageIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                  >
                              {languages.map(l => (
                                <MenuItem key={l.value} value={l.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography sx={{ mr: 1 }}>{l.flag}</Typography>
                                    {l.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                        </Tooltip>
              </Grid>
              
                      <Grid item xs={12} sm={6} md={4}>
                        <Tooltip title="Define the audience the quiz is targeting for appropriate difficulty and language" arrow placement="top">
                          <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={settings.targetAudience}
                    onChange={(e) => setSettings(prev => ({ ...prev, targetAudience: e.target.value }))}
                    label="Target Audience"
                              startAdornment={<PeopleIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                  >
                              {audiences.map(a => (
                                <MenuItem key={a.value} value={a.value}>
                                  {a.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                        </Tooltip>
              </Grid>
              
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Instructional Approach</InputLabel>
                  <Select
                            value={settings.instructionalApproach}
                            onChange={(e) => setSettings(prev => ({ ...prev, instructionalApproach: e.target.value }))}
                    label="Instructional Approach"
                            startAdornment={<SchoolIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                  >
                            {instructionalApproachOptions.map(a => (
                              <MenuItem key={a.value} value={a.value}>
                                {a.label}
                      </MenuItem>
                    ))}
                  </Select>
                          <FormHelperText>Teaching style for this quiz</FormHelperText>
                </FormControl>
              </Grid>
              
                      {/* Model Selection */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                          AI Model
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                          {modelOptions.map(model => (
                            <Box 
                              key={model.value}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: model.value !== modelOptions[modelOptions.length-1].value ? 2 : 0,
                                p: 1.5,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: settings.model === model.value ? 'primary.main' : 'transparent',
                                bgcolor: settings.model === model.value ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: settings.model !== model.value ? alpha(theme.palette.action.hover, 0.08) : null,
                                }
                              }}
                              onClick={() => setSettings(prev => ({ ...prev, model: model.value }))}
                            >
                              <Radio
                                checked={settings.model === model.value}
                                onChange={() => setSettings(prev => ({ ...prev, model: model.value }))}
                                sx={{ p: 0.5, mr: 1 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {model.icon && <Box component="span" sx={{ mr: 1, display: 'flex', color: settings.model === model.value ? 'primary.main' : 'text.secondary' }}>{model.icon}</Box>}
                                  <Typography variant="subtitle2" fontWeight={settings.model === model.value ? 700 : 500}>
                                    {model.label}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {model.description}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Paper>
              </Grid>
              </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Collapse>
          </Box>
              
          {/* Butonlar - Only Add to Queue button here */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
              onClick={addToQueue}
              disabled={
                contentSource === 'youtube' ? (!videoId || !videoUrl) : 
                (!selectedCourse || selectedVideos.length === 0)
              }
                    sx={{ 
                px: 3,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                      }
                    }}
                  >
                    Add to Queue
                  </Button>
                </Box>
          </Paper>
        )}

        {/* Manual Quiz Creation Tab */}
        {activeTab === 1 && (
          <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              <EditIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Manual Quiz Creation
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a quiz manually by adding questions one by one.
            </Typography>

            {/* Progress Indicator */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Progress: Step {manualQuiz.title && manualQuiz.description ? (manualQuiz.questions.length > 0 ? '3' : '2') : '1'} of 3
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={
                  manualQuiz.title && manualQuiz.description 
                    ? (manualQuiz.questions.length > 0 ? 100 : 66)
                    : 33
                } 
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color={manualQuiz.title && manualQuiz.description ? 'success.main' : 'text.secondary'}>
                  Basic Info
                </Typography>
                <Typography variant="caption" color={manualQuiz.questions.length > 0 ? 'success.main' : 'text.secondary'}>
                  Add Questions
                </Typography>
                <Typography variant="caption" color={manualQuiz.questions.length > 0 && manualQuiz.title && manualQuiz.description ? 'success.main' : 'text.secondary'}>
                  Create Quiz
                </Typography>
              </Box>
            </Box>

            {/* Quiz Basic Information */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  placeholder="Enter quiz title..."
                  value={manualQuiz.title}
                  onChange={(e) => handleManualQuizChange('title', e.target.value)}
                  required
                  helperText="Required: Give your quiz a descriptive title"
                  error={!manualQuiz.title.trim() && manualQuiz.title !== ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={manualQuiz.difficulty}
                    onChange={(e) => handleManualQuizChange('difficulty', e.target.value)}
                    label="Difficulty"
                  >
                    {difficulties.map(d => (
                      <MenuItem key={d.value} value={d.value}>
                        <Chip size="small" label={d.label} color={d.color} sx={{ mr: 1 }} />
                        {d.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quiz Description"
                  placeholder="Describe what this quiz covers..."
                  value={manualQuiz.description}
                  onChange={(e) => handleManualQuizChange('description', e.target.value)}
                  multiline
                  rows={3}
                  required
                  helperText="Required: Provide a brief description of the quiz content"
                  error={!manualQuiz.description.trim() && manualQuiz.description !== ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Course (Optional)</InputLabel>
                  <Select
                    value={manualQuiz.courseId}
                    onChange={(e) => handleManualQuizChange('courseId', e.target.value)}
                    label="Course (Optional)"
                  >
                    <MenuItem value="">No Course</MenuItem>
                    {courses.map((course) => (
                      <MenuItem key={course.CourseID} value={course.CourseID}>
                        {course.Title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Passing Score (%)"
                  type="number"
                  value={manualQuiz.passingScore}
                  onChange={(e) => handleManualQuizChange('passingScore', parseInt(e.target.value) || 70)}
                  InputProps={{ inputProps: { min: 50, max: 100 } }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Question Creation Section */}
            <Typography variant="h6" gutterBottom>
              <QuestionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Add Questions
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question Text"
                  placeholder="Enter your question here..."
                  value={currentQuestion.questionText}
                  onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                  multiline
                  rows={2}
                  required
                  helperText="This field is required. Enter the question you want to ask."
                  error={!currentQuestion.questionText.trim() && currentQuestion.questionText !== ''}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={currentQuestion.questionType}
                    onChange={(e) => handleQuestionChange('questionType', e.target.value)}
                    label="Question Type"
                  >
                    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    <MenuItem value="true_false">True/False</MenuItem>
                    <MenuItem value="short_answer">Short Answer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Multiple Choice Options */}
            {currentQuestion.questionType === 'multiple_choice' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Answer Options:</Typography>
                {currentQuestion.options.map((option, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Checkbox
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                      color="success"
                    />
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                ))}
                <Typography variant="caption" color="text.secondary">
                  Check the box next to correct answers. At least one option must be marked as correct.
                </Typography>
              </Box>
            )}

            {/* True/False Options */}
            {currentQuestion.questionType === 'true_false' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Correct Answer:</Typography>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Radio
                          checked={currentQuestion.correctAnswer === true}
                          onChange={() => handleQuestionChange('correctAnswer', true)}
                        />
                      }
                      label="True"
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={currentQuestion.correctAnswer === false}
                          onChange={() => handleQuestionChange('correctAnswer', false)}
                        />
                      }
                      label="False"
                    />
                  </Box>
                </FormControl>
              </Box>
            )}

            {/* Explanation */}
            <TextField
              fullWidth
              label="Explanation (Optional)"
              value={currentQuestion.explanation}
              onChange={(e) => handleQuestionChange('explanation', e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addQuestionToQuiz}
              disabled={!currentQuestion.questionText.trim()}
              sx={{ mb: 4 }}
            >
              Add Question to Quiz
            </Button>

            {/* Questions List */}
            {manualQuiz.questions.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Quiz Questions ({manualQuiz.questions.length})
                </Typography>
                
                {manualQuiz.questions.map((question, index) => (
                  <Card key={question.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {index + 1}. {question.questionText}
                          </Typography>
                          
                          <Chip 
                            size="small" 
                            label={question.questionType.replace('_', ' ')} 
                            sx={{ mb: 1 }}
                          />
                          
                          {question.questionType === 'multiple_choice' && (
                            <Box sx={{ ml: 2 }}>
                              {question.options.map((option, optIndex) => (
                                <Typography 
                                  key={optIndex} 
                                  variant="body2" 
                                  sx={{ 
                                    color: option.isCorrect ? 'success.main' : 'text.secondary',
                                    fontWeight: option.isCorrect ? 600 : 400
                                  }}
                                >
                                  {option.isCorrect ? '✓' : '○'} {option.text}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          
                          {question.explanation && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                              Explanation: {question.explanation}
                            </Typography>
                          )}
                        </Box>
                        
                        <IconButton 
                          color="error" 
                          onClick={() => removeQuestionFromQuiz(question.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setManualQuiz({
                    title: '',
                    description: '',
                    courseId: '',
                    videoId: '',
                    difficulty: 'intermediate',
                    passingScore: 70,
                    language: 'en',
                    questions: []
                  });
                  setCurrentQuestion({
                    questionText: '',
                    questionType: 'multiple_choice',
                    options: [
                      { text: '', isCorrect: false },
                      { text: '', isCorrect: false },
                      { text: '', isCorrect: false },
                      { text: '', isCorrect: false }
                    ],
                    explanation: ''
                  });
                }}
              >
                Reset Form
              </Button>
              
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={submitManualQuiz}
                disabled={loading || manualQuiz.questions.length === 0 || !manualQuiz.title.trim() || !manualQuiz.description.trim()}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388E3C 30%, #689F38 90%)',
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Quiz'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Queue section with enhanced design */}
          <Paper
            elevation={0}
            sx={{
            p: { xs: 0, md: 0 },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            bgcolor: 'background.paper',
            mt: 4,
            overflow: 'hidden'
            }}
          >
          {/* Queue header with controls - added back the Clear All button */}
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
                    Quiz Queue
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {quizQueue.length} total quizzes ({quizQueue.filter(q => q.status === 'waiting').length} waiting)
                  </Typography>
                </Box>
              </Box>
              
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: { xs: 2, sm: 0 } }}>
              {/* Process Queue button moved here */}
                <Button
                  variant="outlined"
                size="medium"
                startIcon={<PlayArrowIcon />}
                  onClick={processQueue}
                  disabled={processingQueue || quizQueue.filter(q => q.status === 'waiting').length === 0}
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
              
              {/* Added back the Clear All button */}
              {quizQueue.length > 0 && (
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
              
              {/* Filter/sort controls - responsive, consistent layout */}
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
            
          {/* Queue stats with improved layout */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '1fr 1fr 1fr',
              md: '1fr 1fr 1fr 1fr 1fr 1fr',
            },
            gap: 1,
            mb: 0,
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <StatCard key="waiting" value={quizQueue.filter(q => q.status === 'waiting').length} label="Waiting" color="#1976d2" gradient="linear-gradient(90deg, #1976d2 0%, #21cbf3 100%)" />
            <StatCard key="analyzing" value={quizQueue.filter(q => q.status === 'analyzing').length} label="Analyzing" color="#ab47bc" gradient="linear-gradient(90deg, #8e24aa 0%, #ce93d8 100%)" />
            <StatCard key="processing" value={quizQueue.filter(q => q.status === 'processing').length} label="Processing" color="#ff9800" gradient="linear-gradient(90deg, #ff9800 0%, #ffe082 100%)" />
            <StatCard key="completed" value={quizQueue.filter(q => q.status === 'completed').length} label="Completed" color="#43a047" gradient="linear-gradient(90deg, #43a047 0%, #38f9d7 100%)" />
            <StatCard key="failed" value={quizQueue.filter(q => q.status === 'failed').length} label="Failed" color="#e53935" gradient="linear-gradient(90deg, #e53935 0%, #ffb199 100%)" />
            <StatCard key="total" value={quizQueue.length} label="Total" color="#607d8b" gradient="linear-gradient(90deg, #607d8b 0%, #bdbdbd 100%)" />
            </Box>
            
          {/* Queue list with empty state - fixed hydration error by ensuring proper component hierarchy */}
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
                  No quizzes in queue
                </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                Add quizzes using the configuration above to start generating AI-powered quiz content
                </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  // Scroll to the top where the form is
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Add Quiz
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
                {getFilteredQueue().map((quiz, index) => (
                  <QuizCard 
                    key={quiz.id}
                    quiz={quiz} 
                    onDelete={(id) => setQuizQueue(prev => prev.filter(q => q.id !== id))}
                    difficulties={difficulties}
                    languages={languages}
                    router={router}
                    onPreview={handlePreviewQuiz}
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
                  Processing Queue: {currentQueueIndex + 1} of {quizQueue.filter(q => q.status === 'waiting').length}
                </Typography>
              </Box>
                <LinearProgress
                  variant="determinate"
                  value={(currentQueueIndex + 1) / quizQueue.filter(q => q.status === 'waiting').length * 100}
                sx={{ borderRadius: 1, height: 6 }}
                />
              </Box>
            )}
          </Paper>

        {/* Add the preview modal */}
        <QuizPreviewModal
          open={previewQuiz !== null}
          onClose={handleClosePreview}
          quiz={previewQuiz}
          quizData={quizPreviewData}
        />

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
      
      {/* Queue processing notification */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={processingQueue}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1.5, color: 'white' }} />
            <Typography variant="body2">Processing quiz queue...</Typography>
          </Box>
        }
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
          setConfirmDialogOpen(false);
        }}
        onCancel={() => setConfirmDialogOpen(false)}
      />
    </MainLayout>
  );
}

// Confirmation dialog component
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};