"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { styled } from '@mui/material/styles';
import { 
  Container, Typography, Button, TextField, MenuItem, 
  Box, Paper, Grid, IconButton, Divider, Card, CardContent,
  useTheme, alpha, CircularProgress, Snackbar, Alert,
  FormControlLabel, Switch, List, ListItem, ListItemText, 
  ListItemSecondary, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, FormHelperText, Stack, Tooltip
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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// Quantum Theme Colors
const QUANTUM_COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  info: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neon: '#00D4FF',
  plasma: '#FF006E',
  quantum: '#7C3AED',
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
    secondary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
    hero: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 25%, #6366F1 50%, #8B5CF6 75%, #06B6D4 100%)',
    card: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(6, 182, 212, 0.05) 100%)',
    neon: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF006E 100%)',
    plasma: 'linear-gradient(45deg, #FF006E 0%, #8B5CF6 50%, #00D4FF 100%)',
    quantum: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 25%, #6366F1 50%, #8B5CF6 75%, #06B6D4 100%)'
  },
  shadows: {
    neon: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)',
    plasma: '0 0 20px rgba(255, 0, 110, 0.4), 0 0 40px rgba(139, 92, 246, 0.3)',
    quantum: '0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 90px rgba(6, 182, 212, 0.2)'
  }
};

// Quantum Styled Components
const QuantumContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #0F0A1A 0%, #1E1B4B 25%, #1A1B3A 50%, #0F172A 100%)'
    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 25%, #CBD5E1 50%, #94A3B8 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  }
}));

const QuantumGlassCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: variant === 'primary' 
    ? QUANTUM_COLORS.gradients.card
    : theme.palette.mode === 'dark'
      ? 'rgba(30, 27, 75, 0.3)'
      : 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: variant === 'primary' 
    ? `1px solid ${alpha(QUANTUM_COLORS.primary, 0.3)}`
    : `1px solid ${alpha(QUANTUM_COLORS.accent, 0.2)}`,
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: QUANTUM_COLORS.shadows.neon,
    border: `1px solid ${alpha(QUANTUM_COLORS.neon, 0.4)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: variant === 'primary' ? QUANTUM_COLORS.gradients.primary : QUANTUM_COLORS.gradients.neon,
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
  }
}));

const QuantumHeaderContainer = styled(Box)(({ theme }) => ({
  background: QUANTUM_COLORS.gradients.hero,
  borderRadius: theme.spacing(4),
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: QUANTUM_COLORS.shadows.quantum,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 0, 110, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(124, 58, 237, 0.4) 0%, transparent 50%)
    `,
    animation: 'quantumPulse 4s ease-in-out infinite alternate',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  '@keyframes quantumPulse': {
    '0%': {
      opacity: 0.7,
      transform: 'scale(1)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1.05)',
    },
  }
}));

const QuantumTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(30, 27, 75, 0.4)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(15px)',
    border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.3)}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
      border: `1px solid ${alpha(QUANTUM_COLORS.neon, 0.5)}`,
      boxShadow: `0 0 20px ${alpha(QUANTUM_COLORS.neon, 0.2)}`,
    },
    '&.Mui-focused': {
      border: `2px solid ${QUANTUM_COLORS.neon}`,
      boxShadow: `0 0 30px ${alpha(QUANTUM_COLORS.neon, 0.4)}`,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(30, 27, 75, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    }
  },
  '& .MuiInputLabel-root': {
    color: alpha(QUANTUM_COLORS.accent, 0.8),
    '&.Mui-focused': {
      color: QUANTUM_COLORS.neon,
    }
  }
}));

