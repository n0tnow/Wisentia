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
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '@/contexts/AuthContext';
import GlowingStarsBackground from '@/components/GlowingStarsBackground';
import React from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import Link from 'next/link';

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

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main CourseDetail component
export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId;
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();
  
  // State variables
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    isEnrolled: false,
    isLoading: true
  });
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [videoProgress, setVideoProgress] = useState({});
  const [noQuizzesMessage, setNoQuizzesMessage] = useState(null);
  const [orderedContent, setOrderedContent] = useState([]); // Add state for ordered content
  
  // Fetch course data
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get auth token
        const token = getToken();
        if (!token) {
          console.warn('No authentication token available');
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }

        // Add cache busting timestamp
        const timestamp = new Date().getTime();
        console.log(`Fetching course details for courseId: ${courseId}, cache buster: ${timestamp}`);
        
        // Make API request with proper authorization header
        const apiUrl = `/api/courses/${courseId}/?t=${timestamp}`;
        console.log(`Making request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        
        const data = await response.json();
        console.log('Course API response:', data); // Debug log
        
        // Normalize data structure to handle different API response formats
        const normalizedData = {
          ...data,
          id: data.id || data.CourseID,
          title: data.title || data.Title,
          description: data.description || data.Description,
          longDescription: data.longDescription || data.LongDescription,
          category: data.category || data.Category,
          difficulty: data.difficulty || data.Difficulty,
          instructorName: data.instructorName || data.InstructorName,
          instructorBio: data.instructorBio || data.InstructorBio,
          instructorAvatar: data.instructorAvatar || data.InstructorAvatar,
          rating: data.rating || data.Rating || 0,
          totalVideos: data.TotalVideos || data.totalVideos || (data.videos ? data.videos.length : 0),
          
          // Ensure enrollment count is processed from all possible property names
          studentsCount: processEnrollmentCount(data),
          
          creationDate: data.creationDate || data.CreationDate || new Date().toISOString(),
          lastUpdated: data.lastUpdated || data.LastUpdated || new Date().toISOString(),
          formattedDuration: data.formattedDuration || 'N/A',
          thumbnailURL: data.thumbnailURL || data.ThumbnailURL || '/images/course-default.jpg', // Add default image
          
          // Ensure videos array is properly defined with consistent properties
          videos: Array.isArray(data.videos) ? data.videos.map(video => ({
            ...video,
            id: video.id || video.VideoID, // Ensure id is always available
            VideoID: video.VideoID || video.id, // Ensure VideoID is always available
            title: video.title || video.Title || 'Untitled Video',
            duration: video.duration || video.Duration || '0:00',
            completed: video.completed || false,
            is_free: video.is_free || false
          })) : [],
          
          // Ensure quizzes array is properly defined
          quizzes: Array.isArray(data.quizzes) ? data.quizzes : [],
          
          // Ensure resources array is properly defined
          resources: Array.isArray(data.resources) ? data.resources : []
        };
        
        // Debug the enrollment count
        console.log("Student count being set to:", normalizedData.studentsCount);
        
        // Format duration if available but not already formatted
        if (!normalizedData.formattedDuration && data.totalDuration) {
          const hours = Math.floor(data.totalDuration / 3600);
          const minutes = Math.floor((data.totalDuration % 3600) / 60);
          normalizedData.formattedDuration = hours > 0 
            ? `${hours}h ${minutes}m`
            : `${minutes}m`;
        }
        
        setCourse(normalizedData);
        
        // If there are videos, set the first video as current
        if (normalizedData.videos && normalizedData.videos.length > 0) {
          setCurrentVideo(normalizedData.videos[0]);
        }
        
        // If user is authenticated, fetch enrollment status
        if (isAuthenticated) {
          fetchEnrollmentStatus();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch course details:', error);
        setError('Failed to load course details. Please try again later.');
        setLoading(false);
      }
    };
    
    // Helper function to process enrollment count from different property names
    const processEnrollmentCount = (data) => {
      const possibleProperties = ['studentsCount', 'StudentCount', 'EnrolledUsers', 'enrolledUsers', 'enrolled_users'];
      
      // Check all possible property names
      for (const prop of possibleProperties) {
        if (data[prop] !== undefined && data[prop] !== null) {
          const count = parseInt(data[prop], 10);
          if (!isNaN(count)) {
            console.log(`Found enrollment count in property '${prop}': ${count}`);
            return count;
          }
        }
      }
      
      // Default to 0 if not found
      console.log("No valid enrollment count found in data, defaulting to 0");
      return 0;
    };
    
    const fetchEnrollmentStatus = async () => {
      try {
        console.log(`Fetching enrollment status for course ID: ${courseId}`);
        
        // Get fresh token
        let token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No access token found, skipping enrollment check');
          return;
        }
        
        // Check if the token might be expired
        try {
          // Simple token expiration check - parse JWT payload
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            
            // If token is expired or about to expire in the next minute, try to refresh
            if (Date.now() > expiryTime - 60000) {
              console.log('Token appears to be expired or about to expire, attempting refresh before enrollment');
              
              // Try to refresh the token
              const refreshResponse = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  refresh_token: localStorage.getItem('refresh_token')
                })
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.access) {
                  console.log('Token successfully refreshed for enrollment');
                  localStorage.setItem('access_token', refreshData.access);
                  // Update token variable with new token
                  token = refreshData.access;
                }
              } else {
                console.warn('Failed to refresh token for enrollment, will attempt with existing token');
              }
            }
          }
        } catch (tokenError) {
          console.warn('Error checking token expiration during enrollment:', tokenError);
          // Continue with existing token
        }
        
        // Make the API call with proper headers
        const response = await fetch(`/api/courses/enrollment/status/${courseId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        
        console.log(`Enrollment status response: ${response.status}`);
        
        // Handle specific error cases
        if (response.status === 401 || response.status === 403) {
          console.warn(`User not authenticated for enrollment check: ${response.status}`);
          
          // If we get an auth error, try redirecting to login
          if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login page');
            setEnrollmentStatus({ isEnrolled: false, isLoading: false });
            return;
          }
          
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch enrollment status: ${response.status}, Error: ${errorText}`);
          return;
        }
        
        const data = await response.json();
        console.log('Enrollment status data:', data);
        
        setEnrollmentStatus({
          isEnrolled: data.is_enrolled,
          isLoading: false
        });
        
        if (data.is_enrolled && data.progress) {
          // Set user progress if enrolled
          setUserProgress({
            completionPercentage: data.progress.completion_percentage || 0,
            lastWatchedVideo: data.progress.last_video,
            isCompleted: data.progress.is_completed || false,
            lastAccessed: data.progress.last_accessed || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Failed to fetch enrollment status:', error);
        // Don't update state on error, keep default values
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
    // Safely find the video
    if (!course?.videos || !Array.isArray(course.videos)) {
      console.error('No videos available');
      return;
    }
    
    const video = course.videos.find(v => (v.VideoID === videoId || v.id === videoId));
    
    if (!video) {
      console.error(`Video with ID ${videoId} not found`);
      return;
    }
    
    // If user is not enrolled and the video is not free, prompt to enroll
    if (!enrollmentStatus.isEnrolled && !(video.is_free || video.IsFree)) {
      alert('You need to enroll in this course to watch this video');
      return;
    }
    
    // Set current video and navigate to video page
    setCurrentVideo(video);
    // Ensure we use the correct ID - prefer VideoID if available
    const navigateId = video.VideoID || video.id;
    router.push(`/courses/${courseId}/videos/${navigateId}`);
  };
  
  // Handle quiz click
  const handleQuizClick = (quizId) => {
    // Check if user is enrolled
    if (!enrollmentStatus.isEnrolled) {
      alert('You need to enroll in this course to take the quiz');
      return;
    }
    
    // Navigate to quiz page
    router.push(`/quizzes/${quizId}`);
  };
  
  // Handle enroll
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    setEnrollmentStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Get token and check if it's expired
      let token = localStorage.getItem('access_token');
      
      // Simple token expiration check - parse JWT payload
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiryTime = payload.exp * 1000; // Convert to milliseconds
          
          // If token is expired or about to expire in the next minute, try to refresh
          if (Date.now() > expiryTime - 60000) {
            console.log('Token appears to be expired or about to expire, attempting refresh before enrollment');
            
            // Try to refresh the token
            const refreshResponse = await fetch('/api/auth/refresh-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                refresh_token: localStorage.getItem('refresh_token')
              })
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.access) {
                console.log('Token successfully refreshed for enrollment');
                localStorage.setItem('access_token', refreshData.access);
                // Update token variable with new token
                token = refreshData.access;
              }
            } else {
              console.warn('Failed to refresh token for enrollment, will attempt with existing token');
            }
          }
        }
      } catch (tokenError) {
        console.warn('Error checking token expiration during enrollment:', tokenError);
        // Continue with existing token
      }
      
      const response = await fetch(`/${courseId}/enroll/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        // Handle auth errors
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication error during enrollment, redirecting to login');
          router.push('/login');
          return;
        }
        
        throw new Error('Failed to enroll in course');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update enrollment status
        setEnrollmentStatus({
          isEnrolled: true,
          isLoading: false
        });
        
        // Set initial progress
        setUserProgress({
          completionPercentage: 0,
          lastWatchedVideo: course.videos && course.videos.length > 0 ? course.videos[0] : null,
          isCompleted: false,
          lastAccessed: new Date().toISOString()
        });
        
        // Show success message
        alert('Successfully enrolled in course!');
      } else {
        throw new Error(data.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll in course. Please try again later.');
      setEnrollmentStatus(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Handle continue learning
  const handleContinueLearning = () => {
    if (userProgress && userProgress.lastWatchedVideo) {
      // Set current video to last watched and navigate to video page
      setCurrentVideo(userProgress.lastWatchedVideo);
      const videoId = userProgress.lastWatchedVideo.VideoID || userProgress.lastWatchedVideo.id;
      if (videoId) {
        router.push(`/courses/${courseId}/videos/${videoId}`);
      } else {
        console.error('Invalid video ID for last watched video');
      }
    } else if (course && course.videos && course.videos.length > 0) {
      // Start from the beginning
      const firstVideo = course.videos[0];
      const videoId = firstVideo.VideoID || firstVideo.id;
      if (videoId) {
        router.push(`/courses/${courseId}/videos/${videoId}`);
      } else {
        console.error('Invalid video ID for first video');
      }
    } else {
      console.error('No videos available to continue learning');
    }
  };
  
  // Add a refresh function to manually reload course data
  const refreshCourseData = async () => {
    console.log("Manually refreshing course data");
    await fetchCourseDetails();
    if (isAuthenticated) {
      await fetchEnrollmentStatus();
    }
  };
  
  // Get authentication token
  const getToken = () => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.warn('No access token found in localStorage');
          return null;
        }
        return token; // Return just the token, not with 'Bearer '
      }
      return null;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  };
  
  // Add a function to fetch quizzes for the course
  const fetchCourseQuizzes = async () => {
    if (!course?.CourseID || !isAuthenticated) return;
    
    setLoading(true); // Set loading state when fetching begins
    setError(null); // Clear any previous errors
    
    try {
      // Get the auth token
      const token = getToken();
      if (!token) {
        console.warn("Authentication token not available");
        setLoading(false);
        setError("Authentication error. Please log in again.");
        return;
      }
      
      // Add cache busting parameter
      const timestamp = new Date().getTime();
      const apiUrl = `/api/courses/${course.CourseID}/quizzes?_=${timestamp}`;
      console.log(`Fetching quizzes from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      console.log(`Quiz API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Error fetching course quizzes';
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.detail || errorMessage;
          console.error('Error fetching course quizzes from backend:', errorMessage);
        } catch {
          // If not JSON, use text
          console.error('Error fetching course quizzes from backend:', errorText);
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log(`Successfully fetched ${data.quizzes?.length || 0} quizzes for course ${course.CourseID}`);
      
      // Set course quizzes
      if (data.quizzes && Array.isArray(data.quizzes)) {
        // Separate video-specific and course-level quizzes
        const videoQuizzes = data.quizzes.filter(quiz => quiz.VideoID);
        const courseLevelQuizzes = data.quizzes.filter(quiz => !quiz.VideoID);
        
        setCourseQuizzes({
          videoQuizzes,
          courseLevelQuizzes
        });
        
        console.log(`Found ${videoQuizzes.length} video-specific quizzes and ${courseLevelQuizzes.length} course-level quizzes`);
      }
      
      // Set ordered content if available
      if (data.orderedContent && Array.isArray(data.orderedContent)) {
        console.log(`Retrieved ordered content with ${data.orderedContent.length} items`);
        setOrderedContent(data.orderedContent);
      } else {
        // If not available, create a simple ordered list of just videos
        if (course?.videos && Array.isArray(course.videos)) {
          const simpleOrdered = course.videos.map(video => ({
            ...video,
            type: 'video'
          }));
          setOrderedContent(simpleOrdered);
        } else {
          setOrderedContent([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load course quizzes. Please try again later.');
      setLoading(false);
    }
  };

  // Add to useEffect when course details are loaded
  useEffect(() => {
    if (course?.CourseID) {
      fetchCourseQuizzes();
      fetchVideoProgress();
    }
  }, [course]);

  // Add a function to fetch user's video progress
  const fetchVideoProgress = async () => {
    if (!course?.CourseID || !isAuthenticated) return;
    
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`/api/courses/${course.CourseID}/progress`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Video progress data:', data);
        
        if (data.videoProgress) {
          // Convert to a more usable format: { videoId: { watchedPercentage, isCompleted } }
          const progressMap = {};
          data.videoProgress.forEach(item => {
            progressMap[item.VideoID] = {
              watchedPercentage: item.WatchedPercentage || 0,
              isCompleted: item.IsCompleted || false,
              lastPosition: item.LastPosition || 0
            };
          });
          
          setVideoProgress(progressMap);
        }
      } else {
        console.warn('Failed to fetch video progress:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching video progress:', error);
    }
  };

  // Add a CourseQuiz component to display quizzes
  const CourseQuiz = ({ quiz, videoProgress }) => {
    const theme = useTheme();
    const router = useRouter();
    
    // Improved access logic with better null and undefined checks
    const canAccess = React.useMemo(() => {
      // Course level quiz is always accessible
      if (!quiz.VideoID) return true;
      
      // If videoProgress is null (temporary database issue) allow quiz access
      if (!videoProgress) return true;
      
      // If videoProgress object is empty, allow quiz access
      if (typeof videoProgress !== 'object' || Object.keys(videoProgress).length === 0) return true;
      
      // Check if video progress exists
      const videoData = videoProgress[quiz.VideoID];
      if (!videoData) return true; // If no data for this video, allow access
      
      // Check if video is completed or watched more than 90%
      return videoData.isCompleted || videoData.watchedPercentage >= 90;
    }, [quiz.VideoID, videoProgress]);
    
    const handleTakeQuiz = () => {
      if (!canAccess) return;
      router.push(`/quizzes/${quiz.QuizID}`);
    };
    
    // Get video title if associated with a video
    const videoTitle = quiz.VideoID && course?.videos?.length > 0
      ? course.videos.find(v => v.VideoID === quiz.VideoID)?.Title || 'Related Video'
      : null;
    
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
          '&:hover': {
            transform: canAccess ? theme.shadows[4] : theme.shadows[2],
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {quiz.Title}
              </Typography>
            
            {videoTitle && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Related to: {videoTitle}
            </Typography>
            )}
            
            <Typography variant="body2" color="text.secondary">
              {quiz.Description || 'Test your knowledge with this quiz.'}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<AssignmentIcon />}
                label={`${quiz.QuestionCount || 0} Questions`}
                size="small"
                color="primary"
                variant="outlined"
              />
            
              {quiz.PassingScore && (
              <Chip
                  icon={<SchoolIcon />}
                  label={`Passing Score: ${quiz.PassingScore}%`}
                size="small"
                  color="secondary"
                  variant="outlined"
              />
              )}
              
              {quiz.Score && (
              <Chip
                  icon={<EmojiEventsIcon />}
                  label={`Your Score: ${quiz.Score}%`}
                size="small"
                  color={quiz.Score >= quiz.PassingScore ? 'success' : 'error'}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleTakeQuiz}
            disabled={!canAccess}
            startIcon={<QuizIcon />}
            sx={{
              minWidth: 120,
              opacity: canAccess ? 1 : 0.7,
            }}
          >
            {quiz.Score ? 'Retake Quiz' : 'Take Quiz'}
          </Button>
        </Box>
        
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
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(2px)',
            }}
          >
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <LockIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Complete the video first to unlock this quiz
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    );
  };

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
              {/* Course header - Updated to use course banner/thumbnail */}
              <Paper 
                elevation={4} 
                sx={{ 
                  height: 350, // Increased height for better visual impact
                  borderRadius: 3, 
                  mb: 3, 
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage: course.thumbnailURL 
                    ? `url(${course.thumbnailURL})` 
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.secondary.dark, 0.9)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
                    zIndex: 1
                  }
                }}
              >
                {/* Course title overlay - improved contrast and readability */}
                <Box
                  sx={{
                    p: 4, // Increased padding
                    position: 'relative',
                    zIndex: 2, // Ensure content is above the gradient overlay
                  }}
                >
                  <Box sx={{ display: 'flex', mb: 1.5 }}>
                    <Chip 
                      label={course.difficulty} 
                      size="small" 
                      sx={{ 
                        mr: 1, 
                        bgcolor: 
                          course.difficulty === 'Beginner' ? theme.palette.success.main :
                          course.difficulty === 'Intermediate' ? theme.palette.primary.main :
                          theme.palette.secondary.main,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip 
                      label={course.category} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                        color: '#fff' 
                      }}
                    />
                    
                    {/* Add refresh button */}
                    <Box sx={{ ml: 'auto' }}>
                      <Tooltip title="Refresh course data">
                        <IconButton 
                          onClick={refreshCourseData} 
                          disabled={loading}
                          sx={{ 
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            }
                          }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' } // Responsive font size
                    }}
                  >
                    {course.title}
                  </Typography>
                  
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      maxWidth: '80%',
                      mb: 1.5
                    }}
                  >
                    {course.description}
                  </Typography>
                  
                  {/* Added instructor info in banner */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Avatar 
                      src={course.instructorAvatar} 
                      alt={course.instructorName}
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        mr: 1,
                        border: '2px solid white'
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      Instructor: <Box component="span" sx={{ fontWeight: 'bold' }}>{course.instructorName}</Box>
                    </Typography>
                  </Box>
                </Box>
                
                {/* Play button overlay - Improved design */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  <IconButton
                    onClick={() => course?.videos && course.videos.length > 0 && handleVideoClick(course.videos[0].VideoID)}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      p: 2.5,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 0 20px rgba(255,255,255,0.5)'
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 0 15px rgba(0,0,0,0.3)'
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 54, color: '#fff' }} />
                  </IconButton>
                </Box>
              </Paper>
              
              {/* Course stats - Updated design with equal dimensions */}
              <Box sx={{ 
                mb: 4,
                display: 'flex',
                width: '100%'
              }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid item xs={3}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 3,
                        height: '100%',
                        minHeight: 140,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <VideoLibraryIcon color="primary" sx={{ fontSize: 26 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Videos</Typography>
                      <Typography variant="h6" fontWeight="bold">{course.totalVideos}</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 3,
                        height: '100%',
                        minHeight: 140,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <AccessTimeIcon color="primary" sx={{ fontSize: 26 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Duration</Typography>
                      <Typography variant="h6" fontWeight="bold">{course.formattedDuration}</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 3,
                        height: '100%',
                        minHeight: 140,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <SchoolIcon color="primary" sx={{ fontSize: 26 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Students</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {loading ? (
                          <Skeleton width={40} />
                        ) : (
                          /* Display enrollment count with better parsing */
                          typeof course?.studentsCount === 'number' 
                            ? course.studentsCount.toLocaleString() 
                            : parseInt(course?.studentsCount || '0', 10).toLocaleString()
                        )}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        borderRadius: 3,
                        height: '100%',
                        minHeight: 140,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.09)'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 1,
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      >
                        <PersonIcon color="primary" sx={{ fontSize: 26 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>Instructor</Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {course.instructorName}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Tabs for course content - improved styling */}
              <Box sx={{ mb: 3 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  variant="scrollable" 
                  scrollButtons="auto"
                  sx={{ 
                    mb: 3,
                    '& .MuiTab-root': {
                      minWidth: { xs: 'auto', sm: 150 },
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      px: 3,
                      py: 1.5,
                      borderRadius: '50px',
                      mx: 0.5,
                      transition: 'all 0.2s'
                    },
                    '& .Mui-selected': {
                      color: theme.palette.secondary.main,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1)
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none' // Hide the default indicator
                    }
                  }}
                >
                  <Tab icon={<DescriptionIcon sx={{ fontSize: 20 }} />} label="About" iconPosition="start" />
                  <Tab icon={<OndemandVideoIcon sx={{ fontSize: 20 }} />} label="Videos" iconPosition="start" />
                  <Tab icon={<AssignmentIcon sx={{ fontSize: 20 }} />} label="Quizzes" iconPosition="start" />
                  <Tab icon={<ArticleIcon sx={{ fontSize: 20 }} />} label="Resources" iconPosition="start" />
                </Tabs>
                
                {/* Updated Paper style for all tabs */}
                {activeTab === 0 && (
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: { xs: 2, sm: 3, md: 4 },
                      borderRadius: 3,
                      animation: 'fadeIn 0.5s ease-in-out',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      },
                      boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                      background: alpha(theme.palette.background.paper, 0.7),
                      backdropFilter: 'blur(10px)',
                      minHeight: 400, // Fixed min height
                    }}
                  >
                    <Typography variant="h5" gutterBottom fontWeight="medium" color={theme.palette.primary.main}>About this course</Typography>
                    
                    {/* Convert HTML string to React elements */}
                    <Box dangerouslySetInnerHTML={{ __html: course.longDescription || '<p>No description available for this course yet.</p>' }} sx={{ 
                      lineHeight: 1.7,
                      '& p': { mb: 2 },
                      '& ul, & ol': { pl: 3, mb: 2 },
                      '& li': { mb: 1 },
                    }} />
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="h6" gutterBottom color={theme.palette.primary.main}>Course Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>Created on</Typography>
                          <Typography variant="body2">{new Date(course.creationDate).toLocaleDateString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>Last updated</Typography>
                          <Typography variant="body2">{new Date(course.lastUpdated).toLocaleDateString()}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>Category</Typography>
                          <Typography variant="body2">{course.category}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>Difficulty</Typography>
                          <Typography variant="body2">{course.difficulty}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.4),
                    }}>
                      <Avatar 
                        src={course.instructorAvatar} 
                        alt={course.instructorName}
                        sx={{ width: 70, height: 70, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" color={theme.palette.primary.main}>{course.instructorName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mt: 0.5 }}>
                          {course.instructorBio || 'Expert instructor with experience in this subject.'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}

                {/* Course Content Tab */}
                {activeTab === 1 && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Course Content 
                      {course.videos && (
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({course.videos.length} videos)
                        </Typography>
                      )}
                    </Typography>
                    {enrollmentStatus.isEnrolled ? (
                      <>
                        {/* Progress bar - only show if enrolled */}
                        {userProgress && (
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                Your Progress
                              </Typography>
                              <Typography variant="body2" color="text.primary" fontWeight="medium">
                                {userProgress.completionPercentage || 0}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={userProgress.completionPercentage || 0} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                              }} 
                            />
                          </Box>
                        )}
                        {/* Only videos in orderedContent */}
                        {course.videos && course.videos.length > 0 ? (
                          <Box sx={{ mt: 2 }}>
                            {course.videos.map((video, index) => (
                              <VideoListItem
                                key={video.VideoID || video.id}
                                video={video}
                                index={index}
                                isCompleted={videoProgress[video.VideoID]?.isCompleted}
                                isLocked={false}
                                onVideoClick={handleVideoClick}
                                isActive={currentVideo?.VideoID === video.VideoID}
                              />
                            ))}
                          </Box>
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
                            <InfoIcon color="info" sx={{ fontSize: 40, mb: 2, opacity: 0.6 }} />
                            <Typography variant="body1" color="text.secondary">
                              No videos available for this course yet
                            </Typography>
                          </Paper>
                        )}
                      </>
                    ) : (
                      /* Not enrolled case */
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 4, 
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          background: `linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <LockIcon sx={{ 
                          position: 'absolute', 
                          right: 30, 
                          top: 30, 
                          fontSize: 60, 
                          color: alpha(theme.palette.primary.main, 0.1),
                          transform: 'rotate(10deg)'
                        }} />
                        <Typography variant="h6" gutterBottom>
                          Enroll to Access Course Content
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Enroll in this course to access all videos, quizzes, and resources. Track your progress and earn a certificate upon completion.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleEnroll}
                          disabled={enrollmentStatus.isLoading}
                          startIcon={<SchoolIcon />}
                          sx={{ mt: 1 }}
                        >
                          {enrollmentStatus.isLoading ? 'Processing...' : 'Enroll Now'}
                        </Button>
                      </Paper>
                    )}
                  </Box>
                )}

                {/* Quiz Tab */}
                {activeTab === 2 && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Course Quizzes
                      {courseQuizzes && (
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({(courseQuizzes.videoQuizzes?.length || 0) + (courseQuizzes.courseLevelQuizzes?.length || 0)} quizzes)
                        </Typography>
                      )}
                    </Typography>
                    
                    {enrollmentStatus.isEnrolled ? (
                      <>
                        {/* Course quizzes list */}
                        {courseQuizzes && (courseQuizzes.videoQuizzes?.length > 0 || courseQuizzes.courseLevelQuizzes?.length > 0) ? (
                          <Box sx={{ mt: 2 }}>
                            {/* Video-specific quizzes section */}
                            {courseQuizzes.videoQuizzes && courseQuizzes.videoQuizzes.length > 0 && (
                              <>
                                <Typography variant="subtitle1" fontWeight="medium" color="primary.main" sx={{ mb: 2, mt: 3 }}>
                                  Video Quizzes
                                </Typography>
                                {courseQuizzes.videoQuizzes.map((quiz) => (
                                  <CourseQuiz key={quiz.QuizID} quiz={quiz} videoProgress={videoProgress} />
                                ))}
                              </>
                            )}
                            
                            {/* Course-level quizzes section */}
                            {courseQuizzes.courseLevelQuizzes && courseQuizzes.courseLevelQuizzes.length > 0 && (
                              <>
                                <Typography variant="subtitle1" fontWeight="medium" color="primary.main" sx={{ mb: 2, mt: 3 }}>
                                  Course Quizzes
                                </Typography>
                                {courseQuizzes.courseLevelQuizzes.map((quiz) => (
                                  <CourseQuiz key={quiz.QuizID} quiz={quiz} videoProgress={videoProgress} />
                                ))}
                              </>
                            )}
                          </Box>
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
                            <InfoIcon color="info" sx={{ fontSize: 40, mb: 2, opacity: 0.6 }} />
                            <Typography variant="body1" color="text.secondary">
                              No quizzes available for this course yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Check back later for updates
                            </Typography>
                          </Paper>
                        )}
                      </>
                    ) : (
                      /* Not enrolled case */
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 4, 
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          background: `linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <LockIcon sx={{ 
                          position: 'absolute', 
                          right: 30, 
                          top: 30, 
                          fontSize: 60, 
                          color: alpha(theme.palette.primary.main, 0.1),
                          transform: 'rotate(10deg)'
                        }} />
                        <Typography variant="h6" gutterBottom>
                          Enroll to Access Course Quizzes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Enroll in this course to test your knowledge with quizzes and track your progress.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleEnroll}
                          disabled={enrollmentStatus.isLoading}
                          startIcon={<SchoolIcon />}
                          sx={{ mt: 1 }}
                        >
                          {enrollmentStatus.isLoading ? 'Processing...' : 'Enroll Now'}
                        </Button>
                      </Paper>
                    )}
                  </Box>
                )}
                
                {/* Resources Tab */}
                {activeTab === 3 && (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Course Resources
                    </Typography>
                    
                    {enrollmentStatus.isEnrolled ? (
                      <>
                        {/* Course resources list */}
                        {course.resources && course.resources.length > 0 ? (
                          <Box sx={{ mt: 2 }}>
                            <List>
                              {course.resources.map((resource, index) => (
                                <Paper
                                  key={index}
                                  elevation={1}
                                  sx={{
                                    mb: 2,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: 3
                                    }
                                  }}
                                >
                                  <ListItem
                                    component="a"
                                    href={resource.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                      display: 'flex',
                                      padding: 2,
                                      textDecoration: 'none',
                                      color: 'inherit'
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 56 }}>
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: '50%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                                        }}
                                      >
                                        <ArticleIcon color="primary" />
                                      </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography variant="subtitle1" fontWeight="medium">
                                          {resource.title || resource.name || `Resource ${index + 1}`}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                          {resource.description || "Supplementary material for this course"}
                                        </Typography>
                                      }
                                    />
                                    <Chip
                                      label={resource.type || "Document"}
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        fontWeight: 'medium'
                                      }}
                                    />
                                  </ListItem>
                                </Paper>
                              ))}
                            </List>
                          </Box>
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
                            <FolderOpenIcon color="info" sx={{ fontSize: 40, mb: 2, opacity: 0.6 }} />
                            <Typography variant="body1" color="text.secondary">
                              No resources available for this course yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Check back later for updates
                            </Typography>
                          </Paper>
                        )}
                      </>
                    ) : (
                      /* Not enrolled case */
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 4, 
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          background: `linear-gradient(45deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.9)})`,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <LockIcon sx={{ 
                          position: 'absolute', 
                          right: 30, 
                          top: 30, 
                          fontSize: 60, 
                          color: alpha(theme.palette.primary.main, 0.1),
                          transform: 'rotate(10deg)'
                        }} />
                        <Typography variant="h6" gutterBottom>
                          Enroll to Access Course Resources
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Enroll in this course to access all supplementary materials and resources.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleEnroll}
                          disabled={enrollmentStatus.isLoading}
                          startIcon={<SchoolIcon />}
                          sx={{ mt: 1 }}
                        >
                          {enrollmentStatus.isLoading ? 'Processing...' : 'Enroll Now'}
                        </Button>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
            
            {/* Right Column - Sticky Course Preview */}
            <Grid item xs={12} md={4}>
              {/* Sticky Course Preview Panel içinde sabit kalıyor */}
              <Box
                sx={{
                  position: 'sticky',
                  top: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  maxHeight: 'calc(100vh - 120px)',
                  zIndex: 1,
                  transition: 'all 0.3s ease-in-out',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.85),
                  animation: 'slideInFromRight 0.5s ease-out',
                  '@keyframes slideInFromRight': {
                    '0%': {
                      transform: 'translateX(30px)',
                      opacity: 0,
                    },
                    '100%': {
                      transform: 'translateX(0)',
                      opacity: 1,
                    },
                  },
                  '&:hover': {
                    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                    transform: 'translateY(2px)',
                  }
                }}
              >
                <Box sx={{ 
                  p: 3,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }
                }}>
                  {/* Course Title */}
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1.5 }}>
                    {course?.title}
                  </Typography>
                  
                  {/* Progress indicator - only if enrolled */}
                  {enrollmentStatus.isEnrolled && userProgress && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body1" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body1" color="text.primary" fontWeight="medium">
                          {userProgress.completionPercentage || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={userProgress.completionPercentage || 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }} 
                      />
                    </Box>
                  )}
                  
                  {/* Stats */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 3, 
                    mb: 3, 
                    justifyContent: 'space-between' 
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 1,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}>
                        <VideoLibraryIcon color="primary" />
                      </Box>
                      <Typography variant="body2" fontWeight="medium" align="center">
                        {course?.totalVideos || 0} videos
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 1,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}>
                        <AccessTimeIcon color="primary" />
                      </Box>
                      <Typography variant="body2" fontWeight="medium" align="center">
                        {course?.formattedDuration || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 1,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}>
                        <SchoolIcon color="primary" />
                      </Box>
                      <Typography variant="body2" fontWeight="medium" align="center">
                        {typeof course?.studentsCount === 'number' 
                          ? course.studentsCount.toLocaleString() 
                          : parseInt(course?.studentsCount || '0', 10).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Action Button */}
                  {enrollmentStatus.isEnrolled ? (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      onClick={handleContinueLearning}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<SchoolIcon />}
                      onClick={handleEnroll}
                      disabled={enrollmentStatus.isLoading}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {enrollmentStatus.isLoading ? 'Processing...' : 'Enroll Now'}
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}