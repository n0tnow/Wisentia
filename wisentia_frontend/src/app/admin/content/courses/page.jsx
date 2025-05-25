// src/app/admin/content/courses/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Box, Typography, Button, TextField, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, InputAdornment, Divider, Grid, MenuItem, Select,
  FormControl, InputLabel, alpha, useTheme, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Snackbar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SchoolIcon from '@mui/icons-material/School';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_COURSES } from '@/app/api/admin/courses/mock-data';

// No need for duplicated placeholder data since we're importing MOCK_COURSES
export default function CourseManagementPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [usingPlaceholderData, setUsingPlaceholderData] = useState(false);
  
  // State for edit and delete operations
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    // Kursları getir
    fetchCourses();
  }, [user, router]);

  // Process courses to handle both camelCase and PascalCase property names (backend inconsistency)
  const processCourses = (coursesData) => {
    if (!Array.isArray(coursesData)) return [];
    
    return coursesData.map(course => ({
      id: course.id || course.CourseID || course.courseID,
      title: course.title || course.Title,
      description: course.description || course.Description,
      category: course.category || course.Category,
      difficulty: course.difficulty || course.Difficulty,
      isActive: typeof course.isActive !== 'undefined' ? course.isActive : course.IsActive,
      thumbnailUrl: course.thumbnailUrl || course.ThumbnailURL,
      creationDate: course.creationDate || course.CreationDate,
      enrolledUsers: course.enrolledUsers || course.EnrolledUsers || 0,
      creator: course.creator || course.Creator
    }));
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setUsingPlaceholderData(false);
      
      // Try to fetch courses from the backend with explicit cache control
      const response = await fetch('/api/admin/courses', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch courses from backend: ${response.status} ${response.statusText}`);
        
        // Use mock data for demo/development purposes when backend is down
        console.info('Using mock courses data');
        setCourses(MOCK_COURSES);
        setUsingPlaceholderData(true);
        
        // Show a warning about using placeholder data
        setSnackbar({
          open: true,
          message: 'Using placeholder data due to backend connection issues.',
          severity: 'warning'
        });
        
        return;
      }
      
      const data = await response.json();
      const processedCourses = processCourses(data.courses || []);
      setCourses(processedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      
      // Always display something rather than empty state when there's an error
      setCourses(MOCK_COURSES);
      setUsingPlaceholderData(true);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Backend connection failed: ${error.message}. Using placeholder data.`,
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setDifficultyFilter('');
  };

  // Filtreleme
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || course.category === categoryFilter;
    const matchesDifficulty = !difficultyFilter || course.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // New function to handle course deletion dialog
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  // Function to handle actual course deletion
  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      // Don't attempt deletion if using placeholder data
      if (usingPlaceholderData) {
        setSnackbar({
          open: true,
          message: 'Cannot delete courses while backend is unavailable.',
          severity: 'error'
        });
        return;
      }
      
      const response = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Remove course from state
        setCourses(courses.filter(course => course.id !== courseToDelete.id));
        setSnackbar({
          open: true,
          message: data.action === 'deleted' 
            ? 'Course successfully deleted' 
            : 'Course was deactivated because it has enrolled users',
          severity: 'success'
        });
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

  // Function to handle edit course click
  const handleEditClick = (courseId) => {
    if (usingPlaceholderData) {
      setSnackbar({
        open: true,
        message: 'Cannot edit courses while backend is unavailable.',
        severity: 'warning'
      });
      return;
    }
    router.push(`/admin/content/courses/edit/${courseId}`);
  };

  // Function to close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 6, mb: 6, px: { xs: 2, sm: 3 , md:4 } }}>
        {/* Başlık */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              color="primary" 
              fontWeight="700"
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
              Course Management
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
              Manage educational courses, videos, and related content
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              if (usingPlaceholderData) {
                setSnackbar({
                  open: true,
                  message: 'Cannot create courses while backend is unavailable.',
                  severity: 'warning'
                });
                return;
              }
              router.push('/admin/content/courses/create');
            }}
            sx={{ 
              borderRadius: '30px',
              px: 3,
              py: 1.2,
              fontWeight: 500,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              backgroundColor: '#4e54c8',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                backgroundColor: '#3f45b6',
              }
            }}
          >
            Create Course
          </Button>
        </Box>

        {/* Show warning banner when using placeholder data */}
        {usingPlaceholderData && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchCourses}>
                Retry
              </Button>
            }
          >
            Using sample data - the backend server is currently unavailable. Some actions will be disabled.
          </Alert>
        )}

        {/* Filtreleme Bölümü - Düzeltilmiş */}
  <Paper 
    elevation={3} 
    sx={{ 
      mb: 4, 
      borderRadius: '12px',
      overflow: 'hidden',
      width: '100%',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#f9f9f9', 0.8),
    }}
  >
    <Box sx={{ 
      p: 2.5,
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: 'center',
      gap: 2,
      width: '100%'
    }}>
      {/* Arama kutusu */}
      <TextField
        placeholder="Search courses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          sx: { 
            borderRadius: '8px',
            height: '40px'
          }
        }}
        sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 40%' },
        }}
      />

      {/* Kategori Filtresi */}
      <FormControl 
        variant="outlined" 
        size="small" 
        sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 25%' },
        }}
      >
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          label="Category"
          sx={{ borderRadius: '8px', height: '40px' }}
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="Programming">Programming</MenuItem>
          <MenuItem value="Design">Design</MenuItem>
          <MenuItem value="Marketing">Marketing</MenuItem>
          <MenuItem value="Business">Business</MenuItem>
        </Select>
      </FormControl>

      {/* Zorluk Filtresi */}
      <FormControl 
        variant="outlined" 
        size="small" 
        sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 20%' },
        }}
      >
        <InputLabel>Difficulty</InputLabel>
        <Select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          label="Difficulty"
          sx={{ borderRadius: '8px', height: '40px' }}
        >
          <MenuItem value="">All Levels</MenuItem>
          <MenuItem value="beginner">Beginner</MenuItem>
          <MenuItem value="intermediate">Intermediate</MenuItem>
          <MenuItem value="advanced">Advanced</MenuItem>
        </Select>
      </FormControl>
      
      {/* Clear Filters butonu */}
      <Button
        variant="contained"
        color="error"
        onClick={clearFilters}
        startIcon={<RestartAltIcon />}
        sx={{ 
          borderRadius: '8px',
          height: '40px',
          whiteSpace: 'nowrap',
          backgroundColor: alpha(theme.palette.error.main, 0.9),
          ml: { xs: 0, md: 'auto' }, // Masaüstünde sağa yasla
          flex: { xs: '1 1 100%', md: '0 0 auto' },
          fontWeight: 500
        }}
      >
        CLEAR FILTERS
      </Button>
    </Box>
  </Paper>

        {/* Kurslar Tablosu */}
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Course table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Creation Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        Loading courses...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        No courses found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow 
                      key={course.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.light, 0.1),
                          cursor: 'pointer' 
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon 
                            sx={{ 
                              mr: 2, 
                              color: theme.palette.primary.main,
                              fontSize: '1.75rem'
                            }} 
                          />
                          <Typography 
                            variant="body1" 
                            fontWeight="500"
                            sx={{ 
                              maxWidth: '250px', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {course.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={course.category} 
                          size="small"
                          sx={{
                            backgroundColor: (() => {
                              switch(course.category) {
                                case 'Programming': return alpha('#3f51b5', 0.1);
                                case 'Design': return alpha('#9c27b0', 0.1);
                                case 'Marketing': return alpha('#f44336', 0.1);
                                case 'Business': return alpha('#2196f3', 0.1);
                                default: return alpha(theme.palette.primary.main, 0.1);
                              }
                            })(),
                            color: (() => {
                              switch(course.category) {
                                case 'Programming': return '#3f51b5';
                                case 'Design': return '#9c27b0';
                                case 'Marketing': return '#f44336';
                                case 'Business': return '#2196f3';
                                default: return theme.palette.primary.main;
                              }
                            })(),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)} 
                          size="small"
                          sx={{
                            backgroundColor: (() => {
                              switch(course.difficulty) {
                                case 'beginner': return alpha('#4caf50', 0.1);
                                case 'intermediate': return alpha('#ff9800', 0.1);
                                case 'advanced': return alpha('#f44336', 0.1);
                                default: return alpha(theme.palette.primary.main, 0.1);
                              }
                            })(),
                            color: (() => {
                              switch(course.difficulty) {
                                case 'beginner': return '#4caf50';
                                case 'intermediate': return '#ff9800';
                                case 'advanced': return '#f44336';
                                default: return theme.palette.primary.main;
                              }
                            })(),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={course.isActive ? 'Active' : 'Inactive'} 
                          size="small"
                          sx={{
                            backgroundColor: course.isActive ? alpha('#4caf50', 0.1) : alpha('#9e9e9e', 0.1),
                            color: course.isActive ? '#4caf50' : '#9e9e9e',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {course.enrolledUsers}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(course.creationDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="view course"
                            onClick={() => router.push(`/courses/${course.id}`)}
                            sx={{ 
                              padding: '4px',
                              transition: 'all 0.2s ease',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleEditClick(course.id)}
                            disabled={usingPlaceholderData}
                            sx={{ 
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              transition: 'all 0.2s ease',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleDeleteClick(course)}
                            disabled={usingPlaceholderData}
                            sx={{ 
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              transition: 'all 0.2s ease',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete course?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the course <strong>{courseToDelete?.title}</strong>?
            {courseToDelete?.enrolledUsers > 0 && (
              <>
                <br/><br/>
                <span style={{ color: theme.palette.warning.main }}>
                  This course has {courseToDelete.enrolledUsers} enrolled students. 
                  It will be marked as inactive instead of being fully deleted.
                </span>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            color="primary"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
            disabled={deleteLoading || usingPlaceholderData}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
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
    </MainLayout>
  );
}