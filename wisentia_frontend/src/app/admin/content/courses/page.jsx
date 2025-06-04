// src/app/admin/content/courses/page.jsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { styled } from '@mui/material/styles';
import MainLayout from '@/components/layout/MainLayout';

// MUI Core Imports
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  Paper,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Fade,
  Grow,
  Tooltip,
  Stack,
  Avatar,
  Badge,
  Divider,
  CircularProgress,
  LinearProgress,
  useMediaQuery,
  Pagination,
  Switch,
  FormControlLabel
} from '@mui/material';

// MUI Icons
import {
  Search as SearchIcon,
  FilterAlt as FilterAltIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  VideoLibrary as VideoLibraryIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  PlayCircle as PlayCircleIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  CloudUpload as UploadIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  FileCopy as DuplicateIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  AutoAwesome as AIIcon,
  GroupWork as CollaborationIcon,
  Assessment as ReportsIcon
} from '@mui/icons-material';

// Modern Quantum Theme Color Palette
const QUANTUM_COLORS = {
  primary: '#6366F1',        // Indigo
  secondary: '#8B5CF6',      // Violet  
  accent: '#06B6D4',         // Cyan
  info: '#06B6D4',           // Cyan (same as accent)
  success: '#10B981',        // Emerald
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  neon: '#00D4FF',          // Electric Blue
  plasma: '#FF006E',         // Electric Pink
  quantum: '#7C3AED',        // Purple
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
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }
}));

const QuantumGlassCard = styled(Card)(({ theme, variant = 'default', glowLevel = 'normal' }) => ({
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
  boxShadow: glowLevel === 'high' 
    ? QUANTUM_COLORS.shadows.quantum
    : glowLevel === 'medium'
      ? QUANTUM_COLORS.shadows.neon
      : '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: QUANTUM_COLORS.shadows.quantum,
    border: `1px solid ${alpha(QUANTUM_COLORS.neon, 0.6)}`,
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
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      rgba(99, 102, 241, 0.05) 0%, 
      rgba(139, 92, 246, 0.03) 25%, 
      rgba(6, 182, 212, 0.02) 50%, 
      transparent 100%)`,
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
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
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.2,
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
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(2),
  }
}));

const QuantumStatsCard = styled(Card)(({ theme, color = QUANTUM_COLORS.primary, index = 0 }) => ({
  background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
  color: 'white',
  borderRadius: theme.spacing(3),
  border: `2px solid ${alpha(color, 0.3)}`,
  boxShadow: `0 8px 32px ${alpha(color, 0.3)}, 0 0 0 1px ${alpha(color, 0.1)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  animationDelay: `${index * 0.1}s`,
  animation: 'quantumFadeInUp 0.8s ease-out forwards',
  transform: 'translateY(20px)',
  opacity: 0,
  '&:hover': {
    transform: 'translateY(-12px) scale(1.05)',
    boxShadow: `0 20px 40px ${alpha(color, 0.4)}, 0 0 30px ${alpha(color, 0.6)}`,
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
    background: `linear-gradient(45deg, transparent, ${alpha('#ffffff', 0.1)}, transparent)`,
    transform: 'translateX(-100%)',
    transition: 'all 0.6s ease',
    opacity: 0,
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
  },
  '@keyframes quantumFadeInUp': {
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(2),
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
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    fontSize: '0.875rem',
  }
}));

