// src/app/admin/content/community/page.jsx
"use client";
import { useState, useEffect, useMemo } from 'react';
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
  Grid,
  Divider,
  Container,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

// MUI icons
import {
  Forum as ForumIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  ThumbUp as LikeIcon,
  Today as DateIcon,
  Person as PersonIcon,
  ErrorOutline as WarningIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('en-US', options);
};

export default function CommunityManagementPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  
  const { user } = useAuth();
  const router = useRouter();

  // Update page size based on screen size
  useEffect(() => {
    setPageSize(isMobile ? 10 : 20);
  }, [isMobile]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/admin/community/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoriesData = await response.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch posts
  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: page + 1,
          pageSize,
          search: searchTerm,
          category: categoryFilter,
          status: statusFilter,
          sort: sortOrder
        });

        const response = await fetch(`/api/admin/community?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch community posts');
        }

        const data = await response.json();
        
        // Mock data for development (remove in production)
        const mockData = {
          posts: [
            {
              PostID: 1,
              Title: "Introduction to Blockchain Technology",
              Content: "Blockchain is a decentralized, distributed ledger technology that records transactions across many computers...",
              CreationDate: "2023-09-15T10:30:00",
              Category: "Blockchain",
              PointsCost: 0,
              Likes: 24,
              Views: 178,
              UserID: 101,
              Username: "blockchain_expert",
              ProfileImage: "https://randomuser.me/api/portraits/men/1.jpg",
              CommentCount: 12,
              IsActive: true
            },
            {
              PostID: 2,
              Title: "Machine Learning vs Deep Learning: Key Differences",
              Content: "While both are subsets of artificial intelligence, machine learning and deep learning differ in several ways...",
              CreationDate: "2023-09-14T14:45:00",
              Category: "Artificial Intelligence",
              PointsCost: 5,
              Likes: 37,
              Views: 245,
              UserID: 102,
              Username: "ai_researcher",
              ProfileImage: "https://randomuser.me/api/portraits/women/2.jpg",
              CommentCount: 18,
              IsActive: true
            },
            {
              PostID: 3,
              Title: "5 Essential Cybersecurity Practices for Developers",
              Content: "Secure coding is crucial in today's digital landscape. Here are five essential practices every developer should know...",
              CreationDate: "2023-09-13T09:15:00",
              Category: "Cybersecurity",
              PointsCost: 10,
              Likes: 42,
              Views: 312,
              UserID: 103,
              Username: "security_guru",
              ProfileImage: "https://randomuser.me/api/portraits/men/3.jpg",
              CommentCount: 23,
              IsActive: false
            },
            {
              PostID: 4,
              Title: "Web3 Development: Tools and Frameworks",
              Content: "The Web3 ecosystem offers various tools and frameworks for decentralized application development...",
              CreationDate: "2023-09-12T16:20:00",
              Category: "Web3",
              PointsCost: 0,
              Likes: 18,
              Views: 156,
              UserID: 104,
              Username: "web3_builder",
              ProfileImage: "https://randomuser.me/api/portraits/women/4.jpg",
              CommentCount: 9,
              IsActive: true
            },
            {
              PostID: 5,
              Title: "Understanding Smart Contracts: Use Cases and Limitations",
              Content: "Smart contracts are self-executing contracts with terms directly written into code...",
              CreationDate: "2023-09-11T11:10:00",
              Category: "Blockchain",
              PointsCost: 15,
              Likes: 29,
              Views: 201,
              UserID: 105,
              Username: "crypto_dev",
              ProfileImage: "https://randomuser.me/api/portraits/men/5.jpg",
              CommentCount: 14,
              IsActive: true
            }
          ],
          total: 45,
          page: 1,
          page_size: 20,
          total_pages: 3
        };
        
        setPosts(data.posts || mockData.posts);
        setTotalCount(data.total || mockData.total);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message);
        
        // Fallback to mock data for development
        setPosts([
          {
            PostID: 1,
            Title: "Introduction to Blockchain Technology",
            Content: "Blockchain is a decentralized, distributed ledger technology that records transactions across many computers...",
            CreationDate: "2023-09-15T10:30:00",
            Category: "Blockchain",
            PointsCost: 0,
            Likes: 24,
            Views: 178,
            UserID: 101,
            Username: "blockchain_expert",
            ProfileImage: "https://randomuser.me/api/portraits/men/1.jpg",
            CommentCount: 12,
            IsActive: true
          },
          {
            PostID: 2,
            Title: "Machine Learning vs Deep Learning: Key Differences",
            Content: "While both are subsets of artificial intelligence, machine learning and deep learning differ in several ways...",
            CreationDate: "2023-09-14T14:45:00",
            Category: "Artificial Intelligence",
            PointsCost: 5,
            Likes: 37,
            Views: 245,
            UserID: 102,
            Username: "ai_researcher",
            ProfileImage: "https://randomuser.me/api/portraits/women/2.jpg",
            CommentCount: 18,
            IsActive: true
          }
        ]);
        setTotalCount(45);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchPosts();
    }
  }, [user, router, page, pageSize, searchTerm, categoryFilter, statusFilter, sortOrder]);

  const handleViewPost = (id) => {
    router.push(`/admin/content/community/${id}`);
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: id,
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post status');
      }

      // Update post in list
      setPosts(posts.map(post => 
        post.PostID === id 
          ? { ...post, IsActive: !isActive } 
          : post
      ));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const openDeleteDialog = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/community?postId=${postToDelete.PostID}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove post from list
      setPosts(posts.filter(post => post.PostID !== postToDelete.PostID));
      
      // Update total count
      setTotalCount(prev => Math.max(0, prev - 1));
      
      // Close dialog
      closeDeleteDialog();
    } catch (err) {
      alert(`Error: ${err.message}`);
      closeDeleteDialog();
    }
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
    setStatusFilter('');
    setSortOrder('newest');
    setPage(0);
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {isMobile ? (
        // Mobile loading skeleton
        Array.from(new Array(3)).map((_, index) => (
          <Paper
            key={index}
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              borderLeft: '4px solid',
              borderLeftColor: alpha(theme.palette.primary.main, 0.5),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '70%' }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="50%" height={20} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={60} />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Paper>
        ))
      ) : (
        // Desktop loading skeleton
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableRow>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Box>
                          <Skeleton variant="text" width={180} height={24} />
                          <Skeleton variant="text" width={120} height={16} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={60} height={20} />
                      <Skeleton variant="text" width={40} height={20} />
                    </TableCell>
                    <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rounded" width={120} height={32} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );

  // Mobile post card component
  const MobilePostCard = ({ post }) => (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        borderLeft: '4px solid',
        borderLeftColor: post.IsActive ? theme.palette.success.main : theme.palette.error.main,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar 
            src={post.ProfileImage} 
            alt={post.Username}
            sx={{ width: 40, height: 40, mr: 1.5 }}
          />
          <Box>
            <Typography variant="body2" fontWeight="medium">{post.Username}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <DateIcon sx={{ fontSize: 12, mr: 0.5 }} />
              {formatDate(post.CreationDate)}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="subtitle1" 
          fontWeight="medium"
          sx={{ 
            mb: 1,
            cursor: 'pointer',
            '&:hover': { color: theme.palette.primary.main }
          }}
          onClick={() => handleViewPost(post.PostID)}
        >
          {post.Title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {post.Content}
        </Typography>
        
        <Grid container spacing={1}>
          <Grid item xs={7}>
            <Chip 
              label={post.Category} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ mr: 1 }}
            />
            {post.PointsCost > 0 && (
              <Chip 
                label={`${post.PointsCost} Points`} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            )}
          </Grid>
          <Grid item xs={5}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LikeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{post.Likes}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{post.CommentCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ViewIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{post.Views}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={post.IsActive ? 'Active' : 'Inactive'} 
            color={post.IsActive ? 'success' : 'error'}
            size="small"
          />
          
          <Box sx={{ display: 'flex' }}>
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleViewPost(post.PostID)}
              sx={{ mr: 1 }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
            
            <IconButton 
              size="small" 
              color={post.IsActive ? 'error' : 'success'}
              onClick={() => handleToggleActive(post.PostID, post.IsActive)}
              sx={{ mr: 1 }}
            >
              {post.IsActive ? <DeactivateIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
            </IconButton>
            
            <IconButton 
              size="small" 
              color="error"
              onClick={() => openDeleteDialog(post)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <MainLayout>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
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
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.light} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Community Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Manage forum posts, discussions, and user content
                </Typography>
              </Box>
            </Fade>
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
                  placeholder="Search posts..."
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
              
              <Grid item xs={6} sm={4} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                    disabled={categoriesLoading}
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
              
              <Grid item xs={6} sm={4} md={2}>
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
              
              <Grid item xs={6} sm={4} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="sort-order-label">Sort By</InputLabel>
                  <Select
                    labelId="sort-order-label"
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="most_liked">Most Liked</MenuItem>
                    <MenuItem value="most_viewed">Most Viewed</MenuItem>
                    <MenuItem value="most_comments">Most Comments</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={12} md={2}>
                <Button 
                  variant="outlined" 
                  color="primary"
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

          {/* Posts List */}
          {loading ? (
            renderSkeleton()
          ) : (
            <>
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
                    <Table size={isLargeScreen ? 'medium' : 'small'}>
                      <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Post</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Author</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Engagement</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {posts.length > 0 ? (
                          posts.map((post) => (
                            <TableRow 
                              key={post.PostID}
                              hover
                              sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                  <Typography 
                                    variant="body1" 
                                    fontWeight="medium"
                                    sx={{ 
                                      '&:hover': { color: theme.palette.primary.main, cursor: 'pointer' },
                                      display: '-webkit-box',
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      maxWidth: { xs: 150, sm: 250, md: 300 }
                                    }}
                                    onClick={() => handleViewPost(post.PostID)}
                                  >
                                    {post.Title}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{ 
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      maxWidth: { xs: 150, sm: 250, md: 300 }
                                    }}
                                  >
                                    {post.Content}
                                  </Typography>
                                  {post.PointsCost > 0 && (
                                    <Chip 
                                      label={`${post.PointsCost} Points`} 
                                      size="small" 
                                      color="secondary" 
                                      variant="outlined"
                                      sx={{ mt: 0.5, alignSelf: 'flex-start' }}
                                    />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={post.Category} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    src={post.ProfileImage} 
                                    alt={post.Username}
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                  />
                                  <Typography variant="body2">{post.Username}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{formatDate(post.CreationDate)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Grid container spacing={1}>
                                  <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <LikeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                      <Typography variant="body2">{post.Likes} likes</Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CommentIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                      <Typography variant="body2">{post.CommentCount} comments</Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <ViewIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                      <Typography variant="body2">{post.Views} views</Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={post.IsActive ? 'Active' : 'Inactive'} 
                                  color={post.IsActive ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex' }}>
                                  <Tooltip title="View Post">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleViewPost(post.PostID)}
                                      sx={{ mr: 1 }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title={post.IsActive ? 'Deactivate' : 'Activate'}>
                                    <IconButton 
                                      size="small"
                                      color={post.IsActive ? 'error' : 'success'}
                                      onClick={() => handleToggleActive(post.PostID, post.IsActive)}
                                      sx={{ mr: 1 }}
                                    >
                                      {post.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title="Delete Post">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => openDeleteDialog(post)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              <Typography variant="h6" color="text.secondary">
                                No posts found
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {searchTerm || categoryFilter || statusFilter 
                                  ? 'Try clearing filters or changing search criteria'
                                  : 'No community posts exist yet'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Pagination */}
                  {posts.length > 0 && (
                    <TablePagination
                      component="div"
                      count={totalCount}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={pageSize}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 20, 50]}
                      labelRowsPerPage={isTablet ? "Rows:" : "Rows per page:"}
                      sx={{
                        '.MuiTablePagination-selectLabel': {
                          display: { xs: 'none', md: 'block' }
                        },
                        '.MuiTablePagination-displayedRows': {
                          display: { xs: 'none', sm: 'block' }
                        }
                      }}
                    />
                  )}
                </Paper>
              ) : (
                /* Mobile view */
                <Box>
                  {posts.length > 0 ? (
                    <>
                      {posts.map((post) => (
                        <MobilePostCard key={post.PostID} post={post} />
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
                        labelRowsPerPage="Rows:"
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
                      <ForumIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No posts found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchTerm || categoryFilter || statusFilter 
                          ? 'Try clearing filters or changing search criteria'
                          : 'No community posts exist yet'}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the post "{postToDelete?.Title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeletePost} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}