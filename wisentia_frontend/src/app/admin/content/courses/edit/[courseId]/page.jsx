"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Container, Typography, Button, TextField, MenuItem, 
  Box, Paper, Grid, IconButton, Divider, Card, CardContent,
  useTheme, alpha, CircularProgress, Snackbar, Alert,
  FormControlLabel, Switch, List, ListItem, ListItemText, 
  ListItemSecondary, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TitleIcon from '@mui/icons-material/Title';
import CategoryIcon from '@mui/icons-material/Category';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import YouTubeIcon from '@mui/icons-material/YouTube';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function EditCoursePage() {
  const params = useParams();
  const theme = useTheme();
  const router = useRouter();
  const courseId = params.courseId;
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    thumbnailUrl: '',
    isActive: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Video-related states
  const [videos, setVideos] = useState([]);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({
    videoId: null,
    title: '',
    description: '',
    youtubeVideoId: '',
    duration: 0,
    orderInCourse: 0
  });
  const [videoErrors, setVideoErrors] = useState({});
  const [newVideos, setNewVideos] = useState([]);

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchCourse();
  }, [user, router, courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const data = await response.json();
      
      // Normalize field names (handle both camelCase and PascalCase)
      setFormData({
        title: data.Title || data.title || '',
        description: data.Description || data.description || '',
        category: data.Category || data.category || '',
        difficulty: data.Difficulty || data.difficulty || 'beginner',
        thumbnailUrl: data.ThumbnailURL || data.thumbnailUrl || '',
        isActive: data.IsActive || data.isActive || true
      });
      
      // Set videos if they exist
      if (data.videos && Array.isArray(data.videos)) {
        setVideos(data.videos.map(video => ({
          videoId: video.VideoID || video.videoId,
          title: video.Title || video.title,
          description: video.Description || video.description,
          youtubeVideoId: video.YouTubeVideoID || video.youtubeVideoId,
          duration: video.Duration || video.duration || 0,
          orderInCourse: video.OrderInCourse || video.orderInCourse || 0
        })));
      }
      
    } catch (error) {
      console.error('Error fetching course:', error);
      setSnackbar({
        open: true,
        message: `Error loading course: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Step 1: Update course details
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update course');
      }
      
      // Step 2: If we have new videos to add, add them
      if (newVideos.length > 0) {
        // Validate new videos first
        const invalidVideos = validateNewVideos();
        if (invalidVideos.length > 0) {
          const errorMessages = invalidVideos.map(v => 
            `${v.title}: ${v.errors.join(', ')}`
          ).join('\n');
          
          setSnackbar({
            open: true,
            message: `Please fix video errors: ${errorMessages}`,
            severity: 'error'
          });
          setSaving(false);
          return;
        }
        
        // Add new videos one by one
        let successCount = 0;
        let errors = [];
        
        for (let index = 0; index < newVideos.length; index++) {
          const video = newVideos[index];
          try {
            // Make sure we have the correct field names
            const videoData = {
              course_id: courseId,
              title: video.title,
              description: video.description || '',
              youtube_video_id: video.youtubeVideoId,
              duration: parseInt(video.duration) || 0,
              order_in_course: video.orderInCourse
            };
            
            const videoResponse = await fetch('/api/admin/courses/videos/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(videoData),
            });
            
            if (!videoResponse.ok) {
              const videoError = await videoResponse.json();
              throw new Error(videoError.error || 'Failed to create video');
            }
            
            successCount++;
          } catch (videoErr) {
            console.error(`Error creating video "${video.title}":`, videoErr);
            errors.push(`${video.title}: ${videoErr.message}`);
          }
        }
        
        // Show appropriate message based on video creation results
        if (errors.length === 0) {
          setSnackbar({
            open: true,
            message: `Course updated successfully with ${successCount} new videos added`,
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: `Course updated but only ${successCount}/${newVideos.length} videos were added. Errors: ${errors.join(', ')}`,
            severity: 'warning'
          });
        }
      } else {
        // No new videos to add, just show course update success
        setSnackbar({
          open: true,
          message: 'Course updated successfully',
          severity: 'success'
        });
      }
      
      // Clear new videos state since they've been added
      setNewVideos([]);
      
      // Refresh course data after a short delay
      setTimeout(() => {
        fetchCourse();
      }, 1000);
      
    } catch (err) {
      console.error('Course update error:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Video dialog handlers
  const openAddVideoDialog = () => {
    setCurrentVideo({
      videoId: null,
      title: '',
      description: '',
      youtubeVideoId: '',
      duration: 0,
      orderInCourse: videos.length + 1
    });
    setVideoErrors({});
    setVideoDialogOpen(true);
  };
  
  const openEditVideoDialog = (video) => {
    setCurrentVideo({ ...video });
    setVideoErrors({});
    setVideoDialogOpen(true);
  };
  
  const closeVideoDialog = () => {
    setVideoDialogOpen(false);
  };
  
  const handleVideoInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVideo({
      ...currentVideo,
      [name]: value
    });
    
    // Clear validation errors on change
    if (videoErrors[name]) {
      setVideoErrors({
        ...videoErrors,
        [name]: ''
      });
    }
  };
  
  // Extract YouTube video ID from URL or use as is if it's just an ID
  const extractYouTubeID = (input) => {
    if (!input) return '';
    
    // If it's already just an ID (not a URL), return it
    if (!input.includes('/') && !input.includes('.')) {
      return input;
    }
    
    // Try to extract the ID from various YouTube URL formats
    try {
      // Handle youtube.com/watch?v=ID format
      let match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube.com\/shorts\/|youtube\.com\/watch\?.*v=)([^&?#\/\s]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Handle youtu.be/ID format
      match = input.match(/youtu\.be\/([^&?#\/\s]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      // If no match found, return the input (will be validated later)
      return input;
    } catch (e) {
      console.error("Error extracting YouTube ID:", e);
      return input;
    }
  };
  
  const handleYouTubeURLChange = (e) => {
    const { value } = e.target;
    const extractedId = extractYouTubeID(value);
    
    setCurrentVideo({
      ...currentVideo,
      youtubeVideoId: extractedId
    });
    
    // Clear validation error
    if (videoErrors.youtubeVideoId) {
      setVideoErrors({
        ...videoErrors,
        youtubeVideoId: ''
      });
    }
  };
  
  const validateVideoForm = () => {
    const errors = {};
    
    if (!currentVideo.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!currentVideo.youtubeVideoId.trim()) {
      errors.youtubeVideoId = 'YouTube Video ID is required';
    } else if (!/^[a-zA-Z0-9_-]{6,20}$/.test(currentVideo.youtubeVideoId)) {
      errors.youtubeVideoId = 'Invalid YouTube ID format';
    }
    
    setVideoErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const saveVideo = async () => {
    if (!validateVideoForm()) return;
    
    try {
      // Prepare video data
      const videoData = {
        course_id: courseId,
        title: currentVideo.title,
        description: currentVideo.description || '',
        youtube_video_id: currentVideo.youtubeVideoId,
        duration: parseInt(currentVideo.duration) || 0,
        order_in_course: currentVideo.orderInCourse || (videos.length + 1)
      };
      
      if (currentVideo.videoId) {
        // Update existing video (not implemented in this version)
        setSnackbar({
          open: true,
          message: 'Video update functionality not yet implemented',
          severity: 'warning'
        });
      } else {
        // Create new video
        const response = await fetch('/api/admin/courses/videos/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(videoData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create video');
        }
        
        const responseData = await response.json();
        
        // Add new video to the list
        const newVideo = {
          videoId: responseData.videoId,
          title: currentVideo.title,
          description: currentVideo.description,
          youtubeVideoId: currentVideo.youtubeVideoId,
          duration: parseInt(currentVideo.duration) || 0,
          orderInCourse: currentVideo.orderInCourse
        };
        
        setVideos([...videos, newVideo]);
        setSnackbar({
          open: true,
          message: 'Video added successfully',
          severity: 'success'
        });
      }
      
      // Close the dialog
      closeVideoDialog();
      
      // Refresh course data after a short delay
      setTimeout(() => {
        fetchCourse();
      }, 1000);
      
    } catch (error) {
      console.error('Video save error:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
      }
    },
    '& .MuiInputLabel-root': {
      transition: 'all 0.3s ease-in-out',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
    '& .MuiInputBase-input': {
      padding: '14px 16px',
    }
  };

  const getInputColor = (name) => {
    const colors = {
      title: theme.palette.primary.main,
      category: theme.palette.secondary.main,
      difficulty: theme.palette.success.main,
      thumbnailUrl: theme.palette.info.main,
      description: theme.palette.primary.main
    };
    return colors[name] || theme.palette.primary.main;
  };

  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...newVideos];
    
    // Special handling for YouTube video ID field
    if (field === 'youtubeVideoId') {
      // Extract YouTube ID if a URL was pasted
      const extractedId = extractYouTubeID(value);
      updatedVideos[index][field] = extractedId;
    } else {
      updatedVideos[index][field] = value;
    }
    
    setNewVideos(updatedVideos);
  };

  const addVideoField = () => {
    setNewVideos([
      ...newVideos,
      { 
        title: '', 
        description: '', 
        youtubeVideoId: '', 
        duration: 0, 
        orderInCourse: videos.length + newVideos.length + 1 
      }
    ]);
  };

  const removeVideoField = (index) => {
    const updatedVideos = [...newVideos];
    updatedVideos.splice(index, 1);
    
    // Update orderInCourse for remaining videos
    updatedVideos.forEach((video, idx) => {
      video.orderInCourse = videos.length + idx + 1;
    });
    
    setNewVideos(updatedVideos);
  };

  const validateNewVideos = () => {
    const invalidVideos = [];
    
    for (let i = 0; i < newVideos.length; i++) {
      const video = newVideos[i];
      const errors = [];
      
      if (!video.title.trim()) {
        errors.push('Title is required');
      }
      
      if (!video.youtubeVideoId.trim()) {
        errors.push('YouTube Video ID is required');
      } else {
        // Validate YouTube ID format (typically 11 characters, alphanumeric with some special chars)
        const isValidID = /^[a-zA-Z0-9_-]{6,15}$/.test(video.youtubeVideoId);
        if (!isValidID) {
          errors.push('Invalid YouTube Video ID format');
        }
      }
      
      if (errors.length > 0) {
        invalidVideos.push({ index: i, title: video.title || `Video ${i+1}`, errors });
      }
    }
    
    return invalidVideos;
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2 
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="700" 
            color="primary"
            sx={{ 
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '40%',
                height: '4px',
                bottom: '-8px',
                left: 0,
                backgroundColor: theme.palette.primary.main,
                borderRadius: '2px'
              }
            }}
          >
            Edit Course
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/content/courses')}
            sx={{ 
              borderRadius: '8px',
              px: 2,
              height: '40px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(-5px)',
                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`
              }
            }}
          >
            Back to Courses
          </Button>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Course Details */}
          <Paper 
            elevation={3} 
            sx={{ 
              mb: 5, 
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#f9f9f9', 0.8),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '50%',
                    p: 1,
                  }}
                >
                  <SaveIcon fontSize="small" color="primary" />
                </Box>
                Course Details
              </Typography>

              {/* Title and Category */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: 2,
                mb: 2
              }}>
                {/* Title */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TitleIcon 
                      sx={{ 
                        color: getInputColor('title'),
                        mr: 1
                      }} 
                      fontSize="small" 
                    />
                    <Typography 
                      variant="body2" 
                      fontWeight={500} 
                      color={getInputColor('title')}
                    >
                      Title*
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    placeholder="Enter the title of your course"
                    InputProps={{
                      sx: { 
                        backgroundColor: alpha(getInputColor('title'), 0.03),
                        borderColor: alpha(getInputColor('title'), 0.2),
                      }
                    }}
                    sx={{
                      ...inputStyle,
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: getInputColor('title'),
                      }
                    }}
                  />
                </Box>

                {/* Category */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon 
                      sx={{ 
                        color: getInputColor('category'),
                        mr: 1
                      }} 
                      fontSize="small" 
                    />
                    <Typography 
                      variant="body2" 
                      fontWeight={500} 
                      color={getInputColor('category')}
                    >
                      Category*
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    placeholder="E.g. Programming, Design, Marketing"
                    InputProps={{
                      sx: { 
                        backgroundColor: alpha(getInputColor('category'), 0.03),
                        borderColor: alpha(getInputColor('category'), 0.2),
                      }
                    }}
                    sx={{
                      ...inputStyle,
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: getInputColor('category'),
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Difficulty and Thumbnail URL */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: 2,
                mb: 2
              }}>
                {/* Difficulty */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SignalCellularAltIcon 
                      sx={{ 
                        color: getInputColor('difficulty'),
                        mr: 1
                      }} 
                      fontSize="small" 
                    />
                    <Typography 
                      variant="body2" 
                      fontWeight={500} 
                      color={getInputColor('difficulty')}
                    >
                      Difficulty*
                    </Typography>
                  </Box>
                  <TextField
                    select
                    fullWidth
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      sx: { 
                        backgroundColor: alpha(getInputColor('difficulty'), 0.03),
                        borderColor: alpha(getInputColor('difficulty'), 0.2),
                      }
                    }}
                    sx={{
                      ...inputStyle,
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: getInputColor('difficulty'),
                      }
                    }}
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </TextField>
                </Box>

                {/* Thumbnail URL */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ImageIcon 
                      sx={{ 
                        color: getInputColor('thumbnailUrl'),
                        mr: 1
                      }} 
                      fontSize="small" 
                    />
                    <Typography 
                      variant="body2" 
                      fontWeight={500} 
                      color={getInputColor('thumbnailUrl')}
                    >
                      Thumbnail URL
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    variant="outlined"
                    InputProps={{
                      sx: { 
                        backgroundColor: alpha(getInputColor('thumbnailUrl'), 0.03),
                        borderColor: alpha(getInputColor('thumbnailUrl'), 0.2),
                      }
                    }}
                    sx={{
                      ...inputStyle,
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: getInputColor('thumbnailUrl'),
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Active Status */}
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                      name="isActive"
                      color="success"
                    />
                  }
                  label="Course is active"
                />
              </Box>

              {/* Description */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DescriptionIcon 
                    sx={{ 
                      color: getInputColor('description'),
                      mr: 1
                    }} 
                    fontSize="small" 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    color={getInputColor('description')}
                  >
                    Description*
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Provide a detailed description of what students will learn"
                  InputProps={{
                    sx: { 
                      backgroundColor: alpha(getInputColor('description'), 0.03),
                      borderColor: alpha(getInputColor('description'), 0.2),
                    }
                  }}
                  sx={{
                    ...inputStyle,
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: getInputColor('description'),
                    }
                  }}
                />
              </Box>
            </Box>
          </Paper>
          
          {/* Course Videos Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              mb: 5, 
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#f9f9f9', 0.8),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: '50%',
                      p: 1,
                    }}
                  >
                    <OndemandVideoIcon fontSize="small" color="primary" />
                  </Box>
                  Existing Course Videos
                </Typography>
              </Box>
              
              {videos.length > 0 ? (
                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: '8px' }}>
                  {videos.map((video, index) => (
                    <ListItem
                      key={video.videoId || index}
                      alignItems="flex-start"
                      sx={{ 
                        borderBottom: index !== videos.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        p: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05)
                        },
                        borderRadius: '8px'
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="edit" 
                          onClick={() => openEditVideoDialog(video)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <EditIcon />
                        </IconButton>
                      }
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        width: '100%',
                        gap: 2
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          borderRadius: '50%', 
                          minWidth: '40px', 
                          height: '40px',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={500}>{video.title}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <YouTubeIcon fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {video.youtubeVideoId}
                            </Typography>
                          </Box>
                          {video.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {video.description.length > 100 
                                ? `${video.description.substring(0, 100)}...` 
                                : video.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  borderRadius: '8px',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }}>
                  <OndemandVideoIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>No Videos Yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Your course doesn't have any videos yet. Add videos below to make your course complete.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
          
          {/* Add New Videos Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              mb: 5,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#f9f9f9', 0.8),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.error.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box 
                  sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    borderRadius: '50%',
                    p: 1,
                  }}
                >
                  <YouTubeIcon fontSize="small" color="error" />
                </Box>
                Add New Videos
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={addVideoField}
                sx={{ 
                  borderRadius: '30px',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#4e54c8',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                    backgroundColor: '#3f45b6',
                  }
                }}
              >
                ADD VIDEO
              </Button>
            </Box>
            
            {newVideos.length === 0 ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                borderRadius: '8px',
                m: 3,
                backgroundColor: alpha(theme.palette.divider, 0.05)
              }}>
                <AddIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>No New Videos Added</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click "ADD VIDEO" button above to add new videos to this course.
                </Typography>
              </Box>
            ) : (
              newVideos.map((video, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    px: 3,
                    py: 3,
                    mb: index < newVideos.length - 1 ? 0 : 0,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <YouTubeIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="600" color="error">
                        New Video {index + 1}
                      </Typography>
                    </Box>
                    <IconButton 
                      color="error" 
                      onClick={() => removeVideoField(index)}
                      sx={{ 
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.15)',
                          transform: 'rotate(90deg)',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  
                  {/* Video Title and YouTube Video ID */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: 2,
                    mb: 2
                  }}>
                    {/* Video Title */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TitleIcon 
                          sx={{ 
                            color: theme.palette.error.main,
                            mr: 1
                          }} 
                          fontSize="small" 
                        />
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          color={theme.palette.error.main}
                        >
                          Video Title*
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        value={video.title}
                        onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                        required
                        variant="outlined"
                        placeholder="Enter a descriptive title for this video"
                        InputProps={{
                          sx: { 
                            backgroundColor: alpha(theme.palette.error.main, 0.03),
                            borderColor: alpha(theme.palette.error.main, 0.2),
                          }
                        }}
                        sx={{
                          ...inputStyle,
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.error.main,
                          }
                        }}
                      />
                    </Box>

                    {/* YouTube Video ID */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <YouTubeIcon 
                          sx={{ 
                            color: theme.palette.error.main,
                            mr: 1
                          }} 
                          fontSize="small" 
                        />
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          color={theme.palette.error.main}
                        >
                          YouTube Video ID*
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        value={video.youtubeVideoId}
                        onChange={(e) => handleVideoChange(index, 'youtubeVideoId', e.target.value)}
                        placeholder="dQw4w9WgXcQ"
                        required
                        variant="outlined"
                        helperText="Enter the YouTube ID only (e.g., dQw4w9WgXcQ). Full URLs like https://youtube.com/watch?v=dQw4w9WgXcQ will be automatically extracted."
                        InputProps={{
                          sx: { 
                            backgroundColor: alpha(theme.palette.error.main, 0.03),
                            borderColor: alpha(theme.palette.error.main, 0.2),
                          }
                        }}
                        sx={{
                          ...inputStyle,
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.error.main,
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Duration and Order in Course */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    gap: 2,
                    mb: 2
                  }}>
                    {/* Duration */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon 
                          sx={{ 
                            color: theme.palette.error.main,
                            mr: 1
                          }} 
                          fontSize="small" 
                        />
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          color={theme.palette.error.main}
                        >
                          Duration (seconds)
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={video.duration}
                        onChange={(e) => handleVideoChange(index, 'duration', e.target.value)}
                        placeholder="300"
                        variant="outlined"
                        helperText="Duration of the video in seconds (e.g. 300 for 5 minutes)"
                        InputProps={{
                          sx: { 
                            backgroundColor: alpha(theme.palette.error.main, 0.03),
                            borderColor: alpha(theme.palette.error.main, 0.2),
                          }
                        }}
                        sx={{
                          ...inputStyle,
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.error.main,
                          }
                        }}
                      />
                    </Box>

                    {/* Order in Course */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FormatListNumberedIcon 
                          sx={{ 
                            color: theme.palette.error.main,
                            mr: 1
                          }} 
                          fontSize="small" 
                        />
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          color={theme.palette.error.main}
                        >
                          Order in Course
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={video.orderInCourse}
                        InputProps={{
                          readOnly: true,
                          sx: { 
                            backgroundColor: alpha(theme.palette.error.main, 0.03),
                            borderColor: alpha(theme.palette.error.main, 0.2),
                          }
                        }}
                        variant="outlined"
                        helperText="Position of this video in the course sequence"
                        sx={{
                          ...inputStyle,
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.error.main,
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Video Description */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DescriptionIcon 
                        sx={{ 
                          color: theme.palette.error.main,
                          mr: 1
                        }} 
                        fontSize="small" 
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight={500} 
                        color={theme.palette.error.main}
                      >
                        Video Description
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      value={video.description}
                      onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Brief description of what this video covers"
                      InputProps={{
                        sx: { 
                          backgroundColor: alpha(theme.palette.error.main, 0.03),
                          borderColor: alpha(theme.palette.error.main, 0.2),
                        }
                      }}
                      sx={{
                        ...inputStyle,
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.error.main,
                        }
                      }}
                    />
                  </Box>
                </Box>
              ))
            )}
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={saving}
              startIcon={<SaveIcon />}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CancelIcon />}
              onClick={() => router.push('/admin/content/courses')}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: '8px',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
        
        {/* Video Add/Edit Dialog */}
        <Dialog 
          open={videoDialogOpen} 
          onClose={closeVideoDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              backgroundColor: '#464b56', // Dark background like Add Video section
              color: 'white'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#2e323a', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 2
          }}>
            <OndemandVideoIcon sx={{ mr: 1 }} />
            {currentVideo.videoId ? 'Edit Video' : 'Add New Video'}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3, backgroundColor: '#464b56' }}>
            <Grid container spacing={3}>
              {/* Video Title (left) and YouTube ID (right) side by side */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <TitleIcon 
                    sx={{ 
                      color: '#a0c3ff',
                      mr: 1
                    }} 
                    fontSize="small" 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    color="#a0c3ff"
                  >
                    Video Title*
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="title"
                  value={currentVideo.title}
                  onChange={handleVideoInputChange}
                  required
                  error={!!videoErrors.title}
                  helperText={videoErrors.title}
                  placeholder="Enter a descriptive title for this video"
                  InputProps={{
                    sx: { 
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '8px',
                      color: 'white'
                    }
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#a0c3ff'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <YouTubeIcon 
                    sx={{ 
                      color: '#ff5252',
                      mr: 1
                    }} 
                    fontSize="small" 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    color="#ff5252"
                  >
                    YouTube Video ID*
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="youtubeVideoId"
                  value={currentVideo.youtubeVideoId}
                  onChange={handleYouTubeURLChange}
                  placeholder="dQw4w9WgXcQ"
                  required
                  error={!!videoErrors.youtubeVideoId}
                  helperText={videoErrors.youtubeVideoId || "Enter the YouTube ID only (e.g., dQw4w9WgXcQ). Full URLs like https://youtube.com/watch?v=dQw4w9WgXcQ will be automatically extracted."}
                  InputProps={{
                    sx: { 
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '8px',
                      color: 'white'
                    }
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff5252'
                    }
                  }}
                />
              </Grid>
              
              {/* Duration (left) and Order (right) side by side */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon 
                    sx={{ 
                      color: '#7dffbb',
                      mr: 1
                    }} 
                    fontSize="small" 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    color="#7dffbb"
                  >
                    Duration (seconds)
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="duration"
                  type="number"
                  value={currentVideo.duration}
                  onChange={handleVideoInputChange}
                  placeholder="7200"
                  helperText="Duration of the video in seconds (e.g. 300 for 5 minutes)"
                  InputProps={{ 
                    inputProps: { min: 0 },
                    sx: { 
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '8px',
                      color: 'white'
                    }
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#7dffbb'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FormatListNumberedIcon 
                    sx={{ 
                      color: '#ffbb7d',
                      mr: 1
                    }} 
                    fontSize="small" 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    color="#ffbb7d"
                  >
                    Order in Course
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="orderInCourse"
                  type="number"
                  value={currentVideo.orderInCourse}
                  onChange={handleVideoInputChange}
                  placeholder="1"
                  helperText="Position of this video in the course sequence"
                  InputProps={{ 
                    inputProps: { min: 1 },
                    sx: { 
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '8px',
                      color: 'white'
                    }
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffbb7d'
                    }
                  }}
                />
              </Grid>
              
              {/* Description taking full width at the bottom */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon 
                    sx={{ 
                      color: '#c38dff',
                      mr: 1
                    }} 
                    fontSize="small" 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    color="#c38dff"
                  >
                    Video Description
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="description"
                  value={currentVideo.description}
                  onChange={handleVideoInputChange}
                  multiline
                  rows={4}
                  placeholder="Brief description of what this video covers"
                  InputProps={{
                    sx: { 
                      backgroundColor: 'rgba(255, 255, 255, 0.07)',
                      borderRadius: '8px',
                      color: 'white'
                    }
                  }}
                  sx={{ 
                    mb: 1,
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#c38dff'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            px: 3, 
            py: 2, 
            backgroundColor: '#2e323a',
            justifyContent: 'space-between'
          }}>
            <Button 
              onClick={closeVideoDialog} 
              color="inherit"
              sx={{ 
                borderRadius: '8px',
                px: 3,
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              CANCEL
            </Button>
            <Button 
              onClick={saveVideo} 
              variant="contained" 
              sx={{ 
                borderRadius: '8px',
                px: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                backgroundColor: '#4e54c8',
                '&:hover': {
                  backgroundColor: '#3f45b6',
                }
              }}
            >
              {currentVideo.videoId ? 'UPDATE VIDEO' : 'ADD VIDEO'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </MainLayout>
  );
} 