const QuantumActionButton = styled(Button)(({ theme, variant: buttonVariant = 'primary', glow = false }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: buttonVariant === 'primary' ? QUANTUM_COLORS.gradients.primary :
             buttonVariant === 'secondary' ? QUANTUM_COLORS.gradients.secondary :
             buttonVariant === 'neon' ? QUANTUM_COLORS.gradients.neon :
             'transparent',
  border: glow ? `2px solid ${alpha(QUANTUM_COLORS.neon, 0.6)}` : 'none',
  boxShadow: glow 
    ? `0 0 20px ${alpha(QUANTUM_COLORS.neon, 0.4)}`
    : '0 4px 15px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: glow 
      ? `0 0 30px ${alpha(QUANTUM_COLORS.neon, 0.6)}, 0 10px 30px rgba(0, 0, 0, 0.3)`
      : '0 8px 25px rgba(0, 0, 0, 0.3)',
    '&::before': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
    opacity: 0,
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
    opacity: 1,
  }
}));

const QuantumSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      color: QUANTUM_COLORS.success,
      '& + .MuiSwitch-track': {
        backgroundColor: QUANTUM_COLORS.success,
        opacity: 0.7,
        boxShadow: `0 0 20px ${alpha(QUANTUM_COLORS.success, 0.4)}`,
      },
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: alpha(QUANTUM_COLORS.accent, 0.3),
    transition: 'all 0.3s ease',
  },
}));

const QuantumVideoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  background: theme.palette.mode === 'dark' ? 'rgba(30, 27, 75, 0.3)' : 'rgba(255, 255, 255, 0.1)',
  border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.2)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: QUANTUM_COLORS.shadows.neon,
    border: `1px solid ${alpha(QUANTUM_COLORS.neon, 0.4)}`,
  },
}));

