'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  IconButton, 
  Divider, 
  CircularProgress, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  LinearProgress, 
  alpha, 
  useTheme,
  Chip,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Stack,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  AlertTitle
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import QuizIcon from '@mui/icons-material/Quiz';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import NoteIcon from '@mui/icons-material/Note';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CommentIcon from '@mui/icons-material/Comment';

import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';

// Animated background
const AnimatedBackground = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
        opacity: 0.5,
      }}
    >
      {/* Gradient dots */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 100 + Math.random() * 200,
            height: 100 + Math.random() * 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float${i} ${20 + Math.random() * 10}s infinite linear`,
            '@keyframes float0': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(50px, -30px) scale(1.1)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float1': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-50px, 50px) scale(0.9)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float2': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(70px, 40px) scale(1.05)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float3': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-30px, -60px) scale(0.95)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float4': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(60px, 20px) scale(1.1)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float5': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-20px, 60px) scale(0.9)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            }
          }}
        />
      ))}
    </Box>
  );
};

// VideoPlayer component - handles the YouTube embed with custom behavior
const VideoPlayer = ({ video, onVideoProgress, userView }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastReportedProgressRef = useRef(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // Calculate the start position, ensuring it's a valid integer value
  const getStartPosition = () => {
    if (!userView) return 0;
    
    let startPosition = 0;
    if (typeof userView.lastPosition === 'number' && !isNaN(userView.lastPosition) && userView.lastPosition > 0) {
      startPosition = Math.floor(userView.lastPosition);
      console.log(`Using lastPosition for video resume: ${startPosition} seconds`);
    } else if (userView.watchedPercentage && userView.watchedPercentage > 0 && video.Duration) {
      startPosition = Math.floor((userView.watchedPercentage / 100) * video.Duration);
      console.log(`Calculated position from percentage (${userView.watchedPercentage}%): ${startPosition} seconds`);
    }
    
    // Don't start from very end of video
    if (video.Duration && startPosition > (video.Duration - 10)) {
      startPosition = Math.max(0, video.Duration - 30);
    }
    
    return startPosition;
  };
  
  // Set up YouTube API and message listener to receive player events
  useEffect(() => {
    if (!video?.YouTubeVideoID) return;
    
    // Set up YouTube API message listener only once
    const handleYouTubeMessage = (event) => {
      try {
        // Only process messages from YouTube
        if (event.origin !== 'https://www.youtube.com') return;
        
        // Try to parse the data
        const data = JSON.parse(event.data);
        
        // Only handle our specific player events
        if (data.event === 'onStateChange' && data.info === 0) { // Video ended
          // Report 100% completion
          if (onVideoProgress && typeof onVideoProgress === 'function') {
            onVideoProgress(100, true, video.Duration || 0, 0);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    };
    
    // Add message listener when component mounts
    window.addEventListener('message', handleYouTubeMessage);
    
    // Set up simple progress tracking interval
    if (video.Duration && onVideoProgress && !progressIntervalRef.current) {
      let currentTime = getStartPosition();
      const duration = video.Duration;
      const startTime = Date.now();
      
      progressIntervalRef.current = setInterval(() => {
        // Simple time estimation (this is less accurate than using YouTube API events)
        currentTime += 1; // Add 1 second every second
        if (currentTime > duration) currentTime = duration;
        
        const percentage = Math.min(Math.round((currentTime / duration) * 100), 100);
        const isCompleted = percentage >= 95;
        const viewDuration = Date.now() - startTime;
        
        // Only report if percentage has changed by at least 1%
        if (Math.abs(percentage - lastReportedProgressRef.current) >= 1) {
          lastReportedProgressRef.current = percentage;
          onVideoProgress(percentage, isCompleted, currentTime, viewDuration);
        }
      }, 1000);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [video?.YouTubeVideoID, video?.Duration]);
  
  // Get the complete YouTube URL with all parameters
  const getYouTubeUrl = () => {
    const startTime = getStartPosition();
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      start: startTime.toString(),
      enablejsapi: '1',
      origin: typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '',
      showinfo: '0',
      fs: '1',
      controls: '1',
      disablekb: '0',
      iv_load_policy: '3'
    });
    
    return `https://www.youtube.com/embed/${video.YouTubeVideoID}?${params.toString()}`;
  };
  
  return (
    <Box sx={{ 
        position: 'relative', 
        width: '100%', 
      height: 0,
      pt: '56.25%', 
      bgcolor: 'black', 
      borderRadius: { xs: 0, sm: 1 }, 
        overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      maxHeight: '80vh',
    }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 2 }}>
          <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
        </Box>
      )}
      
      <iframe 
        ref={iframeRef}
        src={getYouTubeUrl()}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoading(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      />
    </Box>
  );
};

