'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Avatar,
  Rating,
  CircularProgress,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  alpha,
  useTheme,
  Paper,
  Tab,
  Tabs,
  Skeleton,
  useMediaQuery,
  Tooltip,
  LinearProgress
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '@/contexts/AuthContext';

// Animated background with glowing stars effect
const GlowingStarsBackground = () => {
  const theme = useTheme();
  
  return (
    <Box
      className="stars-container"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      {/* Small star particles */}
      {[...Array(70)].map((_, i) => (
        <Box
          key={`star-${i}`}
          className="star"
          sx={{
            position: 'absolute',
            width: Math.random() < 0.7 ? '1px' : '2px',
            height: Math.random() < 0.7 ? '1px' : '2px',
            backgroundColor: i % 5 === 0 ? theme.palette.secondary.main : theme.palette.primary.main,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle-${i % 3} ${2 + Math.random() * 4}s infinite ease-in-out`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        />
      ))}
      
      {/* Larger glow stars */}
      {[...Array(20)].map((_, i) => {
        const size = 1 + Math.random() * 2;
        return (
          <Box
            key={`glow-star-${i}`}
            className="glow-star"
            sx={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: i % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
              borderRadius: '50%',
              boxShadow: i % 2 === 0 
                ? `0 0 ${5 + Math.random() * 10}px ${theme.palette.primary.main}`
                : `0 0 ${5 + Math.random() * 10}px ${theme.palette.secondary.main}`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse-${i % 5} ${4 + Math.random() * 6}s infinite alternate`,
            }}
          />
        );
      })}
    </Box>
  );
};

// Video list item component
const VideoListItem = ({ video, index, isCompleted, isLocked, onVideoClick, isActive }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  
  return (
    <Paper
      elevation={hovered || isActive ? 4 : 1}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isLocked ? null : () => onVideoClick(video.id)}
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        cursor: isLocked ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered && !isLocked ? 'translateX(5px)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        border: isActive ? `1px solid ${theme.palette.primary.main}` : 'none',
        '&::before': isActive ? {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: theme.palette.primary.main,
        } : {},
        opacity: isLocked ? 0.7 : 1,
        backgroundColor: isActive 
          ? alpha(theme.palette.primary.main, 0.05) 
          : theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              : isLocked 
                ? alpha(theme.palette.text.disabled, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
            mr: 1.5
          }}
        >
          {isCompleted ? (
            <CheckCircleIcon fontSize="small" color="success" />
          ) : isLocked ? (
            <LockIcon fontSize="small" color="disabled" />
          ) : isActive ? (
            <PlayArrowIcon fontSize="small" color="primary" />
          ) : (
            <PendingIcon fontSize="small" color="primary" />
          )}
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              opacity: isLocked ? 0.6 : 1, 
              display: 'flex', 
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Box component="span" sx={{ mr: 1 }}>
              {index + 1}.
            </Box>
            {video.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: '0.75rem', mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {video.duration || '10:00'}
            </Typography>
          </Box>
        </Box>
        
        {!isLocked && (
          <IconButton 
            size="small" 
            sx={{ 
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <PlayCircleOutlineIcon fontSize="small" color="primary" />
          </IconButton>
        )}
      </Box>
      
      {isActive && (
        <LinearProgress 
          variant="determinate" 
          value={isCompleted ? 100 : 45} 
          sx={{ 
            mt: 1, 
            height: 4, 
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              backgroundColor: isCompleted ? theme.palette.success.main : theme.palette.primary.main
            }
          }} 
        />
      )}
    </Paper>
  );
};

