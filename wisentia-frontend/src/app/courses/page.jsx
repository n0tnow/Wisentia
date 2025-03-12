'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Pagination,
  alpha,
  useTheme,
  Rating,
  Avatar,
  Skeleton,
  Alert
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  ArrowForward as ArrowIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Course Card Component
const CourseCard = ({ course }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const getDifficultyColor = (level) => {
    const colors = {
      1: theme.palette.success.main, // Easy
      2: theme.palette.info.main,    // Beginner
      3: theme.palette.warning.main, // Intermediate
      4: theme.palette.error.light,  // Advanced
      5: theme.palette.error.main,   // Expert
    };
    
    return colors[level] || theme.palette.primary.main;
  };
  
  const getDifficultyLabel = (level) => {
    const labels = {
      1: 'Easy',
      2: 'Beginner',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    
    return labels[level] || 'Unknown';
  };
  
  const getEducationLevel = (level) => {
    const labels = {
      1: 'Primary',
      2: 'Secondary',
      3: 'High School',
      4: 'University',
      5: 'Professional'
    };
    
    return labels[level] || 'All Levels';
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
        boxShadow: isHovered 
          ? `0 15px 30px ${alpha(theme.palette.primary.main, 0.15)}`
          : '0 5px 15px rgba(0,0,0,0.08)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Course Image/Background */}
        <CardMedia
          component="div"
          sx={{
            pt: '56.25%',
            position: 'relative',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
          }}
        />
        
        {/* Overlayed Category */}
        <Chip 
          label={course.CategoryName || "Uncategorized"}
          sx={{ 
            position: 'absolute', 
            top: 12, 
            left: 12,
            bgcolor: 'white',
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
          size="small"
        />
        
        {/* Difficulty Level */}
        <Chip 
          label={getDifficultyLabel(course.DifficultyLevel)}
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            bgcolor: alpha(getDifficultyColor(course.DifficultyLevel), 0.9),
            color: 'white',
            fontWeight: 'medium'
          }}
          size="small"
        />
        
        {/* Course Title */}
        <Box sx={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
          color: 'white'
        }}>
          <Typography variant="h6" component="h3" fontWeight="bold" noWrap>
            {course.Title || "Untitled Course"}
          </Typography>
        </Box>
        
        <IconButton
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            bgcolor: 'white',
            opacity: isHovered ? 1 : 0,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            '&:hover': {
              bgcolor: 'white',
              transform: 'translate(-50%, -50%) scale(1.1)',
            },
            ...(isHovered && {
              transform: 'translate(-50%, -50%) scale(1)',
            })
          }}
        >
          <PlayIcon sx={{ color: theme.palette.primary.main }} />
        </IconButton>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {course.DurationMinutes || 0} mins
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <SchoolIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {getEducationLevel(course.EducationLevel)}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ height: 60, overflow: 'hidden', mb: 2 }}>
          {course.Description || 'Learn new skills and advance your career with this comprehensive course.'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating 
              value={4.5} 
              precision={0.5} 
              size="small" 
              readOnly 
              sx={{ mr: 1, color: theme.palette.warning.main }}
            />
            <Typography variant="body2" fontWeight="medium">(24)</Typography>
          </Box>
          
          <Chip 
            label={course.IsPremium ? 'Premium' : 'Free'} 
            size="small"
            sx={{ 
              bgcolor: course.IsPremium ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.success.main, 0.1),
              color: course.IsPremium ? theme.palette.warning.dark : theme.palette.success.dark,
              fontWeight: 'bold'
            }}
          />
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2 }}>
        <Button 
          component={Link} 
          href={`/courses/${course.CourseID}`}
          endIcon={<ArrowIcon />}
          fullWidth
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            }
          }}
        >
          View Course
        </Button>
      </CardActions>
    </Card>
  );
};

// Skeleton loading card
const CourseCardSkeleton = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={200} animation="wave" />
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" width={80} animation="wave" />
          <Skeleton variant="text" width={100} sx={{ ml: 2 }} animation="wave" />
        </Box>
        
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} animation="wave" />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width={100} animation="wave" />
          <Skeleton variant="rectangular" width={70} height={24} animation="wave" />
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={40} width="100%" animation="wave" />
      </CardActions>
    </Card>
  );
};