export default function EditCoursePage() {
  const theme = useTheme();
  const router = useRouter();
  const { courseId } = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    thumbnailUrl: '',
    isActive: true
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Video dialog states
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    youtubeVideoId: '',
    duration: 0,
    orderInCourse: 1
  });

  const categories = ['Programming', 'Design', 'Marketing', 'Business', 'Science', 'Art'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  // Fetch course data on mount
  useEffect(() => {
    if (!courseId) return;
    
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchCourse();
  }, [courseId, user, router]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      // Fetch course details with videos
      const courseResponse = await fetch(`/api/admin/courses/${courseId}?include_videos=true`);
      if (!courseResponse.ok) {
        throw new Error('Course not found');
      }
      
      const courseData = await courseResponse.json();
      console.log('Fetched course data:', courseData);
      setCourse(courseData);
      
      // Normalize field names (handle both camelCase and PascalCase from backend)
      setFormData({
        title: courseData.Title || courseData.title || '',
        description: courseData.Description || courseData.description || '',
        category: courseData.Category || courseData.category || '',
        difficulty: courseData.Difficulty || courseData.difficulty || 'beginner',
        thumbnailUrl: courseData.ThumbnailURL || courseData.thumbnailUrl || '',
        isActive: courseData.IsActive !== undefined ? courseData.IsActive : 
                 courseData.isActive !== undefined ? courseData.isActive : true
      });
      
      // Set videos if they exist in the course data
      if (courseData.videos && Array.isArray(courseData.videos)) {
        const normalizedVideos = courseData.videos.map(video => ({
          videoId: video.VideoID || video.videoId,
          title: video.Title || video.title,
          description: video.Description || video.description,
          youtubeVideoId: video.YouTubeVideoID || video.youtubeVideoId,
          duration: video.Duration || video.duration || 0,
          orderInCourse: video.OrderInCourse || video.orderInCourse || 0
        }));
        
        console.log('Normalized videos:', normalizedVideos);
        setVideos(normalizedVideos);
      } else {
        console.log('No videos found for this course');
        setVideos([]);
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
    setFormData({
      ...formData,
      isActive: e.target.checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Prepare data for backend (using PascalCase field names)
      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        thumbnailUrl: formData.thumbnailUrl,
        isActive: formData.isActive
      };
      
      console.log('Submitting course update:', updateData);
      
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const responseData = await response.json();
      console.log('Update response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update course');
      }
          
          setSnackbar({
            open: true,
        message: 'Course updated successfully!',
            severity: 'success'
          });
      
      // Refresh course data
      setTimeout(() => {
        fetchCourse();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating course:', error);
      setSnackbar({
        open: true,
        message: `Error updating course: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Video handler functions
  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setVideoFormData({
      title: video.title || '',
      description: video.description || '',
      youtubeVideoId: video.youtubeVideoId || '',
      duration: video.duration || 0,
      orderInCourse: video.orderInCourse || 1
    });
    setVideoDialogOpen(true);
  };
  
  const handleDeleteVideo = (video) => {
    if (window.confirm(`Are you sure you want to delete the video "${video.title}"?`)) {
      // TODO: Implement video deletion API call
      setSnackbar({
        open: true,
        message: 'Video deletion will be implemented soon',
        severity: 'info'
      });
    }
  };

  const handleVideoDialogClose = () => {
    setVideoDialogOpen(false);
    setEditingVideo(null);
    setVideoFormData({
      title: '',
      description: '',
      youtubeVideoId: '',
      duration: 0,
      orderInCourse: 1
    });
  };

  const handleVideoFormChange = (e) => {
    const { name, value } = e.target;
    setVideoFormData({
      ...videoFormData,
      [name]: value
    });
  };

  const handleVideoSubmit = async () => {
    try {
      if (editingVideo) {
        // TODO: Implement video update API call
        setSnackbar({
          open: true,
          message: 'Video update will be implemented soon',
          severity: 'info'
        });
      } else {
        // TODO: Implement video creation API call
        setSnackbar({
          open: true,
          message: 'Video creation will be implemented soon',
          severity: 'info'
        });
      }
      handleVideoDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <MainLayout>
        <QuantumContainer maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Box textAlign="center">
              <CircularProgress size={60} sx={{ color: QUANTUM_COLORS.primary, mb: 3 }} />
              <Typography variant="h6" color="textSecondary">
                Loading course data...
              </Typography>
            </Box>
          </Box>
        </QuantumContainer>
      </MainLayout>
    );
  }

  // Show error if course not found
  if (!course) {
  return (
    <MainLayout>
        <QuantumContainer maxWidth="lg">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Box textAlign="center">
              <Typography variant="h4" color="error" gutterBottom>
                Course Not Found
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                The course you're looking for doesn't exist or has been deleted.
              </Typography>
              <QuantumActionButton
                variant="primary"
                onClick={() => router.push('/admin/content/courses')}
                sx={{ mt: 2 }}
              >
                Back to Courses
              </QuantumActionButton>
            </Box>
          </Box>
        </QuantumContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <QuantumContainer maxWidth="lg">
        {/* Header Section */}
        <QuantumHeaderContainer>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <EditIcon sx={{ fontSize: '3rem' }} />
              <Box>
                <Typography variant="h3" fontWeight="800" gutterBottom>
            Edit Course
          </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Update course information and settings
                </Typography>
              </Box>
            </Box>
            <QuantumActionButton
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/content/courses')}
            sx={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            Back to Courses
            </QuantumActionButton>
          </Stack>
        </QuantumHeaderContainer>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Course Details Section */}
          <QuantumGlassCard variant="primary" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Box 
                  sx={{ 
                    background: QUANTUM_COLORS.gradients.primary,
                    borderRadius: '50%',
                    p: 1.5,
                  }}
                >
                  <TitleIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ color: QUANTUM_COLORS.primary }}>
                  Course Information
              </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Title */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.primary }}>
                    Course Title *
                    </Typography>
                  <QuantumTextField
                    fullWidth
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter course title"
                    InputProps={{
                      startAdornment: (
                        <TitleIcon sx={{ color: QUANTUM_COLORS.primary, mr: 1 }} />
                      )
                    }}
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.secondary }}>
                    Category *
                    </Typography>
                  <QuantumTextField
                    fullWidth
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    select
                    label="Select Category"
                    InputProps={{
                      startAdornment: (
                        <CategoryIcon sx={{ color: QUANTUM_COLORS.secondary, mr: 1 }} />
                      )
                    }}
                    SelectProps={{
                      displayEmpty: true,
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Choose a category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </QuantumTextField>
                </Grid>

                {/* Difficulty */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.warning }}>
                    Difficulty Level *
                    </Typography>
                  <QuantumTextField
                    fullWidth
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                    select
                    InputProps={{
                      startAdornment: (
                        <SignalCellularAltIcon sx={{ color: QUANTUM_COLORS.warning, mr: 1 }} />
                      )
                    }}
                  >
                    {difficulties.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </MenuItem>
                    ))}
                  </QuantumTextField>
                </Grid>

                {/* Thumbnail URL */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.info }}>
                      Thumbnail URL
                    </Typography>
                  <QuantumTextField
                    fullWidth
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    InputProps={{
                      startAdornment: (
                        <ImageIcon sx={{ color: QUANTUM_COLORS.info, mr: 1 }} />
                      )
                    }}
                  />
                </Grid>

              {/* Description */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.primary }}>
                    Course Description
                  </Typography>
                  <QuantumTextField
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                    rows={4}
                    placeholder="Describe what students will learn in this course..."
                  InputProps={{
                      startAdornment: (
                        <DescriptionIcon sx={{ color: QUANTUM_COLORS.primary, mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                      )
                    }}
                  />
                </Grid>

                {/* Active Status */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box 
                  sx={{
                        background: formData.isActive ? QUANTUM_COLORS.gradients.neon : 'rgba(128, 128, 128, 0.3)',
                        borderRadius: '50%',
                        p: 1.5,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {formData.isActive ? 
                        <ToggleOnIcon sx={{ color: 'white', fontSize: '1.5rem' }} /> :
                        <ToggleOffIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                      }
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: formData.isActive ? QUANTUM_COLORS.success : QUANTUM_COLORS.error }}>
                        Course Status
                      </Typography>
                      <FormControlLabel
                        control={
                          <QuantumSwitch
                            checked={formData.isActive}
                            onChange={handleSwitchChange}
                            name="isActive"
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formData.isActive ? 'Active (Visible to students)' : 'Inactive (Hidden from students)'}
                          </Typography>
                        }
                />
              </Box>
            </Box>
                </Grid>
              </Grid>
            </CardContent>
          </QuantumGlassCard>

          {/* Videos Section */}
          <QuantumGlassCard variant="primary" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={4}>
                  <Box 
                    sx={{ 
                    background: QUANTUM_COLORS.gradients.secondary,
                      borderRadius: '50%',
                    p: 1.5,
                    }}
                  >
                  <PlayCircleIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                  </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight="700" sx={{ color: QUANTUM_COLORS.secondary }}>
                    Course Videos ({videos.length})
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(QUANTUM_COLORS.secondary, 0.7) }}>
                    Manage the videos in this course
                </Typography>
                </Box>
                <QuantumActionButton
                  variant="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setVideoDialogOpen(true)}
                  glow
                >
                  Add Video
                </QuantumActionButton>
              </Box>
              
              {videos.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {videos.map((video, index) => (
                    <QuantumVideoCard key={video.videoId || index} sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', gap: 3, p: 3, alignItems: 'flex-start' }}>
                        {/* Video Thumbnail */}
                      <Box sx={{ 
                          minWidth: 200,
                          height: 120,
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                        display: 'flex', 
                        alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {video.youtubeVideoId ? (
                            <Box sx={{ 
                        width: '100%',
                              height: '100%',
                              backgroundImage: `url(https://img.youtube.com/vi/${video.youtubeVideoId}/maxresdefault.jpg)`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative'
                      }}>
                        <Box sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(0, 0, 0, 0.7)',
                                borderRadius: '50%',
                                width: 50,
                                height: 50,
                          display: 'flex', 
                          alignItems: 'center', 
                                justifyContent: 'center'
                              }}>
                                <PlayCircleIcon sx={{ color: 'white', fontSize: '2rem' }} />
                        </Box>
                          </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                              <OndemandVideoIcon sx={{ fontSize: '3rem', mb: 1 }} />
                              <Typography variant="caption">No Preview</Typography>
                </Box>
              )}
            </Box>

                        {/* Video Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
              <Typography 
                                variant="h6" 
                                fontWeight="600"
                sx={{ 
                                  color: QUANTUM_COLORS.primary,
                                  mb: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {video.title}
              </Typography>
                              
                              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <FormatListNumberedIcon sx={{ fontSize: '1rem', color: QUANTUM_COLORS.accent }} />
                                  <Typography variant="body2" color="textSecondary">
                                    Order: {video.orderInCourse}
                                  </Typography>
            </Box>
            
                                {video.duration > 0 && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon sx={{ fontSize: '1rem', color: QUANTUM_COLORS.warning }} />
                                    <Typography variant="body2" color="textSecondary">
                                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
                                )}
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                  sx={{ 
                                  color: QUANTUM_COLORS.accent,
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  background: alpha(QUANTUM_COLORS.accent, 0.1),
                                  padding: '4px 8px',
                                  borderRadius: 1,
                                  display: 'inline-block'
                                }}
                              >
                                YouTube ID: {video.youtubeVideoId || 'N/A'}
                      </Typography>
                    </Box>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                              <Tooltip title="Edit Video">
                    <IconButton 
                                  size="small"
                                  onClick={() => handleEditVideo(video)}
                      sx={{ 
                                    background: alpha(QUANTUM_COLORS.primary, 0.1),
                                    color: QUANTUM_COLORS.primary,
                        '&:hover': {
                                      background: alpha(QUANTUM_COLORS.primary, 0.2),
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                    </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete Video">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteVideo(video)}
                          sx={{ 
                                    background: alpha(QUANTUM_COLORS.error, 0.1),
                                    color: QUANTUM_COLORS.error,
                                    '&:hover': {
                                      background: alpha(QUANTUM_COLORS.error, 0.2),
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="View on YouTube">
                                <IconButton
                                  size="small"
                                  onClick={() => window.open(`https://youtube.com/watch?v=${video.youtubeVideoId}`, '_blank')}
                                  disabled={!video.youtubeVideoId}
                          sx={{ 
                                    background: alpha(QUANTUM_COLORS.error, 0.1),
                                    color: '#FF0000',
                                    '&:hover': {
                                      background: alpha('#FF0000', 0.2),
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease',
                                    '&.Mui-disabled': {
                                      background: alpha(theme.palette.grey[500], 0.1),
                                      color: theme.palette.grey[500]
                                    }
                                  }}
                                >
                                  <YouTubeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                      </Box>
                    </Box>
                      </Box>
                    </Box>
                    </QuantumVideoCard>
                  ))}
                  </Box>
              ) : (
                <Box textAlign="center" py={8}>
                  <PlayCircleIcon sx={{ fontSize: '4rem', color: alpha(QUANTUM_COLORS.secondary, 0.3), mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No videos in this course
                      </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Add your first video to get started
                  </Typography>
                  <QuantumActionButton
                    variant="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setVideoDialogOpen(true)}
                  >
                    Add First Video
                  </QuantumActionButton>
                    </Box>
              )}
            </CardContent>
          </QuantumGlassCard>

          {/* Action Buttons */}
          <QuantumGlassCard>
            <CardContent>
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <QuantumActionButton
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => router.push('/admin/content/courses')}
                  disabled={saving}
            >
              Cancel
                </QuantumActionButton>
                <QuantumActionButton
                  type="submit"
                  variant="primary"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={saving}
                  glow
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </QuantumActionButton>
              </Stack>
            </CardContent>
          </QuantumGlassCard>
        </Box>
        
        {/* Video Edit/Add Dialog */}
        <Dialog 
          open={videoDialogOpen} 
          onClose={handleVideoDialogClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(30, 27, 75, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.3)}`,
              borderRadius: 3,
            }
          }}
        >
          <DialogTitle sx={{ 
            background: QUANTUM_COLORS.gradients.primary,
            color: 'white',
            textAlign: 'center',
            fontWeight: 700
          }}>
            <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
              {editingVideo ? <EditIcon /> : <AddIcon />}
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.primary }}>
                  Video Title *
                  </Typography>
                <QuantumTextField
                  fullWidth
                  name="title"
                  value={videoFormData.title}
                  onChange={handleVideoFormChange}
                  required
                  placeholder="Enter video title"
                  InputProps={{
                    startAdornment: (
                      <TitleIcon sx={{ color: QUANTUM_COLORS.primary, mr: 1 }} />
                    )
                  }}
                />
              </Grid>

              {/* YouTube Video ID, Order in Course, and Duration in same row */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.secondary }}>
                  YouTube Video ID *
                  </Typography>
                <QuantumTextField
                  fullWidth
                  name="youtubeVideoId"
                  value={videoFormData.youtubeVideoId}
                  onChange={handleVideoFormChange}
                  required
                  placeholder="e.g., dQw4w9WgXcQ"
                  InputProps={{
                    startAdornment: (
                      <YouTubeIcon sx={{ color: '#FF0000', mr: 1 }} />
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.warning }}>
                  Order in Course *
                  </Typography>
                <QuantumTextField
                  fullWidth
                  name="orderInCourse"
                  type="number"
                  value={videoFormData.orderInCourse}
                  onChange={handleVideoFormChange}
                  required
                  inputProps={{ min: 1 }}
                  InputProps={{ 
                    startAdornment: (
                      <FormatListNumberedIcon sx={{ color: QUANTUM_COLORS.warning, mr: 1 }} />
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.info }}>
                  Duration (seconds)
                  </Typography>
                <QuantumTextField
                  fullWidth
                  name="duration"
                  type="number"
                  value={videoFormData.duration}
                  onChange={handleVideoFormChange}
                  placeholder="0"
                  inputProps={{ min: 0 }}
                  InputProps={{ 
                    startAdornment: (
                      <AccessTimeIcon sx={{ color: QUANTUM_COLORS.info, mr: 1 }} />
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.primary }}>
                    Video Description
                  </Typography>
                <QuantumTextField
                  fullWidth
                  name="description"
                  value={videoFormData.description}
                  onChange={handleVideoFormChange}
                  multiline
                  rows={3}
                  placeholder="Describe what this video covers..."
                  InputProps={{
                    startAdornment: (
                      <DescriptionIcon sx={{ color: QUANTUM_COLORS.primary, mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                    )
                  }}
                />
              </Grid>

              {/* Video Preview - Full Width */}
              {videoFormData.youtubeVideoId && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.accent }}>
                    Video Preview
                  </Typography>
                  <Box 
                    onClick={() => window.open(`https://youtube.com/watch?v=${videoFormData.youtubeVideoId}`, '_blank')}
              sx={{ 
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: 2,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                      backgroundImage: `url(https://img.youtube.com/vi/${videoFormData.youtubeVideoId}/maxresdefault.jpg)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: `0 8px 32px ${alpha(QUANTUM_COLORS.neon, 0.4)}`,
                        border: `2px solid ${QUANTUM_COLORS.neon}`,
                      }
                    }}
                  >
                    <Box sx={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                '&:hover': {
                        background: 'rgba(255, 0, 0, 0.8)',
                        transform: 'scale(1.1)',
                      }
                    }}>
                      <PlayCircleIcon sx={{ 
                        color: 'white', 
                        fontSize: '3rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                      }} />
                    </Box>
                    
                    {/* YouTube Logo Overlay */}
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'rgba(255, 0, 0, 0.9)',
                      borderRadius: 1,
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <YouTubeIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        YouTube
                      </Typography>
                    </Box>

                    {/* Click to Play Hint */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      background: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: 2,
                      padding: '8px 12px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: 'white', 
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <PlayCircleIcon sx={{ fontSize: '1rem' }} />
                        Click to watch on YouTube
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <QuantumActionButton
              variant="outlined"
              onClick={handleVideoDialogClose}
            >
              Cancel
            </QuantumActionButton>
            <QuantumActionButton
              variant="primary"
              onClick={handleVideoSubmit}
              disabled={!videoFormData.title || !videoFormData.youtubeVideoId}
              glow
            >
              {editingVideo ? 'Update Video' : 'Add Video'}
            </QuantumActionButton>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ 
              borderRadius: 2,
              fontWeight: 500
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </QuantumContainer>
    </MainLayout>
  );
} 