// Main CourseDetail component
export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId;
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  
  // State
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // Fetch course data
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        // In a real application, fetch from API:
        // const response = await fetch(`/api/courses/${courseId}`);
        // const data = await response.json();
        
        // Mock data for now
        const mockCourse = {
          id: courseId,
          title: 'Introduction to Blockchain',
          description: 'Learn the fundamentals of blockchain technology, including its history, how it works, and its real-world applications. This course is designed for beginners and requires no prior knowledge of blockchain or cryptocurrency.',
          longDescription: `
          <p>Blockchain technology is revolutionizing industries across the globe, from finance and supply chain to healthcare and beyond. This comprehensive course will take you from a complete beginner to having a solid understanding of blockchain fundamentals.</p>
          
          <p>Through a series of engaging video lectures, practical examples, and interactive quizzes, you'll learn:</p>
          
          <ul>
            <li>The history and evolution of blockchain technology</li>
            <li>How blockchain works at a technical level</li>
            <li>Different types of consensus mechanisms</li>
            <li>Cryptocurrencies and tokens</li>
            <li>Smart contracts and decentralized applications</li>
            <li>Real-world blockchain use cases</li>
            <li>The future of blockchain and its potential impact</li>
          </ul>
          
          <p>By the end of this course, you'll have the knowledge and confidence to understand blockchain applications, participate in blockchain discussions, and even start building your own blockchain projects.</p>
          
          <p>Whether you're a student, professional, entrepreneur, or simply curious about this groundbreaking technology, this course will provide you with the foundation you need to navigate the exciting world of blockchain.</p>
          `,
          category: 'Blockchain',
          difficulty: 'Beginner',
          thumbnailURL: '/placeholder-course1.jpg',
          instructorName: 'John Doe',
          instructorBio: 'Blockchain developer with 8+ years of experience',
          instructorAvatar: '/avatar-placeholder.jpg',
          totalVideos: 12,
          totalDuration: '4 hours 30 minutes',
          rating: 4.8,
          studentsCount: 2854,
          creationDate: '2023-05-15',
          lastUpdated: '2024-02-20',
          videos: [
            { id: 1, title: 'Introduction to Blockchain Technology', duration: '12:30', completed: true },
            { id: 2, title: 'The History of Bitcoin', duration: '15:45', completed: true },
            { id: 3, title: 'How Blockchain Works', duration: '18:20', completed: false },
            { id: 4, title: 'Consensus Mechanisms', duration: '22:15', completed: false },
            { id: 5, title: 'Types of Blockchains', duration: '17:30', completed: false },
            { id: 6, title: 'Blockchain Use Cases', duration: '20:10', completed: false },
            { id: 7, title: 'Introduction to Cryptocurrencies', duration: '14:45', completed: false },
            { id: 8, title: 'Smart Contracts Explained', duration: '24:00', completed: false },
            { id: 9, title: 'Decentralized Applications', duration: '19:15', completed: false },
            { id: 10, title: 'Blockchain Security', duration: '26:40', completed: false },
            { id: 11, title: 'The Future of Blockchain', duration: '16:20', completed: false },
            { id: 12, title: 'Final Project & Review', duration: '22:30', completed: false },
          ],
          quizzes: [
            { id: 101, title: 'Blockchain Basics Quiz', description: 'Test your understanding of blockchain fundamentals' },
            { id: 102, title: 'Cryptocurrency Quiz', description: 'Assess your knowledge of different cryptocurrencies' },
            { id: 103, title: 'Smart Contracts & Applications', description: 'Check your understanding of smart contract use cases' }
          ],
          resources: [
            { id: 201, title: 'Blockchain Glossary', type: 'PDF', size: '1.2 MB' },
            { id: 202, title: 'Cryptocurrency Comparison Chart', type: 'PDF', size: '0.8 MB' },
            { id: 203, title: 'Smart Contract Examples', type: 'ZIP', size: '3.5 MB' }
          ]
        };
        
        setTimeout(() => {
          setCourse(mockCourse);
          setCurrentVideo(mockCourse.videos[0]);
          
          // Set user progress if authenticated
          if (isAuthenticated) {
            setUserProgress({
              completionPercentage: 16.7, // 2 out of 12 videos completed
              lastWatchedVideo: mockCourse.videos[2],
              isCompleted: false,
              enrolledAt: '2023-08-20'
            });
          }
          
          setLoading(false);
        }, 1000); // Simulate loading
      } catch (error) {
        console.error('Failed to fetch course details:', error);
        setError('Failed to load course details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId, isAuthenticated]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle video click
  const handleVideoClick = (videoId) => {
    if (course) {
      const video = course.videos.find(v => v.id === videoId);
      if (video) {
        setCurrentVideo(video);
        // In a real app, we would navigate to the video page
        router.push(`/courses/${courseId}/videos/${videoId}`);
      }
    }
  };
  
  // Handle quiz click
  const handleQuizClick = (quizId) => {
    // Navigate to quiz page
    router.push(`/quizzes/${quizId}`);
  };
  
  // Handle enroll
  const handleEnroll = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // In a real app, would call API to enroll
    // For now, just simulate enrollment
    setUserProgress({
      completionPercentage: 0,
      lastWatchedVideo: course.videos[0],
      isCompleted: false,
      enrolledAt: new Date().toISOString().split('T')[0]
    });
  };
  
  // Handle continue learning
  const handleContinueLearning = () => {
    if (userProgress && userProgress.lastWatchedVideo) {
      // Set current video to last watched
      setCurrentVideo(userProgress.lastWatchedVideo);
      // Navigate to video page
      router.push(`/courses/${courseId}/videos/${userProgress.lastWatchedVideo.id}`);
    } else {
      // Start from the beginning
      router.push(`/courses/${courseId}/videos/${course.videos[0].id}`);
    }
  };
  
  // Define animations
  const animations = `
    @keyframes twinkle-0 {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    
    @keyframes twinkle-1 {
      0%, 100% { opacity: 0.6; }
      30% { opacity: 0.2; }
      60% { opacity: 1; }
    }
    
    @keyframes twinkle-2 {
      0%, 100% { opacity: 0.3; }
      40% { opacity: 0.8; }
      80% { opacity: 0.1; }
    }
    
    @keyframes pulse-0 {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(1.2); opacity: 1; }
    }
    
    @keyframes pulse-1 {
      0% { transform: scale(0.9); opacity: 0.5; }
      100% { transform: scale(1.1); opacity: 0.9; }
    }
    
    @keyframes pulse-2 {
      0% { transform: scale(1.1); opacity: 0.4; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }
    
    @keyframes pulse-3 {
      0% { transform: scale(0.8); opacity: 0.6; }
      100% { transform: scale(1.2); opacity: 1; }
    }
    
    @keyframes pulse-4 {
      0% { transform: scale(1.2); opacity: 0.3; }
      100% { transform: scale(0.8); opacity: 0.7; }
    }
  `;
  
  if (loading) {
    return (
      <Box sx={{ py: 6, position: 'relative', minHeight: '100vh' }}>
        <style>{animations}</style>
        <GlowingStarsBackground />
        
        <Container maxWidth="lg">
          <Box sx={{ pt: 4, pb: 8 }}>
            {/* Skeleton loading */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 3 }} />
                <Skeleton variant="text" height={60} width="80%" sx={{ mb: 2 }} />
                <Skeleton variant="text" height={24} width="60%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="40%" sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 4 }} />
                  <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 4 }} />
                </Box>
                
                <Skeleton variant="text" height={200} />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1, mb: 3 }} />
                
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ py: 6, position: 'relative', minHeight: '100vh' }}>
        <style>{animations}</style>
        <GlowingStarsBackground />
        
        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ 
              mt: 4, 
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }
  
  if (!course) {
    return (
      <Box sx={{ py: 6, position: 'relative', minHeight: '100vh' }}>
        <style>{animations}</style>
        <GlowingStarsBackground />
        
        <Container maxWidth="lg">
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 4, 
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            Course not found
          </Alert>
        </Container>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 6, position: 'relative', minHeight: '100vh' }}>
      <style>{animations}</style>
      <GlowingStarsBackground />
      
      <Container maxWidth="lg">
        <Box sx={{ pt: 4, pb: 8 }}>
          <Grid container spacing={4}>
            {/* Left Column - Course details */}
            <Grid item xs={12} md={8}>
              {/* Course header */}
              <Paper 
                elevation={4} 
                sx={{ 
                  height: 300, 
                  borderRadius: 3, 
                  mb: 3, 
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.secondary.dark, 0.9)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Course title overlay */}
                <Box
                  sx={{
                    p: 3,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4) 50%, rgba(0,0,0,0))',
                  }}
                >
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Chip 
                      label={course.difficulty} 
                      size="small" 
                      sx={{ 
                        mr: 1,
                        bgcolor: 
                          course.difficulty === 'Beginner' ? theme.palette.success.main :
                          course.difficulty === 'Intermediate' ? theme.palette.primary.main :
                          theme.palette.secondary.main,
                        color: '#fff'
                      }}
                    />
                    <Chip 
                      label={course.category} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
                    />
                    
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <Rating value={course.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" sx={{ ml: 1, color: '#fff' }}>
                        ({course.rating})
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {course.title}
                  </Typography>
                  
                  <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {course.description}
                  </Typography>
                </Box>
                
                {/* Play button overlay */}
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
                  <IconButton
                    onClick={() => handleVideoClick(course.videos[0].id)}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(5px)',
                      p: 3,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.25)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 50, color: '#fff' }} />
                  </IconButton>
                </Box>
              </Paper>
              
              {/* Course stats */}
              <Box sx={{ mb: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: theme.palette.background.paper,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        minHeight: 120
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 207,
                          height: 40,
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <VideoLibraryIcon color="primary" sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Videos</Typography>
                      <Typography variant="h6" fontWeight="bold">{course.totalVideos}</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: theme.palette.background.paper,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        minHeight: 120
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 207,
                          height: 40,
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <AccessTimeIcon color="primary" sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Duration</Typography>
                      <Typography variant="h6" fontWeight="bold">{course.totalDuration}</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: theme.palette.background.paper,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        minHeight: 120
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 207,
                          height: 40,
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <SchoolIcon color="primary" sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Students</Typography>
                      <Typography variant="h6" fontWeight="bold">{course.studentsCount.toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: theme.palette.background.paper,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        minHeight: 120
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 207,
                          height: 40,
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <PersonIcon color="primary" sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Instructor</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {course.instructorName}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Tabs for course content, quizzes, resources */}
              <Box sx={{ mb: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="scrollable" 
                  scrollButtons="auto"
                  sx={{ 
                    mb: 3,
                    '& .MuiTab-root': {
                      minWidth: 255,
                      fontWeight: 600,
                    },
                    '& .Mui-selected': {
                      color: theme.palette.secondary.main,
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: theme.palette.secondary.main,
                      height: 3,
                      borderRadius: 1.5
                    }
                  }}
                >
                  <Tab icon={<DescriptionIcon />} label="About" iconPosition="start" />
                  <Tab icon={<OndemandVideoIcon />} label="Videos" iconPosition="start" />
                  <Tab icon={<AssignmentIcon />} label="Quizzes" iconPosition="start" />
                  <Tab icon={<ArticleIcon />} label="Resources" iconPosition="start" />
                </Tabs>
                
                {/* About Tab */}
                {activeTab === 0 && (
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight="medium">About this course</Typography>
                    
                    {/* Convert HTML string to React elements */}
                    <Box dangerouslySetInnerHTML={{ __html: course.longDescription }} />
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="h6" gutterBottom>Course Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Created on</Typography>
                          <Typography variant="body2">{new Date(course.creationDate).toLocaleDateString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Last updated</Typography>
                          <Typography variant="body2">{new Date(course.lastUpdated).toLocaleDateString()}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Category</Typography>
                          <Typography variant="body2">{course.category}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>Difficulty</Typography>
                          <Typography variant="body2">{course.difficulty}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={course.instructorAvatar} 
                        alt={course.instructorName}
                        sx={{ width: 64, height: 64, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">{course.instructorName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.instructorBio}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}
                
                {/* Videos Tab */}
                {activeTab === 1 && (
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight="medium">Course Content</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {course.totalVideos} videos • Total {course.totalDuration}
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      {course.videos.map((video, index) => (
                        <VideoListItem 
                          key={video.id}
                          video={video}
                          index={index}
                          isCompleted={video.completed}
                          isLocked={!userProgress && index > 1} // Lock videos if not enrolled (except first 2)
                          isActive={currentVideo && currentVideo.id === video.id}
                          onVideoClick={handleVideoClick}
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
                
                {/* Quizzes Tab */}
                {activeTab === 2 && (
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight="medium">Course Quizzes</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Test your knowledge and earn certificates
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      {course.quizzes.map((quiz, index) => (
                        <Paper
                          key={quiz.id}
                          elevation={1}
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: 3,
                              transform: userProgress ? 'translateY(-2px)' : 'none',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex' }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">{quiz.title}</Typography>
                              <Typography variant="body2" color="text.secondary">{quiz.description}</Typography>
                            </Box>
                            
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              disabled={!userProgress}
                              onClick={() => handleQuizClick(quiz.id)}
                              sx={{ alignSelf: 'center' }}
                            >
                              Take Quiz
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                    
                    {!userProgress && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Enroll in the course to access quizzes and earn certificates.
                      </Alert>
                    )}
                  </Paper>
                )}
                
                {/* Resources Tab */}
                {activeTab === 3 && (
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight="medium">Course Resources</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Downloadable materials and additional content
                    </Typography>
                    
                    <Box sx={{ mt: 3 }}>
                      {course.resources.map((resource) => (
                        <Paper
                          key={resource.id}
                          elevation={1}
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: 3,
                              transform: userProgress ? 'translateY(-2px)' : 'none',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex' }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">{resource.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {resource.type} • {resource.size}
                              </Typography>
                            </Box>
                            
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              disabled={!userProgress}
                              sx={{ alignSelf: 'center' }}
                            >
                              Download
                            </Button>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                    
                    {!userProgress && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Enroll in the course to access downloadable resources.
                      </Alert>
                    )}
                  </Paper>
                )}
              </Box>
            </Grid>
            
            {/* Right Column - Enrollment/Progress */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Grid container spacing={3}>
                  {/* Enrollment Card */}
                  <Grid item xs={12} sm={6} md={12}>
                    <Paper 
                      elevation={4} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        overflow: 'hidden',
                        position: 'relative',
                        height: {xs: 'auto', md: '350px'},
                        display: 'flex',
                        flexDirection: 'column',
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.secondary.dark, 0.2)})`
                          : theme.palette.background.paper,
                        boxShadow: theme.palette.mode === 'dark'
                          ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`
                          : '0 8px 32px rgba(0,0,0,0.1)',
                        border: theme.palette.mode === 'dark'
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          : 'none',
                        animation: 'fadeInUp 0.5s ease-out',
                        '@keyframes fadeInUp': {
                          '0%': { opacity: 0, transform: 'translateY(20px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' }
                        }
                      }}
                    >
                      {userProgress ? (
                        <>
                          <Typography variant="h6" gutterBottom>Your Progress</Typography>
                          
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Completion</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {Math.round(userProgress.completionPercentage)}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={userProgress.completionPercentage} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 2,
                                mb: 1,
                                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
                                backgroundSize: '40px 40px',
                                animation: 'progressAnimation 2s linear infinite',
                                '@keyframes progressAnimation': {
                                  '0%': {
                                    backgroundPosition: '0 0'
                                  },
                                  '100%': {
                                    backgroundPosition: '40px 0'
                                  }
                                },
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                }
                              }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {course.videos.filter(v => v.completed).length} of {course.totalVideos} videos completed
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="subtitle1" gutterBottom>
                            Continue Learning
                          </Typography>
                          
                          {userProgress.lastWatchedVideo && (
                            <Box sx={{ mb: 3 }}>
                              <Paper 
                                elevation={1}
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 2,
                                  mb: 2,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                                    zIndex: 0
                                  }
                                }}
                              >
                                <Typography variant="subtitle2" gutterBottom>
                                  {userProgress.lastWatchedVideo.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTimeIcon sx={{ fontSize: '0.875rem', mr: 0.5, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {userProgress.lastWatchedVideo.duration}
                                    </Typography>
                                  </Box>
                                  
                                  <IconButton size="small" color="primary">
                                    <PlayCircleOutlineIcon />
                                  </IconButton>
                                </Box>
                              </Paper>
                            </Box>
                          )}
                          
                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleContinueLearning}
                            sx={{ 
                              py: 1.5,
                              borderRadius: 2,
                              mt: 'auto',
                              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                              },
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '-50%',
                                left: '-50%',
                                right: '-50%',
                                bottom: '-50%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                transform: 'scale(0)',
                                transition: 'transform 0.5s ease-out',
                              },
                              '&:hover::after': {
                                transform: 'scale(1)'
                              }
                            }}
                          >
                            Continue Learning
                          </Button>
                        </>
                      ) : (
                        <>
                          <Typography variant="h6" gutterBottom fontWeight="bold">Enroll in this Course</Typography>
                          
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2">
                              Get full access to all videos, quizzes, and downloadable resources.
                            </Typography>
                          </Box>
                          
                          <List sx={{ mb: 'auto' }}>
                            <ListItem sx={{ p: 0, mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Full lifetime access" 
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                            
                            <ListItem sx={{ p: 0, mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Access on mobile and desktop" 
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                            
                            <ListItem sx={{ p: 0, mb: 1 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="NFT completion reward" 
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          </List>
                          
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            startIcon={<HowToRegIcon />}
                            onClick={handleEnroll}
                            sx={{ 
                              py: 1.5,
                              borderRadius: 2,
                              mt: 'auto',
                              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                              },
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '-50%',
                                left: '-50%',
                                right: '-50%',
                                bottom: '-50%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                                transform: 'scale(0)',
                                transition: 'transform 0.5s ease-out',
                              },
                              '&:hover::after': {
                                transform: 'scale(1)'
                              }
                            }}
                          >
                            Enroll Now
                          </Button>
                          
                          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                            First 2 videos available as preview
                          </Typography>
                        </>
                      )}
                      
                      {/* Background decoration */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -30,
                          right: -30,
                          width: 150,
                          height: 150,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
                          zIndex: 0
                        }}
                      />
                    </Paper>
                  </Grid>
                  
                  {/* What You'll Learn Card */}
                  <Grid item xs={12} sm={6} md={12}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        position: 'relative',
                        overflow: 'hidden',
                        height: {xs: 'auto', md: '350px'},
                        display: 'flex',
                        flexDirection: 'column',
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`
                          : theme.palette.background.paper,
                        backdropFilter: 'blur(10px)',
                        borderLeft: `4px solid ${theme.palette.secondary.main}`,
                        animation: 'fadeInUp 0.5s ease-out 0.2s both',
                        '@keyframes fadeInUp': {
                          '0%': { opacity: 0, transform: 'translateY(20px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' }
                        }
                      }}
                    >
                      <Typography variant="h6" gutterBottom fontWeight="bold">What You'll Learn</Typography>
                      
                      <List disablePadding dense sx={{ flex: 1 }}>
                        {['Understand blockchain fundamentals', 
                          'Learn about different consensus mechanisms', 
                          'Explore real-world blockchain use cases', 
                          'Understand smart contracts and dApps', 
                          'Gain insights into the future of blockchain'].map((item, index) => (
                          <ListItem 
                            key={index} 
                            disablePadding 
                            sx={{ 
                              mb: 1.5,
                              opacity: 0,
                              animation: `fadeInRight 0.5s ease forwards ${0.3 + index * 0.1}s`,
                              '@keyframes fadeInRight': {
                                '0%': { opacity: 0, transform: 'translateX(-20px)' },
                                '100%': { opacity: 1, transform: 'translateX(0)' }
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleIcon sx={{ color: theme.palette.secondary.main }} fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={item} 
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      
                      {/* Background decorations */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -30,
                          right: -30,
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)}, transparent 70%)`,
                          zIndex: 0
                        }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}