// Main Courses Page Component
export default function CoursesPage() {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    education_level: '',
    difficulty_level: '',
    is_premium: ''
  });
  
  const coursesPerPage = 9;
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/courses/categories/', false);
        setCategories(response || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fall back to default categories if API fails
        setCategories([
          { CategoryID: 1, Name: 'Computer Science' },
          { CategoryID: 2, Name: 'Mathematics' },
          { CategoryID: 3, Name: 'Physics' },
          { CategoryID: 4, Name: 'Languages' },
          { CategoryID: 5, Name: 'Business' }
        ]);
      }
    };

    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching courses...');
        
        // First try to get from API
        try {
          const response = await api.get('/courses/', false);
          console.log('API Response:', response);
          
          if (response && Array.isArray(response)) {
            setCourses(response);
            setFilteredCourses(response);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          // Continue to fallback
        }
        
        // Fallback to sample data
        console.log('Using sample data as fallback');
        const sampleCourses = [
          { 
            CourseID: 1, 
            Title: 'Introduction to Programming', 
            Description: 'Learn the basics of programming with this beginner-friendly course.', 
            CategoryID: 1, 
            CategoryName: 'Computer Science',
            EducationLevel: 2,
            DifficultyLevel: 1,
            DurationMinutes: 180,
            Points: 100,
            Price: 0,
            IsPremium: false
          },
          { 
            CourseID: 2, 
            Title: 'Advanced Mathematics', 
            Description: 'Dive into complex mathematical concepts and theorems.', 
            CategoryID: 2, 
            CategoryName: 'Mathematics',
            EducationLevel: 4,
            DifficultyLevel: 4,
            DurationMinutes: 240,
            Points: 150,
            Price: 29.99,
            IsPremium: true
          },
          { 
            CourseID: 3, 
            Title: 'Quantum Physics Fundamentals', 
            Description: 'Explore the fascinating world of quantum mechanics and particle physics.', 
            CategoryID: 3, 
            CategoryName: 'Physics',
            EducationLevel: 5,
            DifficultyLevel: 5,
            DurationMinutes: 300,
            Points: 200,
            Price: 49.99,
            IsPremium: true
          },
          { 
            CourseID: 4, 
            Title: 'Web Development Basics', 
            Description: 'Learn HTML, CSS, and JavaScript to build your first website.', 
            CategoryID: 1, 
            CategoryName: 'Computer Science',
            EducationLevel: 3,
            DifficultyLevel: 2,
            DurationMinutes: 210,
            Points: 120,
            Price: 0,
            IsPremium: false
          },
          { 
            CourseID: 5, 
            Title: 'Business Administration', 
            Description: 'Master the fundamentals of business management and administration.', 
            CategoryID: 5, 
            CategoryName: 'Business',
            EducationLevel: 4,
            DifficultyLevel: 3,
            DurationMinutes: 270,
            Points: 180,
            Price: 39.99,
            IsPremium: true
          },
          { 
            CourseID: 6, 
            Title: 'Introduction to Spanish', 
            Description: 'Learn the basics of Spanish language and culture for beginners.', 
            CategoryID: 4, 
            CategoryName: 'Languages',
            EducationLevel: 2,
            DifficultyLevel: 1,
            DurationMinutes: 150,
            Points: 90,
            Price: 0,
            IsPremium: false
          }
        ];
        
        setCourses(sampleCourses);
        setFilteredCourses(sampleCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...courses];
    
    if (searchTerm) {
      result = result.filter(course => 
        course.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.Description && course.Description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filters.category) {
      result = result.filter(course => course.CategoryID === parseInt(filters.category));
    }
    
    if (filters.education_level) {
      result = result.filter(course => course.EducationLevel === parseInt(filters.education_level));
    }
    
    if (filters.difficulty_level) {
      result = result.filter(course => course.DifficultyLevel === parseInt(filters.difficulty_level));
    }
    
    if (filters.is_premium !== '') {
      const isPremium = filters.is_premium === 'premium';
      result = result.filter(course => course.IsPremium === isPremium);
    }
    
    setFilteredCourses(result);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, courses]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const paginatedCourses = filteredCourses.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );
  
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  
  const educationLevels = [
    { id: 1, name: 'Primary' },
    { id: 2, name: 'Secondary' },
    { id: 3, name: 'High School' },
    { id: 4, name: 'University' },
    { id: 5, name: 'Professional' }
  ];
  
  const difficultyLevels = [
    { id: 1, name: 'Easy' },
    { id: 2, name: 'Beginner' },
    { id: 3, name: 'Intermediate' },
    { id: 4, name: 'Advanced' },
    { id: 5, name: 'Expert' }
  ];

  return (
    <Box 
      sx={{ 
        py: 6,
        minHeight: 'calc(100vh - 64px)',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.default, 1)} 400px)`
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Explore Courses
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Discover our comprehensive library of courses designed to help you master new skills and advance your career.
          </Typography>
        </Box>
        
        {/* Search and Filters */}
        <Box 
          sx={{ 
            mb: 5, 
            p: 3, 
            borderRadius: 4, 
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      value={filters.category}
                      name="category"
                      label="Category"
                      onChange={handleFilterChange}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category.CategoryID} value={category.CategoryID}>
                          {category.Name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="difficulty-label">Difficulty</InputLabel>
                    <Select
                      labelId="difficulty-label"
                      value={filters.difficulty_level}
                      name="difficulty_level"
                      label="Difficulty"
                      onChange={handleFilterChange}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Levels</MenuItem>
                      {difficultyLevels.map(level => (
                        <MenuItem key={level.id} value={level.id}>
                          {level.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        
        {/* Results Count & Further Filters */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle1">
            Showing <strong>{filteredCourses.length}</strong> courses
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="premium-label">Type</InputLabel>
              <Select
                labelId="premium-label"
                value={filters.is_premium}
                name="is_premium"
                label="Type"
                onChange={handleFilterChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="education-label">Education</InputLabel>
              <Select
                labelId="education-label"
                value={filters.education_level}
                name="education_level"
                label="Education"
                onChange={handleFilterChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Levels</MenuItem>
                {educationLevels.map(level => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Courses Grid */}
        {loading ? (
          <Grid container spacing={4}>
            {[...Array(6)].map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <CourseCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredCourses.length === 0 ? (
          <Box sx={{ 
            py: 8, 
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <ErrorIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No courses found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filters to find what you're looking for.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  category: '',
                  education_level: '',
                  difficulty_level: '',
                  is_premium: ''
                });
              }}
              sx={{ borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={4}>
              {paginatedCourses.map((course) => (
                <Grid item key={course.CourseID} xs={12} sm={6} md={4}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary"
                  size="large"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
        
        {/* Newsletter Section */}
        <Box 
          sx={{ 
            mt: 10, 
            p: 4, 
            borderRadius: 4, 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Stay Updated
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            Subscribe to our newsletter to get updates on new courses, quests, and learning resources.
          </Typography>
          <Box sx={{ display: 'flex', maxWidth: 500, mx: 'auto' }}>
            <TextField 
              fullWidth 
              placeholder="Your email address" 
              sx={{ 
                mr: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button 
              variant="contained" 
              sx={{ 
                borderRadius: 2, 
                px: 3,
                boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}