// Video list item component
const VideoListItem = ({ video, index, currentVideo, isCompleted, onVideoClick }) => {
  const theme = useTheme();
  const isActive = currentVideo && video.VideoID === currentVideo.VideoID;
  const [hovered, setHovered] = useState(false);
  
  return (
    <Paper
      elevation={hovered || isActive ? 3 : 1}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateX(5px)' : 'none',
        background: isActive 
          ? `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
          : theme.palette.background.paper,
        borderLeft: isActive 
          ? `4px solid ${theme.palette.secondary.main}`
          : 'none',
        pl: isActive ? 1.5 : 2,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onVideoClick(video.VideoID)}
    >
      <Box 
        sx={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: isCompleted 
            ? alpha(theme.palette.success.main, 0.1)
            : isActive 
              ? alpha(theme.palette.secondary.main, 0.1)
              : alpha(theme.palette.grey[500], 0.1),
          color: isCompleted 
            ? theme.palette.success.main
            : isActive 
              ? theme.palette.secondary.main
              : theme.palette.text.secondary,
          mr: 2
        }}
      >
        {isCompleted ? (
          <CheckCircleIcon fontSize="small" color="success" />
        ) : isActive ? (
          <PlayArrowIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />
        ) : (
          <Typography variant="body2" fontWeight="medium">
            {index + 1}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ flexGrow: 1 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: isActive ? 600 : 500,
            color: isActive ? theme.palette.primary.main : 'text.primary'
          }}
        >
          {video.Title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: '0.75rem', mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {Math.floor(video.Duration / 60)}:{String(video.Duration % 60).padStart(2, '0')}
          </Typography>
        </Box>
      </Box>
      
      {(hovered || isActive) && !isCompleted && (
        <IconButton 
          size="small" 
          sx={{ 
            color: theme.palette.secondary.main,
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            '&:hover': {
              bgcolor: alpha(theme.palette.secondary.main, 0.15),
            }
          }}
        >
          <PlayArrowIcon fontSize="small" />
        </IconButton>
      )}
      
      {isCompleted && (
        <Tooltip title="Completed">
          <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 1 }} />
        </Tooltip>
      )}
    </Paper>
  );
};

// Quiz card component
const QuizCard = ({ quiz, onTakeQuiz }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  
  return (
    <Paper
      elevation={hovered ? 3 : 1}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-5px)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${theme.palette.secondary.main}`,
        '&:hover': {
          boxShadow: theme.shadows[5]
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: `radial-gradient(circle at top right, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 70%)`,
          zIndex: 0
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar 
          sx={{ 
            bgcolor: alpha(theme.palette.secondary.main, 0.1), 
            color: theme.palette.secondary.main,
            mr: 2
          }}
        >
          <QuizIcon />
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            {quiz.Title}
          </Typography>
          
          {quiz.Description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {quiz.Description}
            </Typography>
          )}
          
          <Button
            variant="contained"
            onClick={() => onTakeQuiz(quiz.QuizID)}
            startIcon={<PlayArrowIcon />}
            sx={{
              borderRadius: 2,
              mt: 1,
              position: 'relative',
              zIndex: 1,
              background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`
              },
              transition: 'all 0.3s ease'
            }}
          >
            Start Quiz
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// Resource item component
const ResourceItem = ({ resource }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  
  return (
    <Paper 
      elevation={hovered ? 2 : 1}
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2, 
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        '&:hover': {
          boxShadow: theme.shadows[3],
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar
        variant="rounded"
        sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.1), 
          color: theme.palette.primary.main,
          mr: 2,
          width: 48,
          height: 48,
          borderRadius: 2
        }}
      >
        {resource.type === 'PDF' ? 
          <InsertDriveFileIcon /> : 
          <DescriptionIcon />
        }
      </Avatar>
      
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {resource.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {resource.type} • {resource.size}
        </Typography>
      </Box>
      
      <Button 
        startIcon={<DownloadIcon />} 
        variant="outlined" 
        color="primary"
        sx={{ 
          borderRadius: 2,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderColor: theme.palette.primary.main
          }
        }}
      >
        Download
      </Button>
    </Paper>
  );
};

// VideoQuiz component
const VideoQuiz = ({ quiz, canAccess }) => {
  const theme = useTheme();
  const router = useRouter();
  
  const handleTakeQuiz = () => {
    if (!canAccess) return;
    router.push(`/quizzes/${quiz.QuizID}`);
  };
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: canAccess ? 'primary.main' : 'divider',
        borderRadius: 2,
        opacity: canAccess ? 1 : 0.7,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': canAccess ? {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        } : {}
      }}
    >
      {!canAccess && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            zIndex: 2,
            backdropFilter: 'blur(3px)'
          }}
        >
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <LockIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Watch the video to unlock this quiz
            </Typography>
          </Box>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            {quiz.Title || 'Video Quiz'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {quiz.Description || 'Test your knowledge from this video'}
          </Typography>
        </Box>
        
        <Chip
          label={`${quiz.QuestionCount || quiz.questions?.length || 0} questions`}
          color="primary"
          variant="outlined"
          size="small"
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Box>
          <Chip
            label={`Passing: ${quiz.PassingScore || 70}%`}
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          
          {quiz.CompletionStatus && (
            <Chip
              label={quiz.Score ? `Score: ${quiz.Score}%` : 'Completed'}
              color={quiz.Passed ? 'success' : 'error'}
              size="small"
            />
          )}
        </Box>
        
        <Button
          variant="contained"
          disabled={!canAccess}
          onClick={handleTakeQuiz}
          startIcon={<QuizIcon />}
          size="small"
        >
          {quiz.CompletionStatus ? 'Retake Quiz' : 'Take Quiz'}
        </Button>
      </Box>
    </Paper>
  );
};

// Main Video Page Component
export default function VideoPage({ params }) {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for better performance
  const videoRef = useRef(null);
  const progressTrackingRef = useRef(null);
  const userCourseProgressRef = useRef(null);
  const timerRef = useRef(null);
  
  // Video and course data
  const [video, setVideo] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [userVideoView, setUserVideoView] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [userCourseProgress, setUserCourseProgress] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState(0);
  const [quizzes, setQuizzes] = useState([]);
  const [resources, setResources] = useState([]);
  const [videoQuizzes, setVideoQuizzes] = useState([]);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  
  // UI states
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [playerState, setPlayerState] = useState({
    playing: false,
    currentTime: 0,
    duration: 0,
    lastTrackedTime: 0
  });
  
  // Parse the course and video IDs from params
  const courseId = params?.courseId;
  const videoId = params?.videoId;
  
  // Function to safely access localStorage
  const safelyGetLocalStorage = (key) => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
    return null;
  };

  // Helper function to get the authorization token
  const getToken = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.warn('User is not authenticated');
        return null;
      }
      
      // Try to get the token from localStorage
      let token = safelyGetLocalStorage('access_token');
      
      if (!token) {
        console.warn('No access token found');
        return null;
      }
      
      // Check if token is expired
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiryTime = payload.exp * 1000; // Convert to milliseconds
          
          // If token is expired or about to expire in the next minute, refresh it
          if (Date.now() > expiryTime - 60000) {
            console.log('Token appears to be expired or about to expire, refreshing...');
            const refreshed = await refreshToken();
            if (refreshed) {
              token = safelyGetLocalStorage('access_token');
            }
          }
        }
      } catch (tokenError) {
        console.warn('Error checking token expiration:', tokenError);
      }
      
      return token ? `Bearer ${token}` : null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    
    // Save the selected tab in session storage for persistence
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('videoTabValue', newValue);
    }
  };

  // Calculate course progress based on video IDs
  const calculateProgress = useCallback((videos, currentVideoId, currentIsCompleted = false) => {
    if (!videos || !Array.isArray(videos) || videos.length === 0) return 0;
    
    let completedCount = 0;
    const totalCount = videos.length;
    
    // Count completed videos
    for (const video of videos) {
      if (
        video.VideoID < currentVideoId || 
        (video.VideoID === parseInt(currentVideoId) && (userVideoView?.isCompleted || currentIsCompleted))
      ) {
        completedCount++;
      }
    }
    
    const percentage = Math.round((completedCount / totalCount) * 100);
    console.log(`Calculated progress: ${completedCount}/${totalCount} = ${percentage}%`);
    return percentage;
  }, [userVideoView]);

  // Fetch course progress
  const fetchCourseProgress = useCallback(async () => {
    if (!courseId || !user) return;
    
    try {
      // Get token
      let token = await getToken();
      
      // Cache busting timestamp
      const timestamp = Date.now();
      
      // Fetch updated progress
      const progressResponse = await fetch(`/api/courses/${courseId}/progress/?t=${timestamp}`, {
        headers: {
          'Authorization': token,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        if (typeof progressData.percentage === 'number') {
          console.log('Updated course progress:', progressData.percentage);
          setCourseProgress(progressData.percentage);
        } else {
          // Fallback calculation if API doesn't provide percentage
          const calculatedProgress = calculateProgress(courseVideos, parseInt(videoId));
          setCourseProgress(calculatedProgress);
        }
      } else {
        // If API returns error, stop future automatic polling
        if (progressTrackingRef.current) {
          console.log(`Progress API returned ${progressResponse.status}, disabling polling`);
          clearInterval(progressTrackingRef.current);
          progressTrackingRef.current = null;
        }
        
        // Fallback calculation
        const calculatedProgress = calculateProgress(courseVideos, parseInt(videoId));
        setCourseProgress(calculatedProgress);
      }
    } catch (progressError) {
      console.warn('Error fetching course progress:', progressError);
    }
  }, [courseId, videoId, courseVideos, user, calculateProgress]);

  // Set up progress refresh interval - disabled by default
  useEffect(() => {
    // Clear any existing interval
    if (progressTrackingRef.current) {
      clearInterval(progressTrackingRef.current);
      progressTrackingRef.current = null;
    }
    
    // Don't create a new interval - API endpoints were returning 404s
    console.log('Progress API polling disabled to avoid 404 errors');
    
    return () => {
      if (progressTrackingRef.current) {
        clearInterval(progressTrackingRef.current);
        progressTrackingRef.current = null;
      }
    };
  }, [fetchCourseProgress]);

  // Update progress when user completes a video
  useEffect(() => {
    if (userVideoView?.isCompleted) {
      // Just update progress locally based on calculated value
      const calculatedProgress = calculateProgress(courseVideos, parseInt(videoId));
      setCourseProgress(calculatedProgress);
      console.log('Updated progress after completion:', calculatedProgress);
    }
  }, [userVideoView, calculateProgress, courseVideos, videoId]);

  // Get course completion percentage
  const getCourseCompletionPercentage = () => {
    return courseProgress;
  };

  // Fetch initial data and set up course
  useEffect(() => {
    // Check if we have a saved course state with next video position
    if (typeof window !== 'undefined') {
      const savedCourseState = safelyGetLocalStorage(`course_${courseId}_state`);
      
      if (savedCourseState) {
        try {
          const parsedState = JSON.parse(savedCourseState);
          
          // If user was watching a different video in this course,
          // show a notification or option to continue
          if (parsedState.lastVideoId && 
              parsedState.lastVideoId !== videoId && 
              parsedState.timestamp && 
              (Date.now() - parsedState.timestamp < 7 * 24 * 60 * 60 * 1000)) { // Within 7 days
            
            console.log(`User has previous progress in video ${parsedState.lastVideoId} of this course`);
            // We could show a UI notification here to jump to that video
          }
        } catch (e) {
          console.error('Error parsing saved course state:', e);
        }
      }
    }
    
    // Only run this effect on the client side
    if (typeof window === 'undefined') return;
    
    let isActive = true;
    
    const fetchData = async () => {
      if (courseId && videoId) {
        await fetchVideoDetails();
      }
    };
    
    fetchData();
    
    // Save current video position for course continuation
    const saveVideoState = () => {
      if (courseId && videoId && typeof window !== 'undefined') {
        const stateToSave = {
          lastVideoId: videoId,
          timestamp: Date.now(),
          position: playerState.currentTime || 0
        };
        
        localStorage.setItem(
          `course_${courseId}_state`, 
          JSON.stringify(stateToSave)
        );
      }
    };
    
    // Save state when user leaves the page
    window.addEventListener('beforeunload', saveVideoState);
    
    // Cleanup
    return () => {
      isActive = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (progressTrackingRef.current) {
        clearInterval(progressTrackingRef.current);
      }
      
      // Save state on component unmount
      saveVideoState();
      
      // Remove event listener
      window.removeEventListener('beforeunload', saveVideoState);
    };
  }, [courseId, videoId]);

  // Fetch video details with proper null checking
  const fetchVideoDetails = async () => {
    let isActive = true;
    setLoading(true);
    setError(null);
    
    try {
      // Get token - use the previously defined userAccessToken
      let token = await getToken();
      
      if (!token) {
        console.warn('No authentication token available');
        setError('Authentication error. Please log in to access this content.');
        setLoading(false);
        return;
      }
      
      // Cache busting timestamp
      const timestamp = Date.now();
      
      // Fetch video data
        const videoResponse = await fetch(`/api/courses/videos/${videoId}/?t=${timestamp}`, {
          headers: {
            'Authorization': token,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (!videoResponse.ok) {
          if (videoResponse.status === 401 || videoResponse.status === 403) {
          setError('Authentication error. Please log in again to access this content.');
            return;
          }
          
        throw new Error(`Failed to load video (${videoResponse.status})`);
        }
        
        const videoData = await videoResponse.json();
        
      // Fetch course data
      console.log(`Fetching course details for courseId: ${courseId}, cache buster: ${timestamp}`);
        const courseResponse = await fetch(`/api/courses/${courseId}/?t=${timestamp}`, {
          headers: {
            'Authorization': token,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (!courseResponse.ok) {
          if (courseResponse.status === 401 || courseResponse.status === 403) {
          setError('Authentication error. Please log in again to access this content.');
            return;
          }
          
        throw new Error(`Failed to load course (${courseResponse.status})`);
        }
        
        const courseData = await courseResponse.json();
      console.log('Raw course data received from backend:', courseData);
      
      // Extract enrolled students count - check multiple possible field names
      const enrolled = parseInt(courseData.EnrolledUsers) || 
                     parseInt(courseData.EnrolledStudents) || 
                     parseInt(courseData.Enrollments) || 
                     parseInt(courseData.StudentCount) || 
                     parseInt(courseData.enrolled_count) || 
                     parseInt(courseData.student_count) || 
                     0;
      
      console.log('Processed enrollment count:', enrolled);
      setEnrolledStudents(enrolled);
      
      // Try to fetch course resources if available
      try {
        const resourcesResponse = await fetch(`/api/courses/${courseId}/resources/?t=${timestamp}`, {
          headers: {
            'Authorization': token,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (resourcesResponse.ok) {
          const resourcesData = await resourcesResponse.json();
          if (Array.isArray(resourcesData)) {
            setResources(resourcesData);
          }
        } else {
          console.log(`Resources API returned ${resourcesResponse.status}. Using empty array fallback.`);
          setResources([]);
        }
      } catch (resourcesError) {
        console.warn('Error fetching course resources:', resourcesError);
        setResources([]);
      }
      
      // Calculate initial progress from the videos list
      const initialProgress = calculateProgress(courseData.videos || [], videoData.VideoID, videoData.userView?.isCompleted);
      setCourseProgress(initialProgress);
      console.log('Initial calculated progress:', initialProgress);
      
      // Initialize userCourseProgress state with data from API or calculated value
      if (courseData.userProgress) {
        setUserCourseProgress({
          completionPercentage: courseData.userProgress.completionPercentage || initialProgress,
          isCompleted: courseData.userProgress.isCompleted || false,
          lastVideoId: courseData.userProgress.lastVideoID,
          lastAccessDate: courseData.userProgress.lastAccessDate
        });
        userCourseProgressRef.current = {
          completionPercentage: courseData.userProgress.completionPercentage || initialProgress,
          isCompleted: courseData.userProgress.isCompleted || false,
          lastVideoId: courseData.userProgress.lastVideoID,
          lastAccessDate: courseData.userProgress.lastAccessDate
        };
      } else {
        setUserCourseProgress({
          completionPercentage: initialProgress,
          isCompleted: initialProgress >= 100,
          lastVideoId: videoData.VideoID,
          lastAccessDate: new Date().toISOString()
        });
      }
        
        if (!isActive) return;
        
      // Update state with fetched data
        setVideo(videoData);
        setCourseData(courseData);
        setCourseVideos(Array.isArray(courseData.videos) ? courseData.videos : []);
        setQuizzes(Array.isArray(videoData.quizzes) ? videoData.quizzes : []);
        
      // Initialize player state with user progress if available
        if (videoData.userView) {
          setUserVideoView(videoData.userView);
          setPlayerState(prev => ({
            ...prev,
            currentTime: videoData.userView.watchedPercentage * (videoData.Duration || 0) / 100,
            duration: videoData.Duration || 0
          }));
        } else {
          setPlayerState(prev => ({
            ...prev,
            currentTime: 0,
            duration: videoData.Duration || 0
          }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching video details:', err);
        if (isActive) {
        setError(err.message || 'Failed to load video content');
          setLoading(false);
        }
      }
    };
    
  // İlerleme takibini kaydetme fonksiyonu
  const trackProgress = async (videoId, watchedPercentage, isCompleted, lastPosition, viewDuration) => {
    // Generate a unique tracking ID for this request for better debugging
    const trackingId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      if (!videoId || watchedPercentage === undefined) {
        console.warn(`[Track:${trackingId}] Track progress için geçersiz parametreler:`, { videoId, watchedPercentage });
        return;
      }
      
      console.log(`[Track:${trackingId}] Starting progress tracking for video ${videoId}`);
      
      // Ensure we have valid data types for all parameters
      const validatedParams = {
        watchedPercentage: parseInt(watchedPercentage) || 0,
        isCompleted: Boolean(isCompleted),
        lastPosition: parseFloat(lastPosition) || 0,
        viewDuration: parseInt(viewDuration) || 0
      };
      
      // Validate parameters are within reasonable ranges
      if (validatedParams.watchedPercentage < 0 || validatedParams.watchedPercentage > 100) {
        console.warn(`[Track:${trackingId}] Invalid watchedPercentage value:`, validatedParams.watchedPercentage);
        validatedParams.watchedPercentage = Math.max(0, Math.min(100, validatedParams.watchedPercentage));
      }
      
      if (validatedParams.lastPosition < 0) {
        console.warn(`[Track:${trackingId}] Invalid lastPosition value:`, validatedParams.lastPosition);
        validatedParams.lastPosition = 0;
      }
      
      // Önceki state'e göre değişiklik kontrolü
      if (progressTrackingRef.current && 
          progressTrackingRef.current.videoId === videoId &&
          progressTrackingRef.current.percentage === validatedParams.watchedPercentage &&
          progressTrackingRef.current.lastPosition === validatedParams.lastPosition) {
        // Aynı veri, tekrar göndermeye gerek yok
        console.log(`[Track:${trackingId}] Skipping duplicate progress data`);
        return;
      }
      
      // İlerleme verilerini güncelle
      progressTrackingRef.current = {
        videoId,
        percentage: validatedParams.watchedPercentage,
        completed: validatedParams.isCompleted,
        lastPosition: validatedParams.lastPosition,
        timestamp: new Date()
      };
      
      // Mevcut kullanıcı token'ı
      console.log(`[Track:${trackingId}] Getting authentication token`);
      const token = await getToken();
      if (!token) {
        console.error(`[Track:${trackingId}] Authentication token not available`);
        setError('Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
        return;
      }
      
      // API isteği yapılandırması
      const progressData = {
        watchedPercentage: validatedParams.watchedPercentage,
        isCompleted: validatedParams.isCompleted,
        lastPosition: validatedParams.lastPosition, // Position in seconds for resume functionality
        viewDuration: validatedParams.viewDuration, // Duration of this viewing session in ms
        timestamp: new Date().toISOString(), // Current timestamp
        trackingId // Include tracking ID in the request
      };
      
      console.log(`[Track:${trackingId}] Video ilerleme verisi gönderiliyor: Video #${videoId}, İlerleme ${validatedParams.watchedPercentage}%, Tamamlandı: ${validatedParams.isCompleted}, Position: ${validatedParams.lastPosition.toFixed(2)}s`);
      
      // API endpoint URL with cache busting
      const apiUrl = `/api/courses/videos/${videoId}/track?_=${Date.now()}`;
      console.log(`[Track:${trackingId}] Calling API endpoint: ${apiUrl}`);
      
      // API isteğini yap
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'X-Tracking-ID': trackingId,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(progressData),
        cache: 'no-store' // Ensure we don't cache this request
      });
      
      // Get the response text first to better handle errors
      const responseText = await response.text();
      console.log(`[Track:${trackingId}] API response status: ${response.status}`);
      console.log(`[Track:${trackingId}] API response body: ${responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText}`);
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[Track:${trackingId}] Error parsing response:`, parseError);
        console.error(`[Track:${trackingId}] Raw response:`, responseText);
        throw new Error(`Parse error: ${parseError.message}`);
      }
      
      if (!response.ok) {
        console.error(`[Track:${trackingId}] İlerleme takip hatası:`, data.error || response.statusText);
        
        // If we have a 401 error, attempt to refresh the token
        if (response.status === 401) {
          console.log(`[Track:${trackingId}] Token expired, attempting to refresh...`);
          const refreshed = await refreshToken();
          console.log(`[Track:${trackingId}] Token refresh result:`, refreshed);
        }
        
        throw new Error(`API error ${response.status}: ${data.error || response.statusText}`);
      }
      
      console.log(`[Track:${trackingId}] İlerleme başarıyla kaydedildi:`, data);
      
      // Update course progress if received in response
      if (data.courseCompletionPercentage !== undefined) {
        console.log(`[Track:${trackingId}] Updating course completion percentage:`, data.courseCompletionPercentage);
        setCourseProgress(data.courseCompletionPercentage);
        
        // Update userCourseProgress state
        setUserCourseProgress(prev => ({
          ...prev,
          completionPercentage: data.courseCompletionPercentage,
          isCompleted: data.courseCompleted || false,
          lastVideoId: videoId,
          lastAccessDate: new Date().toISOString()
        }));
      }
      
      // İlerlemeyi kullanıcı kurs ilerleme state'ine yansıt
      if (userCourseProgressRef.current) {
        const updatedProgress = {
          ...userCourseProgressRef.current,
          lastVideoId: videoId,
          completionPercentage: data.courseCompletionPercentage || userCourseProgressRef.current.completionPercentage,
          lastAccessDate: new Date().toISOString()
        };
        
        // Update ref for consistency
        userCourseProgressRef.current = updatedProgress;
      }
      
      return data; // Return the response data for success case
    } catch (error) {
      console.error(`[Track:${trackingId}] Video ilerleme takip hatası:`, error);
      throw error; // Rethrow for retry mechanism
    }
  };

  // İlerleme takibini debounce ile optimize et - daha hızlı güncellemeler için süreyi azalt
  const trackProgressDebounced = useCallback(
    debounce((videoId, watchedPercentage, isCompleted, lastPosition, viewDuration) => {
      // Disabled automatic tracking - now using manual completion button
      console.log("Automatic progress tracking disabled");
    }, 3000),
    []
  );

  // Video izleme ilerleme durumunu işleme
  const handleVideoProgress = useCallback((watchedPercentage, isCompleted, lastPosition, viewDuration) => {
    // Disabled automatic progress tracking
    console.log("Video progress callback disabled");
  }, []);

  // Bookmark handling
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically call an API to save the bookmark status
    // For now, we'll just toggle the local state
  };

  // Format time function (seconds to MM:SS)
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mevcut video değiştiğinde, kullanıcının izleme verilerini getir
  useEffect(() => {
    const fetchUserVideoView = async () => {
      if (!video?.VideoID || !isAuthenticated) return;
      
      try {
        const token = await getToken();
        if (!token) return;
        
        // Add cache busting to prevent redundant calls
        const timestamp = Date.now();
        
        const response = await fetch(`/api/courses/videos/${video.VideoID}/views?_=${timestamp}`, {
          headers: { 
            'Authorization': token,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Kullanıcı video izleme verileri:', data);
          
          if (data.videoView) {
            // UserVideoViews tablosundan gelen verileri state'e kaydet
            const watchedPercentage = data.videoView.WatchedPercentage || 0;
            const isCompleted = !!data.videoView.IsCompleted;
            const lastPosition = data.videoView.lastPosition || 0;
            
            console.log(`Using video view data from backend:`);
            console.log(`- Watched Percentage: ${watchedPercentage}%`);
            console.log(`- Completed: ${isCompleted}`);
            console.log(`- Last Position: ${lastPosition} seconds`);
            
            setUserVideoView({
              watchedPercentage: watchedPercentage,
              isCompleted: isCompleted,
              lastPosition: lastPosition,
              viewDate: data.videoView.ViewDate
            });
          } else {
            console.log('No existing video view data found for this user and video');
            // Initialize with default values
            setUserVideoView({
              watchedPercentage: 0,
              isCompleted: false,
              lastPosition: 0,
              viewDate: null
            });
          }
        } else {
          console.warn('Kullanıcı video izleme verilerini getirme hatası:', response.statusText);
        }
      } catch (error) {
        console.error('Kullanıcı video izleme verilerini getirme hatası:', error);
      }
    };
    
    // Only fetch once when video ID changes
    fetchUserVideoView();
    
    // Clear interval when component unmounts or video changes
    return () => {
      if (progressTrackingRef.current) {
        clearInterval(progressTrackingRef.current);
        progressTrackingRef.current = null;
      }
    };
  }, [video?.VideoID, isAuthenticated]); // Only re-run when videoID or auth status changes

  // Refresh token function
  const refreshToken = async () => {
    try {
      const refreshToken = safelyGetLocalStorage('refresh_token');
      if (!refreshToken) {
        console.warn('No refresh token available');
        return false;
      }
      
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        console.error('Failed to refresh token:', response.statusText);
        return false;
      }
      
      const data = await response.json();
      if (data && data.access) {
        console.log('Token refreshed successfully');
        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }
        return true;
      } else {
        console.error('Invalid refresh response:', data);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Add global unhandled rejection handler for better error tracking
  useEffect(() => {
    // Create handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      console.error('Promise Stack:', event.promise);
      
      // If this is related to video tracking, add more context
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('track') || 
           event.reason.message.includes('video') || 
           event.reason.message.includes('progress'))) {
        console.error('This appears to be a video tracking error. Current video:', video?.VideoID);
        console.error('Current progress tracking state:', progressTrackingRef.current);
      }
    };
    
    // Add listener
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Remove on cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [video]);

  // Fetch video quizzes
  const fetchVideoQuizzes = async () => {
    if (!video?.VideoID || !isAuthenticated) return;
    
    try {
      const token = await getToken();
      if (!token) {
        console.warn("Authentication token not available for video quizzes");
        return;
      }
      
      // Video ID'sını kullanarak quizleri getir
      const timestamp = Date.now();
      const apiUrl = `/api/courses/videos/${video.VideoID}/quizzes?_=${timestamp}`;
      console.log(`Fetching video quizzes from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': token,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      console.log(`Video quizzes API response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Video quizzes data:', data);
        
        // Video-specific quizzes'ları set et
        if (data.quizzes && Array.isArray(data.quizzes)) {
          setVideoQuizzes(data.quizzes);
          console.log(`Found ${data.quizzes.length} video-specific quizzes`);
        }
        
        // Course-level quizzes'ları da dahil et
        if (data.courseQuizzes && Array.isArray(data.courseQuizzes)) {
          setCourseQuizzes(data.courseQuizzes);
          console.log(`Found ${data.courseQuizzes.length} course-level quizzes`);
        }
      } else {
        console.warn('Failed to fetch video quizzes:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching video quizzes:', error);
    }
  };

  // Add handler for manual completion
  const handleMarkVideoComplete = async (videoId) => {
    if (!videoId || !video) {
      console.error("Invalid video ID or video object not available");
      return;
    }
    try {
      const loadingToastId = toast ? toast.loading("Saving your progress...") : null;
      const token = await getToken();
      if (!token) {
        if (toast) toast.error("Authentication error. Please log in again.");
        setError('Authentication required. Please log in to access this content.');
        return;
      }
      const progressData = {
        watchedPercentage: 100,
        isCompleted: true,
        lastPosition: video.Duration || 0,
        viewDuration: 0,
        timestamp: new Date().toISOString(),
        trackingId: `manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      };
      const apiUrl = `/api/courses/videos/${videoId}/track?_=${Date.now()}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'X-Tracking-ID': progressData.trackingId,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(progressData),
        cache: 'no-store'
      });
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Error parsing response:`, parseError);
        throw new Error(`Server response error: ${responseText}`);
      }
      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to mark video as complete (${response.status})`);
      }
      setUserVideoView(prev => ({
        ...prev,
        watchedPercentage: 100,
        isCompleted: true,
        lastPosition: video.Duration || 0,
        lastUpdated: new Date().toISOString()
      }));
      if (data.courseCompletionPercentage !== undefined) {
        setCourseProgress(data.courseCompletionPercentage);
        setUserCourseProgress(prev => ({
          ...prev,
          completionPercentage: data.courseCompletionPercentage,
          isCompleted: data.courseCompleted || false,
          lastVideoId: videoId,
          lastAccessDate: new Date().toISOString()
        }));
      }
      if (loadingToastId && toast) toast.dismiss(loadingToastId);
      if (toast) {
        toast.success("Video marked as complete!");
      } else {
        alert("Video marked as complete!");
      }
    } catch (error) {
      console.error('Error marking video as complete:', error);
      if (toast) {
        toast.error(`Failed to mark video as complete: ${error.message}`);
      } else {
        alert(`Failed to mark video as complete. Please try again.\nError: ${error.message}`);
      }
    }
  };

  // Fetch quizzes when tab changes to Course Content
  useEffect(() => {
    const loadQuizzes = async () => {
      if (selectedTab === 1 && courseId) {
        try {
          const token = await getToken();
          if (!token) return;

          const response = await fetch(`/api/courses/${courseId}/quizzes?t=${Date.now()}`, {
            headers: {
              'Authorization': token,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            cache: 'no-store'
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data.quizzes)) {
              setQuizzes(data.quizzes);
            }
          } else {
            console.warn('Failed to fetch course quizzes:', response.statusText);
          }
        } catch (error) {
          console.error('Error loading course quizzes:', error);
        }
      }
    };

    loadQuizzes();
  }, [selectedTab, courseId]);

  // Main render - video content with modern layout
    return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with course title and back button */}
        <Box 
          sx={{ 
            display: 'flex', 
          justifyContent: 'space-between', 
            alignItems: 'center', 
          pt: { xs: 2, md: 3 },
          pb: { xs: 1, md: 2 },
          px: { xs: 2, md: 4 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
          <Button
            variant="text"
            color="primary"
            startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/courses/${courseId}`)}
            sx={{ 
              borderRadius: 2,
              '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Back to Course
          </Button>
          
          <Typography 
            variant="h6" 
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
          {courseData?.Title || 'Course'}
          </Typography>
          
          {userVideoView && userVideoView.earnedPoints > 0 && (
            <Chip
              icon={<EmojiEventsIcon />}
            label={`+${userVideoView.earnedPoints} XP`}
            color="secondary"
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                borderRadius: 2,
                animation: userVideoView.isCompleted ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0.4)}` },
                  '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette.secondary.main, 0)}` },
                  '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0)}` }
                }
              }}
            />
          )}
        </Box>
        
      {/* Loading state */}
      {loading && (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {/* Error state */}
      {error && !loading && (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Paper elevation={2} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              Error Loading Content
            </Typography>
            <Typography variant="body1" paragraph>
              {error}
            </Typography>
            <Button variant="contained" onClick={() => router.push(`/courses/${courseId}`)}>
              Return to Course
            </Button>
          </Paper>
        </Box>
      )}
        
      {/* Main content area - only show if not loading and no error */}
      {!loading && !error && video && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Video Player - Full width */}
          <Box sx={{ 
            width: '100%', 
            bgcolor: 'black',
            position: 'relative',
            mb: { xs: 2, md: 3 },
            zIndex: 1
          }}>
            <Box sx={{ 
              width: '100%',
              maxWidth: '1400px', 
              mx: 'auto',
              position: 'relative'
            }}>
              {video?.YouTubeVideoID ? (
                <VideoPlayer 
                  video={video} 
                  onVideoProgress={handleVideoProgress}
                  userView={userVideoView} 
                />
              ) : (
                <Box sx={{ 
                  width: '100%',
                  paddingTop: '56.25%',
                  bgcolor: 'grey.800',
                  position: 'relative',
                  borderRadius: 1 
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Typography variant="body1" color="grey.400">
                      Video not available
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Video Player section ends */}

          {/* Structured Container Layout Below Video */}
          <Container 
            maxWidth="xl" 
            sx={{
              mb: 5, 
              position: 'relative',
              zIndex: 2,
              px: { xs: 2, md: 4 },
              width: '100%'
            }}
          >
            {/* Video Title and Actions */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
              width: '100%',
              position: 'relative'
            }}>
              {/* Share and Bookmark buttons - top right */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  display: 'flex',
                  gap: 1
                }}
              >
                <Tooltip title="Share">
                  <IconButton 
                    color="primary"
                    sx={{ 
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}>
                  <IconButton 
                    onClick={toggleBookmark}
                    color={isBookmarked ? "secondary" : "primary"}
                    sx={{ 
                      '&:hover': {
                        bgcolor: isBookmarked 
                          ? alpha(theme.palette.secondary.main, 0.1) 
                          : alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  align="center"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  }}
                >
                  {video?.Title || 'Video Title'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
                  {/* Previous Video Button */}
                  {courseVideos && courseVideos.length > 0 && 
                    courseVideos.findIndex(v => v.VideoID === video.VideoID) > 0 && (
                      <IconButton
                        color="primary"
                        onClick={() => {
                          const currentIndex = courseVideos.findIndex(v => v.VideoID === video.VideoID);
                          if (currentIndex > 0) {
                            router.push(`/courses/${courseId}/videos/${courseVideos[currentIndex - 1].VideoID}`);
                          }
                        }}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                  {/* Next Video Button (arrow) */}
                  {courseVideos && courseVideos.length > 0 && 
                    courseVideos.findIndex(v => v.VideoID === video.VideoID) < courseVideos.length - 1 && (
                      <IconButton
                        color="primary"
                        onClick={() => {
                          const currentIndex = courseVideos.findIndex(v => v.VideoID === video.VideoID);
                          if (currentIndex < courseVideos.length - 1) {
                            router.push(`/courses/${courseId}/videos/${courseVideos[currentIndex + 1].VideoID}`);
                          }
                        }}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    )}
                </Box>
              </Box>
              
              {/* Completion Button and Next Video Navigation */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 3,
                mt: 5,
                width: '100%'
              }}>
                {/* Previous Video Button (far left) */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                  {courseVideos && courseVideos.length > 0 &&
                    courseVideos.findIndex(v => v.VideoID === video.VideoID) > 0 && (
                      <IconButton
                        color="primary"
                        onClick={() => {
                          const currentIndex = courseVideos.findIndex(v => v.VideoID === video.VideoID);
                          if (currentIndex > 0) {
                            router.push(`/courses/${courseId}/videos/${courseVideos[currentIndex - 1].VideoID}`);
                          }
                        }}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                </Box>
                {/* Completion Button or Message (centered) */}
                <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                  {!userVideoView?.isCompleted ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleMarkVideoComplete(video.VideoID)}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: '#fff',
                        fontWeight: 'bold',
                        letterSpacing: 1,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease',
                        width: { xs: '100%', sm: '400px' },
                        mb: 1
                      }}
                    >
                      Mark Video Complete
                    </Button>
                  ) : (
                    <Paper
                      elevation={1}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        width: { xs: '100%', sm: '400px' },
                        mb: 1
                      }}
                    >
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body1" color="success.main" fontWeight="500">
                        Video completed!
                      </Typography>
                    </Paper>
                  )}
                </Box>
                {/* Next Video Button (far right) */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  {courseVideos && courseVideos.length > 0 &&
                    courseVideos.findIndex(v => v.VideoID === video.VideoID) < courseVideos.length - 1 && (
                      <IconButton
                        color="primary"
                        onClick={() => {
                          const currentIndex = courseVideos.findIndex(v => v.VideoID === video.VideoID);
                          if (currentIndex < courseVideos.length - 1) {
                            router.push(`/courses/${courseId}/videos/${courseVideos[currentIndex + 1].VideoID}`);
                          }
                        }}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    )}
                </Box>
              </Box>
            </Box>

            {/* Progress indicator */}
            {userVideoView && (
              <Box sx={{ mb: 3, width: '100%' }}>
                
                {/* Course progress indicator */}
                {userCourseProgress && userCourseProgress.completionPercentage > 0 && (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall course progress
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {Math.round(userCourseProgress.completionPercentage)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={userCourseProgress.completionPercentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          bgcolor: theme.palette.secondary.main
                        }
                      }}
                    />
                    
                    {userCourseProgress.completionPercentage === 100 && (
                      <Alert 
                        severity="success" 
                        icon={<EmojiEventsIcon />} 
                        sx={{ 
                          mt: 2, 
                          borderRadius: 2,
                          animation: 'fadeIn 1s ease-in'
                        }}
                      >
                        <AlertTitle>Course Completed!</AlertTitle>
                        Congratulations! You've completed this entire course.
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            )}
            
            {/* Tabs navigation */}
            <Paper 
              elevation={0} 
                    sx={{ 
                      borderRadius: 2, 
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                mb: 3,
                width: '100%'
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                <Tabs 
                  value={selectedTab} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                      sx={{ 
                    width: '100%',
                    '& .MuiTabs-indicator': {
                      backgroundColor: theme.palette.secondary.main,
                      height: 3
                    },
                    '& .MuiTab-root': {
                      fontWeight: 'medium',
                      fontSize: '1rem',
                      textTransform: 'none',
                      minWidth: { xs: 120, sm: 160 },
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: theme.palette.primary.main,
                      },
                      '&.Mui-selected': {
                        color: theme.palette.secondary.main,
                        fontWeight: 'bold',
                      },
                    }
                  }}
                >
                  <Tab 
                    label="Video Information" 
                    icon={<InfoOutlinedIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="Course Content" 
                    icon={<MenuBookIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="Resources" 
                    icon={<DescriptionIcon />} 
                    iconPosition="start"
                  />
                  {/* Sadece quiz varsa tab'ı göster */}
                  {((videoQuizzes && videoQuizzes.length > 0) || 
                    (courseQuizzes && courseQuizzes.length > 0) || 
                    (quizzes && quizzes.length > 0)) && (
                    <Tab 
                      label={`Quizzes (${(videoQuizzes?.length || 0) + (courseQuizzes?.length || 0) + (quizzes?.length || 0)})`}
                      icon={<QuizIcon />} 
                      iconPosition="start"
                    />
                  )}
                </Tabs>
                    </Box>
              
              {/* Tab content container */}
              <Box sx={{ p: 3, width: '100%' }}>
                {/* Tab 1: Video Information */}
                {selectedTab === 0 && (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ width: '100%', mb: 3 }}>
                      <Box 
                        elevation={0} 
                    sx={{ 
                      borderRadius: 2, 
                          overflow: 'hidden',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          mb: 3,
                          width: '100%',
                          p: 3
                        }}
                      >
                        <Box sx={{ mb: 3, width: '100%' }}>
                          <Typography variant="h6" gutterBottom fontWeight="bold">
                            About This Course
                          </Typography>
                          
                          <Box sx={{ mb: 3, width: '100%' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Overall Progress
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
                              <LinearProgress
                                variant="determinate"
                                value={getCourseCompletionPercentage()}
                      sx={{ 
                                  flexGrow: 1,
                                  mr: 2,
                                  height: 8,
                                  borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: theme.palette.success.main
                                  }
                                }}
                              />
                              <Typography variant="body2" fontWeight="bold">
                                {getCourseCompletionPercentage()}%
                              </Typography>
                    </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <SlideshowIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="body2">
                                  {courseVideos?.length || 0} Videos
                    </Typography>
                              </Box>
                            </Box>
                            
                            <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <QuizIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="body2">
                                  {quizzes?.length || 0} Quizzes
                    </Typography>
                  </Box>
                            </Box>
                            
                            <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <PeopleOutlineIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="body2">
                                  {enrolledStudents > 0 ? enrolledStudents : courseData?.EnrolledUsers || 0} Students Enrolled
                                </Typography>
                    </Box>
                            </Box>
                            
                            <Box sx={{ minWidth: '150px', flex: '1 1 auto' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <FormatListBulletedIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="body2">
                                  {courseData?.ModulesCount || 1} Modules
                    </Typography>
                  </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => router.push(`/courses/${courseId}`)}
                    sx={{ 
                              py: 1,
                              px: 3,
                      borderRadius: 2, 
                              textTransform: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            View Full Course
                          </Button>
                    </Box>
                  </Box>
                    </Box>
                    
                    {/* Render the rest of the tab content */}
                  </Box>
                )}
                
                {/* Tab 2: Course Content */}
                {selectedTab === 1 && (
                  <Box sx={{ width: '100%' }}>
                    {courseData?.userProgress && (
                      <Paper 
                        elevation={1}
                    sx={{ 
                          p: 3, 
                          mb: 3, 
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                          background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`
                        }}
                      >
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                          Continue Watching
                  </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Course Progress: {courseData.userProgress.completionPercentage || courseProgress}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={courseData.userProgress.completionPercentage || courseProgress}
                  sx={{ 
                              height: 6, 
                              borderRadius: 3, 
                              mb: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.success.main
                              }
                            }}
                          />
                        </Box>
                        
                        {courseData.userProgress.lastVideoID && courseData.userProgress.lastVideoID !== parseInt(videoId) && (
                <Button
                  variant="contained"
                  color="primary"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => router.push(`/courses/${courseId}/videos/${courseData.userProgress.lastVideoID}`)}
                  sx={{ 
                    borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            Continue from Last Video
                </Button>
                        )}
            </Paper>
                    )}
                    
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                      Course Videos
                  </Typography>
                  
                    {Array.isArray(courseVideos) && courseVideos.length > 0 ? (
                      <Stack spacing={2} sx={{ width: '100%', mb: 3 }}>
                        {courseVideos.map((courseVideo, index) => (
                          <VideoListItem
                            key={courseVideo.VideoID}
                            video={courseVideo}
                            index={index}
                            currentVideo={video}
                            isCompleted={userVideoView?.isCompleted || false}
                            onVideoClick={(clickedVideoId) => router.push(`/courses/${courseId}/videos/${clickedVideoId}`)}
                      />
                    ))}
                      </Stack>
                    ) : (
              <Paper 
                        elevation={0}
                sx={{ 
                          p: 4, 
                          textAlign: 'center',
                  borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.paper, 0.6)
                }}
              >
                        <Typography variant="body1" color="text.secondary">
                          No videos available for this course yet
                </Typography>
                      </Paper>
                    )}
                  </Box>
                )}

                {/* Tab 3: Resources */}
                {selectedTab === 2 && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Course Resources
                </Typography>
                
                    {resources && resources.length > 0 ? (
                      <Stack spacing={2} sx={{ width: '100%' }}>
                        {resources.map((resource, index) => (
                          <ResourceItem key={index} resource={resource} />
                        ))}
            </Stack>
                    ) : (
              <Paper 
                        elevation={0}
                sx={{ 
                          p: 4, 
                          textAlign: 'center',
                  borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.paper, 0.6)
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No resources available for this course yet
                </Typography>
                      </Paper>
                    )}
                  </Box>
                )}

                {/* Tab 4: Quizzes */}
                {selectedTab === 3 && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Quizzes
                    </Typography>
                    
                    {/* Video-specific quizzes */}
                    {videoQuizzes && videoQuizzes.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium" color="primary">
                          Video Quizzes
                        </Typography>
                        <Stack spacing={2} sx={{ width: '100%' }}>
                          {videoQuizzes.map((quiz) => (
                            <VideoQuiz 
                              key={`video-quiz-${quiz.QuizID}`} 
                              quiz={quiz} 
                              canAccess={userVideoView?.isCompleted || userVideoView?.watchedPercentage >= 90}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    {/* Course-level quizzes */}
                    {courseQuizzes && courseQuizzes.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium" color="secondary">
                          Course Quizzes
                        </Typography>
                        <Stack spacing={2} sx={{ width: '100%' }}>
                          {courseQuizzes.map((quiz) => (
                            <VideoQuiz 
                              key={`course-quiz-${quiz.QuizID}`} 
                              quiz={quiz} 
                              canAccess={true} // Course quizzes are always accessible
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    {/* Legacy quizzes from video object */}
                    {quizzes && quizzes.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                          Additional Quizzes
                        </Typography>
                        <Stack spacing={2} sx={{ width: '100%' }}>
                          {quizzes.map((quiz) => (
                            <VideoQuiz 
                              key={`legacy-quiz-${quiz.QuizID}`} 
                              quiz={quiz} 
                              canAccess={userVideoView?.isCompleted || userVideoView?.watchedPercentage >= 90}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    {/* No quizzes message */}
                    {(!videoQuizzes || videoQuizzes.length === 0) && 
                     (!courseQuizzes || courseQuizzes.length === 0) && 
                     (!quizzes || quizzes.length === 0) && (
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 4, 
                          textAlign: 'center',
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.paper, 0.6)
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No quizzes available for this video yet
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}
                </Box>
              </Paper>
      </Container>
        </Box>
      )}
      {!loading && !error && video && (
        <Container maxWidth="lg" sx={{ mb: 3 }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2 }}>
            {/* Empty box - completion UI moved to top */}
          </Box>
        </Container>
      )}
    </Box>
  );
}