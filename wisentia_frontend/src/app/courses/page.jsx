'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Pagination,
  Button,
  Divider,
  Alert,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
  Paper,
  Avatar,
  useMediaQuery,
  Modal,
  Rating,
  Fade,
  Backdrop
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CloseIcon from '@mui/icons-material/Close';

// Course Detail Modal Component
const CourseDetailModal = ({ open, onClose, course, onEnroll }) => {
  const theme = useTheme();
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [durationData, setDurationData] = useState(null);
  const [durationLoading, setDurationLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  
  // Zorluk seviyesine göre renk belirleyen fonksiyon
  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'primary';
      case 'advanced':
        return 'secondary';
      default:
        return 'primary';
    }
  };
  
  // Add a clear handleEnroll function to handle enrollment directly in the modal
  const handleEnroll = async () => {
    if (!course || !course.id || isEnrolled || enrollmentLoading) return;
    
    try {
      setEnrollmentLoading(true);
      setEnrollmentError(null);
      
      // Call the parent onEnroll function which handles the API request
      await onEnroll(course.id);
      
      // If we reach here, the enrollment was successful
      setIsEnrolled(true);
      
      // Show success message
      if (typeof toast !== 'undefined') {
        toast.success('Successfully enrolled in course!');
      }
      
      // Navigate to course page after short delay to allow user to see the toast
      setTimeout(() => {
        router.push(`/courses/${course.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setEnrollmentError(error.message || 'Failed to enroll in course. Please try again.');
      
      if (typeof toast !== 'undefined') {
        toast.error(error.message || 'Failed to enroll in course. Please try again.');
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };
  
  // Load all course data in a single combined fetch  
  useEffect(() => {    
    const fetchAllCourseData = async () => {      
      if (!course || !open) return;            
      
      try {        
        setDetailsLoading(true);        
        setDurationLoading(true);                
        
        // Only check enrollment if there's a valid token        
        const token = localStorage.getItem('access_token');                
        
        // Create an object to hold all our data        
        const allData = {};                
        
        // Use Promise.all to fetch all data in parallel        
        await Promise.all([          
          // 1. Fetch course details          
          fetch(`/api/courses/${course.id}?t=${Date.now()}`, {            
            headers: {              
              'Cache-Control': 'no-cache',              
              'Pragma': 'no-cache',              
              'Expires': '0'            
            },            
            cache: 'no-store'          
          }).then(async (res) => {            
            if (res.ok) {              
              const data = await res.json();              
              allData.courseDetails = data;            
            }          
          }).catch(e => console.error("Error fetching course details:", e)),                    
          
          // 2. Fetch course duration (optional)          
          fetch(`/api/courses/${course.id}/duration`).then(async (res) => {            
            if (res.ok) {              
              const data = await res.json();              
              allData.durationData = data;            
            }          
          }).catch(e => console.error("Error fetching duration:", e)),                    
          
          // 3. Check enrollment status (if user is logged in)          
          token ?             
            fetch(`/api/courses/enrollment/status/${course.id}/`, {              
              headers: { 'Authorization': `Bearer ${token}` },
              cache: 'no-store'            
            }).then(async (res) => {              
              if (res.ok) {                
                const data = await res.json();                
                allData.enrollmentStatus = data;              
              }            
            }).catch(e => console.error("Error checking enrollment:", e))            
            : Promise.resolve()        
        ]);                
        
        // Now update states with all the data we've collected        
        if (allData.courseDetails) {          
          setCourseDetails(allData.courseDetails);        
        }                
        
        if (allData.durationData) {          
          setDurationData(allData.durationData);        
        }                
        
        // Check multiple possible enrollment status flags
        if (allData.enrollmentStatus) {
          console.log('Enrollment status data:', allData.enrollmentStatus);
          
          // Primary check: is_enrolled field - this is the most reliable indicator
          if (allData.enrollmentStatus.is_enrolled === true) {
            console.log('User is enrolled based on is_enrolled flag');
            setIsEnrolled(true);
          } else {
            // Secondary checks for various API response formats
            const isUserEnrolled = !!(
              allData.enrollmentStatus.isEnrolled || 
              allData.enrollmentStatus.enrollment || 
              allData.enrollmentStatus.enrollment_id || 
              allData.enrollmentStatus.progress_id || 
              (allData.enrollmentStatus.progress && allData.enrollmentStatus.progress.completion_percentage !== undefined) ||
              allData.enrollmentStatus.message === 'User already enrolled in this course'
            );
            console.log('Enrollment status check result:', isUserEnrolled);
            setIsEnrolled(isUserEnrolled);
          }        
        } else if (token) {          
          setIsEnrolled(false);        
        }
      } catch (error) {        
        console.error("Error fetching course data:", error);      
      } finally {        
        setDetailsLoading(false);        
        setDurationLoading(false);      
      }    
    };        
    
    fetchAllCourseData();  
  }, [course, open]);
  
  // Add a manual refresh function for course details
  const refreshCourseDetails = async () => {
    if (!course) return;
    
    try {
      setDetailsLoading(true);
      // Force a full refresh with unique timestamp
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/courses/${course.id}?t=${timestamp}&refresh=true`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourseDetails(data);
      }
    } catch (error) {
      console.error("Error refreshing course details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };
  
  // Attach this function to the course detail modal
  useEffect(() => {
    // Automatically refresh data when modal opens
    if (open && course) {
      refreshCourseDetails();
    }
  }, [open, course?.id]);
  
  // Check enrollment status specifically when modal opens
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!open || !course) return;
      setEnrollmentError(null);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsEnrolled(false);
        return;
      }
      try {
        const response = await fetch(`/api/courses/enrollment/status/${course.id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          if (typeof data.is_enrolled === 'boolean') {
            setIsEnrolled(data.is_enrolled);
          } else {
            setEnrollmentError('Could not retrieve enrollment status. Please try again.');
            setIsEnrolled(false);
          }
        } else {
          setEnrollmentError('Could not retrieve enrollment status. Please try again.');
          setIsEnrolled(false);
        }
      } catch (error) {
        setEnrollmentError('Could not retrieve enrollment status. Please try again.');
        setIsEnrolled(false);
      } finally {
        setEnrollmentLoading(false);
      }
    };
    if (open && course) {
      setEnrollmentLoading(true);
      checkEnrollmentStatus();
    }
  }, [open, course?.id]);
  
  if (!course) return null;
  
  // Combine basic course data with detailed data if available
  const displayData = {
    ...course,
    ...courseDetails
  };
  
  // Format duration for display
  const displayDuration = () => {
    // First check if we have dedicated duration data from the API
    if (durationData && durationData.formatted) {
      return durationData.formatted;
    }
    
    // Next check for formatted duration directly from the course details
    if (displayData.formattedDuration) {
      // Don't display "0 minutes" - show something more meaningful
      if (displayData.formattedDuration === "0 minutes") {
        return "Course duration available after enrollment";
      }
      return displayData.formattedDuration;
    }
    
    // If we have totalDuration in seconds, format it
    if (displayData.totalDuration !== undefined) {
      if (displayData.totalDuration === 0) {
        return "Course duration available after enrollment";
      }
      return formatDuration(displayData.totalDuration);
    }
    
    // Fall back to basic course data duration
    if (displayData.duration && displayData.duration !== '-') {
      return displayData.duration;
    }
    
    return "Course duration available after enrollment";
  };
  
  // Format enrollment count for display
  const displayEnrollmentCount = () => {
    // Try all possible property names for enrollment count
    const checkProperties = ['EnrolledUsers', 'enrolledUsers', 'enrolled_users', 'enrolledStudents', 'enrollmentCount'];
    
    let count = 0;
    // Check each possible property name
    for (const prop of checkProperties) {
      if (displayData[prop] !== undefined && displayData[prop] !== null) {
        count = parseInt(displayData[prop], 10);
        console.log(`Found enrollment count in property '${prop}': ${count}`);
        break;
      }
    }
    
    // Ensure we have a valid number
    count = isNaN(count) ? 0 : count;
    
    // Debug logging
    console.log('Course details data:', displayData);
    console.log('Final enrollment count:', count);
    
    return `${count} ${count === 1 ? 'student' : 'students'}`;
  };
  
  // Get video count
  const getVideoCount = () => {
    if (durationData && durationData.videoCount !== undefined) {
      return durationData.videoCount;
    }
    return displayData.videoCount || 0;
  };
  
  // Handle navigation to course content
  const handleViewCourse = () => {
    onClose();
    router.push(`/courses/${course.id}`);
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Fade in={open}>
        <Box sx={{ 
          width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
          maxWidth: 900,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          position: 'relative',
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: alpha('#000', 0.5),
              color: 'white',
              zIndex: 10,
              '&:hover': {
                bgcolor: alpha('#000', 0.7),
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Course Banner Image */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                height: 200,
                background: displayData.thumbnailURL 
                  ? `url(${displayData.thumbnailURL})` 
                  : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            />
            
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
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                  p: 2
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 40, color: '#fff' }} />
              </IconButton>
            </Box>
            
            {/* Course info overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Chip 
                    label={displayData.difficulty} 
                    size="small" 
                    sx={{ 
                      mr: 1, 
                      bgcolor: 
                        displayData.difficulty === 'Beginner' ? theme.palette.success.main :
                        displayData.difficulty === 'Intermediate' ? theme.palette.primary.main :
                        theme.palette.secondary.main,
                      color: 'white'
                    }} 
                  />
                  <Chip 
                    label={displayData.category} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: '#fff' 
                    }} 
                  />
                </Box>
                {displayData.rating !== '-' && (
                  <Rating value={parseFloat(displayData.rating) || 0} precision={0.1} size="small" readOnly />
                )}
              </Box>
            </Box>
          </Box>
          
          {/* Course details */}
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              {displayData.title}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {displayData.description || 'No description available.'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={displayData.instructorAvatar || '/default-avatar.jpg'} 
                alt={displayData.instructorName}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography variant="subtitle2">
                {displayData.instructorName}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Updated stats layout with better spacing and centering */}
            <Grid container spacing={3} sx={{ mb: 3, justifyContent: 'center' }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <AccessTimeIcon color="primary" sx={{ fontSize: 28, mb: 1 }}/>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Duration</Typography>
                  <Typography variant="subtitle2">
                    {durationLoading || detailsLoading 
                      ? <CircularProgress size={16} />
                      : displayDuration()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <VideoLibraryIcon color="primary" sx={{ fontSize: 28, mb: 1 }}/>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Videos</Typography>
                  <Typography variant="subtitle2">
                    {durationLoading || detailsLoading 
                      ? <CircularProgress size={16} /> 
                      : `${getVideoCount()} ${getVideoCount() === 1 ? 'video' : 'videos'}`}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <StarIcon color="warning" sx={{ fontSize: 28, mb: 1 }}/>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Rating</Typography>
                  <Typography variant="subtitle2">
                    {detailsLoading 
                      ? <CircularProgress size={16} /> 
                      : (displayData.rating && displayData.rating !== '-' 
                          ? `${typeof displayData.rating === 'number' 
                              ? displayData.rating.toFixed(1) 
                              : displayData.rating}/5` 
                          : 'Not rated')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <HowToRegIcon color="primary" sx={{ fontSize: 28, mb: 1 }}/>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Enrolled</Typography>
                  <Typography variant="subtitle2">
                    {detailsLoading 
                      ? <CircularProgress size={16} /> 
                      : displayEnrollmentCount()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Debug enrollment status */}
            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Debug: isEnrolled={isEnrolled ? 'true' : 'false'}
              </Typography>
            </Box>
            
            {/* Conditionally display Enroll or View button based on enrollment status */}
            {enrollmentError && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error">{enrollmentError}</Alert>
              </Box>
            )}
            <Button
              variant="contained"
              size="large"
              startIcon={isEnrolled ? <PlayArrowIcon /> : <HowToRegIcon />}
              fullWidth
              onClick={isEnrolled ? handleViewCourse : handleEnroll}
              disabled={enrollmentLoading}
              sx={{
                py: 1.5,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              {enrollmentLoading ? 'Processing...' : (isEnrolled ? 'Continue' : 'Enroll Now')}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// Course card component with border animation
const CourseCard = ({ course, onClick, index = 0 }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determine color based on difficulty
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner':
        return theme.palette.success.main;
      case 'Intermediate':
        return theme.palette.primary.main;
      case 'Advanced':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Format duration from seconds to hours and minutes
  const formatCardDuration = (duration) => {
    // If duration is undefined or null, try to use totalDuration
    if (!duration || duration === '-') {
      if (course.totalDuration !== undefined) {
        duration = course.totalDuration;
      } else {
        return "New";
      }
    }
    
    // Check if duration is already formatted with h/m
    if (typeof duration === 'string' && (duration.includes('h') || duration.includes('m'))) {
      return duration;
    }
    
    // Try to parse as number if it's not already formatted
    try {
      const totalSeconds = parseInt(duration);
      if (isNaN(totalSeconds) || totalSeconds === 0) {
        return "New";
      }
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      } else {
        return "< 1m";
      }
    } catch (e) {
      console.log("Error formatting duration:", e);
      return "New";
    }
  };

  return (
    <Box 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      sx={{
        position: 'relative',
        height: '100%',
        cursor: 'pointer',
        // Border animation container
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -2,
          borderRadius: 3,
          padding: 2,
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main}, 
            ${theme.palette.secondary.main}, 
            ${theme.palette.primary.main}, 
            ${theme.palette.secondary.main})`,
          backgroundSize: '400% 400%',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          animation: 'border-rotate 3s linear infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: 0
        }
      }}
    >
      <Card 
        elevation={hovered ? 8 : 2}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          position: 'relative',
          zIndex: 1,
          maxWidth: '100%'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="div"
            sx={{
              height: 0,
              paddingTop: '56.25%', // 16:9 aspect ratio
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              backgroundImage: course.thumbnailURL 
                ? `url(${course.thumbnailURL})` 
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Difficulty chip */}
          <Chip
            label={course.difficulty}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: alpha(getDifficultyColor(course.difficulty), 0.9),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 20,
              '& .MuiChip-label': { px: 1, py: 0 },
            }}
          />
          
          {/* Category chip */}
          <Chip
            label={course.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: alpha(theme.palette.background.paper, 0.85),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 20,
              '& .MuiChip-label': { px: 1, py: 0 },
            }}
          />
          
          {/* Simple button overlay on hover */}
          {hovered && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                animation: 'fadeIn 0.2s ease forwards',
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 }
                }
              }}
            >
              <IconButton
                size="large"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <PlayArrowIcon fontSize="large" />
              </IconButton>
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ 
          flexGrow: 1, 
          p: 1.5, 
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '180px', // Increased height
        }}>
          <Typography 
            variant="subtitle1" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              fontSize: '0.85rem',
              lineHeight: 1.2,
              height: '2.4rem', // Increased height
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {course.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              height: '4.5rem',  // Increased height (4 lines)
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,  // Increased to 4 lines
              WebkitBoxOrient: 'vertical',
              fontSize: '0.75rem',
            }}
          >
            {course.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={course.instructorAvatar || '/default-avatar.jpg'} 
              alt={course.instructorName || 'Instructor'}
              sx={{ 
                width: 20, 
                height: 20, 
                mr: 0.75,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              noWrap 
              sx={{ 
                maxWidth: '70%',
                fontWeight: 500,
                fontSize: '0.7rem',
              }}
            >
              {course.instructorName || 'Instructor'}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 0.75 }} />
          
          {/* Course stats - improved visibility and formatting */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto', // Push to bottom
            pt: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon 
                color="primary"
                sx={{ 
                  mr: 0.5, 
                  fontSize: '0.8rem',
                }} 
              />
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{ 
                  fontSize: '0.7rem',
                }}
              >
                {formatCardDuration(course.duration)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VideoLibraryIcon 
                color="primary"
                sx={{ 
                  mr: 0.5, 
                  fontSize: '0.8rem',
                }} 
              />
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{ 
                  fontSize: '0.7rem',
                }}
              >
                {course.videoCount} {course.videoCount === 1 ? 'video' : 'videos'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon 
                sx={{ 
                  color: theme.palette.warning.main, 
                  fontSize: '0.8rem', 
                  mr: 0.5,
                }} 
              />
              <Typography 
                variant="body2" 
                fontWeight={500}
                sx={{ 
                  fontSize: '0.7rem',
                }}
              >
                {course.rating === '-' || !course.rating ? 'New' : 
                  typeof course.rating === 'number' ? course.rating.toFixed(1) : 
                  parseFloat(course.rating).toFixed(1)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Scrollable course section component
const ScrollableSection = ({ title, courses, onCourseClick }) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [courses]);
  
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
        
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollButtons, 400);
    }
  };
  
  return (
    <Box 
      sx={{ 
        mb: 4, 
        position: 'relative',
        '&:hover': {
          '& .scroll-buttons': {
            opacity: 1,
          }
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        position: 'relative'
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight={700}
          sx={{ 
            color: theme.palette.primary.main,
            position: 'relative',
            pl: 2,
            fontSize: { xs: '1.2rem', md: '1.4rem' },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 4,
              height: '80%',
              background: theme.palette.primary.main,
              borderRadius: 2
            }
          }}
        >
          {title}
        </Typography>
        
        <Box 
          className="scroll-buttons"
          sx={{ 
            ml: 'auto', 
            display: 'flex', 
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
          }}
        >
          <IconButton 
            onClick={() => scroll('left')} 
            disabled={!canScrollLeft}
            size="small"
            sx={{ 
              color: canScrollLeft ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.3),
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={() => scroll('right')} 
            disabled={!canScrollRight}
            size="small"
            sx={{ 
              ml: 1,
              color: canScrollRight ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.3),
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          display: 'flex', 
          overflowX: 'auto',
          pb: 2,
          gap: 2,
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            display: 'none', // Webkit browsers
          },
          msOverflowStyle: 'none', // IE ve Edge için - DÜZELTILDI: kebab-case yerine camelCase kullanın
          position: 'relative',
        }}
        onScroll={checkScrollButtons}
      >
        {courses.map((course, index) => (
          <Box 
            key={course.id} 
            sx={{ 
              minWidth: { xs: '220px', sm: '240px', md: '280px' }, // Increased card width
              maxWidth: { xs: '220px', sm: '240px', md: '280px' },
              flexShrink: 0
            }}
          >
            <CourseCard
              course={course} 
              onClick={() => onCourseClick(course.id)} 
              index={index}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Animated background with glowing stars effect
const GlowingStarsBackground = () => {
  const theme = useTheme();
  
  // Use useEffect to handle the dynamic aspects after initial render
  const [starsGenerated, setStarsGenerated] = useState(false);
  const backgroundRef = useRef(null);
  
  // Generate star positions and animations only on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && backgroundRef.current && !starsGenerated) {
      // Clear any existing stars
      while (backgroundRef.current.firstChild) {
        backgroundRef.current.removeChild(backgroundRef.current.firstChild);
      }
      
      // Add small stars
      for (let i = 0; i < 70; i++) {
        const star = document.createElement('div');
        star.className = `star MuiBox-root`;
        star.style.position = 'absolute';
        star.style.width = Math.random() < 0.7 ? '1px' : '2px';
        star.style.height = star.style.width;
        star.style.backgroundColor = i % 5 === 0 ? theme.palette.secondary.main : theme.palette.primary.main;
        star.style.borderRadius = '50%';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animation = `twinkle-${i % 3} ${2 + Math.random() * 4}s infinite ease-in-out`;
        star.style.opacity = 0.6 + Math.random() * 0.4;
        backgroundRef.current.appendChild(star);
      }
      
      // Add larger glow stars
      for (let i = 0; i < 20; i++) {
        const size = 1 + Math.random() * 2;
        const glowStar = document.createElement('div');
        glowStar.className = `glow-star MuiBox-root`;
        glowStar.style.position = 'absolute';
        glowStar.style.width = `${size}px`;
        glowStar.style.height = `${size}px`;
        glowStar.style.backgroundColor = i % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main;
        glowStar.style.borderRadius = '50%';
        glowStar.style.boxShadow = i % 2 === 0 
          ? `0 0 ${5 + Math.random() * 10}px ${theme.palette.primary.main}`
          : `0 0 ${5 + Math.random() * 10}px ${theme.palette.secondary.main}`;
        glowStar.style.top = `${Math.random() * 100}%`;
        glowStar.style.left = `${Math.random() * 100}%`;
        glowStar.style.animation = `pulse-${i % 5} ${4 + Math.random() * 6}s infinite alternate`;
        backgroundRef.current.appendChild(glowStar);
      }
      
      setStarsGenerated(true);
    }
  }, [theme, starsGenerated]);
  
  return (
    <Box
      ref={backgroundRef}
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
    />
  );
};

// Main Courses Page Component
export default function CoursesPage() {
  const router = useRouter();
  const theme = useTheme();
  
  // State for courses data and filters
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for course detail modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Categories and difficulties - will be populated from API data
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState(['Beginner', 'Intermediate', 'Advanced']);
  
  // Fetch courses from API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (category) queryParams.append('category', category);
      if (difficulty) queryParams.append('difficulty', difficulty);
      queryParams.append('page', page);
      // Add cache-busting timestamp to prevent caching
      queryParams.append('t', new Date().getTime());
      
      // Fetch real data from API
      const response = await fetch(`/api/courses?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const coursesData = await response.json();
      
      // Map API response to frontend model
      const formattedCourses = coursesData.map(course => ({
        id: course.CourseID,
        title: course.Title,
        description: course.Description,
        category: course.Category,
        difficulty: course.Difficulty,
        thumbnailURL: course.ThumbnailURL || '/placeholder-course.jpg',
        instructorName: course.InstructorName || 'Admin',
        videoCount: course.VideoCount || 0,
        enrolledCount: course.EnrolledUsers || '0', // Convert to '0' instead of '-' for clarity
        creationDate: course.CreationDate,
        // Format duration properly based on seconds if available
        duration: course.TotalDuration 
          ? formatDuration(course.TotalDuration)
          : course.TotalDuration === 0 ? '0 minutes' : '-',
        // Use actual rating if available, otherwise mark with hyphen
        rating: course.Rating || '-',
        // Mark some courses as featured
        featured: course.Featured || false
      }));
      
      // Set courses and total pages
      setCourses(formattedCourses);
      setTotalPages(Math.ceil(formattedCourses.length / 12)); // 12 courses per page
      setError('');
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to load courses. Please try again later.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Format duration from seconds to hours and minutes with better handling of zero values
  const formatDuration = (totalSeconds) => {
    if (totalSeconds === undefined || totalSeconds === null) return '-';
    if (totalSeconds === 0) return '0 minutes';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    } else {
      return `${minutes}m`;
    }
  };
  
  // Fetch courses when filters or page changes
  useEffect(() => {
    fetchCourses();
  }, [page, searchQuery, category, difficulty]);
  
  // Extract unique categories from course data
  useEffect(() => {
    if (courses.length > 0) {
      // Normalize categories by converting to lowercase and trimming spaces
      // to ensure courses with same category but different casing are grouped together
      const normalizedCourses = courses.map(course => ({
        ...course,
        category: course.category ? course.category.trim() : 'Uncategorized'
      }));
      
      // Get unique categories, sorted alphabetically
      const uniqueCategories = [...new Set(normalizedCourses.map(course => course.category))].sort();
      setCategories(uniqueCategories);
    }
  }, [courses]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };
  
  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
    setPage(1);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setDifficulty('');
    setPage(1);
  };
  
  const handleCourseClick = (courseId) => {
    // Find the course by ID
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setModalOpen(true);
    }
  };
  
  const handleModalClose = () => {
    setModalOpen(false);
  };
  
  const handleEnrollCourse = async (courseId) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login?redirect=/courses');
        return;
      }
      
      console.log('Enrolling in course ID:', courseId);
      setEnrollmentLoading(true);
      
      // Call the enrollment API
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Backend API response status:', response.status);
      const data = await response.json();
      console.log('Enrollment response:', data);
      
      // Consider success based on response.ok and data.success, not just enrollment_id
      if (!response.ok) {
        // If user is already enrolled, still mark as enrolled
        if (data.message === 'User already enrolled in this course') {
          console.log('Already enrolled. Setting enrolled state to true.');
          setIsEnrolled(true);
          if (typeof toast !== 'undefined') {
            toast.info('You are already enrolled in this course');
          }
          // Navigate to course detail page for already enrolled users
          router.push(`/courses/${courseId}`);
          return;
        }
        
        const errorMessage = data.error || 'Failed to enroll in course';
        console.error('Enrollment error:', errorMessage);
        if (typeof toast !== 'undefined') {
          toast.error(errorMessage);
        }
        return;
      }
      
      // Check if enrollment was successful based on response and data.success
      if (response.ok && (data.success || data.message?.includes('Successfully'))) {
        // Successfully enrolled - update UI
        console.log('Successfully enrolled in course');
        setIsEnrolled(true);
        
        // Show success message
        if (typeof toast !== 'undefined') {
          toast.success('Successfully enrolled in course!');
        }
        
        // Navigate to course detail page
        router.push(`/courses/${courseId}`);
      } else {
        // This should rarely happen (successful response but no success flag)
        console.error('Unexpected enrollment response:', data);
        if (typeof toast !== 'undefined') {
          toast.error('Unexpected response. Please try again.');
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      if (typeof toast !== 'undefined') {
        toast.error('Failed to enroll in course. Please try again.');
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };
  
  // Get featured courses - handle empty case
  const getFeaturedCourses = () => {
    // If courses is empty, return empty array
    if (!courses.length) return [];
    
    // Otherwise filter for featured courses
    return courses.filter(course => course.featured);
  };
  
  // Group courses by category - handle empty case
  const getCoursesByCategory = (categoryName) => {
    // If courses is empty, return empty array
    if (!courses.length) return [];
    
    // Filter by category, normalizing the comparison to handle case differences
    return courses.filter(course => {
      const normalizedCourseCategory = course.category ? course.category.trim() : 'Uncategorized';
      return normalizedCourseCategory === categoryName;
    });
  };

  // Calculate courses for current page
  const coursesPerPage = 12; // 4x3 grid
  const startIndex = (page - 1) * coursesPerPage;
  const displayedCourses = courses.slice(startIndex, startIndex + coursesPerPage);
  
  // Define animations
  const animations = `
    @keyframes border-rotate {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    
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
  
  return (
    <Box sx={{ py: 4, position: 'relative', minHeight: '100vh' }}>
      {/* Add animations styles */}
      <style>{animations}</style>
      
      {/* Animated background */}
      <GlowingStarsBackground />
      
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(300deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              mb: 1.5,
              fontSize: { xs: '2rem', md: '2.75rem' },
              animation: 'gradient 4s ease infinite',
              '@keyframes gradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
              }
            }}
          >
            Explore Courses
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              mb: 4,
              fontSize: '1rem'
            }}
          >
            Discover our wide range of educational content and learn at your own pace
          </Typography>
        </Box>
        
        {/* Search and Filters */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 4,
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2
          }}>
            <TextField
              fullWidth
              placeholder="Search for courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      onClick={() => setSearchQuery('')}
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              sx={{ flex: '1 1 auto' }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' } 
            }}>
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
                sx={{ 
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                }}
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </Button>
              
              {(searchQuery || category || difficulty) && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearFilters}
                  size="small"
                  sx={{ 
                    flex: { xs: '1 1 auto', sm: '0 0 auto' },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Expandable filter section */}
          {showFilters && (
            <Box 
              sx={{ 
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}
            >
              <FormControl 
                fullWidth 
                variant="outlined"
                size="small"
                sx={{ flex: '1 1 auto' }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl 
                fullWidth 
                variant="outlined"
                size="small"
                sx={{ flex: '1 1 auto' }}
              >
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficulty}
                  label="Difficulty"
                  onChange={handleDifficultyChange}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {difficulties.map((diff) => (
                    <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Paper>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Course List */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column',
            minHeight: 300
          }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>
              Loading courses...
            </Typography>
          </Box>
        ) : courses.length > 0 ? (
          <>
            {/* Featured Courses - Horizontal Scrollable */}
            {!searchQuery && !category && !difficulty && getFeaturedCourses().length > 0 && (
              <ScrollableSection 
                title="Featured Courses" 
                courses={getFeaturedCourses()} 
                onCourseClick={handleCourseClick}
              />
            )}
            
            {/* Display category sections */}
            {!searchQuery && !category && !difficulty ? (
              <>
                {categories.map((categoryName) => {
                  const categoryCourses = getCoursesByCategory(categoryName);
                  if (categoryCourses.length === 0) return null;
                  
                  return (
                    <ScrollableSection
                      key={categoryName}
                      title={categoryName} 
                      courses={categoryCourses} 
                      onCourseClick={handleCourseClick}
                    />
                  );
                })}
              </>
            ) : (
              <>
                {/* Filtered results */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mb: 0.5
                    }}
                  >
                    Search Results
                  </Typography>
                  <Typography color="text.secondary">
                    Found {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                  </Typography>
                </Box>
                
                <Grid container spacing={2.5}>
                  {displayedCourses.map((course, index) => (
                    <Grid item xs={6} sm={4} md={3} key={course.id}>
                      <CourseCard 
                        course={course} 
                        onClick={() => handleCourseClick(course.id)}
                        index={index}
                      />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="medium"
                      siblingCount={1}
                    />
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            my: 6, 
            py: 4,
          }}>
            <BookmarkIcon 
              sx={{ 
                fontSize: 48, 
                color: alpha(theme.palette.primary.main, 0.5),
                mb: 2
              }} 
            />
            <Typography variant="h6" paragraph>
              {searchQuery || category || difficulty 
                ? "No courses found matching your criteria" 
                : "No courses available yet"}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery || category || difficulty 
                ? "Try adjusting your search or filters"
                : "Courses are being prepared and will be available soon"}
            </Typography>
            {(searchQuery || category || difficulty) && (
              <Button
                variant="contained"
                onClick={handleClearFilters}
                color="primary"
              >
                Clear Filters
              </Button>
            )}
          </Box>
        )}
      </Container>
      
      {/* Course Detail Modal */}
      <CourseDetailModal 
        open={modalOpen}
        onClose={handleModalClose}
        course={selectedCourse}
        onEnroll={handleEnrollCourse}
      />
    </Box>
  );
}