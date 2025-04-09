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
  Zoom
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
  const categories = [
    'General Discussion',
    'Q&A',
    'Blockchain',
    'Smart Contracts',
    'NFTs',
    'Web3',
    'Tutorials',
    'Projects'
  ];
  
  // Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  
  const sortOptions = [
    { label: 'Newest', value: 'newest', icon: <NewReleasesIcon /> },
    { label: 'Popular', value: 'popular', icon: <WhatshotIcon /> },
    { label: 'Trending', value: 'trending', icon: <TrendingUpIcon /> }
  ];
  
  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // In a real application, fetch from API:
        // const response = await fetch(`/api/community/posts/?page=${page}&category=${category}&search=${searchQuery}`);
        // const data = await response.json();
        
        // Mock data for now
        const mockPosts = [
          {
            postId: 1,
            title: 'How to get started with blockchain development?',
            content: 'I\'m new to blockchain development and looking for resources to get started. What are some good tutorials or courses for beginners?',
            creationDate: '2023-08-20T10:30:00Z',
            category: 'Blockchain',
            likes: 15,
            views: 120,
            commentCount: 8,
            user: {
              userId: 2,
              username: 'blockchain_enthusiast',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 1250,
              isVerified: true
            },
            isLiked: true,
            tags: ['blockchain', 'beginner', 'tutorials']
          },
          {
            postId: 2,
            title: 'Understanding Gas Fees in Ethereum',
            content: 'Can someone explain how gas fees work in Ethereum? I\'m confused about why they vary so much and how to optimize my transactions.',
            creationDate: '2023-08-18T14:15:00Z',
            category: 'Ethereum',
            likes: 23,
            views: 200,
            commentCount: 12,
            user: {
              userId: 3,
              username: 'eth_developer',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 3420,
              isVerified: true
            },
            isLiked: false,
            tags: ['ethereum', 'gas', 'fees', 'optimization']
          },
          {
            postId: 3,
            title: 'Share your NFT project ideas!',
            content: 'I\'m curious what kind of NFT projects everyone is working on. Share your ideas and let\'s discuss!',
            creationDate: '2023-08-15T09:45:00Z',
            category: 'NFTs',
            likes: 8,
            views: 95,
            commentCount: 5,
            user: {
              userId: 1,
              username: 'nft_creator',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 750,
              isVerified: false
            },
            isLiked: false,
            tags: ['nft', 'ideas', 'projects', 'discussion']
          },
          {
            postId: 4,
            title: 'Best practices for securing smart contracts',
            content: 'After studying some recent hacks, I wanted to share some best practices for securing your smart contracts...',
            creationDate: '2023-08-12T16:20:00Z',
            category: 'Smart Contracts',
            likes: 41,
            views: 310,
            commentCount: 16,
            user: {
              userId: 5,
              username: 'security_expert',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 5280,
              isVerified: true
            },
            isLiked: true,
            tags: ['security', 'smart contracts', 'best practices', 'hacks']
          },
          {
            postId: 5,
            title: 'Web3 Authentication Methods Comparison',
            content: 'I\'ve been researching different authentication methods for Web3 applications. Here\'s a comparison of the most popular ones...',
            creationDate: '2023-08-10T11:30:00Z',
            category: 'Web3',
            likes: 28,
            views: 245,
            commentCount: 9,
            user: {
              userId: 6,
              username: 'web3_dev',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 2180,
              isVerified: false
            },
            isLiked: false,
            tags: ['web3', 'authentication', 'security', 'comparison']
          }
        ];
        
        // Filter based on search and category
        let filteredPosts = [...mockPosts];
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(query) || 
            post.content.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        if (category) {
          filteredPosts = filteredPosts.filter(post => post.category === category);
        }
        
        // Sort based on selected tab
        if (sortTab === 0) { // Newest
          filteredPosts.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
        } else if (sortTab === 1) { // Popular
          filteredPosts.sort((a, b) => b.likes - a.likes);
        } else if (sortTab === 2) { // Trending
          filteredPosts.sort((a, b) => b.views - a.views);
        }
        
        setTimeout(() => {
          setPosts(filteredPosts);
          setTotalPages(Math.ceil(filteredPosts.length / 10) || 1);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setError('Failed to load community posts. Please try again.');
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [page, searchQuery, category, sortTab]);
  
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
    if (!newPostData.title || !newPostData.content || !newPostData.category) {
      setPostError('Please fill in all required fields.');
      return;
    }
    
    setPostSubmitting(true);
    setPostError('');
    
    try {
      // In a real app, call API to create post
      // const response = await fetch('/api/community/posts/create/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newPostData),
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new post to the list
      const newPost = {
        postId: Date.now(),
        title: newPostData.title,
        content: newPostData.content,
        creationDate: new Date().toISOString(),
        category: newPostData.category,
        likes: 0,
        views: 0,
        commentCount: 0,
        user: {
          userId: user?.id || 1,
          username: user?.username || 'current_user',
          profileImage: user?.profileImage || '/avatar-placeholder.jpg',
          reputation: user?.reputation || 100,
          isVerified: false
        },
        isLiked: false,
        tags: newPostData.category.toLowerCase().split(' ')
      };
      
      setPosts([newPost, ...posts]);
      setNewPostOpen(false);
      setNewPostData({
        title: '',
        content: '',
        category: '',
        pointsCost: 0
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      setPostError('Failed to create post. Please try again.');
    } finally {
      setPostSubmitting(false);
    }
  };
  
  const handlePostClick = (postId) => {
    router.push(`/community/${postId}`);
  };
  
  const handleLikePost = async (postId, event) => {
    event.stopPropagation();
    
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    try {
      // In a real app, call API to like/unlike post
      // const response = await fetch(`/api/community/posts/${postId}/like/`, {
      //   method: 'POST',
      // });
      // const data = await response.json();
      
      // Update post like status in the UI
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.postId === postId) {
            const newIsLiked = !post.isLiked;
            return {
              ...post,
              isLiked: newIsLiked,
              likes: newIsLiked ? post.likes + 1 : post.likes - 1
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Failed to like post:', error);
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
    <>
      <StarBackground />
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
              p: 3,
              background: theme => `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)}, 
                ${alpha(theme.palette.secondary.main, isDark ? 0.2 : 0.05)})`,
              boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: theme => `radial-gradient(circle at 20% 30%, 
                  ${alpha(theme.palette.primary.main, 0.15)} 0%, 
                  transparent 50%)`,
                zIndex: 0,
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                  <Box 
                    component="span" 
                    sx={{ 
                      background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800
                    }}
                  >
                    Community Hub
                  </Box>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
                  Join discussions, ask questions, and share your blockchain knowledge with the Wisentia community.
                </Typography>
              </Box>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleCreatePost}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: theme => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.6s ease',
                      },
                      '&:hover::after': {
                        transform: 'translateX(100%)',
                      }
                    }}
                  >
                    Create Post
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
          
          {/* Search and filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 4, 
                borderRadius: 2,
                background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
                backdropFilter: 'blur(10px)',
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    placeholder="Search posts, tags, or topics..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        background: theme => alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(5px)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme => theme.palette.primary.main,
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="category-label">Filter by Category</InputLabel>
                    <Select
                      labelId="category-label"
                      value={category}
                      label="Filter by Category"
                      onChange={handleCategoryChange}
                      sx={{
                        borderRadius: 2,
                        background: theme => alpha(theme.palette.background.paper, 0.6),
                        backdropFilter: 'blur(5px)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme => theme.palette.primary.main,
                        }
                      }}
                      startAdornment={
                        <InputAdornment position="start">
                          <LocalOfferIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      background: theme => alpha(theme.palette.background.paper, 0.6),
                      backdropFilter: 'blur(5px)',
                      border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Tabs 
                      value={sortTab} 
                      onChange={handleSortChange}
                      variant="fullWidth"
                      sx={{ 
                        width: '100%',
                        minHeight: '56px',
                        '& .MuiTabs-indicator': {
                          height: 3,
                          borderRadius: '3px 3px 0 0',
                          background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }
                      }}
                    >
                      {sortOptions.map((option, index) => (
                        <Tab 
                          key={option.value} 
                          icon={option.icon} 
                          label={option.label} 
                          iconPosition="start" 
                          sx={{ 
                            minHeight: '56px',
                            textTransform: 'none',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Tabs>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
          
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          
          {/* Posts list */}
          {loading ? (
            <Box>
              {[1, 2, 3].map((item) => (
                <Card 
                  key={item} 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
                    backdropFilter: 'blur(10px)',
                    boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ ml: 1 }}>
                        <Skeleton variant="text" width={120} height={24} />
                        <Skeleton variant="text" width={80} height={18} />
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="80%" height={30} />
                    <Skeleton variant="text" width="90%" height={60} />
                    <Box sx={{ mt: 2 }}>
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1, display: 'inline-block', mr: 1 }} />
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1, display: 'inline-block', mr: 1 }} />
                      <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1, display: 'inline-block' }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : posts.length > 0 ? (
            <Box>
              {posts.map((post, index) => (
                <motion.div
                  key={post.postId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card 
                    sx={{ 
                      mb: 3, 
                      cursor: 'pointer',
                      borderRadius: 2,
                      background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
                      backdropFilter: 'blur(10px)',
                      border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px) scale(1.01)',
                        boxShadow: theme => `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                        borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                      }
                    }}
                    onClick={() => handlePostClick(post.postId)}
                  >
                    <CardContent>
                      {/* Post Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={post.user.profileImage} 
                            alt={post.user.username}
                            sx={{
                              width: 48,
                              height: 48,
                              border: theme => post.user.isVerified 
                                ? `2px solid ${theme.palette.primary.main}`
                                : `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                              boxShadow: theme => post.user.isVerified 
                                ? `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`
                                : 'none',
                            }}
                          />
                          <Box sx={{ ml: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {post.user.username}
                              </Typography>
                              {post.user.isVerified && (
                                <Tooltip title="Verified Member" arrow>
                                  <VerifiedIcon 
                                    sx={{ 
                                      ml: 0.5, 
                                      fontSize: 16, 
                                      color: 'primary.main',
                                    }} 
                                  />
                                </Tooltip>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(post.creationDate)}
                              </Typography>
                              <Tooltip title="User Reputation" arrow>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    ml: 1.5,
                                    background: theme => `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                                    padding: '2px 8px',
                                    borderRadius: 10,
                                  }}
                                >
                                  <StarIcon sx={{ fontSize: 14, color: 'primary.main', mr: 0.5 }} />
                                  <Typography variant="caption" fontWeight="bold" color="primary">
                                    {post.user.reputation}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(post, e)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                            }
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      {/* Post Content */}
                      <Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 700,
                          mb: 1.5,
                          color: theme => isDark ? theme.palette.primary.light : theme.palette.primary.dark
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 2,
                          lineHeight: 1.6
                        }}
                      >
                        {post.content}
                      </Typography>
                      
                      {/* Tags */}
                      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {post.tags && post.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              background: theme => alpha(theme.palette.primary.main, 0.1),
                              color: theme => isDark ? theme.palette.primary.light : theme.palette.primary.dark,
                              fontWeight: 500,
                              borderRadius: 1,
                              '&:hover': {
                                background: theme => alpha(theme.palette.primary.main, 0.2),
                              }
                            }}
                          />
                        ))}
                      </Box>
                      
                      {/* Post Footer */}
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={post.category}
                          size="small"
                          sx={{
                            background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                            color: theme => isDark ? '#fff' : theme.palette.primary.dark,
                            fontWeight: 600,
                            '& .MuiChip-label': { px: 1.5 },
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: theme => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
                            }
                          }}
                        />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: post.isLiked ? 'primary.main' : 'text.secondary',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main'
                                }
                              }}
                              onClick={(e) => handleLikePost(post.postId, e)}
                            >
                              {post.isLiked ? 
                                <ThumbUpIcon fontSize="small" /> : 
                                <ThumbUpOutlinedIcon fontSize="small" />
                              }
                              <Typography variant="body2" fontWeight="medium" sx={{ ml: 0.75 }}>
                                {post.likes}
                              </Typography>
                            </Box>
                          </motion.div>
                          
                          <motion.div whileHover={{ y: -2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: 'text.secondary',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                              }
                            }}>
                              <CommentIcon fontSize="small" />
                              <Typography variant="body2" fontWeight="medium" sx={{ ml: 0.75 }}>
                                {post.commentCount}
                              </Typography>
                            </Box>
                          </motion.div>
                          
                          <motion.div whileHover={{ y: -2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: 'text.secondary',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                              }
                            }}>
                              <VisibilityIcon fontSize="small" />
                              <Typography variant="body2" fontWeight="medium" sx={{ ml: 0.75 }}>
                                {post.views}
                              </Typography>
                            </Box>
                          </motion.div>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mt: 4, 
                    mb: 2,
                    py: 2,
                    borderRadius: 2,
                  }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: 16,
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                        },
                        '& .MuiPaginationItem-page.Mui-selected': {
                          background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          color: '#fff',
                          fontWeight: 700,
                          boxShadow: theme => `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
                      }}
                    />
                  </Box>
                </motion.div>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <Typography variant="h5" paragraph fontWeight="bold">
                No posts found matching your search.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                Try adjusting your search criteria or create a new post to start a discussion.
              </Typography>
              <Button 
                variant="outlined"
                size="large"
                onClick={() => {
                  setSearchQuery('');
                  setCategory('');
                  setSortTab(0);
                }}
                sx={{ 
                  mr: 2,
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                Clear Filters
              </Button>
              
              <Button 
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreatePost}
                sx={{ 
                  borderRadius: 2,
                  background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  px: 3,
                  py: 1
                }}
              >
                Create Post
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Post menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 180,
              overflow: 'visible',
              background: theme => alpha(theme.palette.background.paper, isDark ? 0.9 : 1),
              backdropFilter: 'blur(10px)',
              border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: theme => `0 5px 20px ${alpha(theme.palette.common.black, 0.1)}`,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderBottom: 'none',
                borderRight: 'none',
              }
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
              <i className="material-icons" style={{ fontSize: 18 }}>share</i>
            </Box>
            Share
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
              <i className="material-icons" style={{ fontSize: 18 }}>flag</i>
            </Box>
            Report
          </MenuItem>
          {selectedPost && selectedPost.user.userId === (user?.id || 0) && (
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                <i className="material-icons" style={{ fontSize: 18 }}>edit</i>
              </Box>
              Edit
            </MenuItem>
          )}
        </Menu>
        
        {/* New Post Dialog */}
        <Dialog 
          open={newPostOpen} 
          onClose={handleCloseNewPost}
          fullWidth
          maxWidth="md"
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: theme => alpha(theme.palette.background.paper, isDark ? 0.95 : 1),
              backdropFilter: 'blur(10px)',
              boxShadow: theme => `0 10px 40px ${alpha(theme.palette.common.black, 0.2)}`,
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              <Box 
                component="span" 
                sx={{ 
                  background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Create New Post
              </Box>
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            {postError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {postError}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newPostData.title}
              onChange={handleNewPostChange}
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}
            />
            
            <TextField
              margin="dense"
              name="content"
              label="Content"
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              value={newPostData.content}
              onChange={handleNewPostChange}
              required
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}
            />
            
            <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                name="category"
                value={newPostData.category}
                label="Category"
                onChange={handleNewPostChange}
                required
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="points-cost-label">Points Cost (Optional)</InputLabel>
              <Select
                labelId="points-cost-label"
                name="pointsCost"
                value={newPostData.pointsCost}
                label="Points Cost (Optional)"
                onChange={handleNewPostChange}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <MenuItem value={0}>0 - Free</MenuItem>
                <MenuItem value={5}>5 Points</MenuItem>
                <MenuItem value={10}>10 Points</MenuItem>
                <MenuItem value={25}>25 Points</MenuItem>
                <MenuItem value={50}>50 Points</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Points allow you to highlight your post and increase its visibility in the community.
              You currently have {user?.points || 0} points available.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleCloseNewPost}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitPost} 
              variant="contained"
              disabled={postSubmitting}
              sx={{ 
                borderRadius: 2,
                px: 3,
                py: 1,
                ml: 2,
                fontWeight: 'bold',
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: theme => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  boxShadow: theme => `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                }
              }}
            >
              {postSubmitting ? <CircularProgress size={24} /> : 'Publish Post'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}