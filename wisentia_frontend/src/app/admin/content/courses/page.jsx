// src/app/admin/content/courses/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// MUI components
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  Stack,
  Grid
} from '@mui/material';

// MUI icons
import {
  School as CourseIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';

export default function CoursesManagementPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [courses, setCourses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: page + 1,
          pageSize,
          search: searchTerm,
          category: categoryFilter,
          difficulty: difficultyFilter,
          status: statusFilter
        });

        const response = await fetch(`/api/admin/courses?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.courses || []);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchCourses();
    }
  }, [user, router, page, pageSize, searchTerm, categoryFilter, difficultyFilter, statusFilter]);

  const handleCreateCourse = () => {
    router.push('/admin/course/create');
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      // Update course in list
      setCourses(courses.map(course => 
        course.CourseID === id 
          ? { ...course, IsActive: !isActive } 
          : course
      ));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleViewCourse = (id) => {
    router.push(`/courses/${id}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setDifficultyFilter('');
    setStatusFilter('');
    setPage(0);
  };

  // Render loading state
  if (loading && courses.length === 0) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            width: '100%',
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading courses...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  // Render mobile table row component
  const MobileTableRow = ({ course }) => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        borderLeft: course.IsActive ? '4px solid #4caf50' : '4px solid #f44336',
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={course.ThumbnailURL} 
              variant="rounded"
              alt={course.Title}
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 2,
                bgcolor: course.ThumbnailURL ? undefined : theme.palette.primary.main
              }}
            >
              {!course.ThumbnailURL && course.Title ? course.Title[0] : 'C'}
            </Avatar>
            <Typography 
              variant="subtitle1" 
              fontWeight="medium"
              sx={{ '&:hover': { color: theme.palette.primary.main }, cursor: 'pointer' }}
              onClick={() => handleViewCourse(course.CourseID)}
            >
              {course.Title}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Category</Typography>
          <Typography variant="body2">{course.Category}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Difficulty</Typography>
          <Box>
            <Chip 
              label={course.Difficulty} 
              size="small"
              color={
                course.Difficulty === 'Beginner' ? 'success' :
                course.Difficulty === 'Intermediate' ? 'warning' :
                'error'
              }
              variant="outlined"
            />
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Created</Typography>
          <Typography variant="body2">
            {new Date(course.CreationDate).toLocaleDateString()}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Enrolled</Typography>
          <Box>
            <Chip 
              label={course.EnrolledUsers || 0} 
              variant="outlined" 
              size="small"
              color="primary"
            />
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
        <Tooltip title="View Details">
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => handleViewCourse(course.CourseID)}
            sx={{ mr: 1 }}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={course.IsActive ? "Deactivate" : "Activate"}>
          <IconButton 
            size="small"
            color={course.IsActive ? "error" : "success"}
            onClick={() => handleToggleActive(course.CourseID, course.IsActive)}
          >
            {course.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );

  return (
    <MainLayout>
      <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Page Header */}
          <Box sx={{ 
            mb: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}>
            <Fade in={true} timeout={800}>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1"
                  fontWeight="700"
                  sx={{ 
                    fontSize: { xs: '1.7rem', sm: '2rem', md: '2.125rem' },
                    mb: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Course Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage educational courses, videos, and related content
                </Typography>
              </Box>
            </Fade>
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateCourse}
                sx={{ 
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.2 },
                  borderRadius: 2,
                  boxShadow: 3,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Create Course
              </Button>
            </Zoom>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              variant="filled"
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => {
                    setError(null);
                    setPage(0);
                    setLoading(true);
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Retry
                </Button>
              }
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, md: 2 }, 
              mb: 3, 
              borderRadius: 2
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search courses..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Blockchain">Blockchain</MenuItem>
                    <MenuItem value="Programming">Programming</MenuItem>
                    <MenuItem value="Artificial Intelligence">Artificial Intelligence</MenuItem>
                    <MenuItem value="Cybersecurity">Cybersecurity</MenuItem>
                    <MenuItem value="Data Science">Data Science</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="difficulty-filter-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-filter-label"
                    id="difficulty-filter"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    label="Difficulty"
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<FilterIcon />}
                  onClick={handleClearFilters}
                  size="medium"
                  fullWidth
                  sx={{ height: '100%', maxHeight: 40 }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Courses Table for Desktop / Mobile View for small screens */}
          {!isMobile ? (
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              <TableContainer 
                sx={{ 
                  width: '100%', 
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.3),
                    }
                  }
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Difficulty</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Enrolled</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <TableRow 
                          key={course.CourseID}
                          hover
                          sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                src={course.ThumbnailURL} 
                                variant="rounded"
                                alt={course.Title}
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  mr: 2,
                                  bgcolor: course.ThumbnailURL ? undefined : theme.palette.primary.main
                                }}
                              >
                                {!course.ThumbnailURL && course.Title ? course.Title[0] : 'C'}
                              </Avatar>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ '&:hover': { color: theme.palette.primary.main }, cursor: 'pointer' }}
                                onClick={() => handleViewCourse(course.CourseID)}
                              >
                                {course.Title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{course.Category}</TableCell>
                          <TableCell>
                            <Chip 
                              label={course.Difficulty} 
                              size="small"
                              color={
                                course.Difficulty === 'Beginner' ? 'success' :
                                course.Difficulty === 'Intermediate' ? 'warning' :
                                'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(course.CreationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={course.IsActive ? 'Active' : 'Inactive'} 
                              color={course.IsActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={course.EnrolledUsers || 0} 
                              variant="outlined" 
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewCourse(course.CourseID)}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={course.IsActive ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small"
                                color={course.IsActive ? "error" : "success"}
                                onClick={() => handleToggleActive(course.CourseID, course.IsActive)}
                              >
                                {course.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary">
                            No courses found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {searchTerm || categoryFilter || difficultyFilter || statusFilter 
                              ? 'Try clearing filters or creating a new course'
                              : 'Start by creating a new course'}
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateCourse}
                            sx={{ mt: 2 }}
                          >
                            Create Course
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              {courses.length > 0 && (
                <TablePagination
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                />
              )}
            </Paper>
          ) : (
            /* Mobile view */
            <Box>
              {courses.length > 0 ? (
                <>
                  {courses.map((course) => (
                    <MobileTableRow key={course.CourseID} course={course} />
                  ))}
                  
                  {/* Pagination for mobile */}
                  <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={pageSize}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 20]}
                    sx={{ 
                      mt: 2,
                      '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        display: { xs: 'none', sm: 'block' }
                      }
                    }}
                  />
                </>
              ) : (
                <Paper
                  elevation={2}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No courses found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    {searchTerm || categoryFilter || difficultyFilter || statusFilter 
                      ? 'Try clearing filters or creating a new course'
                      : 'Start by creating a new course'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCourse}
                    fullWidth
                  >
                    Create Course
                  </Button>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
}