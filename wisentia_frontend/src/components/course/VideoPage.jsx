'use client';

import { useState, useEffect, useRef } from 'react';
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
  ListItemAvatar, 
  ListItemText, 
  LinearProgress, 
  alpha, 
  useTheme,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Badge
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import QuizIcon from '@mui/icons-material/Quiz';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import NoteIcon from '@mui/icons-material/Note';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

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

// Simple embedded YouTube video component for improved reliability
const SimpleVideoPlayer = ({ videoId, onProgress, initialProgress = 0 }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Format time in minutes:seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Paper 
      elevation={4}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '56.25%', // 16:9 aspect ratio
        backgroundColor: 'black', 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.005)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }
      }}
    >
      {loading && (
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
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          <CircularProgress 
            size={60} 
            thickness={5} 
            sx={{ 
              color: theme.palette.secondary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
        </Box>
      )}
      
      <iframe 
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&start=${Math.floor(initialProgress)}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
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
          zIndex: 5
        }}
      />
      
      {/* Bottom gradient overlay */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: '80px', 
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))', 
          pointerEvents: 'none',
          zIndex: 6
        }} 
      />
    </Paper>
  );
};

// Dynamic import of the simple video player
const VideoPlayer = dynamic(() => Promise.resolve(SimpleVideoPlayer), {
  ssr: false,
  loading: () => (
    <Box sx={{ width: '100%', paddingTop: '56.25%', position: 'relative', bgcolor: 'black', borderRadius: 2 }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color="secondary" />
      </Box>
    </Box>
  )
});

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

// Main Video Page Component
export default function VideoPage({ params }) {
  const { courseId, videoId } = params || {};
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  
  // State
  const [video, setVideo] = useState(null);
  const [course, setCourse] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [userView, setUserView] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Player state tracking
  const [playerState, setPlayerState] = useState({
    playing: false,
    currentTime: 0,
    duration: 0,
    lastTrackedTime: 0,
  });
  
  // Refs
  const timerRef = useRef(null);
  
  // Resources example data - using fixed value to prevent hydration issues
  const resources = [
    { id: 1, title: "Course Notes - Blockchain Fundamentals", type: "PDF", size: "1.2 MB" },
    { id: 2, title: "Code Examples - Demo Repository", type: "ZIP", size: "3.5 MB" },
    { id: 3, title: "Additional Reading Materials", type: "PDF", size: "2.8 MB" }
  ];

  // Fetch video details
  useEffect(() => {
    let isActive = true;
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        
        // API call - you can uncomment and use
        // const response = await fetch(`/api/courses/${courseId}/videos/${videoId}`);
        // if (!response.ok) throw new Error('Could not retrieve video data');
        // const data = await response.json();
        
        // Mock data
        setTimeout(() => {
          if (!isActive) return;

          // Mock video data
          const mockVideo = {
            VideoID: parseInt(videoId),
            Title: "Introduction to Blockchain Technology",
            Description: "Learn the basics of blockchain technology, including distributed ledgers, blocks, and cryptographic hash operations. This fundamental knowledge will help you understand how blockchain works and why it's considered a revolutionary technology in finance, supply chain, healthcare, and many other sectors.",
            YouTubeVideoID: "SSo_EIwHSd4", // Replace with an actual YouTube video ID
            Duration: 785, // 13:05 in seconds
            OrderInCourse: 1,
            userView: {
              watchedPercentage: 45,
              isCompleted: false,
              earnedPoints: 0
            }
          };
          
          // Mock course data
          const mockCourse = {
            CourseID: parseInt(courseId),
            Title: "Blockchain Fundamentals",
            Description: "A comprehensive introduction to blockchain technology",
            Instructor: "John Doe",
            videos: [
              { VideoID: 1, Title: "Introduction to Blockchain Technology", Duration: 785, OrderInCourse: 1 },
              { VideoID: 2, Title: "History of Bitcoin", Duration: 950, OrderInCourse: 2 },
              { VideoID: 3, Title: "How Blockchain Works", Duration: 1100, OrderInCourse: 3 },
              { VideoID: 4, Title: "Consensus Mechanisms", Duration: 1320, OrderInCourse: 4 },
              { VideoID: 5, Title: "Types of Blockchains", Duration: 1050, OrderInCourse: 5 },
              { VideoID: 6, Title: "Blockchain Use Cases", Duration: 1210, OrderInCourse: 6 },
            ]
          };
          
          // Mock quiz data
          const mockQuizzes = [
            { QuizID: 101, Title: "Blockchain Fundamentals Quiz", Description: "Test your understanding of blockchain basics" },
            { QuizID: 102, Title: "Consensus Mechanisms Quiz", Description: "Verify your knowledge of different consensus algorithms" }
          ];
          
          setVideo(mockVideo);
          setCourse(mockCourse);
          setCourseVideos(mockCourse.videos);
          setQuizzes(mockQuizzes);
          setUserView(mockVideo.userView);
          
          // Set initial player state
          setPlayerState(prev => ({
            ...prev,
            currentTime: mockVideo.userView ? (mockVideo.userView.watchedPercentage * mockVideo.Duration / 100) : 0,
            duration: mockVideo.Duration
          }));
          
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching video details:', err);
        if (isActive) {
          setError(err.message || 'Failed to load video details');
          setLoading(false);
        }
      }
    };
    
    if (courseId && videoId) {
      fetchVideoDetails();
    }
    
    // Cleanup
    return () => {
      isActive = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [courseId, videoId, user]);
  
  // Progress tracking - optimized
  const trackProgress = async (watchedPercentage, isCompleted = false) => {
    if (!user || !video) return;
    
    // Check progress info - prevent unnecessary updates
    if (userView) {
      // Skip update if no significant change
      const percentageDiff = Math.abs(userView.watchedPercentage - watchedPercentage);
      
      if (percentageDiff < 5 && userView.isCompleted === isCompleted) {
        return;
      }
    }
    
    console.log(`Updating progress: ${watchedPercentage.toFixed(1)}%, completed: ${isCompleted}`);
    
    try {
      // Real API call
      // const response = await fetch(`/api/courses/${courseId}/videos/${videoId}/progress`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     watchedPercentage,
      //     isCompleted
      //   }),
      // });
      // 
      // if (!response.ok) throw new Error('Failed to update progress');
      // const data = await response.json();
      // setUserView(data);
      
      // Mock update (when no real API)
      setUserView(prevState => {
        // If previously completed and rewatching, maintain status
        const newIsCompleted = prevState?.isCompleted ? true : isCompleted;
        const earnedPoints = newIsCompleted ? (prevState?.earnedPoints || 0) + 10 : prevState?.earnedPoints || 0;
        
        return {
          watchedPercentage,
          isCompleted: newIsCompleted,
          earnedPoints: earnedPoints
        };
      });
      
      // Update player state
      setPlayerState(prev => ({
        ...prev,
        lastTrackedTime: prev.currentTime
      }));
      
      // Show notification if completed and not previously completed
      if (isCompleted && !userView?.isCompleted) {
        console.log('Video completed, earned 10 points!');
      }
      
    } catch (err) {
      console.error('Failed to save video progress:', err);
    }
  };
  
  // Video selection
  const handleSelectVideo = (newVideoId) => {
    if (newVideoId === parseInt(videoId)) return;
    
    // Save current progress before transition
    if (userView) {
      trackProgress(userView.watchedPercentage, userView.isCompleted);
    }
    
    // Navigate to new video
    router.push(`/courses/${courseId}/videos/${newVideoId}`);
  };
  
  // Navigate to previous video
  const handlePreviousVideo = () => {
    const currentIndex = courseVideos.findIndex(v => v.VideoID === parseInt(videoId));
    if (currentIndex > 0) {
      handleSelectVideo(courseVideos[currentIndex - 1].VideoID);
    }
  };
  
  // Navigate to next video
  const handleNextVideo = () => {
    const currentIndex = courseVideos.findIndex(v => v.VideoID === parseInt(videoId));
    if (currentIndex < courseVideos.length - 1) {
      handleSelectVideo(courseVideos[currentIndex + 1].VideoID);
    }
  };
  
  // Go to quiz
  const handleTakeQuiz = (quizId) => {
    router.push(`/quizzes/${quizId}`);
  };
  
  // Return to course
  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`);
  };
  
  // Format time (from seconds to min:sec format)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Toggle bookmark
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Real API call
    // fetch(`/api/courses/${courseId}/videos/${videoId}/bookmark`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ isBookmarked: !isBookmarked })
    // });
  };
  
  // Is there a previous video?
  const hasPreviousVideo = courseVideos.findIndex(v => v.VideoID === parseInt(videoId)) > 0;
  
  // Is there a next video?
  const hasNextVideo = courseVideos.findIndex(v => v.VideoID === parseInt(videoId)) < courseVideos.length - 1;
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '70vh', 
            flexDirection: 'column' 
          }}
        >
          <CircularProgress 
            size={60} 
            thickness={5} 
            sx={{ 
              color: theme.palette.secondary.main,
              mb: 3
            }} 
          />
          <Typography variant="h6" sx={{ mb: 1 }}>Loading video...</Typography>
          <Typography variant="body2" color="text.secondary">
            Preparing your learning experience
          </Typography>
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.light}`,
            background: alpha(theme.palette.error.light, 0.05)
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Video
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={handleBackToCourse}
            startIcon={<ArrowBackIcon />}
          >
            Back to Course
          </Button>
        </Paper>
      </Container>
    );
  }
  
  if (!video || !course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: 2 
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Video Not Found
          </Typography>
          <Typography variant="body1">
            The requested video could not be found.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={handleBackToCourse}
            startIcon={<ArrowBackIcon />}
          >
            Back to Course
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <>
      <AnimatedBackground />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8, position: 'relative', zIndex: 1 }}>
        {/* Top title and navigation */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="text"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToCourse}
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Back to Course
          </Button>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {course.Title}
          </Typography>
          
          {userView && userView.earnedPoints > 0 && (
            <Chip
              icon={<EmojiEventsIcon />}
              label={`+${userView.earnedPoints} points`}
              color="primary"
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                borderRadius: 2,
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                animation: userView.isCompleted ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0.4)}` },
                  '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette.secondary.main, 0)}` },
                  '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0)}` }
                }
              }}
            />
          )}
        </Box>
        
        <Grid container spacing={4}>
          {/* Main Content - Video and Details */}
          <Grid item xs={12} lg={8}>
            {/* Video Player and Previous/Next Navigation */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              {video && (
                <VideoPlayer 
                  videoId={video.YouTubeVideoID} 
                  onProgress={trackProgress} 
                  initialProgress={(userView?.watchedPercentage || 0) * video.Duration / 100}
                />
              )}
              
              {/* Previous/Next Video Navigation */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 20, 
                  left: 0, 
                  right: 0, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 2,
                  zIndex: 2
                }}
              >
                <Tooltip title={hasPreviousVideo ? "Previous Video" : "This is the first video"}>
                  <span>
                    <IconButton
                      disabled={!hasPreviousVideo}
                      onClick={handlePreviousVideo}
                      sx={{
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        '&:hover': {
                          bgcolor: theme.palette.background.paper,
                        },
                        '&.Mui-disabled': {
                          bgcolor: alpha(theme.palette.background.paper, 0.4),
                        },
                        boxShadow: theme.shadows[3]
                      }}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                
                <Tooltip title={hasNextVideo ? "Next Video" : "This is the last video"}>
                  <span>
                    <IconButton
                      disabled={!hasNextVideo}
                      onClick={handleNextVideo}
                      sx={{
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        '&:hover': {
                          bgcolor: theme.palette.background.paper,
                        },
                        '&.Mui-disabled': {
                          bgcolor: alpha(theme.palette.background.paper, 0.4),
                        },
                        boxShadow: theme.shadows[3]
                      }}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Video Title and Controls */}
            <Paper 
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h1" fontWeight="bold">
                  {video.Title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Share">
                    <IconButton 
                      size="small" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}>
                    <IconButton 
                      size="small" 
                      onClick={toggleBookmark}
                      sx={{ 
                        color: isBookmarked ? theme.palette.primary.main : theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Progress indicator */}
              {userView && (
                <Box sx={{ mb: 3 }}>
                  {userView.isCompleted ? (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: theme.palette.success.main, 
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.success.main, 0.1)
                    }}>
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        Completed
                      </Typography>
                      
                      {userView.earnedPoints > 0 && (
                        <Chip 
                          size="small" 
                          icon={<EmojiEventsIcon />} 
                          label={`+${userView.earnedPoints} points`} 
                          color="primary" 
                          sx={{ ml: 'auto' }}
                        />
                      )}
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 1 
                      }}>
                        <Typography variant="body2">
                          {Math.round(userView.watchedPercentage)}% completed
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(playerState.currentTime)} / {formatTime(video.Duration)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={userView.watchedPercentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }
                        }} 
                      />
                    </>
                  )}
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Video metadata and info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      <AccessTimeIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Duration
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {formatTime(video.Duration)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      <OndemandVideoIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Lesson
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {video.OrderInCourse} / {courseVideos.length}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      <QuizIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Quizzes
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {quizzes.length}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      <NoteIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Resources
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {resources.length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Video Description */}
              {video.Description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom fontWeight="medium">
                    Description
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      lineHeight: 1.7,
                      mb: 2
                    }}
                  >
                    {video.Description}
                  </Typography>
                </Box>
              )}
              
              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={!hasPreviousVideo}
                  onClick={handlePreviousVideo}
                  startIcon={<NavigateBeforeIcon />}
                  sx={{ 
                    borderRadius: 2,
                    visibility: hasPreviousVideo ? 'visible' : 'hidden',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Previous
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!hasNextVideo}
                  onClick={handleNextVideo}
                  endIcon={<NavigateNextIcon />}
                  sx={{ 
                    borderRadius: 2,
                    visibility: hasNextVideo ? 'visible' : 'hidden',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next
                </Button>
              </Box>
            </Paper>
            
            {/* Quizzes and Resources */}
            <Stack spacing={3}>
              {/* Quizzes Section */}
              {quizzes && quizzes.length > 0 && (
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Quizzes
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Complete these quizzes to test your knowledge and earn points
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {quizzes.map((quiz) => (
                      <QuizCard 
                        key={quiz.QuizID} 
                        quiz={quiz} 
                        onTakeQuiz={handleTakeQuiz} 
                      />
                    ))}
                  </Box>
                </Paper>
              )}
              
              {/* Resources Section */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Resources
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Download additional materials for this lesson
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {resources.map((resource) => (
                    <ResourceItem key={resource.id} resource={resource} />
                  ))}
                </Box>
              </Paper>
            </Stack>
          </Grid>
          
          {/* Side panel - Course Videos */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.background.paper, 0.6)
                    : theme.palette.background.paper,
                  backdropFilter: 'blur(8px)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                  Course Content
                </Typography>
                
                {/* Course Completion */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Progress</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {Math.round((courseVideos.filter(v => v.VideoID < video.VideoID || 
                                               (v.VideoID === video.VideoID && userView?.isCompleted)).length / 
                              courseVideos.length) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(courseVideos.filter(v => v.VideoID < video.VideoID || 
                                        (v.VideoID === video.VideoID && userView?.isCompleted)).length / 
                      courseVideos.length) * 100} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }
                    }} 
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {/* Video list */}
                <Box 
                  sx={{ 
                    maxHeight: { xs: 'auto', sm: 'calc(100vh - 350px)' }, 
                    overflow: 'auto',
                    pr: 1,
                    mr: -1
                  }}
                >
                  {courseVideos.map((courseVideo, index) => (
                    <VideoListItem
                      key={courseVideo.VideoID}
                      video={courseVideo}
                      index={index}
                      currentVideo={video}
                      isCompleted={courseVideo.VideoID < video.VideoID || (courseVideo.VideoID === video.VideoID && userView?.isCompleted)}
                      onVideoClick={handleSelectVideo}
                    />
                  ))}
                </Box>
                
                {/* Navigation buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToCourse}
                  >
                    Course Details
                  </Button>
                </Box>
                
                {/* Background decoration */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)}, transparent 70%)`,
                    zIndex: 0
                  }} 
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}