export default function ModernCourseManagementPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State Management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Stats State
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    avgRating: 0
  });

  // UI State
  const [usingPlaceholderData, setUsingPlaceholderData] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Categories and Difficulties
  const categories = ['Programming', 'Design', 'Marketing', 'Business', 'Science', 'Art'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  // Check admin permission
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchCourses();
  }, [user, router, currentPage, pageSize]);

  // Fetch courses from backend
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setUsingPlaceholderData(false);
      
      const queryParams = new URLSearchParams({
        type: 'courses',
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(difficultyFilter && { difficulty: difficultyFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/content?${queryParams}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setCourses(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);
      
      // Calculate stats
      calculateStats(data.items || []);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setSnackbar({
        open: true,
        message: `Failed to fetch courses: ${error.message}`,
        severity: 'error'
      });
      
      // Use fallback data
      setUsingPlaceholderData(true);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, categoryFilter, difficultyFilter, statusFilter]);

  // Calculate statistics
  const calculateStats = (coursesData) => {
    const totalCourses = coursesData.length;
    
    // Debug: Log the courses data to see what we're getting
    console.log('Courses data for stats calculation:', coursesData);
    console.log('Sample course IsActive values:', coursesData.slice(0, 3).map(course => ({
      title: course.Title,
      isActive: course.IsActive,
      type: typeof course.IsActive
    })));
    
    // Fix boolean handling for IsActive - handle both boolean and 0/1 values
    const activeCourses = coursesData.filter(course => {
      let isActive = false;
      
      if (typeof course.IsActive === 'boolean') {
        isActive = course.IsActive;
      } else if (typeof course.IsActive === 'number') {
        isActive = course.IsActive === 1;
      } else if (typeof course.IsActive === 'string') {
        isActive = course.IsActive === '1' || course.IsActive.toLowerCase() === 'true';
      }
      
      console.log(`Course "${course.Title}": IsActive=${course.IsActive} (${typeof course.IsActive}) -> ${isActive}`);
      return isActive;
    });
    
    console.log(`Active courses count: ${activeCourses.length} out of ${totalCourses}`);
    
    const totalEnrollments = coursesData.reduce((sum, course) => sum + (course.EnrolledUsers || 0), 0);
    const avgRating = coursesData.length > 0 ? 4.2 : 0; // Mock rating
    
    setStats({
      totalCourses,
      activeCourses: activeCourses.length,
      totalEnrollments,
      avgRating
    });
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchCourses();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle filters
  useEffect(() => {
    setCurrentPage(1);
    fetchCourses();
  }, [categoryFilter, difficultyFilter, statusFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setDifficultyFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  // Handle course deletion
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      if (usingPlaceholderData) {
        setSnackbar({
          open: true,
          message: 'Cannot delete courses while backend is unavailable.',
          severity: 'error'
        });
        return;
      }
      
      const response = await fetch(`/api/admin/courses/${courseToDelete.CourseID}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCourses(courses.filter(course => course.CourseID !== courseToDelete.CourseID));
        setSnackbar({
          open: true,
          message: data.action === 'deleted' 
            ? 'Course successfully deleted' 
            : 'Course was deactivated because it has enrolled users',
          severity: 'success'
        });
        fetchCourses(); // Refresh data
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Error deleting course',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting course',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  // Navigation handlers
  const handleEditClick = (courseId) => {
    router.push(`/admin/content/courses/edit/${courseId}`);
  };

  const handleViewClick = (courseId) => {
    router.push(`/courses/${courseId}`);
  };

  const handleCreateClick = () => {
    router.push('/admin/content/courses/create');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return QUANTUM_COLORS.success;
      case 'intermediate': return QUANTUM_COLORS.warning;
      case 'advanced': return QUANTUM_COLORS.error;
      default: return QUANTUM_COLORS.info;
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Programming': '#3f51b5',
      'Design': '#9c27b0', 
      'Marketing': '#f44336',
      'Business': '#2196f3',
      'Science': '#4caf50',
      'Art': '#ff9800'
    };
    return colors[category] || QUANTUM_COLORS.primary;
  };

  return (
    <MainLayout>
      <QuantumContainer maxWidth="xl">
        {/* Header Section */}
        <QuantumHeaderContainer>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ fontSize: '3rem', mr: 2 }} />
          <Box>
                  <Typography variant="h3" fontWeight="800" gutterBottom>
              Course Management
            </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage and monitor all courses in your learning platform
            </Typography>
          </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <QuantumActionButton
            variant="contained"
                size="large"
            startIcon={<AddIcon />}
                onClick={handleCreateClick}
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
                Create New Course
              </QuantumActionButton>
            </Grid>
          </Grid>
        </QuantumHeaderContainer>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <QuantumStatsCard color={QUANTUM_COLORS.primary}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="800">
                      {totalCount}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Courses
                    </Typography>
        </Box>
                  <SchoolIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </QuantumStatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <QuantumStatsCard color={QUANTUM_COLORS.success}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="800">
                      {stats.activeCourses}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Courses
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </QuantumStatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <QuantumStatsCard color={QUANTUM_COLORS.secondary}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="800">
                      {stats.totalEnrollments}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Enrollments
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </QuantumStatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <QuantumStatsCard color={QUANTUM_COLORS.warning}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="800">
                      {stats.avgRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Average Rating
                    </Typography>
                  </Box>
                  <StarIcon sx={{ fontSize: '3rem', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </QuantumStatsCard>
          </Grid>
        </Grid>

        {/* Filters Section */}
        <QuantumGlassCard variant="primary" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <QuantumTextField
                  fullWidth
                  size="small"
        placeholder="Search courses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
                        <SearchIcon color="primary" />
            </InputAdornment>
          ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          label="Category"
                    sx={{ borderRadius: 2 }}
        >
          <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
        </Select>
      </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
        <InputLabel>Difficulty</InputLabel>
        <Select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          label="Difficulty"
                    sx={{ borderRadius: 2 }}
        >
          <MenuItem value="">All Levels</MenuItem>
                    {difficulties.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </MenuItem>
                    ))}
        </Select>
      </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Clear Filters">
      <Button
                      variant="outlined"
        onClick={clearFilters}
        sx={{ 
                        borderRadius: 2,
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      Clear
      </Button>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton
                      onClick={fetchCourses}
          sx={{ 
                        background: alpha(QUANTUM_COLORS.primary, 0.1),
                        '&:hover': {
                          background: alpha(QUANTUM_COLORS.primary, 0.2),
                        }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </QuantumGlassCard>

        {/* Courses Table */}
        <QuantumGlassCard>
          <CardContent sx={{ p: 0 }}>
            {loading && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress 
                  sx={{
                    background: alpha(QUANTUM_COLORS.primary, 0.1),
                    '& .MuiLinearProgress-bar': {
                      background: QUANTUM_COLORS.gradients.primary
                    }
                  }}
                />
              </Box>
            )}
            
          <TableContainer>
            <Table>
              <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(QUANTUM_COLORS.primary, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Difficulty</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Students</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Creator</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <CircularProgress size={40} sx={{ color: QUANTUM_COLORS.primary }} />
                          <Typography variant="body2" color="textSecondary">
                        Loading courses...
                      </Typography>
                        </Box>
                    </TableCell>
                  </TableRow>
                  ) : courses.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <SchoolIcon sx={{ fontSize: '4rem', color: alpha(QUANTUM_COLORS.primary, 0.3) }} />
                          <Typography variant="h6" color="textSecondary">
                        No courses found
                      </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {searchQuery || categoryFilter || difficultyFilter ? 
                              'Try adjusting your filters' : 
                              'Start by creating your first course'
                            }
                          </Typography>
                        </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                    courses.map((course, index) => (
                    <TableRow 
                        key={course.CourseID || index}
                      sx={{ 
                        '&:hover': { 
                            backgroundColor: alpha(QUANTUM_COLORS.primary, 0.03),
                          },
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}
                    >
                      <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                            sx={{ 
                                background: QUANTUM_COLORS.gradients.primary,
                                width: 48,
                                height: 48,
                              }}
                            >
                              <SchoolIcon />
                            </Avatar>
                            <Box>
                          <Typography 
                                variant="subtitle1" 
                                fontWeight="600"
                                onClick={() => handleViewClick(course.CourseID)}
                            sx={{ 
                                  maxWidth: '200px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  color: QUANTUM_COLORS.primary,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    color: QUANTUM_COLORS.neon,
                                    textDecoration: 'underline',
                                    transform: 'translateX(2px)'
                                  }
                                }}
                              >
                                {course.Title}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="textSecondary"
                                sx={{ 
                                  maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                                ID: {course.CourseID}
                          </Typography>
                            </Box>
                        </Box>
                      </TableCell>
                        
                      <TableCell>
                        <Chip 
                            label={course.Category} 
                          size="small"
                          sx={{
                              backgroundColor: alpha(getCategoryColor(course.Category), 0.1),
                              color: getCategoryColor(course.Category),
                              fontWeight: 500,
                              border: `1px solid ${alpha(getCategoryColor(course.Category), 0.2)}`
                          }}
                        />
                      </TableCell>
                        
                      <TableCell>
                        <Chip 
                            label={course.Difficulty?.charAt(0).toUpperCase() + course.Difficulty?.slice(1)} 
                            size="small"
                            sx={{
                              backgroundColor: alpha(getDifficultyColor(course.Difficulty), 0.1),
                              color: getDifficultyColor(course.Difficulty),
                              fontWeight: 500,
                              border: `1px solid ${alpha(getDifficultyColor(course.Difficulty), 0.2)}`
                            }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            label={(() => {
                              // Handle different boolean representations
                              if (typeof course.IsActive === 'boolean') {
                                return course.IsActive ? 'Active' : 'Inactive';
                              }
                              // Handle 0/1 as string or number
                              const isActive = course.IsActive === 1 || course.IsActive === '1' || course.IsActive === true;
                              return isActive ? 'Active' : 'Inactive';
                            })()} 
                          size="small"
                          sx={{
                            backgroundColor: (() => {
                                // Handle different boolean representations
                                let isActive;
                                if (typeof course.IsActive === 'boolean') {
                                  isActive = course.IsActive;
                                } else {
                                  isActive = course.IsActive === 1 || course.IsActive === '1' || course.IsActive === true;
                                }
                                return isActive ? alpha(QUANTUM_COLORS.success, 0.1) : alpha(theme.palette.grey[500], 0.1);
                            })(),
                            color: (() => {
                                // Handle different boolean representations
                                let isActive;
                                if (typeof course.IsActive === 'boolean') {
                                  isActive = course.IsActive;
                                } else {
                                  isActive = course.IsActive === 1 || course.IsActive === '1' || course.IsActive === true;
                                }
                                return isActive ? QUANTUM_COLORS.success : theme.palette.grey[500];
                            })(),
                              fontWeight: 500,
                              border: (() => {
                                // Handle different boolean representations
                                let isActive;
                                if (typeof course.IsActive === 'boolean') {
                                  isActive = course.IsActive;
                                } else {
                                  isActive = course.IsActive === 1 || course.IsActive === '1' || course.IsActive === true;
                                }
                                return `1px solid ${isActive ? alpha(QUANTUM_COLORS.success, 0.2) : alpha(theme.palette.grey[500], 0.2)}`;
                              })()
                          }}
                        />
                      </TableCell>
                        
                      <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PeopleIcon sx={{ fontSize: '1.2rem', color: QUANTUM_COLORS.primary }} />
                            <Typography variant="body2" fontWeight="600">
                              {course.EnrolledUsers || 0}
                            </Typography>
                          </Box>
                      </TableCell>
                        
                      <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {course.Creator || 'Unknown'}
                        </Typography>
                      </TableCell>
                        
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                            {course.CreationDate ? new Date(course.CreationDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>
                        
                      <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="View Course">
                          <IconButton
                            size="small"
                                onClick={() => handleViewClick(course.CourseID)}
                            sx={{ 
                                  color: QUANTUM_COLORS.info,
                                  '&:hover': { 
                                    backgroundColor: alpha(QUANTUM_COLORS.info, 0.1) 
                                  }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Edit Course">
                          <IconButton 
                            size="small"
                                onClick={() => handleEditClick(course.CourseID)}
                            disabled={usingPlaceholderData}
                            sx={{ 
                                  color: QUANTUM_COLORS.primary,
                                  '&:hover': { 
                                    backgroundColor: alpha(QUANTUM_COLORS.primary, 0.1) 
                                  }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete Course">
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteClick(course)}
                            disabled={usingPlaceholderData}
                            sx={{ 
                                  color: QUANTUM_COLORS.error,
                                  '&:hover': { 
                                    backgroundColor: alpha(QUANTUM_COLORS.error, 0.1) 
                                  }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                            </Tooltip>
                          </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, page) => setCurrentPage(page)}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                    },
                    '& .Mui-selected': {
                      background: QUANTUM_COLORS.gradients.primary,
                      color: 'white',
                    }
                  }}
                />
              </Box>
            )}
          </CardContent>
        </QuantumGlassCard>
      </QuantumContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: QUANTUM_COLORS.gradients.hero,
          color: 'white',
          fontWeight: 600
        }}>
          Delete Course
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete the course{' '}
            <strong>{courseToDelete?.Title}</strong>?
            {courseToDelete?.EnrolledUsers > 0 && (
              <>
                <br/><br/>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This course has {courseToDelete.EnrolledUsers} enrolled students. 
                  It will be marked as inactive instead of being fully deleted.
                </Alert>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleteLoading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <QuantumActionButton
            onClick={handleDeleteConfirm} 
            disabled={deleteLoading}
            sx={{
              background: QUANTUM_COLORS.gradients.secondary,
              color: 'white'
            }}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
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
    </MainLayout>
  );
}
