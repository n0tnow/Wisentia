'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Pagination,
  CircularProgress,
  Skeleton,
  Alert,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  Zoom,
  FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

// Star background efekti
const StarBackground = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Rastgele yıldızlar oluştur
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    animationDuration: `${Math.random() * 5 + 5}s`,
    animationDelay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.5 + 0.1
  }));

  if (!isDark) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {stars.map(star => (
        <Box
          key={star.id}
          sx={{
            position: 'absolute',
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, star.opacity),
            boxShadow: `0 0 ${star.size * 2}px ${alpha(theme.palette.primary.main, star.opacity)}`,
            left: star.left,
            top: star.top,
            animation: `twinkle ${star.animationDuration} ${star.animationDelay} infinite ease-in-out`,
            '@keyframes twinkle': {
              '0%, 100%': { opacity: 0.1, transform: 'scale(0.7)' },
              '50%': { opacity: 0.9, transform: 'scale(1.3)' }
            }
          }}
        />
      ))}
    </Box>
  );
};

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtreler
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortTab, setSortTab] = useState(0);
  
  // Yeni gönderi dialogu
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    category: '',
    pointsCost: 0
  });
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  
  // Kategoriler
  const [categories, setCategories] = useState([
    'General Discussion',
    'Q&A',
    'Blockchain',
    'Smart Contracts',
    'NFTs',
    'Web3',
    'Tutorials',
    'Projects'
  ]);
  
  // Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  
  const sortOptions = [
    { label: 'Newest', value: 'newest', icon: <NewReleasesIcon /> },
    { label: 'Popular', value: 'popular', icon: <WhatshotIcon /> },
    { label: 'Trending', value: 'trending', icon: <TrendingUpIcon /> }
  ];
  
  // Fetch posts from API - replaced mock data with real API calls
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Build the API URL with query parameters
        let apiUrl = `/api/community/posts?page=${page}`;
        if (category) apiUrl += `&category=${encodeURIComponent(category)}`;
        if (searchQuery) apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
        
        // Map sort tab to sort parameter
        const sortMapping = ['newest', 'popular', 'trending'];
        apiUrl += `&sort=${sortMapping[sortTab]}`;
        
        console.log('Fetching posts from:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch posts');
        }
        
        console.log('Received posts data:', data);
        
        // Update state with the real data
        setPosts(data.posts || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message || 'Failed to load posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [page, category, searchQuery, sortTab]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/community/categories');
        const data = await response.json();
        
        if (response.ok && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fall back to default categories if API fails
      }
    };
    
    fetchCategories();
  }, []);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };
  
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };
  
  const handleSortChange = (event, newValue) => {
    setSortTab(newValue);
  };
  
  const handleCreatePost = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    setNewPostOpen(true);
  };
  
  const handleCloseNewPost = () => {
    setNewPostOpen(false);
    setPostError('');
  };
  
  const handleNewPostChange = (event) => {
    const { name, value } = event.target;
    setNewPostData({
      ...newPostData,
      [name]: value
    });
  };
  
  const handleSubmitPost = async () => {
    setPostSubmitting(true);
    setPostError('');
    
    try {
      if (!newPostData.title.trim() || !newPostData.content.trim() || !newPostData.category) {
        setPostError('Please fill in all required fields');
        return;
      }
      
      console.log('Submitting post:', {
        title: newPostData.title.trim(),
        category: newPostData.category
      });
      
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newPostData.title.trim(),
          content: newPostData.content.trim(),
          category: newPostData.category,
          pointsCost: newPostData.pointsCost || 0
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Post creation failed:', data);
        throw new Error(data.error || 'Failed to create post');
      }
      
      console.log('Post created successfully:', data);
      
      // Success - close dialog and refresh posts
      setNewPostOpen(false);
      setNewPostData({
        title: '',
        content: '',
        category: '',
        pointsCost: 0
      });
      
      // Refresh posts with the latest data
      setPage(1);
      setLoading(true);
      
      const refreshResponse = await fetch(`/api/community/posts?page=1&sort=${sortOptions[sortTab].value}`);
      const refreshData = await refreshResponse.json();
      
      if (refreshResponse.ok) {
        setPosts(refreshData.posts || []);
        setTotalPages(refreshData.total_pages || 1);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setPostError(err.message || 'Failed to create post');
    } finally {
      setPostSubmitting(false);
    }
  };
  
  const handlePostClick = (postId) => {
    router.push(`/community/${postId}`);
  };
  
  const handleLikePost = async (postId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    try {
      // Optimistic update
      const updatedPosts = posts.map(post => {
        if (post.PostID === postId) {
          const isCurrentlyLiked = post.isLiked;
          return {
            ...post,
            Likes: isCurrentlyLiked ? post.Likes - 1 : post.Likes + 1,
            isLiked: !isCurrentlyLiked
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Send API request
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // If request fails, revert the optimistic update
        setPosts(posts);
        const data = await response.json();
        console.error('Like failed:', data.error);
      }
    } catch (err) {
      // If request fails, revert the optimistic update
      setPosts(posts);
      console.error('Error liking post:', err);
    }
  };
  
  const handleMenuOpen = (post, event) => {
    event.stopPropagation();
    setSelectedPost(post);
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{
        minHeight: '100vh',
        py: 4,
        position: 'relative'
      }}>
        <StarBackground />
        
        <Container maxWidth="lg">
          {/* Header and search section */}
          <Box mb={4}>
            <Typography variant="h3" component="h1" gutterBottom sx={{
              fontWeight: 'bold',
              background: isDark ? 'linear-gradient(45deg, #5C6BC0, #7986CB)' : 'inherit',
              backgroundClip: isDark ? 'text' : 'inherit',
              WebkitBackgroundClip: isDark ? 'text' : 'inherit',
              WebkitTextFillColor: isDark ? 'transparent' : 'inherit',
              textShadow: isDark ? '0 0 20px rgba(121, 134, 203, 0.4)' : 'none',
            }}>
              Community
            </Typography>
            
            <Typography variant="subtitle1" color="textSecondary" paragraph>
              Join discussions, ask questions, and connect with other members of the Wisentia community.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search discussions..."
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={category}
                  onChange={handleCategoryChange}
                  label="Category"
                  startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreatePost}
                disabled={!isAuthenticated}
              >
                New Post
              </Button>
            </Box>
          </Box>
          
          {/* Sorting tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={sortTab} 
              onChange={handleSortChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {sortOptions.map((option, index) => (
                <Tab 
                  key={option.value}
                  icon={option.icon} 
                  label={option.label} 
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Loading state */}
          {loading ? (
            <Box sx={{ mb: 4 }}>
              {[1, 2, 3].map((n) => (
                <Card key={n} sx={{ mb: 3, overflow: 'hidden' }}>
                  <CardContent>
                    <Skeleton variant="text" width="70%" height={40} />
                    <Skeleton variant="text" width="40%" />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </Box>
                    <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
                      <Skeleton variant="rectangular" width={60} height={24} />
                      <Skeleton variant="rectangular" width={60} height={24} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <>
              {/* No posts message */}
              {posts.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No posts found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Be the first to start a discussion!
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreatePost}
                    sx={{ mt: 2 }}
                    disabled={!isAuthenticated}
                  >
                    Create Post
                  </Button>
                </Box>
              )}
              
              {/* Posts list */}
              <Grid container spacing={3}>
                {posts.map((post) => (
                  <Grid item xs={12} key={post.PostID}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
                        }
                      }}
                      onClick={() => handlePostClick(post.PostID)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            {post.Title}
                          </Typography>
                          
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(post, e)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            src={post.ProfileImage || '/avatar-placeholder.jpg'}
                            alt={post.Username}
                            sx={{ width: 28, height: 28, mr: 1 }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            {post.Username}
                            {post.isVerified && (
                              <VerifiedIcon
                                sx={{ ml: 0.5, width: 16, height: 16, color: 'primary.main' }}
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mx: 1 }}>
                            •
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(post.CreationDate)}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 2, 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {post.Content}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', mb: 1 }}>
                          <Chip 
                            icon={<LocalOfferIcon />} 
                            label={post.Category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                              size="small"
                              startIcon={post.isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                              onClick={(e) => handleLikePost(post.PostID, e)}
                              color={post.isLiked ? 'primary' : 'inherit'}
                            >
                              {post.Likes || 0}
                            </Button>
                            
                            <Button
                              size="small"
                              startIcon={<CommentIcon />}
                              color="inherit"
                            >
                              {post.CommentCount || 0}
                            </Button>
                            
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              color="inherit"
                            >
                              {post.Views || 0}
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              {posts.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Container>
        
        {/* New post dialog */}
        <Dialog 
          open={newPostOpen} 
          onClose={handleCloseNewPost}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Create New Post</DialogTitle>
          <DialogContent>
            {postError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {postError}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              name="title"
              value={newPostData.title}
              onChange={handleNewPostChange}
              sx={{ mb: 2 }}
              required
              disabled={postSubmitting}
              error={postError && !newPostData.title.trim()}
              helperText={postError && !newPostData.title.trim() ? "Title is required" : ""}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }} required error={postError && !newPostData.category}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={newPostData.category}
                onChange={handleNewPostChange}
                label="Category"
                disabled={postSubmitting}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
              {postError && !newPostData.category && 
                <FormHelperText error>Category is required</FormHelperText>
              }
            </FormControl>
            
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              name="content"
              value={newPostData.content}
              onChange={handleNewPostChange}
              sx={{ mb: 2 }}
              required
              disabled={postSubmitting}
              error={postError && !newPostData.content.trim()}
              helperText={postError && !newPostData.content.trim() ? "Content is required" : ""}
            />
            
            <TextField
              margin="dense"
              label="Points Cost (Optional)"
              type="number"
              fullWidth
              variant="outlined"
              name="pointsCost"
              value={newPostData.pointsCost}
              onChange={handleNewPostChange}
              InputProps={{
                inputProps: { min: 0 }
              }}
              disabled={postSubmitting}
              helperText="Spend points to give your post more visibility"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNewPost} disabled={postSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPost} 
              variant="contained" 
              color="primary"
              disabled={postSubmitting}
              startIcon={postSubmitting ? <CircularProgress size={20} /> : null}
            >
              {postSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Post menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            Share
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            Report
          </MenuItem>
        </Menu>
      </Box>
    </motion.div>
  );
}