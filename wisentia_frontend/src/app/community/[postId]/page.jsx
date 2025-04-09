'use client';

import { useState, useEffect, useRef } from 'react';
import { use } from 'react'; // React.use() için import
import {
  Container,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  TextField,
  Divider,
  List,
  ListItem,
  Paper,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
  Fade,
  Skeleton,
  Link as MuiLink
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import ReplyIcon from '@mui/icons-material/Reply';
import ShareIcon from '@mui/icons-material/Share';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Eksik import eklendi
import Link from 'next/link';
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

export default function PostDetailPage({ params }) {
  // Next.js'in yeni sürümleri için params'ı React.use() ile sarmalama
  const postIdParams = use(params);
  const postId = postIdParams.postId;

  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Yorum menüsü
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  
  // Yeni yorum
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  
  // Referans
  const commentRef = useRef(null);
  
  // Fetch post details
  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      try {
        // In a real application, fetch from API:
        // const postResponse = await fetch(`/api/community/posts/${postId}/`);
        // const postData = await postResponse.json();
        // const commentsResponse = await fetch(`/api/community/posts/${postId}/comments/`);
        // const commentsData = await commentsResponse.json();
        
        // Mock data for this example
        const mockPost = {
          postId: postId,
          title: 'How to get started with blockchain development?',
          content: `I'm new to blockchain development and looking for resources to get started. What are some good tutorials or courses for beginners?

I have experience with JavaScript and React, but I've never worked with blockchain technologies before. I'm particularly interested in Ethereum development and smart contracts.

Any recommendations for tutorials, courses, or resources would be greatly appreciated. Also, what development environments and tools do you recommend for a beginner?`,
          creationDate: '2023-08-20T10:30:00Z',
          category: 'Blockchain',
          likes: 15,
          views: 120,
          isLiked: false,
          tags: ['blockchain', 'beginner', 'smart-contracts', 'ethereum', 'development'],
          user: {
            userId: 2,
            username: 'blockchain_enthusiast',
            profileImage: '/avatar-placeholder.jpg',
            joinDate: '2023-02-15T00:00:00Z',
            reputation: 1250,
            isVerified: true
          }
        };
        
        const mockComments = [
          {
            commentId: 1,
            content: "I'd recommend starting with the Ethereum documentation and CryptoZombies tutorial. It's a great way to learn Solidity.",
            creationDate: '2023-08-20T11:15:00Z',
            likes: 5,
            isLiked: true,
            user: {
              userId: 3,
              username: 'eth_developer',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 3420,
              isVerified: true
            },
            replies: []
          },
          {
            commentId: 2,
            content: "Check out the course 'Blockchain Basics' in Wisentia. It covers all the fundamentals and has hands-on projects.",
            creationDate: '2023-08-20T12:30:00Z',
            likes: 3,
            isLiked: false,
            user: {
              userId: 5,
              username: 'tech_teacher',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 1840,
              isVerified: false
            },
            replies: [
              {
                commentId: 4,
                parentCommentId: 2,
                content: "I second this! The course has really well-structured content that takes you from the basics to actually deploying your first smart contract. The hands-on projects are what make it stand out.",
                creationDate: '2023-08-20T15:45:00Z',
                likes: 2,
                isLiked: false,
                user: {
                  userId: 8,
                  username: 'blockchain_newbie',
                  profileImage: '/avatar-placeholder.jpg',
                  reputation: 520,
                  isVerified: false
                }
              }
            ]
          },
          {
            commentId: 3,
            content: "I found Hardhat to be the most developer-friendly environment for Ethereum development. Much better than Truffle in my opinion.",
            creationDate: '2023-08-20T14:45:00Z',
            likes: 2,
            isLiked: false,
            user: {
              userId: 7,
              username: 'smart_contract_dev',
              profileImage: '/avatar-placeholder.jpg',
              reputation: 2750,
              isVerified: true
            },
            replies: []
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setPost(mockPost);
          setComments(mockComments);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch post details:', error);
        setError('Failed to load post details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPostDetails();
  }, [postId]);
  
  const handleLikePost = async () => {
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
      setPost(prevPost => ({
        ...prevPost,
        isLiked: !prevPost.isLiked,
        likes: prevPost.isLiked ? prevPost.likes - 1 : prevPost.likes + 1
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };
  
  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    try {
      // In a real app, call API to like/unlike comment
      // const response = await fetch(`/api/community/comments/${commentId}/like/`, {
      //   method: 'POST',
      // });
      // const data = await response.json();
      
      // Update comment like status in the UI (handling both top-level and reply comments)
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.commentId === commentId) {
            // This is the comment to update
            const newIsLiked = !comment.isLiked;
            return {
              ...comment,
              isLiked: newIsLiked,
              likes: newIsLiked ? comment.likes + 1 : comment.likes - 1
            };
          } else if (comment.replies?.length > 0) {
            // Check if it's a reply to this comment
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.commentId === commentId) {
                  const newIsLiked = !reply.isLiked;
                  return {
                    ...reply,
                    isLiked: newIsLiked,
                    likes: newIsLiked ? reply.likes + 1 : reply.likes - 1
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleMenuOpen = (comment, event) => {
    event.stopPropagation();
    setSelectedComment(comment);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleReplyClick = (comment) => {
    setReplyTo(comment);
    
    // Scroll to comment form
    if (commentRef.current) {
      commentRef.current.focus();
    }
  };
  
  const handleCancelReply = () => {
    setReplyTo(null);
  };
  
  const handleNewCommentChange = (event) => {
    setNewComment(event.target.value);
  };
  
  const handleSubmitComment = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    
    setCommentSubmitting(true);
    setCommentError('');
    
    try {
      // In a real app, call API to create comment
      // const response = await fetch(`/api/community/posts/${postId}/comment/`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ 
      //     content: newComment,
      //     parentCommentId: replyTo ? replyTo.commentId : null
      //   }),
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create new comment object
      const newCommentObj = {
        commentId: Date.now(),
        content: newComment,
        creationDate: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        parentCommentId: replyTo ? replyTo.commentId : null,
        user: {
          userId: user?.id || 1,
          username: user?.username || 'current_user',
          profileImage: user?.profileImage || '/avatar-placeholder.jpg',
          reputation: user?.reputation || 100,
          isVerified: false
        },
        replies: []
      };
      
      // Add as a reply or top-level comment
      if (replyTo) {
        // If it's a reply, update the comments array with the new reply
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.commentId === replyTo.commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newCommentObj]
              };
            }
            return comment;
          })
        );
      } else {
        // If it's a top-level comment, add it to the comments array
        setComments(prevComments => [...prevComments, newCommentObj]);
      }
      
      // Clear form and replyTo
      setNewComment('');
      setReplyTo(null);
      
      // Update post comment count
      setPost(prevPost => ({
        ...prevPost,
        commentCount: (prevPost.commentCount || comments.length) + 1
      }));
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setCommentError('Failed to submit comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  };
  
  const handleBookmark = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    setIsBookmarked(!isBookmarked);
    // In a real app, call API to bookmark/unbookmark post
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <Container sx={{ my: 4, pt: 8 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4,
              borderRadius: 3,
              background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
              backdropFilter: 'blur(10px)',
              border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Skeleton variant="text" width="70%" height={50} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Skeleton variant="rectangular" width={80} height={30} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={60} height={30} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="95%" height={20} />
            <Skeleton variant="text" width="85%" height={20} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
            </Box>
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 3,
              background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
              backdropFilter: 'blur(10px)',
              border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2 }} />
            </Box>
            
            <Box sx={{ my: 4 }}>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
              
              {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="100%" height={20} />
                    <Skeleton variant="text" width="95%" height={20} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Skeleton variant="text" width={40} height={20} />
                      <Skeleton variant="text" width={40} height={20} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ my: 4, pt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!post) {
    return (
      <Container sx={{ my: 4, pt: 8 }}>
        <Alert severity="warning">Post not found</Alert>
      </Container>
    );
  }
  
  return (
    <>
      <StarBackground />
      <Container maxWidth="lg" sx={{ pt: 8, pb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/community')}
            sx={{ 
              mb: 3,
              fontWeight: 500,
              borderRadius: 2,
              px: 2,
              py: 1,
              color: theme => isDark ? theme.palette.primary.light : theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            Back to Community
          </Button>
          
          {/* Post Content */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              mb: 4,
              borderRadius: 3,
              background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
              backdropFilter: 'blur(10px)',
              border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            {/* Post Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {post.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip 
                  label={post.category}
                  color="primary"
                  size="medium"
                  sx={{
                    background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: '#fff',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 2 },
                  }}
                />
                
                {post.tags && post.tags.map(tag => (
                  <Chip 
                    key={tag}
                    label={tag}
                    size="medium"
                    variant="outlined"
                    sx={{
                      background: theme => alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                      color: theme => isDark ? theme.palette.primary.light : theme.palette.primary.dark,
                      '&:hover': {
                        background: theme => alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            {/* Author Info & Post Meta */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    background: theme => alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Avatar 
                    src={post.user.profileImage} 
                    alt={post.user.username}
                    sx={{
                      width: 56,
                      height: 56,
                      border: theme => post.user.isVerified 
                        ? `2px solid ${theme.palette.primary.main}`
                        : `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                      boxShadow: theme => post.user.isVerified 
                        ? `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`
                        : 'none',
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {post.user.username}
                      </Typography>
                      {post.user.isVerified && (
                        <Tooltip title="Verified Member" arrow>
                          <VerifiedIcon 
                            sx={{ 
                              ml: 1, 
                              color: 'primary.main',
                            }} 
                          />
                        </Tooltip>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Member since {new Date(post.user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                      </Typography>
                      <Tooltip title="User Reputation" arrow>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
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
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%', 
                    justifyContent: 'center',
                    alignItems: { xs: 'flex-start', md: 'flex-end' },
                    pl: { xs: 2, md: 0 },
                    pr: { xs: 0, md: 2 },
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: { xs: 2, md: 0 } }}>
                    Posted on {formatDate(post.creationDate)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      icon={<ThumbUpOutlinedIcon fontSize="small" />}
                      label={`${post.likes} likes`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                      }}
                    />
                    <Chip 
                      icon={<VisibilityIcon fontSize="small" />}
                      label={`${post.views} views`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 4 }} />
            
            {/* Post Content */}
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                whiteSpace: 'pre-line',
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.7,
              }}
            >
              {post.content}
            </Typography>
            
            {/* Post Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    startIcon={post.isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                    variant={post.isLiked ? "contained" : "outlined"}
                    color="primary"
                    onClick={handleLikePost}
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 600,
                      px: 3,
                      background: post.isLiked ? 
                        theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` : 
                        'transparent',
                      '&:hover': {
                        background: post.isLiked ? 
                          theme => `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})` : 
                          theme => alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    {post.isLiked ? 'Liked' : 'Like'}
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    startIcon={<ShareIcon />}
                    variant="outlined"
                    color="primary"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: theme => alpha(theme.palette.primary.main, 0.3),
                      '&:hover': {
                        borderColor: 'primary.main',
                        background: theme => alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    Share
                  </Button>
                </motion.div>
              </Box>
              
              <IconButton 
                color={isBookmarked ? "primary" : "default"}
                onClick={handleBookmark}
                sx={{ 
                  borderRadius: 2,
                  p: 1.5,
                  transition: 'all 0.3s ease',
                  background: isBookmarked ? theme => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    background: theme => alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <Tooltip title={isBookmarked ? "Saved" : "Save Post"}>
                  {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </Tooltip>
              </IconButton>
            </Box>
          </Paper>
          
          {/* Comments Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4,
              borderRadius: 3,
              background: theme => alpha(theme.palette.background.paper, isDark ? 0.7 : 0.9),
              backdropFilter: 'blur(10px)',
              border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              <Box component="span" sx={{ 
                background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Comments
              </Box>
              <Box component="span" sx={{ 
                ml: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                fontSize: '0.875rem',
                fontWeight: 600,
                background: theme => alpha(theme.palette.primary.main, 0.1),
                color: theme => isDark ? theme.palette.primary.light : theme.palette.primary.dark,
              }}>
                {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)}
              </Box>
            </Typography>
            
            {/* New Comment Form */}
            <Box sx={{ mb: 4, mt: 3 }}>
              {replyTo && (
                <Box 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 2,
                    background: theme => alpha(theme.palette.primary.main, 0.05),
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">
                      Replying to <Box component="span" fontWeight="bold" color="primary.main">{replyTo.user.username}</Box>
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={handleCancelReply}
                      sx={{ 
                        minWidth: 'auto',
                        p: 0.5,
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: 'primary.main',
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    "{replyTo.content}"
                  </Typography>
                </Box>
              )}
              
              {isAuthenticated() ? (
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={replyTo ? "Type your reply..." : "Join the discussion..."}
                    value={newComment}
                    onChange={handleNewCommentChange}
                    error={!!commentError}
                    helperText={commentError}
                    inputRef={commentRef}
                    variant="outlined"
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: theme => alpha(theme.palette.background.paper, 0.6),
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
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        disabled={commentSubmitting || !newComment.trim()}
                        onClick={handleSubmitComment}
                        startIcon={replyTo ? <ReplyIcon /> : null}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          fontWeight: 'bold',
                          background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          boxShadow: theme => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                          '&:hover': {
                            boxShadow: theme => `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                          }
                        }}
                      >
                        {commentSubmitting ? <CircularProgress size={24} /> : replyTo ? 'Post Reply' : 'Post Comment'}
                      </Button>
                    </motion.div>
                  </Box>
                </Box>
              ) : (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 2,
                    background: theme => alpha(theme.palette.primary.main, 0.1),
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '& .MuiAlert-icon': {
                      color: 'primary.main',
                    }
                  }}
                >
                  <Typography variant="body2">
                    You need to {' '}
                    <MuiLink 
                      component={Link} 
                      href="/login" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      log in
                    </MuiLink>
                    {' '} to post a comment.
                  </Typography>
                </Alert>
              )}
            </Box>
            
            {/* Comments List */}
            {comments.length > 0 ? (
              <Box>
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.commentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      elevation={0} 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        background: theme => alpha(theme.palette.background.paper, isDark ? 0.4 : 0.5),
                        border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: theme => alpha(theme.palette.background.paper, isDark ? 0.5 : 0.7),
                          borderColor: theme => alpha(theme.palette.primary.main, 0.2),
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={comment.user.profileImage} 
                              alt={comment.user.username}
                              sx={{
                                width: 40,
                                height: 40,
                                border: theme => comment.user.isVerified 
                                  ? `2px solid ${theme.palette.primary.main}`
                                  : 'none',
                              }}
                            />
                            <Box sx={{ ml: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {comment.user.username}
                                </Typography>
                                {comment.user.isVerified && (
                                  <VerifiedIcon 
                                    sx={{ 
                                      ml: 0.5, 
                                      fontSize: 16, 
                                      color: 'primary.main',
                                    }} 
                                  />
                                )}
                                {comment.user.reputation > 0 && (
                                  <Box 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      ml: 1,
                                      padding: '0px 6px',
                                      borderRadius: 5,
                                      background: theme => alpha(theme.palette.primary.main, 0.1),
                                    }}
                                  >
                                    <StarIcon fontSize="inherit" sx={{ fontSize: 12, color: 'primary.main', mr: 0.5 }} />
                                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                                      {comment.user.reputation}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comment.creationDate)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <IconButton 
                            size="small"
                            onClick={(e) => handleMenuOpen(comment, e)}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                              }
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body1" sx={{ mt: 1, mb: 2, pl: 0, ml: 0 }}>
                          {comment.content}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: comment.isLiked ? 'primary.main' : 'text.secondary',
                              cursor: 'pointer',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                color: comment.isLiked ? 'primary.dark' : 'primary.main'
                              }
                            }}
                            onClick={() => handleLikeComment(comment.commentId)}
                          >
                            {comment.isLiked ? 
                              <ThumbUpIcon fontSize="small" /> : 
                              <ThumbUpOutlinedIcon fontSize="small" />
                            }
                            <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                              {comment.likes > 0 ? comment.likes : 'Like'}
                            </Typography>
                          </Box>
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 'text.secondary',
                              cursor: 'pointer',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main'
                              }
                            }}
                            onClick={() => handleReplyClick(comment)}
                          >
                            <ReplyIcon fontSize="small" />
                            <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                              Reply
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <Box sx={{ mt: 2, ml: 2, pl: 2, borderLeft: theme => `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                            {comment.replies.map((reply) => (
                              <Box 
                                key={reply.commentId} 
                                sx={{ 
                                  mt: 2, 
                                  pt: 2,
                                  borderTop: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                      src={reply.user.profileImage} 
                                      alt={reply.user.username}
                                      sx={{
                                        width: 32,
                                        height: 32,
                                      }}
                                    />
                                    <Box sx={{ ml: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                          {reply.user.username}
                                        </Typography>
                                        {reply.user.isVerified && (
                                          <VerifiedIcon 
                                            sx={{ 
                                              ml: 0.5, 
                                              fontSize: 14, 
                                              color: 'primary.main',
                                            }} 
                                          />
                                        )}
                                      </Box>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDate(reply.creationDate)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => handleMenuOpen(reply, e)}
                                    sx={{
                                      color: 'text.secondary',
                                      '&:hover': {
                                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                      }
                                    }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                
                                <Typography variant="body2" sx={{ mt: 1, mb: 1.5 }}>
                                  {reply.content}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      color: reply.isLiked ? 'primary.main' : 'text.secondary',
                                      cursor: 'pointer',
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                        color: reply.isLiked ? 'primary.dark' : 'primary.main'
                                      }
                                    }}
                                    onClick={() => handleLikeComment(reply.commentId)}
                                  >
                                    {reply.isLiked ? 
                                      <ThumbUpIcon fontSize="small" /> : 
                                      <ThumbUpOutlinedIcon fontSize="small" />
                                    }
                                    <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                                      {reply.likes > 0 ? reply.likes : 'Like'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4, 
                background: theme => alpha(theme.palette.background.paper, isDark ? 0.4 : 0.6),
                borderRadius: 2,
                border: theme => `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}>
                <Typography variant="body1" color="text.secondary">
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>
        
        {/* Comment Menu */}
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
              <ReplyIcon fontSize="small" />
            </Box>
            Reply
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
            <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
              <FlagIcon fontSize="small" />
            </Box>
            Report
          </MenuItem>
          {selectedComment && selectedComment.user.userId === (user?.id || 0) && (
            <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
              <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                <EditIcon fontSize="small" />
              </Box>
              Edit
            </MenuItem>
          )}
        </Menu>
      </Container>
    </>
  );
}